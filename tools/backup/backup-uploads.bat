@echo off
setlocal enabledelayedexpansion

set DATE=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set DATE=%DATE: =0%
set SRC=uploads
if not "%1"=="" set SRC=%1
set OUT_DIR=backups\uploads
if not "%2"=="" set OUT_DIR=%2
if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"

tar -czf "%OUT_DIR%\uploads_%DATE%.tar.gz" "%SRC%"
echo Uploads backup saved to %OUT_DIR%\uploads_%DATE%.tar.gz


