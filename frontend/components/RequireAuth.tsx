'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from './api';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const t = getToken();
    if (!t) router.push('/login');
  }, [router]);
  return <>{children}</>;
}
