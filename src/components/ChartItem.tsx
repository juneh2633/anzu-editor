'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SongData, ChartData, ChartListItem, TypeMetadata, RankMetadata } from '@/types/api';
import { getDifficultyColor } from '@/utils/colors';

interface ChartItemProps {
  chartItem: ChartListItem;
  song: SongData;
  chart: ChartData;
  typeMetadata: TypeMetadata[];
  rankMetadata: RankMetadata[];
  onUpdate: (chartIdx: number, updates: Partial<ChartListItem>) => void;
  onRemove: (chartIdx: number) => void;
  sortableId?: string;
}

export function ChartItem({ 
  chartItem, 
  song, 
  chart, 
  typeMetadata, 
  rankMetadata,
  onUpdate, 
  onRemove,
  sortableId
}: ChartItemProps) {
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [tempScore, setTempScore] = useState(chartItem.targetScore?.toString() || '');
  const [isEditingClearType, setIsEditingClearType] = useState(false);
  const [tempClearType, setTempClearType] = useState(chartItem.targetClearType?.toString() || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: sortableId || chartItem.chartIdx });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const difficultyColor = getDifficultyColor(chart.type, typeMetadata);

  const handleScoreUpdate = () => {
    if (tempScore.trim() === '') {
      onUpdate(chartItem.chartIdx, { targetScore: null });
    } else {
      const score = parseInt(tempScore);
      if (!isNaN(score) && score >= 0 && score <= 10000000) {
        onUpdate(chartItem.chartIdx, { targetScore: score });
      }
    }
    setIsEditingScore(false);
  };

  const handleClearTypeUpdate = () => {
    if (tempClearType === '') {
      onUpdate(chartItem.chartIdx, { targetClearType: null });
    } else {
      const clearType = parseInt(tempClearType);
      if (!isNaN(clearType) && clearType >= 0 && clearType < rankMetadata.length) {
        onUpdate(chartItem.chartIdx, { targetClearType: clearType });
      }
    }
    setIsEditingClearType(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z"/>
          </svg>
        </div>

        {/* Album Jacket with Difficulty Border */}
        <div 
          className="w-16 h-16 rounded-lg border-4 bg-gray-200 flex-shrink-0 overflow-hidden"
          style={{ borderColor: difficultyColor }}
        >
          <img
            src={chart.jacket}
            alt={song.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/><text x="32" y="32" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="10">No Image</text></svg>';
            }}
          />
        </div>

        {/* Song Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{song.title}</h4>
          <p className="text-sm text-gray-600 truncate">{song.artist}</p>
          <div className="flex items-center gap-2 mt-1">
            <span 
              className="px-2 py-1 text-xs font-medium rounded"
              style={{ 
                backgroundColor: difficultyColor + '20',
                color: difficultyColor
              }}
            >
              {chart.type.toUpperCase()} {chart.level}
            </span>
            <span className="text-xs text-gray-500">
              {chart.maxChain} chain
            </span>
          </div>
        </div>

        {/* Target Score and Clear Type */}
        <div className="flex flex-col gap-2 min-w-0">
          {/* Target Score */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 whitespace-nowrap">Target Score:</label>
            {isEditingScore ? (
              <input
                type="number"
                value={tempScore}
                onChange={(e) => setTempScore(e.target.value)}
                onBlur={handleScoreUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleScoreUpdate();
                  if (e.key === 'Escape') setIsEditingScore(false);
                }}
                className="w-24 px-2 py-1 text-xs border rounded text-gray-800"
                min="0"
                max="10000000"
                placeholder="None"
                autoFocus
              />
            ) : (
              <span 
                className="text-xs font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-800"
                onClick={() => {
                  setIsEditingScore(true);
                  setTempScore(chartItem.targetScore?.toString() || '');
                }}
              >
                {chartItem.targetScore ? chartItem.targetScore.toLocaleString() : 'None'}
              </span>
            )}
          </div>

          {/* Target Clear Type */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 whitespace-nowrap">Clear Type:</label>
            {isEditingClearType ? (
              <select
                value={tempClearType}
                onChange={(e) => setTempClearType(e.target.value)}
                onBlur={handleClearTypeUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleClearTypeUpdate();
                  if (e.key === 'Escape') setIsEditingClearType(false);
                }}
                className="w-24 px-2 py-1 text-xs border rounded text-gray-800"
                autoFocus
              >
                <option value="">None</option>
                {rankMetadata.map((rank, index) => (
                  <option key={`rank-${index}`} value={index}>
                    {rank.rankShortName || rank.rankName}
                  </option>
                ))}
              </select>
            ) : (
              <span 
                className="text-xs font-medium cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-gray-800"
                onClick={() => {
                  setIsEditingClearType(true);
                  setTempClearType(chartItem.targetClearType?.toString() || '');
                }}
              >
                {chartItem.targetClearType !== null && chartItem.targetClearType !== undefined
                  ? (rankMetadata[chartItem.targetClearType]?.rankShortName || rankMetadata[chartItem.targetClearType]?.rankName || 'Unknown')
                  : 'None'
                }
              </span>
            )}
          </div>

          {/* Target Display */}
          <div 
            className="text-xs px-2 py-1 rounded text-center bg-slate-800 text-white font-medium"
          >
            Score: {chartItem.targetScore ? chartItem.targetScore.toLocaleString() : 'None'} | Clear: {
              chartItem.targetClearType !== null && chartItem.targetClearType !== undefined
                ? (rankMetadata[chartItem.targetClearType]?.rankShortName || rankMetadata[chartItem.targetClearType]?.rankName || 'Unknown')
                : 'None'
            }
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(chartItem.chartIdx)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
          title="Remove chart"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}