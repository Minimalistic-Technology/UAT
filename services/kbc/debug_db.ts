
import mongoose from 'mongoose';
import GameConfig from './models/gameConfig';
import Question from './models/Question';
import QuestionBank from './models/QuestionBank';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
        console.log(`Connecting to ${uri}...`);
        await mongoose.connect(uri);
        console.log('Connected.');

        const activeConfig = await GameConfig.findOne({ isActive: true });
        if (!activeConfig) {
            console.log('No active game config found.');
            return;
        }

        console.log(`Active Config: ${activeConfig.configName} (${activeConfig._id})`);
        console.log(`Selected Banks: ${activeConfig.selectedBanks.length}`);

        for (const bankId of activeConfig.selectedBanks) {
            console.log(`\nChecking Bank ID: ${bankId}`);

            // Check if bank exists
            // bankId is string in config, need to cast or use as is depending on Schema
            let bank;
            try {
                bank = await QuestionBank.findById(bankId);
            } catch (e: any) {
                console.log(`Error finding bank ${bankId}:`, e.message);
                continue;
            }

            if (!bank) {
                console.log(`Bank not found in DB.`);
                continue;
            }
            console.log(`Bank Name: ${bank['name'] || 'Unknown'}`); // Assuming name field

            // Count matching questions
            // Query used in controller:
            /*
            {
                bankId: new mongoose.Types.ObjectId(bankId),
                status: "published",
                isAsked: false,
            }
            */

            const totalQuestions = await Question.countDocuments({ bankId: bank._id });
            const publishedQuestions = await Question.countDocuments({ bankId: bank._id, status: 'published' });
            const availableQuestions = await Question.countDocuments({ bankId: bank._id, status: 'published', isAsked: false });

            // Check isAsked type in DB?
            const sampleQ = await Question.findOne({ bankId: bank._id, status: 'published' });

            console.log(`Total Questions: ${totalQuestions}`);
            console.log(`Published Questions: ${publishedQuestions}`);
            console.log(`Available (isAsked: false): ${availableQuestions}`);

            if (sampleQ) {
                console.log(`Sample Question isAsked value:`, sampleQ.isAsked, `Type:`, typeof sampleQ.isAsked);
            }
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
