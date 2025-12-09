'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login({ username, password });
      localStorage.setItem('token', response.access_token);
      
      const user = await authApi.getMe();
      localStorage.setItem('user', JSON.stringify(user));
      
      router.push('/kanban');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError('Неверный логин или пароль');
      } else {
        setError('Ошибка подключения к серверу');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--accent)' }}>
            noctoCRM
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Система управления продажами
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Имя пользователя
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="Введите логин"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1.5 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="Введите пароль"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 rounded-md" style={{ background: 'rgba(220, 53, 69, 0.1)', border: '1px solid var(--danger)' }}>
              <p className="text-sm" style={{ color: 'var(--danger)' }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
