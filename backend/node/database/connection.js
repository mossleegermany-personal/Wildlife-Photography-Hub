const { MongoClient, ObjectId } = require('mongodb');

// Use environment variable if available, otherwise fallback to hardcoded URI
//mongodb+srv://mossleegermany_db_user:<db_password>@moses-personal.pvalfbk.mongodb.net/?retryWrites=true&w=majority&appName=Moses-Personal
const uri = "mongodb+srv://mossleegermany_db_user:Mlxy6695@moses-personal.pvalfbk.mongodb.net/?retryWrites=true&w=majority&appName=Moses-Personal";

class DatabaseConnectivity {
    constructor(options = {}) {
        this.client = new MongoClient(uri, {
            maxPoolSize: options.maxPoolSize || 10,
            minPoolSize: options.minPoolSize || 2,
            maxIdleTimeMS: 60000,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 20000,
            retryWrites: true,
            retryReads: true
        });
        
        this.isConnected = false;
        this.connectionPromise = null;
        this.silentMode = options.silentMode || false;
    }

    async initialize() {
        if (this.isConnected) {
            try {
                await this.client.db().command();
                return;
            } catch (error) {
                this.isConnected = false;
            }
        }

        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this._connect();
        return this.connectionPromise;
    }

    async _connect() {
        try {
            if (!this.silentMode) {
                console.log('⚡ Connecting to database...');
            }
            
            await this.client.connect();
            await this.client.db().command();
            
            this.isConnected = true;
            this.connectionPromise = null;
            
            if (!this.silentMode) {
                console.log('✅ Database connected successfully');
            }
        } catch (error) {
            this.connectionPromise = null;
            this.isConnected = false;
            
            if (!this.silentMode) {
                console.error('❌ Database connection failed:', error.message);
            }
            throw error;
        }
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
            console.log("Database result:", db);
            const collection = db.collection(collectionName);
            console.log("Collection result:", collection);
            const result = await collection.insertOne(document);
            console.log("InsertOne result:", result);
            
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
}

module.exports = DatabaseConnectivity;