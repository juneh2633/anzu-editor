'use client';

import { useState } from 'react';
import { authService } from '@/services/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await authService.login({ id, pw });
      onLoginSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">로그인</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Tier Editor에 접속하세요</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              아이디
            </label>
            <input
              type="text"
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-200"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="pw" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              비밀번호
            </label>
            <input
              type="password"
              id="pw"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-200"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 px-4 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 