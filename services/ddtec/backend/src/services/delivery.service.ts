import axios from 'axios';
import mongoose from 'mongoose';
import Hub from '../models/Hub';
import redisClient from '../config/redis';

export interface PincodeLocationInfo {
    pincode: string;
    city: string;
    state: string;
    district: string;
    region: 'North' | 'South' | 'West' | 'East' | 'Central' | 'NorthEast';
    tier: 'Metro' | 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Remote';
    zone: string;
}

export interface CourierPartnerResult {
    name: string;
    code: 'BLUEDART' | 'DTDC';
    serviceable: boolean;
    serviceType: string;
    estimatedDays: string;
    minDays: number;
    maxDays: number;
    estimatedDeliveryDate: string;
    formattedDeliveryDate: string;
    codAvailable: boolean;
    prepaidAvailable: boolean;
    expressAvailable: boolean;
    isPreferred: boolean;
    hubCode?: string;
    message?: string;
}

export interface ServiceabilityResponse {
    success: boolean;
    pincode: string;
    serviceable: boolean;
    location: PincodeLocationInfo;
    primaryPartner: CourierPartnerResult;
    partners: CourierPartnerResult[];
    localHub?: {
        available: boolean;
        hubName: string;
        hubCode: string;
        city: string;
        sameDayDelivery: boolean;
    } | null;
    message: string;
}

// Extensive Directory of Indian PIN code prefixes and mappings
const PINCODE_PREFIX_MAP: Record<string, { city: string; state: string; district: string; region: PincodeLocationInfo['region']; tier: PincodeLocationInfo['tier'] }> = {
    // Maharashtra & Goa (400 - 445)
    '400': { city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai / Suburban', region: 'West', tier: 'Metro' },
    '401': { city: 'Thane / Palghar', state: 'Maharashtra', district: 'Thane', region: 'West', tier: 'Tier 1' },
    '402': { city: 'Raigad', state: 'Maharashtra', district: 'Raigad', region: 'West', tier: 'Tier 2' },
    '403': { city: 'Panaji / Goa', state: 'Goa', district: 'North / South Goa', region: 'West', tier: 'Tier 1' },
    '404': { city: 'Sindhudurg', state: 'Maharashtra', district: 'Sindhudurg', region: 'West', tier: 'Tier 3' },
    '410': { city: 'Lonavala / Pune Rural', state: 'Maharashtra', district: 'Pune', region: 'West', tier: 'Tier 2' },
    '411': { city: 'Pune', state: 'Maharashtra', district: 'Pune', region: 'West', tier: 'Metro' },
    '412': { city: 'Pune Suburban', state: 'Maharashtra', district: 'Pune', region: 'West', tier: 'Tier 2' },
    '413': { city: 'Solapur', state: 'Maharashtra', district: 'Solapur', region: 'West', tier: 'Tier 2' },
    '414': { city: 'Ahmednagar', state: 'Maharashtra', district: 'Ahmednagar', region: 'West', tier: 'Tier 2' },
    '415': { city: 'Satara / Ratnagiri', state: 'Maharashtra', district: 'Satara', region: 'West', tier: 'Tier 2' },
    '416': { city: 'Kolhapur / Sangli', state: 'Maharashtra', district: 'Kolhapur', region: 'West', tier: 'Tier 2' },
    '421': { city: 'Kalyan / Dombivli', state: 'Maharashtra', district: 'Thane', region: 'West', tier: 'Tier 1' },
    '422': { city: 'Nashik', state: 'Maharashtra', district: 'Nashik', region: 'West', tier: 'Tier 1' },
    '423': { city: 'Malegaon', state: 'Maharashtra', district: 'Nashik', region: 'West', tier: 'Tier 2' },
    '424': { city: 'Dhule', state: 'Maharashtra', district: 'Dhule', region: 'West', tier: 'Tier 2' },
    '425': { city: 'Jalgaon', state: 'Maharashtra', district: 'Jalgaon', region: 'West', tier: 'Tier 2' },
    '431': { city: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', district: 'Aurangabad', region: 'West', tier: 'Tier 1' },
    '440': { city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', region: 'West', tier: 'Tier 1' },
    '441': { city: 'Nagpur Rural', state: 'Maharashtra', district: 'Nagpur', region: 'West', tier: 'Tier 2' },
    '444': { city: 'Amravati / Akola', state: 'Maharashtra', district: 'Amravati', region: 'West', tier: 'Tier 2' },

    // Delhi NCR (110, 121, 122, 201)
    '110': { city: 'New Delhi', state: 'Delhi', district: 'New Delhi', region: 'North', tier: 'Metro' },
    '121': { city: 'Faridabad', state: 'Haryana', district: 'Faridabad', region: 'North', tier: 'Tier 1' },
    '122': { city: 'Gurugram', state: 'Haryana', district: 'Gurugram', region: 'North', tier: 'Metro' },
    '201': { city: 'Noida / Ghaziabad', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', region: 'North', tier: 'Tier 1' },

    // Haryana & Punjab & Chandigarh (124-160)
    '124': { city: 'Rohtak', state: 'Haryana', district: 'Rohtak', region: 'North', tier: 'Tier 2' },
    '125': { city: 'Hisar', state: 'Haryana', district: 'Hisar', region: 'North', tier: 'Tier 2' },
    '131': { city: 'Sonipat', state: 'Haryana', district: 'Sonipat', region: 'North', tier: 'Tier 2' },
    '132': { city: 'Karnal / Panipat', state: 'Haryana', district: 'Karnal', region: 'North', tier: 'Tier 2' },
    '133': { city: 'Ambala', state: 'Haryana', district: 'Ambala', region: 'North', tier: 'Tier 2' },
    '134': { city: 'Panchkula', state: 'Haryana', district: 'Panchkula', region: 'North', tier: 'Tier 2' },
    '141': { city: 'Ludhiana', state: 'Punjab', district: 'Ludhiana', region: 'North', tier: 'Tier 1' },
    '143': { city: 'Amritsar', state: 'Punjab', district: 'Amritsar', region: 'North', tier: 'Tier 1' },
    '144': { city: 'Jalandhar', state: 'Punjab', district: 'Jalandhar', region: 'North', tier: 'Tier 1' },
    '147': { city: 'Patiala', state: 'Punjab', district: 'Patiala', region: 'North', tier: 'Tier 2' },
    '151': { city: 'Bathinda', state: 'Punjab', district: 'Bathinda', region: 'North', tier: 'Tier 2' },
    '160': { city: 'Chandigarh', state: 'Chandigarh', district: 'Chandigarh', region: 'North', tier: 'Tier 1' },

    // Himachal Pradesh & Jammu Kashmir & Ladakh (171-194)
    '171': { city: 'Shimla', state: 'Himachal Pradesh', district: 'Shimla', region: 'North', tier: 'Tier 2' },
    '176': { city: 'Dharamshala / Kangra', state: 'Himachal Pradesh', district: 'Kangra', region: 'North', tier: 'Tier 2' },
    '180': { city: 'Jammu', state: 'Jammu & Kashmir', district: 'Jammu', region: 'North', tier: 'Tier 1' },
    '190': { city: 'Srinagar', state: 'Jammu & Kashmir', district: 'Srinagar', region: 'North', tier: 'Tier 1' },
    '194': { city: 'Leh', state: 'Ladakh', district: 'Leh Ladakh', region: 'North', tier: 'Remote' },

    // Uttar Pradesh & Uttarakhand (202-284)
    '202': { city: 'Aligarh', state: 'Uttar Pradesh', district: 'Aligarh', region: 'North', tier: 'Tier 2' },
    '208': { city: 'Kanpur', state: 'Uttar Pradesh', district: 'Kanpur Nagar', region: 'North', tier: 'Tier 1' },
    '226': { city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', region: 'North', tier: 'Tier 1' },
    '211': { city: 'Prayagraj (Allahabad)', state: 'Uttar Pradesh', district: 'Prayagraj', region: 'North', tier: 'Tier 1' },
    '221': { city: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', region: 'North', tier: 'Tier 1' },
    '243': { city: 'Bareilly', state: 'Uttar Pradesh', district: 'Bareilly', region: 'North', tier: 'Tier 2' },
    '244': { city: 'Moradabad', state: 'Uttar Pradesh', district: 'Moradabad', region: 'North', tier: 'Tier 2' },
    '248': { city: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun', region: 'North', tier: 'Tier 1' },
    '249': { city: 'Haridwar / Rishikesh', state: 'Uttarakhand', district: 'Haridwar', region: 'North', tier: 'Tier 2' },
    '250': { city: 'Meerut', state: 'Uttar Pradesh', district: 'Meerut', region: 'North', tier: 'Tier 1' },
    '273': { city: 'Gorakhpur', state: 'Uttar Pradesh', district: 'Gorakhpur', region: 'North', tier: 'Tier 2' },
    '282': { city: 'Agra', state: 'Uttar Pradesh', district: 'Agra', region: 'North', tier: 'Tier 1' },
    '284': { city: 'Jhansi', state: 'Uttar Pradesh', district: 'Jhansi', region: 'North', tier: 'Tier 2' },

    // Rajasthan (301-344)
    '301': { city: 'Alwar', state: 'Rajasthan', district: 'Alwar', region: 'North', tier: 'Tier 2' },
    '302': { city: 'Jaipur', state: 'Rajasthan', district: 'Jaipur', region: 'North', tier: 'Metro' },
    '305': { city: 'Ajmer', state: 'Rajasthan', district: 'Ajmer', region: 'North', tier: 'Tier 2' },
    '313': { city: 'Udaipur', state: 'Rajasthan', district: 'Udaipur', region: 'North', tier: 'Tier 2' },
    '324': { city: 'Kota', state: 'Rajasthan', district: 'Kota', region: 'North', tier: 'Tier 2' },
    '334': { city: 'Bikaner', state: 'Rajasthan', district: 'Bikaner', region: 'North', tier: 'Tier 2' },
    '342': { city: 'Jodhpur', state: 'Rajasthan', district: 'Jodhpur', region: 'North', tier: 'Tier 1' },

    // Gujarat (360-396)
    '360': { city: 'Rajkot', state: 'Gujarat', district: 'Rajkot', region: 'West', tier: 'Tier 1' },
    '361': { city: 'Jamnagar', state: 'Gujarat', district: 'Jamnagar', region: 'West', tier: 'Tier 2' },
    '364': { city: 'Bhavnagar', state: 'Gujarat', district: 'Bhavnagar', region: 'West', tier: 'Tier 2' },
    '380': { city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', region: 'West', tier: 'Metro' },
    '382': { city: 'Gandhinagar', state: 'Gujarat', district: 'Gandhinagar', region: 'West', tier: 'Tier 1' },
    '388': { city: 'Anand', state: 'Gujarat', district: 'Anand', region: 'West', tier: 'Tier 2' },
    '390': { city: 'Vadodara', state: 'Gujarat', district: 'Vadodara', region: 'West', tier: 'Tier 1' },
    '395': { city: 'Surat', state: 'Gujarat', district: 'Surat', region: 'West', tier: 'Metro' },
    '396': { city: 'Vapi / Valsad', state: 'Gujarat', district: 'Valsad', region: 'West', tier: 'Tier 2' },

    // Madhya Pradesh & Chhattisgarh (450-496)
    '452': { city: 'Indore', state: 'Madhya Pradesh', district: 'Indore', region: 'Central', tier: 'Tier 1' },
    '456': { city: 'Ujjain', state: 'Madhya Pradesh', district: 'Ujjain', region: 'Central', tier: 'Tier 2' },
    '462': { city: 'Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', region: 'Central', tier: 'Tier 1' },
    '474': { city: 'Gwalior', state: 'Madhya Pradesh', district: 'Gwalior', region: 'Central', tier: 'Tier 1' },
    '482': { city: 'Jabalpur', state: 'Madhya Pradesh', district: 'Jabalpur', region: 'Central', tier: 'Tier 1' },
    '490': { city: 'Bhilai / Durg', state: 'Chhattisgarh', district: 'Durg', region: 'Central', tier: 'Tier 2' },
    '492': { city: 'Raipur', state: 'Chhattisgarh', district: 'Raipur', region: 'Central', tier: 'Tier 1' },

    // Andhra Pradesh & Telangana (500-535)
    '500': { city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', region: 'South', tier: 'Metro' },
    '501': { city: 'Ranga Reddy', state: 'Telangana', district: 'Ranga Reddy', region: 'South', tier: 'Tier 1' },
    '506': { city: 'Warangal', state: 'Telangana', district: 'Warangal', region: 'South', tier: 'Tier 2' },
    '520': { city: 'Vijayawada', state: 'Andhra Pradesh', district: 'Krishna', region: 'South', tier: 'Tier 1' },
    '522': { city: 'Guntur', state: 'Andhra Pradesh', district: 'Guntur', region: 'South', tier: 'Tier 2' },
    '524': { city: 'Nellore', state: 'Andhra Pradesh', district: 'Nellore', region: 'South', tier: 'Tier 2' },
    '530': { city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', region: 'South', tier: 'Tier 1' },
    '517': { city: 'Tirupati', state: 'Andhra Pradesh', district: 'Chittoor', region: 'South', tier: 'Tier 2' },

    // Karnataka (560-591)
    '560': { city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', region: 'South', tier: 'Metro' },
    '562': { city: 'Bengaluru Rural', state: 'Karnataka', district: 'Bengaluru Rural', region: 'South', tier: 'Tier 2' },
    '570': { city: 'Mysuru (Mysore)', state: 'Karnataka', district: 'Mysuru', region: 'South', tier: 'Tier 1' },
    '575': { city: 'Mangaluru (Mangalore)', state: 'Karnataka', district: 'Dakshina Kannada', region: 'South', tier: 'Tier 1' },
    '577': { city: 'Davanagere / Shivamogga', state: 'Karnataka', district: 'Davanagere', region: 'South', tier: 'Tier 2' },
    '580': { city: 'Hubli / Dharwad', state: 'Karnataka', district: 'Dharwad', region: 'South', tier: 'Tier 2' },
    '585': { city: 'Kalaburagi (Gulbarga)', state: 'Karnataka', district: 'Kalaburagi', region: 'South', tier: 'Tier 2' },
    '590': { city: 'Belagavi (Belgaum)', state: 'Karnataka', district: 'Belagavi', region: 'South', tier: 'Tier 2' },

    // Tamil Nadu & Puducherry & Kerala (600-695)
    '600': { city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', region: 'South', tier: 'Metro' },
    '605': { city: 'Puducherry', state: 'Puducherry', district: 'Puducherry', region: 'South', tier: 'Tier 2' },
    '620': { city: 'Tiruchirappalli (Trichy)', state: 'Tamil Nadu', district: 'Tiruchirappalli', region: 'South', tier: 'Tier 2' },
    '625': { city: 'Madurai', state: 'Tamil Nadu', district: 'Madurai', region: 'South', tier: 'Tier 1' },
    '627': { city: 'Tirunelveli', state: 'Tamil Nadu', district: 'Tirunelveli', region: 'South', tier: 'Tier 2' },
    '636': { city: 'Salem', state: 'Tamil Nadu', district: 'Salem', region: 'South', tier: 'Tier 2' },
    '638': { city: 'Erode', state: 'Tamil Nadu', district: 'Erode', region: 'South', tier: 'Tier 2' },
    '641': { city: 'Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', region: 'South', tier: 'Tier 1' },
    '682': { city: 'Kochi (Cochin)', state: 'Kerala', district: 'Ernakulam', region: 'South', tier: 'Tier 1' },
    '686': { city: 'Kottayam', state: 'Kerala', district: 'Kottayam', region: 'South', tier: 'Tier 2' },
    '691': { city: 'Kollam', state: 'Kerala', district: 'Kollam', region: 'South', tier: 'Tier 2' },
    '695': { city: 'Thiruvananthapuram (Trivandrum)', state: 'Kerala', district: 'Thiruvananthapuram', region: 'South', tier: 'Tier 1' },
    '673': { city: 'Kozhikode (Calicut)', state: 'Kerala', district: 'Kozhikode', region: 'South', tier: 'Tier 1' },

    // West Bengal & Odisha & North East (700-799)
    '700': { city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', region: 'East', tier: 'Metro' },
    '711': { city: 'Howrah', state: 'West Bengal', district: 'Howrah', region: 'East', tier: 'Tier 1' },
    '713': { city: 'Durgapur / Asansol', state: 'West Bengal', district: 'Paschim Bardhaman', region: 'East', tier: 'Tier 2' },
    '734': { city: 'Siliguri', state: 'West Bengal', district: 'Darjeeling', region: 'East', tier: 'Tier 2' },
    '751': { city: 'Bhubaneswar', state: 'Odisha', district: 'Khordha', region: 'East', tier: 'Tier 1' },
    '753': { city: 'Cuttack', state: 'Odisha', district: 'Cuttack', region: 'East', tier: 'Tier 2' },
    '769': { city: 'Rourkela', state: 'Odisha', district: 'Sundargarh', region: 'East', tier: 'Tier 2' },
    '781': { city: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan', region: 'NorthEast', tier: 'Tier 1' },
    '786': { city: 'Dibrugarh', state: 'Assam', district: 'Dibrugarh', region: 'NorthEast', tier: 'Tier 2' },
    '793': { city: 'Shillong', state: 'Meghalaya', district: 'East Khasi Hills', region: 'NorthEast', tier: 'Tier 2' },
    '795': { city: 'Imphal', state: 'Manipur', district: 'Imphal West', region: 'NorthEast', tier: 'Tier 2' },
    '796': { city: 'Aizawl', state: 'Mizoram', district: 'Aizawl', region: 'NorthEast', tier: 'Tier 2' },
    '797': { city: 'Kohima / Dimapur', state: 'Nagaland', district: 'Dimapur', region: 'NorthEast', tier: 'Tier 2' },
    '799': { city: 'Agartala', state: 'Tripura', district: 'West Tripura', region: 'NorthEast', tier: 'Tier 2' },

    // Bihar & Jharkhand (800-855)
    '800': { city: 'Patna', state: 'Bihar', district: 'Patna', region: 'East', tier: 'Tier 1' },
    '823': { city: 'Gaya', state: 'Bihar', district: 'Gaya', region: 'East', tier: 'Tier 2' },
    '826': { city: 'Dhanbad', state: 'Jharkhand', district: 'Dhanbad', region: 'East', tier: 'Tier 2' },
    '827': { city: 'Bokaro', state: 'Jharkhand', district: 'Bokaro', region: 'East', tier: 'Tier 2' },
    '831': { city: 'Jamshedpur', state: 'Jharkhand', district: 'East Singhbhum', region: 'East', tier: 'Tier 1' },
    '834': { city: 'Ranchi', state: 'Jharkhand', district: 'Ranchi', region: 'East', tier: 'Tier 1' },
    '842': { city: 'Muzaffarpur', state: 'Bihar', district: 'Muzaffarpur', region: 'East', tier: 'Tier 2' },
    '851': { city: 'Begusarai', state: 'Bihar', district: 'Begusarai', region: 'East', tier: 'Tier 2' },
    '854': { city: 'Purnia', state: 'Bihar', district: 'Purnia', region: 'East', tier: 'Tier 3' }
};

export class DeliveryService {
    /**
     * Resolves geographical location info from a 6-digit Indian PIN code
     */
    public static resolveLocation(pincode: string): PincodeLocationInfo {
        const cleanPin = pincode.trim();
        const prefix3 = cleanPin.substring(0, 3);
        const prefix2 = cleanPin.substring(0, 2);
        const firstDigit = cleanPin[0];

        if (PINCODE_PREFIX_MAP[prefix3]) {
            const mapped = PINCODE_PREFIX_MAP[prefix3];
            return {
                pincode: cleanPin,
                city: mapped.city,
                state: mapped.state,
                district: mapped.district,
                region: mapped.region,
                tier: mapped.tier,
                zone: `${mapped.region} Zone`
            };
        }

        // Broad fallback based on PIN code regional circle
        let state = 'India';
        let region: PincodeLocationInfo['region'] = 'West';
        let city = `Area ${cleanPin}`;
        let tier: PincodeLocationInfo['tier'] = 'Tier 2';

        switch (firstDigit) {
            case '1':
                state = prefix2 === '11' ? 'Delhi' : prefix2.startsWith('12') || prefix2.startsWith('13') ? 'Haryana' : prefix2.startsWith('14') || prefix2.startsWith('15') ? 'Punjab' : prefix2.startsWith('16') ? 'Chandigarh' : prefix2.startsWith('17') ? 'Himachal Pradesh' : 'Jammu & Kashmir';
                region = 'North';
                city = `${state} District (PIN ${cleanPin})`;
                tier = 'Tier 2';
                break;
            case '2':
                state = prefix2.startsWith('24') && ['248', '249', '263'].includes(prefix3) ? 'Uttarakhand' : 'Uttar Pradesh';
                region = 'North';
                city = `${state} District (PIN ${cleanPin})`;
                tier = 'Tier 2';
                break;
            case '3':
                state = ['30', '31', '32', '33', '34'].includes(prefix2) ? 'Rajasthan' : 'Gujarat';
                region = 'West';
                city = `${state} District (PIN ${cleanPin})`;
                tier = 'Tier 2';
                break;
            case '4':
                state = prefix2 === '40' && prefix3 === '403' ? 'Goa' : ['45', '46', '47', '48'].includes(prefix2) ? 'Madhya Pradesh' : prefix2 === '49' ? 'Chhattisgarh' : 'Maharashtra';
                region = state === 'Madhya Pradesh' || state === 'Chhattisgarh' ? 'Central' : 'West';
                city = `${state} District (PIN ${cleanPin})`;
                tier = 'Tier 2';
                break;
            case '5':
                state = ['50', '51'].includes(prefix2) ? 'Telangana / Andhra Pradesh' : ['56', '57', '58', '59'].includes(prefix2) ? 'Karnataka' : 'Andhra Pradesh';
                region = 'South';
                city = `${state} District (PIN ${cleanPin})`;
                tier = 'Tier 2';
                break;
            case '6':
                state = ['60', '61', '62', '63', '64'].includes(prefix2) ? 'Tamil Nadu' : ['67', '68', '69'].includes(prefix2) ? 'Kerala' : 'Tamil Nadu';
                region = 'South';
                city = `${state} District (PIN ${cleanPin})`;
                tier = 'Tier 2';
                break;
            case '7':
                state = ['70', '71', '72', '73', '74'].includes(prefix2) ? 'West Bengal' : ['75', '76', '77'].includes(prefix2) ? 'Odisha' : ['78', '79'].includes(prefix2) ? 'Assam & North East' : 'Eastern Zone';
                region = prefix2 === '78' || prefix2 === '79' ? 'NorthEast' : 'East';
                city = `${state} District (PIN ${cleanPin})`;
                tier = region === 'NorthEast' ? 'Tier 3' : 'Tier 2';
                break;
            case '8':
                state = ['80', '81', '82', '84', '85'].includes(prefix2) ? 'Bihar' : 'Jharkhand';
                region = 'East';
                city = `${state} District (PIN ${cleanPin})`;
                tier = 'Tier 2';
                break;
            default:
                state = 'India';
                city = `Location ${cleanPin}`;
                region = 'West';
                tier = 'Tier 3';
                break;
        }

        return {
            pincode: cleanPin,
            city,
            state,
            district: `${city}, ${state}`,
            region,
            tier,
            zone: `${region} Zone`
        };
    }

    /**
     * Calculates delivery estimate and date string from minimum & maximum transit days
     */
    public static calculateDeliveryDates(minDays: number, maxDays: number): { estimatedDays: string; estimatedDeliveryDate: string; formattedDeliveryDate: string } {
        const today = new Date();
        
        // Add business days (skip Sunday)
        const addBusinessDays = (startDate: Date, days: number): Date => {
            let current = new Date(startDate);
            let added = 0;
            while (added < days) {
                current.setDate(current.getDate() + 1);
                if (current.getDay() !== 0) { // Skip Sunday
                    added++;
                }
            }
            return current;
        };

        const minDate = addBusinessDays(today, minDays);
        const maxDate = addBusinessDays(today, maxDays);

        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const minFormatted = minDate.toLocaleDateString('en-IN', options);
        const maxFormatted = maxDate.toLocaleDateString('en-IN', options);

        const estimatedDays = minDays === maxDays ? `${minDays} business day${minDays > 1 ? 's' : ''}` : `${minDays}-${maxDays} business days`;
        const formattedDeliveryDate = minDays === maxDays ? maxFormatted : `${minFormatted} - ${maxFormatted}`;
        const estimatedDeliveryDate = maxFormatted;

        return { estimatedDays, estimatedDeliveryDate, formattedDeliveryDate };
    }

    /**
     * Checks Blue Dart serviceability for a given pincode
     * Uses official Blue Dart API if credentials provided in .env, otherwise utilizes comprehensive service matrix
     */
    public static async checkBlueDartServiceability(pincode: string, location: PincodeLocationInfo): Promise<CourierPartnerResult> {
        const cleanPin = pincode.trim();

        // Check if external Blue Dart API credentials exist
        const blueDartApiKey = process.env.BLUEDART_API_KEY || process.env.BLUEDART_LICENSE_KEY;
        const blueDartLoginId = process.env.BLUEDART_LOGIN_ID;
        const blueDartApiUrl = process.env.BLUEDART_API_URL || 'https://apigateway.bluedart.com/in/transportation/finder/v1/GetPincodeDetail';

        if (blueDartApiKey && blueDartLoginId) {
            try {
                const response = await axios.get(blueDartApiUrl, {
                    params: { pincode: cleanPin, loginid: blueDartLoginId, licensekey: blueDartApiKey },
                    timeout: 4000
                });

                if (response.data && (response.data.GetPincodeDetailResult?.IsServiceable === 'Y' || response.data.serviceable)) {
                    const transit = this.getTransitDaysForLocation('BLUEDART', location);
                    const dateInfo = this.calculateDeliveryDates(transit.min, transit.max);

                    return {
                        name: 'Blue Dart Express',
                        code: 'BLUEDART',
                        serviceable: true,
                        serviceType: location.tier === 'Metro' ? 'Blue Dart Apex (Air Priority)' : 'Blue Dart Surfaceline',
                        estimatedDays: dateInfo.estimatedDays,
                        minDays: transit.min,
                        maxDays: transit.max,
                        estimatedDeliveryDate: dateInfo.estimatedDeliveryDate,
                        formattedDeliveryDate: dateInfo.formattedDeliveryDate,
                        codAvailable: response.data.GetPincodeDetailResult?.IsCOD === 'Y' || true,
                        prepaidAvailable: true,
                        expressAvailable: location.tier === 'Metro' || location.tier === 'Tier 1',
                        isPreferred: true,
                        hubCode: `BD-${location.city.substring(0, 3).toUpperCase()}`,
                        message: `Serviceable via Blue Dart Express. Expected delivery by ${dateInfo.estimatedDeliveryDate}.`
                    };
                }
            } catch (err: any) {
                console.warn('[DELIVERY-SERVICE] Blue Dart live API unreachable, using built-in high-fidelity matrix:', err?.message);
            }
        }

        // Built-in Blue Dart Serviceability & SLA Matrix
        // Blue Dart covers 98%+ of Indian postal PIN codes across India
        const isRemoteUnserviceable = cleanPin.startsWith('194') && cleanPin !== '194101'; // Very remote Ladakh hamlets
        const serviceable = !isRemoteUnserviceable;

        const transit = this.getTransitDaysForLocation('BLUEDART', location);
        const dateInfo = this.calculateDeliveryDates(transit.min, transit.max);

        return {
            name: 'Blue Dart Express',
            code: 'BLUEDART',
            serviceable,
            serviceType: location.tier === 'Metro' ? 'Blue Dart Apex (Air Priority Express)' : 'Blue Dart Surfaceline (Door-to-Door)',
            estimatedDays: dateInfo.estimatedDays,
            minDays: transit.min,
            maxDays: transit.max,
            estimatedDeliveryDate: dateInfo.estimatedDeliveryDate,
            formattedDeliveryDate: dateInfo.formattedDeliveryDate,
            codAvailable: location.tier !== 'Remote',
            prepaidAvailable: true,
            expressAvailable: location.tier === 'Metro' || location.tier === 'Tier 1',
            isPreferred: true,
            hubCode: `BD-${(location.city.replace(/[^a-zA-Z]/g, '').substring(0, 3) || 'HUB').toUpperCase()}`,
            message: serviceable
                ? `Delivery available via Blue Dart Express. Estimated arrival: ${dateInfo.formattedDeliveryDate}.`
                : `Blue Dart delivery not available for pincode ${cleanPin}.`
        };
    }

    /**
     * Checks DTDC serviceability for a given pincode
     */
    public static async checkDTDCServiceability(pincode: string, location: PincodeLocationInfo): Promise<CourierPartnerResult> {
        const cleanPin = pincode.trim();

        // Check if external DTDC API configured
        const dtdcApiKey = process.env.DTDC_API_KEY;
        if (dtdcApiKey) {
            try {
                const response = await axios.post('https://smarttrack.dtdc.com/ctsvm/serviceability', {
                    pincode: cleanPin,
                    apiKey: dtdcApiKey
                }, { timeout: 4000 });

                if (response.data && response.data.status === 'SUCCESS') {
                    const transit = this.getTransitDaysForLocation('DTDC', location);
                    const dateInfo = this.calculateDeliveryDates(transit.min, transit.max);
                    return {
                        name: 'DTDC Courier',
                        code: 'DTDC',
                        serviceable: true,
                        serviceType: 'DTDC Plus / Prime Express',
                        estimatedDays: dateInfo.estimatedDays,
                        minDays: transit.min,
                        maxDays: transit.max,
                        estimatedDeliveryDate: dateInfo.estimatedDeliveryDate,
                        formattedDeliveryDate: dateInfo.formattedDeliveryDate,
                        codAvailable: true,
                        prepaidAvailable: true,
                        expressAvailable: true,
                        isPreferred: false,
                        hubCode: `DTDC-${location.city.substring(0, 3).toUpperCase()}`,
                        message: `Serviceable via DTDC Courier.`
                    };
                }
            } catch (err: any) {
                console.warn('[DELIVERY-SERVICE] DTDC API check skipped:', err?.message);
            }
        }

        const transit = this.getTransitDaysForLocation('DTDC', location);
        const dateInfo = this.calculateDeliveryDates(transit.min, transit.max);
        const serviceable = true;

        return {
            name: 'DTDC Courier',
            code: 'DTDC',
            serviceable,
            serviceType: location.tier === 'Metro' ? 'DTDC Prime (Priority Air)' : 'DTDC Lite (Ground Express)',
            estimatedDays: dateInfo.estimatedDays,
            minDays: transit.min,
            maxDays: transit.max,
            estimatedDeliveryDate: dateInfo.estimatedDeliveryDate,
            formattedDeliveryDate: dateInfo.formattedDeliveryDate,
            codAvailable: location.tier !== 'Remote',
            prepaidAvailable: true,
            expressAvailable: location.tier === 'Metro' || location.tier === 'Tier 1',
            isPreferred: false,
            hubCode: `DTDC-${(location.city.replace(/[^a-zA-Z]/g, '').substring(0, 3) || 'BRN').toUpperCase()}`,
            message: `Delivery available via DTDC Courier. Estimated arrival: ${dateInfo.formattedDeliveryDate}.`
        };
    }

    /**
     * Helper to compute transit days based on warehouse origin (Mumbai / Central Hub) and destination location tier
     */
    private static getTransitDaysForLocation(partner: 'BLUEDART' | 'DTDC', location: PincodeLocationInfo): { min: number; max: number } {
        const isBlueDart = partner === 'BLUEDART';

        // Same city / Metro intra-zone (e.g. Mumbai 400xxx / Pune 411xxx)
        if (location.city === 'Mumbai' || location.city === 'Thane / Palghar' || location.city === 'Pune') {
            return isBlueDart ? { min: 1, max: 2 } : { min: 1, max: 2 };
        }

        if (location.tier === 'Metro') {
            return isBlueDart ? { min: 2, max: 3 } : { min: 2, max: 4 };
        }

        if (location.tier === 'Tier 1') {
            return isBlueDart ? { min: 2, max: 4 } : { min: 3, max: 4 };
        }

        if (location.region === 'NorthEast' || location.tier === 'Remote') {
            return isBlueDart ? { min: 4, max: 6 } : { min: 5, max: 7 };
        }

        // Tier 2 & Tier 3
        return isBlueDart ? { min: 3, max: 4 } : { min: 3, max: 5 };
    }

    /**
     * Main method: checks comprehensive delivery partner serviceability for a pincode
     */
    public static async checkServiceability(pincode: string): Promise<ServiceabilityResponse> {
        const cleanPin = pincode ? pincode.toString().trim() : '';

        // Validate 6-digit Indian Postal Code
        const pinRegex = /^[1-9][0-9]{5}$/;
        if (!cleanPin || !pinRegex.test(cleanPin)) {
            return {
                success: false,
                pincode: cleanPin,
                serviceable: false,
                location: {
                    pincode: cleanPin,
                    city: 'Invalid PIN Code',
                    state: '',
                    district: '',
                    region: 'West',
                    tier: 'Tier 3',
                    zone: ''
                },
                primaryPartner: {
                    name: 'Blue Dart Express',
                    code: 'BLUEDART',
                    serviceable: false,
                    serviceType: 'N/A',
                    estimatedDays: 'N/A',
                    minDays: 0,
                    maxDays: 0,
                    estimatedDeliveryDate: 'N/A',
                    formattedDeliveryDate: 'N/A',
                    codAvailable: false,
                    prepaidAvailable: false,
                    expressAvailable: false,
                    isPreferred: true,
                    message: 'Please enter a valid 6-digit Indian postal PIN code.'
                },
                partners: [],
                message: 'Invalid postal PIN code. Please enter a valid 6-digit code (e.g. 400001).'
            };
        }

        // Check Redis cache if available
        const cacheKey = `delivery:pincode:${cleanPin}`;
        if (redisClient) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (cacheErr) {
                // Ignore cache errors
            }
        }

        // 1. Resolve Location
        const location = this.resolveLocation(cleanPin);

        // 2. Query Courier Partners in parallel (Blue Dart and DTDC)
        const [blueDartResult, dtdcResult] = await Promise.all([
            this.checkBlueDartServiceability(cleanPin, location),
            this.checkDTDCServiceability(cleanPin, location)
        ]);

        // 3. Check for Local DDTEC Dark Store / Store Hub serving this pincode
        let localHubInfo: ServiceabilityResponse['localHub'] = null;
        if (mongoose.connection && mongoose.connection.readyState === 1) {
            try {
                const matchedHub = await Hub.findOne({ pincodes: cleanPin, isActive: true });
                if (matchedHub) {
                    localHubInfo = {
                        available: true,
                        hubName: matchedHub.name,
                        hubCode: matchedHub.code,
                        city: matchedHub.city,
                        sameDayDelivery: true
                    };
                }
            } catch (hubErr) {
                console.warn('[DELIVERY-SERVICE] Hub lookup warning:', hubErr);
            }
        }

        const partners = [blueDartResult, dtdcResult];
        const isOverallServiceable = blueDartResult.serviceable || dtdcResult.serviceable || Boolean(localHubInfo?.available);

        // Blue Dart is our primary partner ("use dart service")
        const primaryPartner = blueDartResult.serviceable ? blueDartResult : (dtdcResult.serviceable ? dtdcResult : blueDartResult);

        let overallMessage = '';
        if (localHubInfo?.available) {
            overallMessage = `⚡ Express Same-Day delivery available from ${localHubInfo.hubName} (${localHubInfo.city}) & standard courier via ${primaryPartner.name}!`;
        } else if (isOverallServiceable) {
            overallMessage = `Delivery available to ${location.city}, ${location.state} via ${primaryPartner.name} (Estimated ${primaryPartner.formattedDeliveryDate}).`;
        } else {
            overallMessage = `Delivery currently not available to pincode ${cleanPin}.`;
        }

        const result: ServiceabilityResponse = {
            success: true,
            pincode: cleanPin,
            serviceable: isOverallServiceable,
            location,
            primaryPartner,
            partners,
            localHub: localHubInfo,
            message: overallMessage
        };

        // Cache result in Redis for 1 hour
        if (redisClient && isOverallServiceable) {
            try {
                await redisClient.setex(cacheKey, 3600, JSON.stringify(result));
            } catch (err) {
                // Ignore cache set error
            }
        }

        return result;
    }

    /**
     * Returns popular curated Indian pincodes for quick selection
     */
    public static getPopularPincodes() {
        return [
            { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', region: 'West' },
            { pincode: '110001', city: 'New Delhi', state: 'Delhi', region: 'North' },
            { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', region: 'South' },
            { pincode: '411001', city: 'Pune', state: 'Maharashtra', region: 'West' },
            { pincode: '500001', city: 'Hyderabad', state: 'Telangana', region: 'South' },
            { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', region: 'South' },
            { pincode: '700001', city: 'Kolkata', state: 'West Bengal', region: 'East' },
            { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', region: 'West' },
            { pincode: '302001', city: 'Jaipur', state: 'Rajasthan', region: 'North' },
            { pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh', region: 'North' }
        ];
    }
}

export default DeliveryService;
