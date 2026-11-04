export interface CategorySeed {
    name: string;
    slug: string;
    description: string;
    image: string;
}

export interface ProductHighlight {
    icon: string;
    title: string;
    description: string;
    color: string;
}

export interface ProductSeed {
    name: string;
    categorySlug: string;
    brand: string;
    modelName: string;
    price: number;
    costPrice: number;
    stock: number;
    rating: number;
    numReviews: number;
    lastMonthSales: number;
    discountPercentage: number;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    hsnCode: string;
    cgst: number;
    sgst: number;
    weightKg: number;
    lengthCm: number;
    widthCm: number;
    heightCm: number;
    packQuantity: number;
    packUnit: string;
    seller: string;
    showOnHome: boolean;
    customDeliveryEstimate: string;
    image: string;
    images: string[];
    description: string;
    highlights: ProductHighlight[];
}

export const categoriesData: CategorySeed[] = [
    {
        name: 'Smartphones & Tablets',
        slug: 'smartphones-tablets',
        description: 'Latest flagship mobile phones, tablets, and smart wearables from top brands.',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    },
    {
        name: 'Kitchen & Home Appliances',
        slug: 'appliances',
        description: 'Modern kitchen appliances including microwave ovens, air fryers, blenders, and kettles.',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
    },
    {
        name: 'Computer Peripherals & Gaming',
        slug: 'computers-peripherals',
        description: 'Mechanical keyboards, gaming mice, consoles, SSDs, and professional accessories.',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
    },
    {
        name: 'Footwear & Apparel',
        slug: 'footwear-apparel',
        description: 'Premium performance running shoes, sneakers, and everyday lifestyle carry gear.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
    },
    {
        name: 'Audio & Sound',
        slug: 'audio-sound',
        description: 'Audiophile headphones, true wireless earbuds, smart speakers, and cameras.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
    },
    {
        name: 'Laptops & Monitors',
        slug: 'laptops-monitors',
        description: 'High-performance laptops, ultra-sharp 4K displays, and workstation monitors.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
    },
    {
        name: 'Tools & Industrial',
        slug: 'tools-industrial',
        description: 'Heavy-duty power tools, ergonomic executive seating, and workshop equipment.',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'
    }
];

export const productsData: ProductSeed[] = [
    // 1. iPhone 16
    {
        name: 'Apple iPhone 16 (128GB, Ultramarine)',
        categorySlug: 'smartphones-tablets',
        brand: 'Apple',
        modelName: 'A3081',
        price: 79900,
        costPrice: 68500,
        stock: 45,
        rating: 4.8,
        numReviews: 142,
        lastMonthSales: 88,
        discountPercentage: 5,
        discountType: 'percentage' as const,
        discountValue: 5,
        hsnCode: '85171300',
        cgst: 9,
        sgst: 9,
        weightKg: 0.38,
        lengthCm: 17,
        widthCm: 9,
        heightCm: 3,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Apple Authorized Store',
        showOnHome: true,
        customDeliveryEstimate: 'Next-day delivery available',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Apple iPhone 16 features the groundbreaking A18 chip with Camera Control, 48MP Fusion camera with 2x optical-quality Telephoto, brighter Super Retina XDR OLED display, and next-generation Ceramic Shield front for industry-leading durability.',
        highlights: [
            { icon: 'ShieldCheck', title: '1-Year Apple Warranty', description: 'Direct manufacturer warranty with door-step service support.', color: 'teal' },
            { icon: 'Truck', title: 'Express Delivery', description: 'Dispatched within 24 hours with BlueDart/DTDC tracking.', color: 'blue' },
            { icon: 'Award', title: '100% Genuine Apple', description: 'Brand-sealed unit with verifiable serial number.', color: 'purple' },
            { icon: 'RefreshCw', title: '7-Day Replacement', description: 'Hassle-free replacement for transit damage or defective units.', color: 'emerald' }
        ]
    },

    // 2. Samsung Galaxy S24 Ultra
    {
        name: 'Samsung Galaxy S24 Ultra 5G (Titanium Gray, 256GB)',
        categorySlug: 'smartphones-tablets',
        brand: 'Samsung',
        modelName: 'SM-S928B',
        price: 129999,
        costPrice: 110000,
        stock: 28,
        rating: 4.9,
        numReviews: 320,
        lastMonthSales: 52,
        discountPercentage: 8,
        discountType: 'percentage' as const,
        discountValue: 8,
        hsnCode: '85171300',
        cgst: 9,
        sgst: 9,
        weightKg: 0.42,
        lengthCm: 18,
        widthCm: 10,
        heightCm: 3.5,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Samsung Official Flagship',
        showOnHome: true,
        customDeliveryEstimate: '1-2 business days',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Samsung Galaxy S24 Ultra with Galaxy AI, titanium exterior frame, integrated S Pen, 200MP camera system with 5x optical zoom, Snapdragon 8 Gen 3 for Galaxy, and Dynamic AMOLED 2X flat display with Vision Booster.',
        highlights: [
            { icon: 'Zap', title: 'Galaxy AI Enabled', description: 'Circle to Search, Live Translate, and Generative Photo Edit.', color: 'violet' },
            { icon: 'ShieldCheck', title: '1-Year Warranty', description: 'Full coverage by Samsung India brand service centers.', color: 'teal' },
            { icon: 'Truck', title: 'Fast Doorstep Logistics', description: 'Insured express transit with real-time OTP dispatch.', color: 'blue' }
        ]
    },

    // 3. Apple iPad Air 11-inch M2
    {
        name: 'Apple iPad Air 11-inch M2 Chip (Wi-Fi, 128GB, Space Gray)',
        categorySlug: 'smartphones-tablets',
        brand: 'Apple',
        modelName: 'MU9D3HN/A',
        price: 59900,
        costPrice: 51200,
        stock: 32,
        rating: 4.9,
        numReviews: 185,
        lastMonthSales: 55,
        discountPercentage: 5,
        discountType: 'percentage' as const,
        discountValue: 5,
        hsnCode: '84713090',
        cgst: 9,
        sgst: 9,
        weightKg: 0.85,
        lengthCm: 27,
        widthCm: 20,
        heightCm: 4,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Apple Authorized Store',
        showOnHome: false,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Supercharged by the Apple M2 chip with incredible performance and all-day battery life. Stunning 11-inch Liquid Retina display with P3 wide color, True Tone, landscape 12MP Ultra Wide front camera with Center Stage, and Wi-Fi 6E support.',
        highlights: [
            { icon: 'Sparkles', title: 'M2 Processing Power', description: 'Blazing speed for creative apps, multitasking, and AAA gaming.', color: 'amber' },
            { icon: 'ShieldCheck', title: 'Official Apple Warranty', description: 'Eligible for AppleCare+ and doorstep warranty repairs.', color: 'teal' }
        ]
    },

    // 4. Apple Watch Series 10
    {
        name: 'Apple Watch Series 10 (GPS 46mm, Jet Black Aluminium with Sport Band)',
        categorySlug: 'smartphones-tablets',
        brand: 'Apple',
        modelName: 'MWW13HN/A',
        price: 49900,
        costPrice: 42000,
        stock: 30,
        rating: 4.8,
        numReviews: 140,
        lastMonthSales: 48,
        discountPercentage: 6,
        discountType: 'percentage' as const,
        discountValue: 6,
        hsnCode: '85176290',
        cgst: 9,
        sgst: 9,
        weightKg: 0.35,
        lengthCm: 29,
        widthCm: 8,
        heightCm: 4,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Apple Authorized Store',
        showOnHome: true,
        customDeliveryEstimate: '1-2 business days',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Apple Watch Series 10 features the thinnest design ever, our largest and most advanced display with up to 40% more screen area, ECG app, blood oxygen tracking, sleep apnea notifications, and 50m water resistance.',
        highlights: [
            { icon: 'Heart', title: 'Advanced Health Tracking', description: 'ECG, sleep apnea alerts, and high/low heart rate notifications.', color: 'rose' },
            { icon: 'ShieldCheck', title: '1-Year Apple Warranty', description: 'Comprehensive warranty against defects.', color: 'teal' }
        ]
    },

    // 5. IFB 30L Convection Microwave Oven
    {
        name: 'IFB 30L Convection Microwave Oven (30BRC2, Black)',
        categorySlug: 'appliances',
        brand: 'IFB',
        modelName: '30BRC2',
        price: 16490,
        costPrice: 13200,
        stock: 22,
        rating: 4.6,
        numReviews: 189,
        lastMonthSales: 40,
        discountPercentage: 15,
        discountType: 'percentage' as const,
        discountValue: 15,
        hsnCode: '85165000',
        cgst: 9,
        sgst: 9,
        weightKg: 17.5,
        lengthCm: 54,
        widthCm: 44,
        heightCm: 31,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'IFB Home Appliances Direct',
        showOnHome: true,
        customDeliveryEstimate: '2-4 business days',
        image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'IFB 30 Litre Convection Microwave Oven suitable for large families. Features 101 auto-cook menus, fermentation, rotisserie, steam clean, deodorize, and multi-stage cooking with uniform heat distribution and child lock protection.',
        highlights: [
            { icon: 'Award', title: '1-Year on Machine + 3-Year on Magnetron', description: 'Extended manufacturer warranty on core components.', color: 'purple' },
            { icon: 'Sparkles', title: '101 Auto-Cook Menus', description: 'One-touch cooking programs for Indian gourmet dishes.', color: 'amber' },
            { icon: 'Truck', title: 'Safe Heavy Freight', description: 'Specialized courier handling for delicate glass appliances.', color: 'blue' }
        ]
    },

    // 6. Philips Digital Air Fryer HD9252/90
    {
        name: 'Philips Digital Air Fryer HD9252/90 (4.1L Rapid Air Technology)',
        categorySlug: 'appliances',
        brand: 'Philips',
        modelName: 'HD9252/90',
        price: 8999,
        costPrice: 6800,
        stock: 65,
        rating: 4.7,
        numReviews: 540,
        lastMonthSales: 115,
        discountPercentage: 20,
        discountType: 'percentage' as const,
        discountValue: 20,
        hsnCode: '85166000',
        cgst: 9,
        sgst: 9,
        weightKg: 5.2,
        lengthCm: 36,
        widthCm: 36,
        heightCm: 36,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Philips Domestic Appliances',
        showOnHome: true,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Philips Essential Airfryer with Rapid Air Technology fries with up to 90% less fat. Touchscreen with 7 presets including frozen snacks, fresh fries, meat, fish, chicken drumsticks, cake, and grilled vegetables. Keep warm function and NutriU recipe app integration.',
        highlights: [
            { icon: 'Heart', title: 'Up to 90% Less Fat', description: 'Crispy results without excess oil consumption.', color: 'rose' },
            { icon: 'ShieldCheck', title: '2-Year Philips Warranty', description: 'Pan-India doorstep repair and service network.', color: 'teal' },
            { icon: 'RefreshCw', title: 'Dishwasher Safe Parts', description: 'Removable non-stick basket cleans effortlessly in seconds.', color: 'emerald' }
        ]
    },

    // 7. De'Longhi Dedica Deluxe Pump Espresso Coffee Maker
    {
        name: "De'Longhi Dedica Deluxe Pump Espresso Coffee Maker (EC685M)",
        categorySlug: 'appliances',
        brand: "De'Longhi",
        modelName: 'EC685.M',
        price: 23990,
        costPrice: 18500,
        stock: 18,
        rating: 4.7,
        numReviews: 130,
        lastMonthSales: 25,
        discountPercentage: 10,
        discountType: 'percentage' as const,
        discountValue: 10,
        hsnCode: '85167100',
        cgst: 9,
        sgst: 9,
        weightKg: 4.8,
        lengthCm: 37,
        widthCm: 33,
        heightCm: 19,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'DeLonghi Official India',
        showOnHome: false,
        customDeliveryEstimate: '2-4 business days',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1520970014086-2208d157c9e2?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Slim 6-inch metal body espresso and cappuccino machine with 15-bar professional pump pressure. Thermoblock heating system reaches optimal brewing temperature in 35 seconds. Adjustable frother crafts rich, creamy froth for latte and cappuccino.',
        highlights: [
            { icon: 'Award', title: '15-Bar High Pressure', description: 'Barista-grade espresso extraction with golden crema.', color: 'purple' },
            { icon: 'ShieldCheck', title: '1-Year Brand Warranty', description: 'Authorized brand service support across India.', color: 'teal' }
        ]
    },

    // 8. Vitamix E310 Explorian Commercial Blender
    {
        name: 'Vitamix E310 Explorian Commercial Grade Blender (1.4L Container, Black)',
        categorySlug: 'appliances',
        brand: 'Vitamix',
        modelName: 'VM0197',
        price: 38900,
        costPrice: 29500,
        stock: 14,
        rating: 4.9,
        numReviews: 95,
        lastMonthSales: 18,
        discountPercentage: 8,
        discountType: 'percentage' as const,
        discountValue: 8,
        hsnCode: '85094010',
        cgst: 9,
        sgst: 9,
        weightKg: 5.8,
        lengthCm: 44,
        widthCm: 28,
        heightCm: 23,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Vitamix India Partner',
        showOnHome: false,
        customDeliveryEstimate: '3-5 business days',
        image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Variable Speed Control and Pulse feature allow you to manually fine-tune the texture of any recipe. Aircraft-grade laser-cut stainless steel blades handle tough ingredients. Powerful 2.0 peak HP motor makes smoothies, hot soups, dips, and nut butters.',
        highlights: [
            { icon: 'Zap', title: '2.0 HP Commercial Motor', description: 'Pulverizes seeds, ice, and whole fruits smoothly.', color: 'amber' },
            { icon: 'ShieldCheck', title: '5-Year Full Warranty', description: 'Comprehensive coverage from manufacturer on motor and blades.', color: 'teal' }
        ]
    },

    // 9. Philips Daily Collection 1.5L Kettle
    {
        name: 'Philips Daily Collection 1.5L Stainless Steel Electric Kettle (HD9306/06)',
        categorySlug: 'appliances',
        brand: 'Philips',
        modelName: 'HD9306/06',
        price: 2195,
        costPrice: 1550,
        stock: 90,
        rating: 4.6,
        numReviews: 820,
        lastMonthSales: 210,
        discountPercentage: 25,
        discountType: 'percentage' as const,
        discountValue: 25,
        hsnCode: '85167920',
        cgst: 9,
        sgst: 9,
        weightKg: 1.2,
        lengthCm: 23,
        widthCm: 20,
        heightCm: 18,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Philips Domestic Appliances',
        showOnHome: true,
        customDeliveryEstimate: '1-2 business days',
        image: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Food-grade stainless steel body with concealed heating element ensures fast boiling and easy cleaning. 360-degree cordless pirouette base, steam sensor, dry boiling and overheating prevention, and wide opening lid for hassle-free filling.',
        highlights: [
            { icon: 'ShieldCheck', title: '2-Year Warranty', description: 'Guaranteed by Philips service centers across India.', color: 'teal' },
            { icon: 'Award', title: 'Food Grade 304 Steel', description: '100% hygienic water boiling with no plastic odors.', color: 'purple' }
        ]
    },

    // 10. Dyson Purifier Cool Gen1 TP10
    {
        name: 'Dyson Purifier Cool Gen1 TP10 Smart Air Purifier & Fan',
        categorySlug: 'appliances',
        brand: 'Dyson',
        modelName: 'TP10',
        price: 32900,
        costPrice: 26000,
        stock: 20,
        rating: 4.8,
        numReviews: 165,
        lastMonthSales: 38,
        discountPercentage: 12,
        discountType: 'percentage' as const,
        discountValue: 12,
        hsnCode: '84213920',
        cgst: 9,
        sgst: 9,
        weightKg: 6.9,
        lengthCm: 110,
        widthCm: 26,
        heightCm: 26,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Dyson India Flagship',
        showOnHome: false,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Automatically senses and captures 99.95% of pollutants as small as 0.1 microns. Air Multiplier technology projects purified air throughout the entire room. 350-degree oscillation with quiet night mode and magnetic curved remote control.',
        highlights: [
            { icon: 'ShieldCheck', title: 'HEPA H13 Filtration', description: 'Sealed filtration traps pollen, smoke, dust, and VOC gases.', color: 'emerald' },
            { icon: 'Award', title: '2-Year Dyson Warranty', description: 'In-home demo and warranty service provided.', color: 'purple' }
        ]
    },

    // 11. Dyson V12 Detect Slim Vacuum
    {
        name: 'Dyson V12 Detect Slim Total Clean Cordless Vacuum Cleaner',
        categorySlug: 'appliances',
        brand: 'Dyson',
        modelName: '368340-01',
        price: 49900,
        costPrice: 39500,
        stock: 15,
        rating: 4.9,
        numReviews: 220,
        lastMonthSales: 32,
        discountPercentage: 10,
        discountType: 'percentage' as const,
        discountValue: 10,
        hsnCode: '85081100',
        cgst: 9,
        sgst: 9,
        weightKg: 4.5,
        lengthCm: 81,
        widthCm: 28,
        heightCm: 16,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Dyson India Flagship',
        showOnHome: false,
        customDeliveryEstimate: '2-4 business days',
        image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Laser reveals invisible microscopic dust on hard floors. Piezo sensor continuously sizes and counts dust particles, automatically ramping up suction power when needed. LCD screen displays scientific proof of a deep clean in real time.',
        highlights: [
            { icon: 'Zap', title: 'Laser Illumination', description: 'Reveals hidden dust on tiles, wood, and marble.', color: 'amber' },
            { icon: 'ShieldCheck', title: '2-Year Warranty', description: 'Original Dyson warranty including battery and motor.', color: 'teal' }
        ]
    },

    // 12. Keychron K2 Wireless Mechanical Keyboard
    {
        name: 'Keychron K2 Wireless Mechanical Keyboard (Version 2, RGB Backlit, Gateron Brown)',
        categorySlug: 'computers-peripherals',
        brand: 'Keychron',
        modelName: 'K2-V2',
        price: 8499,
        costPrice: 6200,
        stock: 40,
        rating: 4.8,
        numReviews: 215,
        lastMonthSales: 72,
        discountPercentage: 10,
        discountType: 'percentage' as const,
        discountValue: 10,
        hsnCode: '84716040',
        cgst: 9,
        sgst: 9,
        weightKg: 0.98,
        lengthCm: 34,
        widthCm: 16,
        heightCm: 5,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Keychron India Direct',
        showOnHome: true,
        customDeliveryEstimate: '1-3 business days',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Keychron K2 is a super tactile 75% layout wireless or wired mechanical keyboard engineered for Mac and Windows. Connects up to 3 devices via Bluetooth 5.1 with 4000mAh long-lasting battery, hot-swappable switches, and 18 types of RGB backlighting.',
        highlights: [
            { icon: 'Zap', title: 'Bluetooth 5.1 & Type-C', description: 'Pairs seamlessly with 3 devices with instant switching.', color: 'blue' },
            { icon: 'Sparkles', title: 'RGB Backlighting', description: '18 dynamic RGB lighting effects with adjustable brightness.', color: 'violet' },
            { icon: 'ShieldCheck', title: '1-Year Warranty', description: 'Genuine replacement warranty on switches and PCB.', color: 'teal' }
        ]
    },

    // 13. Logitech G PRO X Mechanical Gaming Keyboard
    {
        name: 'Logitech G PRO X Mechanical Gaming Keyboard (RGB Lightsync, GX Blue Clicky)',
        categorySlug: 'computers-peripherals',
        brand: 'Logitech G',
        modelName: 'G-PK-002',
        price: 11995,
        costPrice: 8900,
        stock: 30,
        rating: 4.7,
        numReviews: 160,
        lastMonthSales: 38,
        discountPercentage: 15,
        discountType: 'percentage' as const,
        discountValue: 15,
        hsnCode: '84716040',
        cgst: 9,
        sgst: 9,
        weightKg: 1.15,
        lengthCm: 38,
        widthCm: 17,
        heightCm: 5,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Logitech Official Store',
        showOnHome: false,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Pro-tested, tournament-proven compact tenkeyless design with user-swappable pro-grade switches. Detachable micro USB cable, rubber feet with three-step angle adjustment, and Lightsync RGB lighting with onboard profile storage.',
        highlights: [
            { icon: 'Award', title: 'Esports Tournament Grade', description: 'Compact TKL format frees desk space for mouse flicks.', color: 'purple' },
            { icon: 'ShieldCheck', title: '2-Year Limited Warranty', description: 'Supported by Logitech India official service points.', color: 'teal' }
        ]
    },

    // 14. Logitech G502 HERO Gaming Mouse
    {
        name: 'Logitech G502 HERO High Performance Gaming Mouse (25K Sensor)',
        categorySlug: 'computers-peripherals',
        brand: 'Logitech G',
        modelName: '910-005472',
        price: 4295,
        costPrice: 3100,
        stock: 80,
        rating: 4.8,
        numReviews: 950,
        lastMonthSales: 190,
        discountPercentage: 20,
        discountType: 'percentage' as const,
        discountValue: 20,
        hsnCode: '84716060',
        cgst: 9,
        sgst: 9,
        weightKg: 0.32,
        lengthCm: 17,
        widthCm: 11,
        heightCm: 5,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Logitech Official Store',
        showOnHome: true,
        customDeliveryEstimate: '1-2 business days',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Hero 25K optical sensor with sub-micron precision, 11 customizable buttons with onboard memory, adjustable weight system with five 3.6g weights, mechanical switch button tensioning, and programmable Lightsync RGB.',
        highlights: [
            { icon: 'Zap', title: '25,600 DPI HERO Sensor', description: 'Zero smoothing, zero filtering, 400+ IPS tracking.', color: 'blue' },
            { icon: 'ShieldCheck', title: '2-Year Brand Warranty', description: 'Direct Logitech replacement warranty.', color: 'teal' }
        ]
    },

    // 15. Sony PlayStation 5 Slim
    {
        name: 'Sony PlayStation 5 Slim Console (Digital Edition, 1TB SSD)',
        categorySlug: 'computers-peripherals',
        brand: 'Sony',
        modelName: 'CFI-2008B01X',
        price: 44990,
        costPrice: 38500,
        stock: 35,
        rating: 4.9,
        numReviews: 720,
        lastMonthSales: 145,
        discountPercentage: 5,
        discountType: 'percentage' as const,
        discountValue: 5,
        hsnCode: '95045000',
        cgst: 9,
        sgst: 9,
        weightKg: 4.6,
        lengthCm: 43,
        widthCm: 36,
        heightCm: 14,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Sony Center Official',
        showOnHome: true,
        customDeliveryEstimate: 'Next-day dispatch',
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Slim console design packs powerful gaming technology inside a sleek and compact profile. 1TB ultra-high speed SSD storage, Ray Tracing, 4K-TV gaming at up to 120 fps, Tempest 3D AudioTech, and haptic feedback via DualSense wireless controller.',
        highlights: [
            { icon: 'Zap', title: 'Ultra-High Speed 1TB SSD', description: 'Near-instant load times for installed PS5 games.', color: 'violet' },
            { icon: 'ShieldCheck', title: '1-Year Sony India Warranty', description: 'Full coverage by Sony service center network.', color: 'teal' },
            { icon: 'Award', title: 'DualSense Controller Included', description: 'Adaptive triggers and haptic feedback.', color: 'purple' }
        ]
    },

    // 16. SanDisk 1TB Extreme Portable SSD
    {
        name: 'SanDisk 1TB Extreme Portable External SSD (Up to 1050MB/s, USB 3.2 Gen 2)',
        categorySlug: 'computers-peripherals',
        brand: 'SanDisk',
        modelName: 'SDSSDE61-1T00-G25',
        price: 9899,
        costPrice: 7500,
        stock: 70,
        rating: 4.8,
        numReviews: 640,
        lastMonthSales: 140,
        discountPercentage: 18,
        discountType: 'percentage' as const,
        discountValue: 18,
        hsnCode: '84717020',
        cgst: 9,
        sgst: 9,
        weightKg: 0.18,
        lengthCm: 14,
        widthCm: 10,
        heightCm: 3,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'SanDisk Storage Hub',
        showOnHome: false,
        customDeliveryEstimate: '1-2 business days',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Fast NVMe solid state performance featuring 1050MB/s read and 1000MB/s write speeds in a portable, high-capacity drive. Up to two-meter drop protection and IP55 water and dust resistance with handy carabiner loop.',
        highlights: [
            { icon: 'Zap', title: '1050 MB/s NVMe Speed', description: 'Move high-res photos and 4K video files in seconds.', color: 'amber' },
            { icon: 'ShieldCheck', title: '5-Year Limited Warranty', description: 'Long-term reliability and data protection warranty.', color: 'teal' }
        ]
    },

    // 17. Nike Air Zoom Pegasus 40 Shoes
    {
        name: 'Nike Air Zoom Pegasus 40 Running Shoes (Midnight Navy / White)',
        categorySlug: 'footwear-apparel',
        brand: 'Nike',
        modelName: 'DV3853-400',
        price: 10495,
        costPrice: 7200,
        stock: 55,
        rating: 4.8,
        numReviews: 410,
        lastMonthSales: 95,
        discountPercentage: 10,
        discountType: 'percentage' as const,
        discountValue: 10,
        hsnCode: '64041100',
        cgst: 9,
        sgst: 9,
        weightKg: 0.85,
        lengthCm: 33,
        widthCm: 22,
        heightCm: 12,
        packQuantity: 1,
        packUnit: 'Pair',
        seller: 'Nike India Flagship',
        showOnHome: true,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'A springy ride for every run, the familiar, just-for-you feel of the Peg returns to help you accomplish your goals. This edition has the same responsiveness you love, but better comfort in sensitive areas like the arch and toes.',
        highlights: [
            { icon: 'Award', title: 'Nike React Foam & Zoom Air', description: 'Double Zoom Air units deliver energized push-off.', color: 'purple' },
            { icon: 'RefreshCw', title: 'Easy 7-Day Size Exchange', description: 'Free door-to-door exchange for fit issues.', color: 'emerald' },
            { icon: 'ShieldCheck', title: '100% Authentic Product', description: 'Genuine Nike shoes with original barcode box.', color: 'teal' }
        ]
    },

    // 18. Adidas Ultraboost Light Shoes
    {
        name: 'Adidas Ultraboost Light Running Shoes (Core Black)',
        categorySlug: 'footwear-apparel',
        brand: 'Adidas',
        modelName: 'HQ6351',
        price: 14999,
        costPrice: 10500,
        stock: 35,
        rating: 4.7,
        numReviews: 280,
        lastMonthSales: 62,
        discountPercentage: 15,
        discountType: 'percentage' as const,
        discountValue: 15,
        hsnCode: '64041100',
        cgst: 9,
        sgst: 9,
        weightKg: 0.88,
        lengthCm: 34,
        widthCm: 23,
        heightCm: 13,
        packQuantity: 1,
        packUnit: 'Pair',
        seller: 'Adidas Flagship Store',
        showOnHome: true,
        customDeliveryEstimate: '2-4 business days',
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Experience epic energy with the Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of adidas BOOST. Continental rubber outsole provides extraordinary traction.',
        highlights: [
            { icon: 'Zap', title: 'Ultralight BOOST Cushioning', description: '30% lighter BOOST material with maximum energy return.', color: 'blue' },
            { icon: 'RefreshCw', title: 'Hassle-Free Size Exchange', description: 'Exchange for different size within 7 days.', color: 'emerald' }
        ]
    },

    // 19. Puma Velocity Nitro 2 Shoes
    {
        name: "Puma Velocity Nitro 2 Men's Running Shoes (Puma Black / Sunset Glow)",
        categorySlug: 'footwear-apparel',
        brand: 'Puma',
        modelName: '376261-01',
        price: 8999,
        costPrice: 6100,
        stock: 40,
        rating: 4.7,
        numReviews: 190,
        lastMonthSales: 50,
        discountPercentage: 20,
        discountType: 'percentage' as const,
        discountValue: 20,
        hsnCode: '64041100',
        cgst: 9,
        sgst: 9,
        weightKg: 0.82,
        lengthCm: 33,
        widthCm: 21,
        heightCm: 12,
        packQuantity: 1,
        packUnit: 'Pair',
        seller: 'Puma India Official',
        showOnHome: false,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'An all-in-one neutral running shoe for any distance, the Velocity Nitro 2 is a lightweight and responsive upgrade to the Run PUMA roster. Featuring NITRO foam for exceptional responsiveness and ultimate cushioning, and durable PUMAGRIP rubber outsole.',
        highlights: [
            { icon: 'Zap', title: 'NITRO Advanced Foam', description: 'Superior responsiveness and lightweight cushioning.', color: 'amber' },
            { icon: 'ShieldCheck', title: '100% Genuine Puma', description: 'Sealed box with verifiable authenticity tag.', color: 'teal' }
        ]
    },

    // 20. Peak Design Everyday Backpack 20L
    {
        name: 'Peak Design Everyday Backpack 20L (Charcoal V2)',
        categorySlug: 'footwear-apparel',
        brand: 'Peak Design',
        modelName: 'BEDB-20-CH-2',
        price: 26500,
        costPrice: 19800,
        stock: 25,
        rating: 4.9,
        numReviews: 110,
        lastMonthSales: 22,
        discountPercentage: 5,
        discountType: 'percentage' as const,
        discountValue: 5,
        hsnCode: '42029200',
        cgst: 9,
        sgst: 9,
        weightKg: 2.1,
        lengthCm: 50,
        widthCm: 35,
        heightCm: 20,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Peak Design Authorized Store',
        showOnHome: false,
        customDeliveryEstimate: '2-4 business days',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Iconic, multi-award-winning pack for everyday and photo carry. Fast, secure MagLatch top access, dual weatherproof side zips, customizable FlexFold dividers, dedicated padded sleeve for up to 15-inch laptops, and 100% recycled 400D weatherproof nylon canvas shell.',
        highlights: [
            { icon: 'Award', title: 'Lifetime Warranty', description: 'Guaranteed against manufacturing defects for life.', color: 'purple' },
            { icon: 'ShieldCheck', title: 'Weatherproof 400D Nylon', description: 'Keeps camera and laptop safe from downpours.', color: 'teal' }
        ]
    },

    // 21. Sony WH-1000XM5 Wireless Headphones
    {
        name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones (Black)',
        categorySlug: 'audio-sound',
        brand: 'Sony',
        modelName: 'WH-1000XM5/B',
        price: 29990,
        costPrice: 23500,
        stock: 42,
        rating: 4.9,
        numReviews: 680,
        lastMonthSales: 110,
        discountPercentage: 14,
        discountType: 'percentage' as const,
        discountValue: 14,
        hsnCode: '85183000',
        cgst: 9,
        sgst: 9,
        weightKg: 0.72,
        lengthCm: 25,
        widthCm: 22,
        heightCm: 8,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Sony Center Official',
        showOnHome: true,
        customDeliveryEstimate: '1-2 business days',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Industry-leading noise cancellation with two processors and 8 microphones. Specially developed 30mm driver unit with carbon fiber composite material gives natural sound quality. Crystal clear hands-free calling with 4 beamforming microphones and AI-based noise reduction.',
        highlights: [
            { icon: 'Award', title: 'Industry-Leading ANC', description: 'Dual processors block out traffic and airplane noise.', color: 'purple' },
            { icon: 'Clock', title: '30-Hour Battery Life', description: 'Up to 30 hours playback with 3-minute quick charge.', color: 'amber' },
            { icon: 'ShieldCheck', title: '1-Year Sony Warranty', description: 'Official service coverage at all Sony service centers.', color: 'teal' }
        ]
    },

    // 22. Apple AirPods Pro (2nd Gen, USB-C)
    {
        name: 'Apple AirPods Pro (2nd Generation, MagSafe Case USB-C)',
        categorySlug: 'audio-sound',
        brand: 'Apple',
        modelName: 'MTJV3HN/A',
        price: 24900,
        costPrice: 20500,
        stock: 58,
        rating: 4.8,
        numReviews: 512,
        lastMonthSales: 130,
        discountPercentage: 6,
        discountType: 'percentage' as const,
        discountValue: 6,
        hsnCode: '85183000',
        cgst: 9,
        sgst: 9,
        weightKg: 0.26,
        lengthCm: 10,
        widthCm: 10,
        heightCm: 4.5,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Apple Authorized Store',
        showOnHome: true,
        customDeliveryEstimate: 'Next-day delivery available',
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Apple-designed H2 chip delivers up to 2x more Active Noise Cancellation, Adaptive Audio that tailors noise control to your environment, Transparency mode, and Personalized Spatial Audio with dynamic head tracking.',
        highlights: [
            { icon: 'Zap', title: 'Apple H2 Silicon', description: 'Intelligent noise reduction and three-dimensional sound.', color: 'violet' },
            { icon: 'ShieldCheck', title: '1-Year Apple Warranty', description: 'Global hardware coverage and AppleCare+ support.', color: 'teal' }
        ]
    },

    // 23. Sonos Era 100 Smart Speaker
    {
        name: 'Sonos Era 100 Smart Wireless Multi-Room Speaker (Black)',
        categorySlug: 'audio-sound',
        brand: 'Sonos',
        modelName: 'E10G1US1BLK',
        price: 29999,
        costPrice: 22800,
        stock: 26,
        rating: 4.8,
        numReviews: 120,
        lastMonthSales: 30,
        discountPercentage: 8,
        discountType: 'percentage' as const,
        discountValue: 8,
        hsnCode: '85182200',
        cgst: 9,
        sgst: 9,
        weightKg: 2.6,
        lengthCm: 24,
        widthCm: 18,
        heightCm: 18,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Sonos India Official',
        showOnHome: false,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Next-gen acoustics with dual angled tweeters and larger woofer for detailed stereo sound and deep bass. Stream from all your favorite services via Wi-Fi, Bluetooth, or 3.5mm line-in with USB-C adapter. Trueplay tuning analyzes your room acoustics.',
        highlights: [
            { icon: 'Award', title: 'Acoustic Stereo Architecture', description: 'Separate left and right channels for spacious soundstage.', color: 'purple' },
            { icon: 'ShieldCheck', title: '1-Year Sonos Warranty', description: 'Full official manufacturer warranty coverage.', color: 'teal' }
        ]
    },

    // 24. Sony Alpha 7 IV Mirrorless Camera
    {
        name: 'Sony Alpha 7 IV Full-Frame Mirrorless Camera (Body Only, 33MP)',
        categorySlug: 'audio-sound',
        brand: 'Sony',
        modelName: 'ILCE-7M4',
        price: 214990,
        costPrice: 185000,
        stock: 12,
        rating: 4.9,
        numReviews: 85,
        lastMonthSales: 16,
        discountPercentage: 7,
        discountType: 'percentage' as const,
        discountValue: 7,
        hsnCode: '85258900',
        cgst: 9,
        sgst: 9,
        weightKg: 1.4,
        lengthCm: 24,
        widthCm: 18,
        heightCm: 14,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Sony Center Official',
        showOnHome: true,
        customDeliveryEstimate: 'Secure insured transit (2-3 days)',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80'
        ],
        description: '33MP full-frame Exmor R back-illuminated CMOS sensor with BIONZ XR processing engine. 4K 60p 10-bit 4:2:2 recording, real-time eye AF for humans, animals, and birds, and 5-axis optical in-body image stabilization.',
        highlights: [
            { icon: 'Award', title: '33MP Full-Frame Sensor', description: 'Ultra-high dynamic range and high-sensitivity low noise.', color: 'purple' },
            { icon: 'ShieldCheck', title: '2-Year Sony Warranty', description: 'National warranty on camera sensor, shutter, and motherboard.', color: 'teal' }
        ]
    },

    // 25. Apple MacBook Air 13-inch M3
    {
        name: 'Apple MacBook Air 13-inch M3 Chip (16GB RAM, 512GB SSD, Midnight)',
        categorySlug: 'laptops-monitors',
        brand: 'Apple',
        modelName: 'MXCV3HN/A',
        price: 134900,
        costPrice: 118000,
        stock: 20,
        rating: 4.9,
        numReviews: 230,
        lastMonthSales: 44,
        discountPercentage: 6,
        discountType: 'percentage' as const,
        discountValue: 6,
        hsnCode: '84713010',
        cgst: 9,
        sgst: 9,
        weightKg: 2.1,
        lengthCm: 34,
        widthCm: 24,
        heightCm: 5,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Apple Authorized Store',
        showOnHome: true,
        customDeliveryEstimate: '1-2 business days',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Lean, mean, M3 machine. Incredibly thin and fast MacBook Air with M3 chip, Liquid Retina display supporting 1 billion colors, 1080p FaceTime HD camera, MagSafe 3 charging, dual Thunderbolt ports, and up to 18 hours of battery life.',
        highlights: [
            { icon: 'Zap', title: 'Apple M3 Performance', description: '8-core CPU and 10-core GPU with hardware-accelerated ray tracing.', color: 'blue' },
            { icon: 'Clock', title: 'Up to 18 Hours Battery', description: 'All-day endurance without carrying a heavy charger.', color: 'amber' },
            { icon: 'ShieldCheck', title: '1-Year Apple Warranty', description: 'Doorstep repair and Apple Genius Bar service.', color: 'teal' }
        ]
    },

    // 26. LG 27-inch 4K UHD IPS Monitor
    {
        name: 'LG 27-inch 4K UHD IPS Monitor (27UP650-W, HDR400, AMD FreeSync)',
        categorySlug: 'laptops-monitors',
        brand: 'LG',
        modelName: '27UP650-W',
        price: 26999,
        costPrice: 21500,
        stock: 24,
        rating: 4.7,
        numReviews: 175,
        lastMonthSales: 35,
        discountPercentage: 18,
        discountType: 'percentage' as const,
        discountValue: 18,
        hsnCode: '85285200',
        cgst: 9,
        sgst: 9,
        weightKg: 7.8,
        lengthCm: 68,
        widthCm: 51,
        heightCm: 21,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'LG Electronics Official',
        showOnHome: false,
        customDeliveryEstimate: '2-4 business days',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
        ],
        description: '27-inch UHD 4K (3840 x 2160) IPS Display with DCI-P3 95% Color Gamut, VESA DisplayHDR 400, AMD FreeSync with dynamic action sync, height/pivot/tilt adjustable ergonomic stand, and dual HDMI + DisplayPort connectivity.',
        highlights: [
            { icon: 'Sparkles', title: 'True 4K UHD Clarity', description: '3840x2160 IPS panel with DCI-P3 95% wide color gamut.', color: 'violet' },
            { icon: 'ShieldCheck', title: '3-Year LG On-Site Warranty', description: 'Technician visit to home or office for any panel issue.', color: 'teal' }
        ]
    },

    // 27. Bosch Professional GSB 185-LI Cordless Impact Drill
    {
        name: 'Bosch Professional GSB 185-LI 18V Cordless Impact Drill & Driver Kit',
        categorySlug: 'tools-industrial',
        brand: 'Bosch',
        modelName: 'GSB 185-LI',
        price: 9999,
        costPrice: 7600,
        stock: 35,
        rating: 4.8,
        numReviews: 310,
        lastMonthSales: 60,
        discountPercentage: 22,
        discountType: 'percentage' as const,
        discountValue: 22,
        hsnCode: '84672100',
        cgst: 9,
        sgst: 9,
        weightKg: 3.2,
        lengthCm: 38,
        widthCm: 30,
        heightCm: 11,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Bosch Professional Tools',
        showOnHome: true,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Brushless motor for extended tool life and run time. Compact 177mm head length with 50 Nm peak torque. Includes two 2.0Ah lithium-ion battery packs, quick charger, and heavy-duty carry case for metal, masonry, and wood drilling.',
        highlights: [
            { icon: 'Zap', title: 'Brushless Motor Tech', description: 'Higher efficiency and 50 Nm peak torque without carbon brushes.', color: 'amber' },
            { icon: 'Award', title: 'Includes 2x 18V Batteries', description: 'Comes with two 2.0Ah Li-Ion packs and fast charger.', color: 'purple' },
            { icon: 'ShieldCheck', title: '1-Year Bosch Heavy Duty Warranty', description: 'Serviced by authorized Bosch repair centers.', color: 'teal' }
        ]
    },

    // 28. Apex Pro Ergonomic High-Back Executive Mesh Office Chair
    {
        name: 'Apex Pro Ergonomic High-Back Executive Mesh Office Chair',
        categorySlug: 'tools-industrial',
        brand: 'Apex Pro',
        modelName: 'AP-800EX',
        price: 17999,
        costPrice: 12500,
        stock: 30,
        rating: 4.7,
        numReviews: 210,
        lastMonthSales: 42,
        discountPercentage: 15,
        discountType: 'percentage' as const,
        discountValue: 15,
        hsnCode: '94013000',
        cgst: 9,
        sgst: 9,
        weightKg: 18.5,
        lengthCm: 72,
        widthCm: 68,
        heightCm: 40,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Apex Ergonomics Direct',
        showOnHome: false,
        customDeliveryEstimate: '3-5 business days',
        image: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Breathable Korean mesh backrest with dynamic adaptive lumbar support. Multi-angle synchro-tilt mechanism with lock, pneumatic height adjustment, 3D adjustable armrests, and heavy-duty nylon wheelbase certified up to 150 kg.',
        highlights: [
            { icon: 'Award', title: 'BIFMA Certified Design', description: 'Tested to exceed 100,000 cycle stress tests up to 150 kg.', color: 'purple' },
            { icon: 'ShieldCheck', title: '3-Year Frame & Gas Lift Warranty', description: 'Free part replacement for cylinders, base, and mechanism.', color: 'teal' }
        ]
    }
,
    // 29. Cisco Catalyst 1000 Switch
    {
        name: 'Cisco Catalyst 1000 Series 24-Port Gigabit Managed Switch (C1000-24T-4G-L)',
        categorySlug: 'computers-peripherals',
        brand: 'Cisco',
        modelName: 'C1000-24T-4G-L',
        price: 48500,
        costPrice: 39000,
        stock: 15,
        rating: 4.8,
        numReviews: 42,
        lastMonthSales: 18,
        discountPercentage: 5,
        discountType: 'percentage' as const,
        discountValue: 5,
        hsnCode: '85176290',
        cgst: 9,
        sgst: 9,
        weightKg: 2.8,
        lengthCm: 44,
        widthCm: 24,
        heightCm: 4.4,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Cisco Systems India',
        showOnHome: false,
        customDeliveryEstimate: '2-3 business days',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'Enterprise-grade 24x 10/100/1000 Ethernet ports with 4x 1G SFP uplinks. Enhanced security, CLI/Web UI management, silent fanless operation, and Cisco limited lifetime hardware warranty.',
        highlights: [
            { icon: 'ShieldCheck', title: 'Cisco Enhanced Limited Lifetime Warranty', description: 'Next-business-day hardware replacement coverage.', color: 'teal' },
            { icon: 'Zap', title: 'High Wire-Speed Switching', description: '56 Gbps switching bandwidth for enterprise traffic.', color: 'blue' }
        ]
    },
    // 30. Dell PowerEdge R450 Server
    {
        name: 'Dell PowerEdge R450 1U Rack Server (Intel Xeon Silver 4314, 32GB RAM, 2x 480GB SSD)',
        categorySlug: 'computers-peripherals',
        brand: 'Dell',
        modelName: 'R450-XEON',
        price: 195000,
        costPrice: 168000,
        stock: 8,
        rating: 4.9,
        numReviews: 24,
        lastMonthSales: 12,
        discountPercentage: 6,
        discountType: 'percentage' as const,
        discountValue: 6,
        hsnCode: '84715000',
        cgst: 9,
        sgst: 9,
        weightKg: 16.5,
        lengthCm: 80,
        widthCm: 48,
        heightCm: 4.3,
        packQuantity: 1,
        packUnit: 'Piece',
        seller: 'Dell Enterprise Authorized',
        showOnHome: true,
        customDeliveryEstimate: '3-5 business days',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
        images: [
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'
        ],
        description: 'High-density 1U dual-socket rack server optimized for virtualization, medium database workloads, and edge computing. Includes iDRAC9 Enterprise remote management and redundant 600W platinum hot-plug power supplies.',
        highlights: [
            { icon: 'Award', title: 'Dell ProSupport Plus', description: '3-year 24x7 mission-critical on-site hardware support.', color: 'purple' },
            { icon: 'ShieldCheck', title: 'Cyber-Resilient Architecture', description: 'Cryptographically signed firmware and Silicon Root of Trust.', color: 'teal' }
        ]
    }
];

