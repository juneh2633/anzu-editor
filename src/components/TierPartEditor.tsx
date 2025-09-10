'use client';

import { useState, useMemo } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { ChartMetaResponse, TierPart, TierItem, ChartListItem, SongData, ChartData } from '@/types/api';
import { TierSection } from './TierSection';
import { getDifficultyColor } from '@/utils/colors';
import { apiService } from '@/services/api';
import AddChartToTierModal from './AddChartToTierModal';

interface TierPartEditorProps {
  tierPart: TierPart;
  chartMeta: ChartMetaResponse;
  onUpdate: (updatedTierPart: TierPart) => void;
  onClose: () => void;
}

export function TierPartEditor({ tierPart, chartMeta, onUpdate, onClose }: TierPartEditorProps) {
  const [tierList, setTierList] = useState<TierItem[]>(tierPart.tierList || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddChartModal, setShowAddChartModal] = useState(false);
  const [selectedTierForAdd, setSelectedTierForAdd] = useState<number | null>(null);
  const [activeChart, setActiveChart] = useState<{chart: ChartListItem, song: SongData, chartData: ChartData} | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const chartMap = useMemo(() => {
    const map = new Map();
    chartMeta.chartData.forEach(song => {
      song.chart.forEach(chart => {
        map.set(chart.chartIdx, { song, chart });
      });
    });
    return map;
  }, [chartMeta]);

  const updateTierPart = (newTierList: TierItem[]) => {
    setTierList(newTierList);
    onUpdate({
      ...tierPart,
      tierList: newTierList
    });
  };

  const handleAddChartToTier = (tierIdx: number) => {
    setSelectedTierForAdd(tierIdx);
    setShowAddChartModal(true);
  };

  const handleChartAdded = (chartIdx: number) => {
    if (selectedTierForAdd !== null) {
      const newChart: ChartListItem = {
        chartIdx,
        targetScore: null
      };
      
      setTierList(prev => prev.map(tier => 
        tier.tierIdx === selectedTierForAdd 
          ? { ...tier, chartList: [...tier.chartList, newChart] }
          : tier
      ));
    }
    setShowAddChartModal(false);
    setSelectedTierForAdd(null);
  };

  const addChartToTier = (tierIdx: number, chartIdx: number, targetScore: number | null) => {
    const newTierList = tierList.map(tier => {
      if (tier.tierIdx === tierIdx) {
        const newChart: ChartListItem = {
          chartIdx,
          targetScore
        };
        return {
          ...tier,
          chartList: [...tier.chartList, newChart]
        };
      }
      return tier;
    });
    updateTierPart(newTierList);
  };

  const addMultipleChartsToTier = (tierIdx: number, charts: { chartIdx: number; targetScore: number | null }[]) => {
    const newTierList = tierList.map(tier => {
      if (tier.tierIdx === tierIdx) {
        const newCharts: ChartListItem[] = charts.map(chart => ({
          chartIdx: chart.chartIdx,
          targetScore: chart.targetScore
        }));
        return {
          ...tier,
          chartList: [...tier.chartList, ...newCharts]
        };
      }
      return tier;
    });
    updateTierPart(newTierList);
  };

  const removeChartFromTier = (tierIdx: number, chartIdx: number) => {
    const newTierList = tierList.map(tier => {
      if (tier.tierIdx === tierIdx) {
        return {
          ...tier,
          chartList: tier.chartList.filter(chart => chart.chartIdx !== chartIdx)
        };
      }
      return tier;
    });
    updateTierPart(newTierList);
  };

  const updateChartInTier = (tierIdx: number, chartIdx: number, updates: Partial<ChartListItem>) => {
    const newTierList = tierList.map(tier => {
      if (tier.tierIdx === tierIdx) {
        return {
          ...tier,
          chartList: tier.chartList.map(chart => 
            chart.chartIdx === chartIdx ? { ...chart, ...updates } : chart
          )
        };
      }
      return tier;
    });
    updateTierPart(newTierList);
  };

  const reorderChartsInTier = (tierIdx: number, oldIndex: number, newIndex: number) => {
    const newTierList = tierList.map(tier => {
      if (tier.tierIdx === tierIdx) {
        const newChartList = arrayMove(tier.chartList, oldIndex, newIndex);
        return {
          ...tier,
          chartList: newChartList
        };
      }
      return tier;
    });
    updateTierPart(newTierList);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id.toString();
    
    // Parse the active ID to find the chart
    const parts = activeId.split('-');
    if (parts.length >= 2) {
      const tierIdx = parseInt(parts[0]);
      const index = parseInt(parts[2]);
      
      const tier = tierList.find(t => t.tierIdx === tierIdx);
      if (tier && tier.chartList[index]) {
        const chart = tier.chartList[index];
        const chartData = chartMap.get(chart.chartIdx);
        if (chartData) {
          setActiveChart({
            chart,
            song: chartData.song,
            chartData: chartData.chart
          });
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveChart(null);
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    const getPositionFromId = (id: string) => {
      const parts = id.split('-');
      return {
        tierIdx: parseInt(parts[0]),
        chartIdx: parseInt(parts[1]),
        index: parseInt(parts[2])
      };
    };
    
    const activePos = getPositionFromId(activeId);
    const overPos = getPositionFromId(overId);
    
    // Same tier reordering
    if (activePos.tierIdx === overPos.tierIdx && activePos.index !== overPos.index) {
      reorderChartsInTier(activePos.tierIdx, activePos.index, overPos.index);
    }
    // Cross-tier movement
    else if (activePos.tierIdx !== overPos.tierIdx) {
      const sourceTier = tierList.find(t => t.tierIdx === activePos.tierIdx);
      const targetTier = tierList.find(t => t.tierIdx === overPos.tierIdx);
      
      if (sourceTier && targetTier) {
        const chartToMove = sourceTier.chartList[activePos.index];
        
        // Remove from source tier
        removeChartFromTier(activePos.tierIdx, chartToMove.chartIdx);
        
        // Add to target tier at the correct position
        const newTierList = tierList.map(tier => {
          if (tier.tierIdx === overPos.tierIdx) {
            const newChartList = [...tier.chartList];
            newChartList.splice(overPos.index, 0, chartToMove);
            return {
              ...tier,
              chartList: newChartList
            };
          }
          return tier;
        });
        
        updateTierPart(newTierList);
      }
    }
  };

  const exportAsJson = () => {
    const jsonData = {
      partInfo: {
        partIdx: tierPart.partIdx,
        partName: tierPart.partName,
        description: tierPart.description
      },
      tierList: tierList.map(tier => ({
        tierIdx: tier.tierIdx,
        tier: tier.tier,
        chartList: tier.chartList.map(chart => ({
          chartIdx: chart.chartIdx,
          targetScore: chart.targetScore,
          targetClearType: chart.targetClearType
        }))
      }))
    };

    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `tier_part_${tierPart.partName}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const saveToServer = async () => {
    try {
      await apiService.updateTierData({
        ...tierPart,
        tierList,
      });
      
      // 티어 데이터 업데이트 성공 후 차트 메타데이터 캐시 갱신
      await apiService.refreshChartMetaCache();
      
      alert('Tier data saved successfully');
    } catch (error) {
      console.error('Save tier data error:', error);
      alert('Failed to save tier data');
    }
  };

  const getTotalChartCount = (): number => {
    return tierList.reduce((total, tier) => total + tier.chartList.length, 0);
  };

  const addNewTier = () => {
    const newTierIdx = Math.max(...tierList.map(t => t.tierIdx), 0) + 1;
    const newTier: TierItem = {
      tierIdx: newTierIdx,
      tier: `Tier ${newTierIdx}`,
      chartList: []
    };
    const newTierList = [...tierList, newTier];
    updateTierPart(newTierList);
  };

  const removeTier = (tierIdx: number) => {
    if (tierList.length <= 1) {
      alert('Cannot remove the last tier');
      return;
    }
    
    const tierToRemove = tierList.find(t => t.tierIdx === tierIdx);
    if (tierToRemove && tierToRemove.chartList.length > 0) {
      if (!confirm(`This tier contains ${tierToRemove.chartList.length} charts. Are you sure you want to remove it?`)) {
        return;
      }
    }
    
    const newTierList = tierList.filter(tier => tier.tierIdx !== tierIdx);
    updateTierPart(newTierList);
  };

  const renameTier = (tierIdx: number, newName: string) => {
    const newTierList = tierList.map(tier => 
      tier.tierIdx === tierIdx ? { ...tier, tier: newName } : tier
    );
    updateTierPart(newTierList);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-blue-600">
              {tierPart.partName} Editor
            </h2>
            <p className="text-gray-600 mt-1">{tierPart.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              {getTotalChartCount()} charts across {tierList.length} tiers
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add Charts
            </button>
            <button
              onClick={addNewTier}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Add New Tier
            </button>
            <button
              onClick={exportAsJson}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Export JSON
            </button>
            <button
              onClick={saveToServer}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-6">
            {tierList.map((tier, index) => (
              <TierSection
                key={`tier-${tier.tierIdx}-${index}`}
                tier={tier}
                chartMeta={chartMeta}
                chartMap={chartMap}
                onUpdateChart={(chartIdx, updates) => updateChartInTier(tier.tierIdx, chartIdx, updates)}
                onRemoveChart={(chartIdx) => removeChartFromTier(tier.tierIdx, chartIdx)}
                onReorderCharts={(oldIndex, newIndex) => reorderChartsInTier(tier.tierIdx, oldIndex, newIndex)}
                onAddChart={handleAddChartToTier}
                onRemoveTier={() => removeTier(tier.tierIdx)}
                onRenameTier={(newName) => renameTier(tier.tierIdx, newName)}
                enableDndContext={false}
              />
            ))}
          </div>
          <DragOverlay>
            {activeChart && (
              <div className="bg-white border rounded-lg p-4 shadow-lg opacity-80">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded border-2 bg-gray-200 flex-shrink-0 overflow-hidden"
                    style={{ borderColor: getDifficultyColor(activeChart.chartData.type, chartMeta.metaData.type) }}
                  >
                    <img
                      src={activeChart.chartData.jacket}
                      alt={activeChart.song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{activeChart.song.title}</h4>
                    <p className="text-sm text-gray-600 truncate">{activeChart.song.artist}</p>
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 차트 추가 모달 */}
      <AddChartToTierModal
        isOpen={showAddChartModal}
        onClose={() => setShowAddChartModal(false)}
        onAdd={handleChartAdded}
        chartMeta={chartMeta}
      />
    </div>
  );
}