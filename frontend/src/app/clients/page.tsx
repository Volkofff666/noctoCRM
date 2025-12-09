'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { type User } from '@/lib/api';

export default function ClientsPage() {
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
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Клиенты
            </h2>
            <button className="btn btn-primary">
              + Новый клиент
            </button>
          </div>
        </header>

        <div className="px-6 py-6">
          <div className="card">
            <p style={{ color: 'var(--text-secondary)' }}>Список клиентов в разработке...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
