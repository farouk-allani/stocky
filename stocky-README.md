# Stocky - Smart Food Waste Management Platform

## 🌟 Overview

Stocky is a revolutionary full-stack platform that connects businesses with expiring inventory to consumers looking for discounted products. Using AI-powered product analysis and blockchain technology, we're reducing food waste while saving money for everyone.

## 🏗️ Architecture

This is a complete full-stack application with:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript + Prisma + SQLite
- **Smart Contracts**: Solidity contracts for Hedera Hashgraph
- **AI Integration**: Product analysis and dynamic pricing
- **Real-time Features**: WebSocket connections for live updates

## 📁 Project Structure

```
stocky/
├── frontend/           # React frontend application
├── backend/           # Express.js REST API
├── smart-contracts/   # Hedera blockchain contracts
├── .vscode/          # VS Code workspace settings
├── setup.sh          # Quick setup script
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd stocky
```

### 2. Setup Everything
```bash
# Make setup script executable (Linux/Mac)
chmod +x setup.sh
./setup.sh

# Or use batch file (Windows)
setup.bat
```

### 3. Start Development
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

Visit:
- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:3001

## 🎯 Core Features

### Business Dashboard
- ✅ AI-powered product analysis
- ✅ Dynamic pricing based on expiry dates
- ✅ Inventory management
- ✅ Sales analytics
- ✅ Order processing

### Consumer Dashboard
- ✅ Browse discounted products
- ✅ Location-based search
- ✅ Order tracking
- ✅ Savings analytics
- ✅ Favorite stores

### Technical Features
- ✅ JWT authentication with role-based access
- ✅ Real-time updates via WebSocket
- ✅ Responsive design
- ✅ Progressive Web App (PWA)
- ✅ RESTful API architecture
- ✅ Database seeding with demo data

## 🔧 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **Node.js** + **Express.js**
- **TypeScript** for type safety
- **Prisma ORM** with SQLite
- **JWT** authentication
- **bcryptjs** for password hashing
- **Socket.IO** for real-time features

### Blockchain
- **Hedera Hashgraph** network
- **Solidity** smart contracts
- **Supply chain tracking**
- **Escrow payments**

## 🗄️ Database

SQLite database with pre-seeded demo data:

**Demo Accounts:**
- **Business**: `demo@business.com` / `demo123`
- **Consumer**: `demo@consumer.com` / `demo123`

## 🔐 Environment Setup

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend `.env`:**
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
NODE_ENV="development"
PORT=3001
```

## 🚀 Deployment

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or any static hosting

### Backend
- Deploy to Railway, Heroku, or any Node.js hosting
- Update CORS origins for production

### Smart Contracts
- Deploy to Hedera Testnet using provided scripts
- Update contract addresses in backend

## 🧪 Testing

### Demo Workflow
1. **Register** as Business or Consumer
2. **Business**: Add products with AI analysis
3. **Consumer**: Browse and order discounted items
4. **Real-time**: See live price updates

## 📊 Current Status

✅ **MVP Complete** - Fully functional application  
✅ **Authentication** - Role-based login/register  
✅ **Dashboards** - Business and Consumer interfaces  
✅ **AI Integration** - Mock service for product analysis  
✅ **Database** - SQLite with demo data  
✅ **Real-time** - WebSocket configuration  
✅ **Smart Contracts** - Ready for deployment  

## 🔄 Development Workflow

1. **Backend First**: Start backend development server
2. **Frontend**: Start frontend development server  
3. **Testing**: Use demo accounts to test features
4. **Real-time**: Check WebSocket connections
5. **Database**: View data with Prisma Studio

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌍 Environmental Impact

By reducing food waste through smart inventory management:
- **Reduces methane emissions** from landfills
- **Saves money** for businesses and consumers
- **Promotes sustainability** in the food supply chain
- **Creates circular economy** opportunities

---

**Built with 💚 for a sustainable future**
