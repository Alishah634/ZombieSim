const express = require("express");
const router = express.Router();
const simulationController = require("../controllers/simulationController");

// Routes
router.post("/initialize", simulationController.initializeSimulation);
router.post("/tick", simulationController.simulationTick);
router.get("/status", simulationController.getSimulationStatus);
router.get("/data", simulationController.getSimulationData);

module.exports = router;
