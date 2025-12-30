import { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Logout,
  Dashboard as DashboardIcon,
  Business,
  People,
  History,
  Menu,
  Settings,
} from '@mui/icons-material';
import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface DashboardLayoutProps {
  children: ReactNode;
}

const drawerWidth = 240;

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'admin' || user?.role === 'ORG_ADMIN';

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon sx={{ color: '#ffffff' }} />,
      path: '/dashboard',
    },
    {
      text: 'Activity Logs',
      icon: <History sx={{ color: '#ffffff' }} />,
      path: '/activity-logs',
    },
    ...(isAdmin
      ? [
          {
            text: 'Organization Config',
            icon: <Settings sx={{ color: '#ffffff' }} />,
            path: '/admin/config/general',
          },
        ]
      : []),
    ...(isSuperAdmin
      ? [
          {
            text: 'Organizations',
            icon: <Business sx={{ color: '#ffffff' }} />,
            path: '/admin/organizations',
          },
          {
            text: 'Users',
            icon: <People sx={{ color: '#ffffff' }} />,
            path: '/admin/users',
          },
        ]
      : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          backgroundColor: '#0d0421',
          minHeight: { xs: 56, sm: 64 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.25rem' },
          }}
        >
          Jewellery ERP
        </Typography>
      </Toolbar>
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: active ? '#5e3b63' : 'transparent',
                    color: '#ffffff',
                    '&:hover': {
                      backgroundColor: active ? '#5e3b63' : 'rgba(94, 59, 99, 0.3)',
                    },
                    py: { xs: 1.25, sm: 1.5 },
                    px: { xs: 2, sm: 3 },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: { xs: 36, sm: 40 } }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: { xs: '0.875rem', sm: '0.95rem' },
                      fontWeight: active ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#5e3b63',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <Menu />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Jewellery ERP
          </Typography>
          <Button
            startIcon={<Logout sx={{ color: '#ffffff', fontSize: { xs: 18, sm: 24 } }} />}
            onClick={handleLogoutClick}
            sx={{
              color: '#ffffff',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Logout
            </Box>
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#0d0421',
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#0d0421',
              borderRight: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: { xs: '90%', sm: 400 },
          },
        }}
      >
        <DialogTitle
          id="logout-dialog-title"
          sx={{
            color: '#0d0421',
            fontWeight: 600,
            fontSize: '1.25rem',
            pb: 1,
          }}
        >
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="logout-dialog-description"
            sx={{
              color: '#000000',
              fontSize: '1rem',
            }}
          >
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{
              borderColor: '#5e3b63',
              color: '#5e3b63',
              textTransform: 'none',
              px: 3,
              fontWeight: 600,
              '&:hover': {
                borderColor: '#5e3b63',
                backgroundColor: 'rgba(94, 59, 99, 0.08)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#5e3b63',
              color: '#ffffff',
              textTransform: 'none',
              px: 3,
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#4a2d4f',
              },
            }}
            autoFocus
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

