const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('Generating hashed password...');
    const saltRounds = 10;
    const plainPassword = '12345678';
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    console.log('Creating Admin user...');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            contactNumber: '0000000000',
            isVerified: true
        }
    });

    console.log('Creating Normal user...');
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            firstName: 'Normal',
            lastName: 'User',
            email: 'user@example.com',
            password: hashedPassword,
            role: 'user',
            contactNumber: '1111111111',
            isVerified: true
        }
    });

    console.log('✅ Success! Created Admin and User IDs.');
}

main()
    .catch((e) => {
        console.error('Error:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
