# Assignment 4 - E-Commerce Administration & Management System

This folder contains the Assignment 4 implementation for the TailorPro e-commerce app.

## Features
- Admin panel at `/admin/dashboard`
- Product CRUD with create, edit, and delete actions
- Image upload support using Multer
- Images stored under `/public/uploads`
- Admin login guard with session-based access

## Setup
1. Navigate to the folder:
   ```bash
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database:
   ```bash
   npm run seed
   ```
4. Start the application:
   ```bash
   npm start
   ```

## Usage
- Open `http://localhost:3000/products` to view the public catalog.
- Open `http://localhost:3000/admin/login` to access the admin panel.
- Admin password: `admin123`

## Notes
- Uploaded images are saved to `/public/uploads`.
- If no image is uploaded, the default SVG placeholder is used.
