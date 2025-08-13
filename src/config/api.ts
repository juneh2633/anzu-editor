export const API_CONFIG = {
  development: {
    baseUrl: 'https://juneh2633.ddns.net',
  },
  production: {
    baseUrl: 'https://juneh2633.ddns.net', // NestJS 서버 (직접 API 호출용)
  },
};

export const getApiBaseUrl = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  // API 경로는 basePath와 관계없이 루트에서 시작
  if (typeof window !== 'undefined') {
    // 클라이언트 사이드: 현재 도메인 사용 (basePath 제외)
    // NestJS 서버는 같은 서버에서 실행되므로 현재 도메인 사용
    return window.location.origin;
  }
  
  return API_CONFIG[environment as keyof typeof API_CONFIG]?.baseUrl || API_CONFIG.development.baseUrl;
};

// Next.js API 경로를 위한 설정 (basePath 고려)
export const getNextjsApiUrl = () => {
  if (typeof window !== 'undefined') {
    // 클라이언트에서 Next.js API 호출 (basePath 포함)
    const basePath = '/homepage';
    return `${window.location.origin}${basePath}/api`;
  }
  
  // 서버사이드에서는 상대경로 사용
  return '/api';
};

// NestJS 서버의 직접 API 경로를 위한 설정
export const getNestjsApiUrl = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  if (environment === 'production') {
    // 프로덕션: 같은 서버의 NestJS (포트 3000)
    if (typeof window !== 'undefined') {
      // 클라이언트에서 직접 NestJS 서버 호출
      return `${window.location.origin}:3000`;
    }
  }
  
  // 개발: 외부 도메인 또는 localhost:3000
  return API_CONFIG[environment as keyof typeof API_CONFIG]?.baseUrl || 'http://localhost:3000';
}; 