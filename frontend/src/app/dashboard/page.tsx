'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { type User } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  return (
    <div className="flex">
      <Sidebar user={user} />
      
      <div className="flex-1" style={{ marginLeft: '240px', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <header className="header">
          <div className="px-6 py-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Dashboard
            </h2>
          </div>
        </header>

        <div className="px-6 py-6">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="card">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Всего сделок</p>
              <p className="text-2xl font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>0</p>
            </div>
            <div className="card">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Клиентов</p>
              <p className="text-2xl font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>0</p>
            </div>
            <div className="card">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Задач</p>
              <p className="text-2xl font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>0</p>
            </div>
            <div className="card">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Выручка</p>
              <p className="text-2xl font-semibold mt-1" style={{ color: 'var(--accent)' }}>0 ₽</p>
            </div>
          </div>
          
          <div className="card">
            <p style={{ color: 'var(--text-secondary)' }}>Дашборд в разработке...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
