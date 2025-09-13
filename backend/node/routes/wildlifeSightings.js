const express = require('express');
const router = express.Router();
const WildlifeSightingsController = require('../controllers/wildlifeSightingsController');

// POST route to create new sightings and retrieve all sightings
router.post('/', async function(req, res, next) {
    if (req.body.purpose === 'newRecord') {
        try {
            console.log("Creating new wildlife sighting");
            console.log("Request body:", req.body);

            var controller = new WildlifeSightingsController();
            // Extract sightingData from the request body
            var result = await controller.createSighting(req.body.sightingData);
            console.log("Create sighting result:", result);
            
            // If sighting was created successfully, emit real-time update
            if (result.status === 'success') {
                const io = req.app.get('io');
                if (io) {
                    console.log("Emitting new sighting to all connected clients");
                    io.emit('newSighting', {
                        type: 'NEW_SIGHTING',
                        data: result.data,
                        timestamp: new Date().toISOString()
                    });
                }
            }
            
            return res.json({
                success: result.status === 'success',
                message: result.message,
                data: result.data || null
            }); 
        } catch (error) {
            console.error("Create sighting error:", error);
            return res.status(500).json({
                success: false,
                message: "Error creating wildlife sighting",
                data: null
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
