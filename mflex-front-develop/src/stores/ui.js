import { defineStore } from 'pinia';
// import { getThemeStorage } from '@/utils/cookies';
import { getGridInfoFromStorage } from '@/utils/cookies';

export const useUiStore = defineStore('ui', {
  state: () => ({
    sideState: 'wide', //wide, small
    headerShadow: false,
    gridApis: null,
    gridApis2: null,
    //gridColumnDefs: new Map(), // 그리드별 컬럼 정의 Map 추가
    gridColumnDefs: JSON.parse(getGridInfoFromStorage()) || {}, // 그리드별 컬럼 정의 Map 추가
    // theme: getThemeStorage() || 'dark',
  }),
  getters: {
    getSideState(state) {
      return state.sideState;
    },
    getHeaderShadow(state) {
      return state.headerShadow;
    },
    getGridApis(state) {
      return state.gridApis;
    },
    getGridApis2(state) {
      return state.gridApis2;
    },
    getGridColumnDefs: (state) => {
      return (gridId) => state.gridColumnDefs.get(gridId); // 그리드 ID로 컬럼 정의 배열 가져오기
    },
    // getTheme(state) {
    //   return state.theme;
    // },
  },
  actions: {
    setSideState(state) {
      this.sideState = state;
    },
    setHeaderShadow(state) {
      this.headerShadow = state;
    },
    setGridApis(state) {
      this.gridApis = state;
    },
    setGridApis2(state) {
      this.gridApis2 = state;
    },
    setGridColumnDefs(gridId, columnDefs) {
      /* console.log('this.gridColumnDefs : ', this.gridColumnDefs);
      console.log('setGridColumnDefs', gridId, columnDefs);
      this.gridColumnDefs.set(gridId, columnDefs); // 그리드 ID와 컬럼 정의 배열을 Map에 저장 */
      this.gridColumnDefs[gridId] = columnDefs;
    },
    // setTheme(state) {
    //   this.theme = state;
    // },
  },
});
