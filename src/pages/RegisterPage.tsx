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
  Stack,
  InputAdornment,
  IconButton,
  Link as MuiLink,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_HEADERS, getAuthHeaders } from '../config/api';
import OnboardingWizard from '../components/OnboardingWizard';
import type { RegistrationData, OnboardingAnswers, OnboardingResponseCreate } from '../types/onboarding';

const WIZARD_STEPS = ['Create Account', 'Tell Us About You', 'Get Started'];

export default function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Registration form state
  const [showPassword, setShowPassword] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    username: '',
    email: '',
    password: '',
    full_name: '',
    account_type: 'individual',
  });

  // Registration data for passing to onboarding
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationData({
      ...registrationData,
      [e.target.name]: e.target.value,
    });
  };

  const validateRegistrationForm = () => {
    if (!registrationData.username || !registrationData.email || !registrationData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (registrationData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registrationData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateRegistrationForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          username: registrationData.username,
          email: registrationData.email,
          password: registrationData.password,
          full_name: registrationData.full_name || registrationData.username,
          role: 'user',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      setRegisteredUser(data.user);
      setAccessToken(data.access_token);

      // Move to onboarding step
      setActiveStep(1);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (answers: OnboardingAnswers) => {
    setLoading(true);
    setError('');

    try {
      // First, create a business for the user
      const businessResponse = await fetch(`${API_BASE_URL}/businesses`, {
        method: 'POST',
        headers: getAuthHeaders(accessToken),
        body: JSON.stringify({
          name: answers[1] || 'My Business', // business_name from question id 1
          industry: answers[2] || '', // industry from question id 2
          website: answers[3] || '', // website from question id 3
          description: '',
        }),
      });

      if (!businessResponse.ok) {
        throw new Error('Failed to create business');
      }

      const business = await businessResponse.json();

      // Submit onboarding responses
      const responses: OnboardingResponseCreate[] = Object.entries(answers).map(
        ([questionId, value]) => ({
          template_id: 1, // Business onboarding template
          respondent_id: business.id,
          respondent_type: 'business',
          question_id: parseInt(questionId),
          response_value: Array.isArray(value) ? value.join(', ') : String(value),
          response_data: {},
        })
      );

      const onboardingResponse = await fetch(
        `${API_BASE_URL}/businesses/${business.id}/onboarding`,
        {
          method: 'POST',
          headers: getAuthHeaders(accessToken),
          body: JSON.stringify(responses),
        }
      );

      if (!onboardingResponse.ok) {
        console.warn('Failed to submit onboarding responses, but continuing...');
      }

      // Log the user in and navigate to dashboard
      login(accessToken, registeredUser);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Failed to complete onboarding. Please try again.');
      setLoading(false);
    }
  };

  const handleOnboardingBack = () => {
    setActiveStep(0);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Paper
            sx={{
              p: 4,
              borderRadius: '12px',
              backgroundColor: theme.palette.mode === 'dark' ? '#1f2937' : '#ffffff',
              border: `1px solid ${
                theme.palette.mode === 'dark' ? '#374151' : '#e5e7eb'
              }`,
              boxShadow: 'none',
              width: '100%',
              maxWidth: 450,
              mx: 'auto',
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
                Ryvr
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                Create your account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start automating your marketing workflows
              </Typography>
            </Box>

            <form onSubmit={handleRegisterSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  name="full_name"
                  label="Full Name"
                  type="text"
                  value={registrationData.full_name}
                  onChange={handleRegistrationChange}
                  disabled={loading}
                />

                <TextField
                  required
                  fullWidth
                  name="username"
                  label="Username"
                  type="text"
                  value={registrationData.username}
                  onChange={handleRegistrationChange}
                  disabled={loading}
                  helperText="This will be your login username"
                />

                <TextField
                  required
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  value={registrationData.email}
                  onChange={handleRegistrationChange}
                  disabled={loading}
                />

                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={registrationData.password}
                  onChange={handleRegistrationChange}
                  disabled={loading}
                  helperText="At least 6 characters"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    fontFamily: theme.typography.fontFamily,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <MuiLink
                      component={Link}
                      to="/login"
                      sx={{
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        fontWeight: 600,
                        '&:hover': {
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Sign in
                    </MuiLink>
                  </Typography>
                </Box>
              </Stack>
            </form>
          </Paper>
        );

      case 1:
        return (
          <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
            <OnboardingWizard
              registrationData={registrationData}
              onComplete={handleOnboardingComplete}
              onBack={handleOnboardingBack}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor:
          theme.palette.mode === 'dark' ? '#111827' : '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Container component="main" maxWidth="lg">
        {activeStep > 0 && (
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {WIZARD_STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {renderStepContent()}
      </Container>
    </Box>
  );
}

