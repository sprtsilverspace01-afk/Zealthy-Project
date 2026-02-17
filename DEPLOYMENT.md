# Deployment Guide

## Quick Start (Local Development)

1. Install dependencies:
```bash
npm install
```

2. Set up database:
```bash
npx prisma migrate dev --name init
```

3. Seed database:
```bash
node prisma/seed.js
```

4. Run development server:
```bash
npm run dev
```

5. Access the application:
   - Patient Portal: http://localhost:3000
   - Admin Portal: http://localhost:3000/admin

## Deployment to Vercel

### Step 1: Prepare Your Repository

1. Initialize git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a GitHub repository and push:
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Next.js
   - Build Command: `prisma generate && next build`
   - Output Directory: `.next`

### Step 3: Set Environment Variables

Add these environment variables in Vercel:

```
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://your-app-name.vercel.app
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 4: Database Setup for Production

For production, you should use PostgreSQL instead of SQLite:

1. Create a PostgreSQL database (recommended providers):
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app)
   - [Neon](https://neon.tech)

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Add `DATABASE_URL` to Vercel environment variables:
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

4. Run migrations in production:
```bash
npx prisma migrate deploy
```

5. Seed the production database:
```bash
node prisma/seed.js
```

## Alternative Deployment Options

### Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
netlify deploy --prod
```

### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

### Fly.io

1. Install Fly CLI
2. Create `fly.toml` configuration
3. Deploy:
```bash
fly launch
fly deploy
```

## Post-Deployment

1. Test the login with seeded credentials:
   - Email: john.doe@example.com
   - Password: password123

2. Access admin portal at `/admin`

3. Create new patients and test all CRUD operations

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database is accessible from deployment platform
- Ensure Prisma Client is generated during build

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure cookies are enabled

### Build Failures
- Check build logs for specific errors
- Verify all dependencies are in package.json
- Ensure Prisma generate runs before build

## Security Checklist

- [ ] Change NEXTAUTH_SECRET to a secure random value
- [ ] Use PostgreSQL for production (not SQLite)
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Set secure cookie settings in production
- [ ] Regularly update dependencies
- [ ] Implement rate limiting for API routes
- [ ] Add input validation and sanitization
- [ ] Enable CORS only for trusted domains

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Vercel Analytics, Google Analytics)
- Uptime monitoring (UptimeRobot)
- Performance monitoring (Vercel Speed Insights)
