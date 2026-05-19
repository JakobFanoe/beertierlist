import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Login() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) await signup(email, password);
      else await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'linear-gradient(180deg,#1f1c1c,#111)' }}>
      <Card sx={{ width: 420, p: 2, borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>
            {isSignup ? 'Create account' : 'Sign in'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />

            <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: '#1976d2' }}>
              {isSignup ? 'Sign up' : 'Sign in'}
            </Button>

            <Button variant="text" onClick={() => setIsSignup((s) => !s)}>
              {isSignup ? 'Have an account? Sign in' : "Don't have an account? Create one"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
