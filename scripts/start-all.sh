#!/usr/bin/env bash
# Start backend and frontend dev servers together.
# Backend runs on 5001, frontend runs on 5173 (Vite default)
# NOTE: Ensure ports are free before running.

set -e
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Kill any stale dev processes we previously launched (safe best-effort)
echo "Cleaning up previous dev processes..."
ps aux | grep "vite" | grep -v grep | awk '{print $2}' | xargs kill -INT 2>/dev/null || true
ps aux | grep "node server.js" | grep -v grep | awk '{print $2}' | xargs kill -INT 2>/dev/null || true

# Ensure dependencies are installed
echo "Installing backend dependencies..."
(cd "$ROOT_DIR/backend" && npm install) > /dev/null 2>&1

echo "Installing frontend dependencies..."
(cd "$ROOT_DIR/frontend" && npm install) > /dev/null 2>&1

# Start backend on 5001
echo "Starting backend on port 5001..."
(cd "$ROOT_DIR/backend" && PORT=5001 npm run dev) &
BACKEND_PID=$!

# Give backend a short moment to boot
sleep 2

# Start frontend on 5173 (Vite default) and open browser
FRONTEND_PORT=5001
echo "Starting frontend on port $FRONTEND_PORT..."
(cd "$ROOT_DIR/frontend" && npm run dev) &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

# Give frontend time to start, then open default browser to the frontend URL
sleep 3
echo "Opening http://localhost:$FRONTEND_PORT in default browser..."
open "http://localhost:$FRONTEND_PORT" || true

echo ""
echo "✓ Both servers are running!"
echo "  Frontend: http://localhost:$FRONTEND_PORT"
echo "  Backend: http://localhost:5001"
echo ""
echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
echo ""

wait
echo "Frontend PID: $FRONTEND_PID"

echo "To stop: kill $BACKEND_PID $FRONTEND_PID"
wait
