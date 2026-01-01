# Hercycle

A full-stack application built with React, Node.js, Express, and MongoDB.

## Project Structure

```
hercycle/
├── client/          # React frontend (Vite)
├── server/          # Node.js backend (Express)
└── README.md
```

## Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- CORS
- dotenv

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Compass (running locally)

### Installation

1. Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Running the Application

1. Make sure MongoDB is running locally on port 27017

2. Start the backend server:
```bash
cd server
npm run dev
```

The server will run on http://localhost:5000

3. Start the frontend (in a new terminal):
```bash
cd client
npm run dev
```

The client will run on http://localhost:5173

### Environment Variables

The server uses the following environment variables (already configured in `.env`):

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017/hercycle)
- `NODE_ENV` - Environment mode (development/production)

## API Endpoints

- `GET /` - Welcome message

## Project Features

- Full-stack monorepo structure
- React frontend with Vite for fast development
- Express backend with MongoDB integration
- Ready for CRUD operations
- CORS enabled for cross-origin requests

## Development

- Frontend hot reload enabled via Vite
- Backend auto-restart enabled via nodemon
