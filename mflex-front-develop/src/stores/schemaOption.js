import { defineStore } from 'pinia';

export const useSchemaOptionStore = defineStore('schemaOption', {
  state: () => ({
    selectTableInfo: {}, // 선택된 테이블 정보
  }),
  getters: {
    // 탭 상
    getSelectTableInfo(state) {
      return this.selectTableInfo;
    },
  },
  actions: {
    // 탭 상태
    setSelectTableInfo(tableInfo) {
      this.selectTableInfo = tableInfo;
    },
  },
});
