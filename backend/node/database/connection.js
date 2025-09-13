const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb+srv://mossleegermany_db_user:Mlxy6695@moses-personal.pvalfbk.mongodb.net/?retryWrites=true&w=majority&appName=Moses-Personal";

class DatabaseConnectivity {
    constructor(options = {}) {
        this.instanceId = options.instanceId || `db_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
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
                await this.client.db('admin').command({ ping: 1 }, { maxTimeMS: 1000 });
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
            await this.client.db('admin').command({ ping: 1 });
            
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

    async updateDocument(databaseName, collectionName, query, update) {
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
            const result = await collection.updateOne(query, update);
            
            if (result.modifiedCount === 1) {
                return {
                    success: true,
                    message: 'Document updated successfully',
                    data: result
                };
            } else if (result.matchedCount === 1) {
                return {
                    success: true,
                    message: 'No changes made to the document',
                    data: result
                };
            } else {
                return {
                    success: false,
                    message: 'No document found to update',
                    data: null
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteDocument(databaseName, collectionName, query) {
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
            const result = await collection.deleteOne(query);
            
            if (result.deletedCount === 1) {
                return {
                    success: true,
                    message: 'Document deleted successfully',
                    data: result
                };
            } else {
                return {
                    success: false,
                    message: 'No document found to delete',
                    data: null
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async disconnect() {
        try {
            await this.client.close();
            this.isConnected = false;
            this.connectionPromise = null;
            
            if (!this.silentMode) {
                console.log('🔌 Database disconnected successfully');
            }
        } catch (error) {
            if (!this.silentMode) {
                console.error('❌ Error disconnecting from database:', error);
            }
            throw error;
        }
    }

    getConnectionInfo() {
        return {
            instanceId: this.instanceId,
            isConnected: this.isConnected,
            maxPoolSize: this.client.options.maxPoolSize,
            minPoolSize: this.client.options.minPoolSize
        };
    }
}

module.exports = DatabaseConnectivity;