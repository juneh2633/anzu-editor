'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface ChartInfo {
  chartIdx: number;
  targetScore: number | null;
}

interface SearchResult {
  partName: string;
  tier: string;
  chartIdx: number;
  targetScore: number | null;
}

export default function ChartSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierData, setTierData] = useState<any[]>([]);

  useEffect(() => {
    loadTierData();
  }, []);

  const loadTierData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTierData();
      setTierData(data);
    } catch (err) {
      console.error('티어 데이터 로딩 오류:', err);
      setError('티어 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const searchCharts = () => {
    if (!searchTerm.trim() || !tierData.length) return;

    const results: SearchResult[] = [];
    const searchLower = searchTerm.toLowerCase();

    tierData.forEach(part => {
      part.tierList.forEach(tier => {
        tier.chartList.forEach((chart: ChartInfo) => {
          if (chart.chartIdx.toString().includes(searchTerm)) {
            results.push({
              partName: part.partInfo.partName,
              tier: tier.tier,
              chartIdx: chart.chartIdx,
              targetScore: chart.targetScore
            });
          }
        });
      });
    });

    setSearchResults(results);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCharts();
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
            <p className="text-slate-600 dark:text-slate-400 mt-1">차트 ID로 티어 정보를 검색하세요</p>
          </div>
        </div>

        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="차트 ID를 입력하세요 (예: 2475)"
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
                  className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{result.tier}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          차트 ID: {result.chartIdx}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400">
                          {result.partName} • Tier {result.tier}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 dark:text-slate-400">목표 점수</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {result.targetScore ? result.targetScore.toLocaleString() : 'N/A'}
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
              차트 ID를 입력하여 해당 차트의 티어 정보를 확인할 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
