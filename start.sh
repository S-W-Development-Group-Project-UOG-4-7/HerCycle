#!/bin/bash

echo "========================================"
echo "  Starting Hercycle Application"
echo "========================================"
echo ""

echo "[1/2] Starting Backend Server..."
cd server
npm run dev &
BACKEND_PID=$!

sleep 3

echo "[2/2] Starting Frontend Server..."
cd ../client
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "  Hercycle is Running!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "========================================"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
