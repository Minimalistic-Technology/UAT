import { DeliveryService } from '../src/services/delivery.service';

async function testCarrierCalculation() {
    console.log('--- Testing B2B Real-Time Carrier Calculator & Deliverability ---');

    const testCases = [
        { pincode: '400001', name: 'Mumbai (Both Deliverable - DTDC Cheaper)', weight: 2.0 },
        { pincode: '110001', name: 'New Delhi (Both Deliverable - Metro)', weight: 35.0 },
        { pincode: '193225', name: 'Border Outpost (Blue Dart Deliverable, DTDC NOT Deliverable)', weight: 5.0 },
        { pincode: '194102', name: 'Leh Hamlet (DTDC Deliverable, Blue Dart NOT Deliverable)', weight: 5.0 },
        { pincode: '744301', name: 'Great Nicobar Island (Neither Deliverable)', weight: 2.0 }
    ];

    for (const tc of testCases) {
        console.log(`\n======================================================`);
        console.log(`📍 Test: ${tc.name} | PIN: ${tc.pincode} | Weight: ${tc.weight} KG`);
        const result = await DeliveryService.calculateCarrierRates(tc.pincode, tc.weight);
        console.log(`Location: ${result.location.city}, ${result.location.state}`);
        console.log(`Serviceable Overall: ${result.serviceable ? '✅ YES' : '❌ NO'}`);
        console.log(`System Message: "${result.message}"`);
        console.log(`Default / Pre-selected Quote: ${result.defaultQuote ? `${result.defaultQuote.carrierName} (₹${result.defaultQuote.totalFreight})` : 'NONE'}`);
        
        console.log(`Carrier Quotes Breakdown:`);
        result.quotes.forEach(q => {
            const status = q.serviceable ? `✅ Deliverable - ₹${q.totalFreight}` : `❌ NOT Deliverable (${q.unserviceableReason})`;
            const badges = [
                q.isCheapest ? '💰 CHEAPEST' : '',
                q.isRecommended ? '⭐ RECOMMENDED' : '',
                q.isFastest ? '⚡ FASTEST' : ''
            ].filter(Boolean).join(' | ');
            console.log(`  📦 [${q.code}] ${q.carrierName} (${q.serviceName}) -> ${status} ${badges ? `[${badges}]` : ''}`);
        });
    }

    console.log(`\n--- Testing checkServiceability Endpoint ---`);
    for (const pin of ['400001', '193225', '194102', '744301']) {
        const serv = await DeliveryService.checkServiceability(pin);
        console.log(`\nPIN ${pin} (${serv.location.city}): ${serv.serviceable ? '✅ Serviceable' : '❌ Unserviceable'}`);
        console.log(`Primary: ${serv.primaryPartner.name} (Serviceable: ${serv.primaryPartner.serviceable})`);
        console.log(`Message: "${serv.message}"`);
    }
}

testCarrierCalculation().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
