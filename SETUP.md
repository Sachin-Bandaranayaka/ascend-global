# Quick Setup Guide

## 1. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" and "anon public" key
4. Paste them into your `.env.local` file

## 3. Verify Database Connection

The system will now try to connect to your Supabase database. If there are connection issues, you'll see fallback mock data.

## 4. Check Browser Console

Open your browser's developer tools (F12) and check the console for any error messages. This will help identify connection issues.

## 5. Test the System

- Visit http://localhost:3000
- Navigate to different pages (Customers, Orders, Expenses, etc.)
- Check if data is loading from the database or showing mock data

## 6. Troubleshooting

If you see "No rows returned" or mock data:

1. **Check your .env.local file** - Make sure it's in the root directory
2. **Verify credentials** - Double-check your Supabase URL and key
3. **Check RLS policies** - Make sure Row Level Security allows access
4. **Browser console** - Look for error messages

## 7. Add Sample Data

To test with real data, you can add some sample records directly in your Supabase dashboard:

1. Go to your Supabase project
2. Click on "Table Editor"
3. Add some sample customers, products, and orders
4. Refresh your application to see the real data

## Current Status

✅ Database schema created
✅ All pages created and connected to Supabase
✅ Fallback mock data for testing
❓ Environment variables need to be configured
❓ Database connection needs to be verified 