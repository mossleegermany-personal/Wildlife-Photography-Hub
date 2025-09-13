const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || "mongodb+srv://mossleegermany_db_user:Mlxy6695@moses-personal.pvalfbk.mongodb.net/?retryWrites=true&w=majority&appName=Moses-Personal&ssl=true&authSource=admin";

class MongooseConnectivity {
    constructor(options = {}) {
        this.instanceId = options.instanceId || `mongoose_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        this.isConnected = false;
        this.silentMode = options.silentMode || false;
        
        // Mongoose connection options
        this.connectionOptions = {
            maxPoolSize: options.maxPoolSize || 10,
            minPoolSize: options.minPoolSize || 2,
            maxIdleTimeMS: 60000,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 20000,
            retryWrites: true,
            ssl: true,
            tlsAllowInvalidCertificates: false,
            authSource: 'admin'
        };
    }

    async initialize() {
        if (mongoose.connection.readyState === 1) {
            this.isConnected = true;
            return;
        }

        try {
            if (!this.silentMode) {
                console.log('⚡ Connecting to database with Mongoose...');
            }

            await mongoose.connect(uri, this.connectionOptions);
            
            this.isConnected = true;
            
            if (!this.silentMode) {
                console.log('✅ Database connected successfully with Mongoose');
            }

            // Handle connection events
            mongoose.connection.on('error', (error) => {
                console.error('❌ Database connection error:', error.message);
                this.isConnected = false;
            });

            mongoose.connection.on('disconnected', () => {
                console.log('⚠️ Database disconnected');
                this.isConnected = false;
            });

        } catch (error) {
            this.isConnected = false;
            if (!this.silentMode) {
                console.error('❌ Database connection failed:', error.message);
            }
            throw error;
        }
    }

    async close() {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            this.isConnected = false;
            console.log('🔌 Database connection closed');
        }
    }

    getConnection() {
        return mongoose.connection;
    }

    isConnectionReady() {
        return mongoose.connection.readyState === 1;
    }
}

module.exports = MongooseConnectivity;
