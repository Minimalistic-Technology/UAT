import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import mongoose from 'mongoose';
import User from './models/User';
import Product from './models/Product';
import Order from './models/Order';

async function test() {
    console.log("Connecting database...");
    console.log("MONGO_URI:", process.env.MONGO_URI ? "FOUND" : "MISSING");
    console.log("Forcing model registration: ", User.modelName);
    try {
        const start = Date.now();
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log(`Connected successfully! Time taken: ${Date.now() - start}ms`);

        const startOrders = Date.now();
        const orders = await Order.find().populate('user').populate('items.product');
        console.log(`Fetched ${orders.length} orders. Time taken: ${Date.now() - startOrders}ms`);

        const startProducts = Date.now();
        const products = await Product.find();
        console.log(`Fetched ${products.length} products. Time taken: ${Date.now() - startProducts}ms`);

        await mongoose.connection.close();
        console.log("Disconnected cleanly.");
    } catch (err) {
        console.error("DB connection error:", err);
    }
}

test();
