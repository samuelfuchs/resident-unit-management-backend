# **Resident Management System - Backend**

## **Description**
This is the backend for the **Resident Management System**, providing APIs to manage users, residents, and units. The backend is built with **Node.js** and **Express** and follows **TypeScript** for robust type safety. It integrates **MongoDB** with **Mongoose** for database operations and supports secure authentication with **JWT**.

---

## **Features**
- **User Management**: Create, update, delete, and retrieve users.
- **Resident Management**: Manage residents, including emergency contacts.
- **Unit Management**: Manage details for residential units.
- **Authentication**: 
  - JWT-based authentication for secure access.
  - Role-based access control (`admin`, `receptionist`, `resident`).
- **Validation**: Input validation with `express-validator`.
- **Error Handling**: Centralized error handling for consistent responses.

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