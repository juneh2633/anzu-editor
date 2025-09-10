import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone 설정 제거 - 일반적인 Next.js 서버 사용
  
  // basePath 제거 - 개발과 프로덕션 모두 동일하게 처리
  // basePath: '/homepage',  // 필요시 주석 해제하여 사용
  
  // 프로덕션 빌드 시에만 타입/린트 오류 무시 (빌드 속도 향상)
  ...(process.env.NODE_ENV === 'production' && {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
  }),
};

export default nextConfig;
