const zombieModel = require("./models/zombieModel");

(async () => {
    try {
        const collisions = await zombieModel.checkCollisions();
        console.log("Collisions:", collisions);
    } catch (error) {
        console.error("Error during collision check:", error.message);
    }
})();
