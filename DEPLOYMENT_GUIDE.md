# Deployment Guide - Betashop

## Current Issue 🚨
The frontend is deployed at `https://betashop-navy.vercel.app/` but the API calls are failing because:
- Frontend `.env` is configured to use `http://localhost:3000/api`
- Backend needs to be deployed separately

## Solution Options

### Option 1: Deploy Backend Separately (Recommended)

#### Step 1: Deploy Backend to Vercel
1. Create a new Vercel project for the backend
2. Connect it to the `backend` folder
3. Set environment variables in Vercel dashboard:
   ```
   SUPABASE_URL=https://hsyjoxnanmxrkgkoevpr.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   PAYSTACK_SECRET_KEY=sk_test_6faf5fd985e4a4bd501c52b5fad642de191bc628
   PAYSTACK_PUBLIC_KEY=pk_test_58449e3de8d50386cfbcdbfba368ad8ece5737f9
   CLOUDINARY_CLOUD_NAME=dkogzpxhn
   CLOUDINARY_API_KEY=295652824886667
   CLOUDINARY_API_SECRET=Ez4PtwNaR8oAfdy3FBHlD_LyeHw
   JWT_SECRET=your_super_secret_jwt_key_here_make_sure_it_cant_be_predictable_nwanne
   NODE_ENV=production
   FRONTEND_URL=https://betashop-navy.vercel.app
   FRONTEND_ORIGIN=https://betashop-navy.vercel.app
   ```

#### Step 2: Update Frontend Environment
Update `frontend/.env` to point to the deployed backend:
```
VITE_API_BASE_URL=https://your-backend-deployment.vercel.app/api
```

#### Step 3: Redeploy Frontend
After updating the environment variable, redeploy the frontend.

### Option 2: Monorepo Deployment (Alternative)

Deploy both frontend and backend in a single Vercel project with proper routing.

## Current Status

### ✅ Working Locally
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`
- All features working (image upload, pricing, logout fix)

### ❌ Production Issues
- Frontend deployed: `https://betashop-navy.vercel.app/`
- Backend not accessible: API calls return frontend HTML
- Need to deploy backend separately

## Quick Fix Commands

### 1. Deploy Backend to Vercel
```bash
cd backend
vercel --prod
```

### 2. Update Frontend Environment
```bash
cd frontend
# Update .env file with backend URL
echo "VITE_API_BASE_URL=https://your-backend-url.vercel.app/api" > .env
```

### 3. Redeploy Frontend
```bash
cd frontend
vercel --prod
```

## Testing After Deployment

Use the production test script:
```bash
cd backend
node test-production-deployment.js
```

## Features That Need Backend

### ✅ Already Implemented & Working Locally
1. **Image Upload**: Cloudinary integration with memory storage
2. **Pricing Structure**: ₦5,000 base fee + 7% platform fee
3. **Admin Authentication**: Login/logout with proper navigation
4. **Product Management**: CRUD operations with correct pricing
5. **Customer Visibility**: Products visible with customer pricing

### 🔧 Deployment Requirements
1. **Backend Deployment**: Deploy Express app to Vercel
2. **Environment Variables**: Set all required env vars in Vercel
3. **CORS Configuration**: Already configured for production domain
4. **Database**: Supabase (already configured)
5. **File Storage**: Cloudinary (already configured)

## Environment Variables Checklist

### Backend (Vercel Dashboard)
- [ ] SUPABASE_URL
- [ ] SUPABASE_ANON_KEY  
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] PAYSTACK_SECRET_KEY
- [ ] PAYSTACK_PUBLIC_KEY
- [ ] CLOUDINARY_CLOUD_NAME
- [ ] CLOUDINARY_API_KEY
- [ ] CLOUDINARY_API_SECRET
- [ ] JWT_SECRET
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL=https://betashop-navy.vercel.app
- [ ] FRONTEND_ORIGIN=https://betashop-navy.vercel.app

### Frontend (Vercel Dashboard or .env)
- [ ] VITE_API_BASE_URL=https://your-backend-url.vercel.app/api

## Post-Deployment Verification

After deployment, verify these endpoints work:
- `GET /api/categories` - Should return categories
- `POST /api/auth/login` - Admin login
- `GET /api/products` - Product listing with correct pricing
- `POST /api/upload/image` - Image upload (authenticated)

## Summary

The application is fully functional locally with all requested features:
- ✅ Image upload fixed
- ✅ Pricing structure implemented (₦5,000 + 7%)
- ✅ Admin logout navigation fixed
- ✅ Products visible to customers

**Next Step**: Deploy the backend to make the production frontend functional.