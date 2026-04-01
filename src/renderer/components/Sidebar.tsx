import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import { History, Info } from '@mui/icons-material';
import { Link, useLocation } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/" selected={location.pathname === '/'}>
              <ListItemIcon>
                <History />
              </ListItemIcon>
              <ListItemText primary={t('nav.history')} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/about" selected={location.pathname === '/about'}>
              <ListItemIcon>
                <Info />
              </ListItemIcon>
              <ListItemText primary={t('nav.about')} />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
