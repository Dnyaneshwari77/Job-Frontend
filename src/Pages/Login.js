// src/pages/Login.js
import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Grid,
  Alert
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/v1/auth/login', form);

      const { token, user } = response.data;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('name', user.name);

      setSuccess('Login successful!');
      navigate('/'); // navigate to home or dashboard
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Check your credentials.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, p: 4, boxShadow: 3, borderRadius: 2, bgcolor: 'white' }}>
        <Typography variant="h5" gutterBottom align="center">
          Login
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="Password"
                type="password"
                fullWidth
                value={form.password}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" type="submit" fullWidth>
                Login
              </Button>
            </Grid>
          </Grid>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register">
              Register
            </Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
