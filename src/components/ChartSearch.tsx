'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiService } from '@/services/api';
import { ChartMetaResponse } from '@/types/api';
import { getDifficultyColor } from '@/utils/colors';

interface ChartInfo {
  chartIdx: number;
  targetScore: number | null;
}

interface SearchResult {
  chartIdx: number;
  songTitle: string;
  artist: string;
  songId: string;
  level: number;
  type: string;
  effectorName: string;
  illustratorName: string;
  jacket: string;
}

export default function ChartSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartMeta, setChartMeta] = useState<ChartMetaResponse | null>(null);

  useEffect(() => {
    loadChartMeta();
  }, []);

  const loadChartMeta = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getChartMeta();
      console.log('차트 메타데이터 로드됨:', data);
      console.log('chartData 첫 번째 항목:', data.chartData?.[0]);
      setChartMeta(data);
    } catch (err) {
      console.error('차트 메타데이터 로딩 오류:', err);
      setError('차트 메타데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 메타데이터에서 검색 결과를 실시간으로 계산
  const searchResults = useMemo(() => {
    console.log('검색 실행:', { searchTerm, chartMeta: chartMeta?.chartData?.length });
    
    if (!searchTerm.trim() || !chartMeta?.chartData || !Array.isArray(chartMeta.chartData)) {
      console.log('검색 조건 불만족:', { 
        hasSearchTerm: !!searchTerm.trim(), 
        hasChartMeta: !!chartMeta?.chartData,
        isArray: Array.isArray(chartMeta?.chartData)
      });
      return [];
    }

    const searchLower = searchTerm.toLowerCase();
    const results: SearchResult[] = [];

    chartMeta.chartData.forEach((song) => {
      // song이 존재하는지 확인
      if (!song) return;
      
      // 각 곡의 차트들을 검색
      if (song.chart && Array.isArray(song.chart)) {
        song.chart.forEach((chart) => {
          if (!chart) return;
          
          const matchesSearch = 
            (chart.chartIdx && chart.chartIdx.toString().includes(searchTerm)) ||
            (song.title && song.title.toLowerCase().includes(searchLower)) ||
            (song.artist && song.artist.toLowerCase().includes(searchLower)) ||
            (song.songIdx && song.songIdx.toString().includes(searchTerm));

          if (matchesSearch) {
            results.push({
              chartIdx: chart.chartIdx || 0,
              songTitle: song.title || 'Unknown Title',
              artist: song.artist || 'Unknown Artist',
              songId: song.songIdx?.toString() || 'Unknown ID',
              level: chart.level || 0,
              type: chart.type || 'Unknown',
              effectorName: chart.effectorName || '',
              illustratorName: chart.illustratorName || '',
              jacket: chart.jacket || ''
            });
          }
        });
      }
    });

    // 최대 50개 결과로 제한
    const finalResults = results.slice(0, 50);
    console.log('검색 결과:', finalResults.length, '개');
    return finalResults;
  }, [searchTerm, chartMeta]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
          <p className="text-slate-600 dark:text-slate-400">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">오류 발생</h3>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
        <button
          onClick={loadTierData}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">차트 검색</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">차트 ID, 곡 제목, 아티스트, Song ID로 실시간 검색하세요</p>
          </div>
        </div>

        {/* 검색 폼 */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="차트 ID, 곡 제목, 아티스트, Song ID로 검색하세요"
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex items-center px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              {searchTerm && (
                <span>{searchResults.length}개 결과</span>
              )}
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              검색 결과 ({searchResults.length}개)
            </h3>
            <div className="grid gap-4">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* 자켓 이미지 */}
                      <div 
                        className="w-12 h-12 rounded border-2 bg-gray-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden"
                        style={{ borderColor: chartMeta?.metaData?.type ? getDifficultyColor(result.type, chartMeta.metaData.type) : '#e5e7eb' }}
                      >
                        {result.jacket ? (
                          <img
                            src={result.jacket}
                            alt={`${result.songTitle} jacket`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {result.songTitle}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {result.artist} • {result.type} • Level {result.level}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          Chart ID: {result.chartIdx} • Song ID: {result.songId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Effector</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {result.effectorName || 'N/A'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Illustrator</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {result.illustratorName || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchTerm && searchResults.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">검색 결과가 없습니다</h3>
            <p className="text-slate-500 dark:text-slate-400">
              "{searchTerm}"에 해당하는 차트를 찾을 수 없습니다.
            </p>
          </div>
        )}

        {!searchTerm && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">차트를 검색해보세요</h3>
            <p className="text-slate-500 dark:text-slate-400">
              차트 ID, 곡 제목, 아티스트, Song ID를 입력하여 실시간으로 차트를 검색할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
