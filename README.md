# Holiday Itinerary Access Interface

A lightweight, high-performance holiday itinerary web application designed for static hosting on **GitHub Pages**.

Load any CSV itinerary file, and the interface automatically computes and populates your active location, hotel stay, and daily schedule based on the **current date**.

## Key Features

- **Current Date Population**: Automatically pinpoints where you are right now, displays today's schedule, overnight accommodation, and direct Google Maps navigation links.
- **Flexible CSV Loader**: Drag & drop or paste any itinerary CSV (supports columns like `Date`, `Time`, `Location`, `Activity`, `Category`, `Accommodation`, `Notes`, `Cost`).
- **Date Simulator / Time Machine**: Allows you to simulate any day of your trip to preview past or upcoming days before you depart.
- **Visual Route Progression**: Chronological journey line showing visited, active, and upcoming cities.
- **Search & Filters**: Instant search across events, booking references, and categories (Flight, Transport, Hotel, Sightseeing, Food, Activity).
- **100% Offline Capable**: Uses client-side storage (`localStorage`) so your itinerary is preserved without requiring internet or a backend server.
- **Sample CSV Template**: Built-in template generator to download and edit in Excel, Numbers, or Google Sheets.

## Hosting on GitHub Pages

This app is configured with `base: './'` for standalone static deployment:

1. Push this repository to GitHub.
2. In your repository on GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The automated workflow in `.github/workflows/deploy.yml` will automatically build and publish your site upon every commit to `main`.
