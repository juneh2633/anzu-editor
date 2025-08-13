import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',   // 권장(서버에 빌드 산출물만 배포 가능)
  basePath: '/homepage',  // 모든 경로가 /homepage를 prefix로 가짐
  
  // 프로덕션 빌드 시에만 타입/린트 오류 무시 (빌드 속도 향상)
  ...(process.env.NODE_ENV === 'production' && {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
  }),
};

export default nextConfig;
