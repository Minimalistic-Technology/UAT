import { prisma } from "../lib/prisma.js";

// Ensure returning string representations of results for the LLM

export const adminToolsService = {
    get_pending_kyc: async () => {
        try {
            const pendingCount = await prisma.kYC.count({ where: { status: "PENDING" } });
            if (pendingCount === 0) return "Success: There are no pending KYC applications. Everything is verified.";
            return `Success: There are ${pendingCount} companies pending KYC approval.`;
        } catch (e: any) {
            return `Error fetching KYC stats: ${e.message}`;
        }
    },

    get_user_stats: async () => {
        try {
            const totalUsers = await prisma.user.count();
            return `Success: The total number of registered users on the platform is ${totalUsers}.`;
        } catch (e: any) {
            return `Error fetching user stats: ${e.message}`;
        }
    },

    search_jobs: async (args: { keyword?: string; days_ago?: number }) => {
        try {
            let filter: any = { status: "ACTIVE" };

            if (args.keyword) {
                filter.OR = [
                    { title: { contains: args.keyword, mode: 'insensitive' } },
                    { skills: { hasSome: [args.keyword] } }
                ];
            }

            if (args.days_ago && args.days_ago > 0) {
                const dateLimit = new Date();
                dateLimit.setDate(dateLimit.getDate() - args.days_ago);
                filter.createdAt = { gte: dateLimit };
            }

            const jobs = await prisma.baseListing.findMany({
                where: filter,
                take: 5,
                select: { id: true, title: true }
            });

            if (!jobs || jobs.length === 0) {
                let msg = args.keyword ? `"${args.keyword}"` : "the criteria";
                return `Result: No active jobs found matching ${msg}.`;
            }

            const jobLinks = jobs.map((j: any) => `- [${j.title}](/job/${j.id})`).join("\n");
            return `Result: Found the following jobs. Present them to the user exactly as these markdown links:\n${jobLinks}`;
        } catch (e: any) {
            return `Error searching jobs: ${e.message}`;
        }
    }
};

// These are definitions that the LLM understands
export const adminToolDefinitions = [
    {
        type: "function",
        function: {
            name: "get_pending_kyc",
            description: "Get the absolute number of pending KYC applications waiting for admin approval.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            },
        },
    },
    {
        type: "function",
        function: {
            name: "get_user_stats",
            description: "Returns the total number of registered users on the job portal platform.",
            parameters: {
                type: "object",
                properties: {},
                required: []
            },
        },
    },
    {
        type: "function",
        function: {
            name: "search_jobs",
            description: "Search the database for published job postings by keywords, skills, or recently posted within X days.",
            parameters: {
                type: "object",
                properties: {
                    keyword: {
                        type: "string",
                        description: "The term, job title, or skill to look for (e.g. 'Software', 'React'). Leave empty if not specified."
                    },
                    days_ago: {
                        type: "number",
                        description: "Filter jobs posted within this many days ago (e.g. 3 for past 3 days). Leave empty if not specified."
                    }
                },
                required: []
            },
        },
    }
];
