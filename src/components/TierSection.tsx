'use client';

import { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChartMetaResponse, TierItem, ChartListItem, SongData, ChartData } from '@/types/api';
import { ChartItem } from './ChartItem';

interface TierSectionProps {
  tier: TierItem;
  chartMeta: ChartMetaResponse;
  chartMap: Map<number, { song: SongData; chart: ChartData }>;
  onUpdateChart: (chartIdx: number, updates: Partial<ChartListItem>) => void;
  onRemoveChart: (chartIdx: number) => void;
  onReorderCharts: (oldIndex: number, newIndex: number) => void;
  onAddChart?: (tierIdx: number) => void;
  onRemoveTier?: () => void;
  onRenameTier?: (newName: string) => void;
  enableDndContext?: boolean;
}

export function TierSection({ 
  tier, 
  chartMeta,
  chartMap, 
  onUpdateChart, 
  onRemoveChart, 
  onReorderCharts,
  onAddChart,
  onRemoveTier,
  onRenameTier,
  enableDndContext = true
}: TierSectionProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(tier.tier);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Extract index from the unique key format: tierIdx-chartIdx-index
      const getIndexFromId = (id: string | number): number => {
        const idStr = id.toString();
        const parts = idStr.split('-');
        return parseInt(parts[parts.length - 1]);
      };

      const oldIndex = getIndexFromId(active.id);
      const newIndex = getIndexFromId(over.id);
      
      onReorderCharts(oldIndex, newIndex);
    }
  }

  const handleNameUpdate = () => {
    if (onRenameTier && tempName.trim()) {
      onRenameTier(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameUpdate}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameUpdate();
                if (e.key === 'Escape') {
                  setIsEditingName(false);
                  setTempName(tier.tier);
                }
              }}
              className="text-lg font-semibold text-gray-800 bg-white border rounded px-2 py-1"
              autoFocus
            />
          ) : (
            <h3 
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => {
                if (onRenameTier) {
                  setIsEditingName(true);
                  setTempName(tier.tier);
                }
              }}
            >
              {tier.tier}
            </h3>
          )}
          <span className="text-sm text-gray-500">
            {tier.chartList.length} charts
          </span>
        </div>
        {onRemoveTier && (
          <button
            onClick={onRemoveTier}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
            title="Remove tier"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {tier.chartList.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No charts in this tier yet
        </div>
      ) : enableDndContext ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={tier.chartList.map((chart, index) => `${tier.tierIdx}-${chart.chartIdx}-${index}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {tier.chartList.map((chartItem, index) => {
                const chartData = chartMap.get(chartItem.chartIdx);
                const uniqueKey = `${tier.tierIdx}-${chartItem.chartIdx}-${index}`;
                
                if (!chartData) {
                  return (
                    <div key={uniqueKey} className="p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-600">Chart not found: {chartItem.chartIdx}</p>
                    </div>
                  );
                }

                return (
                  <ChartItem
                    key={uniqueKey}
                    chartItem={chartItem}
                    song={chartData.song}
                    chart={chartData.chart}
                    typeMetadata={chartMeta.metaData.type}
                    rankMetadata={chartMeta.metaData.rank}
                    onUpdate={onUpdateChart}
                    onRemove={onRemoveChart}
                    sortableId={uniqueKey}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <SortableContext 
          items={tier.chartList.map((chart, index) => `${tier.tierIdx}-${chart.chartIdx}-${index}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tier.chartList.map((chartItem, index) => {
              const chartData = chartMap.get(chartItem.chartIdx);
              const uniqueKey = `${tier.tierIdx}-${chartItem.chartIdx}-${index}`;
              
              if (!chartData) {
                return (
                  <div key={uniqueKey} className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-600">Chart not found: {chartItem.chartIdx}</p>
                  </div>
                );
              }

              return (
                <ChartItem
                  key={uniqueKey}
                  chartItem={chartItem}
                  song={chartData.song}
                  chart={chartData.chart}
                  typeMetadata={chartMeta.metaData.type}
                  rankMetadata={chartMeta.metaData.rank}
                  onUpdate={onUpdateChart}
                  onRemove={onRemoveChart}
                  sortableId={uniqueKey}
                />
              );
            })}
            
            {/* 차트 추가 버튼 */}
            {onAddChart && (
              <button
                onClick={() => onAddChart(tier.tierIdx)}
                className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>차트 추가</span>
                </div>
              </button>
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
}