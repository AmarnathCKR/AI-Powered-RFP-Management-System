import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'RFPs', path: '/rfps', icon: <DescriptionIcon sx={{ mr: 0.5 }} /> },
    { label: 'Create RFP', path: '/rfps/new', icon: <AddIcon sx={{ mr: 0.5 }} /> },
    { label: 'Vendors', path: '/vendors', icon: <BusinessIcon sx={{ mr: 0.5 }} /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <AutoAwesomeIcon sx={{ mr: 1.5, color: 'primary.contrastText' }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700,
              letterSpacing: '-0.5px',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/rfps')}
          >
            AI RFP Manager
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  backgroundColor: location.pathname === item.path 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                }}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1, 
          py: 4,
        }}
      >
        {children}
      </Container>
      <Box 
        component="footer" 
        sx={{ 
          py: 2, 
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          AI RFP Manager © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
