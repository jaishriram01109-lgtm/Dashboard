'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/lv/context';

export default function RootPage() {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (state.isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [state.isAuthenticated, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0A0A0A' }}>
      <div style={{ fontFamily: 'Cinzel, serif', color: '#C9A84C', fontSize: 24, letterSpacing: '0.15em' }}>LUSSOVOGUE</div>
    </div>
  );
}
