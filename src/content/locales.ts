import he from './he'
import en from './en'
import extraHe from './extra'
import extraEn from './extra.en'

export type LocaleCode = 'he' | 'en'

export const contentByLocale = { he, en }
export const extraByLocale = { he: extraHe, en: extraEn }

export function localeFromPath(pathname: string): LocaleCode {
  const first = pathname.split('/').filter(Boolean)[0]?.toLowerCase()
  return first === 'en' ? 'en' : 'he'
}
