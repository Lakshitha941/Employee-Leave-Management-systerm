@echo off
title LeaveManagement - Backend API (.NET 8)
echo ==============================================
echo  Starting ASP.NET Core 8 Web API...
echo ==============================================
cd /d "%~dp0backend"
dotnet run --launch-profile http
pause
