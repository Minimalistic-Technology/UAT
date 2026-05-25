import { prisma } from './src/config/db';
import { replaceRefreshToken, verifyStoredToken } from './src/services/tokenService';
import { signRefreshToken } from './src/utils/jwt';
import { env } from './src/config/env';

async function test() {
    const user = await prisma.user.findFirst();
    if (!user) return console.log("no user");

    const token = signRefreshToken(user.id);
    await replaceRefreshToken(user.id, token, env.REFRESH_TOKEN_EXPIRE);

    console.log("Token stored. Verifying...");

    const verified = await verifyStoredToken(user.id, token, 'refresh' as any);
    console.log("Stored token verification:", verified?.id);

    console.log("Test passed!");
}

test().catch(console.error).finally(() => process.exit(0));
