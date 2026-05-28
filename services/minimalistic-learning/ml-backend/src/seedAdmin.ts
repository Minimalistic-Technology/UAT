import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = "lihancebopche@gmail.com";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    });

    if (existingAdmin) {
        console.log("[Seeder] Admin user already exists in production database. Skipping.");
        return;
    }

    console.log("[Seeder] Admin user not found. creating...");

    const hashedPassword = await bcrypt.hash("12345678", 10);

    await prisma.user.create({
        data: {
            firstName: "System",
            lastName: "Admin",
            contactNumber: "0000000000",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            isVerified: true
        }
    });

    console.log("[Seeder] Production Admin Account Seeded Successfully!");
}

main()
    .catch((e) => {
        console.error("[Seeder] Error seeding admin:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
