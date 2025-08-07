# Stocky - AI-Powered Food Waste Management Platform

Stocky is a comprehensive platform that uses AI image recognition and blockchain technology to reduce food waste by connecting businesses with consumers through dynamic pricing and transparent supply chain tracking.

## 🌟 Features

### For Businesses
- **AI Image Recognition**: Simply take photos to add products to inventory
- **Dynamic Pricing**: Automatic price reductions as expiry dates approach
- **Inventory Management**: Real-time tracking and analytics
- **Hedera Blockchain Integration**: Transparent and secure transactions

### For Consumers
- **Discounted Products**: Save up to 50% on quality groceries
- **Real-time Updates**: Get notified about new deals
- **Sustainable Shopping**: Track your environmental impact
- **Secure Payments**: Blockchain-powered payment system

### Core Technologies
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **AI**: OpenAI GPT-4 Vision for image recognition
- **Blockchain**: Hedera Hashgraph smart contracts
- **Real-time**: Socket.IO for live updates

## 📁 Project Structure

```
fresh-track-chain-main/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   └── package.json
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── package.json
└── smart-contracts/        # Hedera smart contracts
    ├── contracts/         # Solidity smart contracts
    ├── scripts/          # Deployment scripts
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/bun
- PostgreSQL database
- Redis (for caching)
- OpenAI API key
- Hedera testnet account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fresh-track-chain-main
```

### 2. Setup Backend

```bash
cd backend
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database, API keys, and Hedera credentials

# Setup database
npx prisma migrate dev
npx prisma generate

# Start backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Setup Frontend

```bash
cd frontend
npm install

# Start frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Deploy Smart Contracts

```bash
cd smart-contracts
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Hedera credentials

# Compile contracts
npm run compile

# Deploy to Hedera testnet
npm run deploy
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stocky_db"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# OpenAI (for AI image recognition)
OPENAI_API_KEY=your-openai-api-key

# Hedera
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.your-account-id
HEDERA_PRIVATE_KEY=your-hedera-private-key

# Redis
REDIS_URL=redis://localhost:6379
```

### Database Setup

1. Create a PostgreSQL database
2. Update the `DATABASE_URL` in your `.env` file
3. Run migrations:

```bash
cd backend
npx prisma migrate dev
```

## 📱 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Business Endpoints

- `GET /api/businesses` - Get all businesses
- `POST /api/businesses` - Create new business
- `GET /api/businesses/:id` - Get business details

### Product Endpoints

- `GET /api/products` - Get all products (with filters)
- `POST /api/products` - Create new product (with image upload)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order Endpoints

- `GET /api/orders` - Get orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

### AI Endpoints

- `POST /api/ai/analyze-image` - Analyze product image
- `POST /api/ai/generate-description` - Generate product description
- `POST /api/ai/categorize` - Categorize product

### Hedera Endpoints

- `POST /api/hedera/create-account` - Create Hedera account
- `GET /api/hedera/balance/:accountId` - Get account balance
- `POST /api/hedera/transfer` - Transfer HBAR
- `POST /api/hedera/track-product` - Track product on blockchain

## 🔗 Smart Contracts

### StockySupplyChain.sol

Manages product registration, tracking, and supply chain transparency.

**Key Functions:**
- `registerBusiness()` - Register a new business
- `registerProduct()` - Register a new product
- `updateProductPrice()` - Update product pricing
- `createTransaction()` - Create purchase transaction

### StockyPayments.sol

Handles secure payments with escrow functionality.

**Key Functions:**
- `createPayment()` - Create new payment
- `escrowPayment()` - Move payment to escrow
- `completePayment()` - Release payment to seller
- `refundPayment()` - Refund payment to buyer

## 🤖 AI Features

### Image Recognition

The platform uses OpenAI's GPT-4 Vision to analyze food product images and extract:
- Product identification
- Freshness assessment (0-1 scale)
- Quality rating (0-1 scale)
- Estimated shelf life
- Automatic categorization

### Dynamic Pricing

Automated pricing algorithm that adjusts prices based on:
- Days until expiry (1 day = 50% off, 2-3 days = 30% off, 4-7 days = 15% off)
- Product quality and freshness
- Historical demand data
- Business preferences

## 🔄 Real-time Features

- **Live Price Updates**: Businesses receive real-time notifications when prices are automatically adjusted
- **Order Notifications**: Instant notifications for new orders and status changes
- **Inventory Alerts**: Alerts for products nearing expiry
- **Consumer Updates**: Notifications about new deals and discounts

## 🌱 Sustainability Impact

Track and display:
- Total food waste prevented (kg)
- CO2 emissions saved
- Money saved by consumers
- Number of products rescued

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### Smart Contract Testing

```bash
cd smart-contracts
npm test
```

## 🚀 Deployment

### Backend Deployment

1. Set up PostgreSQL and Redis in production
2. Configure environment variables
3. Deploy to your preferred platform (AWS, Heroku, etc.)

### Frontend Deployment

```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Smart Contract Deployment

```bash
cd smart-contracts
# Configure .env for mainnet
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔮 Future Enhancements

- **Mobile App**: Native iOS and Android applications
- **IoT Integration**: Smart sensors for automatic inventory tracking
- **Machine Learning**: Predictive analytics for demand forecasting
- **Multi-chain Support**: Support for additional blockchain networks
- **Advanced Analytics**: Detailed business intelligence dashboards
