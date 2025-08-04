import { useCallback, useState } from 'react';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { LogoutDialog } from 'src/components/logout-dialog';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, ...other }) {
  const router = useRouter();
  const { logout } = useAuthContext();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleLogoutClick = useCallback(() => {
    onClose?.();
    setLogoutDialogOpen(true);
  }, [onClose]);

  const handleLogoutConfirm = async () => {
    await logout();
  };

  return (
    <>
      <Button 
        fullWidth 
        variant="soft" 
        size="large" 
        color="error" 
        onClick={handleLogoutClick} 
        {...other}
      >
        Logout
      </Button>

      <LogoutDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
