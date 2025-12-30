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

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'STAFF']),
  orgId: z.string().min(1, 'Organization is required'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export function Users() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'STAFF',
      orgId: '',
    },
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  const { data: organizations } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: adminApi.getAllOrganizations,
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      setSuccessMessage('User created successfully!');
      setOpenDialog(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const onSubmit = (data: CreateUserFormData) => {
    createMutation.mutate(data);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '#5e3b63';
      case 'ORG_ADMIN':
        return '#5e3b63';
      default:
        return '#ffffff';
    }
  };

  const getRoleTextColor = (role: string) => {
    return role === 'STAFF' ? '#000000' : '#ffffff';
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
            Users
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
            Create User
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
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Organization</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell sx={{ color: '#000000' }}>{user.name}</TableCell>
                        <TableCell sx={{ color: '#000000' }}>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            sx={{
                              backgroundColor: getRoleColor(user.role),
                              color: getRoleTextColor(user.role),
                              border: user.role === 'STAFF' ? '1px solid #5e3b63' : 'none',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#000000' }}>
                          {user.organization?.name || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Active"
                            sx={{
                              backgroundColor: '#5e3b63',
                              color: '#ffffff',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: '#000000', py: 4 }}>
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Create User Dialog */}
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
            Create User
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <TextField
                {...register('name')}
                label="Name"
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
                {...register('email')}
                label="Email"
                type="email"
                fullWidth
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
                error={!!errors.password}
                helperText={errors.password?.message}
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
                {...register('role')}
                label="Role"
                select
                fullWidth
                SelectProps={{
                  native: true,
                }}
                error={!!errors.role}
                helperText={errors.role?.message}
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
                <option value="STAFF">Staff</option>
                <option value="ORG_ADMIN">Organization Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </TextField>
              <TextField
                {...register('orgId')}
                label="Organization"
                select
                fullWidth
                SelectProps={{
                  native: true,
                }}
                error={!!errors.orgId}
                helperText={errors.orgId?.message}
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
              >
                <option value="">Select Organization</option>
                {organizations?.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </TextField>
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
