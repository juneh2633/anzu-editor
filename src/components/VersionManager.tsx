'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export default function VersionManager() {
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [newVersion, setNewVersion] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentVersion();
  }, []);

  const loadCurrentVersion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getChartVersion();
      setCurrentVersion(response.version);
    } catch (err) {
      setError(err instanceof Error ? err.message : '버전 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVersion = async () => {
    if (!newVersion.trim()) {
      setError('새 버전을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await apiService.updateChartVersion(newVersion.trim());
      setSuccess('버전이 성공적으로 업데이트되었습니다.');
      setCurrentVersion(newVersion.trim());
      setNewVersion('');
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '버전 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            차트 버전 관리
          </h2>
        </div>
        
        <div className="space-y-4">
          {/* 현재 버전 표시 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              현재 버전
            </label>
            <div className="text-lg font-mono text-gray-900 dark:text-white">
              {loading ? '로딩 중...' : currentVersion || '버전 정보 없음'}
            </div>
          </div>

          {/* 새 버전 입력 */}
          <div>
            <label htmlFor="newVersion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              새 버전
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="newVersion"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
                placeholder="예: 1.0.1"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleUpdateVersion}
                disabled={loading || !newVersion.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
              >
                {loading ? '업데이트 중...' : '업데이트'}
              </button>
            </div>
          </div>

          {/* 새로고침 버튼 */}
          <div>
            <button
              onClick={loadCurrentVersion}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-md font-medium transition-colors"
            >
              새로고침
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 성공 메시지 */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
