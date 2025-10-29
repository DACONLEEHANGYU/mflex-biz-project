// stores/gridIds.js
import { defineStore } from 'pinia';

export const useGridIdsStore = defineStore('gridIds', {
  state: () => ({
    // 사전 검색 관련 그리드 ID들
    dictionarySearch: {
      termSearchTopGrid: 'MFGRD017',
      termSearchBottomGrid: 'MFGRD018',
      wordSearchTopGrid: 'MFGRD019',
      wordSearchBottomGrid: 'MFGRD020',
      domainSearchTopGrid: 'MFGRD021',
      domainSearchBottomGrid: 'MFGRD022',
      codeSearchTopGrid: 'MFGRD023',
      codeSearchBottomGrid: 'MFGRD024',
    },

    // 사용자 관리 관련 그리드 ID들
    userManagement: {
      userListGrid: 'MFGRD001',
      userResourceGrid: 'MFGRD002',
      userPermissionGrid: 'MFGRD003',
    },

    // 시스템 관리 관련 그리드 ID들
    systemManagement: {
      instituteGrid: 'MFGRD004',
      systemGrid: 'MFGRD005',
      dictionaryGrid: 'MFGRD006',
    },

    // 데이터 관리 관련 그리드 ID들
    dataManagement: {
      termGrid: 'MFGRD007',
      wordGrid: 'MFGRD008',
      domainGrid: 'MFGRD009',
      codeGrid: 'MFGRD010',
      synonymGrid: 'MFGRD011',
    },

    // 표준화 관련 그리드 ID들
    standardization: {
      requestGrid: 'MFGRD012',
      approvalGrid: 'MFGRD013',
      historyGrid: 'MFGRD014',
    },

    // 리포트 관련 그리드 ID들
    reports: {
      termReportGrid: 'MFGRD015',
      usageReportGrid: 'MFGRD016',
    },
  }),

  getters: {
    // 특정 카테고리의 그리드 ID들을 반환
    getDictionarySearchGridIds: (state) => state.dictionarySearch,
    getUserManagementGridIds: (state) => state.userManagement,
    getSystemManagementGridIds: (state) => state.systemManagement,
    getDataManagementGridIds: (state) => state.dataManagement,
    getStandardizationGridIds: (state) => state.standardization,
    getReportsGridIds: (state) => state.reports,

    // 모든 그리드 ID를 플랫 객체로 반환
    getAllGridIds: (state) => {
      const allIds = {};
      Object.values(state).forEach((category) => {
        Object.assign(allIds, category);
      });
      return allIds;
    },

    // 특정 그리드 ID 검색
    getGridId: (state) => (category, gridName) => {
      return state[category]?.[gridName] || null;
    },
  },

  actions: {},
});
