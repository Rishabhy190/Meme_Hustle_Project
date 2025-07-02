#!/bin/bash

# Create necessary directories
mkdir -p backend frontend

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Create environment files
echo "Creating .env files..."

# Backend .env
cat > backend/.env << EOL
PORT=5000
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
EOL

# Frontend .env
cat > frontend/.env << EOL
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
EOL

echo "Setup complete! Please update the .env files with your actual credentials."
echo "To start the development servers:"
echo "1. In one terminal: cd backend && npm run dev"
echo "2. In another terminal: cd frontend && npm run dev" 