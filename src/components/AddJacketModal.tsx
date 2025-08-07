'use client';

import React, { useState, useEffect } from 'react';
import { SongIdxWithTypeDto } from '@/types/api';
import { apiService } from '@/services/api';

interface AddJacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ChartOption {
  songIdx: string;
  type: string;
  title: string;
  artist: string;
  level: number;
}

const AddJacketModal: React.FC<AddJacketModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedChart, setSelectedChart] = useState<ChartOption | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartOptions, setChartOptions] = useState<ChartOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 모달이 열릴 때 차트 목록을 가져옴
  useEffect(() => {
    if (isOpen) {
      loadChartOptions();
    }
  }, [isOpen]);

  const loadChartOptions = async () => {
    try {
      setIsLoading(true);
      const chartMeta = await apiService.getChartMeta();
      
      const options: ChartOption[] = [];
      chartMeta.chartData.forEach(song => {
        song.chart.forEach(chart => {
          options.push({
            songIdx: song.songIdx.toString(),
            type: chart.type,
            title: song.title,
            artist: song.artist,
            level: chart.level,
          });
        });
      });
      
      setChartOptions(options);
    } catch (error) {
      console.error('차트 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChart || !selectedFile) {
      alert('차트와 이미지 파일을 모두 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const songIdxWithType: SongIdxWithTypeDto = {
        songIdx: selectedChart.songIdx,
        type: selectedChart.type,
      };

      await apiService.uploadJacket(songIdxWithType, selectedFile);
      onSuccess?.();
      onClose();
      
      // 폼 초기화
      setSelectedChart(null);
      setSelectedFile(null);
      setSearchTerm('');
    } catch (error) {
      console.error('자켓 업로드 실패:', error);
      alert('자켓 업로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChartOptions = chartOptions.filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.songIdx.includes(searchTerm)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">자켓 업로드</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 차트 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">차트 검색</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="곡 제목, 아티스트, 또는 Song ID로 검색"
            />
          </div>

          {/* 차트 목록 */}
          <div className="max-h-60 overflow-y-auto border rounded">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">로딩 중...</div>
            ) : filteredChartOptions.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? '검색 결과가 없습니다.' : '차트가 없습니다.'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredChartOptions.map((option, index) => (
                  <div
                    key={`${option.songIdx}-${option.type}-${index}`}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedChart?.songIdx === option.songIdx && 
                      selectedChart?.type === option.type 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => setSelectedChart(option)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{option.title}</div>
                        <div className="text-sm text-gray-600">{option.artist}</div>
                        <div className="text-xs text-gray-500">
                          Song ID: {option.songIdx} | Type: {option.type} | Level: {option.level}
                        </div>
                      </div>
                      {selectedChart?.songIdx === option.songIdx && 
                       selectedChart?.type === option.type && (
                        <div className="text-blue-500">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 선택된 차트 표시 */}
          {selectedChart && (
            <div className="p-3 bg-blue-50 rounded border">
              <h4 className="font-medium mb-1">선택된 차트</h4>
              <div className="text-sm">
                <div><strong>제목:</strong> {selectedChart.title}</div>
                <div><strong>아티스트:</strong> {selectedChart.artist}</div>
                <div><strong>Song ID:</strong> {selectedChart.songIdx}</div>
                <div><strong>Type:</strong> {selectedChart.type}</div>
                <div><strong>Level:</strong> {selectedChart.level}</div>
              </div>
            </div>
          )}

          {/* 파일 선택 */}
          <div>
            <label className="block text-sm font-medium mb-2">자켓 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              required
            />
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-600">
                선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
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
                !selectedChart || !selectedFile || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              disabled={!selectedChart || !selectedFile || isLoading}
            >
              {isLoading ? '업로드 중...' : '자켓 업로드'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJacketModal;
