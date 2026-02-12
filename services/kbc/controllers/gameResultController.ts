import { Request, Response } from "express";
import mongoose, { SortOrder } from "mongoose";
import GameResult from "../models/GameResult";
import GameConfig from "../models/gameConfig";
import Question from "../models/Question";


export const createGameResult = async (req: Request, res: Response) : Promise<void> => {
  try {
    const user = (req as any).user;
    const userId = user?._id;
    const userName = user?.userName;


    if (!userId)  res.status(401).json({ message: "Unauthorized" });


    const {
      gameConfigId,
      correctAnswered,
      isWinner,
      totalTimeSeconds,
      usedLifelinesArr,
      lifelinesUsed,
      prizeLadder = [],
      questions = [],
    } = req.body;

    if (!userId)  res.status(400).json({ message: "Invalid or missing userId" });
    if (!gameConfigId)  res.status(400).json({ message: "Invalid or missing gameConfigId" });
    if (typeof isWinner !== "boolean")  res.status(400).json({ message: "Invalid isWinner" });
    if (typeof totalTimeSeconds !== "number" || totalTimeSeconds < 0)
       res.status(400).json({ message: "Invalid totalTimeSeconds" });
    if (typeof correctAnswered !== "number" || correctAnswered < 0)
       res.status(400).json({ message: "Invalid correctAnswered" });
    if (!Array.isArray(questions) || questions.length === 0)
       res.status(400).json({ message: "questions array is required" });


    const existing = await GameResult.findOne({ userId, gameConfigId }).lean();
    if (existing) {
       res.status(409).json({
        message: "Game result already exists for this user and gameConfig",
        result: existing,
      });
    }

    // Normalize lifelines
    const lifelinesUsedFinal: string[] = Array.isArray(lifelinesUsed)
      ? lifelinesUsed
      : Array.isArray(usedLifelinesArr)
        ? usedLifelinesArr
        : [];


    // --- helpers ---
    const toStringArray = (arr: any): string[] => {
      if (!Array.isArray(arr)) return [];
      // Accept either ["A","B"] or [{text:"A"},{text:"B"}]
      return arr.map((v) => (typeof v === "string" ? v : (v?.text ?? String(v ?? ""))));
    };

    const normalizeLangPack = (pack: any) => {
      if (!pack || typeof pack !== "object") return undefined;
      return {
        text: typeof pack.text === "string" ? pack.text : "",
        options: toStringArray(pack.options),
        categories: Array.isArray(pack.categories) ? pack.categories : [],
      };
    };

    const pickId = (q: any) =>
      q?.id ??
      q?._id ??
      (q?._id?.$oid ?? q?._id?.toString?.()) ??
      (typeof q?._id === "string" ? q._id : undefined);

    const pickBankId = (q: any) =>
      q?.bankId ??
      q?.bankID ??
      (q?.bankId?.$oid ?? q?.bankId?.toString?.()) ??
      (typeof q?.bankId === "string" ? q.bankId : undefined);

    // --- NEW multilingual safeQuestions ---
    const safeQuestions = questions.map((q: any) => {
      const hasLangObject = q?.lang && typeof q.lang === "object";

      // Build lang map for all provided languages (en/hi/gu/…)
      const langObj: Record<string, { text: string; options: string[]; categories: string[] }> = {};
      if (hasLangObject) {
        for (const [k, v] of Object.entries(q.lang)) {
          const normalized = normalizeLangPack(v);
          if (normalized) langObj[k] = normalized;
        }
      } else {
        // Backward-compat: old shape -> synthesize 'en'
        langObj["en"] = {
          text: q.question ?? q.text ?? "",
          options: toStringArray(q.options),
          categories: Array.isArray(q.categories) ? q.categories : [],
        };
      }

      const correctIndex: number =
        Number.isInteger(q?.correctIndex) && q.correctIndex >= 0 ? q.correctIndex : 0;

      const media =
        q?.media ??
        (q?.mediaRef
          ? { url: q.mediaRef.url, type: q.mediaRef.type, public_id: q.mediaRef.public_id }
          : null);

      return {
        id: String(pickId(q) ?? ""),
        bankId: String(pickBankId(q) ?? ""),
        lang: langObj,        // <-- full multilingual content
        correctIndex,         // <-- single truth for the correct option
        status: q?.status ?? undefined,
        media: media ?? null, // <-- { url, type, public_id? } or null
      };
    });

    const totalQuestions = safeQuestions.length;
    const finalScore =
      totalQuestions > 0
        ? Math.max(0, Math.min(100, Math.round((correctAnswered / totalQuestions) * 100)))
        : 0;

    const doc = await GameResult.create({
      userId,
      userName,
      gameConfigId,
      finalScore,
      correctAnswered,
      isWinner,
      totalTimeSeconds,
      lifelinesUsed: lifelinesUsedFinal,
      prizeLadder,
      questions: safeQuestions,
    });

     res.status(201).json({ message: "Game result saved", result: doc });
  } catch (err: any) {
    console.error("[createGameResult] Error:", err);
     res
      .status(500)
      .json({ message: "Failed to save game result", error: err?.message });
  }
};

export const getScoresForGameConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeConfig = await GameConfig.findOne({ isActive: true });
    if (!activeConfig) {
      res.status(404).json({ message: "No active game configuration found" });
      return;
    }
    const gameConfigId = activeConfig._id
    const { sort = "score", page = "1", limit = "50" } = req.query as {
      sort?: "score" | "recent" | string;
      page?: string;
      limit?: string;
    };

    if (!gameConfigId || !mongoose.Types.ObjectId.isValid(gameConfigId)) {
       res.status(400).json({ message: "Invalid or missing gameConfigId" });
    }

    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);

    let sortStage: Record<string, SortOrder>;

    if (sort === "recent") {
      sortStage = { createdAt: -1 as SortOrder };
    } else {
      sortStage = { finalScore: -1 as SortOrder, createdAt: -1 as SortOrder };
    }

    const filter = { gameConfigId: new mongoose.Types.ObjectId(gameConfigId) };

    const [results, total] = await Promise.all([
      GameResult.find(filter)
        .select({
          gameConfigId: 1,
          userId: 1,
          userName: 1,
          finalScore: 1,
          isWinner: 1,
          totalTimeSeconds: 1,
          correctAnswered: 1,
          createdAt: 1,
          questions: 1,
        })
        .sort(sortStage)
        .skip((p - 1) * l)
        .limit(l)
        .lean(),
      GameResult.countDocuments(filter),
    ]);

     res.status(200).json({
      results,
      total,
      page: p,
      limit: l,
      pages: Math.ceil(total / l),
      sort: sort === "recent" ? "recent" : "score",
    });
  } catch (err: any) {
    console.error("[getScoresForGameConfig] Error:", err);
     res.status(500).json({
      message: "Failed to fetch scores",
      error: err?.message,
    });
  }
};

export const userGameResult = async (
  req: Request,
  res: Response
) : Promise<void> => {
  try {
    const userId =
      (req as any).user?._id ||
      req.body?.userId ||
      req.query?.userId ||
      null;

    if (!userId) {
       res.status(401).json({ message: "Unauthorized: user not found" });
    }

    if (!userId) {
       res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const { gameConfigId } = req.body as { gameConfigId?: string };

    if (!gameConfigId) {
       res.status(400).json({ message: "gameConfigId is required" });
       return
    }

    if (!mongoose.Types.ObjectId.isValid(gameConfigId)) {
       res.status(400).json({ message: "Invalid gameConfigId" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
       res.status(400).json({ message: "Invalid user id" });
    }

    // Filter by gameConfigId + current user
    const filter = {
      gameConfigId: new mongoose.Types.ObjectId(gameConfigId),
      userId: new mongoose.Types.ObjectId(userId),
    };

    // Fetch single result (latest one if somehow multiple exist)
    const result = await GameResult.findOne(filter)
      .select({
        gameConfigId: 1,
        userId: 1,
        userName: 1,
        finalScore: 1,
        isWinner: 1,
        totalTimeSeconds: 1,
        correctAnswered: 1,
        createdAt: 1,
        questions: 1,
        prizeLadder: 1,
      })
      .sort({ createdAt: -1 }) // optional, ensures newest if duplicates
      .lean();

    if (!result) {
       res.status(404).json({
        message: "No game result found for this user and game configuration",
      });
    }

     res.status(200).json({
      result,
    });
  } catch (err: any) {
    console.error("[userGameResult] Error:", err);
     res.status(500).json({
      message: "Failed to fetch score for current user",
      error: err?.message,
    });
  }
};