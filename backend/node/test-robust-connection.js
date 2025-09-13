const RobustDatabaseConnectivity = require('./database/robust-connection');

async function testRobustConnection() {
    console.log('🧪 Testing robust database connection...\n');

    try {
        const db = new RobustDatabaseConnectivity({ 
            maxRetries: 3, 
            retryDelay: 1000,
            silentMode: false 
        });
        
        await db.initialize();
        
        // Test a simple query
        const result = await db.findDocuments('Photography', 'Wildlife Collection', {});
        console.log('Query result:', result);
        
        await db.close();
        console.log('✅ Robust connection test: SUCCESS');
        
    } catch (error) {
        console.log('❌ Robust connection test: FAILED');
        console.log('Error:', error.message);
    }
}

// Run the test
testRobustConnection().catch(console.error);
