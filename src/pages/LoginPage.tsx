import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginGlassBackground } from '../components/common/GlassBackground';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Step 1: Login to get access token
      const backendUrl = 'https://ryvr-backend.onrender.com';
      const loginResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!loginResponse.ok) {
        if (loginResponse.status === 401) {
          throw new Error('Invalid username or password');
        } else if (loginResponse.status === 422) {
          throw new Error('Please check your username and password format');
        } else {
          throw new Error(`Login failed: ${loginResponse.status}`);
        }
      }

      const loginData = await loginResponse.json();
      
      // Step 2: Get user data using the token
      const userResponse = await fetch(`${backendUrl}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }

      const userData = await userResponse.json();

      // Step 3: Login with token and user data
      login(loginData.access_token, userData);
      
      // Route based on user role
      const getDefaultRoute = () => {
        if (userData.role === 'admin') return '/admin/dashboard';
        if (['agency_owner', 'agency_manager', 'agency_viewer'].includes(userData.role)) {
          return '/agency/dashboard';
        }
        return '/business/dashboard';
      };
      
      navigate(getDefaultRoute());
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginGlassBackground>
      <Container component="main">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        <Paper
          elevation={theme.palette.mode === 'dark' ? 8 : 10}
          sx={{
            p: 4,
            borderRadius: 3,
            background: theme.palette.background.paper,
            backdropFilter: 'blur(10px)',
            width: '100%',
            maxWidth: 400,
            border: theme.palette.mode === 'dark' 
              ? `1px solid ${theme.palette.divider}`
              : 'none',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontFamily: '"Yellowtail", cursive',
                fontWeight: 400,
                color: theme.palette.primary.main,
                mb: 1,
              }}
            >
              RYVR
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontFamily: theme.typography.fontFamily }}
            >
              Marketing Automation Platform
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="username"
              label="Username or Email"
              type="text"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              sx={{ mb: 3 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                fontFamily: theme.typography.fontFamily,
                borderRadius: 2,
                textTransform: 'none',
                background: loading 
                  ? theme.palette.action.disabled
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                },
                '&:disabled': {
                  background: theme.palette.action.disabled,
                  color: theme.palette.action.disabled,
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Demo credentials: admin / password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              (Default admin user from backend)
            </Typography>
          </Box>
        </Paper>
        </Box>
      </Container>
    </LoginGlassBackground>
  );
} 