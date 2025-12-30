import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useMediaQuery,
  useTheme,
  Paper,
} from '@mui/material';
import { Menu } from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/Layout/DashboardLayout';

const drawerWidth = 240;

const menuItems = [
  { label: 'General', path: '/admin/config/general' },
  { label: 'Tax', path: '/admin/config/tax' },
  { label: 'Invoice', path: '/admin/config/invoice' },
  { label: 'Numbering', path: '/admin/config/numbering' },
  { label: 'Finance', path: '/admin/config/finance' },
  { label: 'Features', path: '/admin/config/features' },
];

export function ConfigLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(location.pathname);

  // Update selected path when route changes
  useEffect(() => {
    setSelectedPath(location.pathname);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setSelectedPath(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleSelectChange = (event: any) => {
    const path = event.target.value;
    handleNavigation(path);
  };

  const isActive = (path: string) => location.pathname === path;

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
          Configuration
        </Typography>
      </Toolbar>
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  backgroundColor: active ? '#5e3b63' : 'transparent',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: active ? '#5e3b63' : 'rgba(255, 255, 255, 0.1)',
                  },
                  py: { xs: 1.25, sm: 1.5 },
                  px: { xs: 2, sm: 3 },
                }}
              >
                <ListItemText
                  primary={item.label}
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
  );

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh' }}>
        {/* Mobile AppBar with Dropdown */}
        <AppBar
          position="fixed"
          sx={{
            display: { xs: 'block', md: 'none' },
            backgroundColor: '#0d0421',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <Menu sx={{ color: '#ffffff' }} />
            </IconButton>
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Configuration
            </Typography>
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ffffff',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#ffffff',
                },
                '& .MuiSvgIcon-root': {
                  color: '#ffffff',
                },
              }}
            >
              <Select
                value={selectedPath}
                onChange={handleSelectChange}
                sx={{
                  color: '#ffffff',
                  '& .MuiSelect-select': {
                    color: '#ffffff',
                  },
                }}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    value={item.path}
                    sx={{
                      color: '#000000',
                    }}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Toolbar>
        </AppBar>

        {/* Desktop Drawer */}
        <Box
          component="nav"
          sx={{
            width: { md: drawerWidth },
            flexShrink: { md: 0 },
          }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
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

        {/* Main Content Area */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            backgroundColor: '#ffffff',
            minHeight: '100vh',
          }}
        >
          {/* Spacer for mobile AppBar */}
          <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
          
          {/* White Background Container */}
          <Paper
            elevation={0}
            sx={{
              m: { xs: 2, sm: 3 },
              p: { xs: 2, sm: 3 },
              backgroundColor: '#ffffff',
              minHeight: 'calc(100vh - 120px)',
            }}
          >
            <Outlet />
          </Paper>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
