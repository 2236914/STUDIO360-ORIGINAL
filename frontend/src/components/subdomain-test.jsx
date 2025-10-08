'use client';

import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { 
  getCurrentSubdomain, 
  getCurrentStoreId, 
  isStoreSubdomain,
  isDashboardSubdomain,
  isAdminSubdomain,
  buildStoreUrl,
  buildDashboardUrl,
  buildAdminUrl
} from 'src/utils/subdomain';

// ----------------------------------------------------------------------

export function SubdomainTest() {
  const [subdomainInfo, setSubdomainInfo] = useState({
    subdomain: null,
    storeId: null,
    isStore: false,
    isDashboard: false,
    isAdmin: false,
    hostname: '',
  });

  useEffect(() => {
    const updateSubdomainInfo = () => {
      setSubdomainInfo({
        subdomain: getCurrentSubdomain(),
        storeId: getCurrentStoreId(),
        isStore: isStoreSubdomain(),
        isDashboard: isDashboardSubdomain(),
        isAdmin: isAdminSubdomain(),
        hostname: typeof window !== 'undefined' ? window.location.hostname : '',
      });
    };

    updateSubdomainInfo();
    
    // Update on route changes
    const handleRouteChange = () => updateSubdomainInfo();
    window.addEventListener('popstate', handleRouteChange);
    
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const handleNavigateToStore = () => {
    const storeUrl = buildStoreUrl('kitschstudio');
    window.open(storeUrl, '_blank');
  };

  const handleNavigateToDashboard = () => {
    const dashboardUrl = buildDashboardUrl();
    window.open(dashboardUrl, '_blank');
  };

  const handleNavigateToAdmin = () => {
    const adminUrl = buildAdminUrl();
    window.open(adminUrl, '_blank');
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Subdomain Routing Test
          </Typography>
          
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Current Hostname:
              </Typography>
              <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                {subdomainInfo.hostname}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Detected Subdomain:
              </Typography>
              <Chip 
                label={subdomainInfo.subdomain || 'None (Main Domain)'} 
                color={subdomainInfo.subdomain ? 'primary' : 'default'}
                variant="outlined"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Store ID:
              </Typography>
              <Chip 
                label={subdomainInfo.storeId || 'None'} 
                color={subdomainInfo.storeId ? 'success' : 'default'}
                variant="outlined"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Context:
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  label="Store" 
                  color={subdomainInfo.isStore ? 'success' : 'default'}
                  size="small"
                />
                <Chip 
                  label="Dashboard" 
                  color={subdomainInfo.isDashboard ? 'info' : 'default'}
                  size="small"
                />
                <Chip 
                  label="Admin" 
                  color={subdomainInfo.isAdmin ? 'warning' : 'default'}
                  size="small"
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Test Navigation:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleNavigateToStore}
                >
                  Go to Store
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleNavigateToDashboard}
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleNavigateToAdmin}
                >
                  Go to Admin
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Example URLs:
              </Typography>
              <Typography variant="caption" component="div" sx={{ fontFamily: 'monospace', mt: 1 }}>
                • Store: kitschstudio.studio360.com<br />
                • Dashboard: dashboard.studio360.com<br />
                • Admin: admin.studio360.com<br />
                • Main: studio360.com
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
