const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Absolute path to the database
const dbPath = path.resolve(__dirname, "../../database/zombie_simulation.db");
const db = new sqlite3.Database(dbPath);

// Initialize the resources table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT CHECK(type IN ('food', 'water')),
            x INTEGER NOT NULL,
            y INTEGER NOT NULL
        );
    `, (err) => {
        if (err) {
            console.error("Error creating resources table:", err.message);
        } else {
            console.log("Resources table ensured.");
        }
    });
});

// Clear all resources from the database
const clearResources = () => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM resources", (err) => {
            if (err) {
                console.error("Error clearing resources:", err.message);
                reject(false);
            } else {
                console.log("Resources cleared from the database.");
                resolve(true);
            }
        });
    });
};

// Add a new resource
const addResource = (type, x, y) => {
    return new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO resources (type, x, y) VALUES (?, ?, ?)",
            [type, x, y],
            (err) => {
                if (err) {
                    console.error(`Error adding resource (${type}):`, err.message);
                    reject(false);
                } else {
                    console.log(`Resource (${type}) added at (${x}, ${y}).`);
                    resolve(true);
                }
            }
        );
    });
};

// Get all resources
const getAllResources = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM resources", [], (err, rows) => {
            if (err) {
                console.error("Error retrieving resources:", err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = { clearResources, addResource, getAllResources };
