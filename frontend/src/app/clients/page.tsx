'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { clientsApi, type User, type Client } from '@/lib/api';

export default function ClientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    source: '',
    notes: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadClients();
  }, [router]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientsApi.list({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
      });
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) loadClients();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientsApi.update(editingClient.id, formData);
      } else {
        await clientsApi.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadClients();
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Ошибка сохранения');
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      inn: client.inn || '',
      email: client.email || '',
      phone: client.phone || '',
      website: client.website || '',
      address: client.address || '',
      source: client.source || '',
      notes: client.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить клиента?')) return;
    try {
      await clientsApi.delete(id);
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Ошибка удаления');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      inn: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      source: '',
      notes: '',
    });
    setEditingClient(null);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; class: string }> = {
      lead: { text: 'Лид', class: 'badge badge-warning' },
      client: { text: 'Клиент', class: 'badge badge-success' },
      archive: { text: 'Архив', class: 'badge' },
    };
    const badge = badges[status] || badges.lead;
    return <span className={badge.class}>{badge.text}</span>;
  };

  return (
    <div className="flex">
      <Sidebar user={user} />
      
      <div className="flex-1" style={{ marginLeft: '240px', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <header className="header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <div className="px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Клиенты
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              + Новый клиент
            </button>
          </div>
        </header>

        <div className="px-6 py-6">
          {/* Фильтры */}
          <div className="card mb-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Поиск по названию, email, ИНН..."
                className="input flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: '150px' }}
              >
                <option value="">Все статусы</option>
                <option value="lead">Лиды</option>
                <option value="client">Клиенты</option>
                <option value="archive">Архив</option>
              </select>
            </div>
          </div>

          {/* Таблица */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                Загрузка...
              </div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                Клиентов нет
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Клиент
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Контакты
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Статус
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Добавлен
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {client.name}
                          </p>
                          {client.inn && (
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              ИНН: {client.inn}
                            </p>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="text-sm">
                          {client.email && (
                            <p style={{ color: 'var(--text-secondary)' }}>{client.email}</p>
                          )}
                          {client.phone && (
                            <p style={{ color: 'var(--text-secondary)' }}>{client.phone}</p>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {getStatusBadge(client.status)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(client.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '13px' }}
                            onClick={() => handleEdit(client)}
                          >
                            Ред.
                          </button>
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--danger)', color: 'white', border: 'none' }}
                            onClick={() => handleDelete(client.id)}
                          >
                            Удал.
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Модалка */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="card"
            style={{ width: '600px', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              {editingClient ? 'Редактировать клиента' : 'Новый клиент'}
            </h3>

            <form onSubmit={handleCreateOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Название *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">ИНН</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.inn}
                    onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Телефон</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium">Сайт</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium">Адрес</label>
                <input
                  type="text"
                  className="input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium">Источник</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Например: реклама, соцсети, рекомендация"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium">Заметки</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingClient ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
