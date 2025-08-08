# 🚀 Deploy Stocky Backend to Vercel

## Step-by-Step Instructions

### 1. Push Code to GitHub
Your backend code needs to be in a GitHub repository.

### 2. Go to Vercel Dashboard
Visit: https://vercel.com/dashboard

### 3. Create New Project
- Click "New Project"
- Import your GitHub repository
- Select the `backend` folder as the root directory
- Framework: **Other** (Vercel will auto-detect Node.js)

### 4. Configure Build Settings
In the import screen, set:
- **Root Directory**: `backend`
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Environment Variables
Add these in Vercel Dashboard > Environment Variables:

**Required:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://your-database-url
JWT_SECRET=your-super-secret-jwt-key
```

**Optional (for full functionality):**
```bash
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-key
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your-hedera-private-key
HEDERA_NETWORK=testnet
HEDERA_RPC_URL=https://testnet.hashio.io/api
EVM_PRIVATE_KEY=your-evm-private-key
```

### 6. Deploy
Click "Deploy" - Vercel will:
1. Install dependencies
2. Generate Prisma client
3. Build TypeScript
4. Deploy your API

### 7. Update Frontend
Update your frontend API URL to point to your new Vercel backend:

In `frontend/src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://your-backend-name.vercel.app';
```

### 8. Test Your Deployment
Visit these URLs to verify:
- `https://your-backend.vercel.app/health` - Health check
- `https://your-backend.vercel.app/api/status` - API status

## 🎯 Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Database configured (Supabase/Neon recommended)
- [ ] Frontend updated with new API URL
- [ ] Deployment tested

## 🗄️ Database Setup (Supabase - Free Tier)

1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Use it as `DATABASE_URL` in Vercel
6. Run migrations: `npx prisma migrate deploy`

## 🔧 Current Configuration

Your backend is already configured with:
- ✅ `vercel.json` - Vercel deployment config
- ✅ `vercel-build` script - Includes Prisma generation
- ✅ TypeScript compilation working
- ✅ All dependencies included
- ✅ CORS configured for frontend
- ✅ Error handling middleware

## 🎉 After Deployment

Your API will be available at:
`https://your-project-name.vercel.app`

Example endpoints:
- `GET /health` - Health check
- `GET /api/status` - System status
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - List products
- `POST /api/ai/analyze-image` - AI analysis

**Your Stocky backend will be live and ready to serve your frontend!** 🚀
