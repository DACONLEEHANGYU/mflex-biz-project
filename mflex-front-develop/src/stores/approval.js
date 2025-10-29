import { defineStore } from 'pinia';

export const useApprovalStore = defineStore('approval', {
  state: () => ({
    selectApprovalLine: {}, // 선택된 결재선 정보
    isUpdateApprovalLine: {
      isUpdate: false, // 결재선 수정 여부
      approvalLineId: null, // 수정할 결재선 ID
    }, // 결재선 수정 여부

    requestCount: 0, // 결재요청문서 건수
    requestDetailsCount: 0, // 결재요청문서 상세 건수

    pendingCount: 0, // 결재 할 문서 건수
    pendingDetailsCount: 0, // 결재 할 문서 상세 건수

    completeCount: 0, // 완료 건수
    completeDetailsCount: 0, // 완료문서

    isUpdate: false, // 업데이트 여부
  }),
  actions: {
    setSelectApprovalLine(state) {
      this.selectApprovalLine = state;
    },
    setIsUpdateApprovalLine(state) {
      this.isUpdateApprovalLine = state;
    },
    setRequestCount(state) {
      this.requestCount = state;
    },
    setRequestDetailsCount(state) {
      this.requestDetailsCount = state;
    },
    setPendingCount(state) {
      this.pendingCount = state;
    },
    setPendingDetailsCount(state) {
      this.pendingDetailsCount = state;
    },
    setCompleteCount(state) {
      this.completeCount = state;
    },
    setCompleteDetailsCount(state) {
      this.completeDetailsCount = state;
    },
    setIsUpdate(state) {
      this.isUpdate = state;
    },
  },
});
