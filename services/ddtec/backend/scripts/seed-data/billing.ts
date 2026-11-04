export interface QuotationItemSeed {
    name: string;
    price: number;
    quantity: number;
    hsnCode: string;
    unit: string;
    description: string;
    image: string;
    isActive: boolean;
    cgst: number;
    sgst: number;
}

export const quotationItemsData: QuotationItemSeed[] = [
    {
        name: 'Apple MacBook Air 13-inch M3 (16GB RAM, 512GB SSD)',
        price: 114900,
        quantity: 1,
        hsnCode: '84713010',
        unit: 'Piece',
        description: 'M3 chip with 8-core CPU and 10-core GPU, 16GB unified memory, 512GB SSD storage, Liquid Retina display with True Tone.',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        isActive: true,
        cgst: 9,
        sgst: 9
    },
    {
        name: 'LG 27-inch 4K UHD IPS Workstation Monitor (27UP650-W)',
        price: 29999,
        quantity: 1,
        hsnCode: '85285200',
        unit: 'Piece',
        description: 'Vesa DisplayHDR 400, DCI-P3 95% color gamut, height/tilt/pivot adjustable ergonomic stand, dual HDMI and DisplayPort.',
        image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
        isActive: true,
        cgst: 9,
        sgst: 9
    },
    {
        name: 'Apex Pro Ergonomic High-Back Executive Mesh Chair',
        price: 16999,
        quantity: 1,
        hsnCode: '94013000',
        unit: 'Piece',
        description: 'Breathable Korean mesh, dynamic lumbar support, multi-angle tilt lock, 3D armrests, certified up to 150kg.',
        image: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=800&auto=format&fit=crop&q=80',
        isActive: true,
        cgst: 9,
        sgst: 9
    },
    {
        name: 'Keychron K2 Wireless Mechanical Keyboard (RGB Backlit)',
        price: 8499,
        quantity: 1,
        hsnCode: '84716040',
        unit: 'Piece',
        description: '75% compact wireless mechanical keyboard, Gateron Brown tactile switches, Mac and Windows keycaps included, Bluetooth 5.1.',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
        isActive: true,
        cgst: 9,
        sgst: 9
    },
    {
        name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
        price: 29990,
        quantity: 1,
        hsnCode: '85183000',
        unit: 'Piece',
        description: 'Industry-leading noise cancellation with two processors and 8 microphones. 30-hour battery life, crystal clear hands-free calling.',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        isActive: true,
        cgst: 9,
        sgst: 9
    },
    {
        name: 'SanDisk 1TB Extreme Portable External SSD',
        price: 10499,
        quantity: 1,
        hsnCode: '84717020',
        unit: 'Piece',
        description: 'NVMe solid state performance with up to 1050MB/s read and 1000MB/s write speeds. IP55 water and dust resistance.',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80',
        isActive: true,
        cgst: 9,
        sgst: 9
    },
    {
        name: 'Bosch Professional GSB 185-LI Cordless Impact Drill Kit',
        price: 9499,
        quantity: 1,
        hsnCode: '84672100',
        unit: 'Piece',
        description: '18V brushless motor impact driver with 2x 2.0Ah lithium-ion batteries, quick charger, and heavy-duty carrying case.',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&auto=format&fit=crop&q=80',
        isActive: true,
        cgst: 9,
        sgst: 9
    },
    {
        name: 'Dyson Purifier Cool Gen1 TP10 Smart Air Purifier & Fan',
        price: 32900,
        quantity: 1,
        hsnCode: '84213920',
        unit: 'Piece',
        description: 'Fully sealed HEPA H13 filtration removes 99.95% of ultrafine particles. Air Multiplier technology projects purified air.',
        image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80',
        isActive: true,
        cgst: 9,
        sgst: 9
    }
];

export interface SavedQuotationSeed {
    title: string;
    quotationNumber: string;
    buyer: {
        name: string;
        address: string;
        gstin: string;
        stateName: string;
    };
    items: Array<{
        name: string;
        description: string;
        price: number;
        unit: string;
        quantity: number;
        cgst: number;
        sgst: number;
        hsnCode: string;
    }>;
    subtotal: number;
    cgstAmount: number;
    sgstAmount: number;
    grandTotal: number;
    notes: string;
}

export const savedQuotationsData: SavedQuotationSeed[] = [
    {
        title: 'IT Hardware Refresh for Engineering Team',
        quotationNumber: 'QT-2026-101',
        buyer: {
            name: 'Tata Consultancy Services Limited',
            address: 'TCS House, Raveline Street, Fort, Mumbai 400001',
            gstin: '27AAACT2727Q1ZW',
            stateName: 'Maharashtra'
        },
        items: [
            {
                name: 'Apple MacBook Air 13-inch M3 (16GB RAM, 512GB SSD)',
                description: 'Midnight, Apple M3 chip, 16GB Unified Memory, 512GB SSD',
                price: 114900,
                unit: 'Piece',
                quantity: 3,
                cgst: 9,
                sgst: 9,
                hsnCode: '84713010'
            },
            {
                name: 'LG 27-inch 4K UHD IPS Workstation Monitor',
                description: '27UP650-W 4K DisplayHDR 400',
                price: 29999,
                unit: 'Piece',
                quantity: 3,
                cgst: 9,
                sgst: 9,
                hsnCode: '85285200'
            }
        ],
        subtotal: 434697,
        cgstAmount: 39122.73,
        sgstAmount: 39122.73,
        grandTotal: 512942.46,
        notes: 'Price includes delivery and on-site hardware setup. Validity 30 days from issue.'
    },
    {
        title: 'Developer Workspace Peripherals & Audio',
        quotationNumber: 'QT-2026-102',
        buyer: {
            name: 'Infosys Limited',
            address: 'Electronics City Phase 1, Hosur Road, Bengaluru 560100',
            gstin: '29AAACI4747Q1ZV',
            stateName: 'Karnataka'
        },
        items: [
            {
                name: 'Keychron K2 Wireless Mechanical Keyboard (RGB Backlit)',
                description: 'Gateron Brown Tactile Switches, 75% compact',
                price: 8499,
                unit: 'Piece',
                quantity: 10,
                cgst: 9,
                sgst: 9,
                hsnCode: '84716040'
            },
            {
                name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
                description: 'Black, Industry-leading ANC for focused coding',
                price: 29990,
                unit: 'Piece',
                quantity: 5,
                cgst: 9,
                sgst: 9,
                hsnCode: '85183000'
            }
        ],
        subtotal: 234940,
        cgstAmount: 21144.60,
        sgstAmount: 21144.60,
        grandTotal: 277229.20,
        notes: 'Immediate dispatch available from Bengaluru Tech Logistics Hub.'
    },
    {
        title: 'Ergonomic Executive Office Seating',
        quotationNumber: 'QT-2026-103',
        buyer: {
            name: 'Tech Mahindra Limited',
            address: 'Hinjawadi Phase 3, Pune 411057',
            gstin: '27AAACM1234M1Z2',
            stateName: 'Maharashtra'
        },
        items: [
            {
                name: 'Apex Pro Ergonomic High-Back Executive Mesh Chair',
                description: 'Korean Mesh, 3D armrests, synchronized tilt',
                price: 16999,
                unit: 'Piece',
                quantity: 6,
                cgst: 9,
                sgst: 9,
                hsnCode: '94013000'
            }
        ],
        subtotal: 101994,
        cgstAmount: 9179.46,
        sgstAmount: 9179.46,
        grandTotal: 120352.92,
        notes: 'BIFMA certified seating with 3-year door-step mechanical warranty.'
    }
];

export interface InvoiceSeed {
    invoiceNumber: string;
    publicId: string;
    issueDate: Date;
    dueDate: Date;
    status: 'draft' | 'unpaid' | 'paid' | 'cancelled';
    currency: string;
    sellerDetails: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        taxId: string;
    };
    clientDetails: {
        name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        taxId?: string;
    };
    items: Array<{
        itemDescription: string;
        hsnCode: string;
        qty: number;
        price: number;
        amount: number;
    }>;
    subtotal: number;
    discount: number;
    discountType: 'fixed' | 'percentage';
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    paymentDetails: {
        bankName: string;
        accountNumber: string;
        accountName: string;
        ifscCode: string;
        upiId: string;
    };
    notes: string;
}

export const invoicesData: InvoiceSeed[] = [
    {
        invoiceNumber: 'INV-2026-001',
        publicId: 'inv-ddtec-2026-001-paid',
        issueDate: new Date('2026-10-01'),
        dueDate: new Date('2026-10-15'),
        status: 'paid',
        currency: 'INR',
        sellerDetails: {
            name: 'DDTEC Technologies Private Limited',
            email: 'billing@ddtec.in',
            phone: '+912228500001',
            address: 'Kanakia Wall Street, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400093',
            country: 'India',
            taxId: '27AAPFU0939F1ZV'
        },
        clientDetails: {
            name: 'Tata Consultancy Services Limited',
            email: 'procurement@tcs.com',
            phone: '+912267789999',
            address: 'TCS House, Raveline Street, Fort',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400001',
            country: 'India',
            taxId: '27AAACT2727Q1ZW'
        },
        items: [
            {
                itemDescription: 'Apple iPhone 16 (128GB, Ultramarine) Enterprise Units',
                hsnCode: '85171300',
                qty: 3,
                price: 79900,
                amount: 239700
            },
            {
                itemDescription: 'Apple iPad Air 11-inch M2 (Wi-Fi, 128GB)',
                hsnCode: '84713090',
                qty: 1,
                price: 59900,
                amount: 59900
            }
        ],
        subtotal: 299600,
        discount: 0,
        discountType: 'fixed',
        taxRate: 18,
        taxAmount: 53928,
        totalAmount: 353528,
        paymentDetails: {
            bankName: 'HDFC Bank Ltd',
            accountNumber: '50200088991122',
            accountName: 'DDTEC Technologies Pvt Ltd',
            ifscCode: 'HDFC0000060',
            upiId: 'ddtec@hdfcbank'
        },
        notes: 'Payment received via NEFT Ref #N102688492019. Thank you for your business!'
    },
    {
        invoiceNumber: 'INV-2026-002',
        publicId: 'inv-ddtec-2026-002-unpaid',
        issueDate: new Date('2026-10-10'),
        dueDate: new Date('2026-10-25'),
        status: 'unpaid',
        currency: 'INR',
        sellerDetails: {
            name: 'DDTEC Technologies Private Limited',
            email: 'billing@ddtec.in',
            phone: '+912228500001',
            address: 'Kanakia Wall Street, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400093',
            country: 'India',
            taxId: '27AAPFU0939F1ZV'
        },
        clientDetails: {
            name: 'Infosys Limited',
            email: 'vendor-desk@infosys.com',
            phone: '+918028520261',
            address: 'Electronics City Phase 1, Hosur Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            zip: '560100',
            country: 'India',
            taxId: '29AAACI4747Q1ZV'
        },
        items: [
            {
                itemDescription: 'Apple MacBook Air 13-inch M3 Chip (16GB RAM, 512GB SSD)',
                hsnCode: '84713010',
                qty: 2,
                price: 114900,
                amount: 229800
            },
            {
                itemDescription: 'LG 27-inch 4K UHD IPS Workstation Monitor',
                hsnCode: '85285200',
                qty: 2,
                price: 29999,
                amount: 59998
            }
        ],
        subtotal: 289798,
        discount: 5000,
        discountType: 'fixed',
        taxRate: 18,
        taxAmount: 51263.64,
        totalAmount: 336061.64,
        paymentDetails: {
            bankName: 'HDFC Bank Ltd',
            accountNumber: '50200088991122',
            accountName: 'DDTEC Technologies Pvt Ltd',
            ifscCode: 'HDFC0000060',
            upiId: 'ddtec@hdfcbank'
        },
        notes: 'Net 15 payment terms apply. Please remit before due date.'
    },
    {
        invoiceNumber: 'INV-2026-003',
        publicId: 'inv-ddtec-2026-003-draft',
        issueDate: new Date('2026-10-15'),
        dueDate: new Date('2026-10-30'),
        status: 'draft',
        currency: 'INR',
        sellerDetails: {
            name: 'DDTEC Technologies Private Limited',
            email: 'billing@ddtec.in',
            phone: '+912228500001',
            address: 'Kanakia Wall Street, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400093',
            country: 'India',
            taxId: '27AAPFU0939F1ZV'
        },
        clientDetails: {
            name: 'Tech Mahindra Limited',
            email: 'sourcing@techmahindra.com',
            phone: '+912066018100',
            address: 'Hinjawadi Phase 3',
            city: 'Pune',
            state: 'Maharashtra',
            zip: '411057',
            country: 'India',
            taxId: '27AAACM1234M1Z2'
        },
        items: [
            {
                itemDescription: 'Apex Pro Ergonomic High-Back Executive Mesh Office Chair',
                hsnCode: '94013000',
                qty: 4,
                price: 16999,
                amount: 67996
            }
        ],
        subtotal: 67996,
        discount: 0,
        discountType: 'fixed',
        taxRate: 18,
        taxAmount: 12239.28,
        totalAmount: 80235.28,
        paymentDetails: {
            bankName: 'HDFC Bank Ltd',
            accountNumber: '50200088991122',
            accountName: 'DDTEC Technologies Pvt Ltd',
            ifscCode: 'HDFC0000060',
            upiId: 'ddtec@hdfcbank'
        },
        notes: 'Draft quotation under procurement team review.'
    },
    {
        invoiceNumber: 'INV-2026-004',
        publicId: 'inv-ddtec-2026-004-cancelled',
        issueDate: new Date('2026-09-20'),
        dueDate: new Date('2026-10-05'),
        status: 'cancelled',
        currency: 'INR',
        sellerDetails: {
            name: 'DDTEC Technologies Private Limited',
            email: 'billing@ddtec.in',
            phone: '+912228500001',
            address: 'Kanakia Wall Street, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400093',
            country: 'India',
            taxId: '27AAPFU0939F1ZV'
        },
        clientDetails: {
            name: 'Acumen Digital LLC',
            email: 'finance@acumendigital.io',
            phone: '+14155552671',
            address: '500 Howard Street, Suite 400',
            city: 'San Francisco',
            state: 'California',
            zip: '94105',
            country: 'USA'
        },
        items: [
            {
                itemDescription: 'SanDisk 1TB Extreme Portable External SSD',
                hsnCode: '84717020',
                qty: 5,
                price: 10499,
                amount: 52495
            }
        ],
        subtotal: 52495,
        discount: 0,
        discountType: 'fixed',
        taxRate: 18,
        taxAmount: 9449.10,
        totalAmount: 61944.10,
        paymentDetails: {
            bankName: 'HDFC Bank Ltd',
            accountNumber: '50200088991122',
            accountName: 'DDTEC Technologies Pvt Ltd',
            ifscCode: 'HDFC0000060',
            upiId: 'ddtec@hdfcbank'
        },
        notes: 'Cancelled due to change in client procurement scope.'
    }
];

export interface BillSeed {
    items: Array<{
        name: string;
        price: number;
        quantity: number;
        taxes: Array<{ name: string; rate: number }>;
        fromInventory: boolean;
    }>;
    totalAmount: number;
    customerInfo: {
        name: string;
        phone: string;
        email: string;
        address: string;
    };
    globalTax: {
        rate: number;
        amount: number;
    };
    source: string;
}

export const billsData: BillSeed[] = [
    {
        items: [
            {
                name: 'Apple iPhone 16 (128GB, Ultramarine)',
                price: 79900,
                quantity: 1,
                taxes: [{ name: 'GST 18%', rate: 18 }],
                fromInventory: true
            }
        ],
        totalAmount: 79900,
        customerInfo: {
            name: 'Ramesh Sharma',
            phone: '+919820998877',
            email: 'ramesh.sharma@gmail.com',
            address: 'Andheri West, Mumbai'
        },
        globalTax: {
            rate: 18,
            amount: 12188.14
        },
        source: 'retail_pos'
    },
    {
        items: [
            {
                name: 'Keychron K2 Wireless Mechanical Keyboard',
                price: 8499,
                quantity: 1,
                taxes: [{ name: 'GST 18%', rate: 18 }],
                fromInventory: true
            },
            {
                name: 'Logitech G502 HERO High Performance Gaming Mouse',
                price: 3999,
                quantity: 1,
                taxes: [{ name: 'GST 18%', rate: 18 }],
                fromInventory: true
            }
        ],
        totalAmount: 12498,
        customerInfo: {
            name: 'Anita Rao',
            phone: '+919833445566',
            email: 'anita.rao@gmail.com',
            address: 'Indiranagar, Bengaluru'
        },
        globalTax: {
            rate: 18,
            amount: 1906.47
        },
        source: 'retail_pos'
    },
    {
        items: [
            {
                name: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
                price: 29990,
                quantity: 1,
                taxes: [{ name: 'GST 18%', rate: 18 }],
                fromInventory: true
            }
        ],
        totalAmount: 29990,
        customerInfo: {
            name: 'Vikas Joshi',
            phone: '+919811223344',
            email: 'vikas.j@outlook.com',
            address: 'Connaught Place, New Delhi'
        },
        globalTax: {
            rate: 18,
            amount: 4574.75
        },
        source: 'retail_pos'
    }
];

export interface ExpenseSeed {
    title: string;
    description: string;
    amount: number;
    category: string;
    date: Date;
    receiptUrl?: string;
}

export const expensesData: ExpenseSeed[] = [
    {
        title: 'Mumbai Central Dark Store Commercial Lease',
        description: 'Monthly rent for Andheri distribution facility including security and maintenance',
        amount: 85000,
        category: 'Logistics',
        date: new Date('2026-10-01')
    },
    {
        title: 'AWS Cloud & Database Hosting Infrastructure',
        description: 'Amazon Web Services ECS, MongoDB Atlas cluster, and Upstash Redis subscription',
        amount: 32450,
        category: 'Cloud Infrastructure',
        date: new Date('2026-10-05')
    },
    {
        title: 'BlueDart Express Domestic Freight Settlement',
        description: 'Consolidated door-to-door courier dispatch fees for September shipments',
        amount: 48900,
        category: 'Shipping',
        date: new Date('2026-10-10')
    },
    {
        title: 'Google Workspace & Slack Enterprise Subscriptions',
        description: '35 internal staff productivity and communication seats',
        amount: 18500,
        category: 'Software Licenses',
        date: new Date('2026-10-12')
    },
    {
        title: 'Heavy Duty Corrugated Boxes & Bubble Cushion Rolls',
        description: 'B2B safe transit packaging materials for fragile electronics',
        amount: 14200,
        category: 'Supplies',
        date: new Date('2026-10-14')
    },
    {
        title: 'Q3 Search Engine & LinkedIn Sponsored Ads',
        description: 'Targeted B2B campaign for IT procurement directors in metro areas',
        amount: 65000,
        category: 'Marketing',
        date: new Date('2026-10-15')
    }
];
