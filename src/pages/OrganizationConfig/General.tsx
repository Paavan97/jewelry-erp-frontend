import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGeneralConfig, updateGeneralConfig, type GeneralConfig } from '../../api/config';

const generalConfigSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  supportEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

type GeneralConfigFormData = z.infer<typeof generalConfigSchema>;

export function General() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch general config
  const { data: config, isLoading, error } = useQuery<GeneralConfig>({
    queryKey: ['config', 'general'],
    queryFn: getGeneralConfig,
  });

  // Update general config mutation
  const updateMutation = useMutation({
    mutationFn: updateGeneralConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(['config', 'general']);
      setSnackbarMessage('Configuration saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error?.response?.data?.error || 'Failed to save configuration');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<GeneralConfigFormData>({
    resolver: zodResolver(generalConfigSchema),
    defaultValues: {
      organizationName: '',
      supportEmail: '',
      phone: '',
      address: '',
      country: '',
      timezone: '',
      currency: '',
    },
  });

  // Reset form when config data is loaded
  useEffect(() => {
    if (config) {
      reset({
        organizationName: config.organizationName || '',
        supportEmail: config.supportEmail || '',
        phone: config.phone || '',
        address: config.address || '',
        country: config.country || '',
        timezone: config.timezone || '',
        currency: config.currency || '',
      });
    }
  }, [config, reset]);

  const onSubmit = (data: GeneralConfigFormData) => {
    updateMutation.mutate(data);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              fontSize: { xs: '0.875rem', sm: '0.95rem' },
            },
          }}
          onClose={() => {}}
        >
          {error instanceof Error 
            ? error.message 
            : 'Failed to load configuration. Please try again.'}
        </Alert>
      )}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          color: '#0d0421',
          fontWeight: 600,
          mb: 3,
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
        }}
      >
        General Settings
      </Typography>

      <Card
        elevation={0}
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="organizationName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Organization Name"
                      fullWidth
                      required
                      error={!!errors.organizationName}
                      helperText={errors.organizationName?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#5e3b63',
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="supportEmail"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Support Email"
                      type="email"
                      fullWidth
                      error={!!errors.supportEmail}
                      helperText={errors.supportEmail?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#5e3b63',
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#5e3b63',
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Country"
                      fullWidth
                      error={!!errors.country}
                      helperText={errors.country?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#5e3b63',
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Address"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.address}
                      helperText={errors.address?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#5e3b63',
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Timezone"
                      fullWidth
                      error={!!errors.timezone}
                      helperText={errors.timezone?.message}
                      placeholder="e.g., UTC, America/New_York"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#5e3b63',
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="currency"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Currency"
                      fullWidth
                      error={!!errors.currency}
                      helperText={errors.currency?.message}
                      placeholder="e.g., USD, INR, EUR"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#5e3b63',
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'flex-end',
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => reset()}
                    disabled={!isDirty || updateMutation.isPending}
                    fullWidth={isMobile}
                    sx={{
                      borderColor: '#5e3b63',
                      color: '#5e3b63',
                      textTransform: 'none',
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1.25, sm: 1 },
                      fontSize: { xs: '0.875rem', sm: '0.95rem' },
                      fontWeight: 600,
                      '&:hover': {
                        borderColor: '#5e3b63',
                        backgroundColor: 'rgba(94, 59, 99, 0.08)',
                      },
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!isDirty || updateMutation.isPending}
                    fullWidth={isMobile}
                    sx={{
                      backgroundColor: '#5e3b63',
                      color: '#ffffff',
                      textTransform: 'none',
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1.25, sm: 1 },
                      fontSize: { xs: '0.875rem', sm: '0.95rem' },
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#4a2d4f',
                      },
                      '&:disabled': {
                        backgroundColor: '#cccccc',
                        color: '#666666',
                      },
                    }}
                  >
                    {updateMutation.isPending ? (
                      <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                    ) : (
                      'Save'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
