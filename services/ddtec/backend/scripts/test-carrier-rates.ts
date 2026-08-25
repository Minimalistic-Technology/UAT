import { DeliveryService } from '../src/services/delivery.service';

async function testCarrierCalculation() {
    console.log('--- Testing B2B Real-Time Carrier Calculator ---');

    const testCases = [
        { pincode: '400001', name: 'Mumbai (Local)', weight: 2.0 },
        { pincode: '400001', name: 'Mumbai (Local Bulk)', weight: 50.0 },
        { pincode: '110001', name: 'New Delhi (Metro Bulk)', weight: 35.0 },
        { pincode: '560001', name: 'Bengaluru (Metro Heavy)', weight: 120.0 },
        { pincode: '793001', name: 'Shillong (North-East Remote Bulk)', weight: 25.0 }
    ];

    for (const tc of testCases) {
        console.log(`\n📍 Pincode: ${tc.pincode} (${tc.name}) | Weight: ${tc.weight} KG`);
        const result = await DeliveryService.calculateCarrierRates(tc.pincode, tc.weight);
        console.log(`Destination: ${result.location.city}, ${result.location.state} (${result.location.zone})`);
        result.quotes.forEach(q => {
            console.log(`  📦 ${q.carrierName} [${q.serviceName}] -> ₹${q.totalFreight} (ETA: ${q.estimatedDays}) ${q.isRecommended ? '⭐ RECOMMENDED' : ''}`);
        });
    }
}

testCarrierCalculation().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
