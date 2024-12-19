#!/bin/bash

# Remove the database and restart the server (optional)
# rm -f ../database/zombie_simulation.db && node index.js 

# Initialize the simulation
curl -X POST http://localhost:3000/simulation/initialize

# Number of ticks to simulate
NUM_TICKS=50

# Loop for ticks and data fetches
for ((i = 1; i <= NUM_TICKS; i++)); do
    echo "Simulation Tick: $i"
    curl -X POST http://localhost:3000/simulation/tick
    curl http://localhost:3000/simulation/data
    echo -e "\n"  # Add a newline for readability between iterations
done

# Uncomment to fetch status
# curl -X GET http://localhost:3000/simulation/status
# echo "status "

# Uncomment for custom logging
# echo "Tick "
# echo "data "
