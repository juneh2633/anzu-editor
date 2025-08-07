import { ChartMetaResponse, TierPart, TierResponse, NewSongDto, SongIdxWithTypeDto, NewChartDto, UpdateChartDto } from '@/types/api';
import { authService } from './auth';

class ApiService {
  private baseURL = '/api'; // Use our Next.js API routes

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async getChartMeta(): Promise<ChartMetaResponse> {
    return this.makeRequest<ChartMetaResponse>('/chart-meta');
  }

  async getTierData(): Promise<TierResponse> {
    type BackendTierPart = {
      partInfo: {
        partIdx: number;
        partName: string;
        description: string;
      };
      tierList: TierPart['tierList'];
    };

    const response = await this.makeRequest<{ data: BackendTierPart[] }>('/tier-data');

    const normalized = response.data.map(({ partInfo, tierList }) => ({
      partIdx: partInfo.partIdx,
      partName: partInfo.partName,
      description: partInfo.description,
      tierList,
    }));

    return { data: normalized };
  }

  async updateTierData(tierPart: TierPart): Promise<void> {
    const payload = {
      partInfo: {
        partIdx: tierPart.partIdx,
        partName: tierPart.partName,
        description: tierPart.description,
      },
      tierList: tierPart.tierList.map(tier => ({
        tierIdx: tier.tierIdx,
        tier: tier.tier,
        chartList: tier.chartList.map(chart => ({
          chartIdx: chart.chartIdx,
          targetScore: chart.targetScore,
        })),
      })),
    };

    await this.makeRequest<void>('/tier-data', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async addNewSong(songData: NewSongDto): Promise<void> {
    await this.makeRequest<void>('/admin/song', {
      method: 'POST',
      body: JSON.stringify(songData),
    });
  }

  async getMaxSongIdx(): Promise<number> {
    const response = await this.makeRequest<{ maxSongIdx: number }>('/admin/songIdx');
    return response.maxSongIdx;
  }

  async uploadJacket(songIdxWithType: SongIdxWithTypeDto, file: File): Promise<void> {
    const token = authService.getToken();
    const formData = new FormData();
    
    // JSON 데이터를 문자열로 변환하여 추가
    formData.append('songIdx', songIdxWithType.songIdx);
    formData.append('type', songIdxWithType.type);
    formData.append('image', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}/admin/jacket`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async addNewChart(chartData: NewChartDto): Promise<void> {
    await this.makeRequest<void>('/admin/chart', {
      method: 'POST',
      body: JSON.stringify(chartData),
    });
  }

  async updateChart(chartData: UpdateChartDto): Promise<void> {
    await this.makeRequest<void>('/admin/chart', {
      method: 'PUT',
      body: JSON.stringify(chartData),
    });
  }
}

export const apiService = new ApiService();
