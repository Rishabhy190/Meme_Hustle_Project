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

-- Create indexes for better query performance
CREATE INDEX idx_memes_upvotes ON memes(upvotes DESC);
CREATE INDEX idx_memes_tags ON memes USING GIN(tags);
CREATE INDEX idx_bids_meme_id ON bids(meme_id);
CREATE INDEX idx_bids_user_id ON bids(user_id); 