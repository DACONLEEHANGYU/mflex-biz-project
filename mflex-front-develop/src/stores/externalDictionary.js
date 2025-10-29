import { defineStore } from 'pinia';

export const useExternalDictionaryStore = defineStore('external', {
  state: () => ({
    // 공식사전관리
    selectExternalDictionary: {},
    saveState: false,
    newDictionaryId: null,

    // 기관별 공식사전관리
    externalDictionaryByInst: {},
    externalDictionaryByInstSaveState: false,
    selectInstituteId: null,
    externalTreeData: {},

    // 공식사전버전관리
    externalDictionaryVersion: {},
    termData: {},
    wordData: {},
    domainData: {},
    fileUploadState: false,
  }),
  actions: {
    setSelectExternalDictionary(state) {
      this.selectExternalDictionary = state;
    },
    setSaveState(state) {
      this.saveState = state;
    },
    setNewDictionaryId(state) {
      this.newDictionaryId = state;
    },
    setExternalDictionaryByInst(state) {
      this.externalDictionaryByInst = state;
    },
    setExternalDictionaryByInstSaveState(state) {
      this.externalDictionaryByInstSaveState = state;
    },
    setExternalDictionaryVersion(state) {
      this.externalDictionaryVersion = state;
    },
    setTermData(state) {
      this.termData = state;
    },
    setWordData(state) {
      this.wordData = state;
    },
    setDomainData(state) {
      this.domainData = state;
    },
    resetData() {
      this.termData = {};
      this.wordData = {};
      this.domainData = {};
    },
    setFileUploadState(state) {
      this.fileUploadState = state;
    },
    setSelectInstituteId(state) {
      this.selectInstituteId = state;
    },
    setDictionaryByInstSaveState(state) {
      this.dictionaryByInstSaveState = state;
    },
    setExternalTreeData(state) {
      this.externalTreeData = state;
    },
  },
});
