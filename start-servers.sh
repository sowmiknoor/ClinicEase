#!/bin/bash

# Kill any existing processes
pkill -9 -f "vite" 2>/dev/null
pkill -9 -f "node.*server.js" 2>/dev/null
sleep 2

# Start backend
cd /Users/sowmiknoor/Desktop/ClinicEase/backend
npm run dev > /tmp/backend-clinicease.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 3

# Start frontend
cd /Users/sowmiknoor/Desktop/ClinicEase/frontend
npm run dev > /tmp/frontend-clinicease.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for servers to fully start
sleep 3

# Check if servers are running
echo ""
echo "Checking server status..."
lsof -i :5001 -i :5173 | grep LISTEN

echo ""
echo "Backend logs: tail -f /tmp/backend-clinicease.log"
echo "Frontend logs: tail -f /tmp/frontend-clinicease.log"
echo ""
echo "To stop servers: pkill -9 -f 'vite'; pkill -9 -f 'node.*server.js'"
