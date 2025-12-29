# Café 45 Frontend

A modern Next.js application for Café 45, featuring Supabase authentication, admin dashboard, and order management.

## Features

- 🎂 Custom cake inquiry system
- 🍽️ Meals and product ordering
- 🔐 Supabase authentication with admin authorization
- 📊 Admin dashboard with drag-and-drop workflow management
- 🎨 Modern, responsive UI with Tailwind CSS

## Prerequisites

- Node.js 20 or higher
- A Supabase account and project ([Create one here](https://supabase.com))
- npm or yarn package manager

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

#### Create a Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for the database to be provisioned

#### Deploy Database Schema
1. In your Supabase project, go to **SQL Editor**
2. Open the file `supabase/schema.sql` from this repository
3. Copy and paste the entire contents into the SQL Editor
4. Click "Run" to execute the schema
5. Verify tables are created: `profiles`, `cake_inquiries`, `orders`, `order_items`

#### Configure Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to **Project Settings** → **API**
   - Copy the **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - Copy the **anon/public** key

3. Update `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Create Admin User

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the admin login page: `http://localhost:3000/admin/login`

3. Since you don't have an admin user yet, you'll need to create one via Supabase:
   - Go to **Authentication** → **Users** in Supabase Dashboard
   - Click **Add user** → **Create new user**
   - Enter email and password
   - Click **Create user**

4. Mark the user as admin:
   - Go to **Table Editor** → **profiles**
   - Find the user you just created
   - Set `is_admin` to `true`
   - Click **Save**

5. Now you can login at `/admin/login` with your email and password!

### 4. Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment

### Netlify Deployment

This project is configured for Netlify deployment with the included `netlify.toml` file.

#### Setup Steps

1. **Push to Git**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Netlify will auto-detect the `netlify.toml` configuration

3. **Configure Environment Variables**
   - In Netlify dashboard, go to **Site settings** → **Environment variables**
   - Add the following variables:
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

4. **Configure Supabase Auth Redirects**
   - In Supabase dashboard, go to **Authentication** → **URL Configuration**
   - Set **Site URL** to your Netlify domain (e.g., `https://your-site.netlify.app`)
   - Add **Redirect URLs**:
     - `https://your-site.netlify.app/admin`
     - `https://your-site.netlify.app/admin/login`
     - `http://localhost:3000/admin` (for local development)
     - `http://localhost:3000/admin/login` (for local development)

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Visit your site at the Netlify URL

#### Production Admin Setup

After deploying, create your production admin user:
1. Visit your production site's `/admin/login` page
2. If no users exist, create one through Supabase Dashboard (same steps as local development)
3. Mark the user as admin in the `profiles` table
4. Login with the admin credentials

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Radix UI, Lucide Icons
- **Drag & Drop**: react-dnd
- **Deployment**: Netlify

## Project Structure

```
cafe45-frontend/
├── src/
│   ├── app/              # Next.js app routes
│   │   ├── admin/        # Admin dashboard & login
│   │   ├── cakes/        # Cake inquiry page
│   │   ├── meals/        # Meals page
│   │   └── actions.ts    # Server actions (login/logout)
│   ├── components/       # React components
│   │   ├── views/        # Page views
│   │   └── ui/           # UI components
│   ├── contexts/         # React contexts (Cart, etc.)
│   ├── lib/              # Utilities
│   │   ├── supabase.ts        # Client-side Supabase
│   │   └── supabase-server.ts # Server-side Supabase
│   ├── types/            # TypeScript types
│   └── middleware.ts     # Auth middleware
├── supabase/
│   └── schema.sql        # Database schema with RLS
├── public/               # Static assets
└── netlify.toml          # Netlify configuration
```

## Key Files

- **`supabase/schema.sql`**: Complete database schema with RLS policies
- **`src/middleware.ts`**: Protects admin routes, checks `profiles.is_admin`
- **`src/app/actions.ts`**: Server actions for admin login/logout
- **`src/lib/supabase-server.ts`**: Server-side Supabase client
- **`netlify.toml`**: Deployment configuration

## Database Schema

The application uses the following tables:

- **`profiles`**: User profiles with `is_admin` flag
- **`cake_inquiries`**: Custom cake requests from customers
- **`orders`**: Product orders
- **`order_items`**: Items within each order

All tables have Row Level Security (RLS) enabled. Admins (where `is_admin = true`) can view and manage all data.

## Contributing

This is a private project for Café 45. For issues or questions, contact the development team.

## License

Private - All rights reserved.
