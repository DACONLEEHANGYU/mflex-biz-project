import { defineStore } from 'pinia';
import {
  getIncludeJobTermActualizing,
  getIncludeJobWordActualizing,
  getIncludeJobDomainActualizing,
} from '@/utils/cookies';

export const useActualizingStore = defineStore('actualizing', {
  state: () => ({
    selectColumnData: {}, // 선택한 컬럼 데이터

    // 용어표준화
    selectTermData: {}, // 선택한 용어 데이터
    selectTermJobData: {}, // 선택한 용어 직업 데이터
    isActualizingTermJobVisible:
      JSON.parse(getIncludeJobTermActualizing()) || true,

    // 단어표준화
    selectWordData: {}, // 선택한 단어 데이터
    selectWordJobData: {}, // 선택한 단어 직업 데이터
    isActualizingWordJobVisible:
      JSON.parse(getIncludeJobWordActualizing()) || true,

    // 도메인표준화
    selectDomainData: {}, // 선택한 도메인 데이터
    selectDomainJobData: {}, // 선택한 도메인 직업 데이터
    isActualizingDomainJobVisible:
      JSON.parse(getIncludeJobDomainActualizing()) || true,

    // 컬럼정제
    isSaveColumnRefine: false, // 컬럼정제 저장여부
  }),
  getters: {
    getSelectColumnData(state) {
      return state.selectColumnData;
    },
    getSelectWordData(state) {
      return state.selectWordData;
    },
    getSelectWordJobData(state) {
      return state.selectWordJobData;
    },
    getSelectTermData(state) {
      return state.selectTermData;
    },
    getSelectTermJobData(state) {
      return state.selectTermJobData;
    },
    getSelectDomainData(state) {
      return state.selectDomainData;
    },
    getSelectDomainJobData(state) {
      return state.selectDomainJobData;
    },
    getIsActualizingWordJobVisible(state) {
      return state.isActualizingWordJobVisible;
    },
    getIsActualizingTermJobVisible(state) {
      return state.isActualizingTermJobVisible;
    },
    getIsActualizingDomainJobVisible(state) {
      return state.isActualizingDomainJobVisible;
    },
    getIsSaveColumnRefine(state) {
      return state.isSaveColumnRefine;
    },
  },
  actions: {
    setSelectColumnData(data) {
      this.selectColumnData = data;
      console.log('setSelectColumnData : ', this.selectColumnData);
    },
    setSelectWordData(data) {
      this.selectWordData = data;
      console.log('setSelectWordData : ', this.selectWordData);
    },
    setSelectWordJobData(data) {
      this.selectWordJobData = data;
      console.log('setSelectWordJobData : ', this.selectWordJobData);
    },
    setSelectTermData(data) {
      this.selectTermData = data;
      console.log('setSelectTermData : ', this.selectTermData);
    },
    setSelectTermJobData(data) {
      this.selectTermJobData = data;
      console.log('setSelectTermJobData : ', this.selectTermJobData);
    },
    setSelectDomainData(data) {
      this.selectDomainData = data;
      console.log('setSelectDomainData : ', this.selectDomainData);
    },
    setSelectDomainJobData(data) {
      this.selectDomainJobData = data;
      console.log('setSelectDomainJobData : ', this.selectDomainJobData);
    },
    setIsActualizingWordJobVisible(state) {
      this.isActualizingWordJobVisible = state;
      console.log(
        'setIsActualizingWordJobVisible : ',
        this.isActualizingWordJobVisible
      );
    },
    setIsActualizingTermJobVisible(state) {
      this.isActualizingTermJobVisible = state;
      console.log(
        'setIsActualizingTermJobVisible : ',
        this.isActualizingTermJobVisible
      );
    },
    setIsActualizingDomainJobVisible(state) {
      this.isActualizingDomainJobVisible = state;
      console.log(
        'setIsActualizingDomainJobVisible : ',
        this.isActualizingDomainJobVisible
      );
    },
    setIsSaveColumnRefine(state) {
      this.isSaveColumnRefine = state;
      console.log('setIsSaveColumnRefine : ', this.isSaveColumnRefine);
    },
  },
});
