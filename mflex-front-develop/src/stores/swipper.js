import { defineStore } from 'pinia';
import {
  getSwipperStateStorage,
  saveSwipperStateStorage,
} from '../utils/cookies';

export const useSwipperStore = defineStore('swipper', {
  state: () => ({
    swipper: getSwipperStateStorage() || true,
  }),
  actions: {
    setSwipperStatus(state) {
      saveSwipperStateStorage(state);
      this.swipper = state;
    },
  },
});
