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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFinanceConfig, updateFinanceConfig, type FinanceConfig } from '../../api/config';

const financeConfigSchema = z.object({
  defaultPaymentMode: z.string().optional(),
  enableCreditLimit: z.boolean(),
  currencyFormat: z.string().optional(),
  decimalPrecision: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === '') return true;
        const num = parseInt(val, 10);
        return !isNaN(num) && num >= 0 && num <= 10;
      },
      { message: 'Decimal precision must be between 0 and 10' }
    ),
});

type FinanceConfigFormData = z.infer<typeof financeConfigSchema>;

const paymentModes = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'upi', label: 'UPI' },
  { value: 'online', label: 'Online Payment' },
];

const currencyFormats = [
  { value: 'symbol', label: 'Symbol (₹1,234.56)' },
  { value: 'code', label: 'Code (INR 1,234.56)' },
  { value: 'name', label: 'Name (1,234.56 Rupees)' },
  { value: 'none', label: 'None (1,234.56)' },
];

export function Finance() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch finance config
  const { data: config, isLoading, error } = useQuery<FinanceConfig>({
    queryKey: ['config', 'finance'],
    queryFn: getFinanceConfig,
  });

  // Update finance config mutation
  const updateMutation = useMutation({
    mutationFn: updateFinanceConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(['config', 'finance']);
      setSnackbarMessage('Finance configuration saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error?.response?.data?.error || 'Failed to save finance configuration');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FinanceConfigFormData>({
    resolver: zodResolver(financeConfigSchema),
    defaultValues: {
      defaultPaymentMode: '',
      enableCreditLimit: false,
      currencyFormat: '',
      decimalPrecision: '',
    },
  });

  // Reset form when config data is loaded
  useEffect(() => {
    if (config) {
      reset({
        defaultPaymentMode: config.defaultPaymentMode || '',
        enableCreditLimit: config.enableCreditLimit ?? false,
        currencyFormat: config.currencyFormat || '',
        decimalPrecision: config.decimalPrecision?.toString() || '',
      });
    }
  }, [config, reset]);

  const onSubmit = (data: FinanceConfigFormData) => {
    const submitData = {
      ...data,
      decimalPrecision: data.decimalPrecision ? parseInt(data.decimalPrecision, 10) : undefined,
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
            : 'Failed to load finance configuration. Please try again.'}
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
        Finance Settings
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
              {/* Default Payment Mode */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="defaultPaymentMode"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.defaultPaymentMode}>
                      <InputLabel
                        sx={{
                          '&.Mui-focused': {
                            color: '#5e3b63',
                          },
                        }}
                      >
                        Default Payment Mode
                      </InputLabel>
                      <Select
                        {...field}
                        label="Default Payment Mode"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#5e3b63',
                          },
                          '& .MuiSelect-icon': {
                            color: '#5e3b63',
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {paymentModes.map((mode) => (
                          <MenuItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.defaultPaymentMode && (
                        <Typography
                          variant="caption"
                          sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}
                        >
                          {errors.defaultPaymentMode.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Currency Format */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="currencyFormat"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.currencyFormat}>
                      <InputLabel
                        sx={{
                          '&.Mui-focused': {
                            color: '#5e3b63',
                          },
                        }}
                      >
                        Currency Format
                      </InputLabel>
                      <Select
                        {...field}
                        label="Currency Format"
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e0e0e0',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#5e3b63',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#5e3b63',
                          },
                          '& .MuiSelect-icon': {
                            color: '#5e3b63',
                          },
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {currencyFormats.map((format) => (
                          <MenuItem key={format.value} value={format.value}>
                            {format.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.currencyFormat && (
                        <Typography
                          variant="caption"
                          sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}
                        >
                          {errors.currencyFormat.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Decimal Precision */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="decimalPrecision"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Decimal Precision"
                      type="number"
                      fullWidth
                      error={!!errors.decimalPrecision}
                      helperText={errors.decimalPrecision?.message || 'Number of decimal places (0-10)'}
                      InputProps={{
                        inputProps: { min: 0, max: 10 },
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

              {/* Enable Credit Limit Switch */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="enableCreditLimit"
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
                          Enable Credit Limit
                        </Typography>
                      }
                      sx={{
                        mt: 2,
                        alignItems: 'center',
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
