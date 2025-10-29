import { defineStore } from 'pinia';

export const useDiagnosisStore = defineStore('diagnosis', {
  state: () => ({
    selectDataBaseInfo: '',

    selectTargetTable: [],
    selectExcludeTable: [],

    tableExcludeStatus: false,
    tableIncludeStatus: false,

    selectTab2DatabaseId: '',
    selectTab2SchemaName: '',
    selectDiagnosisMetricCode: '',

    selectDiagnosisHistory: {},
    selectHistoryDatabaseId: '',
    selectHistorySchemaName: '',
  }),
  actions: {
    setSelectDataBaseInfo(data) {
      this.selectDataBaseInfo = data;
    },
    setSelectTargetTable(target) {
      this.selectTargetTable = target;
    },
    setSelectExcludeTable(target) {
      this.selectExcludeTable = target;
    },
    setTableExcludeStatus(status) {
      this.tableExcludeStatus = status;
    },
    setTableIncludeStatus(status) {
      this.tableIncludeStatus = status;
    },
    setSelectTab2DatabaseId(data) {
      this.selectTab2DatabaseId = data;
    },
    setSelectTab2SchemaName(data) {
      this.selectTab2SchemaName = data;
    },
    setSelectDiagnosisMetricCode(data) {
      this.selectDiagnosisMetricCode = data;
    },
    setSelectDiagnosisHistory(data) {
      this.selectDiagnosisHistory = data;
    },
    setSelectHistoryDatabaseId(data) {
      this.selectHistoryDatabaseId = data;
    },
    setSelectHistorySchemaName(data) {
      this.selectHistorySchemaName = data;
    },
  },
});
