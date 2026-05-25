import { prisma } from './src/config/db';
import { signAccessToken } from './src/utils/jwt';

async function testApi() {
    const user = await prisma.user.findFirst();
    if (!user) return console.log("no user");

    const accessToken = signAccessToken(user.id);

    try {
        const res = await fetch('http://localhost:5001/api/v1/notifications', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response length:", text.length);
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

testApi().catch(console.error).finally(() => process.exit(0));
