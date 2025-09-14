const RobustDatabaseConnectivity = require('../database/connection');

class WildlifeSightingsController 
{
  constructor() {
    this.databaseName = 'Photography';
    this.collectionName = 'Wildlife Collection';
    this.db = new RobustDatabaseConnectivity({ 
      maxRetries: 3, 
      retryDelay: 2000,
      silentMode: false 
    });
  }

  createSighting(sightingData) 
  {
    return new Promise(async (resolve, reject) => {
      try {
        // Validate sighting data
        if (!sightingData) {
          reject({
            status: 'error',
            message: 'Invalid sighting data'
          });
          return;
        }

        // Validate required fields
        if (!sightingData.speciesName || !sightingData.speciesType || !sightingData.coordinates) {
          reject({
            status: 'error',
            message: 'Species name, species type, and coordinates are required'
          });
          return;
        }

        // Save the sighting to the database using DatabaseConnectivity
        const result = await this.db.insertDocument(this.databaseName, this.collectionName, sightingData);
        console.log("Insert document result:", result);
        
        if (result.success) {
          resolve({
            status: 'success',
            message: 'Wildlife sighting recorded successfully',
            data: {
              _id: result.insertedId,
              ...sightingData
            }
          });
        } else {
          reject({
            status: 'error',
            message: 'Failed to save sighting to database',
            data: null,
            error: result.error
          });
        }
      } catch (error) {
        reject({
          status: 'error',
          message: 'An unexpected error occurred while creating the sighting',
          error: error.message
        });
      }
    });
  }

  getAllSightings() {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Fetching all wildlife sightings from database");
        
        // Retrieve all documents from the Wildlife Collection
        const result = await this.db.findDocuments(this.databaseName, this.collectionName);
        console.log("Find documents result:", result);
        
        if (result.success) {
          resolve({
            status: 'success',
            message: 'Wildlife sightings retrieved successfully',
            data: result.data
          });
        } else {
          reject({
            status: 'error',
            message: 'Failed to retrieve sightings from database',
            data: [],
            error: result.error
          });
        }
      } catch (error) {
        reject({
          status: 'error',
          message: 'An unexpected error occurred while retrieving sightings',
          data: [],
          error: error.message
        });
      }
    });
  }

  updateSightingImages(sightingId, imageUrls) {
    return new Promise(async (resolve, reject) => {
      try {
        // Validate input
        if (!sightingId) {
          reject({
            status: 'error',
            message: 'Sighting ID is required'
          });
          return;
        }

        if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
          reject({
            status: 'error',
            message: 'Image URLs array is required'
          });
          return;
        }

        console.log("Updating sighting with images:", sightingId, imageUrls);

        // Update the sighting document with image URLs
        const updateData = {
          images: imageUrls,
          updatedAt: new Date().toISOString()
        };

        const result = await this.db.updateDocument(
          this.databaseName, 
          this.collectionName, 
          { _id: sightingId }, 
          { $set: updateData }
        );

        console.log("Update document result:", result);
        
        if (result.success) {
          resolve({
            status: 'success',
            message: 'Sighting images updated successfully',
            data: result.data
          });
        } else {
          reject({
            status: 'error',
            message: 'Failed to update sighting images in database',
            error: result.error
          });
        }
      } catch (error) {
        console.error("Error updating sighting images:", error);
        reject({
          status: 'error',
          message: 'An unexpected error occurred while updating sighting images',
          error: error.message
        });
      }
    });
  }
}

module.exports = WildlifeSightingsController;