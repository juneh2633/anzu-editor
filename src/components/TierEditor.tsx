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
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1">
      <button
        onClick={onRemove}
        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
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
            className="text-xl font-bold text-gray-800 dark:text-white mb-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-center"
            autoFocus
          />
        ) : (
          <h3 
            className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
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
            className="text-sm text-gray-800 dark:text-white mb-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full resize-none"
            rows={2}
            autoFocus
          />
        ) : (
          <p 
            className="text-sm text-gray-600 dark:text-gray-300 mb-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
            onClick={() => {
              setIsEditingDescription(true);
              setTempDescription(tierPart.description);
            }}
          >
            {tierPart.description}
          </p>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {getTotalChartCount(tierPart)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Charts</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {tierPart.tierList.length} Tiers
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={onEdit}
          className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit Tier Part
        </button>
        <button
          onClick={onExport}
          className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
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
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Loading tier data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error loading data</h3>
            <div className="mt-2 text-red-700 dark:text-red-300">
              <p>{error}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={loadData}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tier Parts Overview</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and organize your tier parts</p>
          </div>
          <button
            onClick={addNewTierPart}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Tier Part
          </button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
          {tierParts.length}개의 티어 파트는 각각 완전히 다른 난이도표입니다. 수정하려는 파트를 선택하거나 JSON으로 내보내세요.
        </p>
        
        {tierParts && tierParts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">No tier data available yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Start by adding your first tier part or reload the data.</p>
            <button
              onClick={loadData}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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