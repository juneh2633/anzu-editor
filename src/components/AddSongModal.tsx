'use client';

import React, { useState, useEffect } from 'react';
import { NewSongDto, DifficultyDto, RadarDto, ChartTypeCode } from '@/types/api';
import { apiService } from '@/services/api';
import { getTypeCode } from '@/utils/typeConverter';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddSongModal: React.FC<AddSongModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<NewSongDto>({
    songid: '',
    title: '',
    artist: '',
    version: '',
    bpm: '',
    genres: [],
    date: '',
    eac_exc: false,
    difficulties: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [maxSongIdx, setMaxSongIdx] = useState<number | null>(null);
  const [showAddDifficulty, setShowAddDifficulty] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [editingDifficultyIndex, setEditingDifficultyIndex] = useState<number | null>(null);
  const [newDifficulty, setNewDifficulty] = useState<DifficultyDto>({
    level: 1,
    type: '',
    effectorName: '',
    illustratorName: '',
    max_exscore: '',
    radar: {
      notes: 0,
      peak: 0,
      tsumami: 0,
      tricky: 0,
      handtrip: 0,
      onehand: 0
    } as RadarDto,
    max_chain: '',
    chip_count: '',
    hold_count: '',
    tsumami_count: ''
  });

  const predefinedGenres = [
    'BEMANI',
    'ボーカロイド',
    'SDVXオリジナル',
    'EXIT TUNES',
    'FLOOR',
    '東方アレンジ',
    'ひなビタ♪/バンめし♪',
    'POPS&アニメ',
    'その他'
  ];

  const chartTypes = [
    { value: 'NOV', label: 'NOVICE' },
    { value: 'ADV', label: 'ADVANCED' },
    { value: 'EXH', label: 'EXHAUST' },
    { value: 'MXM', label: 'MAXIMUM' },
    { value: 'INF', label: 'INFINITE' },
    { value: 'GRV', label: 'GRAVITY' },
    { value: 'HVN', label: 'HEAVENLY' },
    { value: 'VVD', label: 'VIVID' },
    { value: 'EXD', label: 'EXCEED' },
    { value: 'ULT', label: 'ULTIMATE' }
  ];

  useEffect(() => {
    if (isOpen) {
      loadMaxSongIdx();
    }
  }, [isOpen]);

  const loadMaxSongIdx = async () => {
    try {
      const data = await apiService.getMaxSongIdx();
      setMaxSongIdx(data.maxSongIdx);
    } catch (err) {
      console.error('최대 곡 ID 로딩 실패:', err);
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    // 기본 정보 검증
    if (!formData.songid.trim()) {
      errors.push('곡 ID를 입력해주세요.');
    }
    if (!formData.title.trim()) {
      errors.push('곡 제목을 입력해주세요.');
    }
    if (!formData.artist.trim()) {
      errors.push('아티스트를 입력해주세요.');
    }
    if (!formData.version.trim()) {
      errors.push('버전을 입력해주세요.');
    }

    // 차트 검증
    if (formData.difficulties.length === 0) {
      errors.push('최소 하나의 차트를 추가해주세요.');
    }

    formData.difficulties.forEach((difficulty, index) => {
      if (!difficulty.type) {
        errors.push(`${index + 1}번째 차트의 타입을 선택해주세요.`);
      }
      if (!difficulty.level || difficulty.level < 1) {
        errors.push(`${index + 1}번째 차트의 레벨을 입력해주세요.`);
      }
      if (difficulty.level > 20) {
        errors.push(`${index + 1}번째 차트의 레벨은 20 이하여야 합니다.`);
      }
    });

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검증
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    // 최종 확인 단계로 이동
    setIsAnimating(true);
    setTimeout(() => {
      setShowConfirmation(true);
      setIsAnimating(false);
    }, 300);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 차트 타입을 API 형식으로 변환
      const convertedFormData = {
        ...formData,
        difficulties: formData.difficulties.map(difficulty => ({
          ...difficulty,
          type: getTypeCode(difficulty.type)
        }))
      };

      // API 호출 시도
      await apiService.addNewSong(convertedFormData);
      
      // 곡 추가 성공 후 차트 메타데이터 캐시 갱신
      await apiService.refreshChartMetaCache();
      
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('곡 추가 실패:', err);
      
      // 에러 타입에 따른 메시지 처리
      if (err.message?.includes('500')) {
        setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      } else if (err.message?.includes('400')) {
        setError('잘못된 요청입니다. 입력 정보를 확인해주세요.');
      } else if (err.message?.includes('401')) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else {
        setError('곡 추가에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setIsAnimating(false);
    }, 300);
  };

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleAddDifficulty = () => {
    // 차트 유효성 검증
    if (!newDifficulty.type) {
      setError('차트 타입을 선택해주세요.');
      return;
    }
    if (!newDifficulty.level || newDifficulty.level < 1) {
      setError('차트 레벨을 입력해주세요. (1-20)');
      return;
    }
    if (newDifficulty.level > 20) {
      setError('차트 레벨은 20 이하여야 합니다.');
      return;
    }

    if (editingDifficultyIndex !== null) {
      // 기존 차트 수정
      setFormData(prev => ({
        ...prev,
        difficulties: prev.difficulties.map((diff, index) => 
          index === editingDifficultyIndex ? { ...newDifficulty } : diff
        )
      }));
      setEditingDifficultyIndex(null);
    } else {
      // 새 차트 추가
      setFormData(prev => ({
        ...prev,
        difficulties: [...prev.difficulties, { ...newDifficulty }]
      }));
    }

    // 폼 초기화
    setNewDifficulty({
      level: 1,
      type: '',
      effectorName: '',
      illustratorName: '',
      max_exscore: '',
      radar: {
        notes: 0,
        peak: 0,
        tsumami: 0,
        tricky: 0,
        handtrip: 0,
        onehand: 0
      } as RadarDto,
      max_chain: '',
      chip_count: '',
      hold_count: '',
      tsumami_count: ''
    });
    setShowAddDifficulty(false);
    setError(''); // 에러 메시지 초기화
  };

  const handleRemoveDifficulty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      difficulties: prev.difficulties.filter((_, i) => i !== index)
    }));
  };

  const handleEditDifficulty = (index: number) => {
    const difficulty = formData.difficulties[index];
    setNewDifficulty(difficulty);
    setEditingDifficultyIndex(index);
    setShowAddDifficulty(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingDifficultyIndex(null);
    setShowAddDifficulty(false);
    setNewDifficulty({
      level: 1,
      type: '',
      effectorName: '',
      illustratorName: '',
      max_exscore: '',
      radar: {
        notes: 0,
        peak: 0,
        tsumami: 0,
        tricky: 0,
        handtrip: 0,
        onehand: 0
      } as RadarDto,
      max_chain: '',
      chip_count: '',
      hold_count: '',
      tsumami_count: ''
    });
    setError('');
  };

  const handleDifficultyChange = (field: keyof DifficultyDto, value: any) => {
    setNewDifficulty(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRadarChange = (field: keyof RadarDto, value: number) => {
    setNewDifficulty(prev => ({
      ...prev,
      radar: {
        ...prev.radar,
        [field]: value
      } as RadarDto
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-6xl h-[90vh] flex">
        {/* 폼 섹션 */}
        <div className={`bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out ${
          showConfirmation ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        } ${isAnimating ? 'pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">곡 추가</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">새로운 곡을 추가합니다</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                곡 ID *
                {maxSongIdx !== null && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                    (현재 최대: {maxSongIdx})
                  </span>
                )}
              </label>
              <input
                type="text"
                value={formData.songid}
                onChange={(e) => setFormData(prev => ({ ...prev, songid: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
                placeholder="예: SONG001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                버전 *
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              아티스트 *
            </label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                BPM
              </label>
              <input
                type="text"
                value={formData.bpm}
                onChange={(e) => setFormData(prev => ({ ...prev, bpm: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                발매일
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* 장르 선택 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              장르
            </label>
            <div className="grid grid-cols-3 gap-2">
              {predefinedGenres.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    formData.genres.includes(genre)
                      ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* 차트 추가 섹션 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                차트 추가 ({formData.difficulties.length}개)
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDifficulty(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-colors"
              >
                + 차트 추가
              </button>
            </div>

            {/* 추가된 차트 목록 */}
            {formData.difficulties.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.difficulties.map((difficulty, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div 
                      className="flex items-center space-x-4 flex-1 cursor-pointer"
                      onClick={() => handleEditDifficulty(index)}
                    >
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {difficulty.type}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        레벨 {difficulty.level}
                      </span>
                      {difficulty.effectorName && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {difficulty.effectorName}
                        </span>
                      )}
                      <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
                        클릭하여 수정
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditDifficulty(index)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDifficulty(index)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 차트 추가/수정 폼 */}
            {showAddDifficulty && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                <h4 className="text-md font-medium text-slate-900 dark:text-slate-100 mb-4">
                  {editingDifficultyIndex !== null ? '차트 수정' : '새 차트 추가'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      차트 타입 *
                    </label>
                    <select
                      value={newDifficulty.type}
                      onChange={(e) => handleDifficultyChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                      required
                    >
                      <option value="">선택하세요</option>
                      {chartTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label} ({type.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      레벨 *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newDifficulty.level}
                      onChange={(e) => handleDifficultyChange('level', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      이펙터
                    </label>
                    <input
                      type="text"
                      value={newDifficulty.effectorName}
                      onChange={(e) => handleDifficultyChange('effectorName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      일러스트레이터
                    </label>
                    <input
                      type="text"
                      value={newDifficulty.illustratorName}
                      onChange={(e) => handleDifficultyChange('illustratorName', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      최대 EX 스코어
                    </label>
                    <input
                      type="text"
                      value={newDifficulty.max_exscore}
                      onChange={(e) => handleDifficultyChange('max_exscore', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      최대 체인
                    </label>
                    <input
                      type="text"
                      value={newDifficulty.max_chain}
                      onChange={(e) => handleDifficultyChange('max_chain', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      칩 카운트
                    </label>
                    <input
                      type="text"
                      value={newDifficulty.chip_count}
                      onChange={(e) => handleDifficultyChange('chip_count', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      홀드 카운트
                    </label>
                    <input
                      type="text"
                      value={newDifficulty.hold_count}
                      onChange={(e) => handleDifficultyChange('hold_count', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      츠나미 카운트
                    </label>
                    <input
                      type="text"
                      value={newDifficulty.tsumami_count}
                      onChange={(e) => handleDifficultyChange('tsumami_count', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* 레이더 차트 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    레이더 차트
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'notes', label: '노트' },
                      { key: 'peak', label: '피크' },
                      { key: 'tsumami', label: '츠나미' },
                      { key: 'tricky', label: '트리키' },
                      { key: 'handtrip', label: '핸드트립' },
                      { key: 'onehand', label: '원핸드' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                          {label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={newDifficulty.radar[key as keyof RadarDto]}
                          onChange={(e) => handleRadarChange(key as keyof RadarDto, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 차트 추가 폼 에러 메시지 */}
                {error && showAddDifficulty && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleAddDifficulty}
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-lg transition-colors"
                  >
                    {editingDifficultyIndex !== null ? '차트 수정' : '차트 추가'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-1">입력 오류</p>
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isLoading ? '추가 중...' : '곡 추가'}
            </button>
          </div>
        </form>
        </div>

        {/* 최종 확인 섹션 */}
        <div className={`bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out ${
          showConfirmation ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        } ${isAnimating ? 'pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">최종 확인</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">입력하신 정보를 확인해주세요</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* JSON 데이터 미리보기 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              API에 전송될 데이터
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {JSON.stringify({
                  ...formData,
                  difficulties: formData.difficulties.map(difficulty => ({
                    ...difficulty,
                    type: getTypeCode(difficulty.type)
                  }))
                }, null, 2)}
              </pre>
            </div>
          </div>

          {/* 확인 메시지 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                위의 정보로 곡을 추가하시겠습니까?
              </p>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleBackToForm}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              ← 수정하기
            </button>
            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {isLoading ? '추가 중...' : '✓ 곡 추가하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSongModal;
