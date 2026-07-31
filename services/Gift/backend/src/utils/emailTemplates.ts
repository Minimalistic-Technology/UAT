export const getOtpEmail = (appName: string, otp: string): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Welcome to ${appName}!</h2>
        <p>Your OTP for email verification is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p>This OTP is valid for <strong>2 minutes</strong>.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">If you didn't request this, please ignore this email.</p>
    </div>
`;

export const getWelcomeEmail = (appName: string, name: string): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10B981;">Account Verified! 🎉</h2>
        <p>Hi <strong>${name}</strong>, your account has been successfully verified.</p>
        <p>Welcome to <strong>${appName}</strong>! You can now access all features of the platform.</p>
    </div>
`;

export const getLoginAlertEmail = (appName: string, name: string, time: string): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #F59E0B;">New Login Alert 🔔</h2>
        <p>Hi <strong>${name}</strong>, we detected a new login to your ${appName} account.</p>
        <p><strong>Time:</strong> ${time}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p>If this was you, you can safely ignore this email.</p>
        <p style="color: #EF4444;">If you don't recognize this activity, please contact support and change your password immediately.</p>
    </div>
`;

export const getGiftApprovedEmail = (appName: string, name: string): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #10B981;">Gift Request Approved! ✅</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Great news! Your recent gift claim has been <strong>approved</strong>.</p>
        <p>It will be packed and shipped to your address shortly. You'll continue to see status updates in your profile dashboard.</p>
        <p>Thank you for being part of the team!</p>
    </div>
`;

export const getGiftRejectedEmail = (appName: string, name: string): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #EF4444;">Gift Request Update ❌</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Unfortunately, your recent gift claim has been <strong>rejected</strong> by the administrator.</p>
        <p>Please contact your HR administrator if you have any questions or believe this is a mistake.</p>
    </div>
`;

export const getNewLinkCreatedEmail = (appName: string, creatorRole: string, creatorName: string, link: string, expiryDate?: Date): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #8B5CF6;">New Gift Claim Link Available! 🎁</h2>
        <p>A new gift claim link has just been generated on ${appName}!</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Created By:</strong> ${creatorName} (${creatorRole})</p>
            ${expiryDate ? `<p style="margin: 0; color: #EF4444;"><strong>Expires On:</strong> ${new Date(expiryDate).toLocaleString()}</p>` : ''}
        </div>
        <p style="margin-top: 20px;">
            <a href="${link}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Click Here To View Gifts
            </a>
        </p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">Or copy and paste this link in your browser:</p>
        <p style="font-size: 12px; word-break: break-all;">${link}</p>
    </div>
`;
