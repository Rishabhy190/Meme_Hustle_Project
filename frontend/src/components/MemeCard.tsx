import React from 'react';

interface MemeCardProps {
  meme: {
    id: number;
    title: string;
    creator: string;
    currentPrice: number;
    priceChange: number;
    imageUrl: string;
    totalBids: number;
    timeLeft: string;
    tags?: string[];
    caption?: string;
  };
  onBid: (id: number) => void;
}

const MemeCard: React.FC<MemeCardProps> = ({ meme, onBid }) => {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] rounded-lg transform -skew-x-6" />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg" />
      <div className="relative h-full flex flex-col p-4 transform skew-x-6">
        <div className="relative h-80 mb-4">
          <img
            src={meme.imageUrl}
            alt={meme.title}
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
        </div>
        <div className="mb-2 text-center">
          <h3 className="text-white font-bold text-2xl mb-1 drop-shadow-neon-pink" style={{ fontFamily: 'Orbitron, sans-serif' }}>{meme.title}</h3>
          <p className="text-neon-purple text-sm tracking-wide" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
            {meme.tags && meme.tags.length > 0 ? `Tags: ${meme.tags.join(', ')}` : ''}
          </p>
        </div>
        {meme.caption && (
          <div className="mb-2 p-2 bg-black/40 rounded-lg text-center">
            <p className="text-sm text-neon-purple" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
              {meme.caption}
            </p>
          </div>
        )}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-white/20 rounded-full">
              <span className="text-white text-sm">{meme.totalBids} bids</span>
            </div>
            <div className="px-3 py-1 bg-[#4ECDC4]/20 rounded-full">
              <span className="text-white text-sm">{meme.timeLeft}</span>
            </div>
          </div>
          <button
            onClick={() => onBid(meme.id)}
            className="px-4 py-2 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] text-white rounded-full hover:opacity-90 transition-opacity"
          >
            Place Bid
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemeCard; 