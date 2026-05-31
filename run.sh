#!/bin/bash
#
# GJP Open Web - Run Script
# ==========================
# Starts the gjp-open-web-react application using Vite.
#
# Usage:
#   ./run.sh          # run development server (default)
#   ./run.sh --build  # build for production
#   ./run.sh --stop   # stop any running instance on port 3001
#

set -euo pipefail

# ── Resolve project directory ────────────────────────────────────────────────
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${PROJECT_DIR}"

# ── Parse arguments ──────────────────────────────────────────────────────────
COMMAND="dev"
STOP_ONLY=false

while [[ $# -gt 0 ]]; do
    case "$1" in
        --build) COMMAND="build"; shift ;;
        --dev)   COMMAND="dev";   shift ;;
        --stop)  STOP_ONLY=true;  shift ;;
        --help)
            echo "Usage: $0 [--dev|--build] [--stop]"
            echo ""
            echo "Options:"
            echo "  --dev     Run development server (default)"
            echo "  --build   Build for production"
            echo "  --stop    Stop any running instance on port 3001 and exit"
            echo "  --help    Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# ── Stop any running instance on port 3001 ───────────────────────────────────
PIDS=$(lsof -ti:3001 2>/dev/null || true)
if [[ -n "${PIDS}" ]]; then
    echo "Stopping existing instance on port 3001 (PID: ${PIDS})..."
    echo "${PIDS}" | xargs kill -9 2>/dev/null || true
    sleep 1
    echo "Stopped."
fi

if [[ "${STOP_ONLY}" == true ]]; then
    [[ -z "${PIDS}" ]] && echo "No running instance found on port 3001."
    exit 0
fi

# ── Check for node_modules ──────────────────────────────────────────────────
if [[ ! -d "node_modules" ]]; then
    echo "node_modules not found. Installing dependencies..."
    npm install
fi

# ── Run the application ─────────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  GJP Open Web - Starting (${COMMAND})"
echo "============================================"
echo ""

if [[ "${COMMAND}" == "build" ]]; then
    echo "Building for production..."
    npm run build
else
    echo "Starting Vite development server..."
    npm run dev
fi
