export function HouseArt({ small = false, tone = 'sage' }: { small?: boolean; tone?: string }) {
  const wall = tone === 'sand' ? '#c9d1e8' : tone === 'blue' ? '#bcccf1' : '#d0d9f4'
  return <svg viewBox="0 0 380 290" className={small ? 'house-art small' : 'house-art'} fill="none" aria-hidden="true">
    <ellipse cx="195" cy="247" rx="153" ry="21" fill="#d9dfef" opacity=".45"/>
    <circle cx="278" cy="57" r="29" fill="#dce4ff"/>
    <path d="M58 101h54m-46 9h29M295 129h42" stroke="#c7d1ef" strokeWidth="2" strokeLinecap="round"/>
    <path d="m118 125 83-47 88 47-84 49-87-49Z" fill="#6c84d6"/>
    <path d="M128 128v95l77 40v-92l-77-43Z" fill="#fafaf7"/>
    <path d="m205 171 73-43v94l-73 41v-92Z" fill={wall}/>
    <path d="m118 125 87 49v-11l-87-49v11Z" fill="#283c78"/>
    <path d="m205 174 84-49v-11l-84 49v11Z" fill="#40599a"/>
    <path d="m118 114 84-48 87 48-84 49-87-49Z" fill="#7e96e7"/>
    <path d="m137 114 65-37 68 37-65 38-68-38Z" fill="#93a7eb"/>
    <path d="m223 97 0-29 16-9 16 9v28l-16 9-16-8Z" fill="#e3e8f8"/>
    <path d="m239 78 16-10v28l-16 9V78Z" fill="#a7b7e6"/>
    <path d="m223 68 16-9 16 9-16 10-16-10Z" fill="#fafaf7"/>
    <path d="m150 181 25 14v51l-25-13v-52Z" fill="#7186bf"/>
    <path d="m157 191 11 6v39l-11-6v-39Z" fill="#99acd9"/>
    <circle cx="169" cy="218" r="2" fill="#31446f"/>
    <path d="m220 178 21-12v28l-21 12v-28Zm30-17 15-9v28l-15 9v-28Z" fill="#fafaf7" stroke="#8a9fd6" strokeWidth="3"/>
    <path d="m230 172 0 27m-10-8 21-12m16-22v27" stroke="#b6c5eb" strokeWidth="2"/>
    <path d="m138 151 14 8v19l-14-8v-19Zm30 17 16 9v19l-16-9v-19Z" fill="#dde4f5" stroke="#ffffff" strokeWidth="3"/>
    <path d="m158 249 16 9-31 17-17-9 32-17Z" fill="#cbd4eb"/>
    <path d="m141 259 16 9-29 17-17-9 30-17Z" fill="#dde4f4"/>
    <path d="M77 168v64" stroke="#8b9bc4" strokeWidth="5" strokeLinecap="round"/>
    <ellipse cx="77" cy="167" rx="26" ry="43" fill="#b0c0ef"/>
    <path d="M77 183v49m0-39-13-13m13 22 12-14" stroke="#8198d8" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M305 206v36" stroke="#8b9bc4" strokeWidth="4"/>
    <ellipse cx="306" cy="201" rx="17" ry="28" fill="#99afe4"/>
    <path d="M307 217v22m-24 0 5-7m-3 9 10-5m-194-12 5-9m-3 13 11-5" stroke="#879bd0" strokeWidth="2" strokeLinecap="round"/>
    {!small && <><path d="M62 58v12m-6-6h12M329 96v8m-4-4h8" stroke="#8da2d9" strokeWidth="2" strokeLinecap="round"/><circle cx="125" cy="55" r="3" fill="#b4c4ed"/></>}
  </svg>
}
