@echo off
title Stop STUDIO360 Servers

:: Kill all Node.js processes
taskkill /F /IM node.exe

echo All development servers have been stopped!
pause