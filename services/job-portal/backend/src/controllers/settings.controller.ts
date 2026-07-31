import type { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { prisma } from "../lib/prisma.js";
import { RoleCategory } from "../../generated/prisma/enums.js";
import redisClient from "../config/redis.js";

export const getLandingPageSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const titleQuery = req.query.title as string;
        
        // Define cache key based on the titleQuery (or lack thereof)
        const cacheKey = titleQuery ? `landingSettings:${titleQuery.toLowerCase()}` : `landingSettings:default`;
        
        // Try fetching from cache
        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                return res.status(200).json(new ApiResponse(200, JSON.parse(cachedData), "Landing page settings fetched from cache successfully"));
            }
        } catch (redisError) {
            console.error("Redis Cache Error:", redisError);
            // Non-fatal error, proceed to fetch from DB
        }

        // 1. Dynamic Logo
        // Currently returning a default platform logo or you can integrate with a global settings table later
        const logo = "/logo.png"; 

        // 2. Dynamic Categories
        // Fetching top categories based on active job listings
        const categoryGroups = await prisma.baseListing.groupBy({
            by: ['roleCategory'],
            _count: {
                id: true
            },
            where: {
                status: 'ACTIVE',
                isDeleted: false
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 8
        });

        // Map enum to a readable label (e.g. SOFTWARE_DEVELOPMENT -> Software Development)
        const categories = categoryGroups.map(group => {
            const label = group.roleCategory
                .split('_')
                .map(word => word.charAt(0) + word.slice(1).toLowerCase())
                .join(' ');
                
            return {
                label,
                originalValue: group.roleCategory,
                count: group._count.id
            };
        });

        // If no categories found, provide some defaults
        if (categories.length === 0) {
            const defaults = ["Engineering", "Design", "Data & AI", "Marketing", "Sales", "Operations", "Support", "DevOps"];
            defaults.forEach(d => categories.push({ label: d, originalValue: d.toUpperCase().replace(/ /g, '_') as RoleCategory, count: 0 }));
        }

        // 3. Jobs based on title
        const jobsQuery: any = {
            status: 'ACTIVE',
            isDeleted: false
        };
        
        if (titleQuery) {
            jobsQuery.title = {
                contains: titleQuery,
                mode: 'insensitive'
            };
        }

        const jobs = await prisma.baseListing.findMany({
            where: jobsQuery,
            include: {
                company: {
                    select: {
                        name: true,
                        logo: true
                    }
                },
                jobDetails: true,
                internshipDetails: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        });

        const responseData = { logo, categories, jobs };

        // Save to cache before sending response (expire in 1 hour)
        try {
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
        } catch (redisError) {
            console.error("Redis Cache Save Error:", redisError);
        }

        res.status(200).json(new ApiResponse(200, responseData, "Landing page settings fetched successfully"));
    } catch (error: any) {
        next(new ApiError(500, "Failed to fetch settings: " + error.message));
    }
};
