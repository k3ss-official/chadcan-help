#!/bin/bash

# Start the Flask application with Gunicorn and Eventlet
# This script is used to run the backend server in production

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Export environment variables from .env file if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Start the server with Gunicorn and Eventlet worker
exec gunicorn --worker-class eventlet -w 1 --bind 0.0.0.0:5000 app:app
