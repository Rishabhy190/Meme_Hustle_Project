## Routing

- The app uses React Router for navigation.
- `/login`: Login/Signup page (public)
- `/`: Main landing page (protected, requires login)
- `/leaderboard`: Leaderboard page (protected, requires login)
- Users are redirected to `/login` if not authenticated, and to `/` after login. 