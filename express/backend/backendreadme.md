# 🚀 Backend API Setup and Run Guide

This guide provides the steps necessary to set up, install dependencies, generate the Prisma client, and start the backend Express server.

## 🛠️ Prerequisites

Before starting, ensure you have the following:

- Node.js and npm (Node Package Manager)
- A .env file in the backend/ directory with necessary environment variables.

## ⚙️ Setup and Installation

Follow these steps in your terminal:

### 1. Navigate to the Project
```bash
cd express
cd backend
```

### 2. Install Dependencies

Install required packages and the Prisma client:
```bash
npm install
npm install @prisma/client
```

### 3. Generate Prisma Client

This step must be run every time your Prisma schema changes:
```bash
npx prisma generate
```

## 🏃 Running the Server

### 4. Start the API
```bash
npm start
```

#### Expected Console Output

The server is ready when you see this output:
```
> backend@0.0.0 start
> node ./bin/www

[dotenv@17.2.3] injecting env (5) from .env -- tip: 🔄 add secrets lifecycle management: https://dotenvx.com/ops
Server running on port 8080
Access the API at http://localhost:8080/
```

## ✅ Verification

Access the API in your browser to confirm it is running.

### Browser Test URL
http://localhost:8080

### Expected Output (JSON)
```json
{
  "status": "ok",
  "message": "API is running"
}
```

If you see this response, your backend is operational!