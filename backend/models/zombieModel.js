const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Absolute path to the database
const dbPath = path.resolve(__dirname, "../../database/zombie_simulation.db");
const db = new sqlite3.Database(dbPath);

// Initialize the zombies table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS zombies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            x INTEGER NOT NULL,
            y INTEGER NOT NULL,
            health INTEGER DEFAULT 100
        );
    `);
});

// Add a new zombie
const addZombie = (x, y) => {
    db.run("INSERT INTO zombies (x, y) VALUES (?, ?)", [x, y], function (err) {
        if (err) {
            console.error("Error adding zombie:", err.message);
        } else {
            console.log(`Zombie added with ID: ${this.lastID}`);
        }
    });
};

// Get all zombies
const getAllZombies = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM zombies", [], (err, rows) => {
            if (err) {
                console.error("Error retrieving zombies:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};


// Move a zombie to a new position
const moveZombie = (id, newX, newY) => {
    db.run(
        "UPDATE zombies SET x = ?, y = ? WHERE id = ?",
        [newX, newY, id],
        function (err) {
            if (err) {
                console.error("Error moving zombie:", err.message);
            } else {
                console.log(`Zombie ${id} moved to (${newX}, ${newY}).`);
            }
        }
    );
};

// Move all zombies (new function)
const moveAllZombies = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM zombies", [], (err, rows) => {
            if (err) {
                console.error("Error retrieving zombies:", err.message);
                reject(err);
            } else {
                rows.forEach((zombie) => {
                    // Example logic: move zombies randomly for now
                    const newX = zombie.x + (Math.random() < 0.5 ? 1 : -1);
                    const newY = zombie.y + (Math.random() < 0.5 ? 1 : -1);

                    db.run(
                        "UPDATE zombies SET x = ?, y = ? WHERE id = ?",
                        [newX, newY, zombie.id],
                        (err) => {
                            if (err) {
                                console.error(`Error moving zombie ${zombie.id}:`, err.message);
                            }
                        }
                    );
                });

                console.log("All zombies moved.");
                resolve();
            }
        });
    });
};



const clearZombies = () => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM zombies", (err) => {
            if (err) {
                console.error("Error clearing zombies:", err.message);
                reject(false);
            } else {
                console.log("Zombies cleared from the database.");
                resolve(true);
            }
        });
    });
};


const checkCollisions = () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT h.id AS human_id, z.id AS zombie_id
             FROM humans h
             JOIN zombies z ON h.x = z.x AND h.y = z.y`,
            [],
            (err, rows) => {
                if (err) {
                    console.error("Error checking collisions:", err.message);
                    reject(err);
                } else {
                    console.log("Collisions detected:", rows);
                    resolve(rows);
                }
            }
        );
    });
};

module.exports = { addZombie, getAllZombies, moveZombie, moveAllZombies, clearZombies, checkCollisions };

