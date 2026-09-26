# 누보 Nubo · 화면 프로토타입

React + TypeScript + Vite로 만든 주거지원 서비스 시연 화면입니다.

## 아키텍처

[시스템 아키텍처 및 워크플로 플로우차트](docs/architecture.md)에서 공고 준비, 사용자 입력, 추가 질문, 검색과 신청자료 제공 흐름을 볼 수 있습니다. 현재 구현과 향후 연결 범위도 구분해 두었습니다.

## 실행

```powershell
cd D:\Project\Nubo\frontend
pnpm.cmd install --frozen-lockfile
pnpm.cmd dev
```

터미널에 표시된 로컬 주소로 접속하세요.

프론트엔드 패키지 관리자는 pnpm 11.20.0으로 통일합니다. `package.json`의 `packageManager`와 `pnpm-lock.yaml`을 함께 관리합니다. Corepack이 설치된 환경에서는 `corepack.cmd pnpm --version`으로 지정된 버전을 확인할 수 있습니다. PowerShell에서는 실행 정책 오류를 피하도록 `.cmd` 명령을 사용합니다.

라이브러리 추가는 `pnpm.cmd add 패키지명`, 개발 도구 추가는 `pnpm.cmd add -D 패키지명`, 삭제는 `pnpm.cmd remove 패키지명`을 사용하세요. 의존성을 변경한 뒤에는 `package.json`과 `pnpm-lock.yaml`을 함께 커밋합니다. Python 백엔드의 가상환경과 의존성 관리는 별도입니다.

첫 화면은 로고와 입력창 중심으로 구성했습니다. Enter 또는 입력창 오른쪽 화살표로 진행하고, Shift+Enter로 줄바꿈합니다. 왼쪽 위 메뉴 버튼으로 사이드바를 열 수 있으며 닫기 버튼 / 바깥 영역 클릭 / Esc로 닫습니다.

브랜드 색상은 남색 `#18253D`, 파란색 `#4565E8`, 따뜻한 흰색 `#FAFAF7`입니다.

화면 진입 / 질문의 다음·이전 이동 / 공고 상세 펼침·접기에 전환 효과를 적용했습니다. 운영체제에서 동작 줄이기를 설정한 경우에는 애니메이션을 생략합니다.

## 화면 흐름

자연어 입력 → 금액 의미·희망 지역·주택 보유·소득 확인 → 공고 목록 → 공고별 신청자료 트리

PC 결과 화면은 왼쪽 공고 목록 / 오른쪽 선택한 공고 상세의 2열 구조입니다. 상세에서 금액·조건 / 신청서류 탭을 전환할 수 있습니다. 모바일에서는 목록과 상세를 한 화면씩 보여주며 ‘공고 목록으로’ 버튼으로 돌아갑니다.

공고 유형 필터, 관심 공고, 준비 상태 체크, 서식 예시 미리보기, TXT 다운로드를 지원합니다. 서류 준비 상태는 공고를 전환하거나 필터를 바꿔도 유지되며, 새로고침이나 ‘처음부터’로 초기화됩니다.

## 시연 범위

- 모든 공고명·금액·서류 구성은 하드코딩된 가상 정보입니다.
- 자연어 입력과 관계없이 32세·결혼 예정이라는 예시 프로필로 진행합니다.
- 희망 지역만 목록 필터에 반영되고, 나머지 답변은 화면 확인용입니다.
- 실제 16개 파라미터 정의가 없어 일부 예시 항목만 구현했습니다.
- Gemma·Jev·RAG·백엔드·DB는 연결하지 않았습니다.
- 실제 모집 여부, 자격, 순위, 대출 가능 여부를 판정하지 않습니다.
- 사용자 입력과 관심·체크 상태는 메모리에만 존재하며 새로고침하면 사라집니다.
- 다운로드 파일은 화면에서 생성한 시연용 TXT이며 실제 제출 서식이 아닙니다.
- 공식 링크는 LH 청약플러스·정부24 홈페이지이며 특정 공고나 발급 상세 페이지가 아닙니다.
- Google Fonts에서 Noto Sans KR을 불러옵니다. 실패하면 시스템 글꼴을 사용합니다.

## 폴더 구조

```text
Nubo/
├─ frontend/     React 화면 / package.json / pnpm-lock.yaml / Vite 설정
├─ backEnd/      Python 백엔드 (기존 폴더명 유지)
├─ docs/         공통 설계 문서
├─ .gitignore
└─ README.md
```

프론트엔드 명령은 `frontend` 폴더에서 실행합니다. `node_modules`와 `dist`도 이 폴더 안에 생성됩니다. 백엔드 가상환경과 실행 위치는 기존 `backEnd` 폴더 그대로입니다.

## 프론트엔드 파일 (`frontend/` 기준)

- src/App.tsx: 화면·상호작용
- src/HousingResults.tsx: 공고 목록 / 선택한 공고 상세 / 모바일 목록 복귀
- src/demo.ts: 질문·선택지·가상 공고
- src/types.ts: 데이터 타입
- src/index.css: 디자인·반응형 스타일
- src/HouseArt.tsx: 자체 제작 SVG 주택 일러스트
- src/Icons.tsx: 아이콘·로고

## 검증

```powershell
cd D:\Project\Nubo\frontend
pnpm.cmd build
pnpm.cmd lint
```

이후 별도 API 연결 계층을 추가해 시연 데이터를 실제 백엔드 응답으로 교체하세요. API 키는 프론트엔드에 넣지 않습니다.
