import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth';

export function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // If user data failed to load and we have a token, it means token is invalid
    if (!isLoading && !user && token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress sx={{ color: '#5e3b63' }} />
        </Box>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1, sm: 2, md: 0 }, width: '100%' }}>
        {/* Welcome Message */}
        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: { xs: 2, sm: 3 },
            backgroundColor: '#ffffff',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: '#000000',
              fontWeight: 600,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            }}
          >
            Welcome, {user.name}!
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#000000',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            }}
          >
            You are logged in as <strong>{user.role}</strong> at <strong>{user.organization.name}</strong>
          </Typography>
        </Paper>

        {/* Information Cards */}
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                backgroundColor: '#ffffff',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: '#000000',
                  fontWeight: 600,
                  mb: 2,
                  borderBottom: '2px solid #5e3b63',
                  pb: 1,
                }}
              >
                User Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                    mb: 1.5,
                  }}
                >
                  <strong style={{ color: '#5e3b63' }}>Name:</strong> {user.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                    mb: 1.5,
                  }}
                >
                  <strong style={{ color: '#5e3b63' }}>Email:</strong> {user.email}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                  }}
                >
                  <strong style={{ color: '#5e3b63' }}>Role:</strong>{' '}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      backgroundColor: '#5e3b63',
                      color: '#ffffff',
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {user.role}
                  </Box>
                </Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                backgroundColor: '#ffffff',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                height: '100%',
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: '#000000',
                  fontWeight: 600,
                  mb: 2,
                  borderBottom: '2px solid #5e3b63',
                  pb: 1,
                }}
              >
                Organization Information
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                    mb: 1.5,
                  }}
                >
                  <strong style={{ color: '#5e3b63' }}>Organization:</strong> {user.organization.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#000000',
                  }}
                >
                  <strong style={{ color: '#5e3b63' }}>Business Type:</strong>{' '}
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      px: 1.5,
                      py: 0.5,
                      backgroundColor: '#5e3b63',
                      color: '#ffffff',
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    {user.organization.businessType}
                  </Box>
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}

