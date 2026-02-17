# Zealthy Mini-EMR & Patient Portal

A full-stack application for managing patient records, appointments, and prescriptions with separate admin and patient portals.

## Features

### Admin Portal (`/admin`)
- View all patients in a table
- Create new patients with credentials
- Edit patient information (CRU operations)
- Manage appointments (CRUD)
- Manage prescriptions (CRUD)
- Schedule recurring appointments
- Set refill schedules for medications

### Patient Portal (`/`)
- Secure login with email/password
- Dashboard showing:
  - Patient information
  - Upcoming appointments (next 7 days)
  - Upcoming refills (next 7 days)
- View all appointments (next 3 months)
- View all prescriptions (next 3 months)

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev --name init
```

3. Seed the database with sample data:
```bash
node prisma/seed.js
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Test Credentials

After seeding the database, you can login with:

- **Patient 1**: 
  - Email: `john.doe@example.com`
  - Password: `password123`

- **Patient 2**: 
  - Email: `jane.smith@example.com`
  - Password: `password123`

## Project Structure

```
zealthy-emr/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js            # Seed script
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── admin/         # Admin portal pages
│   │   ├── portal/        # Patient portal pages
│   │   └── page.tsx       # Login page
│   ├── components/        # React components
│   ├── lib/              # Utilities (Prisma, Auth)
│   └── types/            # TypeScript types
└── package.json
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your production URL
4. For production, switch to PostgreSQL:
   - Update `prisma/schema.prisma` datasource to use PostgreSQL
   - Add `DATABASE_URL` environment variable

### Other Platforms

The app can be deployed to:
- Netlify
- Railway
- Fly.io
- AWS Amplify
- Heroku

## API Endpoints

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create patient
- `GET /api/patients/[id]` - Get patient by ID
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/[id]` - Update appointment
- `DELETE /api/appointments/[id]` - Delete appointment

### Prescriptions
- `GET /api/prescriptions` - Get all prescriptions
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/[id]` - Update prescription
- `DELETE /api/prescriptions/[id]` - Delete prescription

### Medications
- `GET /api/medications` - Get available medications (fetched from external API)

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Protected API routes
- Secure authentication flow

## License

MIT
