# IoT Dashboard Blueprint

## Overview

This document outlines the plan for creating an IoT dashboard to monitor sensor values and fire risk from a Firebase Realtime Database.

## Implemented Features

This is the initial version of the application.

## Current Plan

1.  **Set up Firebase:**
    *   Configure Firebase MCP in `.idx/mcp.json`.
    *   Install the Firebase SDK (`firebase`).
    *   Create a `src/firebase.js` file to initialize Firebase.
2.  **Create UI Components:**
    *   `Dashboard.jsx`: The main component that will hold all other components.
    *   `SensorCard.jsx`: A reusable component to display individual sensor values.
    *   `StatusCard.jsx`: A component to display the fire risk status and probability.
    *   `AlarmButton.jsx`: A component for the button to turn off the fire alarm.
3.  **Fetch Data from Firebase:**
    *   Use the `onValue` listener from the Firebase Realtime Database SDK to get real-time updates.
4.  **Update Data in Firebase:**
    *   Use the `set` or `update` function to change the alarm status in Firebase when the button is pressed.
5.  **Styling:**
    *   Apply modern design principles to create a visually appealing and intuitive dashboard.
    *   Use CSS for styling, with a focus on a clean and responsive layout.
