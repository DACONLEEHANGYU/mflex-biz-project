import { defineStore } from 'pinia';

export const useSchemaCollectionStore = defineStore('schemaCollection', {
  state: () => ({
    // 스키마 컬렉션 상태
    tabState: 1, // 탭 상태
    // 연결정보
    regState: 'search', // 작업구분
    connectionList: [], // DB연결정보 목록
    selectDbInfo: {}, // 선택된 DB연결정보
    selectDbDetails: {}, // 선택된 DB연결정보 Details
    dbConnectionTestState: false, // DB연결 테스트 상태
    schemaCollectionState: false, // 스키마 수집 상태
    selectJobState: false, // 선택된 작업 상태
    saveState: 0, // 저장 상태
    saveDatabaseId: '', // 저장된 DB ID
    selectCollection: '', // 선택된 컬렉션
    updateManageDB: false, // 업데이트 관리
    selectTableList: '', // 선택된 테이블
    selectFunctionList: '', // 선택된 함수
    selectProcedureList: '', // 선택된 프로시저

    onlineYnState: true, // 온라인 여부

    isExcludeTable: false, // 제외 테이블 여부
    isExcludeFunction: false, // 제외 함수 여부
    isExcludeProcedure: false, // 제외 프로시저 여부
  }),
  getters: {
    // 탭 상태
    getTabState(state) {
      return this.tabState;
    },
    // 선택 DB연결 정보 Details
    getDbInfo(state) {
      return this.selectDbInfo;
    },
    // 작업구분
    getRegState(state) {
      return this.regState;
    },
    // DB연결 테스트 상태
    getDbConnectionTestState(state) {
      return this.dbConnectionTestState;
    },
    // 스키마 수집 상태
    getSchemaCollectionState(state) {
      return this.schemaCollectionState;
    },
    // 저장 상태
    getSaveState(state) {
      return this.saveState;
    },
    getSaveDatabaseId(state) {
      return this.saveDatabaseId;
    },
    getSelectDbDetails(state) {
      return this.selectDbDetails;
    },
    getSelectCollection(state) {
      return this.selectCollection;
    },
    getSelectJobState(state) {
      return this.selectJobState;
    },
    getUpdateManageDB(state) {
      return this.updateManageDB;
    },
    getSelectTableList(state) {
      return this.selectTableList;
    },
    getSelectFunctionList(state) {
      return this.selectFunctionList;
    },
    getSelectProcedureList(state) {
      return this.selectProcedureList;
    },
    getOnlineYnState(state) {
      return this.onlineYnState;
    },
    getIsExcludeTable(state) {
      return this.isExcludeTable;
    },
    getIsExcludeFunction(state) {
      return this.isExcludeFunction;
    },
    getIsExcludeProcedure(state) {
      return this.isExcludeProcedure;
    },
  },
  actions: {
    // 탭 상태
    setTabState(state) {
      console.log('schemaCollection-state', state);
      this.tabState = state;
    },
    // 선택 DB연결 정보 Details
    setDbInfo(state) {
      console.log('schemaInfo-state', state);
      this.selectDbInfo = state;
    },
    // 작업구분
    setRegState(state) {
      this.regState = state;
    },
    // DB연결 테스트 상태
    setDbConnectionTestState(state) {
      this.dbConnectionTestState = state;
    },
    // 스키마 수집 상태
    setSchemaCollectionState(state) {
      this.schemaCollectionState = state;
    },
    // 저장 상태
    setSaveState(state) {
      this.saveState = state;
    },
    setSaveDatabaseId(state) {
      this.saveDatabaseId = state;
    },
    setSelectDbDetails(state) {
      this.selectDbDetails = state;
    },
    setSelectCollection(state) {
      this.selectCollection = state;
    },
    setSelectJobState(state) {
      this.selectJobState = state;
    },
    setUpdateManageDB(state) {
      this.updateManageDB = state;
    },
    setSelectTableList(state) {
      this.selectTableList = state;
    },
    setSelectFunctionList(state) {
      this.selectFunctionList = state;
    },
    setSelectProcedureList(state) {
      this.selectProcedureList = state;
    },
    setOnlineYnState(state) {
      this.onlineYnState = state;
    },
    setIsExcludeTable(state) {
      this.isExcludeTable = state;
    },
    setIsExcludeFunction(state) {
      this.isExcludeFunction = state;
    },
    setIsExcludeProcedure(state) {
      this.isExcludeProcedure = state;
    },
    setConnectionList(state) {
      this.connectionList = state;
    },
  },
});
