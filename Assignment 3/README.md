# TailorPro Assignment 3

This project converts the TailorPro landing page into a dynamic product catalog for the assignment.

## Setup Instructions

1. Ensure MongoDB is installed and running locally on `mongodb://localhost:27017`.

2. Install dependencies:
   ```
   npm install
   ```

3. Seed the TailorPro database:
   ```
   npm run seed
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open `http://localhost:3000` in your browser.

## Features

- TailorPro-branded product catalog
- Server-side pagination with 8 items per page
- Search by product name
- Category filters for tailoring services
- Min/max price filtering
- MongoDB-backed dynamic catalog rendered with EJS
