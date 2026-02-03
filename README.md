# Mockup Tool - 360 Creation

Free website mockup lead generation tool.

## Setup

### 1. Supabase Database

1. Go to your Supabase project
2. Open **SQL Editor**
3. Copy and paste the contents of `supabase-setup.sql` and run it
4. Go to **Storage** and create two buckets:
   - `logos` (set to **public**)
   - `mockups` (set to **public**)

### 2. Resend Email

1. Go to [resend.com](https://resend.com)
2. Add and verify your domain (`360creation.uk`)
3. This allows emails to be sent from `@360creation.uk`

### 3. Environment Variables

Create these in Vercel (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://awwkmudnaiaksmcmpewf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
RESEND_API_KEY=your_resend_key
ADMIN_EMAIL=admin@360creation.uk
ADMIN_PASSWORD=choose_a_secure_password
NEXT_PUBLIC_APP_URL=https://mockup.threesixtycreation.co.uk
```

### 4. Deploy to Vercel

1. Push this code to GitHub
2. Import the repo in Vercel
3. Add the environment variables
4. Deploy

### 5. Domain Setup

Point `mockup.threesixtycreation.co.uk` to your Vercel deployment.

## Usage

### Landing Page
`/` - Customer-facing form to request a mockup

### Dashboard
`/dashboard` - Admin dashboard to manage submissions
- Login with ADMIN_PASSWORD
- View all submissions
- Upload mockups
- Track status

### Mockup Reveal
`/mockup/[id]` - Customer sees their mockup here after you upload it

## Flow

1. Customer fills form on landing page
2. You get email notification
3. Submission appears in dashboard
4. You generate mockup (manually for now)
5. Upload mockup via dashboard
6. Customer gets email with link to view
7. They view it on the reveal page
8. Follow up and convert!

## Future Improvements

- Automated mockup generation with AI
- More trade-specific landing pages
- Analytics dashboard
- Conversion tracking
