import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industry: z.string().default('jewelry'),
  businessType: z.enum(['RETAILER', 'WHOLESALER', 'MANUFACTURER']),
  adminEmail: z.string().email('Invalid email address'),
  adminName: z.string().min(1, 'Admin name is required'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type CreateOrgFormData = z.infer<typeof createOrgSchema>;

export function Organizations() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      name: '',
      industry: 'jewelry',
      businessType: 'RETAILER',
      adminEmail: '',
      adminName: '',
      adminPassword: '',
    },
  });

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: adminApi.getAllOrganizations,
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createOrganization,
    onSuccess: () => {
      setSuccessMessage('Organization created successfully!');
      setOpenDialog(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const onSubmit = (data: CreateOrgFormData) => {
    createMutation.mutate(data);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authLoading) {
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

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#000000',
              fontWeight: 600,
            }}
          >
            Organizations
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{
              backgroundColor: '#5e3b63',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#5e3b63',
                opacity: 0.9,
              },
            }}
          >
            Create Organization
          </Button>
        </Box>

        {successMessage && (
          <Alert
            severity="success"
            onClose={() => setSuccessMessage(null)}
            sx={{
              mb: 3,
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid #5e3b63',
            }}
          >
            {successMessage}
          </Alert>
        )}

        <Paper
          sx={{
            backgroundColor: '#ffffff',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress sx={{ color: '#5e3b63' }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#5e3b63' }}>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Industry</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Created Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organizations && organizations.length > 0 ? (
                    organizations.map((org) => (
                      <TableRow key={org.id} hover>
                        <TableCell sx={{ color: '#000000' }}>{org.name}</TableCell>
                        <TableCell sx={{ color: '#000000' }}>{org.industry}</TableCell>
                        <TableCell>
                          <Chip
                            label={org.isActive ? 'Active' : 'Inactive'}
                            sx={{
                              backgroundColor: org.isActive ? '#5e3b63' : '#ffffff',
                              color: org.isActive ? '#ffffff' : '#000000',
                              border: org.isActive ? 'none' : '1px solid #5e3b63',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#000000' }}>{formatDate(org.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ color: '#000000', py: 4 }}>
                        No organizations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Create Organization Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => {
            setOpenDialog(false);
            reset();
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#ffffff',
            },
          }}
        >
          <DialogTitle sx={{ color: '#000000', fontWeight: 600 }}>
            Create Organization
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <TextField
                {...register('name')}
                label="Organization Name"
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
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
                {...register('industry')}
                label="Industry"
                fullWidth
                defaultValue="jewelry"
                error={!!errors.industry}
                helperText={errors.industry?.message}
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
                {...register('businessType')}
                label="Business Type"
                select
                fullWidth
                SelectProps={{
                  native: true,
                }}
                error={!!errors.businessType}
                helperText={errors.businessType?.message}
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
              >
                <option value="RETAILER">Retailer</option>
                <option value="WHOLESALER">Wholesaler</option>
                <option value="MANUFACTURER">Manufacturer</option>
              </TextField>
              <TextField
                {...register('adminName')}
                label="Admin Name"
                fullWidth
                error={!!errors.adminName}
                helperText={errors.adminName?.message}
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
                {...register('adminEmail')}
                label="Admin Email"
                type="email"
                fullWidth
                error={!!errors.adminEmail}
                helperText={errors.adminEmail?.message}
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
                {...register('adminPassword')}
                label="Admin Password"
                type="password"
                fullWidth
                error={!!errors.adminPassword}
                helperText={errors.adminPassword?.message}
                sx={{
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
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => {
                  setOpenDialog(false);
                  reset();
                }}
                sx={{ color: '#000000' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending}
                sx={{
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
                {createMutation.isPending ? (
                  <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                ) : (
                  'Create'
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
