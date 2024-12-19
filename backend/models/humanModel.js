const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Absolute path to the database
const dbPath = path.resolve(__dirname, "../../database/zombie_simulation.db");
const db = new sqlite3.Database(dbPath);

// Initialize the humans table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS humans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            x INTEGER NOT NULL,
            y INTEGER NOT NULL,
            health INTEGER DEFAULT 100,
            hunger INTEGER DEFAULT 100,
            thirst INTEGER DEFAULT 100
        );
    `);
});

// Move the human to the new position
const updateHumanStatus = (id, health, hunger, thirst) => {
    db.run(
        "UPDATE humans SET health = ?, hunger = ?, thirst = ? WHERE id = ?",
        [health, hunger, thirst, id],
        function (err) {
            if (err) {
                console.error("Error updating human status:", err.message);
            } else {
                console.log(`Human ${id} status updated.`);
            }
        }
    );
};

// Add a new human
const addHuman = (x, y) => {
    db.run("INSERT INTO humans (x, y) VALUES (?, ?)", [x, y], function (err) {
        if (err) {
            console.error("Error adding human:", err.message);
        } else {
            console.log(`Human added with ID: ${this.lastID}`);
        }
    });
};

// Get all humans
const getAllHumans = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM humans", [], (err, rows) => {
            if (err) {
                console.error("Error retrieving humans:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const clearHumans = () => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM humans", (err) => {
            if (err) {
                console.error("Error clearing humans:", err.message);
                reject(false);
            } else {
                console.log("Humans cleared from the database.");
                resolve(true);
            }
        });
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

const infectHuman = (humanId) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT x, y FROM humans WHERE id = ?`,
            [humanId],
            (err, row) => {
                if (err) {
                    console.error("Error fetching human position:", err.message);
                    reject(err);
                } else if (!row) {
                    console.error(`No human found with ID: ${humanId}`);
                    resolve(false); // Resolve as infection unsuccessful
                } else {
                    // Add a new zombie at the human's position
                    db.run(
                        `INSERT INTO zombies (x, y, health) VALUES (?, ?, 100)`,
                        [row.x, row.y],
                        (err) => {
                            if (err) {
                                console.error("Error infecting human:", err.message);
                                reject(err);
                            } else {
                                // Remove the human from the database
                                db.run(
                                    `DELETE FROM humans WHERE id = ?`,
                                    [humanId],
                                    (err) => {
                                        if (err) {
                                            console.error("Error removing infected human:", err.message);
                                            reject(err);
                                        } else {
                                            console.log(`Human ${humanId} was infected and converted to a zombie.`);
                                            resolve(true);
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    });
};

const replenishStatus = (humanId, resourceType) => {
    const column = resourceType === "food" ? "hunger" : "thirst";
    db.run(
        `UPDATE humans SET ${column} = 100 WHERE id = ?`,
        [humanId],
        (err) => {
            if (err) {
                console.error(`Error replenishing ${resourceType}:`, err.message);
            } else {
                console.log(`Human ${humanId}'s ${resourceType} replenished.`);
            }
        }
    );
};

const updateAllHumans = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM humans", [], (err, rows) => {
            if (err) {
                console.error("Error retrieving humans for update:", err.message);
                reject(err);
            } else {
                rows.forEach((human) => {
                    let newHunger = Math.max(0, human.hunger - 10);
                    let newThirst = Math.max(0, human.thirst - 10);
                    let newHealth = human.health;

                    // Reduce health if hunger or thirst is 0
                    if (newHunger === 0 || newThirst === 0) {
                        newHealth = Math.max(0, newHealth - 10);
                    }

                    db.run(
                        "UPDATE humans SET hunger = ?, thirst = ?, health = ? WHERE id = ?",
                        [newHunger, newThirst, newHealth, human.id],
                        (err) => {
                            if (err) {
                                console.error(`Error updating human ${human.id}:`, err.message);
                            }
                        }
                    );
                });
                console.log("All humans updated.");
                resolve();
            }
        });
    });
};

module.exports = { addHuman, getAllHumans, clearHumans, infectHuman, replenishStatus, updateAllHumans };

