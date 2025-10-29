import { defineStore } from 'pinia';

export const useInstituteAdminStore = defineStore('instituteAdmin', {
  state: () => ({
    selectTopInstitute: {}, // 선택 1차 기관 정보
    isUpdateAdminList: false, // 관리자 정보 수정 여부
  }),
  actions: {
    setSelectTopInstitute(state) {
      this.selectTopInstitute = state;
    },
    setIsUpdateAdminList(state) {
      this.isUpdateAdminList = state;
    },
  },
});
