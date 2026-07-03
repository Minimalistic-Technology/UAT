const mongoose = require('mongoose');
require('dotenv').config();

const mongoUri = process.env.MONGO_URI;

async function migrate() {
    try {
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected...');

        const db = mongoose.connection.db;

        // Find the user warehouse@ddtec.com
        const user = await db.collection('users').findOne({ email: 'warehouse@ddtec.com' });

        if (user) {
            console.log('Found user:', user);

            // Check if Hub table exists and if we need to update a hub with this email
            const hub = await db.collection('hubs').findOne({ staffEmail: 'warehouse@ddtec.com' });

            if (!hub) {
                console.log('No hub found with staffEmail warehouse@ddtec.com. Updating first hub...');
                const firstHub = await db.collection('hubs').findOne();
                if (firstHub) {
                    await db.collection('hubs').updateOne(
                        { _id: firstHub._id },
                        {
                            $set: {
                                staffEmail: 'warehouse@ddtec.com',
                                staffPassword: user.password // carry over hashed password
                            }
                        }
                    );
                    console.log('Updated hub credentials!');
                }
            } else {
                await db.collection('hubs').updateOne(
                    { _id: hub._id },
                    { $set: { staffPassword: user.password } } // carry over hashed password just in case
                );
                console.log('Hub already existed. Updated password to match.');
            }

            // Remove from User table
            await db.collection('users').deleteOne({ _id: user._id });
            console.log('Removed warehouse@ddtec.com from users table.');
        } else {
            console.log('User warehouse@ddtec.com not found in users table.');
            const anyHub = await db.collection('hubs').findOne({ staffEmail: 'warehouse@ddtec.com' });
            if (anyHub) console.log('But it already exists inside the hubs table. Safe.');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
