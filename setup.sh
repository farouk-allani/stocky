#!/bin/bash

echo "🚀 Setting up Stocky Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Please install PostgreSQL and create a database.${NC}"
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis not found. Please install Redis for caching.${NC}"
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
cd ..

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi
cd ..

# Install smart contract dependencies
echo -e "${YELLOW}Installing smart contract dependencies...${NC}"
cd smart-contracts
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install smart contract dependencies${NC}"
    exit 1
fi
cd ..

echo ""
echo "🔧 Setting up configuration files..."

# Copy environment files
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${YELLOW}📄 Created backend/.env - Please configure with your settings${NC}"
fi

if [ ! -f smart-contracts/.env ]; then
    cp smart-contracts/.env.example smart-contracts/.env
    echo -e "${YELLOW}📄 Created smart-contracts/.env - Please configure with your Hedera credentials${NC}"
fi

echo ""
echo "🗂️  Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/logs
mkdir -p smart-contracts/build

echo ""
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Configure your environment variables in backend/.env"
echo "2. Set up your PostgreSQL database"
echo "3. Configure your Hedera testnet credentials in smart-contracts/.env"
echo "4. Get your OpenAI API key for AI features"
echo ""
echo "🚀 To start the development servers:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "🔗 Useful commands:"
echo "   Database setup: cd backend && npx prisma migrate dev"
echo "   Compile contracts: cd smart-contracts && npm run compile"
echo "   Deploy contracts: cd smart-contracts && npm run deploy"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
