export interface HubSeed {
    name: string;
    code: string;
    address: string;
    city: string;
    pincodes: string[];
    isActive: boolean;
    contactPhone: string;
    contactEmail: string;
}

export const hubsData: HubSeed[] = [
    {
        name: 'Mumbai Central Dark Store',
        code: 'MUM-01',
        address: 'Unit 4B, Kanakia Industrial Park, Andheri-Kurla Road',
        city: 'Mumbai',
        pincodes: ['400001', '400013', '400051', '400069', '400072', '400076', '400093'],
        isActive: true,
        contactPhone: '+912228500001',
        contactEmail: 'mumbai.hub@ddtec.in'
    },
    {
        name: 'Delhi NCR Fulfillment Hub',
        code: 'DEL-01',
        address: 'Warehouse Complex 12, Kapashera Border, Aerocity',
        city: 'New Delhi',
        pincodes: ['110001', '110020', '110037', '110045', '110092', '122002'],
        isActive: true,
        contactPhone: '+911123400002',
        contactEmail: 'delhi.hub@ddtec.in'
    },
    {
        name: 'Bengaluru Tech Logistics Hub',
        code: 'BLR-01',
        address: 'Plot 78, Electronic City Phase 1, Hosur Main Road',
        city: 'Bengaluru',
        pincodes: ['560001', '560034', '560038', '560066', '560100', '560103'],
        isActive: true,
        contactPhone: '+918025600003',
        contactEmail: 'blr.hub@ddtec.in'
    },
    {
        name: 'Pune Express Distribution Hub',
        code: 'PUN-01',
        address: 'Survey 44, MIDC Industrial Area, Chakan-Bhosari Link Road',
        city: 'Pune',
        pincodes: ['411001', '411014', '411028', '411045', '411057'],
        isActive: true,
        contactPhone: '+912027400004',
        contactEmail: 'pune.hub@ddtec.in'
    }
];

export interface WarehouseStockSeed {
    productNameMatch: string;
    warehouseName: string;
    zoneAisle: string;
    rack: string;
    shelfRow: string;
    quantity: number;
    capacity: number;
}

export const warehouseStockData: WarehouseStockSeed[] = [
    // Mumbai Dark Store
    {
        productNameMatch: 'Apple iPhone 16',
        warehouseName: 'Mumbai Central Dark Store',
        zoneAisle: 'Zone A - Aisle 01',
        rack: 'R01',
        shelfRow: 'Shelf 1A',
        quantity: 25,
        capacity: 80
    },
    {
        productNameMatch: 'Samsung Galaxy S24 Ultra',
        warehouseName: 'Mumbai Central Dark Store',
        zoneAisle: 'Zone A - Aisle 01',
        rack: 'R01',
        shelfRow: 'Shelf 1B',
        quantity: 18,
        capacity: 60
    },
    {
        productNameMatch: 'Apple MacBook Air 13-inch',
        warehouseName: 'Mumbai Central Dark Store',
        zoneAisle: 'Zone A - Aisle 02',
        rack: 'R02',
        shelfRow: 'Shelf 2A',
        quantity: 15,
        capacity: 50
    },
    {
        productNameMatch: 'Sony WH-1000XM5',
        warehouseName: 'Mumbai Central Dark Store',
        zoneAisle: 'Zone B - Aisle 03',
        rack: 'R01',
        shelfRow: 'Shelf 3A',
        quantity: 30,
        capacity: 100
    },
    {
        productNameMatch: 'Keychron K2',
        warehouseName: 'Mumbai Central Dark Store',
        zoneAisle: 'Zone B - Aisle 02',
        rack: 'R03',
        shelfRow: 'Shelf 2B',
        quantity: 35,
        capacity: 120
    },
    {
        productNameMatch: 'Bosch Professional GSB 185-LI',
        warehouseName: 'Mumbai Central Dark Store',
        zoneAisle: 'Zone C - Aisle 05',
        rack: 'R04',
        shelfRow: 'Shelf 1A',
        quantity: 20,
        capacity: 50
    },
    // Delhi NCR Fulfillment Hub
    {
        productNameMatch: 'Apple iPhone 16',
        warehouseName: 'Delhi NCR Fulfillment Hub',
        zoneAisle: 'Zone D - Aisle 01',
        rack: 'R01',
        shelfRow: 'Shelf 1A',
        quantity: 15,
        capacity: 80
    },
    {
        productNameMatch: 'LG 27-inch 4K UHD',
        warehouseName: 'Delhi NCR Fulfillment Hub',
        zoneAisle: 'Zone D - Aisle 04',
        rack: 'R02',
        shelfRow: 'Shelf 1B',
        quantity: 12,
        capacity: 40
    },
    {
        productNameMatch: 'Sony PlayStation 5 Slim',
        warehouseName: 'Delhi NCR Fulfillment Hub',
        zoneAisle: 'Zone D - Aisle 03',
        rack: 'R01',
        shelfRow: 'Shelf 2A',
        quantity: 10,
        capacity: 40
    },
    {
        productNameMatch: 'Dyson V12 Detect Slim',
        warehouseName: 'Delhi NCR Fulfillment Hub',
        zoneAisle: 'Zone D - Aisle 02',
        rack: 'R03',
        shelfRow: 'Shelf 1A',
        quantity: 8,
        capacity: 30
    },
    // Bengaluru Tech Logistics Hub
    {
        productNameMatch: 'Apple MacBook Air 13-inch',
        warehouseName: 'Bengaluru Tech Logistics Hub',
        zoneAisle: 'Zone B - Aisle 01',
        rack: 'R01',
        shelfRow: 'Shelf 1A',
        quantity: 20,
        capacity: 80
    },
    {
        productNameMatch: 'Apple iPad Air 11-inch',
        warehouseName: 'Bengaluru Tech Logistics Hub',
        zoneAisle: 'Zone B - Aisle 01',
        rack: 'R01',
        shelfRow: 'Shelf 1B',
        quantity: 22,
        capacity: 100
    },
    {
        productNameMatch: 'SanDisk 1TB Extreme',
        warehouseName: 'Bengaluru Tech Logistics Hub',
        zoneAisle: 'Zone B - Aisle 02',
        rack: 'R02',
        shelfRow: 'Shelf 1A',
        quantity: 50,
        capacity: 200
    },
    {
        productNameMatch: 'Logitech G PRO X',
        warehouseName: 'Bengaluru Tech Logistics Hub',
        zoneAisle: 'Zone B - Aisle 03',
        rack: 'R03',
        shelfRow: 'Shelf 2A',
        quantity: 28,
        capacity: 100
    },
    // Pune Express Distribution Hub
    {
        productNameMatch: 'Apex Pro Ergonomic',
        warehouseName: 'Pune Express Distribution Hub',
        zoneAisle: 'Zone P - Aisle 01',
        rack: 'R05',
        shelfRow: 'Bay 1',
        quantity: 15,
        capacity: 30
    },
    {
        productNameMatch: 'Nike Air Zoom Pegasus',
        warehouseName: 'Pune Express Distribution Hub',
        zoneAisle: 'Zone P - Aisle 02',
        rack: 'R02',
        shelfRow: 'Shelf 3A',
        quantity: 25,
        capacity: 60
    }
];

export interface TransferRequestSeed {
    productNameMatch: string;
    fromWarehouse: string;
    toWarehouse: string;
    quantity: number;
    status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'rejected';
    notes: string;
    completedAt?: Date;
}

export const transferRequestsData: TransferRequestSeed[] = [
    {
        productNameMatch: 'Apple iPhone 16',
        fromWarehouse: 'Mumbai Central Dark Store',
        toWarehouse: 'Pune Express Distribution Hub',
        quantity: 10,
        status: 'completed',
        notes: 'Stock replenishment for Pune festive weekend sale',
        completedAt: new Date('2026-10-12T14:30:00Z')
    },
    {
        productNameMatch: 'Apple MacBook Air 13-inch',
        fromWarehouse: 'Bengaluru Tech Logistics Hub',
        toWarehouse: 'Mumbai Central Dark Store',
        quantity: 15,
        status: 'in_transit',
        notes: 'Priority dispatch for enterprise bulk corporate booking',
    },
    {
        productNameMatch: 'Sony WH-1000XM5',
        fromWarehouse: 'Delhi NCR Fulfillment Hub',
        toWarehouse: 'Mumbai Central Dark Store',
        quantity: 8,
        status: 'approved',
        notes: 'Dark store 15-minute quick fulfillment buffer',
    },
    {
        productNameMatch: 'LG 27-inch 4K UHD',
        fromWarehouse: 'Mumbai Central Dark Store',
        toWarehouse: 'Delhi NCR Fulfillment Hub',
        quantity: 5,
        status: 'pending',
        notes: 'Inter-hub inventory balancing for northern region demand',
    },
    {
        productNameMatch: 'Apex Pro Ergonomic',
        fromWarehouse: 'Pune Express Distribution Hub',
        toWarehouse: 'Mumbai Central Dark Store',
        quantity: 20,
        status: 'rejected',
        notes: 'Rejected by warehouse manager: Mumbai bulky furniture rack capacity full.',
    }
];

export interface PurchaseRecordSeed {
    productNameMatch: string;
    seller: string;
    sellerContact: string;
    quantityAdded: number;
    unitCost: number;
    totalCost: number;
    purchaseDate: Date;
    invoiceNumber: string;
    notes: string;
}

export const purchaseRecordsData: PurchaseRecordSeed[] = [
    {
        productNameMatch: 'Apple iPhone 16',
        seller: 'Apple India Private Limited',
        sellerContact: '+91-22-6849-0000',
        quantityAdded: 50,
        unitCost: 68500,
        totalCost: 3425000,
        purchaseDate: new Date('2026-10-01'),
        invoiceNumber: 'PO-APL-2026-081',
        notes: 'Authorized wholesale consignment batch 1 with 1-year brand warranty'
    },
    {
        productNameMatch: 'Samsung Galaxy S24 Ultra',
        seller: 'Samsung Electronics India Ltd',
        sellerContact: '+91-124-488-1234',
        quantityAdded: 30,
        unitCost: 110000,
        totalCost: 3300000,
        purchaseDate: new Date('2026-10-03'),
        invoiceNumber: 'PO-SAM-2026-112',
        notes: 'Titanium Gray flagship inventory received at Mumbai Dark Store'
    },
    {
        productNameMatch: 'Apple MacBook Air 13-inch',
        seller: 'Redington India Limited',
        sellerContact: '+91-44-4224-3353',
        quantityAdded: 25,
        unitCost: 98000,
        totalCost: 2450000,
        purchaseDate: new Date('2026-10-05'),
        invoiceNumber: 'PO-RED-2026-449',
        notes: 'Enterprise M3 16GB/512GB stock intake for B2B IT fulfillment'
    },
    {
        productNameMatch: 'Sony WH-1000XM5',
        seller: 'Sony India Private Limited',
        sellerContact: '+91-11-6608-3000',
        quantityAdded: 40,
        unitCost: 22000,
        totalCost: 880000,
        purchaseDate: new Date('2026-10-07'),
        invoiceNumber: 'PO-SNY-2026-903',
        notes: 'Direct distributor carton intake, all serials scanned'
    },
    {
        productNameMatch: 'Keychron K2',
        seller: 'Ingram Micro India Private Ltd',
        sellerContact: '+91-22-6850-8000',
        quantityAdded: 60,
        unitCost: 6400,
        totalCost: 384000,
        purchaseDate: new Date('2026-10-08'),
        invoiceNumber: 'PO-ING-2026-722',
        notes: 'Wireless RGB mechanical keyboards with Gateron Brown switches'
    },
    {
        productNameMatch: 'Bosch Professional GSB 185-LI',
        seller: 'Bosch Power Tools India',
        sellerContact: '+91-80-6752-1111',
        quantityAdded: 35,
        unitCost: 7200,
        totalCost: 252000,
        purchaseDate: new Date('2026-10-10'),
        invoiceNumber: 'PO-BSH-2026-302',
        notes: 'Impact drill kits with 2x 2.0Ah batteries and hard carry case'
    }
];
