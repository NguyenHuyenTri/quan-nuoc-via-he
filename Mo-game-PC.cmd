@echo off
cd /d "%~dp0"
where py >nul 2>&1
if not errorlevel 1 (
    py -3 "%~dp0chay-quan-local.py"
) else (
    python "%~dp0chay-quan-local.py"
)
pause
