export interface Meme {
  id: number;
  title: string;
  image_url: string;
  tags: string[];
  caption: string;
  upvotes: number;
  current_bid?: number;
  highest_bid: number;
}

export interface NewMeme {
  title: string;
  image_url: string;
  tags: string;
}

export interface Bid {
  meme_id: number;
  user_id: string;
  credits: number;
}

export interface Vote {
  meme_id: number;
  vote_type: 'up' | 'down';
} 