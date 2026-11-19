@echo off
title NovaCommerce Local Web Server
cd /d "%~dp0"
echo Starting NovaCommerce local server...
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
