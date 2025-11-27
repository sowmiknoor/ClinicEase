#!/usr/bin/env bash
# Start backend and frontend dev servers together.
# Backend runs on 5001, frontend runs on 5000 (so http://localhost:5000 serves the app)
# NOTE: Ensure port 5000 is free before running (see README below for macOS tip).

set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Start backend
echo "Starting backend on port 5001..."
(cd "$ROOT_DIR/backend" && PORT=5001 npm run dev) &
BACKEND_PID=$!

# Give backend a second to boot
sleep 1

# Start frontend

# Kill any stale dev processes we previously launched (safe best-effort)
echo "Cleaning up previous dev processes..."
ps aux | grep "vite" | grep -v grep | awk '{print $2}' | xargs -r kill -INT || true
ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | xargs -r kill -INT || true

# Start backend on 5001
echo "Starting backend on port 5001..."
(cd "$ROOT_DIR/backend" && PORT=5001 npm run dev) &
BACKEND_PID=$!

# Give backend a short moment to boot
sleep 1

# Start frontend on 5173 (Vite default) and open browser
FRONTEND_PORT=5173
echo "Starting frontend on port $FRONTEND_PORT..."
(cd "$ROOT_DIR/frontend" && PORT=$FRONTEND_PORT npm run dev) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Give frontend time to start, then open default browser to the frontend URL
sleep 2
echo "Opening http://localhost:$FRONTEND_PORT in default browser..."
open "http://localhost:$FRONTEND_PORT" || true

echo "To stop: kill $BACKEND_PID $FRONTEND_PID"

wait

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
wait
