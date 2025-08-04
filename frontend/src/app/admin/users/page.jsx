'use client';

import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

export default function AdminUsersPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h4" sx={{ mb: 2 }}>
          User Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This is the admin IT user management page. Only admin IT users can access this.
        </Typography>
      </CardContent>
    </Card>
  );
} 