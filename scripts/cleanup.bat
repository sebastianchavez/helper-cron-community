@echo off
echo Stopping Electron processes...
taskkill /F /IM electron.exe /T >nul 2>&1
taskkill /F /IM local-mind.exe /T >nul 2>&1
taskkill /F /IM "LocalMind.exe" /T >nul 2>&1

echo Waiting for processes to close...
timeout /t 3 /nobreak >nul

echo Removing release directory...
if exist "release" (
    attrib -r -h -s "release\*.*" /s /d >nul 2>&1
    rmdir /s /q "release" >nul 2>&1
    if exist "release" (
        echo Warning: Could not remove all files in release directory
        echo Some files may be locked by antivirus or other processes
    ) else (
        echo Release directory cleaned successfully
    )
) else (
    echo Release directory does not exist
)

echo Cleanup completed