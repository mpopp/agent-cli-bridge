import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import commonEn from './locales/en/common.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    common: commonEn
  }
}

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: [defaultNS],
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false // React already escapes
  }
})

export default i18n
