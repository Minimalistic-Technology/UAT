// TS Cache Refresh
import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const seedRoutePermissions = async () => {
  const DEFAULT_PERMISSIONS = [
    // Admin Settings & Queue
    { path: '/api/v1/admin/settings', method: 'GET', role: 'admin', description: 'Fetch system configuration settings' },
    { path: '/api/v1/admin/settings', method: 'PATCH', role: 'admin', description: 'Update system configuration settings' },
    { path: '/api/v1/admin/posts/pending', method: 'GET', role: 'admin', description: 'Retrieve pending blog posts moderation queue' },
    { path: '/api/v1/admin/posts/all', method: 'GET', role: 'admin', description: 'Retrieve all posts with filter options' },
    { path: '/api/v1/admin/posts/:postId', method: 'DELETE', role: 'admin', description: 'Force delete user blog post' },
    { path: '/api/v1/admin/posts/:postId/approve', method: 'PATCH', role: 'admin', description: 'Approve pending user blog post' },
    { path: '/api/v1/admin/posts/:postId/reject', method: 'PATCH', role: 'admin', description: 'Reject pending user blog post' },

    // Admin User CRUD Management
    { path: '/api/v1/admin/users', method: 'GET', role: 'admin', description: 'List registered user accounts' },
    { path: '/api/v1/admin/users/:userId', method: 'PUT', role: 'admin', description: 'Update user account profile information & role' },
    { path: '/api/v1/admin/users/:userId', method: 'DELETE', role: 'admin', description: 'Permanently de-register user profile' },

    // Admin Route Permissions Management
    { path: '/api/v1/admin/permissions', method: 'GET', role: 'admin', description: 'View dynamic routing permission matrix' },
    { path: '/api/v1/admin/permissions', method: 'POST', role: 'admin', description: 'Add new dynamic route permission rule' },
    { path: '/api/v1/admin/permissions/:id/toggle', method: 'PATCH', role: 'admin', description: 'Toggle user route pattern status' },
    { path: '/api/v1/admin/permissions/:id', method: 'DELETE', role: 'admin', description: 'Remove dynamic route permission rule' },

    // User Actions (Active for both Admin & User by default)
    { path: '/api/v1/posts', method: 'POST', role: 'user', description: 'Create and publish new blog posts' },
    { path: '/api/v1/posts', method: 'POST', role: 'admin', description: 'Create and publish new blog posts' },
    { path: '/api/v1/posts/:blogId', method: 'PUT', role: 'user', description: 'Edit existing own blog posts' },
    { path: '/api/v1/posts/:blogId', method: 'PUT', role: 'admin', description: 'Edit existing own blog posts' },
    { path: '/api/v1/posts/:blogId', method: 'DELETE', role: 'user', description: 'Delete own blog posts' },
    { path: '/api/v1/posts/:blogId', method: 'DELETE', role: 'admin', description: 'Delete own blog posts' },
    { path: '/api/v1/posts/:blogId/like', method: 'POST', role: 'user', description: 'Toggle like status on blog posts' },
    { path: '/api/v1/posts/:blogId/like', method: 'POST', role: 'admin', description: 'Toggle like status on blog posts' },
    { path: '/api/v1/posts/media/upload', method: 'POST', role: 'user', description: 'Upload cover images or embed media' },
    { path: '/api/v1/posts/media/upload', method: 'POST', role: 'admin', description: 'Upload cover images or embed media' },
    { path: '/api/v1/comments/post/:postId', method: 'POST', role: 'user', description: 'Write comments under blog posts' },
    { path: '/api/v1/comments/post/:postId', method: 'POST', role: 'admin', description: 'Write comments under blog posts' },
    { path: '/api/v1/comments/:id', method: 'PUT', role: 'user', description: 'Edit own published comments' },
    { path: '/api/v1/comments/:id', method: 'PUT', role: 'admin', description: 'Edit own published comments' },
    { path: '/api/v1/comments/:id', method: 'DELETE', role: 'user', description: 'Remove own published comments' },
    { path: '/api/v1/comments/:id', method: 'DELETE', role: 'admin', description: 'Remove own published comments' },
    { path: '/api/v1/comments/:id/like', method: 'POST', role: 'user', description: 'Like or unlike user comments' },
    { path: '/api/v1/comments/:id/like', method: 'POST', role: 'admin', description: 'Like or unlike user comments' },
  ];

  try {
    for (const perm of DEFAULT_PERMISSIONS) {
      await prisma.routePermission.upsert({
        where: {
          path_method_role: {
            path: perm.path,
            method: perm.method,
            role: perm.role as any,
          }
        },
        update: {
          description: perm.description,
        },
        create: {
          path: perm.path,
          method: perm.method,
          role: perm.role as any,
          isActive: true,
          description: perm.description,
        }
      });
    }
    console.log('[db] Dynamic route permissions seeded successfully');
  } catch (error) {
    console.error('[db] Seeding permissions failed:', error);
  }
};

export const connectDatabase = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await prisma.$connect();
      console.log('[db] Connected to PostgreSQL (Neon) Successfully');
      await seedRoutePermissions();
      return;
    } catch (error: any) {
      console.error(`[db] Connection attempt ${attempt}/${retries} failed:`, error.message || error);
      if (attempt < retries) {
        console.log(`[db] Retrying connection in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        console.error('[db] All database connection attempts exhausted. Keeping server alive, Prisma will lazy-reconnect on queries.');
      }
    }
  }
};



