@echo off
echo Setting up Mobile App...

echo.
echo Installing Expo CLI globally...
call npm install -g @expo/cli

echo.
echo Installing mobile dependencies...
call npm install

echo.
echo Setup completed!
echo.
echo Next steps:
echo 1. Update IP address in src/contexts/AuthContext.js
echo 2. Make sure backend is running on port 3001
echo 3. Run: npm start
echo 4. Scan QR code with Expo Go app
echo.
pause