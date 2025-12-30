import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
import { getFeatureConfig, updateFeatureConfig, type FeatureConfig } from '../../api/config';

const featureConfigSchema = z.object({
  sales: z.boolean(),
  purchases: z.boolean(),
  stock: z.boolean(),
  finance: z.boolean(),
  hr: z.boolean(),
  crm: z.boolean(),
  reports: z.boolean(),
});

type FeatureConfigFormData = z.infer<typeof featureConfigSchema>;

const features = [
  { key: 'sales' as const, label: 'Sales' },
  { key: 'purchases' as const, label: 'Purchases' },
  { key: 'stock' as const, label: 'Stock' },
  { key: 'finance' as const, label: 'Finance' },
  { key: 'hr' as const, label: 'HR' },
  { key: 'crm' as const, label: 'CRM' },
  { key: 'reports' as const, label: 'Reports' },
];

export function Features() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const queryClient = useQueryClient();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch feature config
  const { data: config, isLoading, error } = useQuery<FeatureConfig>({
    queryKey: ['config', 'feature'],
    queryFn: getFeatureConfig,
  });

  // Update feature config mutation
  const updateMutation = useMutation({
    mutationFn: updateFeatureConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(['config', 'feature']);
      setSnackbarMessage('Features configuration saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    },
    onError: (error: any) => {
      setSnackbarMessage(error?.response?.data?.error || 'Failed to save features configuration');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<FeatureConfigFormData>({
    resolver: zodResolver(featureConfigSchema),
    defaultValues: {
      sales: false,
      purchases: false,
      stock: false,
      finance: false,
      hr: false,
      crm: false,
      reports: false,
    },
  });

  // Reset form when config data is loaded
  useEffect(() => {
    if (config) {
      reset({
        sales: config.sales ?? false,
        purchases: config.purchases ?? false,
        stock: config.stock ?? false,
        finance: config.finance ?? false,
        hr: config.hr ?? false,
        crm: config.crm ?? false,
        reports: config.reports ?? false,
      });
    }
  }, [config, reset]);

  const onSubmit = (data: FeatureConfigFormData) => {
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
            : 'Failed to load features configuration. Please try again.'}
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
        Features Settings
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
                  Enable/Disable Features
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#666666',
                    mb: 3,
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  }}
                >
                  Toggle features on or off for your organization. Disabled features will be hidden from the navigation menu.
                </Typography>
              </Grid>

              {/* Feature Switches */}
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} key={feature.key}>
                  <Controller
                    name={feature.key}
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
                            {feature.label}
                          </Typography>
                        }
                        sx={{
                          width: '100%',
                          justifyContent: 'space-between',
                          m: 0,
                          px: 2,
                          py: 1.5,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              ))}

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
