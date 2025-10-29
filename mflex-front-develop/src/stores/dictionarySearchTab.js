import { defineStore } from 'pinia';

export const useDictionarySaerchTabStore = defineStore('dictionarySearchTab', {
  state: () => ({
    searchTabState: 'term',
  }),

  getters: {
    getSearchTabState(state) {
      return state.searchTabState;
    },
  },

  actions: {
    setSearchTabState(state) {
      this.searchTabState = state;
    },
  },
});
