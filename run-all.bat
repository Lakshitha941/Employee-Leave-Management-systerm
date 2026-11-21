@echo off
title LeaveManagement - Launcher
echo ==============================================
echo  Launching Employee Leave Management System
echo ==============================================
echo 1. Starting Backend API on http://localhost:5000 ...
start "Backend API" "%~dp0run-backend.bat"

echo 2. Starting Frontend on http://localhost:5173 ...
start "Frontend React" "%~dp0run-frontend.bat"

echo ==============================================
echo Servers are launching...
timeout /t 5 >nul
start http://localhost:5173
