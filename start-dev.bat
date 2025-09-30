@echo off
title STUDIO360 Development Servers

:: Start Frontend
start "Frontend Server" cmd /k "cd frontend && npm run dev"

:: Start Backend
start "Backend Server" cmd /k "cd backend && npm run dev"

:: Start AI Service
start "AI Server" cmd /k "cd ai && npm run dev"

echo All development servers have been started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:8000
echo AI Service: http://localhost:5000

pause