# Fudi

A mobile-first web app built with Next.js, Supabase, and Tailwind CSS. Deployed on Vercel.

---

## Stack

- **Next.js 14** (App Router)
- **Supabase** — auth (email + password)
- **Tailwind CSS** — styling
- **Vercel** — hosting

---

## Setup Guide

### 1. Install dependencies

```bash
cd fudi
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** and fill in the details
3. Wait for the project to finish provisioning (~1–2 min)

### 3. Get your Supabase keys

In your Supabase project dashboard:
- Go to **Settings → API**
- Copy the **Project URL** and the **anon / public** key

### 4. Configure environment variables

**For local development:**

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**For Vercel (production):**

In your Vercel project → **Settings → Environment Variables**, add the same two variables.

### 5. Configure Supabase Auth settings

In your Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://your-vercel-app.vercel.app`
- **Redirect URLs**: Add `https://your-vercel-app.vercel.app/auth/callback`

> For local dev, also add `http://localhost:3000/auth/callback` to Redirect URLs.

### 6. (Optional) Disable email confirmation

By default Supabase requires users to confirm their email before logging in. To skip this during development:

- Go to **Authentication → Providers → Email**
- Turn off **Confirm email**

You can turn it back on for production.

### 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

---

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. Add the two environment variables (Step 4 above)
4. Click **Deploy**

Vercel auto-deploys on every push to `main`.

---

## Project Structure

```
fudi/
├── app/
│   ├── layout.tsx           # Root layout (fonts, metadata, viewport)
│   ├── page.tsx             # Root — redirects to /login or /welcome
│   ├── login/
│   │   └── page.tsx         # Login + Sign Up form
│   ├── welcome/
│   │   ├── page.tsx         # Protected welcome page
│   │   └── actions.ts       # Sign out server action
│   └── auth/
│       └── callback/
│           └── route.ts     # Supabase OAuth/magic link callback
├── utils/
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       ├── server.ts        # Server Supabase client
│       └── middleware.ts    # Session refresh + route protection
├── middleware.ts            # Next.js middleware entry
├── tailwind.config.ts
└── .env.local.example
```
