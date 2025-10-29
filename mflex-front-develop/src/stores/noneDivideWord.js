import { defineStore } from 'pinia';

export const useNoneDivideWordStore = defineStore('noneDivideWord', {
  state: () => ({
    noneDivideWord: '',
  }),
  getters: {
    getNoneDivideWord(state) {
      return state.noneDivideWord;
    },
  },
  actions: {
    setNoneDivideWord(noneDivideWord) {
      this.noneDivideWord = noneDivideWord;
    },
  },
});
