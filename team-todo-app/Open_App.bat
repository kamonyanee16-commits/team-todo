@echo off
chcp 65001 > nul
set "HTML_PATH=%~dp0index.html"

echo ========================================================
echo   กำลังเปิดระบบ TeamTask Hub...
echo ========================================================

:: 1. ลองเปิดด้วย Google Chrome
where chrome >nul 2>nul
if %errorlevel% equ 0 (
    echo กำลังเปิดผ่าน Google Chrome...
    start chrome "%HTML_PATH%"
    exit /b
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo กำลังเปิดผ่าน Google Chrome...
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%HTML_PATH%"
    exit /b
)

if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo กำลังเปิดผ่าน Google Chrome...
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%HTML_PATH%"
    exit /b
)

if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    echo กำลังเปิดผ่าน Google Chrome...
    start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%HTML_PATH%"
    exit /b
)

:: 2. ลองเปิดด้วย Microsoft Edge
where msedge >nul 2>nul
if %errorlevel% equ 0 (
    echo กำลังเปิดผ่าน Microsoft Edge...
    start msedge "%HTML_PATH%"
    exit /b
)

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    echo กำลังเปิดผ่าน Microsoft Edge...
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" "%HTML_PATH%"
    exit /b
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    echo กำลังเปิดผ่าน Microsoft Edge...
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" "%HTML_PATH%"
    exit /b
)

:: 3. ใช้ Default Browser ของเครื่อง
echo กำลังเปิดผ่าน Default Browser...
start "" "%HTML_PATH%"

pause
