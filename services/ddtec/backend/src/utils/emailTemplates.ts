export interface EmailTemplate {
    id: string;
    name: string;
    category: string;
    description: string;
    subject: string;
    previewText: string;
    badge: string;
    html: string;
}

export const PREDEFINED_EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: "promo_sale",
        name: "Mega Flash Sale / Promotion",
        category: "Marketing",
        description: "Eye-catching vibrant template with discount badge, high-converting call to action button, and product highlight section.",
        subject: "🔥 Exclusive Deal Inside: Up to 50% OFF at DDTEC!",
        previewText: "Don't miss out on our biggest technology sale of the season.",
        badge: "PROMO",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Special Promotion</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08);">
                    <!-- Header Banner -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 35px 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">DDTEC EXCLUSIVE</h1>
                            <p style="color: #ccfbf1; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Limited Time Offer</p>
                        </td>
                    </tr>
                    <!-- Main Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <div style="background-color: #f0fdf4; border: 2px dashed #22c55e; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
                                <span style="font-size: 12px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 1px;">Use Coupon Code</span>
                                <h2 style="font-size: 32px; color: #166534; margin: 5px 0 0 0; font-weight: 900; letter-spacing: 3px;">MEGA50</h2>
                            </div>
                            
                            <h2 style="color: #0f172a; font-size: 22px; margin-top: 0;">Upgrade Your Tech Stack Today</h2>
                            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                Discover premium developer tools, cutting-edge hardware, and professional tech solutions designed to boost your efficiency and performance.
                            </p>
                            
                            <!-- Call to Action Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="https://ddtec.com/shop" target="_blank" style="background-color: #0d9488; color: #ffffff; font-weight: 700; font-size: 16px; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);">
                                    Shop Special Deals &rarr;
                                </a>
                            </div>

                            <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 30px 0 0 0; text-align: center;">
                                * Offer valid while stocks last. Terms and conditions apply.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="color: #64748b; font-size: 12px; margin: 0;">&copy; 2026 DDTEC. All rights reserved.</p>
                            <p style="color: #94a3b8; font-size: 11px; margin: 5px 0 0 0;">You are receiving this email because you subscribed to DDTEC notifications.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    },
    {
        id: "newsletter_announcement",
        name: "Monthly Newsletter & Tech Insights",
        category: "Newsletter",
        description: "Professional newsletter template with article highlights, featured product card, and modern editorial styling.",
        subject: "📰 DDTEC Tech Insights: What's New This Month",
        previewText: "Check out our latest product updates and industry announcements.",
        badge: "NEWS",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DDTEC Newsletter</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
                    <!-- Brand Header -->
                    <tr>
                        <td style="padding: 25px 30px; border-bottom: 2px solid #0d9488; background-color: #0f172a;">
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">DDTEC <span style="color: #14b8a6; font-weight: 300;">NEWS</span></h2>
                                    </td>
                                    <td align="right">
                                        <span style="color: #94a3b8; font-size: 13px;">Monthly Edition</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Main Story -->
                    <tr>
                        <td style="padding: 35px 30px 20px 30px;">
                            <span style="background-color: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">Featured Update</span>
                            <h2 style="color: #0f172a; font-size: 22px; margin: 12px 0 10px 0;">Introducing Next-Gen DDTEC Solutions</h2>
                            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                We are thrilled to announce a major upgrade to our service platform. Experience 3x faster processing, enhanced security controls, and seamless workflow integrations.
                            </p>
                        </td>
                    </tr>
                    <!-- Content Card -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #f1f5f9; border-radius: 10px; padding: 20px;">
                                <h3 style="color: #1e293b; font-size: 16px; margin: 0 0 10px 0;">Key Highlights:</h3>
                                <ul style="color: #334155; font-size: 14px; line-height: 1.7; margin: 0; padding-left: 20px;">
                                    <li>Automated inventory analytics engine</li>
                                    <li>Real-time notification dispatches</li>
                                    <li>Enhanced order tracking and automated bills</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://ddtec.com/blogs" target="_blank" style="background-color: #0f172a; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
                                    Read Full Article
                                </a>
                            </div>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0; text-align: center;">
                            <p style="color: #64748b; font-size: 12px; margin: 0;">DDTEC Technologies &bull; Building the Future of Work</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    },
    {
        id: "system_announcement",
        name: "Official System Notice / Maintenance",
        category: "Transactional",
        description: "Clean, authoritative notice layout for platform updates, maintenance schedules, or critical announcements.",
        subject: "📢 Important Service Update from DDTEC",
        previewText: "Please review important details regarding scheduled platform operations.",
        badge: "NOTICE",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Announcement</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 8px; border-top: 5px solid #0d9488; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding: 30px 30px;">
                            <h2 style="color: #111827; font-size: 20px; margin: 0 0 15px 0;">Important Service Announcement</h2>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 15px 0;">
                                Dear Customer,
                            </p>
                            <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                                We are performing a routine platform optimization to improve speed and security. During this window, all systems will remain operational with zero downtime expected.
                            </p>

                            <div style="background-color: #fffbebfb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                <strong style="color: #b45309; font-size: 14px; display: block; margin-bottom: 4px;">Scheduled Maintenance Window:</strong>
                                <span style="color: #78350f; font-size: 13px;">Sunday, 2:00 AM - 4:00 AM UTC</span>
                            </div>

                            <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                                If you have any questions or need support, please feel free to reach out to our team at support@ddtec.com.
                            </p>
                            <p style="color: #374151; font-size: 14px; margin-top: 25px;">
                                Best regards,<br>
                                <strong>DDTEC Operations Team</strong>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f9fafb; padding: 15px 30px; text-align: center; border-top: 1px solid #f3f4f6;">
                            <p style="color: #9ca3af; font-size: 12px; margin: 0;">&copy; 2026 DDTEC Platform Inc.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    },
    {
        id: "welcome_onboarding",
        name: "Welcome & Onboarding Email",
        category: "Welcome",
        description: "Friendly onboarding template designed to greet new users and guide them through getting started.",
        subject: "🎉 Welcome to DDTEC! Let's get started",
        previewText: "We are excited to have you on board.",
        badge: "WELCOME",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to DDTEC</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Trebuchet MS', sans-serif;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 30px 10px;">
        <tr>
            <td align="center">
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
                    <tr>
                        <td style="padding: 40px 35px; text-align: center; background: linear-gradient(135deg, #0d9488 0%, #0284c7 100%);">
                            <span style="font-size: 48px; display: block; margin-bottom: 10px;">🚀</span>
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800;">Welcome to DDTEC!</h1>
                            <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">We're thrilled to have you in our community.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 35px 35px 25px 35px;">
                            <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-top: 0;">
                                Hello there! Thank you for joining DDTEC. Here are a few quick steps to make the most of your journey with us:
                            </p>
                            
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                                <tr>
                                    <td width="40" valign="top">
                                        <div style="background-color: #ccfbf1; color: #0f766e; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">1</div>
                                    </td>
                                    <td style="padding-left: 10px; padding-bottom: 15px;">
                                        <strong style="color: #0f172a; font-size: 15px;">Explore Products</strong>
                                        <p style="color: #64748b; font-size: 13px; margin: 3px 0 0 0;">Browse our full catalog of cutting-edge tools.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td width="40" valign="top">
                                        <div style="background-color: #ccfbf1; color: #0f766e; width: 32px; height: 32px; border-radius: 50%; text-align: center; line-height: 32px; font-weight: bold; font-size: 14px;">2</div>
                                    </td>
                                    <td style="padding-left: 10px; padding-bottom: 15px;">
                                        <strong style="color: #0f172a; font-size: 15px;">Set Up Your Profile</strong>
                                        <p style="color: #64748b; font-size: 13px; margin: 3px 0 0 0;">Customize your account preferences for personalized recommendations.</p>
                                    </td>
                                </tr>
                            </table>

                            <div style="text-align: center; margin: 30px 0 10px 0;">
                                <a href="https://ddtec.com/profile" target="_blank" style="background-color: #0d9488; color: #ffffff; font-weight: bold; font-size: 15px; padding: 14px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                                    Go to Dashboard
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f1f5f9; padding: 20px; text-align: center;">
                            <p style="color: #64748b; font-size: 12px; margin: 0;">Need help? Reply directly to this email or visit our help center.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    },
    {
        id: "blank_custom",
        name: "Custom HTML Starter Template",
        category: "Custom",
        description: "Minimalist boilerplate HTML canvas ready for your custom code, graphics, and layout.",
        subject: "Update from DDTEC",
        previewText: "Read the latest update from DDTEC.",
        badge: "BLANK",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f8fafc; font-family: sans-serif; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #0d9488; margin-top: 0;">DDTEC</h2>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 15px; line-height: 1.6;">
            Write your message here...
        </p>
    </div>
</body>
</html>`
    }
];
