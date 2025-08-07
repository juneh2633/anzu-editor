'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChartMetaResponse, SongData, ChartData, TierItem } from '@/types/api';
import { getDifficultyColor } from '@/utils/colors';

interface AddChartToTierModalProps {
  chartMeta: ChartMetaResponse;
  tierList: TierItem[];
  onAddToTier: (tierIdx: number, chartIdx: number, targetScore: number | null) => void;
  onAddMultipleToTier: (tierIdx: number, charts: { chartIdx: number; targetScore: number | null }[]) => void;
  onClose: () => void;
}

export function AddChartToTierModal({
  chartMeta,
  tierList,
  onAddToTier,
  onAddMultipleToTier,
  onClose
}: AddChartToTierModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCharts, setSelectedCharts] = useState<Set<number>>(new Set());
  const [selectedTierIdx, setSelectedTierIdx] = useState<number>(tierList[0]?.tierIdx || 1);
  const [defaultScore, setDefaultScore] = useState<number | null>(null);
  const [levelRange, setLevelRange] = useState({ min: 1, max: 20 });
  const [visibleCount, setVisibleCount] = useState(50); // Show only first 50 items initially

  // Reset visible count when search/filter changes
  useEffect(() => {
    setVisibleCount(50);
  }, [searchTerm, levelRange]);

  const existingCharts = useMemo(() => {
    const set = new Set<number>();
    tierList.forEach(tier => {
      tier.chartList.forEach(chart => set.add(chart.chartIdx));
    });
    return set;
  }, [tierList]);

  const availableCharts = useMemo(() => {
    const charts: Array<{ song: SongData; chart: ChartData }> = [];

    chartMeta.chartData.forEach(song => {
      song.chart.forEach(chart => {
        charts.push({ song, chart });
      });
    });

    return charts;
  }, [chartMeta]);

  const filteredCharts = useMemo(() => {
    return availableCharts.filter(({ song, chart }) => {
      // Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        song.title.toLowerCase().includes(searchLower) ||
        song.artist.toLowerCase().includes(searchLower) ||
        song.asciiTitle.toLowerCase().includes(searchLower) ||
        song.asciiArtist.toLowerCase().includes(searchLower);

      // Level range filter
      const matchesLevel = chart.level >= levelRange.min && chart.level <= levelRange.max;

      // Type filter (always true for now)
      const matchesType = true;

      return matchesSearch && matchesLevel && matchesType;
    });
  }, [availableCharts, searchTerm, levelRange]);

  const handleChartToggle = (chartIdx: number) => {
    const newSelected = new Set(selectedCharts);
    if (newSelected.has(chartIdx)) {
      newSelected.delete(chartIdx);
    } else {
      newSelected.add(chartIdx);
    }
    setSelectedCharts(newSelected);
  };

  const handleAddSelected = () => {
    const chartsToAdd = Array.from(selectedCharts).map(chartIdx => ({
      chartIdx,
      targetScore: defaultScore
    }));
    
    if (chartsToAdd.length === 1) {
      onAddToTier(selectedTierIdx, chartsToAdd[0].chartIdx, chartsToAdd[0].targetScore);
    } else {
      onAddMultipleToTier(selectedTierIdx, chartsToAdd);
    }
    onClose();
  };


  const visibleCharts = useMemo(() => {
    return filteredCharts.slice(0, visibleCount);
  }, [filteredCharts, visibleCount]);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 50, filteredCharts.length));
  };

  // LazyImage component with loading states
  const LazyImage = ({ src, alt, className, style }: { src: string; alt: string; className: string; style?: React.CSSProperties }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
      <div className="relative w-full h-full" style={style}>
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
            No Image
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            loading="lazy"
          />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Charts to Tier</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Search by song title or artist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
              />
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Target Tier */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-800">Target Tier:</label>
                <select
                  value={selectedTierIdx}
                  onChange={(e) => setSelectedTierIdx(parseInt(e.target.value))}
                  className="px-2 py-1 text-sm border rounded text-gray-800"
                >
                  {tierList.map((tier, index) => (
                    <option key={`tier-${tier.tierIdx}-${index}`} value={tier.tierIdx}>
                      Tier {tier.tier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Range */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-800">Level:</label>
                <input
                  type="number"
                  value={levelRange.min}
                  onChange={(e) => setLevelRange(prev => ({ ...prev, min: parseInt(e.target.value) || 1 }))}
                  className="w-16 px-2 py-1 text-sm border rounded text-gray-800"
                  min="1"
                  max="20"
                />
                <span className="text-sm text-gray-800">-</span>
                <input
                  type="number"
                  value={levelRange.max}
                  onChange={(e) => setLevelRange(prev => ({ ...prev, max: parseInt(e.target.value) || 20 }))}
                  className="w-16 px-2 py-1 text-sm border rounded text-gray-800"
                  min="1"
                  max="20"
                />
              </div>

              {/* Default Score */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-800">Default Score:</label>
                <input
                  type="number"
                  value={defaultScore || ''}
                  onChange={(e) => setDefaultScore(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-24 px-2 py-1 text-sm border rounded text-gray-800 placeholder-gray-500"
                  min="0"
                  max="10000000"
                  placeholder="None"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart List */}
        <div className="flex-1 overflow-y-auto p-6 max-h-96">
          <div className="text-sm text-gray-600 mb-4">
            Showing {visibleCharts.length} of {filteredCharts.length} filtered charts ({availableCharts.length} total available)
            {selectedCharts.size > 0 && (
              <span className="ml-4 text-blue-600">
                {selectedCharts.size} selected
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleCharts.map(({ song, chart }) => {
              const difficultyColor = getDifficultyColor(chart.type, chartMeta.metaData.type);
              const isSelected = selectedCharts.has(chart.chartIdx);
              
              return (
                <div
                  key={chart.chartIdx}
                  onClick={() => handleChartToggle(chart.chartIdx)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded border-2 bg-gray-200 flex-shrink-0 overflow-hidden relative"
                      style={{ borderColor: difficultyColor }}
                    >
                      <LazyImage
                        src={chart.jacket}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{song.title}</h4>
                      <p className="text-xs text-gray-600 truncate">{song.artist}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span 
                          className="px-1.5 py-0.5 text-xs font-medium rounded"
                          style={{ 
                            backgroundColor: difficultyColor + '20',
                            color: difficultyColor
                          }}
                        >
                          {chart.type.toUpperCase()} {chart.level}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-blue-600 flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < filteredCharts.length && (
            <div className="text-center mt-6">
              <button
                onClick={loadMore}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Load More ({filteredCharts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedCharts.size > 0 ? (
                <>Will add {selectedCharts.size} chart{selectedCharts.size > 1 ? 's' : ''} to Tier {tierList.find(t => t.tierIdx === selectedTierIdx)?.tier}</>
              ) : (
                'Select charts to add to tier'
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedCharts.size === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                Add Selected ({selectedCharts.size})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
