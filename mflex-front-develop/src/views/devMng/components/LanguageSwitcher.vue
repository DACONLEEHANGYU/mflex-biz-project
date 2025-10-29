<!-- components/LanguageSwitcher.vue -->
<template>
  <div class="language-switcher">
    <button
      @click="changeLanguage('ko')"
      :class="{ active: currentLocale === 'ko' }"
      class="lang-btn"
    >
      한국어
    </button>
    <button
      @click="changeLanguage('en')"
      :class="{ active: currentLocale === 'en' }"
      class="lang-btn"
    >
      English
    </button>
    <div class="current-lang">
      현재 언어: {{ currentLocale === 'ko' ? '한국어' : 'English' }}
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { locale } = useI18n();
  const currentLocale = ref(locale.value);

  const changeLanguage = (lang) => {
    locale.value = lang;
    localStorage.setItem('mflex-locale', lang);
    console.log(`언어가 ${lang}으로 변경되었습니다.`);
  };

  watch(locale, (newLocale) => {
    currentLocale.value = newLocale;
  });
</script>

<style scoped>
  .language-switcher {
    position: fixed;
    top: 120px;
    right: 20px;
    z-index: 9999;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border: 1px solid #ddd;
  }

  .lang-btn {
    padding: 8px 16px;
    margin: 0 5px;
    border: 1px solid #007bff;
    background: white;
    color: #007bff;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .lang-btn:hover {
    background: #f8f9fa;
  }

  .lang-btn.active {
    background: #007bff;
    color: white;
  }

  .current-lang {
    margin-top: 10px;
    font-size: 12px;
    color: #666;
    text-align: center;
  }
</style>
