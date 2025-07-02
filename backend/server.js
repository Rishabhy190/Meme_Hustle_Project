const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:  "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client for admin operations (service role key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY // Use service role key for backend
);

// Initialize Supabase client for client-side operations (public anon key) - if needed, not strictly used here yet
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error("Supabase auth error:", error);
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(500).json({ error: 'Failed to authenticate token.' });
  }
};

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { httpOptions: { apiVersion: "v1beta" } }); // Use env API key

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle real-time bidding
  socket.on('place_bid', async (data) => {
    try {
      const { meme_id, user_id, credits } = data;
      console.log('Received bid data:', { meme_id, user_id, credits });
      
      // Insert the new bid
      const { data: bid, error: bidError } = await supabase
        .from('bids')
        .insert([{ meme_id, user_id, credits }])
        .select();

      if (bidError) {
        console.error('Supabase bid insertion error:', bidError);
        throw bidError;
      }
      console.log('Bid successfully inserted:', bid);

      // Get the updated meme with all its bids
      const { data: updatedMeme, error: memeError } = await supabase
        .from('memes')
        .select(`
          *,
          bids (
            id,
            credits,
            user_id,
            created_at
          )
        `)
        .eq('id', meme_id)
        .single();

      if (memeError) {
        console.error('Supabase meme fetch error after bid:', memeError);
        throw memeError;
      }
      console.log('Meme fetched after bid:', updatedMeme);

      // Add highest bid to the meme
      const memeWithBid = {
        ...updatedMeme,
        highest_bid: updatedMeme.bids?.length > 0 
          ? Math.max(...updatedMeme.bids.map(bid => bid.credits))
          : 0
      };

      // Broadcast the updated meme with its bids
      io.emit('bid_update', memeWithBid);
      console.log('Bid update broadcasted:', memeWithBid);
    } catch (error) {
      console.error('Bid handling error:', error);
      socket.emit('bid_error', error.message);
    }
  });

  // Handle upvotes/downvotes
  socket.on('vote', async (data) => {
    try {
      const { meme_id, vote_type } = data;
      
      // First get the current upvotes count
      const { data: currentMeme, error: fetchError } = await supabase
        .from('memes')
        .select('upvotes')
        .eq('id', meme_id)
        .single();

      if (fetchError) throw fetchError;

      // Calculate new upvotes count
      const newUpvotes = vote_type === 'up' 
        ? (currentMeme.upvotes || 0) + 1 
        : Math.max((currentMeme.upvotes || 0) - 1, 0);

      // Update the upvotes count
      const { data: updatedMeme, error: updateError } = await supabase
        .from('memes')
        .update({ upvotes: newUpvotes })
        .eq('id', meme_id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Fetch the full meme data including bids to correctly update highest_bid
      const { data: fullUpdatedMeme, error: fullFetchError } = await supabase
        .from('memes')
        .select(`
          *,
          bids (
            id,
            credits,
            user_id,
            created_at
          )
        `)
        .eq('id', meme_id)
        .single();
      
      if (fullFetchError) throw fullFetchError;

      // Add highest bid to the meme object
      const memeWithFullData = {
        ...fullUpdatedMeme,
        highest_bid: fullUpdatedMeme.bids?.length > 0 
          ? Math.max(...fullUpdatedMeme.bids.map(bid => bid.credits))
          : 0
      };

      // Broadcast the updated meme with its bids and highest_bid
      io.emit('vote_update', memeWithFullData);
    } catch (error) {
      console.error('Vote error:', error);
      socket.emit('vote_error', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST API Routes
// Apply authentication middleware to the meme creation endpoint
app.post('/api/memes', authenticateToken, async (req, res) => {
  try {
    const { title, image_url, tags } = req.body;
    const owner_id = req.user.id; // Get user ID from authenticated request

    // Fetch the image from the URL and convert to base64
    const imageResponse = await fetch(image_url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64ImageData = Buffer.from(imageBuffer).toString('base64');

    // Generate AI caption using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Generate a funny, caption for a meme with the meme image and these tags: ${tags.join(', ')}. be a bit precise and dont give multiple options just one response. it should be directly useable as a caption. the caption should be funny and puncy not just a description, get creative on this `;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: imageResponse.headers.get('content-type'),
          data: base64ImageData,
        },
      },
      { text: prompt },
    ]);
    const caption = result.response.text();

    const { data, error } = await supabase
      .from('memes')
      .insert([{ title, image_url, tags, caption, upvotes: 0, owner_id }]) // Use authenticated owner_id
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Meme creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/memes', async (req, res) => {
  try {
    const { data: memes, error: memesError } = await supabase
      .from('memes')
      .select(`
        *,
        bids (
          id,
          credits,
          user_id,
          created_at
        )
      `)
      .order('upvotes', { ascending: false });

    if (memesError) throw memesError;

    // Add highest bid to each meme
    const memesWithBids = memes.map(meme => ({
      ...meme,
      highest_bid: meme.bids?.length > 0 
        ? Math.max(...meme.bids.map(bid => bid.credits))
        : 0
    }));

    res.json(memesWithBids);
  } catch (error) {
    console.error('Meme fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.top) || 10;
    const { data: memes, error: memesError } = await supabase
      .from('memes')
      .select(`
        *,
        bids (
          id,
          credits,
          user_id,
          created_at
        )
      `)
      .order('upvotes', { ascending: false })
      .limit(limit);

    if (memesError) throw memesError;

    // Add highest bid to each meme
    const memesWithBids = memes.map(meme => ({
      ...meme,
      highest_bid: meme.bids?.length > 0 
        ? Math.max(...meme.bids.map(bid => bid.credits))
        : 0
    }));

    res.json(memesWithBids);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT =  5050;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
}); 