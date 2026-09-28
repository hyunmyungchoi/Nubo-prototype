import { useEffect, useRef, useState } from 'react'
import type { SubmitEvent } from 'react'
import { Icon, Logo } from './Icons'
import { HousingResults } from './HousingResults'
import { answerLabel, exampleInput, notices, questions } from './demo'
import type { Answers, DocumentItem, Notice, Step } from './types'
import { checkBackend, getNotices } from './api'
import type { NoticeResponse } from './api'

const stages = [
  { key: 'intro', name: '내 상황 입력', caption: '나의 이야기를 들려주세요', icon: 'edit' },
  { key: 'confirm', name: '정보 확인', caption: '필요한 것만 하나씩', icon: 'check' },
  { key: 'results', name: '공고 살펴보기', caption: '신청 준비까지 한눈에', icon: 'home' },
] as const

type Modal = { kind: 'about' } | { kind: 'document'; item: DocumentItem; notice: Notice } | null

function downloadSample(notice: Notice, item?: DocumentItem) {
  const title = item?.title ?? '신청 준비 체크리스트'
  const body = [
    '[누보 시연용 자료 — 실제 제출용이 아닙니다]',
    '',
    notice.title + ' (가상 공고)',
    title,
    '',
    '이 파일은 화면 기능을 확인하기 위한 샘플입니다.',
    '실제 공고, 신청 자격, 모집 일정 또는 제출 서식을 나타내지 않습니다.',
    '',
    ...(item ? [item.description, item.timing] : notice.documents.map((doc) => '□ ' + doc.title + ' — ' + doc.timing)),
    '',
    '실제 신청 전 해당 기관의 공식 공고 및 첨부서식을 확인하세요.',
    'LH 청약플러스: https://apply.lh.or.kr/',
  ].join('\r\n')
  const blob = new Blob(['\uFEFF' + body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '[시연용] ' + notice.title + ' ' + title + '.txt'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function formatWon(value: number | null): string {
  if (value === null) {
    return '미확인'
  }

  return `${value.toLocaleString('ko-KR')}원`
}

function formatDateTime(value: string | null): string {
  if (value === null) return '미확인'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '날짜 확인 필요'

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

function getApplicationStatus(
  startsAt: string | null,
  endsAt: string | null,
  now: number,
): string {
  if (startsAt === null || endsAt === null) {
    return '접수 일정 미확인'
  }

  const start = new Date(startsAt).getTime()
  const end = new Date(endsAt).getTime()

  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    return '접수 일정 확인 필요'
  }

  if (now < start) return '접수 전'
  if (now >= end) return '접수 마감'

  return '일정상 접수 중'
}

export default function App() {
  const [step, setStep] = useState<Step>('intro')
  const [input, setInput] = useState('')
  const [answers, setAnswers] = useState<Answers>({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [saved, setSaved] = useState<string[]>([])
  const [checkedDocuments, setCheckedDocuments] = useState<string[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [modal, setModal] = useState<Modal>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [apiNotices, setApiNotices] = useState<NoticeResponse[]>([])
  const [noticesLoading, setNoticesLoading] = useState(true)
  const [noticesError, setNoticesError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const menuRef = useRef<HTMLDialogElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const stageIndex = stages.findIndex((stage) => stage.key === step)
  const question = questions[questionIndex]
  const answeredCount = Object.keys(answers).length
  const filteredNotices = notices.filter((notice) =>
    (!answers.region || answers.region === 'all' || notice.region === answers.region) &&
    (!showSaved || saved.includes(notice.id)) &&
    (typeFilter === 'all' || notice.type === typeFilter),
  )
  useEffect(() => {
    if (step !== 'intro') headingRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [step, questionIndex])

  useEffect(() => {
    if (modal && !dialogRef.current?.open) dialogRef.current?.showModal()
    if (!modal && dialogRef.current?.open) dialogRef.current.close()
  }, [modal])

  useEffect(() => {
    if (menuOpen && !menuRef.current?.open) menuRef.current?.showModal()
    if (!menuOpen && menuRef.current?.open) menuRef.current.close()
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen && !modal) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [menuOpen, modal])

  useEffect(() => {
    checkBackend()
    .then((data) => {
      console.log('백엔드 연결 성공:', data)
    })
    .catch((error) => {
      console.error('백엔드 연결 실패:', error)
    })
  }, [])

  useEffect(() => {
    getNotices()
    .then((notices) => {
      console.log('받아온 공고 목록:', notices)
    })
    .catch((error) => {
      console.error('공고 조회 오류:', error)
    })
  }, [])

  useEffect(() => {
    let active = true
    getNotices()
    .then((notices) => {
      if (active) {
        setApiNotices(notices)
      }
    })
    .catch(() => {
      if (active) {
        setNoticesError('공고를 불러오지 못했어요.')
      }
    })
    .finally(() => {
      if (active) {
        setNoticesLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    function updateNow() {
      setNow(Date.now())
    }

    const timer = window.setInterval(updateNow, 1000)
    window.addEventListener('focus', updateNow)

    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', updateNow)
    }
  }, [])

  function reset() {
    setDirection('backward')
    setMenuOpen(false)
    setStep('intro'); setInput(''); setAnswers({}); setQuestionIndex(0)
    setSaved([]); setCheckedDocuments([]); setShowSaved(false); setTypeFilter('all'); setModal(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function start(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!input.trim()) return
    setDirection('forward')
    setAnswers({}); setQuestionIndex(0); setShowSaved(false); setTypeFilter('all'); setStep('confirm')
  }
  function next() {
    if (!answers[question.id]) return
    setDirection('forward')
    if (questionIndex < questions.length - 1) setQuestionIndex(questionIndex + 1)
    else { setStep('results'); setTypeFilter('all') }
  }
  function previous() {
    setDirection('backward')
    if (questionIndex === 0) setStep('intro')
    else setQuestionIndex(questionIndex - 1)
  }
  function toggleSaved(id: string) {
    setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }
  function showResults(savedOnly = false) {
    setDirection('forward')
    setMenuOpen(false)
    setShowSaved(savedOnly); setTypeFilter('all'); setStep('results')
  }

  return <div className={'app-shell ' + (step === 'intro' ? 'is-intro' : step === 'results' ? 'is-results' : '')}>
    <a className="skip-link" href="#main">본문으로 건너뛰기</a>
    <dialog ref={menuRef} id="nubo-menu" className="sidebar" aria-label="누보 메뉴" onCancel={() => setMenuOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setMenuOpen(false) }}>
      <div className="sidebar-heading"><button className="brand" onClick={reset} aria-label="누보 처음으로"><span className="wordmark">nub<span>o</span></span></button><button className="icon-button" aria-label="메뉴 닫기" onClick={() => setMenuOpen(false)}><Icon name="close" /></button></div>
      <p className="brand-caption">누구나, 나다운 보금자리.</p>
      <div className="nav-group-label">나의 보금자리 찾기</div>
      <nav className="main-nav" aria-label="이용 단계">
        {stages.map((stage, index) => <button key={stage.key} disabled={index > stageIndex && !(index === 2 && answeredCount === questions.length)} className={'nav-item ' + (step === stage.key ? 'active' : '')} aria-current={step === stage.key ? 'step' : undefined} onClick={() => { setMenuOpen(false); if (stage.key === 'results') showResults(); else setStep(stage.key) }}>
          <Icon name={stage.icon} size={19} /><span>{stage.name}</span>{index < stageIndex ? <Icon name="check" size={14} /> : <span className="nav-number">0{index + 1}</span>}
        </button>)}
      </nav>
      <div className="sidebar-divider" />
      <button className="nav-item secondary" disabled={answeredCount < questions.length} onClick={() => showResults(true)}><Icon name="bookmark" size={19} /><span>관심 공고</span><span className="bookmark-count">{saved.length}</span></button>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><strong>나의 다음 집을<br />찾는 가장 쉬운 시작.</strong><p>공고를 찾고, 조건을 확인하고,<br />신청 준비까지 함께해요.</p><button onClick={() => { setMenuOpen(false); setModal({ kind: 'about' }) }}>누보 알아보기 <Icon name="arrow" size={15} /></button></div>
        <div className="sidebar-foot"><span>© 2026 NUBO</span><span>PROTOTYPE</span></div>
      </div>
    </dialog>

    <div className="page-shell">
      <header className="topbar"><div className="topbar-leading"><button className="icon-button menu-toggle" aria-label="메뉴 열기" aria-expanded={menuOpen} aria-controls="nubo-menu" onClick={() => setMenuOpen(true)}><Icon name="menu" size={22} /></button>{step === 'intro' ? <span className="header-caption">나의 다음 보금자리</span> : <button className="header-brand wordmark" onClick={reset} aria-label="누보 홈">nub<span>o</span></button>}</div><div className="topbar-actions"><button className="about-button" onClick={() => setModal({ kind: 'about' })}>누보 소개</button><span className="demo-badge"><i />화면 시안</span>{step !== 'intro' && <button className="reset-button" aria-label="처음부터 다시 시작" onClick={reset}><Icon name="refresh" size={15} /><span>처음부터</span></button>}</div></header>
      <main key={step} id="main" data-direction={direction} className={'main-content ' + (step === 'intro' ? 'intro-page' : step === 'results' ? 'results-page' : '')}>
        {step === 'confirm' && <div className="stepper" aria-label="진행 상태">{stages.map((stage, index) => <div key={stage.key} className={'stepper-item ' + (index === stageIndex ? 'current' : index < stageIndex ? 'complete' : '')}><span className="stepper-circle">{index < stageIndex ? <Icon name="check" size={12} /> : index + 1}</span><span>{stage.name}</span>{index < 2 && <span className="stepper-line" />}</div>)}</div>}

        {step === 'intro' && <section className="search-home" aria-label="주거지원 찾기">
          <div className="search-identity"><h1 ref={headingRef} tabIndex={-1} className="hero-wordmark wordmark" aria-label="누보">nub<span>o</span></h1><p>내 조건으로 찾고, 신청까지 준비하다.</p><p className="search-description">청년 주거지원 / 대출 정보 / 필요한 서류를 한곳에서.</p></div>
          <form className="search-form" onSubmit={start}>
            <label htmlFor="situation" className="sr-only">나의 상황 입력</label>
            <div className={'search-field ' + (input.length > 45 ? 'has-long-input' : '')}><Icon name="search" size={23} /><textarea id="situation" ref={inputRef} rows={1} maxLength={500} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit() } }} placeholder="나이, 희망 지역, 소득 등 내 상황을 알려주세요" aria-describedby="search-demo-note" /><button className="search-submit" type="submit" disabled={!input.trim()} aria-label="나에게 맞는 집 살펴보기"><Icon name="arrow" size={22} /></button></div>
            <div className="search-helper"><button type="button" onClick={() => { setInput(exampleInput); inputRef.current?.focus() }}>어떻게 시작할지 모르겠다면 <span>예시 문장 넣어보기</span><Icon name="arrow" size={14} /></button>{input.length > 0 && <span className="character-count">{input.length} / 500</span>}</div>
          </form>
          <p id="search-demo-note" className="search-demo-note">지금은 32세 / 결혼 예정 프로필로 진행하는 화면 시안이에요.</p>
        </section>}

        {step === 'confirm' && <>
          <section className="page-heading"><span className="eyebrow">A LITTLE MORE ABOUT YOU</span><h1>조금만 더 알려주세요.</h1><p>앞서 알려주신 내용을 바탕으로, 필요한 정보만 확인할게요.</p></section>
          <div className="workspace-grid">
            <section key={question.id} className="question-card" data-direction={direction}>
              <div className="question-top"><span className="tag green">추가 정보 확인</span><span>질문 <strong>{questionIndex + 1}</strong> / {questions.length}</span></div>
              <div className="question-progress"><span style={{ width: ((questionIndex + 1) / questions.length * 100) + '%' }} /></div>
              <h2 ref={headingRef} tabIndex={-1}>{question.title}</h2><p className="question-description">{question.description}</p>
              <fieldset className="question-options"><legend className="sr-only">{question.title}</legend>{question.options.map((option) => <label key={option.value} className={'option-card ' + (answers[question.id] === option.value ? 'selected' : '')}><input type="radio" name={question.id} value={option.value} checked={answers[question.id] === option.value} onChange={() => setAnswers({ ...answers, [question.id]: option.value })} /><span className="radio-visual">{answers[question.id] === option.value && <span />}</span><span><strong>{option.label}</strong><small>{option.description}</small></span>{answers[question.id] === option.value && <Icon name="check" size={19} />}</label>)}</fieldset>
              <div className="question-navigation"><button className="back-button" onClick={previous}><Icon name="back" size={17} />이전</button><button className="primary-button" onClick={next} disabled={!answers[question.id]}>{questionIndex === questions.length - 1 ? '예시 공고 보기' : '다음으로'}<Icon name="arrow" size={18} /></button></div>
              <p className="fine-print">선택한 답변은 시연 흐름에만 사용되며 실제 자격을 판단하지 않아요.</p>
            </section>
            <aside className="profile-card">
              <div className="profile-heading"><span className="section-icon"><Icon name="home" size={21} /></span><div><h2>나의 주거 프로필</h2><p>시연용 예시 정보</p></div></div>
              <div className="profile-fixed"><span>나이<strong>32세</strong></span><span>결혼 상태<strong>결혼 예정</strong></span></div>
              <dl className="profile-values">{questions.map((item) => <div key={item.id}><dt>{item.label}</dt><dd className={answers[item.id] ? 'known' : ''}>{item.id === 'money' && answers.money === 'asset' ? '보유 자산 1억 원' : item.id === 'money' && answers.money === 'budget' ? '주거 예산 1억 원' : answerLabel(item.id, answers[item.id])}</dd></div>)}</dl>
              <div className="profile-tip"><Icon name="info" size={17} /><p>모르는 정보는 미확인으로 남겨요. 필요한 조건은 공고를 보면서 확인할 수 있어요.</p></div>
              <details className="original-input"><summary>내가 입력한 문장 보기<Icon name="down" size={14} /></summary><p>{input}</p></details>
            </aside>
          </div>
        </>}

        {step === 'results' && <>
          <section className="result-heading"><div className="result-summary"><h1 ref={headingRef} tabIndex={-1}>{showSaved ? '관심 공고 한눈에 보기' : '주거지원 한눈에 보기'}</h1><div className="result-profile"><span className="profile-label">내 조건 <small>(예시)</small></span><span>32세</span><span>결혼 예정</span><span>{answers.region === 'seoul' ? '서울' : answers.region === 'gyeonggi' ? '경기' : '서울 / 경기'}</span><span>{answers.money === 'asset' ? '자산 1억 원' : answers.money === 'budget' ? '주거 예산 1억 원' : '금액 의미 미확인'}</span></div></div><button className="outline-button" onClick={() => { setDirection('backward'); setQuestionIndex(0); setStep('confirm') }}><Icon name="edit" size={16} />조건 수정</button></section>
          <div className="result-demo-note"><Icon name="info" size={15} /><p>시연용 가상 공고예요. 실제 자격 / 모집 여부 / 금액은 검증되지 않았어요.</p></div>
          <HousingResults notices={filteredNotices} answers={answers} saved={saved} showSaved={showSaved} typeFilter={typeFilter} checked={checkedDocuments} onShowSaved={setShowSaved} onTypeFilter={setTypeFilter} onToggleSaved={toggleSaved} onToggleDocument={(id) => setCheckedDocuments((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])} onOpenDocument={(notice, item) => setModal({ kind: 'document', item, notice })} onDownloadList={(notice) => downloadSample(notice)} />
          {import.meta.env.DEV && (
            <section aria-label="백엔드 공고 연결 확인">
              <h2>백엔드 공고 연결 확인</h2>
              <p>개발 확인용 목록이며, 입력 조건에 따른 추천 결과는 아닙니다.</p>

              {noticesLoading && <p role="status">공고를 불러오는 중이에요.</p>}

              {noticesError && <p role="alert">{noticesError}</p>}

              {!noticesLoading && !noticesError && (
                apiNotices.length === 0 ? (
                  <p>등록된 공고가 없어요.</p>
                ) : (
                  <ul>
                    {apiNotices.map((notice) => (
                      <li key={notice.id}>
                        <strong>{notice.title}</strong>
                        <p>{notice.agency} / {notice.region}</p>
                        <p>{notice.reviewed ? '검수 완료' : '검수 전'}</p>
                        <div>
                          <p>
                            <strong>
                              {getApplicationStatus(
                                notice.application_starts_at,
                                notice.application_ends_at,
                                now,
                              )}
                            </strong>
                          </p>

                          <p>
                            접수 시작: {formatDateTime(notice.application_starts_at)}
                          </p>
                          <p>
                            접수 마감: {formatDateTime(notice.application_ends_at)}
                          </p>
                          <small>
                            한국시간 / 저장된 일정과 기기 시각 기준입니다.
                            실제 접수 여부와 변경 사항은 공식 공고에서 확인하세요.
                          </small>
                        </div>
                        {notice.housing_units.length === 0 ? (
                          <p>등록된 주택 정보가 없어요.</p>
                        ) : (
                          <ul>
                            {notice.housing_units.map((unit) => (
                              <li key={unit.id}>
                                <h3>{unit.name}</h3>
                                <p>{unit.address ?? '주소 미확인'}</p>
                                <p>
                                  전용면적: {unit.exclusive_area_m2 === null
                                    ? '미확인'
                                    : `${unit.exclusive_area_m2}㎡`}
                                </p>

                                {unit.rent_options.length === 0 ? (
                                  <p>임대조건 미확인</p>
                                ) : (
                                  <dl>
                                    {unit.rent_options.map((option, index) => (
                                      <div key={`${unit.id}-rent-${index}`}>
                                        <dt>{option.label}</dt>
                                        <dd>
                                          <p>보증금: {formatWon(option.deposit_won)}</p>
                                          <p>월 임대료: {formatWon(option.monthly_rent_won)}</p>

                                          {option.conditions_note && (
                                            <p>{option.conditions_note}</p>
                                          )}

                                          {option.source_ref && (
                                            <details>
                                              <summary>금액 출처 보기</summary>
                                              <p>{option.source_ref}</p>
                                            </details>
                                          )}
                                        </dd>
                                      </div>
                                    ))}
                                  </dl>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                        <a
                          href={notice.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          공식 공고 보기
                        </a>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </section>
          )}
        </>}
        <footer className="page-footer"><span>© 2026 nubo</span>{step === 'intro' ? <><span className="footer-journey">주거지원 찾기<Icon name="chevron" size={12} />조건 확인<Icon name="chevron" size={12} />신청 준비</span><span>입력 정보는 저장되지 않아요.</span></> : <span>가상 공고로 구성된 화면 시안입니다.</span>}</footer>
      </main>
    </div>
    <dialog ref={dialogRef} className="modal" onCancel={() => setModal(null)} onClick={(event) => { if (event.target === event.currentTarget) setModal(null) }} aria-labelledby="modal-title">
      <button className="modal-close" onClick={() => setModal(null)} aria-label="닫기"><Icon name="close" /></button>
      {modal?.kind === 'about' && <><Logo /><span className="eyebrow">누구나, 나다운 보금자리</span><h2 id="modal-title">집을 찾는 일부터<br />신청을 준비하는 일까지.</h2><p>누보는 내 상황에 맞는 주거지원 정보를 이해하고, 필요한 서류와 준비 순서를 확인할 수 있도록 돕는 서비스예요.</p><div className="modal-note">현재는 화면 시연용 프로토타입이에요. AI 호출·실제 자격 판단·공고 수집은 연결되어 있지 않아요. 입력 정보는 새로고침하면 사라져요.</div><button className="primary-button full-width" onClick={() => setModal(null)}>알겠어요<Icon name="check" size={18} /></button></>}
      {modal?.kind === 'document' && <><span className="section-icon"><Icon name="file" size={26} /></span><span className="tag muted">시연용 자료</span><h2 id="modal-title">{modal.item.title}</h2><p>{modal.notice.title} · 가상 공고</p><div className="sample-preview"><span>DOCUMENT PREVIEW</span><strong>{modal.item.title}</strong><div className="sample-line" /><div className="sample-line short" /><div className="sample-grid"><span /><span /><span /><span /></div><small>실제 제출용이 아닌 화면 시연용 안내 파일</small></div><p className="modal-warning">다운로드되는 TXT 파일은 서식 안내 예시예요. 실제 신청서는 반드시 해당 공식 공고에서 받아야 해요.</p><button className="primary-button full-width" onClick={() => downloadSample(modal.notice, modal.item)}><Icon name="download" size={18} />시연용 안내 파일 받기 (.txt)</button></>}
    </dialog>
  </div>
}
