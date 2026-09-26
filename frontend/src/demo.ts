import type { Notice, Question } from './types'

export const exampleInput = '저는 32살이고 내년에 결혼할 예정이에요. 서울이나 경기에서 둘이 살 집을 찾고 있어요. 1억 원 정도 있어요.'

export const questions: Question[] = [
  {
    id: 'money', label: '금액의 의미',
    title: '말씀하신 1억 원은 어떤 금액인가요?',
    description: '보유 자산과 집에 사용할 예산은 달라요. 어떤 의미인지 알려주세요.',
    options: [
      { value: 'asset', label: '보유한 자산이에요', description: '현재 가지고 있는 자산의 금액' },
      { value: 'budget', label: '집에 쓸 수 있는 예산이에요', description: '보증금 등 주거비로 사용할 금액' },
      { value: 'unknown', label: '아직 정확히 모르겠어요', description: '미확인으로 두고 다음으로 진행' },
    ],
  },
  {
    id: 'region', label: '희망 지역',
    title: '어느 지역에서 새 출발하고 싶으세요?',
    description: '시연에서는 서울과 경기의 가상 공고를 살펴볼 수 있어요.',
    options: [
      { value: 'all', label: '서울과 경기 모두 좋아요', description: '두 지역의 예시 공고를 함께 보기' },
      { value: 'seoul', label: '서울에서 찾고 있어요', description: '서울의 예시 공고 보기' },
      { value: 'gyeonggi', label: '경기에서 찾고 있어요', description: '경기의 예시 공고 보기' },
    ],
  },
  {
    id: 'home', label: '주택 보유',
    title: '현재 본인 명의로 소유한 집이 있나요?',
    description: '본인 상태를 먼저 확인해요. 실제 서비스에서는 공고에 따라 가구원 정보도 확인해요.',
    options: [
      { value: 'none', label: '소유한 집이 없어요', description: '전세·월세에 살거나 가족과 함께 살아요' },
      { value: 'owned', label: '소유한 집이 있어요', description: '공고별 확인이 필요한 상태로 표시' },
      { value: 'unknown', label: '확인이 필요해요', description: '주택 보유 여부를 미확인으로 유지' },
    ],
  },
  {
    id: 'income', label: '소득 확인',
    title: '현재 본인의 연 소득을 알고 계신가요?',
    description: '지금은 입력 흐름만 확인해요. 실제 자격 판단에 쓰이는 소득 기준은 공고마다 달라요.',
    options: [
      { value: 'under', label: '3,000만 원 미만이에요', description: '시연용 소득 구간 선택' },
      { value: 'over', label: '3,000만 원 이상이에요', description: '시연용 소득 구간 선택' },
      { value: 'unknown', label: '정확한 금액은 확인이 필요해요', description: '미확인 상태로 결과 둘러보기' },
    ],
  },
]

const sharedDocuments: DocumentItemFactory = (prefix) => [
  { id: prefix + '-application', title: '입주 신청서', description: '신청서 항목과 준비 흐름을 보여주는 시연용 파일이에요.', timing: '실제 제출 시점은 공식 공고 확인', kind: 'sample' },
  { id: prefix + '-consent', title: '개인정보 수집·이용 동의서', description: '실제 제출용이 아닌 시연용 서식 안내예요.', timing: '실제 대상자·작성 요건은 공식 공고 확인', kind: 'sample' },
  { id: prefix + '-certificate', title: '주민등록 관련 증명서', description: '정부24 홈페이지에서 발급 서비스를 확인할 수 있어요.', timing: '증명서 종류·발급일 요건은 공식 공고 확인', kind: 'website' },
]
type DocumentItemFactory = (prefix: string) => Notice['documents']

export const notices: Notice[] = [
  { id: 'seoul-1', title: '서울 마포 행복주택', subtitle: '함께 시작하는 두 사람을 위한 보금자리', region: 'seoul', type: '행복주택', area: '전용 36㎡', deposit: '6,800만 원', rent: '월 28만 원', tone: 'sage', documents: sharedDocuments('seoul-1') },
  { id: 'gyeonggi-1', title: '경기 고양 신혼부부 매입임대', subtitle: '생활의 여유가 있는 새로운 시작', region: 'gyeonggi', type: '매입임대', area: '전용 46㎡', deposit: '4,200만 원', rent: '월 32만 원', tone: 'sand', documents: sharedDocuments('gyeonggi-1') },
  { id: 'seoul-2', title: '서울 은평 청년안심주택', subtitle: '내 일상과 가까운 곳에서 찾는 집', region: 'seoul', type: '청년안심주택', area: '전용 29㎡', deposit: '5,500만 원', rent: '월 35만 원', tone: 'blue', documents: sharedDocuments('seoul-2') },
]

export function answerLabel(id: string, value?: string) {
  return questions.find((question) => question.id === id)?.options.find((option) => option.value === value)?.label ?? '확인 전'
}
