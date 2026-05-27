import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';
import Category from '../src/models/Category';
import Product from '../src/models/Product';
import Settings from '../src/models/Settings';

// Load env from current directory
dotenv.config();

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ddtec';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB!');

        // 1. Seed Settings
        console.log('Seeding Settings...');
        await Settings.deleteMany({});
        const defaultSettings = new Settings({
            components: {
                WhatWeOffer: true,
                Footer: true,
                ShopSection: true,
                Hero: true,
                WhoWeAre: true,
                FeaturedProducts: true,
                Contact: true,
                Login: true,
                Signup: true,
            }
        });
        await defaultSettings.save();
        console.log('✅ Settings seeded!');

        // 2. Seed Users (Admin & Standard Test User)
        console.log('Seeding Admin & Test Users...');
        
        const adminEmail = 'admin@ddtec.com';
        await User.deleteOne({ email: adminEmail });
        const adminUser = new User({
            firstName: 'System',
            lastName: 'Admin',
            name: 'System Admin',
            email: adminEmail,
            password: 'adminpassword123', // Will be automatically hashed by pre-save hook
            role: 'admin',
            isActive: true,
            isEmailVerified: true
        });
        await adminUser.save();
        console.log('✅ Admin User seeded (admin@ddtec.com / adminpassword123)!');

        const testUserEmail = 'user@ddtec.com';
        await User.deleteOne({ email: testUserEmail });
        const testUser = new User({
            firstName: 'Test',
            lastName: 'User',
            name: 'Test User',
            email: testUserEmail,
            password: '123456789', // Will be automatically hashed by pre-save hook
            role: 'user',
            isActive: true,
            isEmailVerified: true,
            phone: '9876543210'
        });
        await testUser.save();
        console.log('✅ Standard Test User seeded (user@ddtec.com / 123456789)!');

        // 3. Seed Categories
        console.log('Seeding Categories...');
        await Category.deleteMany({});
        
        const categoriesData = [
            { name: 'Wood Cutters', slug: 'wood-cutters', description: 'Premium saws and cutting tools for timber.' },
            { name: 'Grinding Tools', slug: 'grinding-tools', description: 'Industrial angle grinders and disc tools.' },
            { name: 'Fasteners', slug: 'fasteners', description: 'Heavy duty bolts, nuts, and screws.' },
            { name: 'Safety Gear', slug: 'safety-gear', description: 'Protective helmets, gloves, and glasses.' }
        ];

        const seededCategories = [];
        for (const cat of categoriesData) {
            const newCat = new Category(cat);
            const savedCat = await newCat.save();
            seededCategories.push(savedCat);
        }
        console.log(`✅ Seeded ${seededCategories.length} categories!`);

        // 4. Seed Products
        console.log('Seeding Products...');
        await Product.deleteMany({});

        const catWood = seededCategories.find(c => c.slug === 'wood-cutters')?._id;
        const catGrind = seededCategories.find(c => c.slug === 'grinding-tools')?._id;
        const catFasten = seededCategories.find(c => c.slug === 'fasteners')?._id;
        const catSafety = seededCategories.find(c => c.slug === 'safety-gear')?._id;

        const productsData = [
            {
                name: 'Heavy Duty Circular Saw 1400W',
                price: 4999,
                description: 'High performance circular saw with steel shoe and dual laser guide for ultimate precision.',
                image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400',
                images: [],
                category: catWood,
                stock: 25,
                rating: 4.8,
                numReviews: 42,
                lastMonthSales: 120,
                brand: 'DDTEC Max',
                modelName: 'CS-1400',
                isActive: true,
                showOnHome: true,
                taxes: [{ name: 'GST', rate: 18 }]
            },
            {
                name: 'Professional Angle Grinder 850W',
                price: 2799,
                description: 'Compact and light weight angle grinder with ergonomic handle and burst-proof guard protection.',
                image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400',
                images: [],
                category: catGrind,
                stock: 40,
                rating: 4.6,
                numReviews: 30,
                lastMonthSales: 85,
                brand: 'DDTEC Pro',
                modelName: 'AG-850',
                isActive: true,
                showOnHome: true,
                taxes: [{ name: 'GST', rate: 18 }]
            },
            {
                name: 'Premium Titanium Screw Set (100pcs)',
                price: 899,
                description: 'Corrosion resistant titanium alloy screw set designed for high stress wood and metal fastening.',
                image: 'https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=400',
                images: [],
                category: catFasten,
                stock: 150,
                rating: 4.5,
                numReviews: 15,
                lastMonthSales: 210,
                brand: 'DDTEC Fast',
                modelName: 'TS-100',
                isActive: true,
                showOnHome: true,
                taxes: [{ name: 'GST', rate: 18 }]
            },
            {
                name: 'High Impact Protection Safety Helmet',
                price: 1249,
                description: 'Vented ABS hard hat with 6-point suspension system and dynamic sweatband for top level jobsite safety.',
                image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=400',
                images: [],
                category: catSafety,
                stock: 75,
                rating: 4.9,
                numReviews: 55,
                lastMonthSales: 130,
                brand: 'DDTEC Shield',
                modelName: 'SH-X1',
                isActive: true,
                showOnHome: true,
                taxes: [{ name: 'GST', rate: 18 }]
            }
        ];

        for (const prod of productsData) {
            const newProd = new Product(prod);
            await newProd.save();
        }
        console.log('✅ Products seeded successfully!');

        console.log('Database seeding complete! Disconnecting...');
        await mongoose.disconnect();
        console.log('Disconnected!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during seeding:', err);
        process.exit(1);
    }
};

seed();
