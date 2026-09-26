import type { CSSProperties } from 'react'

const paths = {
  menu: 'M4 6h16M4 12h16M4 18h16',
  home: 'M3 10 12 3l9 7M5 9v11h5v-6h4v6h5V9',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  check: 'm5 12 4 4L19 6',
  chevron: 'm9 5 7 7-7 7',
  down: 'm6 9 6 6 6-6',
  file: 'M14 2H5v20h14V7l-5-5v5h5M8 12h8m-8 4h6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  external: 'M14 3h7v7m0-7L10 14M10 3H3v18h18v-7',
  pin: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  bookmark: 'M6 3h12v18l-6-4-6 4V3Z',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
  refresh: 'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3',
  shield: 'm12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Zm-4 9 3 3 5-5',
  clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  info: 'M12 11v6m0-10v.1M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  close: 'm6 6 12 12M6 18 18 6',
  edit: 'm16 3 5 5-12 12H4v-5L16 3Zm-3 3 5 5',
  leaf: 'M20 3C6 2 2 8 5 15s15 4 15-12ZM5 20 16 8',
  search: 'M21 21 16 16M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
}
export type IconName = keyof typeof paths
export function Icon({ name, size = 20, style, className = '' }: { name: IconName; size?: number; style?: CSSProperties; className?: string }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name]} /></svg>
}
export function Logo() {
  return <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="m7 18 11-10 11 10v12H7V18Z" fill="currentColor"/><path d="M15 30v-9h6v9" fill="#FAFAF7"/><path d="M5 17 18 5l13 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
}
