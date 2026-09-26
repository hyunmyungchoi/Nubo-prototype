export function HouseArt({ small = false, tone = 'sage' }: { small?: boolean; tone?: string }) {
  const wall = tone === 'sand' ? '#ddc9ab' : tone === 'blue' ? '#bed0d1' : '#c7d4bc'
  return <svg viewBox="0 0 380 290" className={small ? 'house-art small' : 'house-art'} fill="none" aria-hidden="true">
    <ellipse cx="195" cy="247" rx="153" ry="21" fill="#d8dfce" opacity=".45"/>
    <circle cx="278" cy="57" r="29" fill="#ebcda4"/>
    <path d="M58 101h54m-46 9h29M295 129h42" stroke="#c5cdbb" strokeWidth="2" strokeLinecap="round"/>
    <path d="m118 125 83-47 88 47-84 49-87-49Z" fill="#698476"/>
    <path d="M128 128v95l77 40v-92l-77-43Z" fill="#f4eee2"/>
    <path d="m205 171 73-43v94l-73 41v-92Z" fill={wall}/>
    <path d="m118 125 87 49v-11l-87-49v11Z" fill="#385f50"/>
    <path d="m205 174 84-49v-11l-84 49v11Z" fill="#4b6b58"/>
    <path d="m118 114 84-48 87 48-84 49-87-49Z" fill="#789383"/>
    <path d="m137 114 65-37 68 37-65 38-68-38Z" fill="#849d8a"/>
    <path d="m223 97 0-29 16-9 16 9v28l-16 9-16-8Z" fill="#d6dbc6"/>
    <path d="m239 78 16-10v28l-16 9V78Z" fill="#acbda6"/>
    <path d="m223 68 16-9 16 9-16 10-16-10Z" fill="#f4eee2"/>
    <path d="m150 181 25 14v51l-25-13v-52Z" fill="#c68f63"/>
    <path d="m157 191 11 6v39l-11-6v-39Z" fill="#d9a879"/>
    <circle cx="169" cy="218" r="2" fill="#725d43"/>
    <path d="m220 178 21-12v28l-21 12v-28Zm30-17 15-9v28l-15 9v-28Z" fill="#f8f5e8" stroke="#8da893" strokeWidth="3"/>
    <path d="m230 172 0 27m-10-8 21-12m16-22v27" stroke="#b6c8b0" strokeWidth="2"/>
    <path d="m138 151 14 8v19l-14-8v-19Zm30 17 16 9v19l-16-9v-19Z" fill="#dfdfc7" stroke="#fffdf3" strokeWidth="3"/>
    <path d="m158 249 16 9-31 17-17-9 32-17Z" fill="#d0c8b3"/>
    <path d="m141 259 16 9-29 17-17-9 30-17Z" fill="#ded6c5"/>
    <path d="M77 168v64" stroke="#8d9a78" strokeWidth="5" strokeLinecap="round"/>
    <ellipse cx="77" cy="167" rx="26" ry="43" fill="#a8bd8e"/>
    <path d="M77 183v49m0-39-13-13m13 22 12-14" stroke="#819971" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M305 206v36" stroke="#8d9a78" strokeWidth="4"/>
    <ellipse cx="306" cy="201" rx="17" ry="28" fill="#8fa780"/>
    <path d="M307 217v22m-24 0 5-7m-3 9 10-5m-194-12 5-9m-3 13 11-5" stroke="#839975" strokeWidth="2" strokeLinecap="round"/>
    {!small && <><path d="M62 58v12m-6-6h12M329 96v8m-4-4h8" stroke="#9bac83" strokeWidth="2" strokeLinecap="round"/><circle cx="125" cy="55" r="3" fill="#b5c49e"/></>}
  </svg>
}
