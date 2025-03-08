# **Resident Management System - Backend**

## What I Learned

Throughout this project, I enhanced my skills by:
- Building a complete **end-to-end** solution using an **industry-standard** tech stack.
- Gaining deeper expertise in **TypeScript**, ensuring improved type safety and better development practices.
- Applying **MongoDB** and **Mongoose** for scalable and efficient database management.
- Implementing secure **JWT authentication** to manage user sessions and protect resources.
- Structuring the project following a **clean and modular architecture** for maintainability and scalability.
- Documenting the development journey to track progress and highlight technical decisions.

## **Description**
This is the backend for the Resident Management System, designed to manage users, residents, and units efficiently.

Built with **Node.js** and **Express**, the project leverages **TypeScript** to ensure robust type safety and improved code maintainability. For data persistence, it integrates **MongoDB** using **Mongoose** for flexible and powerful database operations.

The system also features secure authentication via **JWT**, ensuring data protection and controlled access to resources.

## Key Features
- TypeScript for improved type safety and development experience.
- Node.js + Express for fast and scalable API development.
- MongoDB + Mongoose for flexible schema design and efficient database queries.
- JWT Authentication to enhance security and manage user sessions.
- Modular Architecture with clear separation of concerns (controllers/, models/, routes/, etc.).

## Folder Structure
``` bash
/src
 ├── config/         # Configuration settings
 ├── controllers/    # Route handlers and business logic
 ├── middlewares/    # Middleware for request processing
 ├── models/         # MongoDB schemas with Mongoose
 ├── routes/         # API route definitions
 ├── types/          # TypeScript types
 ├── index.ts        # Application entry point
```

## Business Rules

### User Roles and Permissions
- **Admin**:
  - Can create, update, and delete any user, including admins.
  - Can manage all resident and receptionist data.
  - Has access to all features and data.

- **Receptionist**:
  - Can create and update users but cannot create or update users with the `admin` role.
  - Cannot delete any user.
  - Can view and manage residents and units but with limited permissions.

- **Resident**:
  - Cannot create, update, or delete any user.
  - Has access to personal data and can view their own details.

---

### Authentication and Authorization
- **Token-Based Authentication**:
  - Users must log in to receive a token for accessing protected routes.
  - Tokens are signed using `jsonwebtoken` with an expiration of 1 day.

- **Protected Routes**:
  - All routes require authentication via a valid token.
  - `req.user` is populated using the `authMiddleware`.

- **Role Validation**:
  - Users are validated against their roles for access to specific features (e.g., a receptionist cannot create an admin).
  
- **Forgot Password**:
  - Users can request a password reset token via the `/forgot-password` endpoint.
  - A one-time token is generated and sent as part of a URL.

- **Reset Password**:
  - Users can reset their password using the token provided via `/reset-password/:token`.
  - Tokens are single-use and have a predefined expiration time.

---

### User Management
- **Create User**:
  - Admins and receptionists can create users with specific roles.
  - Passwords are securely hashed before being stored in the database.
  - Validation ensures only valid roles (`admin`, `receptionist`, `resident`) are assigned.

- **Update User**:
  - Admins can update any user details.
  - Receptionists can update details but cannot modify the `role` of a user to `admin`.

- **Delete User**:
  - Only admins can delete users.
  - Receptionists and residents cannot delete any user.

- **Search and Filtering**:
  - Users can be searched by fields such as `name`, `email`, `phone`, and more.
  - Partial searches are supported, including handling of special characters (e.g., `ç`, `à`).
  - Filtering by `role` is supported.

- **Pagination and Sorting**:
  - Data can be paginated using `page` and `limit` query parameters.
  - Sorting is supported on specific fields like `name`, `email`, and `createdAt`.

- **Self-Data Endpoint**:
  - `/me` endpoint allows authenticated users to fetch their own data.

---

### Additional Rules
- **Emergency Contacts**:
  - Emergency contacts can be added to a user with fields like `name`, `phone`, and `relationship`.

- **Normalization**:
  - Search fields are normalized to handle special characters and provide a better user experience.
  - Both search input and database fields are normalized dynamically.

- **Default Status**:
  - New users are assigned a default status of `active`.

---

## **Technologies Used**
- **Node.js**: Runtime environment.
- **Express**: Web framework.
- **TypeScript**: Static typing.
- **MongoDB**: NoSQL database.
- **Mongoose**: ODM for MongoDB.
- **bcrypt**: Password hashing.
- **jsonwebtoken (JWT)**: Authentication.
- **dotenv**: Environment variable management.

---

## **Setup Instructions**

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/resident-management-backend.git
cd resident-management-backend
```

### **2. Install Dependencies**
```bash
npm install
```


### **3. Set Up Environment Variables**
Create a .env file in the root directory with the following variables:
```bash
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
```

### **4. Set Up Environment Variables**
```bash
npm run dev
```