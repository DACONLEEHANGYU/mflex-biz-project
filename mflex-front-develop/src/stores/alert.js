/* import { defineStore } from 'pinia';

export const useAlertStore = defineStore('alert', {
  state: () => ({
    alertInfos: {
      view: false,
      message: '',
    },
  }),
  actions: {
    setAlertStatus(state) {
      this.alertInfos = state;
    },
  },
}); */

import { defineStore } from 'pinia';

export const useAlertStore = defineStore('alert', {
  state: () => ({
    alertInfos: {
      view: false,
      message: '',
    },
    validationInfos: {
      view: false,
      state: 'error',
      stateName: 'duplicate',
      errorTitle: '용어 중복 오류 메시지',
      errorMessages: [''],
    },
  }),
  actions: {
    setAlertStatus(state) {
      this.alertInfos = state;
    },
    setValidationStatus(state) {
      this.validationInfos = state;
    },
    /*   clearAlertStatus() {
      this.alertInfos = {
        view: false,
        message: '',
      };
    }, */
  },
});

// 키보드 이벤트 리스너 등록
/* window.addEventListener('keydown', handleKeyDown);

function handleKeyDown(event) {
  const alertStore = useAlertStore();

  if (event.key === 'Enter' && alertStore.alertInfos.view) {
    alertStore.clearAlertStatus();
  }
} */
