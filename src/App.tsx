import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Icon, Logo } from './Icons'
import { HouseArt } from './HouseArt'
import { answerLabel, exampleInput, notices, questions } from './demo'
import type { Answers, DocumentItem, Notice, Step } from './types'

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

function NoticeCard({ notice, saved, toggleSaved, openDocument, answers }: {
  notice: Notice; saved: boolean; toggleSaved: () => void
  openDocument: (item: DocumentItem) => void; answers: Answers
}) {
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState<string[]>([])
  const needsReview = Object.values(answers).includes('unknown') || answers.home === 'owned'
  return <article className={'notice-card ' + (expanded ? 'expanded' : '')}>
    <div className="notice-main">
      <div className={'notice-art ' + notice.tone}><HouseArt small tone={notice.tone} /></div>
      <div className="notice-body">
        <div className="notice-tags"><span className="tag muted">시연 공고</span><span className="type-label">{notice.type}</span><span className="area-label">{notice.area}</span></div>
        <h3>{notice.title}</h3>
        <p className="notice-subtitle">{notice.subtitle}</p>
        <div className="notice-location"><Icon name="pin" size={14} />{notice.region === 'seoul' ? '서울특별시' : '경기도'}<span>·</span><span>가상 지역 예시</span></div>
        <div className="price-row"><div><span>보증금 예시</span><strong>{notice.deposit}</strong></div><div><span>임대료 예시</span><strong>{notice.rent}</strong></div></div>
      </div>
      <button className={'bookmark-button ' + (saved ? 'saved' : '')} aria-label={notice.title + (saved ? ' 관심 해제' : ' 관심 등록')} aria-pressed={saved} onClick={toggleSaved}><Icon name="bookmark" /></button>
    </div>
    <div className="notice-footer">
      <span><Icon name={needsReview ? 'info' : 'file'} size={16} />{needsReview ? '입력 정보에 추가 확인이 필요해요' : '신청자료 준비 흐름을 확인해보세요'}</span>
      <button className="text-button" aria-expanded={expanded} aria-controls={'details-' + notice.id} onClick={() => setExpanded(!expanded)}>{expanded ? '접기' : '공고 · 신청자료 보기'}<Icon name="down" size={17} className={expanded ? 'rotate' : ''} /></button>
    </div>
    {expanded && <div className="notice-details" id={'details-' + notice.id}>
      <div className="detail-callout"><Icon name="info" size={18} /><p><strong>실제 모집 공고가 아닌 화면 시연용 정보예요.</strong>표시된 금액과 서류는 예시이며, 입력 조건에 따른 신청 자격을 판정하지 않아요.</p></div>
      <div className="tree-branch">
        <div className="tree-node"><span className="tree-dot" /><h4>공고 정보와 확인사항</h4></div>
        <div className="tree-content condition-grid">
          <div><span>모집 일정</span><strong>실제 일정 미연결</strong></div>
          <div><span>자격 · 순위</span><strong>공식 공고 확인 필요</strong></div>
          <div><span>대출 정보</span><strong>실제 상품 정보 미연결</strong></div>
          <a className="official-link" href="https://apply.lh.or.kr/" target="_blank" rel="noreferrer">LH 청약플러스 홈<Icon name="external" size={14} /></a>
        </div>
        <div className="tree-node"><span className="tree-dot" /><h4>신청자료 준비하기</h4><span className="small-count">{checked.length} / {notice.documents.length}</span></div>
        <div className="tree-content documents">
          {notice.documents.map((doc) => <div className={'document-row ' + (checked.includes(doc.id) ? 'is-checked' : '')} key={doc.id}>
            <label className="document-check"><input type="checkbox" checked={checked.includes(doc.id)} onChange={() => setChecked((items) => items.includes(doc.id) ? items.filter((id) => id !== doc.id) : [...items, doc.id])} /><span className="sr-only">{doc.title} 준비 완료</span></label>
            <span className="document-icon"><Icon name="file" size={20} /></span>
            <div className="document-copy"><strong>{doc.title}</strong><span>{doc.timing}</span></div>
            {doc.kind === 'sample' ? <button className="document-action" onClick={() => openDocument(doc)}>서식 예시<Icon name="download" size={15} /></button> : <a className="document-action" href="https://www.gov.kr/" target="_blank" rel="noreferrer">정부24 홈<Icon name="external" size={15} /></a>}
          </div>)}
          <p className="document-hint">준비 상태 체크는 이 화면에서만 유지돼요. 체크리스트와 서식 예시는 실제 제출용이 아니에요.</p>
          <button className="text-button download-list" onClick={() => downloadSample(notice)}><Icon name="download" size={16} />시연용 준비목록 내려받기</button>
        </div>
      </div>
    </div>}
  </article>
}

export default function App() {
  const [step, setStep] = useState<Step>('intro')
  const [input, setInput] = useState('')
  const [answers, setAnswers] = useState<Answers>({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [saved, setSaved] = useState<string[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [modal, setModal] = useState<Modal>(null)
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

  function reset() {
    setStep('intro'); setInput(''); setAnswers({}); setQuestionIndex(0)
    setSaved([]); setShowSaved(false); setTypeFilter('all'); setModal(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function start(event: FormEvent) {
    event.preventDefault()
    if (!input.trim()) return
    setAnswers({}); setQuestionIndex(0); setShowSaved(false); setTypeFilter('all'); setStep('confirm')
  }
  function next() {
    if (!answers[question.id]) return
    if (questionIndex < questions.length - 1) setQuestionIndex(questionIndex + 1)
    else { setStep('results'); setTypeFilter('all') }
  }
  function toggleSaved(id: string) {
    setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }
  function showResults(savedOnly = false) {
    setShowSaved(savedOnly); setTypeFilter('all'); setStep('results')
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main">본문으로 건너뛰기</a>
    <aside className="sidebar">
      <button className="brand" onClick={reset} aria-label="누보 처음으로"><Logo /><span>누보<span className="brand-english">nubo</span></span></button>
      <p className="brand-caption">누구나, 나다운 보금자리.</p>
      <div className="nav-group-label">나의 보금자리 찾기</div>
      <nav className="main-nav" aria-label="이용 단계">
        {stages.map((stage, index) => <button key={stage.key} disabled={index > stageIndex && !(index === 2 && answeredCount === 4)} className={'nav-item ' + (step === stage.key ? 'active' : '')} aria-current={step === stage.key ? 'step' : undefined} onClick={() => stage.key === 'results' ? showResults() : setStep(stage.key)}>
          <Icon name={stage.icon} size={19} /><span>{stage.name}</span>{index < stageIndex ? <Icon name="check" size={14} /> : <span className="nav-number">0{index + 1}</span>}
        </button>)}
      </nav>
      <div className="sidebar-divider" />
      <button className="nav-item secondary" disabled={answeredCount < 4} onClick={() => showResults(true)}><Icon name="bookmark" size={19} /><span>관심 공고</span><span className="bookmark-count">{saved.length}</span></button>
      <div className="sidebar-bottom">
        <div className="sidebar-note"><span className="tiny-leaf"><Icon name="leaf" size={21} /></span><strong>집을 찾는 일,<br />혼자 어렵지 않도록.</strong><p>공고를 이해하는 순간부터<br />신청을 준비하는 순간까지.</p><button onClick={() => setModal({ kind: 'about' })}>누보 알아보기 <Icon name="arrow" size={15} /></button></div>
        <div className="sidebar-foot"><span>© 2026 NUBO</span><span>PROTOTYPE</span></div>
      </div>
    </aside>

    <div className="page-shell">
      <header className="topbar"><div className="breadcrumb"><span>나의 보금자리</span><Icon name="chevron" size={13} /><strong>{stages[stageIndex].name}</strong></div><div className="topbar-actions"><span className="demo-badge"><i />화면 시연 모드</span><button className="reset-button" aria-label="처음부터 다시 시작" onClick={reset}><Icon name="refresh" size={15} /><span>처음부터</span></button></div></header>
      <main id="main" className={'main-content ' + (step === 'results' ? 'results-page' : '')}>
        <div className="mobile-brand"><Logo /><strong>누보</strong><span>나의 다음 보금자리</span></div>
        <div className="stepper" aria-label="진행 상태">{stages.map((stage, index) => <div key={stage.key} className={'stepper-item ' + (index === stageIndex ? 'current' : index < stageIndex ? 'complete' : '')}><span className="stepper-circle">{index < stageIndex ? <Icon name="check" size={12} /> : index + 1}</span><span>{stage.name}</span>{index < 2 && <span className="stepper-line" />}</div>)}</div>

        {step === 'intro' && <>
          <section className="welcome-hero">
            <div className="hero-copy"><span className="eyebrow"><span />당신의 새로운 시작을 함께</span><h1 ref={headingRef} tabIndex={-1}>나의 다음 집,<br /><em>여기서 시작해요.</em></h1><p>내 상황에 맞는 주거지원부터 필요한 신청자료까지.<br />복잡한 공고 속에서, 나에게 필요한 것만 찾아보세요.</p><span className="hero-caption"><Icon name="leaf" size={15} />작은 한 걸음이 새로운 보금자리로.</span></div>
            <div className="hero-art"><div className="art-orbit" /><HouseArt /><div className="art-note"><span><Icon name="home" size={16} /></span>내일의 집을 만나는 중</div></div>
          </section>
          <div className="workspace-grid">
            <section className="input-card">
              <div className="section-heading"><span className="section-icon"><Icon name="edit" size={21} /></span><div><h2>어떤 집을 찾고 계세요?</h2><p>지금의 상황을 편하게 들려주세요.</p></div><span className="step-label">STEP 01</span></div>
              <form onSubmit={start}>
                <label htmlFor="situation" className="sr-only">나의 상황 입력</label>
                <div className="textarea-wrap"><textarea id="situation" ref={inputRef} maxLength={500} value={input} onChange={(event) => setInput(event.target.value)} placeholder={exampleInput} /><span className="character-count">{input.length} / 500</span></div>
                <div className="example-row"><span>처음이라면</span><button type="button" onClick={() => { setInput(exampleInput); inputRef.current?.focus() }}><Icon name="spark" size={14} />예시 문장 채우기<Icon name="arrow" size={14} /></button></div>
                <div className="input-note"><Icon name="info" size={16} /><p>지금은 화면 시연이에요. 입력 내용과 관계없이 <strong>32세 · 결혼 예정</strong> 예시 프로필로 진행해요.</p></div>
                <button className="primary-button full-width" type="submit" disabled={!input.trim()}>나에게 맞는 집 살펴보기<Icon name="arrow" size={19} /></button>
              </form>
              <p className="privacy-note"><Icon name="shield" size={14} />입력 내용은 외부로 전송하거나 기기에 저장하지 않아요.</p>
            </section>
            <aside className="guide-card"><span className="eyebrow">HOW IT WORKS</span><h2>신청 준비까지,<br />차근차근 함께해요.</h2><div className="guide-steps">{stages.map((stage, index) => <div key={stage.key}><span>{index + 1}</span><div><strong>{stage.name}</strong><p>{index === 0 ? '나이, 주거 상황 등을 알려주세요.' : index === 1 ? '필요한 정보만 간단히 확인해요.' : '공고와 신청자료를 한곳에서 봐요.'}</p></div></div>)}</div><div className="guide-footer"><Icon name="clock" size={16} /><span>예시 시나리오 · 추가 질문 4개</span></div></aside>
          </div>
          <div className="value-strip"><span><Icon name="check" size={15} />필요한 정보만 차근차근</span><span><Icon name="file" size={15} />공고부터 신청자료까지</span><span><Icon name="heart" size={15} />새로운 시작을 더 가볍게</span></div>
        </>}

        {step === 'confirm' && <>
          <section className="page-heading"><span className="eyebrow">A LITTLE MORE ABOUT YOU</span><h1>조금만 더 알려주세요.</h1><p>앞서 알려주신 내용을 바탕으로, 필요한 정보만 확인할게요.</p></section>
          <div className="workspace-grid">
            <section className="question-card">
              <div className="question-top"><span className="tag green">추가 정보 확인</span><span>질문 <strong>{questionIndex + 1}</strong> / {questions.length}</span></div>
              <div className="question-progress"><span style={{ width: ((questionIndex + 1) / questions.length * 100) + '%' }} /></div>
              <h2 ref={headingRef} tabIndex={-1}>{question.title}</h2><p className="question-description">{question.description}</p>
              <fieldset className="question-options"><legend className="sr-only">{question.title}</legend>{question.options.map((option) => <label key={option.value} className={'option-card ' + (answers[question.id] === option.value ? 'selected' : '')}><input type="radio" name={question.id} value={option.value} checked={answers[question.id] === option.value} onChange={() => setAnswers({ ...answers, [question.id]: option.value })} /><span className="radio-visual">{answers[question.id] === option.value && <span />}</span><span><strong>{option.label}</strong><small>{option.description}</small></span>{answers[question.id] === option.value && <Icon name="check" size={19} />}</label>)}</fieldset>
              <div className="question-navigation"><button className="back-button" onClick={() => questionIndex === 0 ? setStep('intro') : setQuestionIndex(questionIndex - 1)}><Icon name="back" size={17} />이전</button><button className="primary-button" onClick={next} disabled={!answers[question.id]}>{questionIndex === questions.length - 1 ? '예시 공고 보기' : '다음으로'}<Icon name="arrow" size={18} /></button></div>
              <p className="fine-print">선택한 답변은 시연 흐름에만 사용되며 실제 자격을 판단하지 않아요.</p>
            </section>
            <aside className="profile-card">
              <div className="profile-heading"><span className="section-icon"><Icon name="home" size={21} /></span><div><h2>나의 주거 프로필</h2><p>시연용 예시 정보</p></div></div>
              <div className="profile-fixed"><span>나이<strong>32세</strong></span><span>결혼 상태<strong>결혼 예정</strong></span></div>
              <dl className="profile-values">{questions.map((item) => <div key={item.id}><dt>{item.label}</dt><dd className={answers[item.id] ? 'known' : ''}>{item.id === 'money' && answers.money === 'asset' ? '보유 자산 1억 원' : item.id === 'money' && answers.money === 'budget' ? '주거 예산 1억 원' : answerLabel(item.id, answers[item.id])}</dd></div>)}</dl>
              <div className="profile-tip"><Icon name="info" size={17} /><p>모르는 정보는 미확인으로 남겨요. 정확한 16개 항목 정의는 이후 연결할 예정이에요.</p></div>
              <details className="original-input"><summary>내가 입력한 문장 보기<Icon name="down" size={14} /></summary><p>{input}</p></details>
            </aside>
          </div>
        </>}

        {step === 'results' && <>
          <section className="result-heading"><div><span className="eyebrow">YOUR NEXT HOME</span><h1 ref={headingRef} tabIndex={-1}>{showSaved ? '마음에 담아둔 공고예요.' : '새로운 시작을 위한 보금자리.'}</h1><p>공고를 펼치면 비용과 신청자료를 함께 확인할 수 있어요.</p></div><button className="outline-button" onClick={() => { setQuestionIndex(0); setStep('confirm') }}><Icon name="edit" size={16} />조건 수정</button></section>
          <div className="result-profile"><span className="profile-label"><Icon name="home" size={17} />예시 프로필</span><span>32세</span><span>결혼 예정</span><span>{answers.region === 'seoul' ? '서울' : answers.region === 'gyeonggi' ? '경기' : '서울 · 경기'}</span><span>{answers.money === 'asset' ? '자산 1억 원' : answers.money === 'budget' ? '주거 예산 1억 원' : '금액 의미 미확인'}</span></div>
          <div className="result-demo-note"><Icon name="info" size={17} /><p><strong>가상 공고로 보는 화면 시연이에요.</strong> 지역 선택만 목록에 반영되며, 실제 모집 여부·신청 자격·추천 적합도는 검증되지 않았어요.</p></div>
          <div className="results-toolbar"><div className="result-tabs"><button className={!showSaved ? 'active' : ''} onClick={() => setShowSaved(false)}>전체 공고</button><button className={showSaved ? 'active' : ''} onClick={() => setShowSaved(true)}>관심 공고 <span>{saved.length}</span></button></div><label className="type-filter"><span className="sr-only">공고 유형</span><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="all">모든 유형</option><option value="행복주택">행복주택</option><option value="매입임대">매입임대</option><option value="청년안심주택">청년안심주택</option></select></label></div>
          <div className="result-count" role="status">총 <strong>{filteredNotices.length}</strong>개의 예시 공고<span>금액과 서류는 모두 시연용입니다</span></div>
          <div className="notice-list">{filteredNotices.map((notice) => <NoticeCard key={notice.id} notice={notice} answers={answers} saved={saved.includes(notice.id)} toggleSaved={() => toggleSaved(notice.id)} openDocument={(item) => setModal({ kind: 'document', item, notice })} />)}</div>
          {filteredNotices.length === 0 && <div className="empty-state"><Icon name={showSaved ? 'bookmark' : 'search'} size={34} /><h2>{showSaved && saved.length === 0 ? '아직 담아둔 공고가 없어요.' : '이 조건의 예시 공고가 없어요.'}</h2><p>{showSaved && saved.length === 0 ? '마음에 드는 공고의 북마크를 눌러보세요.' : '실제 지원 대상 여부와 관계없는 시연 결과예요.'}</p><button className="outline-button" onClick={() => { setShowSaved(false); setTypeFilter('all') }}>전체 예시 공고 보기<Icon name="arrow" size={16} /></button></div>}
          <div className="results-end"><Icon name="leaf" size={19} /><span>좋은 집을 찾는 첫걸음, 누보가 함께할게요.</span></div>
        </>}
        <footer className="page-footer"><span>누구나 보금자리, 누보</span><span>실제 AI · 공고 데이터 미연결<span className="footer-dot">·</span>화면 프로토타입</span></footer>
      </main>
    </div>
    <dialog ref={dialogRef} className="modal" onCancel={() => setModal(null)} onClick={(event) => { if (event.target === event.currentTarget) setModal(null) }} aria-labelledby="modal-title">
      <button className="modal-close" onClick={() => setModal(null)} aria-label="닫기"><Icon name="close" /></button>
      {modal?.kind === 'about' && <><Logo /><span className="eyebrow">누구나, 나다운 보금자리</span><h2 id="modal-title">집을 찾는 일부터<br />신청을 준비하는 일까지.</h2><p>누보는 내 상황에 맞는 주거지원 정보를 이해하고, 필요한 서류와 준비 순서를 확인할 수 있도록 돕는 서비스예요.</p><div className="modal-note">현재는 화면 시연용 프로토타입이에요. AI 호출·실제 자격 판단·공고 수집은 연결되어 있지 않아요. 입력 정보는 새로고침하면 사라져요.</div><button className="primary-button full-width" onClick={() => setModal(null)}>알겠어요<Icon name="check" size={18} /></button></>}
      {modal?.kind === 'document' && <><span className="section-icon"><Icon name="file" size={26} /></span><span className="tag muted">시연용 자료</span><h2 id="modal-title">{modal.item.title}</h2><p>{modal.notice.title} · 가상 공고</p><div className="sample-preview"><span>DOCUMENT PREVIEW</span><strong>{modal.item.title}</strong><div className="sample-line" /><div className="sample-line short" /><div className="sample-grid"><span /><span /><span /><span /></div><small>실제 제출용이 아닌 화면 시연용 안내 파일</small></div><p className="modal-warning">다운로드되는 TXT 파일은 서식 안내 예시예요. 실제 신청서는 반드시 해당 공식 공고에서 받아야 해요.</p><button className="primary-button full-width" onClick={() => downloadSample(modal.notice, modal.item)}><Icon name="download" size={18} />시연용 안내 파일 받기 (.txt)</button></>}
    </dialog>
  </div>
}
