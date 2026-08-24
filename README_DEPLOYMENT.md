# RoundIQ — Production Deployment Guide

This guide outlines the production deployment setup for **RoundIQ**:
- **Backend API**: Deployed on **Render** (Node.js Web Service)
- **Database**: **Neon PostgreSQL** (Serverless Cloud Database)
- **Frontend App**: Deployed on **Vercel** (Next.js Standalone Build)

---

## 🗄️ 1. Database Setup (Neon PostgreSQL)

1. Log into your [Neon Console](https://console.neon.tech).
2. Create a new PostgreSQL database project named `roundiq`.
3. Copy the production Connection String (`DATABASE_URL`). Example:
   ```env
   DATABASE_URL="postgresql://neondb_owner:password@ep-fancy-shadow-ax4d6udv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

---

## 🚀 2. Backend Deployment on Render

### Option A: Automatic Blueprint Deployment (`render.yaml`)
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your GitHub repository. Render will automatically detect `render.yaml`.
5. Enter your `DATABASE_URL` when prompted and click **Apply**.

### Option B: Manual Web Service Setup
- **Environment**: `Node`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run prisma:migrate && npm start`
- **Health Check Path**: `/health/readiness`

### Environment Variables required on Render:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="<your_neon_postgresql_url>"
FRONTEND_URL="https://roundiq.vercel.app"
APP_URL="https://roundiq-backend.onrender.com"
JWT_ACCESS_SECRET="<generate_secure_32_char_secret>"
JWT_REFRESH_SECRET="<generate_secure_32_char_secret>"
RAZORPAY_KEY_ID="<your_razorpay_live_key>"
RAZORPAY_KEY_SECRET="<your_razorpay_live_secret>"
RAZORPAY_WEBHOOK_SECRET="<your_razorpay_webhook_secret>"
```

---

## 🌐 3. Frontend Deployment on Vercel

1. Log into [Vercel Dashboard](https://vercel.com).
2. Import your GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Configure **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://roundiq-backend.onrender.com/api/v1
   NEXT_PUBLIC_APP_NAME=RoundIQ
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_mock_key_id_2026
   ```
5. Click **Deploy**.

---

## 🧪 4. Post-Deployment Verification Checklist

- [x] Backend Liveness Probe: `https://roundiq-backend.onrender.com/health/liveness` returns `200 OK`.
- [x] Backend Database Readiness: `https://roundiq-backend.onrender.com/health/readiness` returns `200 OK` (Neon DB connected).
- [x] OpenAPI Swagger Docs: `https://roundiq-backend.onrender.com/api-docs.json` loads OpenAPI specification.
- [x] Frontend Build: `https://roundiq.vercel.app` loads marketplace directory and portals cleanly.
