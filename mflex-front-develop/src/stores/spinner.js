import { defineStore } from 'pinia';

export const useSpinnerStore = defineStore('spinner', {
  state: () => ({
    spinnerStatus: false,
    requestCount: 0,
  }),

  actions: {
    setSpinnerStatus(status) {
      if (status) {
        this.requestCount++;
        this.spinnerStatus = true;
      } else {
        this.requestCount--;
        if (this.requestCount <= 0) {
          this.requestCount = 0;
          this.spinnerStatus = false;
        }
      }
    },
  },
});
//   actions: {
//     setSpinnerStatus(state) {
//       this.spinnerStatus = state;
//     },
//   },
// });
