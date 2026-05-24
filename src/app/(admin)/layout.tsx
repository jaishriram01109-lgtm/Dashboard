'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/lv/context';
import Sidebar from '@/components/lv/Sidebar';
import Header from '@/components/lv/Header';
import SessionTimeout from '@/components/lv/SessionTimeout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.isAuthenticated && state.user === null) {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('lv_session') : null;
      if (!saved) {
        router.replace('/login');
      }
    }
  }, [state.isAuthenticated, state.user, router]);

  if (!state.isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('lv_session')) {
    return null;
  }

  return (
    <div className="lv-layout">
      <Sidebar />
      <div className={`lv-main ${state.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header />
        <div className="lv-content">
          {children}
        </div>
      </div>
      <SessionTimeout />
    </div>
  );
}
