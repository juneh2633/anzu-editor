'use client';

import React, { useState, useEffect } from 'react';
import { UpdateChartDto, ChartTypeCode, ChartData, SongData } from '@/types/api';
import { apiService } from '@/services/api';

interface EditChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ChartOption {
  chartIdx: number;
  songIdx: number;
  title: string;
  artist: string;
  level: number;
  type: string;
  effectorName: string;
  illustratorName: string;
  radar: {
    notes: number;
    peak: number;
    tsumami: number;
    tricky: number;
    handtrip: number;
    onehand: number;
  };
}

const EditChartModal: React.FC<EditChartModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedChart, setSelectedChart] = useState<ChartOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartOptions, setChartOptions] = useState<ChartOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [chartData, setChartData] = useState<UpdateChartDto>({
    chartIdx: 0,
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
            chartIdx: chart.chartIdx,
            songIdx: song.songIdx,
            title: song.title,
            artist: song.artist,
            level: chart.level,
            type: chart.type,
            effectorName: chart.effector,
            illustratorName: chart.illustrator,
            radar: chart.radar,
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

  const handleChartSelect = (chart: ChartOption) => {
    setSelectedChart(chart);
    setChartData({
      chartIdx: chart.chartIdx,
      songIdx: chart.songIdx,
      level: chart.level,
      type: chart.type,
      effectorName: chart.effectorName,
      illustratorName: chart.illustratorName,
      radar: chart.radar,
    });
  };

  const handleInputChange = (field: keyof UpdateChartDto, value: string | number) => {
    setChartData(prev => ({ ...prev, [field]: value }));
  };

  const handleRadarChange = (field: keyof UpdateChartDto['radar'], value: number) => {
    setChartData(prev => ({
      ...prev,
      radar: { ...prev.radar, [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChart) {
      alert('차트를 선택해주세요.');
      return;
    }

    if (!chartData.type || !chartData.effectorName || !chartData.illustratorName) {
      alert('모든 필수 필드를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.updateChart(chartData);
      onSuccess?.();
      onClose();
      
      // 폼 초기화
      setSelectedChart(null);
      setChartData({
        chartIdx: 0,
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
      console.error('차트 수정 실패:', error);
      alert('차트 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChartOptions = chartOptions.filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.chartIdx.toString().includes(searchTerm) ||
    option.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">차트 수정</h2>
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
              placeholder="곡 제목, 아티스트, Chart ID, 또는 타입으로 검색"
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
                {filteredChartOptions.map((option) => (
                  <div
                    key={option.chartIdx}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedChart?.chartIdx === option.chartIdx
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : ''
                    }`}
                    onClick={() => handleChartSelect(option)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{option.title}</div>
                        <div className="text-sm text-gray-600">{option.artist}</div>
                        <div className="text-xs text-gray-500">
                          Chart ID: {option.chartIdx} | Song ID: {option.songIdx} | {option.type.toUpperCase()} {option.level}
                        </div>
                      </div>
                      {selectedChart?.chartIdx === option.chartIdx && (
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
                <div><strong>Chart ID:</strong> {selectedChart.chartIdx}</div>
                <div><strong>Song ID:</strong> {selectedChart.songIdx}</div>
                <div><strong>타입:</strong> {selectedChart.type.toUpperCase()} {selectedChart.level}</div>
              </div>
            </div>
          )}

          {/* 차트 정보 수정 */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">차트 정보 수정</h3>
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
                      onChange={(e) => handleRadarChange(key as keyof UpdateChartDto['radar'], parseFloat(e.target.value))}
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
                !selectedChart || !chartData.type || !chartData.effectorName || !chartData.illustratorName || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
              disabled={!selectedChart || !chartData.type || !chartData.effectorName || !chartData.illustratorName || isLoading}
            >
              {isLoading ? '수정 중...' : '차트 수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditChartModal;
