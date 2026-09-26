export type Step = 'intro' | 'confirm' | 'results'
export type Answers = Record<string, string>
export interface Question {
  id: string
  label: string
  title: string
  description: string
  options: { value: string; label: string; description: string }[]
}
export interface DocumentItem {
  id: string
  title: string
  description: string
  timing: string
  kind: 'sample' | 'website'
}
export interface Notice {
  id: string
  title: string
  subtitle: string
  region: string
  type: string
  area: string
  deposit: string
  rent: string
  tone: 'sage' | 'sand' | 'blue'
  documents: DocumentItem[]
}
