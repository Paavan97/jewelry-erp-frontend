import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.login(data);
      // Store JWT token in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      // Display error message
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 4,
          backgroundColor: '#ffffff',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={{
            mb: 3,
            color: '#000000',
            fontWeight: 600,
          }}
        >
          Login
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid #5e3b63',
              '& .MuiAlert-icon': {
                color: '#5e3b63',
              },
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register('email')}
            label="Email"
            type="email"
            fullWidth
            autoComplete="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#5e3b63',
                },
                '&:hover fieldset': {
                  borderColor: '#5e3b63',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#5e3b63',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#000000',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#5e3b63',
              },
              '& .MuiOutlinedInput-input': {
                color: '#000000',
              },
              '& .MuiFormHelperText-root': {
                color: '#000000',
              },
            }}
          />

          <TextField
            {...register('password')}
            label="Password"
            type="password"
            fullWidth
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#5e3b63',
                },
                '&:hover fieldset': {
                  borderColor: '#5e3b63',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#5e3b63',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#000000',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#5e3b63',
              },
              '& .MuiOutlinedInput-input': {
                color: '#000000',
              },
              '& .MuiFormHelperText-root': {
                color: '#000000',
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              py: 1.5,
              backgroundColor: '#5e3b63',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#5e3b63',
                opacity: 0.9,
              },
              '&:disabled': {
                backgroundColor: '#5e3b63',
                opacity: 0.6,
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: '#ffffff' }} /> : 'Sign In'}
          </Button>
        </Box>
      </Card>
    </Container>
  );
}

