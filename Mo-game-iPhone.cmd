@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Can cai Node.js LTS 22 tro len tu https://nodejs.org/
) else (
  node "%~dp0iphone-comments.cjs"
)
pause
