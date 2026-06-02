# Sephia Chord

모바일에서 혼자 쓰는 개인 일정관리/할일/루틴 웹앱입니다. 빨강, 파랑, 초록이 합쳐지는 세피아 톤과 하루의 흐름이 화음처럼 맞물린다는 의미를 담았습니다. 데이터는 Notion 데이터 소스 하나에 저장하고, Vercel 서버리스 API가 Notion API 토큰을 안전하게 보관합니다.

## 구조

```text
public/        모바일 웹 화면
api/auth.js    앱 비밀번호 인증
api/items.js   Notion CRUD API
api/health.js  배포 환경 확인
```

## 필요한 환경변수

`.env.example`을 참고해 로컬에서는 `.env.local`, Vercel에서는 Project Settings > Environment Variables에 넣습니다.

```text
APP_PASSWORD=4자리 숫자 PIN
SESSION_SECRET=긴 랜덤 문자열
NOTION_TOKEN=Notion internal integration token
NOTION_DATA_SOURCE_ID=372e8d7a-8351-806b-ab7c-000b31321073
NOTION_VERSION=2026-03-11
NOTION_TIME_ZONE_OFFSET=+09:00
```

Notion integration에는 사용하는 일정 DB 접근 권한을 공유해야 합니다.

## 로컬 실행

```bash
npm run dev
```

그 다음 `http://localhost:3000`으로 접속합니다.

## Vercel 배포

1. 이 폴더를 GitHub 저장소로 올립니다.
2. Vercel에서 해당 저장소를 Import합니다.
3. 환경변수를 추가합니다.
4. 배포 후 `/api/health`에서 환경변수 인식 여부를 확인합니다.

## 개인용 보안

- 로그인은 4자리 PIN을 사용합니다.
- PIN 3회 실패 시 10분 동안 같은 클라이언트의 로그인을 제한합니다.
- `robots.txt`와 `X-Robots-Tag`로 검색 노출을 막습니다.
- URL은 공개하지 않고 혼자만 사용하세요.

## 현재 구현 범위

- 앱 비밀번호 1개 인증
- Notion 데이터 소스 조회/추가/수정/삭제
- 일정: 날짜, 08:00-22:00 시간표, 30분 단위
- 할 일: 완료 체크, 우선순위, 카테고리
- 루틴: 요일 반복, 오늘 체크, 루틴기록 생성, 연속 달성 계산
- 월간 캘린더: 날짜별 항목 표시
- 감정 체크: 매일 22:00에 빨강/파랑/초록 5단계 색상 스와치와 코멘트 저장, 월간 캘린더 날짜 칸 색상 표시
- 입력 방식: 캘린더 날짜 탭/드래그로 일정 기간 추가, 시간표 칸 탭으로 할 일 추가, 시간표 칸 드래그로 시간 범위 일정 추가
- 하단 탭: 오늘, 캘린더, 감정, 루틴
