'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
          {/* Быстрые действия */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Link href="/kanban" className="card" style={{ textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Воронка продаж</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Kanban доска со сделками</p>
            </Link>

            <Link href="/clients" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Клиенты</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>База клиентов и лидов</p>
            </Link>

            <Link href="/deals" className="card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💰</div>
              <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Сделки</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Список всех сделок</p>
            </Link>
          </div>

          {/* Приветствие */}
          <div className="card" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #0B5ED7 100%)', color: 'white', border: 'none', padding: '32px' }}>
            <h1 className="text-2xl font-semibold mb-2">Добро пожаловать, {user?.full_name}!</h1>
            <p style={{ opacity: 0.9 }}>Используйте меню слева для навигации или выберите раздел выше</p>
          </div>

          {/* Возможности */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="card">
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>✅ Готово</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>✓ Воронка продаж с Kanban</li>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>✓ Управление клиентами</li>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>✓ Создание и редактирование сделок</li>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>✓ Drag & Drop между стадиями</li>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>✓ Поиск и фильтрация</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>🚀 В разработке</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>• Аналитика и отчёты</li>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>• Управление задачами</li>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>• История активностей</li>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>• Email уведомления</li>
                <li className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>• Telegram интеграция</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
