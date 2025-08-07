import { NextRequest, NextResponse } from 'next/server';
import { NewSongDto } from '@/types/api';
import { getApiBaseUrl } from '@/config/api';

export async function POST(request: NextRequest) {
  try {
    const body: NewSongDto = await request.json();
    const baseUrl = getApiBaseUrl();
    // 실제 서버로 요청을 전달 (API_BASE_URL을 실제 서버 URL로 변경하세요)
    const response = await fetch(`${baseUrl}/admin/song`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: '곡 추가에 실패했습니다.', details: errorData },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: '곡이 성공적으로 추가되었습니다.' });
  } catch (error) {
    console.error('곡 추가 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
