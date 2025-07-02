# MemeHustle 🚀

A cyberpunk-themed meme marketplace where users can create, trade, and upvote memes in a neon-drenched digital bazaar. Built with Node.js, React, Supabase, and powered by Google's Gemini AI.

---

## Features

- 🎨 Create and trade memes with cyberpunk aesthetics
- 💰 Real-time bidding system with credits
- ⚡ Live upvote/downvote functionality
- 🤖 AI-powered meme captions using Gemini
- 🌈 Neon-soaked UI with glitch effects
- 📊 Real-time leaderboard
- 🔒 User authentication via Supabase

---

## Tech Stack

- **Frontend:** React + Tailwind CSS + Vite
- **Backend:** Node.js + Express + Socket.IO
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## Project Structure

```
memehustle/
├── frontend/    # React frontend
├── backend/     # Node.js backend
└── README.md
```

---

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/memehustle.git
cd memehustle
```

### 2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Set up environment variables
Create `.env` files in both `backend/` and `frontend/` directories:

#### backend/.env
```
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

#### frontend/.env
```
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

> **Note:** Replace `your_supabase_url`, `your_supabase_service_role_key`, `your_supabase_anon_key`, and `your_gemini_api_key` with your actual credentials.

### 4. Set up the database (Supabase)
- Go to [Supabase](https://supabase.com/) and create a new project.
- In the SQL editor, run the following to create the required tables and indexes:

```sql
-- Create memes table
CREATE TABLE memes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    tags TEXT[] DEFAULT '{}',
    upvotes INTEGER DEFAULT 0,
    owner_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create bids table
CREATE TABLE bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    credits INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_memes_upvotes ON memes(upvotes DESC);
CREATE INDEX idx_memes_tags ON memes USING GIN(tags);
CREATE INDEX idx_bids_meme_id ON bids(meme_id);
CREATE INDEX idx_bids_user_id ON bids(user_id);
```

#### Supabase Auth
- Enable **Email/Password** authentication in your Supabase project (Authentication > Providers).
- No custom user table is needed; Supabase Auth manages users. The `owner_id` and `user_id` fields in your tables should store the Supabase user ID.

---

## Running the Project

### Start Backend
```bash
cd backend
npm run dev
```
- The backend will run on `http://localhost:5000` by default.

### Start Frontend
```bash
cd frontend
npm run dev
```
- The frontend will run on `http://localhost:5173` by default.

---

## Usage Notes
- Make sure your `.env` files are correctly set up with real API keys and Supabase credentials.
- The backend uses the Supabase **service role key** (keep this secret!). The frontend uses the **anon/public key**.
- The Gemini API key is required for AI-powered meme captions.
- All user authentication and session management is handled by Supabase Auth.

---

## License

MIT License - Hack away! 🚀 