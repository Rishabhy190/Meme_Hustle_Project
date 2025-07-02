import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { createClient, User, Session } from '@supabase/supabase-js'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { CurrencyDollarIcon } from '@heroicons/react/24/solid'
import { Meme, NewMeme, Bid, Vote } from './types'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './index.css'; // Ensure global styles are loaded

// Initialize Supabase client
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_KEY!
);

// Initialize Socket.IO
const socket = io('/')

interface MemeCardProps {
  meme: Meme;
  onBid: (id: number, credits: number) => void;
  onVote: (id: number, type: 'up' | 'down') => void;
  onImageClick: (meme: Meme) => void;
}

// ProtectedRoute component
function ProtectedRoute({ user, children }: { user: User | null, children: JSX.Element }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// LoginPage component
function LoginPage({
  onLogin,
  onSignup,
  email,
  setEmail,
  password,
  setPassword,
  isLoginMode,
  setIsLoginMode,
  showAuthPopup,
  setShowAuthPopup,
}: any) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start relative bg-cyberpunk">
      {/* Futuristic overlays */}
      {!showForm && <div className="scanline-overlay" />}
      {!showForm && (
        <div className="cyber-particles">
          <div className="cyber-particle" style={{ left: '12%', top: '30%', width: 18, height: 18, background: 'radial-gradient(circle, #0ff 60%, #00f6ff 100%)', animationDelay: '0s' }} />
          <div className="cyber-particle" style={{ left: '70%', top: '18%', width: 12, height: 12, background: 'radial-gradient(circle, #ff31a9 60%, #ff31a9 100%)', animationDelay: '1.2s' }} />
          <div className="cyber-particle" style={{ left: '40%', top: '60%', width: 24, height: 24, background: 'radial-gradient(circle, #fff 60%, #0ff 100%)', animationDelay: '2.1s' }} />
          <div className="cyber-particle" style={{ left: '80%', top: '80%', width: 10, height: 10, background: 'radial-gradient(circle, #ff31a9 60%, #fff 100%)', animationDelay: '0.7s' }} />
          <div className="cyber-particle" style={{ left: '55%', top: '40%', width: 16, height: 16, background: 'radial-gradient(circle, #0ff 60%, #fff 100%)', animationDelay: '1.7s' }} />
        </div>
      )}
      {/* Header at the top */}
      <header className="w-full flex flex-col items-center mt-14 select-none">
        <h1
          className="text-7xl md:text-8xl font-extrabold mb-3 drop-shadow-neon-blue tracking-widest animate-glow"
          style={{
            fontFamily: 'Audiowide, Orbitron, Share Tech Mono, Arial Black, sans-serif',
            color: '#00f6ff',
            letterSpacing: '0.15em',
            textShadow: '0 0 44px #00f6ff, 0 0 88px #00f6ff, 0 0 8px #fff',
            padding: '0.12em 0',
            marginBottom: '0.4em',
            lineHeight: 1.09,
          }}
        >
          Meme Hustle
        </h1>
        <p
          className="text-3xl md:text-4xl font-bold mb-10 text-center max-w-2xl animate-fade-in"
          style={{
            fontFamily: 'Share Tech Mono, Orbitron, Space Mono, monospace',
            color: '#ff31a9',
            textShadow: '0 0 18px #ff31a9, 0 0 36px #ff31a9',
            letterSpacing: '0.15em',
            lineHeight: 1.32,
            padding: '0.28em 0',
            marginBottom: '1.5em',
          }}
        >
          The ultimate cyberpunk meme marketplace.<br />
          Create, upvote, and bid on the best memes in the neon city!
        </p>
        <button
          className="neon-button get-started-btn text-2xl px-16 py-5 font-bold tracking-wider animate-pulse"
          style={{
            minWidth: '420px',
            background: 'linear-gradient(90deg, #0ff 0%, #ff31a9 100%)',
            color: '#fff',
            border: '3.5px solid #00f6ff',
            borderRadius: '0.45rem',
            boxShadow: '0 0 32px #00f6ff, 0 0 64px #ff31a9',
            textShadow: '0 0 8px #fff, 0 0 24px #00f6ff',
            transition: 'transform 0.15s, box-shadow 0.15s',
            letterSpacing: '0.15em',
            fontSize: '2.1rem',
            padding: '1.1rem 0',
            paddingLeft: '3.5rem',
            paddingRight: '3.5rem',
          }}
          onClick={() => setShowForm(true)}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Get Started
        </button>
      </header>
      {/* Login/Signup Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-slide-up">
          <div className="cyber-card p-8 shadow-xl w-full max-w-lg mx-4 relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-neon-red hover:text-white text-2xl font-bold"
            >
              &times;
            </button>
            <h2 className="cyberpunk-heading text-3xl mb-6 text-center">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
            <p className="text-neon-blue text-2xl font-bold mb-4 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>Sign in to explore and create memes!</p>
            <form onSubmit={isLoginMode ? onLogin : onSignup} className="space-y-4">
              <div>
                <label htmlFor="auth-email" className="cyberpunk-label block text-sm mb-2">Email</label>
                <input
                  type="email"
                  id="auth-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cyberpunk-input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="cyberpunk-label block text-sm mb-2">Password</label>
                <input
                  type="password"
                  id="auth-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="cyberpunk-input w-full"
                  required
                />
              </div>
              <button type="submit" className="neon-button w-full py-3 mt-4 text-lg">
                {isLoginMode ? 'Login' : 'Sign Up'}
              </button>
              <p className="text-center text-white mt-4">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-neon-blue hover:text-neon-pink ml-2 font-bold"
                >
                  {isLoginMode ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [memes, setMemes] = useState<Meme[]>([])
  const [leaderboard, setLeaderboard] = useState<Meme[]>([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [newMeme, setNewMeme] = useState<NewMeme>({ title: '', image_url: '', tags: '' })
  const [bidAmount, setBidAmount] = useState('')
  const [selectedMemeId, setSelectedMemeId] = useState<number | null>(null)
  const [showCreateMemePopup, setShowCreateMemePopup] = useState(false)
  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true); // true for login, false for signup
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenMeme, setFullScreenMeme] = useState<Meme | null>(null);
  const [showMainContent, setShowMainContent] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [topMemes, setTopMemes] = useState<Meme[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const memesPerPage = 6;
  // Add state for leaderboard pagination
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const leaderboardPerPage = 10;
  const leaderboardIndexOfLast = leaderboardPage * leaderboardPerPage;
  const leaderboardIndexOfFirst = leaderboardIndexOfLast - leaderboardPerPage;
  const currentLeaderboard = leaderboard.slice(leaderboardIndexOfFirst, leaderboardIndexOfLast);
  // Add state for carousel window start index
  const [topMemesStart, setTopMemesStart] = useState(0); // Start with the first 3 memes
  const navigate = useNavigate();

  // Calculate memes to display for the current page
  const indexOfLastMeme = currentPage * memesPerPage;
  const indexOfFirstMeme = indexOfLastMeme - memesPerPage;
  const currentMemes = memes.slice(indexOfFirstMeme, indexOfLastMeme);

  useEffect(() => {
    if (isFullScreen) {
      setScrollPosition(window.scrollY);
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.documentElement.style.overflow = 'hidden';
      setShowMainContent(false);
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.documentElement.style.overflow = '';
      window.scrollTo(0, scrollPosition);
      setShowMainContent(true);
    }
  }, [isFullScreen, scrollPosition]);

  useEffect(() => {
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) { // If a session is established, hide auth popup
        setShowAuthPopup(false);
      }
    });

    // Initial check for session (and re-check on page load)
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return;
      }
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) { // If a session is established, hide auth popup
        setShowAuthPopup(false);
      }
    };
    checkSession();

    // Fetch initial memes and top memes
    fetchMemes();
    fetchTopMemes();
    fetchLeaderboard();

    // Socket.IO event listeners
    socket.on('vote_update', (updatedMeme: Meme) => {
      setMemes(prevMemes => {
        const newMemes = prevMemes.map(meme =>
          meme.id === updatedMeme.id ? updatedMeme : meme
        );
        // Re-sort the memes by upvotes in descending order
        const sortedMemes = newMemes.sort((a: Meme, b: Meme) => b.upvotes - a.upvotes);
        console.log('Memes data after vote update (sorted):', sortedMemes);
        return sortedMemes;
      });
      setLeaderboard(prevLeaderboard => {
        const newLeaderboard = prevLeaderboard.map(meme =>
          meme.id === updatedMeme.id ? updatedMeme : meme
        ).sort((a: Meme, b: Meme) => b.upvotes - a.upvotes);
        console.log('Leaderboard data after vote update (sorted):', newLeaderboard);
        return newLeaderboard;
      });
    });

    socket.on('bid_update', (updatedMeme: Meme) => {
      setMemes(prevMemes => {
        const newMemes = prevMemes.map(meme =>
          meme.id === updatedMeme.id ? updatedMeme : meme
        );
        // Re-sort the memes by upvotes in descending order after a bid update
        const sortedMemes = newMemes.sort((a: Meme, b: Meme) => b.upvotes - a.upvotes);
        console.log('Memes data after bid update (sorted):', sortedMemes);
        return sortedMemes;
      });
      setLeaderboard(prevLeaderboard => {
        const newLeaderboard = prevLeaderboard.map(meme =>
          meme.id === updatedMeme.id ? updatedMeme : meme
        ).sort((a: Meme, b: Meme) => b.upvotes - a.upvotes);
        console.log('Leaderboard data after bid update (sorted):', newLeaderboard);
        return newLeaderboard;
      });
    });

    socket.on('bid_error', (error: string) => {
      console.error('Bid Error from Server:', error);
      alert(`Bid Error: ${error}`);
    });

    return () => {
      socket.off('vote_update')
      socket.off('bid_update')
    }
  }, [])

  useEffect(() => {
    // Always keep topMemes in sync with the top 10 memes by upvotes
    if (memes.length > 0) {
      const sortedTop = [...memes].sort((a, b) => b.upvotes - a.upvotes).slice(0, 10);
      setTopMemes(sortedTop);
    }
  }, [memes]);

  const fetchMemes = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/memes')
      const data = await response.json()
      // Ensure memes are sorted by upvotes in descending order on the client side
      const sortedMemes = (data as Meme[]).sort((a: Meme, b: Meme) => b.upvotes - a.upvotes);
      console.log('Memes data before setting state (sorted by fetchMemes):', sortedMemes);
      setMemes(sortedMemes);
    } catch (error) {
      console.error('Error fetching memes:', error)
    }
  }

  const fetchTopMemes = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/memes?top=10');
      const data = await response.json();
      console.log('Fetched top memes data:', data);
      const sortedTopMemes = (data as Meme[]).sort((a: Meme, b: Meme) => b.upvotes - a.upvotes);
      setTopMemes(sortedTopMemes);
    } catch (error) {
      console.error('Error fetching top memes:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/leaderboard?top=10')
      const data = await response.json()
      const sortedLeaderboard = (data as Meme[]).sort((a: Meme, b: Meme) => b.upvotes - a.upvotes);
      console.log('Leaderboard data before setting state (sorted by fetchLeaderboard):', sortedLeaderboard);
      setLeaderboard(sortedLeaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const handleVote = (memeId: number, voteType: 'up' | 'down') => {
    if (!user) {
      alert('Please sign in to vote.');
      return;
    }
    socket.emit('vote', { meme_id: memeId, vote_type: voteType, user_id: user.id }); // Pass user.id
  }

  const handlePlaceBid = (memeId: number, credits: number) => {
    if (!user) {
      alert('Please sign in to place a bid.');
      return;
    }
    if (!credits || credits <= 0) return; // Ensure credits is valid
    
    const bid = {
      meme_id: memeId,
      user_id: user.id, // Use authenticated user ID
      credits: credits
    };
    
    socket.emit('place_bid', bid);
    setBidAmount(''); // Clear the global bidAmount, though localBidAmount is used now
    setSelectedMemeId(null);
  };

  // Auth handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          alert('Login failed: Email not confirmed. Please check your email and click the confirmation link. You should then be automatically logged in.');
        } else {
          alert(`Login failed: ${error.message}`);
        }
        throw error;
      }
      alert('Logged in successfully!');
      setShowAuthPopup(false);
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      alert('Signed up successfully! Please check your email to confirm.');
      setShowAuthPopup(false);
      setEmail('');
      setPassword('');
      navigate('/');
    } catch (error: any) {
      console.error('Signup error:', error.message);
      alert(`Signup failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      if (!session) {
        setUser(null);
        setSession(null);
        navigate('/login');
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      alert('Logged out successfully!');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error.message);
      alert(`Logout failed: ${error.message}`);
      navigate('/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tags = newMeme.tags.split(',').map(tag => tag.trim());

    try {
      const response = await fetch('http://localhost:5050/api/memes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`, // Include auth token
        },
        body: JSON.stringify({
          ...newMeme,
          tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meme');
      }

      const createdMeme = await response.json();
      setMemes(prevMemes => {
        const updatedMemes = [createdMeme, ...prevMemes];
        // Ensure the entire list is sorted by upvotes in descending order after adding a new meme
        const sortedMemes = updatedMemes.sort((a: Meme, b: Meme) => b.upvotes - a.upvotes);
        console.log('Memes data after new meme creation (sorted):', sortedMemes);
        return sortedMemes;
      });
      setNewMeme({ title: '', image_url: '', tags: '' });
      setShowCreateMemePopup(false);
    } catch (error: any) {
      console.error('Error creating meme:', error);
      alert(`Error creating meme: ${error.message}`);
    }
  };

  const MemeCard = ({ meme, onBid, onVote, onImageClick }: MemeCardProps) => {
    const [showBidInput, setShowBidInput] = useState(false);
    const [localBidAmount, setLocalBidAmount] = useState('');

    const handleBidSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!localBidAmount || parseFloat(localBidAmount) <= (meme.highest_bid || 0)) {
        alert('Bid amount must be greater than current highest bid.');
        return;
      }
      onBid(meme.id, parseFloat(localBidAmount));
      setShowBidInput(false);
    };

    return (
      <div className="cyber-card p-4 flex flex-col justify-between overflow-hidden relative">
        {/* Main content area (image) */}
        <div
          className="relative overflow-hidden rounded-lg h-80"
          style={{
            transition: 'none',
          }}
        >
          <img
            src={meme.image_url}
            alt={meme.title}
            className="w-full h-full object-cover rounded-lg absolute inset-0"
            style={{ objectFit: 'cover', transform: 'translateZ(0)' }}
            onClick={() => {
              onImageClick(meme);
            }}
          />
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent rounded-b-lg">
            <h3 className="text-lg text-white font-bold whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: '"Orbitron", sans-serif' }}>{meme.title}</h3>
            {meme.tags && meme.tags.length > 0 && (
              <p className="text-sm text-neon-purple" style={{ fontFamily: '"Chakra Petch", sans-serif' }}>
                Tags: {meme.tags.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Caption section */}
        {meme.caption && (
          <div className="mt-2 p-2 bg-black/50 rounded-lg">
            <p className="text-sm text-neon-purple" style={{ fontFamily: '"Chakra Petch", sans-serif' }}>
              {meme.caption}
            </p>
          </div>
        )}

        {/* Details section (Votes, Bid button, ETH) - always visible, below image */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg text-white">{meme.upvotes}</span>
            <div className="flex flex-col items-center ml-1">
              <button onClick={() => onVote(meme.id, 'up')} className="text-neon-pink text-2xl leading-none">
                ▲
              </button>
              <button onClick={() => onVote(meme.id, 'down')} className="text-neon-blue text-2xl leading-none">
                ▼
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBidInput(!showBidInput)}
              className="cyber-button-border px-3 py-1 text-sm font-bold uppercase"
              style={{
                borderColor: 'var(--neon-purple)',
                borderImage: 'linear-gradient(to right, var(--neon-purple), var(--neon-pink)) 1',
                color: 'var(--neon-pink)'
              }}
            >
              Bid
            </button>
            <span className="text-lg text-white font-bold">{meme.highest_bid ? `$${meme.highest_bid.toFixed(2)}` : 'N/A'}</span>
          </div>
        </div>

        {/* Bid input form (conditionally shown within details section) */}
        {showBidInput && (
          <form onSubmit={handleBidSubmit} className="flex items-center space-x-2 mt-4">
            <input
              type="number"
              value={localBidAmount}
              onChange={(e) => setLocalBidAmount(e.target.value)}
              placeholder="Your bid"
              className="cyberpunk-input w-full p-2 text-sm"
              min={(meme.highest_bid || 0) + 1}
              required
            />
            <button type="submit" className="neon-button-pink px-3 py-1 text-sm">Bid</button>
          </form>
        )}

      </div>
    );
  };

  // Helper to scroll left/right
  const handleTopMemesScroll = (direction: 'left' | 'right') => {
    setTopMemesStart((prev) => {
      if (direction === 'left') {
        return Math.max(0, prev - 1);
      } else {
        return Math.min(topMemes.length - 3, prev + 1);
      }
    });
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={handleLogin}
            onSignup={handleSignup}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isLoginMode={isLoginMode}
            setIsLoginMode={setIsLoginMode}
            showAuthPopup={showAuthPopup}
            setShowAuthPopup={setShowAuthPopup}
          />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute user={user}>
            <div className="min-h-screen flex flex-col items-center relative pb-20 w-full cyberpunk-bg">
              {/* Animated scanlines and particles overlays */}
              <div className="scanline-overlay" />
              <div className="cyber-particles">
                <div className="cyber-particle" style={{ left: '12%', top: '30%', width: 18, height: 18, background: 'radial-gradient(circle, #0ff 60%, #00f6ff 100%)', animationDelay: '0s' }} />
                <div className="cyber-particle" style={{ left: '70%', top: '18%', width: 12, height: 12, background: 'radial-gradient(circle, #ff31a9 60%, #ff31a9 100%)', animationDelay: '1.2s' }} />
                <div className="cyber-particle" style={{ left: '40%', top: '60%', width: 24, height: 24, background: 'radial-gradient(circle, #fff 60%, #0ff 100%)', animationDelay: '2.1s' }} />
                <div className="cyber-particle" style={{ left: '80%', top: '80%', width: 10, height: 10, background: 'radial-gradient(circle, #ff31a9 60%, #fff 100%)', animationDelay: '0.7s' }} />
                <div className="cyber-particle" style={{ left: '55%', top: '40%', width: 16, height: 16, background: 'radial-gradient(circle, #0ff 60%, #fff 100%)', animationDelay: '1.7s' }} />
              </div>
              {/* Header */}
              <header className="w-full flex flex-col select-none pt-8 pb-2 px-8">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-4xl font-extrabold uppercase tracking-widest gradient-meme-hustle-heading" style={{ fontFamily: 'Orbitron, Share Tech Mono, Arial Black, sans-serif', textShadow: '0 0 18px #00f6ff, 0 0 32px #ff31a9, 0 0 4px #fff' }}>Meme Hustle</span>
                  <div className="flex items-center space-x-6">
                    <button className="neon-header-btn" onClick={() => setShowCreateMemePopup(true)}>Add Meme</button>
                    <button className="neon-header-btn" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
                    <button className="neon-header-icon-btn" onClick={handleLogout} title="Logout">
                      {/* Logout SVG icon */}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff31a9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <hr className="w-full border-t-2 border-neon-blue/60 mb-8" />
                <div className="w-full flex justify-center">
                  <div className="glassmorphism-panel flex flex-col items-start w-full mb-8 max-w-2xl p-8 rounded-2xl shadow-lg">
                    <p className="text-3xl md:text-4xl font-extrabold mb-0 subtitle-glow-pink"
                      style={{
                        fontFamily: 'Orbitron, \"Press Start 2P\", Share Tech Mono, monospace',
                        color: '#ff31a9',
                        textShadow: '0 0 18px #ff31a9, 0 0 36px #ff31a9, 0 0 8px #ff31a9',
                        letterSpacing: '0.13em',
                        lineHeight: 1.18,
                        fontSize: '2.7rem',
                        marginBottom: '0',
                      }}>
                      Create, Upvote, and Bid on
                    </p>
                    <p className="text-3xl md:text-4xl font-extrabold mb-6 subtitle-glow-blue"
                      style={{
                        fontFamily: 'Orbitron, \"Press Start 2P\", Share Tech Mono, monospace',
                        color: '#00f6ff',
                        textShadow: '0 0 18px #00f6ff, 0 0 36px #00f6ff, 0 0 8px #00f6ff',
                        letterSpacing: '0.13em',
                        lineHeight: 1.18,
                        fontSize: '2.7rem',
                        marginTop: '0.1em',
                        marginBottom: '1.2em',
                      }}>
                      Neon Memes!
                    </p>
                    <button className="get-started-btn text-xl px-10 py-3 font-bold tracking-wider animate-pulse mt-2"
                      style={{
                        minWidth: '260px',
                        background: 'linear-gradient(90deg, #0ff 0%, #ff31a9 100%)',
                        color: '#fff',
                        border: '3.5px solid #00f6ff',
                        borderRadius: '0.45rem',
                        boxShadow: '0 0 32px #00f6ff, 0 0 64px #ff31a9',
                        textShadow: '0 0 8px #fff, 0 0 24px #00f6ff',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        letterSpacing: '0.13em',
                        fontSize: '1.35rem',
                        padding: '0.7rem 0',
                        paddingLeft: '2rem',
                        paddingRight: '2rem',
                      }}
                      onClick={() => setShowCreateMemePopup(true)}
                      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      Add Meme
                    </button>
                  </div>
                </div>
              </header>
              {/* Top Memes Section */}
              <section className="w-full mb-12 relative">
                <div className="w-full flex justify-center mb-4">
                  <h2 className="cyberpunk-leaderboard-header">TOP MEMES</h2>
                </div>
                <div className="relative w-full flex items-center">
                  {/* Left scroll button - edge of viewport, no box */}
                  <button
                    className="neon-scroll-btn-cyber absolute left-0 top-1/2 -translate-y-1/2 z-30 text-5xl"
                    style={{ background: 'none', border: 'none', boxShadow: 'none', color: '#00f6ff', textShadow: '0 0 24px #00f6ff, 0 0 48px #ff31a9', cursor: 'pointer', width: '3.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleTopMemesScroll('left')}
                    disabled={topMemesStart === 0}
                  >
                    ◀
                  </button>
                  {/* Meme row - centered, with padding for buttons */}
                  <div className="flex justify-center w-full max-w-6xl mx-auto gap-6 pb-4 px-16 z-20 relative">
                    {topMemes.slice(topMemesStart, topMemesStart + 3).map((meme) => (
                      <div className="neon-glass-card shadow-neon-pink z-20 relative w-96 h-[28rem] flex-shrink-0">
                        <MemeCard
                          key={meme.id}
                          meme={meme}
                          onBid={handlePlaceBid}
                          onVote={handleVote}
                          onImageClick={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                  {/* Right scroll button - edge of viewport, no box */}
                  <button
                    className="neon-scroll-btn-cyber absolute right-0 top-1/2 -translate-y-1/2 z-30 text-5xl"
                    style={{ background: 'none', border: 'none', boxShadow: 'none', color: '#ff31a9', textShadow: '0 0 24px #ff31a9, 0 0 48px #00f6ff', cursor: 'pointer', width: '3.5rem', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={() => handleTopMemesScroll('right')}
                    disabled={topMemesStart >= topMemes.length - 3}
                  >
                    ▶
                  </button>
                </div>
              </section>
              {/* All Memes Section */}
              <section className="w-full max-w-6xl mx-auto">
                <div className="w-full flex justify-center mt-12 mb-4">
                  <h2 className="cyberpunk-leaderboard-header">ALL MEMES</h2>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 z-20 relative">
                  {currentMemes.map((meme) => (
                    <div className="neon-glass-card shadow-neon-blue z-20 relative">
                      <MemeCard
                        key={meme.id}
                        meme={meme}
                        onBid={handlePlaceBid}
                        onVote={handleVote}
                        onImageClick={() => {}}
                      />
                    </div>
                  ))}
                </div>
                {/* Pagination controls */}
                <div className="flex items-center justify-center mt-8 space-x-6">
                  <button
                    className="neon-button-cyber px-6 py-2 text-lg"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ◀ Previous
                  </button>
                  <span className="text-xl text-neon-blue font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
                    Page {currentPage} of {Math.ceil(memes.length / memesPerPage)}
                  </span>
                  <button
                    className="neon-button-cyber px-6 py-2 text-lg"
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(memes.length / memesPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(memes.length / memesPerPage)}
                  >
                    Next ▶
                  </button>
                </div>
              </section>
              {/* Add Meme Popup */}
              {showCreateMemePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-slide-up">
                  <div className="cyber-card neon-glass-card p-8 shadow-xl w-full max-w-lg mx-4 relative border-4 border-neon-blue">
                    <button
                      onClick={() => setShowCreateMemePopup(false)}
                      className="absolute top-4 right-4 text-neon-red hover:text-white text-2xl font-bold"
                    >
                      &times;
                    </button>
                    <h2 className="cyberpunk-heading text-3xl mb-6 text-center cyberpunk-section-header-glow">Add Meme</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="meme-title" className="cyberpunk-label block text-sm mb-2">Title</label>
                        <input
                          type="text"
                          id="meme-title"
                          value={newMeme.title}
                          onChange={(e) => setNewMeme({ ...newMeme, title: e.target.value })}
                          className="cyberpunk-input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="meme-image-url" className="cyberpunk-label block text-sm mb-2">Image URL</label>
                        <input
                          type="text"
                          id="meme-image-url"
                          value={newMeme.image_url}
                          onChange={(e) => setNewMeme({ ...newMeme, image_url: e.target.value })}
                          className="cyberpunk-input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="meme-tags" className="cyberpunk-label block text-sm mb-2">Tags (comma separated)</label>
                        <input
                          type="text"
                          id="meme-tags"
                          value={newMeme.tags}
                          onChange={(e) => setNewMeme({ ...newMeme, tags: e.target.value })}
                          className="cyberpunk-input w-full"
                        />
                      </div>
                      <button type="submit" className="neon-button-cyber w-full py-3 mt-4 text-lg">Submit</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute user={user}>
            <div>
              {/* Header (copied from main page for consistency) */}
              <header className="w-full flex flex-col select-none pt-8 pb-2 px-8">
                <div className="w-full flex items-center justify-between mb-2">
                  <span className="text-4xl font-extrabold uppercase tracking-widest gradient-meme-hustle-heading" style={{ fontFamily: 'Orbitron, Share Tech Mono, Arial Black, sans-serif', textShadow: '0 0 18px #00f6ff, 0 0 32px #ff31a9, 0 0 4px #fff' }}>Meme Hustle</span>
                  <div className="flex items-center space-x-6">
                    <button className="neon-header-btn" onClick={() => setShowCreateMemePopup(true)}>Add Meme</button>
                    <button className="neon-header-btn" onClick={() => navigate('/leaderboard')}>Leaderboard</button>
                    <button className="neon-header-icon-btn" onClick={handleLogout} title="Logout">
                      {/* Logout SVG icon */}
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff31a9" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <hr className="w-full border-t-2 border-neon-blue/60 mb-8" />
              </header>
              {/* Leaderboard Content */}
              <div className="w-full flex flex-col items-center mt-8">
                <h2 className="text-4xl mb-8 text-center text-neon-purple cyberpunk-section-header" style={{ fontFamily: '"Press Start 2P", cursive' }}>LEADERBOARD</h2>
                <div className="w-full max-w-3xl bg-black/60 rounded-xl p-6 shadow-lg overflow-y-auto" style={{ maxHeight: '600px', minHeight: '400px' }}>
                  {currentLeaderboard.length > 0 ? (
                    <ol className="space-y-4">
                      {currentLeaderboard.map((meme, index) => (
                        <li key={meme.id} className="flex items-center space-x-6 bg-black/30 rounded-lg p-4">
                          <span className="text-3xl font-bold text-neon-pink w-8 text-center">{leaderboardIndexOfFirst + index + 1}</span>
                          <img src={meme.image_url} alt={meme.title} className="w-20 h-20 object-cover rounded-lg border-2 border-neon-purple" />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-1">{meme.title}</h3>
                            <p className="text-neon-blue text-sm">Upvotes: {meme.upvotes}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-center text-neon-blue">No leaderboard data yet.</p>
                  )}
                </div>
              </div>
              {/* Add Meme Popup (if needed) */}
              {showCreateMemePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 animate-fade-in-slide-up">
                  <div className="cyber-card neon-glass-card p-8 shadow-xl w-full max-w-lg mx-4 relative border-4 border-neon-blue">
                    <button
                      onClick={() => setShowCreateMemePopup(false)}
                      className="absolute top-4 right-4 text-neon-red hover:text-white text-2xl font-bold"
                    >
                      &times;
                    </button>
                    <h2 className="cyberpunk-heading text-3xl mb-6 text-center cyberpunk-section-header-glow">Add Meme</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="meme-title" className="cyberpunk-label block text-sm mb-2">Title</label>
                        <input
                          type="text"
                          id="meme-title"
                          value={newMeme.title}
                          onChange={(e) => setNewMeme({ ...newMeme, title: e.target.value })}
                          className="cyberpunk-input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="meme-image-url" className="cyberpunk-label block text-sm mb-2">Image URL</label>
                        <input
                          type="text"
                          id="meme-image-url"
                          value={newMeme.image_url}
                          onChange={(e) => setNewMeme({ ...newMeme, image_url: e.target.value })}
                          className="cyberpunk-input w-full"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="meme-tags" className="cyberpunk-label block text-sm mb-2">Tags (comma separated)</label>
                        <input
                          type="text"
                          id="meme-tags"
                          value={newMeme.tags}
                          onChange={(e) => setNewMeme({ ...newMeme, tags: e.target.value })}
                          className="cyberpunk-input w-full"
                        />
                      </div>
                      <button type="submit" className="neon-button-cyber w-full py-3 mt-4 text-lg">Submit</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App 