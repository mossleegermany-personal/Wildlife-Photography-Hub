const { MongoClient, ObjectId } = require('mongodb');

// Use environment variable if available, otherwise fallback to hardcoded URI
const uri = process.env.MONGODB_URI || "mongodb+srv://mossleegermany_db_user:Mlxy6695@moses-personal.pvalfbk.mongodb.net/?retryWrites=true&w=majority&appName=Moses-Personal";

class RobustDatabaseConnectivity {
    constructor(options = {}) {
        this.instanceId = options.instanceId || `db_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        // Updated connection options for better compatibility
        this.client = new MongoClient(uri, {
            maxPoolSize: options.maxPoolSize || 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            retryWrites: true,
            retryReads: true,
            authSource: 'admin',
            // Disable problematic SSL options
            ssl: false,  // Let MongoDB driver handle SSL automatically for Atlas
            family: 4    // Force IPv4
        });
        
        this.isConnected = false;
        this.connectionPromise = null;
        this.silentMode = options.silentMode || false;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 2000;
    }

    async initialize() {
        if (this.isConnected) {
            try {
                await this.client.db('admin').command({ ping: 1 }, { maxTimeMS: 5000 });
                return;
            } catch (error) {
                this.isConnected = false;
            }
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this._connectWithRetry();
        return this.connectionPromise;
    }

    async _connectWithRetry() {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                if (!this.silentMode) {
                    console.log(`⚡ Connecting to database... (Attempt ${attempt}/${this.maxRetries})`);
                }
                
                await this.client.connect();
                await this.client.db('admin').command({ ping: 1 });
                
                this.isConnected = true;
                this.connectionPromise = null;
                
                if (!this.silentMode) {
                    console.log('✅ Database connected successfully');
                }
                return;
                
            } catch (error) {
                lastError = error;
                this.isConnected = false;
                
                if (!this.silentMode) {
                    console.error(`❌ Database connection attempt ${attempt} failed:`, error.message);
                }
                
                if (attempt < this.maxRetries) {
                    if (!this.silentMode) {
                        console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
                    }
                    await this._sleep(this.retryDelay);
                }
            }
        }
        
        this.connectionPromise = null;
        throw lastError;
    }

    async _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async insertDocument(databaseName, collectionName, document) {
        try {
            await this.initialize();
            
            if (!this.isConnected) {
                return {
                    success: false,
                    error: 'Database not available'
                };
            }
            
            const db = this.client.db(databaseName);
            const collection = db.collection(collectionName);
            const result = await collection.insertOne(document);
            
            return {
                success: true,
                insertedId: result.insertedId,
                message: 'Document inserted successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDocument(databaseName, collectionName, query) {
        try {
            await this.initialize();
            
            if (!this.isConnected) {
                return {
                    success: false,
                    error: 'Database not available',
                    data: null
                };
            }
            
            const db = this.client.db(databaseName);
            const collection = db.collection(collectionName);
            const document = await collection.findOne(query);
            
            if (!document) {
                return {
                    success: false,
                    message: 'No document found matching the query',
                    data: null
                };
            }
            
            return {
                success: true,
                message: 'Document retrieved successfully',
                data: document
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    async findDocuments(databaseName, collectionName, query = {}) {
        try {
            await this.initialize();
            
            if (!this.isConnected) {
                return {
                    success: false,
                    error: 'Database not available',
                    data: []
                };
            }
            
            const db = this.client.db(databaseName);
            const collection = db.collection(collectionName);
            const documents = await collection.find(query).toArray();
            
            return {
                success: true,
                message: `Retrieved ${documents.length} documents successfully`,
                data: documents
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    async close() {
        if (this.client) {
            await this.client.close();
            this.isConnected = false;
            if (!this.silentMode) {
                console.log('🔌 Database connection closed');
            }
        }
    }
}

module.exports = RobustDatabaseConnectivity;
