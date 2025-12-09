'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { pipelinesApi, dealsApi, clientsApi, type Pipeline, type KanbanStage, type User, type Client } from '@/lib/api';

export default function KanbanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<number | null>(null);
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingDealId, setDraggingDealId] = useState<number | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
      loadPipelines();
      loadClients();
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  const loadPipelines = async () => {
    try {
      const data = await pipelinesApi.list();
      setPipelines(data);
      if (data.length > 0) {
        setSelectedPipeline(data[0].id);
        loadKanban(data[0].id);
      }
    } catch (error) {
      console.error('Error loading pipelines:', error);
    }
  };

  const loadClients = async () => {
    try {
      const data = await clientsApi.list();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadKanban = async (pipelineId: number) => {
    setLoading(true);
    try {
      const data = await dealsApi.getKanbanStats(pipelineId);
      setStages(data);
    } catch (error) {
      console.error('Error loading kanban:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePipelineChange = (pipelineId: number) => {
    setSelectedPipeline(pipelineId);
    loadKanban(pipelineId);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPipeline || stages.length === 0) {
      alert('Выберите воронку');
      return;
    }

    try {
      await dealsApi.create({
        title: formData.title,
        client_id: Number(formData.client_id),
        amount: Number(formData.amount),
        description: formData.description || undefined,
        pipeline_id: selectedPipeline,
        stage_id: stages[0].stage_id, // Первая стадия
        currency: 'RUB',
        status: 'open',
      });

      setShowModal(false);
      setFormData({ title: '', client_id: '', amount: '', description: '' });
      loadKanban(selectedPipeline);
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Ошибка создания сделки');
    }
  };

  const handleDragStart = (dealId: number) => {
    setDraggingDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stageId: number) => {
    if (!draggingDealId) return;

    try {
      await dealsApi.move(draggingDealId, stageId);
      if (selectedPipeline) {
        loadKanban(selectedPipeline);
      }
    } catch (error) {
      console.error('Error moving deal:', error);
      alert('Ошибка перемещения сделки');
    } finally {
      setDraggingDealId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1" style={{ marginLeft: '240px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar user={user} />
      
      <div className="flex-1" style={{ marginLeft: '240px', background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        {/* Header */}
        <header className="header">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Воронка продаж
              </h2>
              <select
                value={selectedPipeline || ''}
                onChange={(e) => handlePipelineChange(Number(e.target.value))}
                className="input"
                style={{ width: '200px' }}
              >
                {pipelines.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Новая сделка
            </button>
          </div>
        </header>

        {/* Kanban Board */}
        <div className="px-6 py-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => (
              <div
                key={stage.stage_id}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.stage_id)}
              >
                <div className="card mb-3" style={{ borderTop: `3px solid ${stage.color}` }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {stage.stage_name}
                  </h3>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <span>{stage.deals_count} сд.</span>
                    <span className="font-medium">{stage.total_amount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {stage.deals.map(deal => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal.id)}
                      className={`card kanban-card ${
                        draggingDealId === deal.id ? 'dragging' : ''
                      }`}
                    >
                      <h4 className="font-medium mb-2" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                        {deal.title}
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                          {deal.amount.toLocaleString('ru-RU')} {deal.currency}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          ID: {deal.client_id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Модалка создания сделки */}
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
            style={{ width: '500px', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Новая сделка
            </h3>

            <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="block mb-1.5 text-sm font-medium">Название *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Например: Контекстная реклама"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium">Клиент *</label>
                <select
                  className="input"
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                >
                  <option value="">Выберите клиента</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium">Сумма (₽) *</label>
                <input
                  type="number"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="50000"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium">Описание</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Дополнительная информация..."
                />
              </div>

              <div className="text-sm" style={{ color: 'var(--text-muted)', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                ℹ️ Сделка будет создана в первой стадии: <strong>{stages[0]?.stage_name}</strong>
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
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
