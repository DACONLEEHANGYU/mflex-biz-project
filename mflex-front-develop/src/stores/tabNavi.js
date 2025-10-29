import { defineStore } from 'pinia';
import {
  getTabNaviStorage,
  getTabNaviIndexStorage,
  saveTabNaviStorage,
  saveTabNaviIndexStorage,
  getStepStateStorage,
  saveActualizingStepStateStorage,
  getActualizingStepStateStorage,
} from '@/utils/cookies';
import router from '@/router/index';
import { useAlert } from '@/composables/alert';
// import { deleteStorage } from '@/utils/cookies';

export const useTabNaviStore = defineStore('tabNavi', {
  state: () => ({
    tabData: JSON.parse(getTabNaviStorage()) || [],
    selectIndex: Number(getTabNaviIndexStorage()) || 0,
    swiper: null,
    dictionaryMngState: getStepStateStorage(),
    actualizingState: getActualizingStepStateStorage(),
    ischangeTab: false,
  }),
  getters: {
    getTabData(state) {
      return state.tabData;
    },
    getSelectIndex(state) {
      return state.selectIndex;
    },
    getSwiper(state) {
      return state.swiper;
    },
    getDictionaryMngState(state) {
      return state.dictionaryMngState;
    },
    getActualizingState(state) {
      return state.actual;
    },
  },
  actions: {
    setTabNaviData(state) {
      const { title } = state;
      const result = this.tabData.filter((tab) => tab.title === title);
      if (result.length > 0) {
        // console.log('tab 활성화만 실행');
        const index = this.tabData.findIndex((tab) => tab.title === title);
        this.selectIndex = index;
        saveTabNaviIndexStorage(index);
        setTimeout(() => {
          this.swiper.slideTo(this.selectIndex);
        }, 100);
        return;
      }
      this.tabData.push(state);
      saveTabNaviStorage(this.tabData);
      this.selectIndex = this.tabData.length - 1;
      saveTabNaviIndexStorage(this.tabData.length - 1);
      if (this.tabData.length === 1) return;
      setTimeout(() => {
        this.swiper.slideTo(1000);
      }, 100);
    },
    setSelectIndex(state) {
      this.selectIndex = state;
      const selectPath = this.tabData[this.selectIndex].path;
      router.replace(selectPath);
      saveTabNaviIndexStorage(state);
    },
    setSwiper(state) {
      this.swiper = state;
    },
    removeTabNavi(index) {
      this.tabData.splice(index, 1);
      if (this.tabData.length === 1) {
        console.log('Total : 1');
        this.selectIndex = 0;
        saveTabNaviIndexStorage(this.selectIndex);
      } else if (this.selectIndex >= this.tabData.length) {
        console.log('Total : 마지막 선택');
        this.selectIndex = this.tabData.length - 1;
        saveTabNaviIndexStorage(this.selectIndex);
      }
      saveTabNaviStorage(this.tabData);
      console.log('[this.selectIndex] = ', this.selectIndex);
      console.log('[this.tabData] = ', this.tabData);
      console.log('[this.tabData.length] = ', this.tabData.length);
      const selectPath = this.tabData[this.selectIndex].path;

      router.replace(selectPath);
    },
    // 탭 초기화
    resetTabNavi() {
      this.tabData = [];
      this.selectIndex = 0;
    },
    setDictionaryMngState(state) {
      this.dictionaryMngState = state;
    },
    setActualizingState(state) {
      this.actualizingState = state;
    },
    setIsChangeTab(state) {
      this.ischangeTab = state;
    },
  },
});
