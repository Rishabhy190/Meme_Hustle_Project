-- Drop the trigger first
DROP TRIGGER IF EXISTS meme_vote_trigger ON votes;

-- Drop the function
DROP FUNCTION IF EXISTS update_meme_upvotes();

-- Drop the votes table
DROP TABLE IF EXISTS votes; 