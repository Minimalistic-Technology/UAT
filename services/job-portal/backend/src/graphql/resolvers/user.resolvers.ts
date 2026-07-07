import { prisma } from "../../lib/prisma.js";
import { GraphQLError } from "graphql";

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: context.user.id },
        include: {
          avatar: true,
          resume: { include: { atsScore: true } },
          experiences: true,
          educations: true,
          location: true,
        },
      });

      return user;
    },
    getUserById: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new GraphQLError("Not authenticated", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          avatar: true,
          resume: { include: { atsScore: true } },
          experiences: true,
          educations: true,
          location: true,
        },
      });

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return user;
    },
    getAllUsers: async (
      _: any,
      { page = 1, limit = 10 }: { page?: number; limit?: number },
      context: any
    ) => {
      if (!context.user || context.user.role !== "SUPER_ADMIN") {
        throw new GraphQLError("Not authorized", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const skip = (page - 1) * limit;

      const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          where: { role: { not: "SUPER_ADMIN" } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true,
            isVerified: true,
            createdAt: true,
            updatedAt: true,
            avatar: true,
            companyMembers: {
              include: { company: { select: { name: true } } },
            },
          },
        }),
        prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
      ]);

      const enhancedUsers = users.map((user) => {
        let isEmployee = false;
        let companyRole = null;
        let companyName = null;

        if (user.companyMembers && user.companyMembers.length > 0) {
          isEmployee = true;
          companyRole = user.companyMembers[0].role;
          companyName = user.companyMembers[0].company.name;
        }

        const { companyMembers, ...rest } = user;
        return {
          ...rest,
          createdAt: rest.createdAt.toISOString(),
          updatedAt: rest.updatedAt.toISOString(),
          isEmployee,
          companyRole,
          companyName,
          avatar: rest.avatar ? { ...rest.avatar, createdAt: rest.avatar.createdAt.toISOString(), updatedAt: rest.avatar.updatedAt.toISOString() } : null
        };
      });

      const totalPages = Math.ceil(totalUsers / limit);

      return {
        count: totalUsers,
        users: enhancedUsers,
        pagination: {
          totalPages,
          currentPage: page,
          totalItems: totalUsers,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    },
  },
};
