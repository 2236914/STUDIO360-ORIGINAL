'use client';

import { useSearchParams } from 'next/navigation';

import { JwtResetPasswordView } from 'src/sections/auth/jwt/jwt-reset-password-view';

// ----------------------------------------------------------------------

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  return <JwtResetPasswordView token={token} />;
}
