import { defineStore } from 'pinia';

export const useSliderStore = defineStore('slider', {
  state: () => ({
    sliderInfos: {
      view: false,
      message: '',
    },
  }),
  actions: {
    setSliderStatus(state) {
      this.sliderInfos = state;
    },
  },
});
