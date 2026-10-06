import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { validateSignupPassword } from './passwordValidation';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function Login() {
  const { login, signup, sessionError } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isSignup) {
      const validationError = validateSignupPassword(password);
      if (validationError) {
        setPasswordError(validationError);
        return;
      }
    }
    setPasswordError(null);
    setLoading(true);
    try {
      if (isSignup) await signup(username, password);
      else await login(username, password);
      navigate('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err) || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
        background: 'radial-gradient(ellipse at top, #24211d 0%, #101214 62%)',
      }}
    >
      <Card
        sx={{
          width: 'min(420px, 100%)',
          p: { xs: 1, sm: 2 },
          borderRadius: 3,
          boxShadow: '0 24px 72px rgba(0, 0, 0, 0.42)',
        }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {isSignup ? 'Create account' : 'Sign in'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isSignup
              ? 'Create your account to start organizing your beers.'
              : 'Sign in to continue to your beer tier lists.'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {sessionError && <Alert severity="warning" sx={{ mb: 2 }}>{sessionError}</Alert>}
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              required
              inputProps={{ minLength: 3, maxLength: 256 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(validateSignupPassword(e.target.value));
              }}
              fullWidth
              required
              inputProps={isSignup ? { minLength: 12, maxLength: 128 } : undefined}
              error={isSignup && Boolean(passwordError)}
              helperText={
                (isSignup && passwordError) ||
                (isSignup &&
                  'Use 12–128 characters, including uppercase and lowercase letters, a digit, and a non-letter/digit character.')
              }
            />

            <Button type="submit" variant="contained" disabled={loading} size="large">
              {isSignup ? 'Sign up' : 'Sign in'}
            </Button>

            <Button
              variant="text"
              onClick={() => {
                setIsSignup((s) => !s);
                setPasswordError(null);
              }}
            >
              {isSignup ? 'Have an account? Sign in' : "Don't have an account? Create one"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
