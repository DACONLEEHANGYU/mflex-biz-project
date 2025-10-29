import { defineStore } from 'pinia';

export const useBizMetaStore = defineStore('bizMeta', {
  state: () => ({
    bizTermList: [],
    selectedBizTerm: null,
    isUpdate: false,
  }),
  actions: {
    setBizTermList(terms) {
      this.bizTermList = terms;
    },
    setSelectedBizTerm(term) {
      this.selectedBizTerm = term;
    },
    setIsUpdate(status) {
      this.isUpdate = status;
    },
  },
});
