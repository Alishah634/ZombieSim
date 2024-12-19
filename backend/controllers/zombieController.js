const zombieModel = require("../models/zombieModel");

const clearZombies = () => {
    db.run("DELETE FROM zombies", (err) => {
        if (err) {
            console.error("Error clearing zombies:", err.message);
        } else {
            console.log("Zombies cleared from the database.");
        }
    });
};


const moveZombie = (req, res) => {
    const { id, newX, newY } = req.body;
    db.run("UPDATE zombies SET x = ?, y = ? WHERE id = ?", [newX, newY, id], function (err) {
        if (err) {
            console.error("Error moving zombie:", err.message);
            res.status(500).json({ error: "Failed to move zombie." });
        } else {
            res.json({ message: `Zombie ${id} moved to (${newX}, ${newY}).` });
        }
    });
};


const getZombieStatus = (req, res) => {
    zombieModel.getAllZombies((zombies) => {
        res.json({ zombies });
    });
};

const checkCollisions = (callback) => {
    db.all(
        `SELECT h.id AS human_id, z.id AS zombie_id
         FROM humans h
         JOIN zombies z ON h.x = z.x AND h.y = z.y`,
        [],
        (err, rows) => {
            if (err) {
                console.error("Error checking collisions:", err.message);
                callback([]);
            } else {
                callback(rows);
            }
        }
    );
};


module.exports = { addZombie, getAllZombies, clearZombies };

