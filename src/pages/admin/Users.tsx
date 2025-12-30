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
  IconButton,
  Switch,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Edit, LockReset } from '@mui/icons-material';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import type { User, Organization } from '../../api/admin';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'STAFF']),
  orgId: z.string().min(1, 'Organization is required'),
});

const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'STAFF']),
  orgId: z.string().optional(),
}).refine((data) => {
  // SUPER_ADMIN can have null orgId, others must have orgId
  if (data.role === 'SUPER_ADMIN') {
    return true;
  }
  return !!data.orgId && data.orgId.length > 0;
}, {
  message: 'Organization is required',
  path: ['orgId'],
});

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function Users() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
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

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
    control: controlEdit,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'STAFF',
      orgId: undefined,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { data: users, isLoading, error: usersError } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
    enabled: !!currentUser && currentUser.role === 'SUPER_ADMIN' && !authLoading,
    retry: false,
  });

  const { data: organizations, error: orgsError } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: adminApi.getAllOrganizations,
    enabled: !!currentUser && currentUser.role === 'SUPER_ADMIN' && !authLoading,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: () => {
      setSuccessMessage('User created successfully!');
      setOpenCreateDialog(false);
      resetCreate();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to create user');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserFormData }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      setSuccessMessage('User updated successfully!');
      setOpenEditDialog(false);
      setEditingUser(null);
      resetEdit();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update user');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminApi.resetUserPassword(id, password),
    onSuccess: () => {
      setSuccessMessage('Password reset successfully!');
      setOpenPasswordDialog(false);
      setResettingUser(null);
      resetPassword();
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to reset password');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.toggleUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to toggle user status');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const onSubmitCreate = (data: CreateUserFormData) => {
    createMutation.mutate(data);
  };

  const onSubmitEdit = (data: UpdateUserFormData) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    }
  };

  const onSubmitPassword = (data: ResetPasswordFormData) => {
    if (resettingUser) {
      resetPasswordMutation.mutate({ id: resettingUser.id, password: data.password });
    }
  };

  const handleEdit = (user: User) => {
    // ORG_ADMIN cannot edit SUPER_ADMIN
    if (currentUser?.role === 'ORG_ADMIN' && user.role === 'SUPER_ADMIN') {
      setErrorMessage('ORG_ADMIN cannot modify SUPER_ADMIN users');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    setEditingUser(user);
    // Reset form with user data - handle null orgId for SUPER_ADMIN
    const formData: UpdateUserFormData = {
      name: user.name,
      email: user.email,
      role: user.role as 'SUPER_ADMIN' | 'ORG_ADMIN' | 'STAFF',
      orgId: user.orgId || undefined,
    };
    resetEdit(formData);
    setOpenEditDialog(true);
  };

  const handleResetPassword = (user: User) => {
    setResettingUser(user);
    resetPassword();
    setOpenPasswordDialog(true);
  };

  const handleToggleStatus = (user: User) => {
    // Cannot deactivate SUPER_ADMIN
    if (user.isActive && user.role === 'SUPER_ADMIN') {
      setErrorMessage('Cannot deactivate SUPER_ADMIN');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    // ORG_ADMIN cannot modify SUPER_ADMIN
    if (currentUser?.role === 'ORG_ADMIN' && user.role === 'SUPER_ADMIN') {
      setErrorMessage('ORG_ADMIN cannot modify SUPER_ADMIN users');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    toggleStatusMutation.mutate({
      id: user.id,
      isActive: !(user.isActive ?? true),
    });
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

  const canEditUser = (user: User) => {
    if (currentUser?.role === 'ORG_ADMIN' && user.role === 'SUPER_ADMIN') {
      return false;
    }
    return true;
  };

  const canToggleUser = (user: User) => {
    if (user.role === 'SUPER_ADMIN') {
      return false; // Cannot deactivate SUPER_ADMIN
    }
    if (currentUser?.role === 'ORG_ADMIN' && user.role === 'SUPER_ADMIN') {
      return false;
    }
    return true;
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
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2, md: 0 }, width: '100%' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: { xs: 2, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: '#000000',
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
            }}
          >
            Users
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenCreateDialog(true)}
            fullWidth={isMobile}
            sx={{
              backgroundColor: '#5e3b63',
              color: '#ffffff',
              fontSize: { xs: '0.875rem', sm: '1rem' },
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

        {errorMessage && (
          <Alert
            severity="error"
            onClose={() => setErrorMessage(null)}
            sx={{
              mb: 3,
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid #5e3b63',
              '& .MuiAlert-message': {
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
              },
            }}
          >
            {errorMessage}
          </Alert>
        )}

        {(usersError || orgsError) && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: '#ffffff',
              color: '#000000',
              border: '1px solid #5e3b63',
              '& .MuiAlert-message': {
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
              },
            }}
          >
            {usersError instanceof Error 
              ? usersError.message 
              : orgsError instanceof Error
              ? orgsError.message
              : 'Failed to load data. Please try again.'}
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
            <TableContainer
              sx={{
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#5e3b63',
                  borderRadius: 4,
                },
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#5e3b63' }}>
                    <TableCell
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        display: { xs: 'none', md: 'table-cell' },
                      }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Role
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        display: { xs: 'none', lg: 'table-cell' },
                      }}
                    >
                      Organization
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell
                          sx={{
                            color: '#000000',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          {user.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#000000',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: { xs: 'none', md: 'table-cell' },
                          }}
                        >
                          {user.email}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
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
                        <TableCell
                          sx={{
                            color: '#000000',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: { xs: 'none', lg: 'table-cell' },
                          }}
                        >
                          {user.organization?.name || 'N/A'}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          <Chip
                            label={(user.isActive ?? true) ? 'Active' : 'Inactive'}
                            sx={{
                              backgroundColor: (user.isActive ?? true) ? '#5e3b63' : '#ffffff',
                              color: (user.isActive ?? true) ? '#ffffff' : '#000000',
                              border: (user.isActive ?? true) ? 'none' : '1px solid #5e3b63',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <IconButton
                              onClick={() => handleEdit(user)}
                              disabled={!canEditUser(user)}
                              sx={{
                                color: canEditUser(user) ? '#5e3b63' : '#cccccc',
                                '&:hover': {
                                  backgroundColor: 'rgba(94, 59, 99, 0.1)',
                                },
                                '&:disabled': {
                                  color: '#cccccc',
                                },
                              }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              onClick={() => handleResetPassword(user)}
                              sx={{
                                color: '#5e3b63',
                                '&:hover': {
                                  backgroundColor: 'rgba(94, 59, 99, 0.1)',
                                },
                              }}
                            >
                              <LockReset />
                            </IconButton>
                            <Switch
                              checked={user.isActive ?? true}
                              onChange={() => handleToggleStatus(user)}
                              disabled={!canToggleUser(user) || toggleStatusMutation.isPending}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: '#5e3b63',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: '#5e3b63',
                                },
                                '& .MuiSwitch-switchBase': {
                                  color: '#000000',
                                },
                                '& .MuiSwitch-track': {
                                  backgroundColor: '#000000',
                                },
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ color: '#000000', py: 4 }}>
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
          open={openCreateDialog}
          onClose={() => {
            setOpenCreateDialog(false);
            resetCreate();
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
          <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
            <DialogContent>
              <TextField
                {...registerCreate('name')}
                label="Name"
                fullWidth
                error={!!createErrors.name}
                helperText={createErrors.name?.message}
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
                {...registerCreate('email')}
                label="Email"
                type="email"
                fullWidth
                error={!!createErrors.email}
                helperText={createErrors.email?.message}
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
                {...registerCreate('password')}
                label="Password"
                type="password"
                fullWidth
                error={!!createErrors.password}
                helperText={createErrors.password?.message}
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
                {...registerCreate('role')}
                label="Role"
                select
                fullWidth
                error={!!createErrors.role}
                helperText={createErrors.role?.message}
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
                <MenuItem value="STAFF">Staff</MenuItem>
                <MenuItem value="ORG_ADMIN">Organization Admin</MenuItem>
                <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
              </TextField>
              <TextField
                {...registerCreate('orgId')}
                label="Organization"
                select
                fullWidth
                error={!!createErrors.orgId}
                helperText={createErrors.orgId?.message}
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
                <MenuItem value="">Select Organization</MenuItem>
                {organizations?.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </TextField>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => {
                  setOpenCreateDialog(false);
                  resetCreate();
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

        {/* Edit User Dialog */}
        <Dialog
          key={editingUser?.id || 'edit-dialog'}
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setEditingUser(null);
            resetEdit();
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
            Edit User
          </DialogTitle>
          <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
            <DialogContent>
              <TextField
                {...registerEdit('name')}
                label="Name"
                fullWidth
                error={!!editErrors.name}
                helperText={editErrors.name?.message}
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
                {...registerEdit('email')}
                label="Email"
                type="email"
                fullWidth
                error={!!editErrors.email}
                helperText={editErrors.email?.message}
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
              <Controller
                name="role"
                control={controlEdit}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Role"
                    select
                    fullWidth
                    error={!!editErrors.role}
                    helperText={editErrors.role?.message}
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
                    <MenuItem value="STAFF">Staff</MenuItem>
                    <MenuItem value="ORG_ADMIN">Organization Admin</MenuItem>
                    <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="orgId"
                control={controlEdit}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Organization"
                    select
                    fullWidth
                    error={!!editErrors.orgId}
                    helperText={editErrors.orgId?.message}
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
                    <MenuItem value="">Select Organization</MenuItem>
                    {organizations?.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => {
                  setOpenEditDialog(false);
                  setEditingUser(null);
                  resetEdit();
                }}
                sx={{ color: '#000000' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updateMutation.isPending}
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
                {updateMutation.isPending ? (
                  <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                ) : (
                  'Save'
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog
          open={openPasswordDialog}
          onClose={() => {
            setOpenPasswordDialog(false);
            setResettingUser(null);
            resetPassword();
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
            Reset Password
            {resettingUser && (
              <Typography variant="body2" sx={{ color: '#000000', mt: 1, fontWeight: 400 }}>
                {resettingUser.name} ({resettingUser.email})
              </Typography>
            )}
          </DialogTitle>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
            <DialogContent>
              <TextField
                {...registerPassword('password')}
                label="New Password"
                type="password"
                fullWidth
                error={!!passwordErrors.password}
                helperText={passwordErrors.password?.message}
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
                {...registerPassword('confirmPassword')}
                label="Confirm Password"
                type="password"
                fullWidth
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword?.message}
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
                  setOpenPasswordDialog(false);
                  setResettingUser(null);
                  resetPassword();
                }}
                sx={{ color: '#000000' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={resetPasswordMutation.isPending}
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
                {resetPasswordMutation.isPending ? (
                  <CircularProgress size={20} sx={{ color: '#ffffff' }} />
                ) : (
                  'Reset Password'
                )}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
