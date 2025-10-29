import { defineStore } from 'pinia';

export const useSystemMngStore = defineStore('systemMng', {
  state: () => ({
    // 선택 시스템
    selectSystem: {},
    newSystemId: '',

    // 선택 기관
    selectInstitute: {},
    newInstituteId: '',

    saveInstState: false, // 기관 저장 상태

    saveState: 0,
    // 저장 상태
    deleteState: false,

    // 정보시스템 설정
    selectSystemInstituteId: '', // 선택 시스템 기관 ID

    // 데이터베이스 설정
    selectDatabaseInfo: {},
    newDatabaseId: '',
    saveDatabaseState: false,
    deleteDatabaseState: false,
    selectDatabaseInstituteId: '', // 선택 데이터베이스 기관 ID

    // 조직
    selectGroup: {}, // 선택 조직
    saveGroupState: false, // 조직 저장 상태

    // 사용자 현황
    updateResource: false, // 사용자 현황 업데이트 상태
  }),
  getters: {
    // 선택 시스템 반환
    getSelectSystem(state) {
      return state.selectSystem;
    },
    // 저장 상태 반환
    getSaveState(state) {
      return state.saveState;
    },
    // 삭제 상태 반환
    getDeleteState(state) {
      return state.deleteState;
    },
    // 새로운 시스템 ID 반환
    getNewSystemId(state) {
      return state.newSystemId;
    },
    // 선택 기관 반환
    getSelectInstitute(state) {
      return state.selectInstitute;
    },
    // 새로운 기관 ID 반환
    getNewInstituteId(state) {
      return state.newInstituteId;
    },
    // 기관 저장 상태 반환
    getUpdateResource(state) {
      return state.updateResource;
    },
  },
  actions: {
    // 선택 시스템 설정
    setSelectSystem(state) {
      console.log('store setSelectSystem', state);
      this.selectSystem = state;
    },
    // 저장 상태 설정
    setSaveState(state) {
      console.log('store setSaveState', state);
      this.saveState = state;
    },
    // 삭제 상태 설정
    setDeleteState(state) {
      console.log('store setDeleteState', state);
      this.deleteState = state;
    },
    setNewSystemId(state) {
      console.log('store setNewSystemId', state);
      this.newSystemId = state;
    },
    // 선택기관 설정
    setSelectInstitute(state) {
      console.log('store setSelectInstitute', state);
      this.selectInstitute = state;
    },
    // 새로운 기관 ID 설정
    setNewInstituteId(state) {
      console.log('store setNewInstituteId', state);
      this.newInstituteId = state;
    },
    // 기관 저장 상태 설정
    setSaveInstState(state) {
      console.log('store setSaveInstState', state);
      this.saveInstState = state;
    },
    setSelectSystemInstituteId(state) {
      console.log('store setSelectInstituteId', state);
      this.selectSystemInstituteId = state;
    },
    // 선택 데이터베이스 정보 설정
    setSelectDatabaseInfo(state) {
      console.log('store setSelectDatabaseInfo', state);
      this.selectDatabaseInfo = state;
    },
    // 새로운 데이터베이스 ID 설정
    setNewDatabaseId(state) {
      console.log('store setNewDatabaseId', state);
      this.newDatabaseId = state;
    },
    // 데이터베이스 저장 상태 설정
    setSaveDatabaseState(state) {
      console.log('store setSaveDatabaseState', state);
      this.saveDatabaseState = state;
    },
    setSelectDatabaseInstituteId(state) {
      console.log('store selectDatabaseInstituteId', state);
      this.selectDatabaseInstituteId = state;
    },
    setDeleteDatabaseState(state) {
      console.log('store setDeleteDatabaseState', state);
      this.deleteDatabaseState = state;
    },
    setUpdateResource(state) {
      console.log('store setUpdateResource', state);
      this.updateResource = state;
    },
    // 선택 조직 설정
    setSelectGroup(state) {
      console.log('store setSelectGroup', state);
      this.selectGroup = state;
    },
    // 조직 저장 상태 설정
    setSaveGroupState(state) {
      console.log('store setSaveGroupState', state);
      this.saveGroupState = state;
    },
  },
});
