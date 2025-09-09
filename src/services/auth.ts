import { LoginRequest, LoginResponse, LoginErrorResponse, UserInfo } from '@/types/api';
import { getNestjsApiUrl } from '@/config/api';

class AuthService {
  private baseURL = getNestjsApiUrl();

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('로그인 API 호출:', `${this.baseURL}/auth/login`);
    
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('로그인 API 응답 상태:', response.status, response.statusText);

    if (!response.ok) {
      // 응답이 JSON인지 확인
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData: LoginErrorResponse = await response.json();
          throw new Error(errorData.message || 'Login failed');
        } catch (jsonError) {
          throw new Error(`로그인 실패 (${response.status}): JSON 파싱 오류`);
        }
      } else {
        // HTML 응답인 경우
        const htmlText = await response.text();
        console.error('HTML 응답 받음:', htmlText.substring(0, 200));
        throw new Error(`로그인 실패 (${response.status}): 서버에서 HTML 응답을 반환했습니다. API 서버가 실행 중인지 확인해주세요.`);
      }
    }

    // 응답이 JSON인지 확인
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const htmlText = await response.text();
      console.error('예상치 못한 응답 형식:', htmlText.substring(0, 200));
      throw new Error('서버에서 JSON이 아닌 응답을 반환했습니다.');
    }

    try {
      const data: LoginResponse = await response.json();
      
      // 토큰을 로컬 스토리지에 저장
      localStorage.setItem('accessToken', data.accessToken);
      
      return data;
    } catch (jsonError) {
      console.error('JSON 파싱 오류:', jsonError);
      throw new Error('로그인 응답을 처리하는 중 오류가 발생했습니다.');
    }
  }

  async getUserInfo(): Promise<UserInfo | null> {
    const token = this.getToken();
    console.log('getUserInfo 호출됨, 토큰:', token ? '존재함' : '없음');
    
    if (!token) return null;

    try {
      // JWT 토큰에서 사용자 정보 파싱
      const userInfo = this.parseToken(token);
      if (userInfo) {
        console.log('토큰에서 파싱한 사용자 정보:', userInfo);
        // 사용자 정보를 로컬 스토리지에 저장
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('사용자 정보를 로컬 스토리지에 저장함');
        return userInfo;
      }

      // 토큰 파싱에 실패한 경우 API 호출 (fallback)
      console.log('토큰 파싱 실패, API 호출 시작:', `${this.baseURL}/account`);
      const response = await fetch(`${this.baseURL}/account`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
      });

      console.log('API 응답 상태:', response.status, response.statusText);

      if (!response.ok) {
        console.error('API 응답 실패:', response.status, response.statusText);
        return null;
      }

      const apiUserInfo: UserInfo = await response.json();
      console.log('API에서 받은 사용자 정보:', apiUserInfo);
      
      // 사용자 정보를 로컬 스토리지에 저장
      localStorage.setItem('userInfo', JSON.stringify(apiUserInfo));
      console.log('사용자 정보를 로컬 스토리지에 저장함');
      
      return apiUserInfo;
    } catch (error) {
      console.error('사용자 정보를 가져오는데 실패했습니다:', error);
      return null;
    }
  }

  private parseToken(token: string): UserInfo | null {
    try {
      // JWT 토큰은 header.payload.signature 형식
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('JWT 토큰 형식이 올바르지 않음');
        return null;
      }

      // payload 부분을 디코딩 (Base64)
      const payload = parts[1];
      const decodedPayload = atob(payload);
      const userData = JSON.parse(decodedPayload);
      
      console.log('토큰에서 파싱한 원본 데이터:', userData);
      
      // UserInfo 형식에 맞게 변환
      const userInfo: UserInfo = {
        id: userData.id || userData.sub || '',
        username: userData.username || userData.name || '',
        role: userData.role || '',
        rankIdx: userData.rankIdx || userData.rank_idx || 0,
        isAdmin: (userData.rankIdx === 2 || userData.rank_idx === 2)
      };
      
      return userInfo;
    } catch (error) {
      console.error('토큰 파싱 실패:', error);
      return null;
    }
  }

  getStoredUserInfo(): UserInfo | null {
    if (typeof window === 'undefined') return null;
    const userInfoStr = localStorage.getItem('userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  }

  isAdmin(): boolean {
    const userInfo = this.getStoredUserInfo();
    return userInfo?.rankIdx === 2;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', token);
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userInfo');
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    this.removeToken();
  }
}

export const authService = new AuthService(); 