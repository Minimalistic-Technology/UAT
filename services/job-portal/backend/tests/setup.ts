import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
    const instance = await MongoMemoryServer.create();
    const uri = instance.getUri();

    // Set the environment variable for mongoose to use
    (global as any).__MONGOINSTANCE = instance;
    process.env.MONGO_URI = uri;
    process.env.JWT_SECRET = "testsecret123"; // Dummy secret
}
