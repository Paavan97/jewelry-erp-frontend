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
  RadioGroup,
  Radio,
  FormControl,
  FormLabel,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaxConfig, updateTaxConfig, type TaxConfig } from '../../api/config';

const taxConfigSchema = z.object({
  taxEnabled: z.boolean(),
  defaultTaxPercent: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      { message: 'Tax percentage must be between 0 and 100' }
    ),
  taxNumber: z.string().optional(),
  taxType: z.enum(['inclusive', 'exclusive']).optional(),
});

type TaxConfigFormData = z.infer<typeof taxConfigSchema>;

export function Tax() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch tax config
  const { data: config, isLoading, error } = useQuery<TaxConfig>({
    queryKey: ['config', 'tax'],
    queryFn: getTaxConfig,
  });

  // Update tax config mutation
  const updateMutation = useMutation({
    mutationFn: updateTaxConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(['config', 'tax']);
      setSnackbarMessage('Tax configuration saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error?.response?.data?.error || 'Failed to save tax configuration');
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
  } = useForm<TaxConfigFormData>({
    resolver: zodResolver(taxConfigSchema),
    defaultValues: {
      taxEnabled: false,
      defaultTaxPercent: '',
      taxNumber: '',
      taxType: 'inclusive',
    },
  });

  const taxEnabled = watch('taxEnabled');

  // Reset form when config data is loaded
  useEffect(() => {
    if (config) {
      reset({
        taxEnabled: config.taxEnabled ?? false,
        defaultTaxPercent: config.defaultTaxPercent?.toString() || '',
        taxNumber: config.taxNumber || '',
        taxType: config.taxType || 'inclusive',
      });
    }
  }, [config, reset]);

  const onSubmit = (data: TaxConfigFormData) => {
    const submitData = {
      ...data,
      defaultTaxPercent: data.defaultTaxPercent ? parseFloat(data.defaultTaxPercent) : undefined,
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
            : 'Failed to load tax configuration. Please try again.'}
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
        Tax Settings
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
              {/* Tax Enabled Switch */}
              <Grid item xs={12}>
                <Controller
                  name="taxEnabled"
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
                          Enable Tax
                        </Typography>
                      }
                    />
                  )}
                />
              </Grid>

              {/* Default Tax Percent */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="defaultTaxPercent"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Default Tax Percentage"
                      type="number"
                      fullWidth
                      disabled={!taxEnabled}
                      error={!!errors.defaultTaxPercent}
                      helperText={errors.defaultTaxPercent?.message || 'Enter percentage (0-100)'}
                      InputProps={{
                        endAdornment: <Typography sx={{ color: '#666666' }}>%</Typography>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
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

              {/* Tax Number */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="taxNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tax Number"
                      fullWidth
                      disabled={!taxEnabled}
                      error={!!errors.taxNumber}
                      helperText={errors.taxNumber?.message}
                      placeholder="e.g., GSTIN, VAT Number"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-disabled': {
                            backgroundColor: '#f5f5f5',
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

              {/* Tax Type Radio Buttons */}
              <Grid item xs={12}>
                <Controller
                  name="taxType"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      component="fieldset"
                      disabled={!taxEnabled}
                      error={!!errors.taxType}
                    >
                      <FormLabel
                        component="legend"
                        sx={{
                          color: taxEnabled ? '#000000' : '#999999',
                          fontWeight: 500,
                          mb: 1,
                        }}
                      >
                        Tax Type
                      </FormLabel>
                      <RadioGroup
                        {...field}
                        row
                        sx={{
                          '& .MuiRadio-root': {
                            color: '#5e3b63',
                            '&.Mui-checked': {
                              color: '#5e3b63',
                            },
                            '&.Mui-disabled': {
                              color: '#cccccc',
                            },
                          },
                        }}
                      >
                        <FormControlLabel
                          value="inclusive"
                          control={<Radio />}
                          label={
                            <Typography
                              sx={{
                                color: taxEnabled ? '#000000' : '#999999',
                              }}
                            >
                              Inclusive (Tax included in price)
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          value="exclusive"
                          control={<Radio />}
                          label={
                            <Typography
                              sx={{
                                color: taxEnabled ? '#000000' : '#999999',
                              }}
                            >
                              Exclusive (Tax added to price)
                            </Typography>
                          }
                        />
                      </RadioGroup>
                      {errors.taxType && (
                        <Typography
                          variant="caption"
                          sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}
                        >
                          {errors.taxType.message}
                        </Typography>
                      )}
                    </FormControl>
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
