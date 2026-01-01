@echo off
echo 🌱 Seeding Demo Data for hoantq58@gmail.com
echo.
echo This script will create:
echo - User: hoantq58@gmail.com (password: 123456)
echo - 10 Sample Accounts (Netflix, Spotify, etc.)
echo - 10 Sample Subscriptions with realistic data
echo.
echo Make sure backend server is running on port 3001
echo.
pause

cd backend
echo Running data seeding script...
echo.
node seed-data.js

echo.
echo ✅ Demo data seeding completed!
echo.
echo You can now login to the web app:
echo 🌐 Web: http://localhost:5173
echo 📧 Email: hoantq58@gmail.com
echo 🔑 Password: 123456
echo.
pause