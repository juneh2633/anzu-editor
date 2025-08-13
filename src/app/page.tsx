'use client';

import { useState, useEffect } from 'react';
import { TierEditor } from '@/components/TierEditor';
import LoginModal from '@/components/LoginModal';
import AddSongModal from '@/components/AddSongModal';
import AddJacketModal from '@/components/AddJacketModal';
import AddChartToSongModal from '@/components/AddChartToSongModal';
import EditChartModal from '@/components/EditChartModal';
import VersionManager from '@/components/VersionManager';
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

  const handleSongAddSuccess = () => {
    // 곡 추가 성공 시 필요한 작업 (예: 데이터 새로고침)
    console.log('곡이 성공적으로 추가되었습니다.');
  };

  const handleJacketAddSuccess = () => {
    // 자켓 업로드 성공 시 필요한 작업
    console.log('자켓이 성공적으로 업로드되었습니다.');
  };

  const handleChartAddSuccess = () => {
    // 차트 추가 성공 시 필요한 작업
    console.log('차트가 성공적으로 추가되었습니다.');
  };

  const handleChartEditSuccess = () => {
    // 차트 수정 성공 시 필요한 작업
    console.log('차트가 성공적으로 수정되었습니다.');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tier Part Editor</h1>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500 dark:text-gray-300">Anzuinfo Development Tool</p>
              {isLoggedIn && isAdmin && (
                <>
                  <button
                    onClick={() => setShowAddSongModal(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    곡 추가
                  </button>
                  <button
                    onClick={() => setShowAddJacketModal(true)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
                  >
                    자켓 업로드
                  </button>
                  <button
                    onClick={() => setShowAddChartModal(true)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600"
                  >
                    차트 추가
                  </button>
                  <button
                    onClick={() => setShowEditChartModal(true)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    차트 수정
                  </button>
                  <button
                    onClick={() => setShowVersionManager(true)}
                    className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600"
                  >
                    버전 관리
                  </button>
                </>
              )}
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {isAdmin ? '관리자' : '일반 사용자'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
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
            onSuccess={handleSongAddSuccess}
          />
          
          <AddJacketModal
            isOpen={showAddJacketModal}
            onClose={() => setShowAddJacketModal(false)}
            onSuccess={handleJacketAddSuccess}
          />
          
          <AddChartToSongModal
            isOpen={showAddChartModal}
            onClose={() => setShowAddChartModal(false)}
            onSuccess={handleChartAddSuccess}
          />
          
          <EditChartModal
            isOpen={showEditChartModal}
            onClose={() => setShowEditChartModal(false)}
            onSuccess={handleChartEditSuccess}
          />
        </>
      )}
    </div>
  );
}
