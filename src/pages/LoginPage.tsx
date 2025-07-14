import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

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
      // TODO: Replace with actual API call
      const mockResponse = {
        access_token: 'mock-jwt-token',
        user: {
          id: 1,
          email: 'admin@ryvr.com',
          username: formData.username,
          full_name: 'RYVR Admin',
          is_admin: true,
        },
      };

      login(mockResponse.access_token, mockResponse.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8f9fb 0%, #b8cdf8 100%)',
        }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #5f5fff 0%, #b8cdf8 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1,
              }}
            >
              RYVR
            </Typography>
            <Typography variant="body1" color="text.secondary">
              AI Marketing Automation Platform
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
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Demo credentials: admin / password
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 