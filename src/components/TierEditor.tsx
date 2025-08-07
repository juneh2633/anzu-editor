'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { ChartMetaResponse, TierPart } from '@/types/api';
import { TierPartEditor } from './TierPartEditor';

interface TierPartCardProps {
  tierPart: TierPart;
  onEdit: () => void;
  onExport: () => void;
  onRemove: () => void;
  onUpdateInfo: (updates: Partial<Pick<TierPart, 'partName' | 'description'>>) => void;
  getTotalChartCount: (tierPart: TierPart) => number;
}

function TierPartCard({ tierPart, onEdit, onExport, onRemove, onUpdateInfo, getTotalChartCount }: TierPartCardProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempName, setTempName] = useState(tierPart.partName);
  const [tempDescription, setTempDescription] = useState(tierPart.description);

  const handleNameUpdate = () => {
    if (tempName.trim()) {
      onUpdateInfo({ partName: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleDescriptionUpdate = () => {
    if (tempDescription.trim()) {
      onUpdateInfo({ description: tempDescription.trim() });
    }
    setIsEditingDescription(false);
  };

  return (
    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow relative">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-full transition-colors"
        title="Remove tier part"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="text-center mb-4">
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
                setTempName(tierPart.partName);
              }
            }}
            className="text-xl font-bold text-gray-800 mb-2 bg-white border rounded px-2 py-1 text-center"
            autoFocus
          />
        ) : (
          <h3 
            className="text-xl font-bold text-blue-600 mb-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onClick={() => {
              setIsEditingName(true);
              setTempName(tierPart.partName);
            }}
          >
            {tierPart.partName}
          </h3>
        )}
        
        {isEditingDescription ? (
          <textarea
            value={tempDescription}
            onChange={(e) => setTempDescription(e.target.value)}
            onBlur={handleDescriptionUpdate}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleDescriptionUpdate();
              }
              if (e.key === 'Escape') {
                setIsEditingDescription(false);
                setTempDescription(tierPart.description);
              }
            }}
            className="text-sm text-gray-800 mb-3 bg-white border rounded px-2 py-1 w-full resize-none"
            rows={2}
            autoFocus
          />
        ) : (
          <p 
            className="text-sm text-gray-600 mb-3 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onClick={() => {
              setIsEditingDescription(true);
              setTempDescription(tierPart.description);
            }}
          >
            {tierPart.description}
          </p>
        )}
        
        <div className="bg-gray-50 rounded p-3">
          <div className="text-2xl font-bold text-gray-800">
            {getTotalChartCount(tierPart)}
          </div>
          <div className="text-sm text-gray-600">Total Charts</div>
          <div className="text-sm text-gray-600 mt-1">
            {tierPart.tierList.length} Tiers
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={onEdit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md font-medium transition-colors"
        >
          Edit Tier Part
        </button>
        <button
          onClick={onExport}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-md font-medium transition-colors"
        >
          Export as JSON
        </button>
      </div>
    </div>
  );
}

export function TierEditor() {
  const [chartMeta, setChartMeta] = useState<ChartMetaResponse | null>(null);
  const [tierParts, setTierParts] = useState<TierPart[]>([]);
  const [selectedPartIdx, setSelectedPartIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metaResponse, tierResponse] = await Promise.all([
        apiService.getChartMeta(),
        apiService.getTierData()
      ]);
      
      setChartMeta(metaResponse);
      setTierParts(tierResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportTierPartAsJson = (partIdx: number) => {
    const tierPart = tierParts.find(p => p.partIdx === partIdx);
    if (!tierPart) return;

    const jsonData = {
      partInfo: {
        partIdx: tierPart.partIdx,
        partName: tierPart.partName,
        description: tierPart.description
      },
      tierList: tierPart.tierList.map(tier => ({
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

  const updateTierPart = (partIdx: number, newTierPart: TierPart) => {
    setTierParts(prev => prev.map(part => 
      part.partIdx === partIdx ? newTierPart : part
    ));
  };

  const getTotalChartCount = (tierPart: TierPart): number => {
    return tierPart.tierList.reduce((total, tier) => total + tier.chartList.length, 0);
  };

  const addNewTierPart = () => {
    const newPartIdx = Math.max(...tierParts.map(p => p.partIdx), 0) + 1;
    const newTierPart: TierPart = {
      partIdx: newPartIdx,
      partName: `Part ${newPartIdx}`,
      description: `New tier part ${newPartIdx}`,
      tierList: [
        {
          tierIdx: 1,
          tier: 'Tier 1',
          chartList: []
        }
      ]
    };
    setTierParts(prev => [...prev, newTierPart]);
  };

  const removeTierPart = (partIdx: number) => {
    if (tierParts.length <= 1) {
      alert('Cannot remove the last tier part');
      return;
    }
    
    const partToRemove = tierParts.find(p => p.partIdx === partIdx);
    if (partToRemove && getTotalChartCount(partToRemove) > 0) {
      if (!confirm(`This tier part contains ${getTotalChartCount(partToRemove)} charts. Are you sure you want to remove it?`)) {
        return;
      }
    }
    
    setTierParts(prev => prev.filter(part => part.partIdx !== partIdx));
  };

  const updateTierPartInfo = (partIdx: number, updates: Partial<Pick<TierPart, 'partName' | 'description'>>) => {
    setTierParts(prev => prev.map(part => 
      part.partIdx === partIdx ? { ...part, ...updates } : part
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadData}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Tier Parts Overview</h2>
          <button
            onClick={addNewTierPart}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Add New Tier Part
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          {tierParts.length}개의 티어 파트는 각각 완전히 다른 난이도표입니다. 수정하려는 파트를 선택하거나 JSON으로 내보내세요.
        </p>
        
        {tierParts && tierParts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tierParts.map((tierPart) => (
              <TierPartCard
                key={`part-${tierPart.partIdx}`}
                tierPart={tierPart}
                onEdit={() => setSelectedPartIdx(tierPart.partIdx)}
                onExport={() => exportTierPartAsJson(tierPart.partIdx)}
                onRemove={() => removeTierPart(tierPart.partIdx)}
                onUpdateInfo={(updates) => updateTierPartInfo(tierPart.partIdx, updates)}
                getTotalChartCount={getTotalChartCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No tier data available yet.</p>
            <button
              onClick={loadData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Reload Data
            </button>
          </div>
        )}
      </div>

      {selectedPartIdx !== null && chartMeta && (
        <TierPartEditor
          tierPart={tierParts.find(p => p.partIdx === selectedPartIdx)!}
          chartMeta={chartMeta}
          onUpdate={(updatedPart) => updateTierPart(selectedPartIdx, updatedPart)}
          onClose={() => setSelectedPartIdx(null)}
        />
      )}
    </div>
  );
}