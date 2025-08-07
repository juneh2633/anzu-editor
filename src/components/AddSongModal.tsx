'use client';

import React, { useState } from 'react';
import { NewSongDto, DifficultyDto, RadarDto, ChartTypeCode } from '@/types/api';
import { apiService } from '@/services/api';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddSongModal: React.FC<AddSongModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // 미리 정의된 장르 목록
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

  const [maxSongIdx, setMaxSongIdx] = useState<number>(0);
  const [existingSongIds, setExistingSongIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [songIdError, setSongIdError] = useState<string>('');
  const [isVariableBpm, setIsVariableBpm] = useState(false);
  const [bpmInput, setBpmInput] = useState('');
  const [minBpm, setMinBpm] = useState('');
  const [maxBpm, setMaxBpm] = useState('');

  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyDto>({
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
      onehand: 0,
    },
    max_chain: '',
    chip_count: '',
    hold_count: '',
    tsumami_count: '',
  });

  // 모달이 열릴 때 최대 songIdx와 기존 songId 목록을 가져옴
  React.useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      // 최대 songIdx 가져오기
      const maxIdx = await apiService.getMaxSongIdx();
      setMaxSongIdx(maxIdx);
      
      // 기존 songId 목록 가져오기 (chart-meta API 사용)
      const chartMeta = await apiService.getChartMeta();
      const existingIds = chartMeta.chartData.map(song => song.songIdx.toString());
      setExistingSongIds(existingIds);
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof NewSongDto, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // songid가 변경될 때 중복 검사
    if (field === 'songid') {
      validateSongId(value as string);
    }
  };

  const handleBpmChange = (value: string) => {
    setBpmInput(value);
    setFormData(prev => ({ ...prev, bpm: value }));
  };

  const handleMinBpmChange = (value: string) => {
    setMinBpm(value);
    if (maxBpm) {
      // 하이픈으로 연결: "141-176" 형식으로 변환
      setFormData(prev => ({ ...prev, bpm: `${value}-${maxBpm}` }));
    }
  };

  const handleMaxBpmChange = (value: string) => {
    setMaxBpm(value);
    if (minBpm) {
      // 하이픈으로 연결: "141-176" 형식으로 변환
      setFormData(prev => ({ ...prev, bpm: `${minBpm}-${value}` }));
    }
  };

  const validateSongId = (songId: string) => {
    if (!songId) {
      setSongIdError('');
      return;
    }

    // 숫자가 아닌 경우
    if (!/^\d+$/.test(songId)) {
      setSongIdError('Song ID는 숫자만 입력 가능합니다.');
      return;
    }

    const songIdNum = parseInt(songId);
    
    // 최소 songIdx보다 작은 경우
    if (songIdNum <= maxSongIdx) {
      setSongIdError(`Song ID는 ${maxSongIdx + 1}보다 큰 숫자여야 합니다.`);
      return;
    }

    // 이미 존재하는 songId인 경우
    if (existingSongIds.includes(songId)) {
      setSongIdError('이미 존재하는 Song ID입니다.');
      return;
    }

    setSongIdError('');
  };

  const handleDifficultyChange = (field: keyof DifficultyDto, value: string | number) => {
    setCurrentDifficulty(prev => ({ ...prev, [field]: value }));
  };

  const handleRadarChange = (field: keyof RadarDto, value: number) => {
    setCurrentDifficulty(prev => ({
      ...prev,
      radar: { ...prev.radar, [field]: value }
    }));
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const addDifficulty = () => {
    if (currentDifficulty.type && currentDifficulty.effectorName && currentDifficulty.illustratorName) {
      setFormData(prev => ({
        ...prev,
        difficulties: [...prev.difficulties, { ...currentDifficulty }]
      }));
      setCurrentDifficulty({
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
          onehand: 0,
        },
        max_chain: '',
        chip_count: '',
        hold_count: '',
        tsumami_count: '',
      });
    }
  };

  // 변속곡 체크박스 변경 시 BPM 입력값 초기화
  const handleVariableBpmChange = (checked: boolean) => {
    setIsVariableBpm(checked);
    setBpmInput('');
    setMinBpm('');
    setMaxBpm('');
    setFormData(prev => ({ ...prev, bpm: '' }));
  };

  const removeDifficulty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      difficulties: prev.difficulties.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // songId 유효성 검사
    if (songIdError) {
      alert('Song ID를 올바르게 입력해주세요.');
      return;
    }

    // 최소 하나의 난이도가 필요
    if (formData.difficulties.length === 0) {
      alert('최소 하나의 난이도를 추가해주세요.');
      return;
    }

    try {
      await apiService.addNewSong(formData);
      onSuccess?.();
      onClose();
      // 폼 초기화
      setFormData({
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
      setSongIdError('');
      setBpmInput('');
      setMinBpm('');
      setMaxBpm('');
      setIsVariableBpm(false);
    } catch (error) {
      console.error('곡 추가 실패:', error);
      alert('곡 추가에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">새 곡 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
                     {/* 기본 정보 */}
                       <div className="grid grid-cols-1 gap-4">
             <div>
               <label className="block text-sm font-medium mb-1">
                 Song ID {isLoading ? '(로딩 중...)' : `(최소: ${maxSongIdx + 1})`}
               </label>
               <input
                 type="text"
                 value={formData.songid}
                 onChange={(e) => handleInputChange('songid', e.target.value)}
                 className={`w-full p-2 border rounded ${songIdError ? 'border-red-500' : ''}`}
                 placeholder={`최소 ${maxSongIdx + 1} 이상의 숫자`}
                 required
                 disabled={isLoading}
               />
               {songIdError && (
                 <p className="text-red-500 text-sm mt-1">{songIdError}</p>
               )}
             </div>
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
                         <div>
               <label className="block text-sm font-medium mb-1">아티스트</label>
               <input
                 type="text"
                 value={formData.artist}
                 onChange={(e) => handleInputChange('artist', e.target.value)}
                 className="w-full p-2 border rounded"
                 required
               />
             </div>
            <div>
              <label className="block text-sm font-medium mb-1">버전</label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => handleInputChange('version', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
                                       <div>
                <label className="block text-sm font-medium mb-1">BPM</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {isVariableBpm ? (
                      <>
                        <input
                          type="number"
                          value={minBpm}
                          onChange={(e) => handleMinBpmChange(e.target.value)}
                          className="flex-1 p-2 border rounded"
                          placeholder="141"
                          min="1"
                          required
                        />
                        {/* 하이픈으로 연결되는 부분을 시각적으로 표시 */}
                       <span className="flex items-center text-gray-500">~</span>
                        <input
                          type="number"
                          value={maxBpm}
                          onChange={(e) => handleMaxBpmChange(e.target.value)}
                          className="flex-1 p-2 border rounded"
                          placeholder="176"
                          min="1"
                          required
                        />
                      </>
                    ) : (
                      <input
                        type="text"
                        value={bpmInput}
                        onChange={(e) => handleBpmChange(e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder="150"
                        required
                      />
                    )}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isVariableBpm}
                        onChange={(e) => handleVariableBpmChange(e.target.checked)}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium">변속곡</label>
                    </div>
                  </div>
                                     {isVariableBpm && (
                     <p className="text-sm text-gray-500">
                       {/* 하이픈으로 연결: 최소 BPM과 최대 BPM을 입력하세요 (예: 141 ~ 176) */}
                       최소 BPM과 최대 BPM을 입력하세요 (예: 141 ~ 176)
                     </p>
                   )}
                </div>
              </div>
             <div>
               <label className="block text-sm font-medium mb-1">날짜</label>
               <input
                 type="date"
                 value={formData.date}
                 onChange={(e) => handleInputChange('date', e.target.value)}
                 className="w-full p-2 border rounded"
                 required
               />
             </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.eac_exc}
                onChange={(e) => handleInputChange('eac_exc', e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm font-medium">EAC/EXC</label>
            </div>
          </div>

          {/* 장르 */}
          <div>
            <label className="block text-sm font-medium mb-1">장르 (여러 개 선택 가능)</label>
            <div className="grid grid-cols-3 gap-3">
              {predefinedGenres.map((genre) => (
                <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-900 dark:text-gray-100">{genre}</span>
                </label>
              ))}
            </div>
            {formData.genres.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">선택된 장르:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 난이도 추가 */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">난이도 추가</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">레벨</label>
                <input
                  type="number"
                  value={currentDifficulty.level}
                  onChange={(e) => handleDifficultyChange('level', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="1"
                />
              </div>
                                             <div>
                  <label className="block text-sm font-medium mb-1">타입</label>
                  <select
                    value={currentDifficulty.type}
                    onChange={(e) => handleDifficultyChange('type', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">타입 선택</option>
                    <option value={ChartTypeCode.novice}>NOVICE</option>
                    <option value={ChartTypeCode.advanced}>ADVANCED</option>
                    <option value={ChartTypeCode.exhaust}>EXHAUST</option>
                    <option value={ChartTypeCode.maximum}>MAXIMUM</option>
                    <option value={ChartTypeCode.infinite}>INFINITE</option>
                    <option value={ChartTypeCode.gravity}>GRAVITY</option>
                    <option value={ChartTypeCode.heavenly}>HEAVENLY</option>
                    <option value={ChartTypeCode.vivid}>VIVID</option>
                    <option value={ChartTypeCode.exceed}>EXCEED</option>
                    <option value={ChartTypeCode.ultimate}>ULTIMATE</option>
                  </select>
                </div>
              <div>
                <label className="block text-sm font-medium mb-1">이펙터</label>
                <input
                  type="text"
                  value={currentDifficulty.effectorName}
                  onChange={(e) => handleDifficultyChange('effectorName', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">일러스트레이터</label>
                <input
                  type="text"
                  value={currentDifficulty.illustratorName}
                  onChange={(e) => handleDifficultyChange('illustratorName', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">최대 점수</label>
                <input
                  type="text"
                  value={currentDifficulty.max_exscore}
                  onChange={(e) => handleDifficultyChange('max_exscore', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">최대 체인</label>
                <input
                  type="text"
                  value={currentDifficulty.max_chain}
                  onChange={(e) => handleDifficultyChange('max_chain', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">칩 카운트</label>
                <input
                  type="text"
                  value={currentDifficulty.chip_count}
                  onChange={(e) => handleDifficultyChange('chip_count', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">홀드 카운트</label>
                <input
                  type="text"
                  value={currentDifficulty.hold_count}
                  onChange={(e) => handleDifficultyChange('hold_count', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">츠나미 카운트</label>
                <input
                  type="text"
                  value={currentDifficulty.tsumami_count}
                  onChange={(e) => handleDifficultyChange('tsumami_count', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
            </div>

            {/* 레이더 차트 */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">레이더 차트</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(currentDifficulty.radar).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleRadarChange(key as keyof RadarDto, parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                      min="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={addDifficulty}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              난이도 추가
            </button>
          </div>

          {/* 추가된 난이도 목록 */}
          {formData.difficulties.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">추가된 난이도</h3>
              <div className="space-y-2">
                {formData.difficulties.map((diff, index) => (
                  <div key={index} className="p-3 border rounded flex justify-between items-center">
                    <span>{diff.type} Lv.{diff.level} - {diff.effectorName}</span>
                    <button
                      type="button"
                      onClick={() => removeDifficulty(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              취소
            </button>
                         <button
               type="submit"
               className={`px-4 py-2 rounded ${
                 songIdError || formData.difficulties.length === 0 || isLoading
                   ? 'bg-gray-400 cursor-not-allowed'
                   : 'bg-blue-500 hover:bg-blue-600'
               } text-white`}
               disabled={!!songIdError || formData.difficulties.length === 0 || isLoading}
             >
               곡 추가
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSongModal;
