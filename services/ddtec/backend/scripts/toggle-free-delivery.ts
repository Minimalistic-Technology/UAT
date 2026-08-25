import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Settings from '../src/models/Settings';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function toggleFreeDelivery() {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('MONGO_URI not set');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const settings = await Settings.findOne();
        if (settings) {
            settings.delivery = {
                freeDeliveryThreshold: 500,
                flatDeliveryFee: 50,
                isFreeDeliveryEnabled: false
            };
            await settings.save();
            console.log('Updated Settings:', settings.delivery);
        } else {
            const newSettings = await Settings.create({
                delivery: {
                    freeDeliveryThreshold: 500,
                    flatDeliveryFee: 50,
                    isFreeDeliveryEnabled: false
                }
            });
            console.log('Created Settings with free delivery OFF:', newSettings.delivery);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

toggleFreeDelivery();
