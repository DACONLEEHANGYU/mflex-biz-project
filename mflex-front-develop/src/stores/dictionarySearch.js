import { defineStore } from 'pinia';

import {
  getTermDictionarySearchCode,
  getWordDictionarySearchCode,
  getDomainDictionarySearchCode,
  getCodeDictionarySearchCode,
} from '@/utils/cookies';

export const useDictionarySearchStore = defineStore('dictionarySearch', {
  state: () => ({
    gridId: {
      termSearchTopGrid: 'MFGRD017',
    },

    termViewSelectData: {}, // 용어조회 선택 데이터
    wordViewSelectData: {}, // 단어조회 선택 데이터
    domainViewSelectData: {}, // 도메인조회 선택 데이터
    codeViewSelectData: {}, // 코드조회 선택 데이터

    termDictionarySearchCode:
      JSON.parse(getTermDictionarySearchCode()) || 'ALL', // 용어조회 검색코드
    wordDictionarySearchCode:
      JSON.parse(getWordDictionarySearchCode()) || 'ALL', // 단어조회 검색코드
    domainDictionarySearchCode:
      JSON.parse(getDomainDictionarySearchCode()) || 'ALL', // 도메인조회 검색코드
    codeDictionarySearchCode:
      JSON.parse(getCodeDictionarySearchCode()) || 'ALL', // 코드조회 검색코드
  }),

  getters: {
    getTermViewSelectData(state) {
      return state.termViewSelectData;
    },
    getWordViewSelectData(state) {
      return state.wordViewSelectData;
    },
    getDomainViewSelectData(state) {
      return state.domainViewSelectData;
    },
    getCodeViewSelectData(state) {
      return state.codeViewSelectData;
    },

    getTermDictionarySearchCode(state) {
      return state.termDictionarySearchCode;
    },
    getWordDictionarySearchCode(state) {
      return state.wordDictionarySearchCode;
    },
    getDomainDictionarySearchCode(state) {
      return state.domainDictionarySearchCode;
    },
    getCodeDictionarySearchCode(state) {
      return state.codeDictionarySearchCode;
    },
    getGridId(state) {
      return state.gridId;
    },
  },

  actions: {
    setTermViewSelectData(data) {
      this.termViewSelectData = data;
    },
    setWordViewSelectData(data) {
      this.wordViewSelectData = data;
    },
    setDomainViewSelectData(data) {
      this.domainViewSelectData = data;
    },
    setCodeViewSelectData(data) {
      this.codeViewSelectData = data;
    },

    setTermDictionarySearchCode(data) {
      this.termDictionarySearchCode = data;
      localStorage.setItem('termDictionarySearchCode', JSON.stringify(data));
    },
    setWordDictionarySearchCode(data) {
      this.wordDictionarySearchCode = data;
      localStorage.setItem('wordDictionarySearchCode', JSON.stringify(data));
    },
    setDomainDictionarySearchCode(data) {
      this.domainDictionarySearchCode = data;
      localStorage.setItem('domainDictionarySearchCode', JSON.stringify(data));
    },
    setCodeDictionarySearchCode(data) {
      this.codeDictionarySearchCode = data;
      localStorage.setItem('codeDictionarySearchCode', JSON.stringify(data));
    },
  },
});
