const zombieModel = require("../models/zombieModel");
const humanModel = require("../models/humanModel");
const eventModel = require("../models/eventModel");


// Initialize the simulation
const resourceModel = require("../models/resourceModel");
const initializeSimulation = async (req, res) => {
    try {
        await zombieModel.clearZombies();
        await humanModel.clearHumans();
        await resourceModel.clearResources();   
        let num_humans = 10;
        let num_zombies = num_humans;
        let num_resources = num_humans;

        let grid_size = 10;

        for (let i = 0; i < num_humans; i++) {
            await humanModel.addHuman(Math.floor(Math.random() * grid_size), Math.floor(Math.random() * grid_size));
        }

        for (let i = 0; i < num_zombies; i++) {
            await zombieModel.addZombie(Math.floor(Math.random() * grid_size), Math.floor(Math.random() * grid_size));
        }

        for (let i = 0; i < num_resources; i++) {
            await resourceModel.addResource("food", Math.floor(Math.random() * grid_size), Math.floor(Math.random() * grid_size));
            await resourceModel.addResource("water", Math.floor(Math.random() * grid_size), Math.floor(Math.random() * grid_size));
        }



        // await zombieModel.addZombie(0, 0);
        // await zombieModel.addZombie(3, 3);
        // await humanModel.addHuman(1, 1);
        // await humanModel.addHuman(3, 3);

        // await zombieModel.addZombie(1, 1); // Overlapping with human
        // await zombieModel.addZombie(3, 3); // Overlapping with another human
        // await humanModel.addHuman(1, 1); // Overlapping with zombie
        // await humanModel.addHuman(2, 2); // No collision


        // await resourceModel.addResource("food", 2, 3);
        // await resourceModel.addResource("water", 5, 7);

        res.json({ message: "Simulation initialized with resources!" });
    } catch (error) {
        console.error("Error during simulation initialization:", error.message);
        res.status(500).json({ error: "An error occurred during simulation initialization." });
    }
};


// Progress the simulation by one tick
const simulationTick = async (req, res) => {
    try {
        await zombieModel.moveAllZombies(); // Move all zombies
        await humanModel.updateAllHumans(); // Update all humans

        console.log("Checking collisions...");
        const collisions = await zombieModel.checkCollisions();
        for (const { human_id, zombie_id } of collisions) {
            console.log(`Collision detected: Human ${human_id}, Zombie ${zombie_id}`);
            const success = await humanModel.infectHuman(human_id);
            if (success) {
                await eventModel.logEvent("infection", `Human ${human_id} was infected by Zombie ${zombie_id}`);
            }
        }

        res.json({ message: "Simulation tick completed!" });
    } catch (error) {
        console.error("Error during simulation tick:", error.message);
        res.status(500).json({ error: "An error occurred during simulation tick." });
    }
};


// Get current simulation status
const getSimulationStatus = (req, res) => {
    zombieModel.getAllZombies((zombies) => {
        humanModel.getAllHumans((humans) => {
            res.json({ zombies, humans });
        });
    });
};

// Get simulation statistics
const getSimulationData = async (req, res) => {
    try {
        console.log("Fetching all zombies...");
        const zombies = await zombieModel.getAllZombies();

        console.log("Fetching all humans...");
        const humans = await humanModel.getAllHumans();

        console.log("Calculating statistics...");
        const totalEntities = (zombies?.length || 0) + (humans?.length || 0);

        if (totalEntities === 0) {
            return res.json({
                survivalRate: 0,
                infectionRate: 0,
                message: "No entities available to calculate statistics.",
            });
        }

        const survivalRate = humans.length / totalEntities;
        const infectionRate = zombies.length / totalEntities;

        res.json({
            survivalRate: survivalRate.toFixed(2),
            infectionRate: infectionRate.toFixed(2),
            message: "Simulation statistics retrieved.",
        });
    } catch (error) {
        console.error("Error retrieving simulation data:", error.message);
        res.status(500).json({ error: "An error occurred retrieving simulation data." });
    }
};




module.exports = {
    initializeSimulation,
    simulationTick,
    getSimulationStatus,
    getSimulationData,
};

