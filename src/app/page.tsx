'use client';

import { useState, useEffect } from 'react';
import { TierEditor } from '@/components/TierEditor';
import LoginModal from '@/components/LoginModal';
import VersionManager from '@/components/VersionManager';
import StatsDashboard from '@/components/StatsDashboard';
import ChartSearch from '@/components/ChartSearch';
import AddSongModal from '@/components/AddSongModal';
import AddJacketModal from '@/components/AddJacketModal';
import AddChartModal from '@/components/AddChartModal';
import EditChartModal from '@/components/EditChartModal';
import Toast from '@/components/Toast';
import { authService } from '@/services/auth';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showAddJacketModal, setShowAddJacketModal] = useState(false);
  const [showAddChartModal, setShowAddChartModal] = useState(false);
  const [showEditChartModal, setShowEditChartModal] = useState(false);
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [currentView, setCurrentView] = useState<'tier' | 'stats' | 'search'>('tier');
  
  // 토스트 알림 상태
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      const loggedIn = authService.isLoggedIn();
      console.log('로그인 상태 확인:', loggedIn);
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        // 로그인된 경우 사용자 정보를 가져와서 관리자 권한 확인
        console.log('사용자 정보 가져오기 시작...');
        try {
          const userInfo = await authService.getUserInfo();
          console.log('받아온 사용자 정보:', userInfo);
          setIsAdmin(userInfo?.rankIdx === 2);
          console.log('관리자 권한 설정:', userInfo?.rankIdx === 2);
        } catch (error) {
          console.error('사용자 정보 가져오기 실패:', error);
          setIsAdmin(false);
        }
      } else {
        console.log('로그인되지 않음, 관리자 권한 false');
        setIsAdmin(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = async () => {
    console.log('로그인 성공 처리 시작...');
    setIsLoggedIn(true);
    // 로그인 성공 후 사용자 정보를 가져와서 관리자 권한 확인
    try {
      const userInfo = await authService.getUserInfo();
      console.log('로그인 후 사용자 정보:', userInfo);
      setIsAdmin(userInfo?.rankIdx === 2);
      console.log('로그인 후 관리자 권한 설정:', userInfo?.rankIdx === 2);
    } catch (error) {
      console.error('로그인 후 사용자 정보 가져오기 실패:', error);
      setIsAdmin(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <header className="backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Tier Editor
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Anzuinfo Development Tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* 네비게이션 메뉴 */}
              {isLoggedIn && (
                <div className="flex items-center space-x-2 mr-4">
                  <button
                    onClick={() => setCurrentView('tier')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === 'tier'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Tier Editor
                  </button>
                  <button
                    onClick={() => setCurrentView('stats')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === 'stats'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    통계
                  </button>
                  <button
                    onClick={() => setCurrentView('search')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      currentView === 'search'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    차트 검색
                  </button>
                </div>
              )}
              
              {isLoggedIn && isAdmin && currentView === 'tier' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    곡 추가
                  </button>
                  <button
                    onClick={() => setShowAddJacketModal(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    자켓 업로드
                  </button>
                  <button
                    onClick={() => setShowAddChartModal(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    차트 추가
                  </button>
                  <button
                    onClick={() => setShowEditChartModal(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    차트 수정
                  </button>
                  <button
                    onClick={() => setShowVersionManager(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    버전 관리
                  </button>
                </div>
              )}
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {isAdmin ? '관리자' : '일반 사용자'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  로그인
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoggedIn ? (
          showVersionManager ? (
            <div>
              <VersionManager />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowVersionManager(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Tier Editor로 돌아가기
                </button>
              </div>
            </div>
          ) : currentView === 'stats' ? (
            <StatsDashboard />
          ) : currentView === 'search' ? (
            <ChartSearch />
          ) : (
            <TierEditor />
          )
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              로그인이 필요합니다
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Tier Editor를 사용하려면 먼저 로그인해주세요.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
            >
              로그인하기
            </button>
          </div>
        )}
      </main>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
      {isAdmin && (
        <>
          <AddSongModal
            isOpen={showAddSongModal}
            onClose={() => setShowAddSongModal(false)}
            onSuccess={() => {
              showToast('곡이 성공적으로 추가되었습니다!', 'success');
            }}
          />
          
          <AddJacketModal
            isOpen={showAddJacketModal}
            onClose={() => setShowAddJacketModal(false)}
            onSuccess={() => {
              showToast('자켓이 성공적으로 업로드되었습니다!', 'success');
            }}
          />
          
          <AddChartModal
            isOpen={showAddChartModal}
            onClose={() => setShowAddChartModal(false)}
            onSuccess={() => {
              showToast('차트가 성공적으로 추가되었습니다!', 'success');
            }}
          />
          
          <EditChartModal
            isOpen={showEditChartModal}
            onClose={() => setShowEditChartModal(false)}
            onSuccess={() => {
              showToast('차트가 성공적으로 수정되었습니다!', 'success');
            }}
          />
        </>
      )}
      
      {/* 토스트 알림 */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
    </div>
  );
}
