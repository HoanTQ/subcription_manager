@echo off
echo Installing dependencies...

echo.
echo Installing root dependencies...
call npm install

echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Setup completed!
echo.
echo To run the application:
echo   npm run dev
echo.
echo Don't forget to configure Google Sheets in backend/.env file!
pause