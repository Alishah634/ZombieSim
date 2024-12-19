# Zombie Apocalypse Simulation

## Project Structure

```
ZombieSim/
├── backend/             # API logic and server
│   ├── controllers/     # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── utils/           # Helper functions
│   └── index.js         # Entry point
├── database/            # Shared database folder
│   └── zombie_simulation.db
├── frontend/            # Frontend app
│   ├── components/      # Vue components
│   ├── pages/           # Nuxt pages
│   ├── assets/          # Static files
│   └── nuxt.config.js   # Nuxt config
├── game_engine/         # Logic for visualization (Three.js or Unity)
│   ├── threejs_scripts/ # Three.js scripts
│   └── assets/          # Textures and models
└── logs/                # Logs for debugging
```

## Overview
This project simulates a realistic zombie apocalypse. It includes the following components:

### Backend
The backend is built using Express.js and handles:
- API logic and routes
- Database interactions with SQLite
- Core simulation logic (zombie and human behaviors)

### Database
A shared SQLite database (`zombie_simulation.db`) stores:
- Entities (humans, zombies)
- Resources (food, water)
- Events (infections, deaths, resource collection)

### Frontend
The frontend is built using Nuxt.js and Vue.js to:
- Render the simulation map
- Display statistics like infection rates and survival trends
- Provide controls to start, pause, and reset the simulation

### Game Engine
Uses Three.js or Unity to:
- Visualize the simulation in 3D
- Render humans, zombies, and resources dynamically
- Add optional overlays like heatmaps and infection spread

### Logs
Logs are stored in the `logs/` folder for debugging purposes.