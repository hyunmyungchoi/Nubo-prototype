import { useEffect, useRef, useState } from 'react'
import { HouseArt } from './HouseArt'
import { Icon } from './Icons'
import type { Answers, DocumentItem, Notice } from './types'

interface HousingResultsProps {
  notices: Notice[]
  answers: Answers
  saved: string[]
  showSaved: boolean
  typeFilter: string
  checked: string[]
  onShowSaved: (value: boolean) => void
  onTypeFilter: (value: string) => void
  onToggleSaved: (id: string) => void
  onToggleDocument: (id: string) => void
  onOpenDocument: (notice: Notice, item: DocumentItem) => void
  onDownloadList: (notice: Notice) => void
}

const detailTabs = [
  { id: 'overview', label: '금액 / 조건', icon: 'home' },
  { id: 'documents', label: '신청서류', icon: 'file' },
] as const

export function HousingResults(props: HousingResultsProps) {
  const { notices, answers, saved, showSaved, typeFilter, checked } = props
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mobileDetail, setMobileDetail] = useState(false)
  const [detailTab, setDetailTab] = useState<'overview' | 'documents'>('overview')
  const detailHeadingRef = useRef<HTMLHeadingElement>(null)
  const listHeadingRef = useRef<HTMLHeadingElement>(null)
  const selectionButtons = useRef(new Map<string, HTMLButtonElement>())
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([])
  const activeNotice = notices.find((notice) => notice.id === selectedId) ?? notices[0]
  const activeId = activeNotice?.id
  const needsReview = Object.values(answers).includes('unknown') || answers.home === 'owned'
  const completedCount = activeNotice?.documents.filter((item) => checked.includes(item.id)).length ?? 0

  useEffect(() => {
    if (mobileDetail && activeId && window.matchMedia('(max-width: 800px)').matches) {
      detailHeadingRef.current?.focus({ preventScroll: true })
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [activeId, mobileDetail])

  function returnToList() {
    setMobileDetail(false)
    // Restore focus after the list becomes visible again on small screens.
    requestAnimationFrame(() => {
      const button = activeId ? selectionButtons.current.get(activeId) : null
      if (button) button.focus()
      else listHeadingRef.current?.focus()
    })
  }

  return <div className={'housing-results ' + (mobileDetail && activeNotice ? 'mobile-detail-open' : '')}>
    <section className="housing-list-pane" aria-label="공고 목록">
      <div className="housing-list-heading"><h2 ref={listHeadingRef} tabIndex={-1}>살펴볼 공고 <span>{notices.length}</span></h2><span>예시 공고</span></div>
      <div className="housing-list-controls">
        <div className="housing-list-toggle" aria-label="공고 범위"><button aria-pressed={!showSaved} onClick={() => props.onShowSaved(false)}>전체</button><button aria-pressed={showSaved} onClick={() => props.onShowSaved(true)}>관심 공고 <span>{saved.length}</span></button></div>
        <label className="housing-type-filter"><span className="sr-only">공고 유형</span><select value={typeFilter} onChange={(event) => props.onTypeFilter(event.target.value)}><option value="all">모든 유형</option><option value="행복주택">행복주택</option><option value="매입임대">매입임대</option><option value="청년안심주택">청년안심주택</option></select></label>
      </div>
      <div className="housing-list" aria-label="선택할 공고">
        {notices.map((notice) => <article key={notice.id} className={'housing-option ' + (notice.id === activeId ? 'is-selected' : '')}>
          <button className="housing-select" ref={(element) => { if (element) selectionButtons.current.set(notice.id, element); else selectionButtons.current.delete(notice.id) }} aria-label={notice.title + ' 상세 보기'} aria-pressed={notice.id === activeId} aria-controls="housing-detail" onClick={() => { setSelectedId(notice.id); setMobileDetail(true) }}>
            <span className="housing-option-meta"><span>{notice.type}</span><span>{notice.area}</span></span>
            <strong>{notice.title}</strong>
            <span className="housing-option-location"><Icon name="pin" size={12} />{notice.region === 'seoul' ? '서울특별시' : '경기도'}</span>
            <span className="housing-option-prices"><span><small>보증금</small>{notice.deposit}</span><span><small>임대료</small>{notice.rent}</span><Icon name="chevron" size={17} /></span>
          </button>
          <button className={'housing-save ' + (saved.includes(notice.id) ? 'is-saved' : '')} aria-label={notice.title + (saved.includes(notice.id) ? ' 관심 해제' : ' 관심 등록')} aria-pressed={saved.includes(notice.id)} onClick={() => props.onToggleSaved(notice.id)}><Icon name="bookmark" size={18} /></button>
        </article>)}
      </div>
      {notices.length === 0 && <div className="housing-list-empty"><Icon name={showSaved ? 'bookmark' : 'search'} size={27} /><h3>{showSaved && saved.length === 0 ? '아직 담아둔 공고가 없어요.' : '이 조건의 예시 공고가 없어요.'}</h3><p>필터를 바꾸거나 다른 공고를 살펴보세요.</p><button className="text-button" onClick={() => { props.onShowSaved(false); props.onTypeFilter('all') }}>전체 예시 공고 보기<Icon name="arrow" size={15} /></button></div>}
      <p className="housing-list-footnote"><Icon name="info" size={13} />표시된 공고와 금액은 모두 시연용이에요.</p>
    </section>

    <section id="housing-detail" className="housing-detail-pane" aria-label="선택한 공고 상세">
      {activeNotice ? <div key={activeNotice.id} className="housing-detail-content">
        <button className="mobile-list-back" onClick={returnToList}><Icon name="back" size={17} />공고 목록으로</button>
        <header className="housing-detail-heading">
          <div><span className="detail-kicker">선택한 공고 <span>화면 시안</span></span><h2 ref={detailHeadingRef} tabIndex={-1}>{activeNotice.title}</h2><p>{activeNotice.type} / {activeNotice.area} / {activeNotice.region === 'seoul' ? '서울특별시' : '경기도'}</p></div>
          <div className={'housing-detail-art ' + activeNotice.tone}><HouseArt small tone={activeNotice.tone} /></div>
        </header>
        <div className="housing-detail-tabs" role="tablist" aria-label="공고 상세 항목">
          {detailTabs.map((tab, index) => <button key={tab.id} ref={(element) => { tabButtons.current[index] = element }} role="tab" id={'housing-tab-' + tab.id} aria-selected={detailTab === tab.id} aria-controls={'housing-panel-' + tab.id} tabIndex={detailTab === tab.id ? 0 : -1} onClick={() => setDetailTab(tab.id)} onKeyDown={(event) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? detailTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + detailTabs.length) % detailTabs.length
            setDetailTab(detailTabs[nextIndex].id)
            tabButtons.current[nextIndex]?.focus()
          }}><Icon name={tab.icon} size={16} />{tab.label}{tab.id === 'documents' && <span>{activeNotice.documents.length}</span>}</button>)}
        </div>
        <div key={detailTab} id={'housing-panel-' + detailTab} className="housing-detail-body" role="tabpanel" aria-labelledby={'housing-tab-' + detailTab} tabIndex={0}>
          {detailTab === 'overview' ? <>
            <div className="housing-money"><div><span>보증금 예시</span><strong>{activeNotice.deposit}</strong></div><div><span>월 임대료 예시</span><strong>{activeNotice.rent}</strong></div></div>
            <div className="housing-facts"><div><Icon name="clock" size={17} /><span>모집 일정<strong>실제 일정 미연결</strong></span></div><div><Icon name="check" size={17} /><span>신청 자격 / 순위<strong>{needsReview ? '입력 정보 추가 확인 필요' : '공식 공고 확인 필요'}</strong></span></div></div>
            <section className="housing-next-step" aria-label="다음에 할 일"><div><span><Icon name="file" size={15} />다음에 할 일</span><strong>신청서류 {activeNotice.documents.length}가지를 확인하세요.</strong><p>서식 예시 / 발급 경로 / 준비 체크를 한곳에서.</p></div><button className="primary-button" onClick={() => { setDetailTab('documents'); tabButtons.current[1]?.focus() }}>신청서류 확인하기<Icon name="arrow" size={18} /></button></section>
            <div className="housing-loan-note"><span className="section-icon"><Icon name="home" size={19} /></span><div><h3>보증금 대출 정보</h3><p>상품 / 한도 / 금리는 아직 연결되지 않았어요.</p></div><span className="tag muted">준비 중</span></div>
          </> : <>
            <div className="housing-docs-heading"><div><h3>신청자료 준비하기</h3><p>준비한 서류는 체크해 두세요.</p></div><span className="housing-progress">{completedCount}<span> / {activeNotice.documents.length}</span></span></div>
            <div className="housing-docs-progress" role="progressbar" aria-label="서류 준비 현황" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={activeNotice.documents.length}><span style={{ width: `${completedCount / Math.max(activeNotice.documents.length, 1) * 100}%` }} /></div>
            <div className="housing-documents">{activeNotice.documents.map((doc) => <div className={'document-row ' + (checked.includes(doc.id) ? 'is-checked' : '')} key={doc.id}><label className="document-check"><input type="checkbox" checked={checked.includes(doc.id)} onChange={() => props.onToggleDocument(doc.id)} /><span className="sr-only">{doc.title} 준비 완료</span></label><span className="document-icon"><Icon name="file" size={19} /></span><div className="document-copy"><strong>{doc.title}</strong><span>{doc.timing}</span></div>{doc.kind === 'sample' ? <button className="document-action" onClick={() => props.onOpenDocument(activeNotice, doc)}>서식 예시<Icon name="download" size={14} /></button> : <a className="document-action" href="https://www.gov.kr/" target="_blank" rel="noreferrer">정부24 홈<Icon name="external" size={14} /></a>}</div>)}</div>
            <p className="document-hint">준비 상태는 새로고침 전까지 유지돼요. 서류 종류와 발급일 요건은 실제 공고에서 확인해야 해요.</p>
            <button className="text-button download-list" onClick={() => props.onDownloadList(activeNotice)}><Icon name="download" size={16} />시연용 준비목록 내려받기</button>
          </>}
        </div>
        <footer className="housing-detail-footer"><p>실제 모집 공고가 아닌 가상 정보예요.<br />신청 자격과 금액은 검증되지 않았어요.</p><a className="official-link" href="https://apply.lh.or.kr/" target="_blank" rel="noreferrer">LH 청약플러스 홈<Icon name="external" size={14} /></a></footer>
      </div> : <div className="housing-detail-empty"><Icon name="home" size={34} /><h2>살펴볼 공고를 선택해 주세요.</h2><p>금액 / 조건 / 신청서류를 여기에서 확인할 수 있어요.</p></div>}
    </section>
  </div>
}
