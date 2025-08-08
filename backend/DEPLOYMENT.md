# Stocky Backend - Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
1. Vercel account
2. GitHub repository
3. PostgreSQL database (Supabase, Neon, or PlanetScale recommended)

### Step 1: Prepare Your Repository
Make sure your backend code is in a Git repository and pushed to GitHub.

### Step 2: Set Up Database
1. Create a PostgreSQL database (we recommend [Supabase](https://supabase.com/) for free tier)
2. Get your database connection string
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Step 3: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to backend directory:
   ```bash
   cd backend
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project or create new
   - Set up project settings
   - Add environment variables

#### Option B: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `backend` folder as root directory
5. Vercel will auto-detect the Node.js framework

### Step 4: Configure Environment Variables
In Vercel Dashboard > Project Settings > Environment Variables, add:

```bash
DATABASE_URL=postgresql://your-db-connection-string
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production

# Optional API Keys (will use mock services if not provided)
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-key

# Hedera Blockchain (optional)
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your-hedera-private-key
HEDERA_NETWORK=testnet

# EVM/Smart Contracts (optional)
HEDERA_RPC_URL=https://testnet.hashio.io/api
EVM_PRIVATE_KEY=your-evm-private-key
SUPPLY_CHAIN_CONTRACT=0x...
PAYMENTS_CONTRACT=0x...
CARBON_CONTRACT=0x...
```

### Step 5: Update Frontend API URL
Update your frontend to point to the new Vercel backend URL:

```typescript
// In frontend/src/lib/api.ts
const API_BASE_URL = 'https://your-backend.vercel.app';
```

### Step 6: Test Deployment
1. Visit your Vercel backend URL
2. Test health check: `https://your-backend.vercel.app/health`
3. Test API status: `https://your-backend.vercel.app/api/status`

## 🔧 Vercel Configuration

The `vercel.json` file is already configured with:
- Node.js runtime
- TypeScript build process
- Prisma generation
- Route handling
- Function timeout settings

## 🗄️ Database Options

### Free Tier Options:
1. **Supabase** (Recommended)
   - 500MB storage
   - Built-in auth support
   - Real-time features

2. **Neon**
   - Serverless PostgreSQL
   - Generous free tier
   - Great performance

3. **PlanetScale**
   - MySQL (you'll need to update Prisma schema)
   - Excellent scaling

## ⚡ Performance Tips

1. **Database Connection Pooling**: Already configured in Prisma
2. **Environment Variables**: Use Vercel's environment variable management
3. **File Uploads**: Consider using Vercel Blob or Cloudinary for production
4. **Caching**: Redis can be added via Upstash for free tier

## 🐛 Troubleshooting

### Build Errors
- Ensure all dependencies are in `package.json`
- Check TypeScript compilation with `npm run build`
- Verify Prisma schema is valid

### Runtime Errors
- Check Vercel function logs
- Verify environment variables are set
- Test database connection

### CORS Issues
- Backend is configured to allow all origins
- Update frontend API base URL
- Check browser developer tools for specific errors

## 📝 Environment Variables Checklist

Required:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Secret for JWT tokens
- [ ] `NODE_ENV=production`

Optional:
- [ ] `OPENAI_API_KEY` - For AI features
- [ ] `GEMINI_API_KEY` - Alternative AI provider
- [ ] `HEDERA_ACCOUNT_ID` - Blockchain features
- [ ] `HEDERA_PRIVATE_KEY` - Blockchain features
- [ ] `EVM_PRIVATE_KEY` - Smart contract interactions

## 🚀 Next Steps After Deployment

1. Update frontend to use production backend URL
2. Test all API endpoints
3. Set up monitoring and logging
4. Configure custom domain (optional)
5. Set up CI/CD pipeline for automatic deployments

Your Stocky backend will be live at: `https://your-project-name.vercel.app`
