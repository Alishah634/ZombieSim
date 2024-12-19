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
// const moveAllZombies = () => {
//     return new Promise((resolve, reject) => {
//         db.all("SELECT * FROM zombies", [], (err, rows) => {
//             if (err) {
//                 console.error("Error retrieving zombies:", err.message);
//                 reject(err);
//             } else {
//                 rows.forEach((zombie) => {
//                     // Example logic: move zombies randomly for now
//                     const newX = zombie.x + (Math.random() < 0.5 ? 1 : -1);
//                     const newY = zombie.y + (Math.random() < 0.5 ? 1 : -1);

//                     db.run(
//                         "UPDATE zombies SET x = ?, y = ? WHERE id = ?",
//                         [newX, newY, zombie.id],
//                         (err) => {
//                             if (err) {
//                                 console.error(`Error moving zombie ${zombie.id}:`, err.message);
//                             }
//                         }
//                     );
//                 });

//                 console.log("All zombies moved.");
//                 resolve();
//             }
//         });
//     });
// };

const moveAllZombies = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM zombies", [], (err, zombies) => {
            if (err) {
                console.error("Error retrieving zombies:", err.message);
                reject(err);
                return;
            }

            db.all("SELECT * FROM humans", [], (err, humans) => {
                if (err) {
                    console.error("Error retrieving humans:", err.message);
                    reject(err);
                    return;
                }

                if (humans.length === 0) {
                    console.log("No humans to chase.");
                    resolve();
                    return;
                }

                zombies.forEach((zombie) => {
                    // Find the closest human using A* or Dijkstra's
                    const targetHuman = findClosestHuman(zombie, humans);

                    if (targetHuman) {
                        const [nextX, nextY] = aStarPath(zombie, targetHuman);

                        db.run(
                            "UPDATE zombies SET x = ?, y = ? WHERE id = ?",
                            [nextX, nextY, zombie.id],
                            (err) => {
                                if (err) {
                                    console.error(`Error moving zombie ${zombie.id}:`, err.message);
                                }
                            }
                        );
                    }
                });

                console.log("All zombies moved.");
                resolve();
            });
        });
    });
};

// A* Pathfinding function
const aStarPath = (zombie, targetHuman) => {
    const gridSize = 10; // Placeholder grid size
    const start = { x: zombie.x, y: zombie.y };
    const goal = { x: targetHuman.x, y: targetHuman.y };

    const openSet = [start];
    const cameFrom = {};
    const gScore = {};
    const fScore = {};

    // Initialize scores for all nodes
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            gScore[`${x},${y}`] = Infinity;
            fScore[`${x},${y}`] = Infinity;
        }
    }
    gScore[`${start.x},${start.y}`] = 0;
    fScore[`${start.x},${start.y}`] = heuristicCostEstimate(start, goal);

    while (openSet.length > 0) {
        // Sort by fScore and pick the lowest
        openSet.sort((a, b) => fScore[`${a.x},${a.y}`] - fScore[`${b.x},${b.y}`]);
        const current = openSet.shift();

        if (current.x === goal.x && current.y === goal.y) {
            return reconstructPath(cameFrom, current);
        }

        const neighbors = getNeighbors(current, gridSize);

        neighbors.forEach((neighbor) => {
            const tentativeGScore = gScore[`${current.x},${current.y}`] + 1;

            if (tentativeGScore < gScore[`${neighbor.x},${neighbor.y}`]) {
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
                gScore[`${neighbor.x},${neighbor.y}`] = tentativeGScore;
                fScore[`${neighbor.x},${neighbor.y}`] =
                    gScore[`${neighbor.x},${neighbor.y}`] + heuristicCostEstimate(neighbor, goal);

                if (!openSet.some((node) => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor);
                }
            }
        });
    }

    console.warn("No valid path found. Zombie stays in place.");
    return [zombie.x, zombie.y];
};

const reconstructPath = (cameFrom, current) => {
    const path = [];
    let node = `${current.x},${current.y}`;
    while (cameFrom[node]) {
        const { x, y } = cameFrom[node];
        path.unshift({ x, y });
        node = `${x},${y}`;
    }

    if (path.length === 0) {
        console.warn("Path reconstruction failed. Returning current position.");
        return [current.x, current.y];
    }

    return [path[0].x, path[0].y]; // Return the first step
};


// Heuristic function for A* (Manhattan distance)
const heuristicCostEstimate = (start, goal) => {
    return Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y);
};

// Get valid neighbors for a node
const getNeighbors = (node, gridSize) => {
    const { x, y } = node;
    const neighbors = [];

    if (x > 0) neighbors.push({ x: x - 1, y }); // Left
    if (x < gridSize - 1) neighbors.push({ x: x + 1, y }); // Right
    if (y > 0) neighbors.push({ x, y: y - 1 }); // Up
    if (y < gridSize - 1) neighbors.push({ x, y: y + 1 }); // Down

    return neighbors;
};

// Find the closest human to the zombie
const findClosestHuman = (zombie, humans) => {
    let closestHuman = null;
    let closestDistance = Infinity;

    humans.forEach((human) => {
        const distance = heuristicCostEstimate(
            { x: zombie.x, y: zombie.y },
            { x: human.x, y: human.y }
        );

        if (distance < closestDistance) {
            closestHuman = human;
            closestDistance = distance;
        }
    });

    return closestHuman;
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

