# 🚀 Quick Start Guide - Stocky Platform

Welcome to Stocky! This guide will help you get the MVP running quickly.

## 📋 Prerequisites

Before starting, make sure you have:

- **Node.js 18+** installed
- **PostgreSQL** database running
- **Redis** server running (optional, for caching)
- **OpenAI API key** (for AI features)
- **Hedera testnet account** (for blockchain features)

## 🎯 MVP Features

### ✅ What's Ready
- **Frontend Landing Page** with business/consumer targeting
- **Backend API** with full authentication and CRUD operations
- **Smart Contracts** for supply chain and payments
- **AI Image Recognition** for product analysis
- **Dynamic Pricing** system
- **Real-time Updates** via WebSocket
- **Database Schema** with all necessary models

### 🔧 What Needs Configuration
- Environment variables
- Database connection
- API keys

## ⚡ Quick Setup (5 minutes)

### 1. Run Setup Script
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### 2. Configure Environment
Edit `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/stocky_db"
JWT_SECRET=your-super-secret-jwt-key
OPENAI_API_KEY=your-openai-api-key
HEDERA_ACCOUNT_ID=0.0.your-account-id
HEDERA_PRIVATE_KEY=your-hedera-private-key
```

### 3. Setup Database
```bash
cd backend
npx prisma migrate dev
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 5. Deploy Smart Contracts (Optional)
```bash
cd smart-contracts
npm run compile
npm run deploy
```

## 🌐 Access Your MVP

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🎮 Testing the MVP

### 1. Register as Business User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "business@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "BUSINESS",
    "businessName": "Fresh Market",
    "businessType": "Grocery Store"
  }'
```

### 2. Register as Consumer
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "consumer@example.com",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "CONSUMER"
  }'
```

### 3. Test AI Image Analysis
Upload an image to `/api/ai/analyze-image` to see AI recognition in action.

## 📱 Core User Flows

### Business Flow
1. **Register** → Choose "Business" 
2. **Create Business Profile** → Add store details
3. **Add Products** → Upload images, AI auto-fills details
4. **Monitor Dashboard** → See dynamic pricing in action
5. **Process Orders** → Accept consumer orders

### Consumer Flow  
1. **Register** → Choose "Consumer"
2. **Browse Products** → See discounted items
3. **Place Orders** → Add items to cart
4. **Make Payment** → Use Hedera blockchain
5. **Pick Up** → Get notifications

## 🔄 Real-time Features

The MVP includes WebSocket connections for:
- **Live price updates** when products near expiry
- **Order notifications** for businesses
- **Status updates** for consumers

## 🤖 AI Features Working

- **Image Recognition**: Upload food images → Auto-detect product type
- **Quality Assessment**: AI evaluates freshness (0-1 scale)
- **Auto-categorization**: Products sorted automatically
- **Description Generation**: AI writes product descriptions

## ⛓️ Blockchain Features

- **Product Tracking**: Each product recorded on Hedera
- **Secure Payments**: HBAR transactions with escrow
- **Supply Chain**: Transparent product history
- **Smart Contracts**: Automated business logic

## 📊 Dynamic Pricing in Action

The system automatically adjusts prices:
- **7+ days to expiry**: Regular price
- **4-7 days**: 15% discount  
- **2-3 days**: 30% discount
- **1 day**: 50% discount
- **Expired**: Marked as expired

## 🛠️ Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Create database
createdb stocky_db
```

**Redis Connection Error**
```bash
# Start Redis (optional for MVP)
redis-server
```

**AI Features Not Working**
- Verify OpenAI API key in `.env`
- Check API quota and billing

**Blockchain Features Not Working**  
- Verify Hedera credentials in `.env`
- Ensure testnet account has HBAR balance

## 🚀 Production Deployment

For production deployment:

1. **Environment**: Set `NODE_ENV=production`
2. **Database**: Use managed PostgreSQL service
3. **Security**: Generate strong JWT secrets
4. **Scaling**: Use Redis for session management
5. **Monitoring**: Set up logging and alerts

## 📈 Next Steps

To extend the MVP:

1. **Mobile App**: React Native or Flutter
2. **Advanced AI**: Computer vision for quality assessment  
3. **IoT Integration**: Smart sensors for inventory
4. **Analytics Dashboard**: Business intelligence
5. **Multi-chain**: Support other blockchains

## 🆘 Support

If you need help:
1. Check the logs in `backend/logs/`
2. Verify all environment variables are set
3. Ensure all services (DB, Redis) are running
4. Check the API documentation in the main README

**Happy coding! 🎉**
