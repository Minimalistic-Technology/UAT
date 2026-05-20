
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = 'mongodb+srv://saadali92486_db_user:2g9NQcbIpBT4K7sQ@cluster0.4klpagy.mongodb.net/?appName=Cluster0';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('User', userSchema);

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        console.log('Listing all users in DB:');
        const users = await User.find({});
        console.log(`Found ${users.length} users.`);
        users.forEach(u => console.log(` - ${u.email} (${u.role})`));

        const email = 'admin@ddtec.com';
        const password = 'adminpassword123';

        // Hash manually to be sure
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let admin = await User.findOne({ email });

        if (admin) {
            console.log('Admin user exists. Updating password...');
            admin.password = hashedPassword;
            admin.role = 'admin'; // Ensure role is admin
            await admin.save();
            console.log('Admin updated.');
        } else {
            console.log('Creating new Admin user...');
            admin = new User({
                name: 'System Admin',
                email,
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Admin created.');
        }

        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

run();
