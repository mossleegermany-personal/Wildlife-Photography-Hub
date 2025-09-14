const express = require('express');
const router = express.Router();
const WildlifeSightingsController = require('../controllers/wildlifeSightingsController');

// POST route to create new sightings and retrieve all sightings
router.post('/', async function(req, res, next) {
    if (req.body.purpose === 'newRecord') 
    {
        try {
            console.log("Uploading images to database");
            console.log("Request body keys:", Object.keys(req.body));

            const { sightingId, images } = req.body;

            if (!sightingId) {
                return res.status(400).json({
                    success: false,
                    message: "Sighting ID is required"
                });
            }

            if (!images || !Array.isArray(images) || images.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Images array is required"
                });
            }

            // Validate and process images
            const processedImages = [];
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

            // Update the sighting with images
            const controller = new WildlifeSightingsController();
            const result = await controller.updateSightingImages(sightingId, processedImages);

            if (result.status === 'success') {
                return res.json({
                    success: true,
                    message: `${processedImages.length} image(s) uploaded successfully`,
                    imageIds: processedImages.map((_, index) => `${sightingId}_image_${index}`)
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Upload images error:", error);
            return res.status(500).json({
                success: false,
                message: "Error uploading images",
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
