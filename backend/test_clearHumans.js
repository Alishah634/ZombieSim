const humanModel = require("./models/humanModel");

humanModel.clearHumans()
    .then((success) => {
        if (success) {
            console.log("Humans cleared successfully!");
        } else {
            console.error("Failed to clear humans.");
        }
    })
    .catch((err) => {
        console.error("Error during clearing humans:", err.message);
    });
