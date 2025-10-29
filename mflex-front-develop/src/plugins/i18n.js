import { createI18n } from 'vue-i18n';
import messages from '@/locales';

// 브라우저 언어 감지 또는 로컬 스토리지에서 언어 설정 불러오기
const getDefaultLocale = () => {
  const savedLocale = localStorage.getItem('mflex-locale');
  if (savedLocale && ['ko', 'en'].includes(savedLocale)) {
    return savedLocale;
  }

  // 브라우저 언어 감지
  const browserLocale = navigator.language.split('-')[0];
  return ['ko', 'en'].includes(browserLocale) ? browserLocale : 'ko';
};

const i18n = createI18n({
  legacy: false, // Vue 3 Composition API 사용
  locale: getDefaultLocale(),
  fallbackLocale: 'ko',
  messages,
  globalInjection: true, // 전역에서 $t 사용 가능
});

export default i18n;
