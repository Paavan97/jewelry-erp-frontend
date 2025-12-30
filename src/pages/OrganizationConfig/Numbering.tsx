import { useState, useEffect, useMemo } from 'react';
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
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNumberingConfig, updateNumberingConfig, type NumberingConfig } from '../../api/config';

const numberingConfigSchema = z.object({
  invoicePrefix: z.string().optional(),
  startFrom: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 0;
      },
      { message: 'Start number must be a positive number' }
    ),
  customerPrefix: z.string().optional(),
});

type NumberingConfigFormData = z.infer<typeof numberingConfigSchema>;

export function Numbering() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch numbering config
  const { data: config, isLoading, error } = useQuery<NumberingConfig>({
    queryKey: ['config', 'numbering'],
    queryFn: getNumberingConfig,
  });

  // Update numbering config mutation
  const updateMutation = useMutation({
    mutationFn: updateNumberingConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(['config', 'numbering']);
      setSnackbarMessage('Numbering configuration saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error?.response?.data?.error || 'Failed to save numbering configuration');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<NumberingConfigFormData>({
    resolver: zodResolver(numberingConfigSchema),
    defaultValues: {
      invoicePrefix: '',
      startFrom: '',
      customerPrefix: '',
    },
  });

  // Watch fields for live preview
  const invoicePrefix = watch('invoicePrefix') || '';
  const startFrom = watch('startFrom') || '';

  // Generate preview
  const preview = useMemo(() => {
    const prefix = invoicePrefix.trim() || 'INV';
    const number = startFrom.trim() ? parseInt(startFrom, 10) : 10001;
    if (isNaN(number)) {
      return `${prefix}-10001`;
    }
    return `${prefix}-${number}`;
  }, [invoicePrefix, startFrom]);

  // Reset form when config data is loaded
  useEffect(() => {
    if (config) {
      reset({
        invoicePrefix: config.invoicePrefix || '',
        startFrom: config.startFrom?.toString() || '',
        customerPrefix: config.customerPrefix || '',
      });
    }
  }, [config, reset]);

  const onSubmit = (data: NumberingConfigFormData) => {
    const submitData = {
      ...data,
      startFrom: data.startFrom ? parseInt(data.startFrom, 10) : undefined,
    };
    updateMutation.mutate(submitData);
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
            : 'Failed to load numbering configuration. Please try again.'}
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
        Numbering Settings
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
              {/* Invoice Numbering Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    color: '#0d0421',
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}
                >
                  Invoice Numbering
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="invoicePrefix"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Invoice Prefix"
                      fullWidth
                      error={!!errors.invoicePrefix}
                      helperText={errors.invoicePrefix?.message || 'Prefix for invoice numbers (e.g., INV, BILL)'}
                      placeholder="INV"
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
                  name="startFrom"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Start From"
                      type="number"
                      fullWidth
                      error={!!errors.startFrom}
                      helperText={errors.startFrom?.message || 'Starting number for invoices'}
                      InputProps={{
                        inputProps: { min: 0 },
                      }}
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

              {/* Live Preview */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666666',
                      mb: 1,
                      fontWeight: 500,
                    }}
                  >
                    Preview:
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#5e3b63',
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    }}
                  >
                    {preview}
                  </Typography>
                </Paper>
              </Grid>

              {/* Customer Numbering Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    color: '#0d0421',
                    fontWeight: 600,
                    mb: 2,
                    mt: 2,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                  }}
                >
                  Customer Numbering
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="customerPrefix"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Customer Prefix"
                      fullWidth
                      error={!!errors.customerPrefix}
                      helperText={errors.customerPrefix?.message || 'Prefix for customer numbers (e.g., CUST, CLI)'}
                      placeholder="CUST"
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

              {/* Action Buttons */}
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
