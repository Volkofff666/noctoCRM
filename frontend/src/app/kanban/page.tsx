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
        <div className="text-2xl font-bold uppercase">ЗАГРУЗКА...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="brutal-box p-4 mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--brutal-accent)' }}>
              NOCTOCRM
            </h1>
            
            {/* Pipeline Selector */}
            <select
              value={selectedPipeline || ''}
              onChange={(e) => handlePipelineChange(Number(e.target.value))}
              className="brutal-input w-64"
            >
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold uppercase">{user?.full_name}</p>
              <p className="text-sm text-brutal-gray uppercase">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="brutal-button-secondary"
            >
              ВЫЙТИ
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="container mx-auto px-4">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map(stage => (
            <div
              key={stage.stage_id}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.stage_id)}
            >
              {/* Column Header */}
              <div
                className="glass-card p-4 mb-4"
                style={{ borderTop: `4px solid ${stage.color}` }}
              >
                <h3 className="font-bold uppercase text-lg mb-2">{stage.stage_name}</h3>
                <div className="flex justify-between text-sm text-brutal-gray">
                  <span>{stage.deals_count} сделок</span>
                  <span>{stage.total_amount.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {/* Deals */}
              <div className="space-y-3">
                {stage.deals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                    className={`brutal-box p-4 kanban-card ${
                      draggingDealId === deal.id ? 'dragging' : ''
                    }`}
                  >
                    <h4 className="font-bold mb-2">{deal.title}</h4>
                    <div className="text-sm text-brutal-gray">
                      <p className="font-bold" style={{ color: 'var(--brutal-accent)' }}>
                        {deal.amount.toLocaleString('ru-RU')} {deal.currency}
                      </p>
                      <p className="text-xs mt-1">
                        ID клиента: {deal.client_id}
                      </p>
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
