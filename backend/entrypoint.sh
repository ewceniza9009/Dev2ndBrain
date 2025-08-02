#!/bin/bash

# This script will run database migrations and then start the main application.
# It's a reliable way to ensure the database is ready before the app starts.

echo "Applying database migrations..."
dotnet ef database update

echo "Starting application..."
dotnet run --project /app/backend.csproj
