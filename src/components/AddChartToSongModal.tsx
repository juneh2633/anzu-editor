'use client';

import React, { useState, useEffect } from 'react';
import { NewChartDto, ChartTypeCode } from '@/types/api';
import { apiService } from '@/services/api';

interface AddChartToSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface SongOption {
  songIdx: number;
  title: string;
  artist: string;
  version: number;
}

const AddChartToSongModal: React.FC<AddChartToSongModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedSong, setSelectedSong] = useState<SongOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [songOptions, setSongOptions] = useState<SongOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [chartData, setChartData] = useState<NewChartDto>({
    songIdx: 0,
    level: 1,
    type: '',
    effectorName: '',
    illustratorName: '',
    radar: {
      notes: 0,
      peak: 0,
      tsumami: 0,
      tricky: 0,
      handtrip: 0,
      onehand: 0,
    },
  });

  // 모달이 열릴 때 곡 목록을 가져옴
  useEffect(() => {
    if (isOpen) {
      loadSongOptions();
    }
  }, [isOpen]);

  const loadSongOptions = async () => {
    try {
      setIsLoading(true);
      const chartMeta = await apiService.getChartMeta();
      
      const options: SongOption[] = chartMeta.chartData.map(song => ({
        songIdx: song.songIdx,
        title: song.title,
        artist: song.artist,
        version: song.version,
      }));
      
      setSongOptions(options);
    } catch (error) {
      console.error('곡 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongSelect = (song: SongOption) => {
    setSelectedSong(song);
    setChartData(prev => ({ ...prev, songIdx: song.songIdx }));
  };

  const handleInputChange = (field: keyof NewChartDto, value: string | number) => {
    setChartData(prev => ({ ...prev, [field]: value }));
  };

  const handleRadarChange = (field: keyof NewChartDto['radar'], value: number) => {
    setChartData(prev => ({
      ...prev,
      radar: { ...prev.radar, [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSong) {
      alert('곡을 선택해주세요.');
      return;
    }

    if (!chartData.type || !chartData.effectorName || !chartData.illustratorName) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.addNewChart(chartData);
      onSuccess?.();
      onClose();
      
      // 폼 초기화
      setSelectedSong(null);
      setChartData({
        songIdx: 0,
        level: 1,
        type: '',
        effectorName: '',
        illustratorName: '',
        radar: {
          notes: 0,
          peak: 0,
          tsumami: 0,
          tricky: 0,
          handtrip: 0,
          onehand: 0,
        },
      });
      setSearchTerm('');
    } catch (error) {
      console.error('차트 추가 실패:', error);
      alert('차트 추가에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSongOptions = songOptions.filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.songIdx.toString().includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">차트 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 곡 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">곡 검색</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="곡 제목, 아티스트, 또는 Song ID로 검색"
            />
          </div>

          {/* 곡 목록 */}
          <div className="max-h-60 overflow-y-auto border rounded">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">로딩 중...</div>
            ) : filteredSongOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? '검색 결과가 없습니다.' : '곡이 없습니다.'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredSongOptions.map((option) => (
                  <div
                    key={option.songIdx}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedSong?.songIdx === option.songIdx
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => handleSongSelect(option)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{option.title}</div>
                        <div className="text-sm text-gray-600">{option.artist}</div>
                        <div className="text-xs text-gray-500">
                          Song ID: {option.songIdx} | Version: {option.version}
                        </div>
                      </div>
                      {selectedSong?.songIdx === option.songIdx && (
                        <div className="text-blue-500">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 곡 표시 */}
          {selectedSong && (
            <div className="p-3 bg-blue-50 rounded border">
              <h4 className="font-medium mb-1">선택된 곡</h4>
              <div className="text-sm">
                <div><strong>제목:</strong> {selectedSong.title}</div>
                <div><strong>아티스트:</strong> {selectedSong.artist}</div>
                <div><strong>Song ID:</strong> {selectedSong.songIdx}</div>
                <div><strong>Version:</strong> {selectedSong.version}</div>
              </div>
            </div>
          )}

          {/* 차트 정보 입력 */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">차트 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">레벨</label>
                <input
                  type="number"
                  value={chartData.level}
                  onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">타입</label>
                <select
                  value={chartData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
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
                  value={chartData.effectorName}
                  onChange={(e) => handleInputChange('effectorName', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">일러스트레이터</label>
                <input
                  type="text"
                  value={chartData.illustratorName}
                  onChange={(e) => handleInputChange('illustratorName', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            {/* 레이더 차트 */}
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">레이더 차트</h4>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(chartData.radar).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleRadarChange(key as keyof NewChartDto['radar'], parseFloat(e.target.value))}
                      className="w-full p-2 border rounded"
                      min="0"
                      step="0.1"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

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
                !selectedSong || !chartData.type || !chartData.effectorName || !chartData.illustratorName || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              disabled={!selectedSong || !chartData.type || !chartData.effectorName || !chartData.illustratorName || isLoading}
            >
              {isLoading ? '추가 중...' : '차트 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChartToSongModal;
