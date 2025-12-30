import { AppBar, Box, Toolbar, Typography, Button, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Logout, Dashboard as DashboardIcon, Business, People } from '@mui/icons-material';
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

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon sx={{ color: '#ffffff' }} />,
      path: '/dashboard',
    },
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: '#5e3b63',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            Jewellery ERP
          </Typography>
          <Button
            startIcon={<Logout sx={{ color: '#ffffff' }} />}
            onClick={logout}
            sx={{
              color: '#ffffff',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#0d0421',
            borderRight: 'none',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', mt: 2 }}>
          <List>
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      backgroundColor: active ? '#5e3b63' : 'transparent',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: active ? '#5e3b63' : 'rgba(94, 59, 99, 0.3)',
                      },
                      py: 1.5,
                      px: 3,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.95rem',
                        fontWeight: active ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#ffffff',
          minHeight: '100vh',
          width: `calc(100% - ${drawerWidth}px)`,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

