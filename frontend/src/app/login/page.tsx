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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2" style={{ color: 'var(--brutal-accent)' }}>
            NOCTOCRM
          </h1>
          <p className="text-brutal-gray text-sm uppercase tracking-wider">
            Воронка продаж
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block mb-2 text-sm font-bold uppercase">
              USERNAME
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="brutal-input"
              placeholder="Введите username"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-bold uppercase">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="brutal-input"
              placeholder="Введите пароль"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="brutal-box p-3 bg-red-900/20">
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="brutal-button w-full"
            disabled={loading}
          >
            {loading ? 'ЗАГРУЗКА...' : 'ВОЙТИ'}
          </button>
        </form>
      </div>
    </div>
  );
}
