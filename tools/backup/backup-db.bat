@echo off
setlocal enabledelayedexpansion

set DATE=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set DATE=%DATE: =0%
set OUT_DIR=backups\db
if not "%1"=="" set OUT_DIR=%1
if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"

if "%DATABASE_URL%"=="" (
  echo DATABASE_URL not set
  exit /b 1
)

pg_dump "%DATABASE_URL%" > "%OUT_DIR%\backup_%DATE%.sql"
echo Database backup saved to %OUT_DIR%\backup_%DATE%.sql


