export interface NoticeResponse {
  id: string
  title: string
  agency: string
  region: string
  source_url: string
  published_on: string | null
  application_starts_at: string | null
  application_ends_at: string | null
  reviewed: boolean
  housing_units: HousingUnitResponse[]
}

export interface RentOptionResponse {
  label: string
  deposit_won: number | null
  monthly_rent_won: number | null
  conditions_note: string | null
  source_ref: string | null
}

export interface HousingUnitResponse {
  id: string
  name: string
  address: string | null
  exclusive_area_m2: number | null
  rent_options: RentOptionResponse[]
}


export async function getNotices(): Promise<NoticeResponse[]> {
  const response = await fetch('/api/notices', {
    signal: AbortSignal.timeout(5000),
  })

  if (!response.ok) {
    throw new Error(`공고 조회 실패: ${response.status}`)
  }

  return response.json()
}

export async function checkBackend() {
  const response = await fetch('/api/health', {
    signal: AbortSignal.timeout(5000),
  })

  if (!response.ok) {
    throw new Error(`서버 응답 오류: ${response.status}`)
  }

  const data = await response.json()

  if (data.status !== 'ok') {
    throw new Error('예상하지 못한 서버 응답입니다.')
  }

  return data
}