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
  TextField,
  Button,
  Grid,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TablePagination,
  useTheme,
  useMediaQuery,
  Alert,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  FilterList,
  DateRange,
  Clear,
} from '@mui/icons-material';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchActivityLogs, type ActivityLogFilters, type ActivityLog } from '../api/activityLogs';

const MODULES = ['auth', 'user', 'organization'];
const ACTIONS = [
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'CREATE',
  'UPDATE',
  'DELETE',
  'ACTIVATE',
  'DEACTIVATE',
  'PASSWORD_RESET',
];

export function ActivityLogs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [filters, setFilters] = useState<ActivityLogFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<ActivityLogFilters>({});
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Fetch logs on mount and when filters change
  // Empty filters object means fetch all logs (no filters applied)
  const { data, isLoading, error } = useQuery({
    queryKey: ['activityLogs', appliedFilters],
    queryFn: () => {
      // Only pass filters if there are any applied
      const filtersToSend = Object.keys(appliedFilters).length > 0 ? appliedFilters : {};
      return fetchActivityLogs(filtersToSend);
    },
  });

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(0);
  };

  const handleResetFilters = () => {
    const emptyFilters: ActivityLogFilters = {};
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPage(0);
  };

  const handleChangeFilter = (key: keyof ActivityLogFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleRowClick = (logId: string) => {
    setExpandedRow(expandedRow === logId ? null : logId);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const logs = data?.data || [];
  const paginatedLogs = logs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1, sm: 2 }, width: '100%' }}>
        {/* Page Title */}
        <Typography
          variant="h4"
          sx={{
            color: '#000000',
            fontWeight: 600,
            mb: 2,
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
          }}
        >
          Activity Logs
        </Typography>

        {/* Filters Section */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2,
            backgroundColor: '#ffffff',
            border: '1px solid rgba(94, 59, 99, 0.2)',
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <FilterList sx={{ color: '#5e3b63', mr: 1, fontSize: 22 }} />
            <Typography
              variant="h6"
              sx={{
                color: '#0d0421',
                fontWeight: 600,
                fontSize: '1.1rem',
              }}
            >
              Filter Activity Logs
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Row 1: Search Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                value={filters.search || ''}
                onChange={(e) => handleChangeFilter('search', e.target.value)}
                placeholder="Search by user name or description..."
                label="Search"
                variant="outlined"
                InputProps={{
                  startAdornment: <Search sx={{ color: '#5e3b63', mr: 0.5, fontSize: 20 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(94, 59, 99, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#5e3b63',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#5e3b63',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#5e3b63',
                  },
                }}
              />
            </Grid>

            {/* Row 2: Other Filters */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                size="small"
                label="Module"
                fullWidth
                value={filters.module || ''}
                onChange={(e) => handleChangeFilter('module', e.target.value)}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value: any) => {
                    if (!value) return 'All Modules';
                    return value.charAt(0).toUpperCase() + value.slice(1);
                  },
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(94, 59, 99, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#5e3b63',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#5e3b63',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#5e3b63',
                  },
                  '& .MuiSelect-icon': {
                    color: '#5e3b63',
                  },
                }}
              >
                <MenuItem value="">All Modules</MenuItem>
                {MODULES.map((module) => (
                  <MenuItem key={module} value={module}>
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                size="small"
                label="Action"
                fullWidth
                value={filters.action || ''}
                onChange={(e) => handleChangeFilter('action', e.target.value)}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value: any) => {
                    if (!value) return 'All Actions';
                    return value.replace(/_/g, ' ');
                  },
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 300,
                      },
                    },
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(94, 59, 99, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#5e3b63',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#5e3b63',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#5e3b63',
                  },
                  '& .MuiSelect-icon': {
                    color: '#5e3b63',
                  },
                }}
              >
                <MenuItem value="">All Actions</MenuItem>
                {ACTIONS.map((action) => (
                  <MenuItem key={action} value={action}>
                    {action.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                size="small"
                label="From Date"
                fullWidth
                value={filters.startDate || ''}
                onChange={(e) => handleChangeFilter('startDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(94, 59, 99, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#5e3b63',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#5e3b63',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#5e3b63',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                type="date"
                size="small"
                label="To Date"
                fullWidth
                value={filters.endDate || ''}
                onChange={(e) => handleChangeFilter('endDate', e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(94, 59, 99, 0.5)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#5e3b63',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#5e3b63',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#000000',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#5e3b63',
                  },
                }}
              />
            </Grid>

            {/* Row 2: Action Buttons */}
            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1.5,
                  mt: 0.5,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Clear sx={{ fontSize: 18 }} />}
                  onClick={handleResetFilters}
                  sx={{
                    borderColor: '#5e3b63',
                    color: '#5e3b63',
                    px: 2.5,
                    py: 0.75,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    '&:hover': {
                      borderColor: '#5e3b63',
                      backgroundColor: 'rgba(94, 59, 99, 0.08)',
                    },
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<FilterList sx={{ fontSize: 18 }} />}
                  onClick={handleApplyFilters}
                  sx={{
                    backgroundColor: '#5e3b63',
                    color: '#ffffff',
                    px: 2.5,
                    py: 0.75,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    boxShadow: '0px 2px 4px rgba(94, 59, 99, 0.3)',
                    '&:hover': {
                      backgroundColor: '#4a2d4f',
                      boxShadow: '0px 3px 6px rgba(94, 59, 99, 0.4)',
                    },
                  }}
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Table Section */}
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
          ) : error ? (
            <Box sx={{ p: 4 }}>
              <Alert 
                severity="error"
                sx={{
                  '& .MuiAlert-message': {
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  },
                }}
              >
                {error instanceof Error 
                  ? error.message 
                  : 'Error loading activity logs. Please try again.'}
              </Alert>
            </Box>
          ) : logs.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#000000' }}>No activity logs found.</Typography>
            </Box>
          ) : (
            <>
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
                    <TableRow sx={{ backgroundColor: '#0d0421' }}>
                      <TableCell
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Date & Time
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        User
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
                        Role
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Module
                      </TableCell>
                      <TableCell
                        sx={{
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Action
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
                        Description
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLogs.map((log: ActivityLog) => (
                      <>
                        <TableRow
                          key={log.id}
                          hover
                          onClick={() => handleRowClick(log.id)}
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              backgroundColor: 'rgba(94, 59, 99, 0.05)',
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              color: '#000000',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: '#000000',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {log.userName}
                          </TableCell>
                          <TableCell
                            sx={{
                              display: { xs: 'none', md: 'table-cell' },
                            }}
                          >
                            <Chip
                              label={log.userRole}
                              size="small"
                              sx={{
                                backgroundColor: '#5e3b63',
                                color: '#ffffff',
                                fontWeight: 500,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              color: '#000000',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {log.module}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: '#000000',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            }}
                          >
                            {log.action.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell
                            sx={{
                              color: '#000000',
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                              display: { xs: 'none', lg: 'table-cell' },
                            }}
                          >
                            {log.description || '-'}
                          </TableCell>
                        </TableRow>
                        {expandedRow === log.id && (
                          <TableRow>
                            <TableCell
                              colSpan={isMobile ? 4 : isTablet ? 5 : 6}
                              sx={{ py: 0, border: 'none' }}
                            >
                              <Accordion
                                expanded={expandedRow === log.id}
                                sx={{
                                  boxShadow: 'none',
                                  '&:before': {
                                    display: 'none',
                                  },
                                }}
                              >
                                <AccordionSummary
                                  expandIcon={<ExpandMore sx={{ color: '#5e3b63' }} />}
                                  sx={{
                                    minHeight: 0,
                                    '& .MuiAccordionSummary-content': {
                                      margin: '8px 0',
                                    },
                                  }}
                                >
                                  <Typography sx={{ color: '#000000', fontWeight: 600 }}>
                                    Metadata & Details
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Box sx={{ p: 2, backgroundColor: '#ffffff' }}>
                                    <Grid container spacing={2}>
                                      {log.entityType && (
                                        <Grid item xs={12} sm={6}>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: '#000000', fontWeight: 600, mb: 0.5 }}
                                          >
                                            Entity Type:
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: '#000000' }}>
                                            {log.entityType}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {log.entityId && (
                                        <Grid item xs={12} sm={6}>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: '#000000', fontWeight: 600, mb: 0.5 }}
                                          >
                                            Entity ID:
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: '#000000' }}>
                                            {log.entityId}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {log.ipAddress && (
                                        <Grid item xs={12} sm={6}>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: '#000000', fontWeight: 600, mb: 0.5 }}
                                          >
                                            IP Address:
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: '#000000' }}>
                                            {log.ipAddress}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {log.userAgent && (
                                        <Grid item xs={12} sm={6}>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: '#000000', fontWeight: 600, mb: 0.5 }}
                                          >
                                            User Agent:
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: '#000000' }}>
                                            {log.userAgent}
                                          </Typography>
                                        </Grid>
                                      )}
                                      {log.metadata && (
                                        <Grid item xs={12}>
                                          <Typography
                                            variant="body2"
                                            sx={{ color: '#000000', fontWeight: 600, mb: 0.5 }}
                                          >
                                            Metadata:
                                          </Typography>
                                          <Paper
                                            sx={{
                                              p: 2,
                                              backgroundColor: '#ffffff',
                                              border: '1px solid #5e3b63',
                                              maxHeight: 300,
                                              overflow: 'auto',
                                            }}
                                          >
                                            <pre
                                              style={{
                                                margin: 0,
                                                color: '#000000',
                                                fontSize: '0.875rem',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                              }}
                                            >
                                              {JSON.stringify(log.metadata, null, 2)}
                                            </pre>
                                          </Paper>
                                        </Grid>
                                      )}
                                    </Grid>
                                  </Box>
                                </AccordionDetails>
                              </Accordion>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={logs.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={isMobile ? [10, 25] : [10, 25, 50, 100]}
                labelRowsPerPage={isMobile ? 'Rows:' : 'Rows per page:'}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    color: '#000000',
                    px: { xs: 1, sm: 2 },
                    justifyContent: 'flex-end',
                  },
                  '& .MuiTablePagination-spacer': {
                    display: 'none',
                  },
                  '& .MuiTablePagination-selectLabel': {
                    color: '#000000',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    margin: 0,
                  },
                  '& .MuiTablePagination-displayedRows': {
                    color: '#000000',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    margin: 0,
                    marginLeft: 2,
                  },
                  '& .MuiTablePagination-select': {
                    color: '#000000',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  },
                  '& .MuiTablePagination-actions': {
                    marginLeft: 2,
                  },
                  '& .MuiIconButton-root': {
                    color: '#5e3b63',
                    padding: { xs: 0.5, sm: 1 },
                    '&:hover': {
                      backgroundColor: 'rgba(94, 59, 99, 0.1)',
                    },
                    '&.Mui-disabled': {
                      color: '#000000',
                      opacity: 0.3,
                    },
                  },
                }}
              />
            </>
          )}
        </Paper>
      </Box>
    </DashboardLayout>
  );
}

