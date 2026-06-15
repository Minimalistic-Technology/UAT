import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Default Site Settings
  await prisma.siteSetting.upsert({
    where: { key: 'global' },
    update: {},
    create: {
      key: 'global',
      autoApprovePost: true,
      resourceHubEnabled: true,
    },
  });

  const permissions = [
    {
        "path": "/api/v1/admin/settings",
        "method": "GET",
        "role": "admin",
        "description": "Fetch system configuration settings"
    },
    {
        "path": "/api/v1/admin/settings",
        "method": "PATCH",
        "role": "admin",
        "description": "Update system configuration settings"
    },
    {
        "path": "/api/v1/admin/posts/pending",
        "method": "GET",
        "role": "admin",
        "description": "Retrieve pending blog posts moderation queue"
    },
    {
        "path": "/api/v1/admin/posts/all",
        "method": "GET",
        "role": "admin",
        "description": "Retrieve all posts with filter options"
    },
    {
        "path": "/api/v1/admin/posts/:postId",
        "method": "DELETE",
        "role": "admin",
        "description": "Force delete user blog post"
    },
    {
        "path": "/api/v1/admin/posts/:postId/approve",
        "method": "PATCH",
        "role": "admin",
        "description": "Approve pending user blog post"
    },
    {
        "path": "/api/v1/admin/posts/:postId/reject",
        "method": "PATCH",
        "role": "admin",
        "description": "Reject pending user blog post"
    },
    {
        "path": "/api/v1/admin/users",
        "method": "GET",
        "role": "admin",
        "description": "List registered user accounts"
    },
    {
        "path": "/api/v1/admin/users/:userId",
        "method": "PUT",
        "role": "admin",
        "description": "Update user account profile information & role"
    },
    {
        "path": "/api/v1/admin/users/:userId",
        "method": "DELETE",
        "role": "admin",
        "description": "Permanently de-register user profile"
    },
    {
        "path": "/api/v1/admin/permissions",
        "method": "GET",
        "role": "admin",
        "description": "View dynamic routing permission matrix"
    },
    {
        "path": "/api/v1/admin/permissions",
        "method": "POST",
        "role": "admin",
        "description": "Add new dynamic route permission rule"
    },
    {
        "path": "/api/v1/admin/permissions/:id/toggle",
        "method": "PATCH",
        "role": "admin",
        "description": "Toggle user route pattern status"
    },
    {
        "path": "/api/v1/admin/permissions/:id",
        "method": "DELETE",
        "role": "admin",
        "description": "Remove dynamic route permission rule"
    },
    {
        "path": "/api/v1/posts",
        "method": "POST",
        "role": "user",
        "description": "Create and publish new blog posts"
    },
    {
        "path": "/api/v1/posts",
        "method": "POST",
        "role": "admin",
        "description": "Create and publish new blog posts"
    },
    {
        "path": "/api/v1/posts/:blogId",
        "method": "PUT",
        "role": "user",
        "description": "Edit existing own blog posts"
    },
    {
        "path": "/api/v1/posts/:blogId",
        "method": "PUT",
        "role": "admin",
        "description": "Edit existing own blog posts"
    },
    {
        "path": "/api/v1/posts/:blogId",
        "method": "DELETE",
        "role": "user",
        "description": "Delete own blog posts"
    },
    {
        "path": "/api/v1/posts/:blogId",
        "method": "DELETE",
        "role": "admin",
        "description": "Delete own blog posts"
    },
    {
        "path": "/api/v1/posts/:blogId/like",
        "method": "POST",
        "role": "user",
        "description": "Toggle like status on blog posts"
    },
    {
        "path": "/api/v1/posts/:blogId/like",
        "method": "POST",
        "role": "admin",
        "description": "Toggle like status on blog posts"
    },
    {
        "path": "/api/v1/posts/media/upload",
        "method": "POST",
        "role": "user",
        "description": "Upload cover images or embed media"
    },
    {
        "path": "/api/v1/posts/media/upload",
        "method": "POST",
        "role": "admin",
        "description": "Upload cover images or embed media"
    },
    {
        "path": "/api/v1/comments/post/:postId",
        "method": "POST",
        "role": "user",
        "description": "Write comments under blog posts"
    },
    {
        "path": "/api/v1/comments/post/:postId",
        "method": "POST",
        "role": "admin",
        "description": "Write comments under blog posts"
    },
    {
        "path": "/api/v1/comments/:id",
        "method": "PUT",
        "role": "user",
        "description": "Edit own published comments"
    },
    {
        "path": "/api/v1/comments/:id",
        "method": "PUT",
        "role": "admin",
        "description": "Edit own published comments"
    },
    {
        "path": "/api/v1/comments/:id",
        "method": "DELETE",
        "role": "user",
        "description": "Remove own published comments"
    },
    {
        "path": "/api/v1/comments/:id",
        "method": "DELETE",
        "role": "admin",
        "description": "Remove own published comments"
    },
    {
        "path": "/api/v1/comments/:id/like",
        "method": "POST",
        "role": "user",
        "description": "Like or unlike user comments"
    },
    {
        "path": "/api/v1/comments/:id/like",
        "method": "POST",
        "role": "admin",
        "description": "Like or unlike user comments"
    },
    {
        "path": "/api/v1/admin/db/tables",
        "method": "GET",
        "role": "admin",
        "description": "Get all database tables for SQLite"
    },
    {
        "path": "/api/v1/admin/db/query",
        "method": "POST",
        "role": "admin",
        "description": "Execute raw query against SQLite database"
    },
    {
        "path": "/api/v1/admin/content/:page/:section",
        "method": "PUT",
        "role": "admin",
        "description": "Update site page content"
    },
    {
        "path": "/api/v1/admin/subscribers",
        "method": "GET",
        "role": "admin",
        "description": "View newsletter subscribers"
    },
    {
        "path": "/api/v1/admin/team",
        "method": "POST",
        "role": "admin",
        "description": "Add new team member"
    },
    {
        "path": "/api/v1/admin/team/:id",
        "method": "PUT",
        "role": "admin",
        "description": "Update team member"
    },
    {
        "path": "/api/v1/admin/team/:id",
        "method": "DELETE",
        "role": "admin",
        "description": "Delete team member"
    }
];

  for (const perm of permissions) {
    await prisma.routePermission.upsert({
      where: {
        path_method_role: {
          path: perm.path,
          method: perm.method,
          role: perm.role,
        }
      },
      update: {
        description: perm.description,
        isActive: true
      },
      create: {
        path: perm.path,
        method: perm.method,
        role: perm.role,
        description: perm.description,
        isActive: true
      }
    });
  }

  console.log('Database seeding completed successfully. 🚀');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
