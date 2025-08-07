import { getApiBaseUrl } from '@/config/api';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 실제 서버로 요청을 전달 (API_BASE_URL을 실제 서버 URL로 변경하세요)
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/admin/songIdx`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: '최대 songIdx 조회에 실패했습니다.', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('최대 songIdx 조회 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
