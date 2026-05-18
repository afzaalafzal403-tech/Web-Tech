# Lab Assignment 3: User Authentication & Role-Based Access Control

## Overview
This is a secure e-commerce platform with a robust authentication system. Users can create accounts, log in securely, and distinguish between standard customers and administrators. The system includes hashed passwords, session management, role-based access control, and flash messages for user feedback.

## Features Implemented

### 1. User Model & Registration ✓
- **User Schema** with fields:
  - `name`: User's full name
  - `email`: Unique email address with validation
  - `password`: Hashed using bcryptjs (never stored in plain text)
  - `role`: Either "customer" or "admin" (defaults to "customer")
  - `createdAt`: Timestamp of account creation

- **Password Hashing**: 
  - Uses bcryptjs with salt rounds of 10
  - Passwords hashed before saving to database
  - Passwords never stored in plain text

- **Validation**:
  - Emails must be unique
  - Passwords must be at least 6 characters
  - Valid email format required
  - All fields required on registration

### 2. Login & Session Management ✓
- **Customer Login**: 
  - Email and password verification
  - Password comparison using bcryptjs
  - Session creation on successful login

- **Admin Login**: 
  - Separate admin login with email + password
  - Admin role verification
  - Dedicated admin session

- **Session Management**:
  - Express-session for session handling
  - MongoDB store for persistent sessions
  - 24-hour session timeout
  - Secure session secrets

- **Dynamic UI**:
  - Navigation shows "Login/Register" for guests
  - Shows "Welcome [Name], My Profile, Logout" for logged-in customers
  - Shows "Welcome [Name], Admin Dashboard, Logout" for admin users

### 3. Authorization Middleware ✓
- **isLoggedIn Middleware**: 
  - Protects routes requiring authentication
  - Redirects unauthenticated users to login
  - Flash error message displayed

- **isAdmin Middleware**:
  - Checks if logged-in user has admin role
  - Protects all admin routes
  - Redirects non-admin users with "Access Denied" message
  - Applied to all /admin routes

- **Security**:
  - Admin routes protected at app.use level
  - Only admin users can access admin panel
  - Regular customers redirected if attempting admin access

### 4. Flash Messages ✓
- **Integration**: connect-flash for user feedback
- **Message Types**:
  - Success: "Welcome back, [Name]!", account creation success
  - Error: Invalid credentials, duplicate email, password mismatch
  - Info: Various informational messages

- **Display**: Messages shown in navigation area
- **Auto-clear**: Messages cleared after display

## Project Structure

```
Lab Assignment 3/
├── models/
│   ├── Product.js        # Product schema
│   ├── User.js           # User schema with auth
│   └── Order.js          # Order model for customer checkout
├── views/
│   ├── products/
│   │   └── index.ejs     # Main catalog with auth nav
│   ├── admin/
│   │   ├── login.ejs     # Admin login
│   │   ├── dashboard.ejs # Admin dashboard
│   │   ├── orders.ejs    # Admin order management
│   │   └── form.ejs      # Product form
│   ├── auth/
│   ├── cart.ejs         # Shopping cart page
│   ├── checkout.ejs     # Checkout form page
│   └── orders.ejs       # Customer order history
│       ├── register.ejs  # Customer registration
│       ├── login.ejs     # Customer login
│       └── profile.ejs   # User profile
├── public/
│   ├── style.css
│   └── uploads/
├── server.js             # Main server with auth routes
├── seed.js               # Database seeding with users
├── package.json
└── README.md
```

## Installation & Setup

### 1. Prerequisites
- Node.js installed
- MongoDB running on `mongodb://localhost:27017`

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database
```bash
npm run seed
```
 
This will create:
- **Admin User**: 
  - Email: `admin@tailorpro.com`
  - Password: `admin123`
  
- **Test Customers**:
  - Email: `john@example.com` / Password: `password123`
  - Email: `jane@example.com` / Password: `password123`

### 4. Start Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server runs on `http://localhost:3000`

## Routes

### Public Routes
- `GET /` - Redirect to products
- `GET /products` - Browse catalog (all users can see)
- `GET /register` - Registration page
- `POST /register` - Create new account
- `GET /login` - Customer login page
- `POST /login` - Process login
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Process admin login

### Protected Routes (Login Required)
- `GET /profile` - View user profile
- `GET /cart` - View cart contents
- `POST /cart/add/:id` - Add a product to cart
- `POST /cart/remove/:id` - Remove a product from cart
- `GET /checkout` - Checkout and enter shipping details
- `POST /checkout` - Place an order
- `GET /orders` - View your orders
- `GET /logout` - Logout current user

### Admin Routes (Admin Only)
- `GET /admin/dashboard` - View all products
- `GET /admin/products/new` - Add product form
- `POST /admin/products` - Create product
- `GET /admin/products/:id/edit` - Edit product form
- `PUT /admin/products/:id` - Update product
- `DELETE /admin/products/:id` - Delete product
- `GET /admin/logout` - Admin logout

## Testing the System

### Test Customer Registration
1. Visit `http://localhost:3000/register`
2. Fill form with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123 (min 6 chars)
   - Confirm Password: password123
3. Click Register
4. Success message displayed, session created
5. Redirected to products page
6. Navigation shows: "Welcome Test User, My Profile, Logout"

### Test Customer Login
1. Visit `http://localhost:3000/login`
2. Enter: john@example.com / password123
3. Flash success message
4. Redirected to products page
5. Navigation updated with user info

### Test Admin Login
1. Visit `http://localhost:3000/admin/login`
2. Enter: admin@tailorpro.com / admin123
3. Access to `/admin/dashboard` granted
4. Can add/edit/delete products

### Test Cart and Checkout
1. Visit `http://localhost:3000/products`
2. Add one or more items to the cart using the "Add to Cart" button
3. If not logged in, you will be redirected to login before adding
4. Visit `http://localhost:3000/cart` to review your cart
5. Click "Proceed to Checkout" and provide shipping address, city, state, and zip
6. Visit `http://localhost:3000/orders` to verify your order history

### Test Access Control
1. Logout from admin account
2. Try to access `http://localhost:3000/admin/dashboard`
3. Flash error: "Access Denied. Only admins can access this area."
4. Redirected to home page

### Test Product Management (Admin Only)
1. Login as admin
2. Dashboard shows all products with edit/delete buttons
3. Add new product via "New Product" link
4. Edit existing products
5. Delete products
6. Logout removes admin access to these routes

## Security Features

✓ **Password Security**:
- bcryptjs hashing with 10 salt rounds
- No plain-text passwords in database
- Password comparison using secure compare

✓ **Session Security**:
- Server-side session storage in MongoDB
- Secure session secrets
- 24-hour timeout
- HttpOnly cookies (via express-session defaults)

✓ **Authentication**:
- Email uniqueness enforced
- Email format validation
- Password length requirements
- Role-based authorization

✓ **RBAC (Role-Based Access Control)**:
- isAdmin middleware on all admin routes
- Role checked against user.role field
- Customers cannot access admin routes

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['customer', 'admin']),
  createdAt: Date
}
```

### Product Collection
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  category: String,
  rating: Number,
  stock: Number,
  image: String
}
```

### Session Collection (auto-created by connect-mongo)
```javascript
{
  _id: String,
  expires: Date,
  session: Object (contains user data)
}
```

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **connect-mongo**: MongoDB session store
- **connect-flash**: Flash messages
- **ejs**: Templating engine
- **multer**: File upload for product images
- **method-override**: HTTP method override



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
