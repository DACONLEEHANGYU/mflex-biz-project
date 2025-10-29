import { defineStore } from 'pinia';

export const useSchemaSearchTabStore = defineStore('schemaSearchTab', {
  state: () => ({
    // 테이블 조회 데이터
    selectTableData: {},
    selectColumnData: {},
    selectPrimaryKeyData: {},
    selectForeignKeyData: {},
    selectIndexData: {},
    selectTriggerData: {},
    searchTabState: 'table',
  }),
  getters: {
    getSearchTabState(state) {
      return state.searchTabState;
    },
    getTableData(state) {
      return state.selectTableData;
    },
    getColumnData(state) {
      return state.selectColumnData;
    },
    getPrimaryKeyData(state) {
      return state.selectPrimaryKeyData;
    },
    getForeignKeyData(state) {
      return state.selectForeignKeyData;
    },
    getIndexData(state) {
      return state.selectIndexData;
    },
    getTriggerData(state) {
      return state.selectTriggerData;
    },
  },
  actions: {
    setSearchTabState(state) {
      this.searchTabState = state;
    },
    setTableData(data) {
      this.selectTableData = data;
    },
    setColumnData(data) {
      this.selectColumnData = data;
    },
    setPrimaryKeyData(data) {
      this.selectPrimaryKeyData = data;
    },
    setForeignKeyData(data) {
      this.selectForeignKeyData = data;
    },
    setIndexData(data) {
      this.selectIndexData = data;
    },
    setTriggerData(data) {
      this.selectTriggerData = data;
    },
  },
});
