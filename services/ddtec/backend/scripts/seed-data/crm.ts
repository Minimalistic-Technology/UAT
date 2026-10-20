export interface CompanySeed {
    name: string;
    location: string;
    gstNumber: string;
}

export const companiesData: CompanySeed[] = [
    {
        name: 'DDTEC Technologies Private Limited',
        location: 'Kanakia Wall Street, Andheri East, Mumbai, Maharashtra 400093',
        gstNumber: '27AAPFU0939F1ZV'
    },
    {
        name: 'DDTEC Enterprise Solutions Pvt Ltd',
        location: 'Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103',
        gstNumber: '29AAPFU0939F1ZW'
    },
    {
        name: 'DDTEC Logistics & Warehousing LLP',
        location: 'Aerocity Industrial Area, New Delhi, Delhi 110037',
        gstNumber: '07AAPFU0939F1ZX'
    }
];

export interface ClientSeed {
    name: string;
    phone: string;
    email: string;
    company: string;
    gstin?: string;
    currency: 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'AUD' | 'CAD' | 'SGD';
    note: string;
}

export const clientsData: ClientSeed[] = [
    {
        name: 'Tata Consultancy Services',
        phone: '+912267789999',
        email: 'procurement@tcs.com',
        company: 'Tata Consultancy Services Limited',
        gstin: '27AAACT2727Q1ZW',
        currency: 'INR',
        note: 'Tier-1 enterprise client. Bulk IT hardware refresh partner.'
    },
    {
        name: 'Infosys Limited',
        phone: '+918028520261',
        email: 'vendor-desk@infosys.com',
        company: 'Infosys Limited',
        gstin: '29AAACI4747Q1ZV',
        currency: 'INR',
        note: 'Pan-India dark store fulfillment for engineering laptops and peripherals.'
    },
    {
        name: 'Tech Mahindra Ltd',
        phone: '+912066018100',
        email: 'sourcing@techmahindra.com',
        company: 'Tech Mahindra Limited',
        gstin: '27AAACM1234M1Z2',
        currency: 'INR',
        note: 'Executive mobile device fleet upgrade & workplace audio.'
    },
    {
        name: 'Global Fintech Partners UK',
        phone: '+442079460192',
        email: 'accounts@globalfintech.uk',
        company: 'Global Fintech Partners Ltd',
        currency: 'GBP',
        note: 'UK technology firm with offshore development team in Mumbai.'
    },
    {
        name: 'Acumen Digital LLC US',
        phone: '+14155552671',
        email: 'finance@acumendigital.io',
        company: 'Acumen Digital LLC',
        currency: 'USD',
        note: 'San Francisco design agency with cross-border hardware logistics needs.'
    }
];

export interface ClientProjectSeed {
    clientCompanyName: string;
    title: string;
    status: 'ongoing' | 'completed';
    note: string;
}

export const clientProjectsData: ClientProjectSeed[] = [
    {
        clientCompanyName: 'Tata Consultancy Services Limited',
        title: 'Enterprise IT Hardware Refresh 2026',
        status: 'ongoing',
        note: 'Supply and rollout of 50+ 4K monitors and developer workstations at Mumbai campus.'
    },
    {
        clientCompanyName: 'Infosys Limited',
        title: 'Next-Gen Cloud Workstation Rollout',
        status: 'ongoing',
        note: 'Procurement of Apple M3 hardware and accessories for engineering leads.'
    },
    {
        clientCompanyName: 'Tech Mahindra Limited',
        title: 'Executive Laptop & Mobile Fleet Upgrade',
        status: 'completed',
        note: 'Delivered 25 units of flagship mobile devices and noise-cancelling headsets.'
    },
    {
        clientCompanyName: 'Global Fintech Partners Ltd',
        title: 'Offshore Engineering Hub Tech Setup',
        status: 'ongoing',
        note: 'Complete developer desk setup with mechanical keyboards, mice, and ergonomic seating.'
    },
    {
        clientCompanyName: 'Acumen Digital LLC',
        title: 'Design Studio Display Calibration & Monitors',
        status: 'completed',
        note: 'Supplied color-accurate LG 4K displays and ergonomic monitor arms.'
    }
];

export interface LeadStageSeed {
    name: string;
    color: string;
    order: number;
    isWon: boolean;
    isLost: boolean;
}

export const leadStagesData: LeadStageSeed[] = [
    { name: 'New', color: '#3b82f6', order: 0, isWon: false, isLost: false },
    { name: 'Contacted', color: '#a855f7', order: 1, isWon: false, isLost: false },
    { name: 'Qualified', color: '#f59e0b', order: 2, isWon: false, isLost: false },
    { name: 'Proposal Sent', color: '#22c55e', order: 3, isWon: false, isLost: false },
    { name: 'Won', color: '#10b981', order: 4, isWon: true, isLost: false },
    { name: 'Lost', color: '#94a3b8', order: 5, isWon: false, isLost: true }
];

export interface LeadSeed {
    name: string;
    company: string;
    email: string;
    phone: string;
    value: number;
    stageName: string;
    source: string;
    location: string;
    note: string;
}

export const leadsData: LeadSeed[] = [
    {
        name: 'Bulk Apple MacBook Air Enterprise Procurement',
        company: 'Starlight Digital Media',
        email: 'tech@starlightmedia.com',
        phone: '+919820011223',
        value: 850000,
        stageName: 'Won',
        source: 'Direct Referral',
        location: 'Mumbai',
        note: 'Contract signed for 10 units with door-step delivery and corporate GST billing.'
    },
    {
        name: 'Corporate Workstation Display Refresh',
        company: 'Cognitive AI Systems',
        email: 'procure@cognitiveai.in',
        phone: '+919830022334',
        value: 450000,
        stageName: 'Proposal Sent',
        source: 'Website Contact Form',
        location: 'Bengaluru',
        note: 'Sent formal quotation for 15x LG 4K UHD monitors. Awaiting PO approval.'
    },
    {
        name: 'Warehouse Handheld Scanner & Tablet Setup',
        company: 'Apex Freight Logistics',
        email: 'ops@apexfreight.in',
        phone: '+919840033445',
        value: 280000,
        stageName: 'Qualified',
        source: 'LinkedIn Inbound',
        location: 'Pune',
        note: 'Demonstrated barcode scanning and inventory tablet sync. Strong interest.'
    },
    {
        name: 'Executive Ergonomic Seating & Desk Refresh',
        company: 'FinEdge Wealth Advisory',
        email: 'admin@finedge.in',
        phone: '+919850044556',
        value: 175000,
        stageName: 'Contacted',
        source: 'Exhibition Expo',
        location: 'Mumbai',
        note: 'Requested fabric swatch and ergonomic trial chair at Nariman Point office.'
    },
    {
        name: 'Studio Audio & Headphone Setup',
        company: 'SoundWave Studios',
        email: 'sound@soundwave.org',
        phone: '+919860055667',
        value: 120000,
        stageName: 'New',
        source: 'Website Inbound',
        location: 'Delhi',
        note: 'Inquiry for 4x Sony WH-1000XM5 and studio reference gear.'
    },
    {
        name: 'Server Rack Cable Management Solution',
        company: 'CloudNine Data Centers',
        email: 'infra@cloudnine.net',
        phone: '+919870066778',
        value: 350000,
        stageName: 'Lost',
        source: 'Cold Outreach',
        location: 'Hyderabad',
        note: 'Client opted for incumbent global supplier due to international contract.'
    }
];

export interface CrmContactSeed {
    firstName: string;
    lastName: string;
    emails: Array<{ label: 'work' | 'personal' | 'other'; value: string }>;
    phones: Array<{ label: 'mobile' | 'work' | 'home' | 'other'; value: string }>;
    company: string;
    jobTitle: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    productInterest: string[];
    tags: string[];
    source: 'manual' | 'vcf_import' | 'csv_import';
    note: string;
}

export const crmContactsData: CrmContactSeed[] = [
    {
        firstName: 'Vikram',
        lastName: 'Malhotra',
        jobTitle: 'Chief Technology Officer',
        company: 'Infosys Limited',
        emails: [
            { label: 'work', value: 'vikram.m@infosys.com' },
            { label: 'personal', value: 'v.malhotra77@gmail.com' }
        ],
        phones: [
            { label: 'work', value: '+918028520261' },
            { label: 'mobile', value: '+919820123456' }
        ],
        address: {
            street: 'Electronics City Phase 1',
            city: 'Bengaluru',
            state: 'Karnataka',
            postalCode: '560100',
            country: 'India'
        },
        productInterest: ['Laptops & Monitors', 'Smartphones & Tablets'],
        tags: ['enterprise', 'high-value', 'c-level'],
        source: 'manual',
        note: 'Decision maker for high-performance laptops and mobile devices.'
    },
    {
        firstName: 'Sunita',
        lastName: 'Deshmukh',
        jobTitle: 'Head of Global Procurement',
        company: 'Tata Consultancy Services',
        emails: [
            { label: 'work', value: 'sunita.deshmukh@tcs.com' }
        ],
        phones: [
            { label: 'work', value: '+912267789999' },
            { label: 'mobile', value: '+919819987654' }
        ],
        address: {
            street: 'TCS House, Raveline Street, Fort',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India'
        },
        productInterest: ['Computer Peripherals & Gaming', 'Laptops & Monitors'],
        tags: ['procurement', 'corporate', 'regular-buyer'],
        source: 'manual',
        note: 'Handles purchase orders and supplier agreements for TCS India locations.'
    },
    {
        firstName: 'Rahul',
        lastName: 'Verma',
        jobTitle: 'VP IT Infrastructure',
        company: 'Tech Mahindra',
        emails: [
            { label: 'work', value: 'rahul.verma@techmahindra.com' }
        ],
        phones: [
            { label: 'mobile', value: '+919765432100' }
        ],
        address: {
            street: 'Hinjawadi Phase 3',
            city: 'Pune',
            state: 'Maharashtra',
            postalCode: '411057',
            country: 'India'
        },
        productInterest: ['Tools & Industrial', 'Audio & Sound'],
        tags: ['infra', 'hardware-lead'],
        source: 'manual',
        note: 'Focused on workspace noise cancellation and industrial networking gear.'
    },
    {
        firstName: 'Sarah',
        lastName: 'Jenkins',
        jobTitle: 'Director of Facilities & Operations',
        company: 'Global Fintech Partners UK',
        emails: [
            { label: 'work', value: 's.jenkins@globalfintech.uk' }
        ],
        phones: [
            { label: 'work', value: '+442079460192' }
        ],
        address: {
            street: '25 Bank Street, Canary Wharf',
            city: 'London',
            state: 'Greater London',
            postalCode: 'E14 5JP',
            country: 'United Kingdom'
        },
        productInterest: ['Computer Peripherals & Gaming'],
        tags: ['international', 'uk-partner'],
        source: 'manual',
        note: 'Oversees tech equipment deployment for offshore teams.'
    }
];

export interface ContactMessageSeed {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
}

export const contactMessagesData: ContactMessageSeed[] = [
    {
        firstName: 'Arun',
        lastName: 'Patel',
        email: 'arun.patel@gmail.com',
        message: 'Hi DDTEC team, looking to order 15 units of Apple MacBook Air M3 for our engineering team. Can you provide enterprise quotation with GST credit and doorstep delivery to BKC Mumbai?'
    },
    {
        firstName: 'Meera',
        lastName: 'Nair',
        email: 'meera.nair@innovate.co',
        message: 'Interested in the Dyson Purifier Cool and ergonomic office chairs. Do you offer warranty registration support for corporate bulk buys?'
    },
    {
        firstName: 'Karan',
        lastName: 'Shah',
        email: 'karan.shah@ventures.in',
        message: 'Could you share the tracking options and delivery timelines for express shipments to Ahmedabad?'
    },
    {
        firstName: 'Neha',
        lastName: 'Gupta',
        email: 'neha.g@techspark.io',
        message: 'We require commercial tax invoice under GSTIN 27AABCT3529Q1Z6. How can we submit our tax ID during checkout?'
    }
];
