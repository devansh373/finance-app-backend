# Mini Finance App

A full-stack finance application built with **Next.js** (App Router), **Node.js**, **Express**, **MongoDB**, and **JWT authentication**.  
The app supports user transactions, products, and role-based admin access.

---

## Table of Contents

- [Setup Instructions](#setup-instructions)  
- [Environment Variables](#environment-variables)  
- [Running the App](#running-the-app)  
- [API Documentation](#api-documentation)  
- [Folder Structure](#folder-structure)  

---

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/devansh373/finance-app
cd mini-finance-app
```

2. **Install dependencies for backend**

```bash
cd backend
npm install
```

3. **Install dependencies for frontend**

```bash
cd ../frontend
npm install
```

4. **Set up MongoDB**

- Create a MongoDB database (local or cloud).
- Example connection string:

```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/finance-app
```

5. **Set up environment variables**

- Backend `.env`:

```
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=supersecretjwtkey123
```

- Frontend `.env` (Next.js):

```
NEXT_PUBLIC_API_URL=http://localhost:5000
JWT_SECRET=supersecretjwtkey123
```

6. **Run the backend**

```bash
cd backend
npm run dev
```

7. **Run the frontend**

```bash
cd frontend
npm run dev
```

8. **Access the app**

- Frontend: `http://localhost:3000`  
- Backend API: `http://localhost:5000/api`

---

## API Documentation

### Authentication

- **Login**

```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: {
  token: string,
  user: { id, name, email, role }
}
```

- **Register**

```
POST /api/auth/register
Body: {
  name: string,
  email: string,
  password: string
}
Response: {
  token: string,
  user: { id, name, email, role }
}
```

- **Profile**

```
GET /api/auth/profile
Headers: Cookie: token=<JWT>
Response: {
  id: string,
  name: string,
  email: string,
  role: string
}
```

---

### Transactions

- **Get all transactions (admin only)**

```
GET /api/transactions
Headers: Cookie: token=<JWT>
Response: [
  {
    _id,
    units,
    priceAtTxn,
    totalAmount,
    type,
    productId: { _id, name, price },
    userId: { _id, name, email }
  }
]
```

- **Create transaction**

```
POST /api/transactions
Headers: Cookie: token=<JWT>
Body: {
  userId: string,
  productId: string,
  units: number,
  priceAtTxn: number
}
Response: created transaction object
```

---

### Products

- **Get all products**

```
GET /api/products
Response: [
  { _id, name, price }
]
```


---

## Folder Structure (Simplified)

```
backend/
  ├─ models/
  │   ├─ User.ts
  │   ├─ Product.ts
  │   └─ Transaction.ts
  ├─ routes/
  ├─ controllers/
  ├─ middleware/
  └─ server.ts

frontend/
  ├─ app/
  │   ├─ components/
  │   ├─ page.tsx
  │   └─ layout.tsx
  |
  
```

---

## Notes

- **Authentication:** JWT-based with HTTP-only cookies.  
- **Admin routes:** Protected via middleware with role check.  

