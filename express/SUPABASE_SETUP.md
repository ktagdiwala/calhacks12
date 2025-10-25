# Supabase + Prisma Setup Guide

## 1. Set up your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your database to be provisioned
3. Go to Settings → Database in your Supabase dashboard
4. Copy your connection string

## 2. Configure your environment

1. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase connection string:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

## 3. Install dependencies

```bash
npm install prisma @prisma/client
npm install -D prisma
```

## 4. Generate Prisma client

```bash
npx prisma generate
```

## 5. Push your schema to Supabase

For initial setup, you can use:

```bash
npx prisma db push
```

Or for production with migrations:

```bash
npx prisma migrate dev --name init
```

## 6. (Optional) Seed your database

Create a `prisma/seed.js` file and run:

```bash
npx prisma db seed
```

## Notes

- Supabase uses PostgreSQL, so all PostgreSQL features are available
- You can use Supabase's built-in Auth if needed (separate from your User model)
- The connection string includes connection pooling for better performance
- Use Row Level Security (RLS) in Supabase for additional security
