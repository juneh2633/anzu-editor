'use client';

import React, { useState, useEffect } from 'react';
import { ChartMetaResponse, SongData, ChartData } from '@/types/api';
import { getDifficultyColor } from '@/utils/colors';

interface AddChartToTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (chartIdx: number) => void;
  chartMeta: ChartMetaResponse;
}

const AddChartToTierModal: React.FC<AddChartToTierModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  chartMeta 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);
  const [selectedChart, setSelectedChart] = useState<ChartData | null>(null);
  const [filteredSongs, setFilteredSongs] = useState<SongData[]>([]);

  useEffect(() => {
    if (chartMeta?.songs) {
      setFilteredSongs(chartMeta.songs);
    }
  }, [chartMeta]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chartMeta?.songs) return;

    const searchLower = searchTerm.toLowerCase();
    const filtered = chartMeta.songs.filter(song => 
      song.title.toLowerCase().includes(searchLower) ||
      song.artist.toLowerCase().includes(searchLower) ||
      song.songid.toLowerCase().includes(searchLower) ||
      song.songIdx.toString().includes(searchTerm)
    );
    setFilteredSongs(filtered);
  };

  const handleSongSelect = (song: SongData) => {
    setSelectedSong(song);
    setSelectedChart(null);
  };

  const handleChartSelect = (chart: ChartData) => {
    setSelectedChart(chart);
  };

  const handleAdd = () => {
    if (selectedChart) {
      onAdd(selectedChart.chartIdx);
      onClose();
    }
  };

  const resetModal = () => {
    setSearchTerm('');
    setSelectedSong(null);
    setSelectedChart(null);
    if (chartMeta?.songs) {
      setFilteredSongs(chartMeta.songs);
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-4xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">차트 추가</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">티어에 추가할 차트를 선택하세요</p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="곡 제목, 아티스트, Song ID 또는 Song Index로 검색하세요"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              검색
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* 곡 목록 */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              곡 목록 ({filteredSongs.length}개)
            </h3>
            <div className="space-y-2">
              {filteredSongs.map((song) => (
                <div
                  key={song.songIdx}
                  onClick={() => handleSongSelect(song)}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedSong?.songIdx === song.songIdx
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{song.songIdx}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {song.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400">
                        {song.artist} • {song.version}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Song ID: {song.songid} • 차트 수: {song.chart.length}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 차트 목록 */}
          {selectedSong && (
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                차트 목록 ({selectedSong.chart.length}개)
              </h3>
              <div className="space-y-2">
                {selectedSong.chart.map((chart) => (
                  <div
                    key={chart.chartIdx}
                    onClick={() => handleChartSelect(chart)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                      selectedChart?.chartIdx === chart.chartIdx
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getDifficultyColor(chart.type)}`}>
                            {chart.type}
                          </span>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            Lv.{chart.level}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Chart ID: {chart.chartIdx}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                        <div>Max Score: {chart.maxExscore.toLocaleString()}</div>
                        <div>Max Chain: {chart.maxChain}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedChart}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            차트 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddChartToTierModal;
