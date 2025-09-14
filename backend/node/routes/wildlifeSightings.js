const express = require('express');
const router = express.Router();
const WildlifeSightingsController = require('../controllers/wildlifeSightingsController');

// POST route to create new sightings and retrieve all sightings
router.post('/', async function(req, res, next) {
    if (req.body.purpose === 'newRecord') 
    {
        try {
            console.log("Creating new wildlife sighting record");
            console.log("Request body keys:", Object.keys(req.body));

            const { sightingData, images } = req.body;

            // Validate sighting data
            if (!sightingData) {
                return res.status(400).json({
                    success: false,
                    message: "Sighting data is required"
                });
            }

            // Process images if any are provided
            const processedImages = [];
            if (images && Array.isArray(images) && images.length > 0) {
                for (let i = 0; i < images.length; i++) {
                    const image = images[i];
                    
                    if (!image.data || !image.name || !image.type) {
                        return res.status(400).json({
                            success: false,
                            message: `Invalid image data at index ${i}`
                        });
                    }

                    // Check file size (10MB limit)
                    const base64Data = image.data.split(',')[1]; // Remove data:image/jpeg;base64, prefix
                    const sizeInBytes = (base64Data.length * 3) / 4; // Approximate size
                    
                    if (sizeInBytes > 10 * 1024 * 1024) {
                        return res.status(400).json({
                            success: false,
                            message: `Image ${image.name} exceeds 10MB limit`
                        });
                    }

                    processedImages.push({
                        name: image.name,
                        type: image.type,
                        size: image.size,
                        data: image.data,
                        uploadedAt: new Date().toISOString()
                    });
                }
            }

            // Create sighting data with images
            const completeSigntingData = {
                ...sightingData,
                images: processedImages,
                createdAt: new Date().toISOString()
            };

            // Create the new sighting record
            const controller = new WildlifeSightingsController();
            const result = await controller.createSighting(completeSigntingData);

            if (result.status === 'success') {
                // Emit the new sighting to all connected clients via Socket.IO
                const io = req.app.get('io');
                if (io) {
                    io.emit('newSighting', {
                        type: 'NEW_SIGHTING',
                        data: result.data,
                        imageCount: processedImages.length
                    });
                    console.log('New sighting broadcasted via Socket.IO');
                }

                return res.json({
                    success: true,
                    message: `Wildlife sighting recorded successfully${processedImages.length > 0 ? ` with ${processedImages.length} image(s)` : ''}`,
                    data: result.data,
                    imageIds: processedImages.map((_, index) => `${result.data._id}_image_${index}`)
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Create sighting error:", error);
            return res.status(500).json({
                success: false,
                message: "Error creating wildlife sighting",
                error: error.message
            });
        }
    }
    else if (req.body.purpose === 'retrieveAll') {
        try {
            console.log("Retrieving all wildlife sightings");

            var controller = new WildlifeSightingsController();
            var result = await controller.getAllSightings();
            console.log("Retrieve sightings result:", result);
            
            return res.json({
                success: result.status === 'success',
                message: result.message,
                data: result.data || []
            }); 
        } catch (error) {
            console.error("Retrieve sightings error:", error);
            return res.status(500).json({
                success: false,
                message: "Error retrieving wildlife sightings",
                data: []
            });
        }
    }
    else {
        res.status(400).json({
            success: false,
            message: "Invalid purpose. Expected 'newRecord' or 'retrieve'",
            data: null
        });
    }
});


module.exports = router;
