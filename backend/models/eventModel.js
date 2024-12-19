const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Absolute path to the database
const dbPath = path.resolve(__dirname, "../../database/zombie_simulation.db");
const db = new sqlite3.Database(dbPath);

// Ensure the events table exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            description TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `, (err) => {
        if (err) {
            console.error("Error creating events table:", err.message);
        } else {
            console.log("Events table ensured.");
        }
    });
});

// Log a new event
const logEvent = (type, description) => {
    db.run(
        "INSERT INTO events (type, description) VALUES (?, ?)",
        [type, description],
        (err) => {
            if (err) {
                console.error("Error logging event:", err.message);
            } else {
                console.log(`Event logged: ${type} - ${description}`);
            }
        }
    );
};

// Retrieve all events
const getAllEvents = (callback) => {
    db.all("SELECT * FROM events", [], (err, rows) => {
        if (err) {
            console.error("Error retrieving events:", err.message);
            callback([]);
        } else {
            callback(rows);
        }
    });
};

module.exports = { logEvent, getAllEvents };
