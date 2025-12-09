'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pipelinesApi, dealsApi, type Pipeline, type KanbanStage, type User } from '@/lib/api';

export default function KanbanPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<number | null>(null);
  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingDealId, setDraggingDealId] = useState<number | null>(null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header className="header">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold" style={{ color: 'var(--accent)' }}>
              noctoCRM
            </h1>
            
            {/* Pipeline Selector */}
            <select
              value={selectedPipeline || ''}
              onChange={(e) => handlePipelineChange(Number(e.target.value))}
              className="input"
              style={{ width: '250px' }}
            >
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.full_name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {user?.role === 'admin' ? 'Администратор' : user?.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="max-w-screen-2xl mx-auto px-6 py-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <div
              key={stage.stage_id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.stage_id)}
            >
              {/* Column Header */}
              <div className="card mb-3" style={{ borderTop: `3px solid ${stage.color}` }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {stage.stage_name}
                </h3>
                <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>{stage.deals_count} сд.</span>
                  <span className="font-medium">{stage.total_amount.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {/* Deals */}
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
  );
}
