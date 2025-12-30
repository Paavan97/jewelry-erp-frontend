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
  Switch,
  FormControlLabel,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInvoiceConfig, updateInvoiceConfig, type InvoiceConfig } from '../../api/config';

const invoiceConfigSchema = z.object({
  invoiceTitle: z.string().optional(),
  footerNote: z.string().optional(),
  terms: z.string().optional(),
  showLogo: z.boolean(),
  defaultDueDays: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 0;
      },
      { message: 'Due days must be a positive number' }
    ),
});

type InvoiceConfigFormData = z.infer<typeof invoiceConfigSchema>;

export function Invoice() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch invoice config
  const { data: config, isLoading, error } = useQuery<InvoiceConfig>({
    queryKey: ['config', 'invoice'],
    queryFn: getInvoiceConfig,
  });

  // Update invoice config mutation
  const updateMutation = useMutation({
    mutationFn: updateInvoiceConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(['config', 'invoice']);
      setSnackbarMessage('Invoice configuration saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error?.response?.data?.error || 'Failed to save invoice configuration');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<InvoiceConfigFormData>({
    resolver: zodResolver(invoiceConfigSchema),
    defaultValues: {
      invoiceTitle: '',
      footerNote: '',
      terms: '',
      showLogo: false,
      defaultDueDays: '',
    },
  });

  // Reset form when config data is loaded
  useEffect(() => {
    if (config) {
      reset({
        invoiceTitle: config.invoiceTitle || '',
        footerNote: config.footerNote || '',
        terms: config.terms || '',
        showLogo: config.showLogo ?? false,
        defaultDueDays: config.defaultDueDays?.toString() || '',
      });
    }
  }, [config, reset]);

  const onSubmit = (data: InvoiceConfigFormData) => {
    const submitData = {
      ...data,
      defaultDueDays: data.defaultDueDays ? parseInt(data.defaultDueDays, 10) : undefined,
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
            : 'Failed to load invoice configuration. Please try again.'}
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
        Invoice Settings
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
              {/* Basic Settings Section */}
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
                  Basic Settings
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="invoiceTitle"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Invoice Title"
                      fullWidth
                      error={!!errors.invoiceTitle}
                      helperText={errors.invoiceTitle?.message}
                      placeholder="e.g., Invoice, Bill, Tax Invoice"
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
                  name="defaultDueDays"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Default Due Days"
                      type="number"
                      fullWidth
                      error={!!errors.defaultDueDays}
                      helperText={errors.defaultDueDays?.message || 'Number of days until payment is due'}
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

              <Grid item xs={12}>
                <Controller
                  name="showLogo"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          {...field}
                          checked={field.value}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#5e3b63',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#5e3b63',
                            },
                          }}
                        />
                      }
                      label={
                        <Typography
                          sx={{
                            color: '#000000',
                            fontWeight: 500,
                            fontSize: '1rem',
                          }}
                        >
                          Show Logo on Invoice
                        </Typography>
                      }
                    />
                  )}
                />
              </Grid>

              {/* Footer Note Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
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
                  Footer Note
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="footerNote"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Footer Note"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.footerNote}
                      helperText={errors.footerNote?.message || 'Text displayed at the bottom of the invoice'}
                      placeholder="e.g., Thank you for your business!"
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

              {/* Terms & Conditions Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
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
                  Terms & Conditions
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Terms & Conditions"
                      fullWidth
                      multiline
                      rows={6}
                      error={!!errors.terms}
                      helperText={errors.terms?.message || 'Terms and conditions displayed on the invoice'}
                      placeholder="e.g., Payment is due within the specified number of days..."
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
                <Divider sx={{ my: 2 }} />
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
