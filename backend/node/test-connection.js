const DatabaseConnectivity = require('./database/connection');
const MongooseConnectivity = require('./database/mongoose-connection');

async function testConnections() {
    console.log('🧪 Testing database connections...\n');

    // Test 1: Native MongoDB Driver
    console.log('Test 1: Native MongoDB Driver');
    console.log('--------------------------------');
    try {
        const db = new DatabaseConnectivity({ silentMode: false });
        await db.initialize();
        console.log('✅ Native MongoDB driver connection: SUCCESS\n');
    } catch (error) {
        console.log('❌ Native MongoDB driver connection: FAILED');
        console.log('Error:', error.message);
        console.log('');
    }

    // Test 2: Mongoose
    console.log('Test 2: Mongoose Connection');
    console.log('----------------------------');
    try {
        const mongooseDb = new MongooseConnectivity({ silentMode: false });
        await mongooseDb.initialize();
        console.log('✅ Mongoose connection: SUCCESS\n');
        await mongooseDb.close();
    } catch (error) {
        console.log('❌ Mongoose connection: FAILED');
        console.log('Error:', error.message);
        console.log('');
    }

    console.log('🏁 Connection tests completed');
}

// Run the tests
testConnections().catch(console.error);
