require('dotenv').config();
const mongoose = require('mongoose');

async function dropIndex() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        const User = require('./src/models/User').default;

        // Try to drop old unique index
        try {
            await mongoose.connection.collection('users').dropIndex('microsoftId_1');
            console.log('Old index dropped successfully');
        } catch (e) {
            console.log('Index drop ignored (maybe did not exist)', e.message);
        }

        // Rebuild indexes according to new schema (sparse true)
        await User.syncIndexes();
        console.log('Indexes synced successfully');

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
dropIndex();
