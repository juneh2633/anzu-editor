import { ChartMetaResponse, TierPart, TierResponse, NewSongDto, SongIdxWithTypeDto, NewChartDto, UpdateChartDto, VersionResponse } from '@/types/api';
import { authService } from './auth';
import { getNextjsApiUrl, getNestjsApiUrl } from '@/config/api';

class ApiService {
  private getBaseURL(): string {
    // Next.js API 사용 (개발과 프로덕션 동일)
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
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${getNestjsApiUrl()}/chart/meta`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${getNestjsApiUrl()}/admin/song`, {
      method: 'POST',
      headers,
      body: JSON.stringify(songData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async getMaxSongIdx(): Promise<{ maxSongIdx: number }> {
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${getNestjsApiUrl()}/admin/songIdx`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async uploadJacket(songIdxWithType: SongIdxWithTypeDto, file: File): Promise<void> {
    try {
      const token = authService.getToken();
      const formData = new FormData();
      
      // 백엔드 스펙에 맞게 데이터 추가
      formData.append('songIdx', songIdxWithType.songIdx.toString());
      formData.append('type', songIdxWithType.type);
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
        if (response.status === 404) {
          throw new Error('자켓 업로드 API가 아직 구현되지 않았습니다. (404)');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error: any) {
      if (error.message?.includes('404')) {
        throw new Error('자켓 업로드 API가 아직 구현되지 않았습니다. (404)');
      }
      throw error;
    }
  }

  async addNewChart(chartData: NewChartDto): Promise<void> {
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${getNestjsApiUrl()}/admin/chart`, {
      method: 'POST',
      headers,
      body: JSON.stringify(chartData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async updateChart(chartIdx: number, chartData: UpdateChartDto): Promise<void> {
    const token = authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${getNestjsApiUrl()}/admin/chart/${chartIdx}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(chartData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  async getChartVersion(): Promise<VersionResponse> {
    return this.makeRequest<VersionResponse>('/chart/version');
  }

  async updateChartVersion(version: string): Promise<void> {
    await this.makeRequest<void>(`/chart/version?version=${encodeURIComponent(version)}`, {
      method: 'PUT',
    });
  }

  // 차트 메타데이터 캐시 갱신
  async refreshChartMetaCache(): Promise<void> {
    try {
      const token = authService.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${getNestjsApiUrl()}/chart/meta`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('차트 메타데이터 캐시가 성공적으로 갱신되었습니다.');
    } catch (error: any) {
      console.warn('차트 메타데이터 캐시 갱신 실패:', error.message);
      // 캐시 갱신 실패는 치명적이지 않으므로 에러를 던지지 않음
    }
  }

}

export const apiService = new ApiService();
