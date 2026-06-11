import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config();

import RouteConfig from './src/models/RouteConfig';

const defaultRoutes = [
    { path: '/', name: 'Home Page', description: 'Main landing page of DDTEC', isActive: true },
    { path: '/shop', name: 'Shop', description: 'Displays all IT assets, hardware, and software products to purchase', isActive: true },
    { path: '/warehouse', name: 'Warehouse Dashboard', description: 'Logistics page for warehouse staff to manage packing and dispatch', isActive: true },
    { path: '/orders', name: 'Order History', description: 'Allows users to view and track their past and current orders', isActive: true },
    { path: '/profile', name: 'My Profile', description: 'User account settings and detail management', isActive: true },
    { path: '/cart', name: 'Shopping Cart', description: 'Contains selected products before checkout', isActive: true },
    { path: '/checkout', name: 'Checkout Page', description: 'Payment and shipping address confirmation', isActive: true },
    { path: '/blogs', name: 'Tech Blogs', description: 'Articles and news about enterprise IT solutions', isActive: true },
    { path: '/admin', name: 'Admin Dashboard', description: 'Core administrative control panel (Should never be disabled!)', isActive: true },
];

const seedRoutes = async () => {
    try {
        console.log("Connecting to Database: ", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log("Connected Successfully.");

        for (const route of defaultRoutes) {
            const existing = await RouteConfig.findOne({ path: route.path });
            if (!existing) {
                await RouteConfig.create(route);
                console.log(`Inserted missing route: ${route.name}`);
            } else {
                console.log(`Skipped existing route: ${route.name}`);
            }
        }
        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error("Failed to seed:", err);
        process.exit(1);
    }
}

seedRoutes();
