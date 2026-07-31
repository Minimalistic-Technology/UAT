import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/models/User';
import { env } from './src/config/env';

async function seedAdmin() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');

    const adminEmail = 'Admine@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists. Updating password just in case.');
      existingAdmin.password = '123456789'; // It will be hashed by pre-save hook
      await existingAdmin.save();
      console.log('Admin password updated.');
    } else {
      const adminUser = new User({
        firstName: 'System',
        lastName: 'Admin',
        contactNumber: '+919876543210',
        email: adminEmail,
        password: '123456789', // Will be hashed by pre-save hook
        role: 'admin',
        isVerified: true
      });
      await adminUser.save();
      console.log('Admin user created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

seedAdmin();
