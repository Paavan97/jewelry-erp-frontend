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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Edit } from '@mui/icons-material';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import type { Organization } from '../../api/admin';
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

const updateOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  industry: z.string().min(1, 'Industry is required'),
});

type CreateOrgFormData = z.infer<typeof createOrgSchema>;
type UpdateOrgFormData = z.infer<typeof updateOrgSchema>;

export function Organizations() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: createErrors },
    reset: resetCreate,
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

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: editErrors },
    reset: resetEdit,
  } = useForm<UpdateOrgFormData>({
    resolver: zodResolver(updateOrgSchema),
  });

  const { data: organizations, isLoading, error: orgsError } = useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: adminApi.getAllOrganizations,
    enabled: !!user && user.role === 'SUPER_ADMIN',
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createOrganization,
    onSuccess: () => {
      setSuccessMessage('Organization created successfully!');
      setOpenCreateDialog(false);
      resetCreate();
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrgFormData }) =>
      adminApi.updateOrganization(id, data),
    onSuccess: () => {
      setSuccessMessage('Organization updated successfully!');
      setOpenEditDialog(false);
      setEditingOrg(null);
      resetEdit();
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.toggleOrganizationStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
    },
  });

  const onSubmitCreate = (data: CreateOrgFormData) => {
    createMutation.mutate(data);
  };

  const onSubmitEdit = (data: UpdateOrgFormData) => {
    if (editingOrg) {
      updateMutation.mutate({ id: editingOrg.id, data });
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    resetEdit({
      name: org.name,
      industry: org.industry,
    });
    setOpenEditDialog(true);
  };

  const handleToggleStatus = (org: Organization) => {
    toggleStatusMutation.mutate({
      id: org.id,
      isActive: !org.isActive,
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
            Organizations
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
              '& .MuiAlert-message': {
                fontSize: { xs: '0.875rem', sm: '0.95rem' },
              },
            }}
          >
            {successMessage}
          </Alert>
        )}

        {orgsError && (
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
            {orgsError instanceof Error 
              ? orgsError.message 
              : 'Failed to load organizations. Please try again.'}
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
              <Table sx={{ minWidth: 500 }}>
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
                        display: { xs: 'none', sm: 'table-cell' },
                      }}
                    >
                      Industry
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
                  {organizations && organizations.length > 0 ? (
                    organizations.map((org) => (
                      <TableRow key={org.id} hover>
                        <TableCell
                          sx={{
                            color: '#000000',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
                          {org.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: '#000000',
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            display: { xs: 'none', sm: 'table-cell' },
                          }}
                        >
                          {org.industry}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          }}
                        >
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
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <IconButton
                              onClick={() => handleEdit(org)}
                              sx={{
                                color: '#5e3b63',
                                '&:hover': {
                                  backgroundColor: 'rgba(94, 59, 99, 0.1)',
                                },
                              }}
                            >
                              <Edit />
                            </IconButton>
                            <Switch
                              checked={org.isActive}
                              onChange={() => handleToggleStatus(org)}
                              disabled={toggleStatusMutation.isPending}
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
            Create Organization
          </DialogTitle>
          <form onSubmit={handleSubmitCreate(onSubmitCreate)}>
            <DialogContent>
              <TextField
                {...registerCreate('name')}
                label="Organization Name"
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
                {...registerCreate('industry')}
                label="Industry"
                fullWidth
                defaultValue="jewelry"
                error={!!createErrors.industry}
                helperText={createErrors.industry?.message}
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
                {...registerCreate('businessType')}
                label="Business Type"
                select
                fullWidth
                SelectProps={{
                  native: true,
                }}
                error={!!createErrors.businessType}
                helperText={createErrors.businessType?.message}
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
                {...registerCreate('adminName')}
                label="Admin Name"
                fullWidth
                error={!!createErrors.adminName}
                helperText={createErrors.adminName?.message}
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
                {...registerCreate('adminEmail')}
                label="Admin Email"
                type="email"
                fullWidth
                error={!!createErrors.adminEmail}
                helperText={createErrors.adminEmail?.message}
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
                {...registerCreate('adminPassword')}
                label="Admin Password"
                type="password"
                fullWidth
                error={!!createErrors.adminPassword}
                helperText={createErrors.adminPassword?.message}
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

        {/* Edit Organization Dialog */}
        <Dialog
          open={openEditDialog}
          onClose={() => {
            setOpenEditDialog(false);
            setEditingOrg(null);
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
            Edit Organization
          </DialogTitle>
          <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
            <DialogContent>
              <TextField
                {...registerEdit('name')}
                label="Organization Name"
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
                {...registerEdit('industry')}
                label="Industry"
                fullWidth
                error={!!editErrors.industry}
                helperText={editErrors.industry?.message}
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
                  setOpenEditDialog(false);
                  setEditingOrg(null);
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
      </Box>
    </DashboardLayout>
  );
}
