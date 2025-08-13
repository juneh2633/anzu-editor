import { ChartMetaResponse, TierPart, TierResponse, NewSongDto, SongIdxWithTypeDto, NewChartDto, UpdateChartDto, VersionResponse } from '@/types/api';
import { authService } from './auth';
import { getNextjsApiUrl } from '@/config/api';

class ApiService {
  private getBaseURL(): string {
    // Next.js API 경로 사용 (basePath 포함)
    return getNextjsApiUrl();
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.getBaseURL()}${endpoint}`, {
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
    
    // 백엔드 스펙에 맞게 데이터 추가
    // songIdx와 type은 body로 전송
    formData.append('songIdx', songIdxWithType.songIdx);
    formData.append('type', songIdxWithType.type);
    // 파일은 'image' 필드명으로 전송
    formData.append('image', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.getBaseURL()}/admin/jacket`, {
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

  async getChartVersion(): Promise<VersionResponse> {
    return this.makeRequest<VersionResponse>('/chart/version');
  }

  async updateChartVersion(version: string): Promise<void> {
    await this.makeRequest<void>(`/chart/version?version=${encodeURIComponent(version)}`, {
      method: 'PUT',
    });
  }
}

export const apiService = new ApiService();
