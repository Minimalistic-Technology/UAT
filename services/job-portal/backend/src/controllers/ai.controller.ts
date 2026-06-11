import { Request, Response, NextFunction } from "express";
import { Ollama } from "ollama";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { adminToolsService, adminToolDefinitions } from "../services/ai-tools.service.js";
import AiChatLog from "../models/AiChatLog.model.js";

const OLLAMA_HOST = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
const LLM_MODEL = process.env.LLM_MODEL || "llama3.2:1b";

const ollama = new Ollama({ host: OLLAMA_HOST });

export const chatWithAi = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            throw new ApiError(400, "Messages array is required.");
        }

        // Grab the latest user message context for logging
        const userPrompt = messages[messages.length - 1]?.content || "";

        // BULLETPROOF GUARD: 1B Models hallucinate tools on simple greetings. Strip tools if it's a greeting.
        let isToolSafe = true;
        const lowPrompt = userPrompt.trim().toLowerCase().replace(/[^a-z]/g, '');
        if (["hi", "hii", "hiii", "hello", "hey", "namaste", "kaiseho"].includes(lowPrompt) || lowPrompt.length <= 3) {
            isToolSafe = false;
        }

        const fullMessages: any[] = [
            {
                role: "system",
                content: "You are a fast, intelligent 'AI Assistant' for JobPortal. RULES: 1. You MUST reply in EXACTLY the same language the user uses (If English, reply in strict English. If Hindi, reply in Hindi). 2. If the user just says 'hi', DO NOT call tools, just greet them. 3. You are in READ-ONLY mode. 4. Call tools to search jobs, get stats, or KYC. 5. NEVER output raw JSON code. Always speak naturally.",
            },
            ...messages.map((m: any) => ({
                role: m.role,
                content: m.content || "",
            }))
        ];

        console.log(`[AI Controller] Invoking Ollama using model ${LLM_MODEL}. Tool Safe: ${isToolSafe}`);

        let response: any;
        try {
            let chatPayload: any = {
                model: LLM_MODEL,
                messages: fullMessages,
                stream: false
            };
            if (isToolSafe) {
                chatPayload.tools = adminToolDefinitions;
            }
            response = await ollama.chat(chatPayload);
        } catch (err: any) {
            console.error("[Ollama Failed]", err);
            return next(new ApiError(503, `Ollama API Error: ${err.message}. Ensure Docker container is running.`));
        }

        // Handle tool calls recursively
        let iteration = 0;
        while (response.message.tool_calls && response.message.tool_calls.length > 0 && iteration < 3) {
            console.log(`[AI Controller] Ollama triggered tools:`, JSON.stringify(response.message.tool_calls));
            fullMessages.push(response.message as any);

            for (const toolCall of response.message.tool_calls) {
                const functionName = toolCall.function.name;
                const args = toolCall.function.arguments as any;
                let toolResult = "";

                if (functionName === "get_pending_kyc") {
                    toolResult = await adminToolsService.get_pending_kyc();
                } else if (functionName === "get_user_stats") {
                    toolResult = await adminToolsService.get_user_stats();
                } else if (functionName === "search_jobs") {
                    toolResult = await adminToolsService.search_jobs(args);
                } else {
                    toolResult = `Error: Unknown tool ${functionName}`;
                }

                console.log(`[AI] Tool Output for ${functionName}:`, toolResult);
                fullMessages.push({ role: 'tool', content: toolResult } as any);
            }

            // Chat again to formulate final response based on tool results
            response = await ollama.chat({
                model: LLM_MODEL,
                messages: fullMessages,
                tools: adminToolDefinitions as any,
                stream: false
            });
            iteration++;
        }

        // FALLBACK HACK FOR LLAMA3.2 1B
        let c = response.message.content;
        let isToolHallucination = c.includes('"name"') && (c.includes('search_jobs') || c.includes('get_user_stats') || c.includes('get_pending_kyc')) && c.includes('{');

        if (isToolHallucination) {
            console.log("[AI Controller] Model hallucinated raw JSON tool in content! Using fallback parser.");
            let extractTool = "";
            let toolRes = "";

            if (c.includes('"name": "get_user_stats"') || c.includes('"name":"get_user_stats"')) {
                toolRes = await adminToolsService.get_user_stats();
                extractTool = "get_user_stats";
            } else if (c.includes('"name": "get_pending_kyc"') || c.includes('"name":"get_pending_kyc"')) {
                toolRes = await adminToolsService.get_pending_kyc();
                extractTool = "get_pending_kyc";
            } else if (c.includes('"name": "search_jobs"') || c.includes('"name":"search_jobs"')) {
                const kyMatch = c.match(/"keyword"\s*:\s*"([^"]+)"/);
                const dayMatch = c.match(/"days_ago"\s*:\s*(\d+)/);
                const query = kyMatch ? kyMatch[1] : undefined;
                const days = dayMatch ? parseInt(dayMatch[1]) : undefined;

                toolRes = await adminToolsService.search_jobs({ keyword: query, days_ago: days });
                extractTool = "search_jobs";
            }

            if (extractTool) {
                fullMessages.push(response.message as any);
                fullMessages.push({ role: 'tool', content: toolRes } as any);
                response = await ollama.chat({
                    model: LLM_MODEL,
                    messages: fullMessages,
                    stream: false
                });
            }
        }

        const finalContent = response.message.content;

        // Save conversation log to Database seamlessly
        const userObj = (req as any).user;
        if (userObj && userObj._id) {
            await AiChatLog.create({
                user: userObj._id,
                prompt: userPrompt,
                response: finalContent
            });
        }

        return res.status(200).json(
            new ApiResponse(200, {
                role: "assistant",
                content: finalContent,
            }, "AI response generated successfully.")
        );

    } catch (error: any) {
        next(error);
    }
};
