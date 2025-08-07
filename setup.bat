@echo off
echo 🚀 Setting up Stocky Platform...

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js found
node --version

echo.
echo 📦 Installing dependencies...

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

:: Install frontend dependencies
echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

:: Install smart contract dependencies
echo Installing smart contract dependencies...
cd smart-contracts
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install smart contract dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo 🔧 Setting up configuration files...

:: Copy environment files
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo 📄 Created backend\.env - Please configure with your settings
)

if not exist smart-contracts\.env (
    copy smart-contracts\.env.example smart-contracts\.env
    echo 📄 Created smart-contracts\.env - Please configure with your Hedera credentials
)

echo.
echo 🗂️  Creating necessary directories...
if not exist backend\uploads mkdir backend\uploads
if not exist backend\logs mkdir backend\logs
if not exist smart-contracts\build mkdir smart-contracts\build

echo.
echo ✅ Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Configure your environment variables in backend\.env
echo 2. Set up your PostgreSQL database
echo 3. Configure your Hedera testnet credentials in smart-contracts\.env
echo 4. Get your OpenAI API key for AI features
echo.
echo 🚀 To start the development servers:
echo    Backend:  cd backend && npm run dev
echo    Frontend: cd frontend && npm run dev
echo.
echo 🔗 Useful commands:
echo    Database setup: cd backend && npx prisma migrate dev
echo    Compile contracts: cd smart-contracts && npm run compile
echo    Deploy contracts: cd smart-contracts && npm run deploy
echo.
echo Happy coding! 🎉
pause
