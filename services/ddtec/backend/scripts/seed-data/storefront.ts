export interface CouponSeed {
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderValue: number;
    type: 'product' | 'cart' | 'shipping';
    usageLimit?: number;
    usedCount: number;
    expiresAt: Date;
    isActive: boolean;
}

export const couponsData: CouponSeed[] = [
    {
        code: 'WELCOME10',
        description: '10% discount on your first order across all catalog products',
        discountType: 'percentage',
        discountValue: 10,
        minOrderValue: 1000,
        type: 'cart',
        usageLimit: 500,
        usedCount: 12,
        expiresAt: new Date('2027-12-31'),
        isActive: true
    },
    {
        code: 'SAVE500',
        description: 'Flat ₹500 off on shopping cart orders above ₹2,500',
        discountType: 'fixed',
        discountValue: 500,
        minOrderValue: 2500,
        type: 'cart',
        usageLimit: 1000,
        usedCount: 34,
        expiresAt: new Date('2027-12-31'),
        isActive: true
    },
    {
        code: 'FESTIVE20',
        description: 'Special 20% festival seasonal discount on orders above ₹5,000',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 5000,
        type: 'cart',
        usageLimit: 250,
        usedCount: 8,
        expiresAt: new Date('2027-12-31'),
        isActive: true
    },
    {
        code: 'FREESHIP',
        description: 'Free standard delivery on any order above ₹500',
        discountType: 'fixed',
        discountValue: 50,
        minOrderValue: 500,
        type: 'shipping',
        usageLimit: 5000,
        usedCount: 45,
        expiresAt: new Date('2027-12-31'),
        isActive: true
    },
    {
        code: 'TECH1000',
        description: 'Flat ₹1,000 off on high-performance laptops and monitors',
        discountType: 'fixed',
        discountValue: 1000,
        minOrderValue: 10000,
        type: 'cart',
        usageLimit: 200,
        usedCount: 15,
        expiresAt: new Date('2027-12-31'),
        isActive: true
    }
];

export interface OrderSeed {
    userEmail: string;
    productNames: Array<{ nameMatch: string; quantity: number }>;
    shippingInfo: {
        fullName: string;
        email: string;
        address: string;
        city: string;
        zip: string;
    };
    paymentMethod: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    coupon?: string;
    discountAmount: number;
    shippingFee: number;
    shippingCarrier: string;
    shippingCarrierId?: string;
}

export const ordersData: OrderSeed[] = [
    {
        userEmail: 'user@ddtec.com',
        productNames: [
            { nameMatch: 'Apple iPhone 16', quantity: 1 }
        ],
        shippingInfo: {
            fullName: 'John Doe',
            email: 'user@ddtec.com',
            address: 'Flat 402, Sunshine Heights, Powai',
            city: 'Mumbai',
            zip: '400076'
        },
        paymentMethod: 'Cashfree / Credit Card',
        status: 'delivered',
        paymentStatus: 'paid',
        discountAmount: 0,
        shippingFee: 0,
        shippingCarrier: 'Blue Dart Express',
        shippingCarrierId: 'BD-884920192'
    },
    {
        userEmail: 'priya@ddtec.com',
        productNames: [
            { nameMatch: 'Apple MacBook Air 13-inch', quantity: 1 }
        ],
        shippingInfo: {
            fullName: 'Priya Sharma',
            email: 'priya@ddtec.com',
            address: 'Villa 14, Palm Meadows, Whitefield',
            city: 'Bengaluru',
            zip: '560066'
        },
        paymentMethod: 'Cashfree UPI',
        status: 'shipped',
        paymentStatus: 'paid',
        discountAmount: 1000,
        coupon: 'TECH1000',
        shippingFee: 0,
        shippingCarrier: 'DTDC Express',
        shippingCarrierId: 'DT-773829102'
    },
    {
        userEmail: 'rajmane5884@gmail.com',
        productNames: [
            { nameMatch: 'Sony WH-1000XM5', quantity: 1 }
        ],
        shippingInfo: {
            fullName: 'Raj Mane',
            email: 'rajmane5884@gmail.com',
            address: 'A-203, Regency Meadows, Baner',
            city: 'Pune',
            zip: '411045'
        },
        paymentMethod: 'Store Credit Balance',
        status: 'processing',
        paymentStatus: 'paid',
        discountAmount: 0,
        shippingFee: 50,
        shippingCarrier: 'Blue Dart Express',
        shippingCarrierId: 'BD-991023812'
    },
    {
        userEmail: 'anushkasen@gmail.com',
        productNames: [
            { nameMatch: 'Keychron K2', quantity: 1 }
        ],
        shippingInfo: {
            fullName: 'Anushka Sen',
            email: 'anushkasen@gmail.com',
            address: 'B-601, Oberoi Splendor, JVLR',
            city: 'Mumbai',
            zip: '400060'
        },
        paymentMethod: 'Cash on Delivery (COD)',
        status: 'pending',
        paymentStatus: 'pending',
        discountAmount: 0,
        shippingFee: 50,
        shippingCarrier: 'Blue Dart Express'
    },
    {
        userEmail: 'user@ddtec.com',
        productNames: [
            { nameMatch: 'Apex Pro Ergonomic', quantity: 1 }
        ],
        shippingInfo: {
            fullName: 'John Doe',
            email: 'user@ddtec.com',
            address: 'Flat 402, Sunshine Heights, Powai',
            city: 'Mumbai',
            zip: '400076'
        },
        paymentMethod: 'Cashfree Netbanking',
        status: 'cancelled',
        paymentStatus: 'refunded',
        discountAmount: 500,
        coupon: 'SAVE500',
        shippingFee: 0,
        shippingCarrier: 'Blue Dart Express'
    }
];

export interface ReviewSeed {
    productNameMatch: string;
    userEmail: string;
    userName: string;
    rating: number;
    comment: string;
}

export const reviewsData: ReviewSeed[] = [
    {
        productNameMatch: 'Apple iPhone 16',
        userEmail: 'user@ddtec.com',
        userName: 'John Doe',
        rating: 5,
        comment: 'Incredible camera and battery life. The new Camera Control button takes mobile photography to another level! Dispatched very quickly by DDTEC.'
    },
    {
        productNameMatch: 'Apple MacBook Air 13-inch',
        userEmail: 'priya@ddtec.com',
        userName: 'Priya Sharma',
        rating: 5,
        comment: 'Blazing fast for developer workflows. 16GB unified memory handles Docker, VSCode, and multiple browser tabs without any fan noise or heat.'
    },
    {
        productNameMatch: 'Sony WH-1000XM5',
        userEmail: 'rajmane5884@gmail.com',
        userName: 'Raj Mane',
        rating: 5,
        comment: 'Unmatched noise cancellation! Makes open-office spaces and flight journeys completely silent. Very comfortable ear cushions for all-day wear.'
    },
    {
        productNameMatch: 'Keychron K2',
        userEmail: 'user@ddtec.com',
        userName: 'John Doe',
        rating: 4,
        comment: 'Great tactile feedback on the Gateron Brown switches. Bluetooth connects seamlessly to both my MacBook and Windows desktop.'
    },
    {
        productNameMatch: 'Samsung Galaxy S24 Ultra',
        userEmail: 'anushkasen@gmail.com',
        userName: 'Anushka Sen',
        rating: 5,
        comment: 'The display anti-reflective coating is phenomenal. Galaxy AI features like Circle to Search and live call translate have become daily essentials.'
    },
    {
        productNameMatch: 'Apex Pro Ergonomic',
        userEmail: 'priya@ddtec.com',
        userName: 'Priya Sharma',
        rating: 4,
        comment: 'Sturdy lumbar support and highly breathable Korean mesh. Lower back strain resolved after 2 weeks of using this chair daily.'
    }
];

export interface CartSeed {
    userEmail: string;
    items: Array<{
        productNameMatch: string;
        quantity: number;
    }>;
}

export const cartsData: CartSeed[] = [
    {
        userEmail: 'user@ddtec.com',
        items: [
            { productNameMatch: 'Keychron K2', quantity: 1 },
            { productNameMatch: 'SanDisk 1TB Extreme', quantity: 2 }
        ]
    },
    {
        userEmail: 'priya@ddtec.com',
        items: [
            { productNameMatch: 'Philips Digital Air Fryer', quantity: 1 }
        ]
    }
];

export interface RouteConfigSeed {
    path: string;
    name: string;
    description: string;
    isActive: boolean;
}

export const routeConfigsData: RouteConfigSeed[] = [
    { path: '/', name: 'Home Page', description: 'Main landing page of DDTEC', isActive: true },
    { path: '/shop', name: 'Shop', description: 'Displays all IT assets, hardware, and software products to purchase', isActive: true },
    { path: '/warehouse', name: 'Warehouse Dashboard', description: 'Logistics page for warehouse staff to manage packing and dispatch', isActive: true },
    { path: '/orders', name: 'Order History', description: 'Allows users to view and track their past and current orders', isActive: true },
    { path: '/profile', name: 'My Profile', description: 'User account settings and detail management', isActive: true },
    { path: '/cart', name: 'Shopping Cart', description: 'Contains selected products before checkout', isActive: true },
    { path: '/checkout', name: 'Checkout Page', description: 'Payment and shipping address confirmation', isActive: true },
    { path: '/blogs', name: 'Tech Blogs', description: 'Articles and news about enterprise IT solutions', isActive: true },
    { path: '/login', name: 'User Login', description: 'Authentication page for users to login', isActive: true },
    { path: '/signup', name: 'User Signup', description: 'Registration page for new users with OTP setup', isActive: true },
    { path: '/product', name: 'Product Details', description: 'Single product detail and view page', isActive: true },
    { path: '/admin', name: 'Admin Dashboard', description: 'Core administrative control panel (Should never be disabled!)', isActive: true },
    { path: '/quotation', name: 'Quotation Tool', description: 'Generate instant enterprise GST quotation PDF', isActive: true }
];

export interface EmailTemplateSeed {
    name: string;
    category: string;
    description: string;
    subject: string;
    previewText: string;
    badge: string;
    html: string;
}

export const emailTemplatesData: EmailTemplateSeed[] = [
    {
        name: 'Welcome to DDTEC',
        category: 'Onboarding',
        description: 'Sent immediately when a new user signs up or is invited to DDTEC',
        subject: 'Welcome to DDTEC - Your Enterprise IT & Hardware Destination',
        previewText: 'Get started with authentic hardware, express logistics, and B2B tax billing.',
        badge: 'WELCOME',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;margin:0;padding:24px}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0}.btn{display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px}</style></head>
<body>
  <div class="card">
    <h2 style="color:#0f172a;margin-top:0;">Welcome to DDTEC, {{name}}!</h2>
    <p>Thank you for creating an account with DDTEC. You now have access to verified, 100% genuine IT hardware, dark store express fulfillment, and corporate GST tax invoices.</p>
    <p>Explore our latest products in computing, smartphones, enterprise networking, and audio.</p>
    <a href="{{loginUrl}}" class="btn">Explore Shop</a>
  </div>
</body>
</html>`
    },
    {
        name: 'Order Confirmation & Tracking',
        category: 'Transactional',
        description: 'Sent when an order is placed and confirmed by payment gateway',
        subject: 'Your DDTEC Order #{{orderId}} is Confirmed!',
        previewText: 'We have received your order and our logistics team is preparing dispatch.',
        badge: 'ORDERS',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;margin:0;padding:24px}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0}</style></head>
<body>
  <div class="card">
    <h2 style="color:#0f172a;margin-top:0;">Order Confirmed!</h2>
    <p>Hi {{name}},</p>
    <p>Thank you for your purchase! We are packing your order at our nearest fulfillment hub. You will receive an SMS and email notification with your live BlueDart/DTDC tracking number once dispatched.</p>
    <p><strong>Order ID:</strong> {{orderId}}<br><strong>Total Amount:</strong> ₹{{totalAmount}}</p>
  </div>
</body>
</html>`
    },
    {
        name: 'Commercial B2B Quotation',
        category: 'Sales',
        description: 'Sent to corporate clients with attached formal quotation details',
        subject: 'Formal Price Quotation #{{quotationNumber}} - DDTEC',
        previewText: 'Please review your formal enterprise price quotation with tax details.',
        badge: 'QUOTATION',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;margin:0;padding:24px}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0}</style></head>
<body>
  <div class="card">
    <h2 style="color:#0f172a;margin-top:0;">Price Quotation #{{quotationNumber}}</h2>
    <p>Dear {{buyerName}},</p>
    <p>Please find attached our official price quotation for your hardware procurement requirements. All items include full manufacturer warranties and compliance with GST input tax credit rules.</p>
    <p><strong>Quotation Total:</strong> ₹{{grandTotal}}</p>
  </div>
</body>
</html>`
    },
    {
        name: 'Password Reset & OTP Verification',
        category: 'Security',
        description: 'Sent during authentication or OTP login verification',
        subject: '{{otp}} is your DDTEC Verification Code',
        previewText: 'Use this 6-digit one-time password to complete your verification.',
        badge: 'SECURITY',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;margin:0;padding:24px}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0}.code{font-size:32px;font-weight:700;letter-spacing:6px;color:#2563eb;margin:24px 0}</style></head>
<body>
  <div class="card" style="text-align:center;">
    <h2 style="color:#0f172a;margin-top:0;">Verification Code</h2>
    <p>Your one-time security code is:</p>
    <div class="code">{{otp}}</div>
    <p style="color:#64748b;font-size:14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
  </div>
</body>
</html>`
    },
    {
        name: 'Invoice & Tax Receipt Ready',
        category: 'Billing',
        description: 'Sent when an official commercial GST tax invoice is generated',
        subject: 'Tax Invoice {{invoiceNumber}} from DDTEC Technologies',
        previewText: 'Download your GST compliant commercial tax invoice.',
        badge: 'INVOICE',
        html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1e293b;background:#f8fafc;margin:0;padding:24px}.card{max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0}</style></head>
<body>
  <div class="card">
    <h2 style="color:#0f172a;margin-top:0;">Commercial Tax Invoice</h2>
    <p>Dear {{clientName}},</p>
    <p>Your official GST commercial tax invoice #{{invoiceNumber}} has been generated. You can view or download the PDF copy using your public link below.</p>
    <p><strong>Invoice Amount:</strong> ₹{{totalAmount}}</p>
  </div>
</body>
</html>`
    }
];

export const settingsData = {
    components: {
        WhatWeOffer: true,
        Footer: true,
        ShopSection: true,
        Hero: true,
        WhoWeAre: true,
        FeaturedProducts: true,
        Contact: true,
        Login: true
    },
    onboarding: {
        mode: 'open' as const,
        inviteCode: 'DDTEC-INVITE-2026',
        closedMessage: 'New user onboarding is currently restricted by administrator.'
    },
    delivery: {
        freeDeliveryThreshold: 500,
        flatDeliveryFee: 50,
        isFreeDeliveryEnabled: false
    },
    quotationLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80'
};

export interface BlogSeed {
    title: string;
    content: string;
    author: string;
    image: string;
    slug: string;
    tags: string[];
}

export const blogsData: BlogSeed[] = [
    {
        title: 'The Rise of Apple Silicon M3 in Modern Enterprise Computing',
        slug: 'apple-silicon-m3-in-enterprise',
        author: 'System Architecture Team',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80',
        tags: ['Apple', 'M3', 'Enterprise IT', 'Hardware'],
        content: `The transition of corporate development fleets to Apple Silicon has marked one of the most rapid enterprise migrations in computing history. With the introduction of the M3 chip architecture built on TSMC's 3-nanometer process, the gains in battery efficiency and unified memory bandwidth deliver measurable advantages for engineers running parallel compilation, containerization, and heavy simulation workloads.

### Thermal Efficiency and Developer Productivity
Unlike traditional x86 workstation setups that require heavy fans and sustained cooling, the fanless M3 MacBook Air runs completely silent while maintaining near-zero thermal throttling for burst operations. For companies with distributed or hybrid teams, reducing hardware downtime and providing all-day 18-hour battery longevity has led to higher satisfaction and lower IT helpdesk overhead.

### Enterprise Deployment and MDM Integration
DDTEC provides pre-configured zero-touch Apple Business Manager deployment, enabling enterprise IT teams to ship sealed boxes directly to developers with automated zero-trust security profiles, VPN certificates, and disk encryption provisioned out of the box.`
    },
    {
        title: 'Dark Stores & Micro-Fulfillment: Scaling 15-Minute Hardware Logistics',
        slug: 'dark-stores-and-warehouse-logistics',
        author: 'Operations & Supply Chain',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
        tags: ['Logistics', 'Dark Stores', 'Fulfillment', 'Supply Chain'],
        content: `Rapid delivery is no longer just for groceries. In urban tech clusters like Mumbai, Bengaluru, and Pune, engineering teams and IT departments often face sudden hardware bottlenecks—a developer's charger fails, an SSD crashes before a deadline, or a high-priority meeting requires an extra 4K monitor.

### Micro-Fulfillment Dark Store Architecture
By establishing localized, inventory-dense dark stores in key industrial corridors (such as Andheri in Mumbai and Electronic City in Bengaluru), DDTEC reduces dispatch latency from days to under 60 minutes. Every rack, aisle, and shelf row is dynamically mapped in the warehouse management system, allowing pickers to retrieve, barcode-verify, and package IT hardware within 3 minutes of order confirmation.

### Real-Time Inter-Hub Balancing
Through predictive telemetry and automatic transfer requests, high-velocity assets like mechanical keyboards, USB-C multi-port hubs, and flagship phones are automatically restocked from regional fulfillment centers to dark stores before stock depletion occurs.`
    },
    {
        title: 'Understanding GST & Input Tax Credit on Corporate IT Hardware Purchases in India',
        slug: 'understanding-gst-input-tax-credit-it-hardware',
        author: 'Finance & Taxation Desk',
        image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&auto=format&fit=crop&q=80',
        tags: ['Taxation', 'GST', 'B2B', 'Compliance'],
        content: `Purchasing IT hardware for a registered business in India offers significant tax efficiency through Input Tax Credit (ITC) under GST Law. However, navigating HSN codes, electronic e-invoicing, and matching GSTR-2B reconciliations is vital to ensure zero tax leakage.

### How ITC Works on IT Hardware
When your company buys laptops (HSN 84713010) or network switches (HSN 85176290) at an 18% GST rate, the entire GST component (9% CGST + 9% SGST or 18% IGST) can be offset against your output GST liability on sales or client services, provided the hardware is used in the furtherance of business.

### Why DDTEC Commercial Invoices Matter
DDTEC generates compliant B2B tax invoices with valid GSTINs, 8-digit HSN codes, and digital verification. Every commercial invoice uploaded to your account is automatically reported to the GST portal, ensuring that credits populate directly into your monthly GSTR-2B statement without discrepancy.`
    },
    {
        title: "Tactile vs Linear vs Clicky: The Developer's Guide to Mechanical Keyboards",
        slug: 'developers-guide-to-mechanical-keyboards',
        author: 'Hardware Review Lab',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&auto=format&fit=crop&q=80',
        tags: ['Peripherals', 'Keyboards', 'Ergonomics', 'Developer Tools'],
        content: `For engineers and programmers who spend 8 to 10 hours a day typing code, a keyboard is not an accessory—it is the primary interface between thought and execution. Choosing between switch types can drastically improve typing accuracy and prevent repetitive strain injury (RSI).

### Switch Characteristics:
- **Tactile (Gateron Brown / Cherry MX Brown):** Provides a subtle bump at the actuation point. Ideal for programming and general writing because you know exactly when the keystroke registers without bottoming out.
- **Linear (Gateron Red / Cherry MX Red):** Smooth, uninterrupted travel from top to bottom. Quiet and popular for high-speed typing and gaming.
- **Clicky (Gateron Blue / GX Blue):** Produces a crisp audible click accompanied by a tactile snap. Extremely satisfying, though best suited for private offices or home setups rather than open workspaces.

The Keychron K2 series combines hot-swappable switches with full Mac and Windows layout switches, making it DDTEC's top recommendation for software developers.`
    },
    {
        title: 'Active Noise Cancellation in the Hybrid Workplace: Boosting Focus and Acoustic Comfort',
        slug: 'active-noise-cancellation-hybrid-workplace',
        author: 'Workplace Productivity Group',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
        tags: ['Audio', 'Headphones', 'Hybrid Work', 'Productivity'],
        content: `As companies embrace hybrid and open-plan offices, acoustic distraction has emerged as one of the single biggest threats to deep work and cognitive focus. High background chatter, keyboard clatter, and ambient HVAC hum directly degrade concentration.

### Next-Generation ANC Algorithms
Flagship headphones like the Sony WH-1000XM5 and Apple AirPods Pro 2 utilize dedicated co-processors and multi-microphone arrays to sample external noise thousands of times per second. By generating an inverse soundwave, ambient low and mid-frequency noises are neutralized before reaching your ears.

### Seamless Device Switching
With Bluetooth multipoint connectivity, professionals can stay paired to their laptop during Zoom conferences and automatically switch to their phone when receiving a client call, eliminating the friction of manual re-pairing.`
    }
];

export interface OtpSeed {
    identifier: string;
    otp: string;
    expiresAt: Date;
    attempts: number;
}

export const otpsData: OtpSeed[] = [
    {
        identifier: 'user@ddtec.com',
        otp: '123456',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours validity
        attempts: 0
    },
    {
        identifier: '+919800000011',
        otp: '123456',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        attempts: 0
    }
];
