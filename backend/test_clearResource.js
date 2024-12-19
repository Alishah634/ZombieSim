const resourceModel = require("./models/resourceModel");

resourceModel.clearResources()
    .then((success) => {
        if (success) {
            console.log("Resources cleared successfully!");
        } else {
            console.error("Failed to clear resources.");
        }
    })
    .catch((err) => {
        console.error("Error during clearing resources:", err.message);
    });
