import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
    // Spin up an in-memory Replica Set (Required for Mongoose Transactions)
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    const uri = replSet.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    // Clear all collections after all tests in the file complete
    if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
    // Close the connection explicitly so jest can exit cleanly
    await mongoose.connection.close();
    if (replSet) {
        await replSet.stop();
    }
});
