export interface UserSeed {
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'super_admin' | 'admin' | 'product_manager' | 'order_manager' | 'customer_support' | 'finance' | 'marketing' | 'warehouse' | 'accountant' | 'inventory_manager' | 'user';
    creditBalance?: number;
    address?: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };
    avatar?: string;
}

export const usersData: UserSeed[] = [
    // 1. Super Admin
    {
        name: 'Super Admin',
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@ddtec.com',
        phone: '+919800000001',
        role: 'super_admin',
        creditBalance: 100000,
        address: {
            street: '100 Corporate Towers, BKC',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400051',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
    },
    // 2. Admin
    {
        name: 'System Admin',
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@ddtec.com',
        phone: '+919800000002',
        role: 'admin',
        creditBalance: 50000,
        address: {
            street: '101 Kanakia Wall Street, Andheri East',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400093',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
    },
    // 3. Raj Mane (Admin)
    {
        name: 'Raj Mane',
        firstName: 'Raj',
        lastName: 'Mane',
        email: 'rajmane9594@gmail.com',
        phone: '+919594000000',
        role: 'admin',
        creditBalance: 25000,
        address: {
            street: '204 High Street Corporate Hub, Lower Parel',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400013',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    },
    // 4. Lihance Bopche (Admin)
    {
        name: 'Lihance Bopche',
        firstName: 'Lihance',
        lastName: 'Bopche',
        email: 'lihancebopche@gmail.com',
        phone: '+919876543210',
        role: 'admin',
        creditBalance: 25000,
        address: {
            street: '502 Tech Boulevard',
            city: 'Pune',
            state: 'Maharashtra',
            zip: '411014',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'
    },
    // 5. Product Manager
    {
        name: 'Product Manager',
        firstName: 'Aarav',
        lastName: 'Patel',
        email: 'product@ddtec.com',
        phone: '+919800000003',
        role: 'product_manager',
        creditBalance: 15000,
        address: {
            street: 'Floor 4, Cyber City',
            city: 'Gurugram',
            state: 'Haryana',
            zip: '122002',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80'
    },
    // 6. Order Manager
    {
        name: 'Order Manager',
        firstName: 'Rohan',
        lastName: 'Verma',
        email: 'orders@ddtec.com',
        phone: '+919800000004',
        role: 'order_manager',
        creditBalance: 10000,
        address: {
            street: 'Sector 62, Electronic City',
            city: 'Noida',
            state: 'Uttar Pradesh',
            zip: '201309',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'
    },
    // 7. Warehouse Staff (linked to Mumbai Hub in seeder)
    {
        name: 'Warehouse Manager',
        firstName: 'Sanjay',
        lastName: 'Kadam',
        email: 'warehouse@ddtec.com',
        phone: '+919800000005',
        role: 'warehouse',
        creditBalance: 5000,
        address: {
            street: 'Plot 45, Bhiwandi Logistics Park',
            city: 'Thane',
            state: 'Maharashtra',
            zip: '421302',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80'
    },
    // 8. Accountant
    {
        name: 'Lead Accountant',
        firstName: 'Kavita',
        lastName: 'Iyer',
        email: 'accountant@ddtec.com',
        phone: '+919800000006',
        role: 'accountant',
        creditBalance: 12000,
        address: {
            street: '12th Floor, World Trade Centre',
            city: 'Bengaluru',
            state: 'Karnataka',
            zip: '560055',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'
    },
    // 9. Inventory Manager
    {
        name: 'Inventory Controller',
        firstName: 'Manish',
        lastName: 'Gupta',
        email: 'inventory@ddtec.com',
        phone: '+919800000007',
        role: 'inventory_manager',
        creditBalance: 8000,
        address: {
            street: 'Logistics Zone 3, Okhla Phase II',
            city: 'New Delhi',
            state: 'Delhi',
            zip: '110020',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'
    },
    // 10. Customer Support
    {
        name: 'Support Executive',
        firstName: 'Sneha',
        lastName: 'Reddy',
        email: 'support@ddtec.com',
        phone: '+919800000008',
        role: 'customer_support',
        creditBalance: 3000,
        address: {
            street: 'Mindspace IT Park, Hitec City',
            city: 'Hyderabad',
            state: 'Telangana',
            zip: '500081',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80'
    },
    // 11. Finance
    {
        name: 'Finance Officer',
        firstName: 'Vikram',
        lastName: 'Singhania',
        email: 'finance@ddtec.com',
        phone: '+919800000009',
        role: 'finance',
        creditBalance: 20000,
        address: {
            street: 'Tower B, Express Towers, Nariman Point',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400021',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80'
    },
    // 12. Marketing
    {
        name: 'Marketing Lead',
        firstName: 'Pooja',
        lastName: 'Bansal',
        email: 'marketing@ddtec.com',
        phone: '+919800000010',
        role: 'marketing',
        creditBalance: 15000,
        address: {
            street: 'Indiranagar 100ft Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            zip: '560038',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521d?w=200&auto=format&fit=crop&q=80'
    },
    // 13. Regular User 1 (John Doe)
    {
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'user@ddtec.com',
        phone: '+919800000011',
        role: 'user',
        creditBalance: 5000,
        address: {
            street: 'Flat 402, Sunshine Heights, Powai',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400076',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    },
    // 14. Regular User 2 (Priya Sharma)
    {
        name: 'Priya Sharma',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya@ddtec.com',
        phone: '+919800000012',
        role: 'user',
        creditBalance: 3200,
        address: {
            street: 'Villa 14, Palm Meadows, Whitefield',
            city: 'Bengaluru',
            state: 'Karnataka',
            zip: '560066',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
    },
    // 15. Regular User 3 (Raj Mane - Customer account)
    {
        name: 'Raj Mane',
        firstName: 'Raj',
        lastName: 'Mane',
        email: 'rajmane5884@gmail.com',
        phone: '+919588400000',
        role: 'user',
        creditBalance: 5000,
        address: {
            street: 'A-203, Regency Meadows, Baner',
            city: 'Pune',
            state: 'Maharashtra',
            zip: '411045',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
    },
    // 16. Regular User 4 (Anushka Sen)
    {
        name: 'Anushka Sen',
        firstName: 'Anushka',
        lastName: 'Sen',
        email: 'anushkasen@gmail.com',
        phone: '+919811122233',
        role: 'user',
        creditBalance: 3000,
        address: {
            street: 'B-601, Oberoi Splendor, JVLR',
            city: 'Mumbai',
            state: 'Maharashtra',
            zip: '400060',
            country: 'India'
        },
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
    }
];
