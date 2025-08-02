# Setup Instructions

## 1. Prerequisites
- Node.js 18+ installed
- A Supabase account
- Git

## 2. Clone the Repository
```bash
git clone <repository-url>
cd ascend-global
```

## 3. Install Dependencies
```bash
npm install
```

## 4. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Set Up the Database

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `database-schema.sql` and execute it
3. This will create all necessary tables, indexes, triggers, and sample data

## 6. Configure Row Level Security (RLS)

The database schema includes RLS policies. You may need to adjust these based on your authentication requirements:

- For development: The current policies allow all authenticated users to access all data
- For production: Consider implementing user-specific policies

## 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 8. Build for Production

```bash
npm run build
npm start
```
