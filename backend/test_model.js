const zombieModel = require("./models/zombieModel");
const humanModel = require("./models/humanModel");

(async () => {
    try {
        const zombies = await zombieModel.getAllZombies();
        console.log("Zombies:", zombies);

        const humans = await humanModel.getAllHumans();
        console.log("Humans:", humans);
    } catch (error) {
        console.error("Error:", error.message);
    }
})();
