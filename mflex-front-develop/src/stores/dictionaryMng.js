import { defineStore } from 'pinia';

import {
  getIncludeJobTerm,
  getIncludeJobWord,
  getIncludeJobDomain,
} from '@/utils/cookies';

export const useDictionaryMngStore = defineStore('dictionaryMng', {
  state: () => ({
    // 용어등록 상태
    termJobData: {}, // 용어작업 데이터
    termJobUpdateData: {}, // 용어작업 업데이트 데이터
    isTermJobUpdate: false, // 용어작업 컴포넌트 렌더링 상태
    isTermJobSave: false, // 용어작업 저장 여부
    isTermJobApproval: false, // 용어작업 승인 여부
    isTermJobCancel: false, // 용어작업 취소 여부
    isTermJobVisible: JSON.parse(getIncludeJobTerm()) || true, // 작업용어 그리드 표시 여부
    termSourceCode: 'MNG', // 관리/작업용어 구분
    isTermJobState: false, // 용어작업 상태

    // 단어 관리 상태
    wordJobData: {}, // 단어작업 데이터
    wordJobUpdateData: {}, // 단어작업 업데이트 데이터
    isWordJobUpdate: false, // 단어작업 컴포넌트 렌더링 상태
    isWordJobSave: false, // 단어작업 저장 여부
    isWordJobApproval: false, // 단어작업 승인 여부
    isWordJobCancel: false, // 단어작업 취소 여부
    isWordJobVisible: JSON.parse(getIncludeJobWord()) || true, // 작업단어 그리드 표시 여부

    // 도메인 관리 상태
    domainTreeData: {}, // 도메인트리 데이터
    selectDomainMngData: {}, // 선택도메인 데이터
    domainJobData: {}, // 도메인작업 데이터
    isDomainJobType: '', // 도메인작업 컴포넌트 렌더링 상태,
    isDomainJobSave: false, // 도메인작업 저장 여부
    isDomainJobApproval: false, // 도메인작업 승인 여부
    isDomainJobCancel: false, // 도메인작업 취소 여부
    isDomainJobVisible: JSON.parse(getIncludeJobDomain()) || true, // 작업도메인 그리드 표시 여부

    // 코드등록 상태
    codeNameJobData: {}, // 코드명작업 데이터
    codeValueJobData: {}, // 코드값작업 데이터
    codeNameJobUpdateData: {}, // 코드명작업 업데이트 데이터
    codeValueJobUpdateData: {}, // 코드값작업 업데이트 데이터
    codeJobSelectData: {}, // 코드작업 데이터
    isCodeJobType: '', // 코드명작업 컴포넌트 렌더링 상태
    isCodeJobSave: false, // 코드명작업 저장 여부
    isCodeJobApproval: false, // 코드명작업 승인 여부
    isCodeJobVisible: true, // 코드명작업 그리드 표시 여부
  }),

  getters: {
    // 용어등록 getter
    getTermJobData(state) {
      return state.termJobData;
    },
    getTermJobUpdateData(state) {
      return state.termJobUpdateData;
    },
    getIsTermJobUpdate(state) {
      return state.isTermJobUpdate;
    },
    getIsTermJobSave(state) {
      return state.isTermJobSave;
    },
    getIsTermJobApproval(state) {
      return state.isTermJobApproval;
    },
    getIsTermJobCancel(state) {
      console.log('용어취소:', state.isTermJobCancel);
      return state.isTermJobCancel;
    },
    getIsTermJobVisible(state) {
      return state.isTermJobVisible;
    },
    getTermSourceCode(state) {
      return state.termSourceCode;
    },

    // 단어등록 getter

    // 단어 작업 데이터
    getWordJobData(state) {
      return state.wordJobData;
    },
    // 단어 작업 업데이트 데이터
    getWordJobUpdateData(state) {
      return state.wordJobUpdateData;
    },
    // 단어작업 컴포넌트 렌더링 상태
    getIsWordJobUpdate(state) {
      return state.isWordJobUpdate;
    },
    // 단어작업 성공 여부
    getIsWordJobSave(state) {
      return state.isWordJobSave;
    },
    // 단어작업 승인 여부
    getIsWordJobApproval(state) {
      return state.isWordJobApproval;
    },
    // 단어작업 취소 여부
    getIsWordJobCancel(state) {
      return state.isWordJobCancel;
    },
    // 단어작업 그리드 표시 여부
    getIsWordJobVisible(state) {
      return state.isWordJobVisible;
    },

    // 도메인등록 getter
    getDomainTreeData(state) {
      return state.domainTreeData;
    },
    getDomainJobData(state) {
      return state.domainJobData;
    },
    getIsDomainJobType(state) {
      return state.isDomainJobType;
    },
    getIsDomainJobSave(state) {
      return state.isDomainJobSave;
    },
    getIsDomainJobApproval(state) {
      return state.isDomainJobApproval;
    },
    getDomainJobCancel(state) {
      return state.isDomainJobCancel;
    },
    getIsDomainJobVisible(state) {
      return state.isDomainJobVisible;
    },
    getSelectDomainMngData(state) {
      return state.selectDomainMngData;
    },

    // 코드등록 getter
    getCodeNameJobData(state) {
      return state.codeNameJobData;
    },
    getCodeValueJobData(state) {
      return state.codeValueJobData;
    },
    getCodeNameJobUpdateData(state) {
      return state.codeNameJobUpdateData;
    },
    getCodeValueJobUpdateData(state) {
      return state.codeValueJobUpdateData;
    },
    getIsCodeJobType(state) {
      return state.isCodeJobType;
    },
    getIsCodeJobSave(state) {
      return state.isCodeJobSave;
    },
    getIsCodeJobApproval(state) {
      return state.isCodeJobApproval;
    },
    getCodeJobSelectData(state) {
      return state.codeJobSelectData;
    },
    getIsCodeJobVisible(state) {
      return state.isCodeJobVisible;
    },
  },
  actions: {
    // 용어등록 actions

    // 용어작업 데이터 설정
    setTermJobData(state) {
      this.termJobData = state;
    },
    // 용어작업 업데이트 데이터 설정
    setTermJobUpdateData(state) {
      this.termJobUpdateData = state;
    },
    // 용어작업 렌더링 컴포넌트 상태 설정
    setIsTermJobUpdate(state) {
      this.isTermJobUpdate = state;
    },
    // 용어작업 성공 여부 설정
    setIsTermJobSave(state) {
      this.isTermJobSave = state;
    },
    // 용어작업 승인 여부 설정
    setIsTermJobApproval(state) {
      this.isTermJobApproval = state;
    },
    // 용어작업 취소 여부 설정
    setIsTermJobCancel(state) {
      this.isTermJobCancel = state;
    },
    // 용어작업 그리드 표시 여부 설정
    setIsTermJobVisible(state) {
      this.isTermJobVisible = state;
    },
    // 용어작업 구분 설정
    setTermSourceCode(state) {
      this.termSourceCode = state;
    },
    setIsTermJobState(state) {
      this.isTermJobState = state;
    },

    // 단어등록 actions

    // 단어 작업 데이터 설정
    setWordJobData(state) {
      this.wordJobData = state;
    },
    // 단어 작업 업데이트 데이터 설정
    setWordJobUpdateData(state) {
      this.wordJobUpdateData = state;
    },
    // 단어 작업 렌더링 컴포넌트 상태 설정
    setIsWordJobUpdate(state) {
      this.isWordJobUpdate = state;
    },
    // 단어작업 성공 여부 설정
    setIsWordJobSave(state) {
      this.isWordJobSave = state;
    },
    // 단어작업 승인 여부 설정
    setIsWordJobApproval(state) {
      this.isWordJobApproval = state;
    },
    // 단어작업 취소 여부 설정
    setIsWordJobCancel(state) {
      this.isWordJobCancel = state;
    },
    // 단어작업 그리드 표시 여부 설정
    setIsWordJobVisible(state) {
      this.isWordJobVisible = state;
    },

    // 도메인등록 actions
    // 도메인작업 데이터 설정
    setDomainTreeData(state) {
      this.domainTreeData = state;
    },
    setDomainJobData(state) {
      this.domainJobData = state;
    },
    // 도메인작업 렌더링 컴포넌트 상태 설정
    setIsDomainJobType(state) {
      this.isDomainJobType = state;
    },
    // 도메인작업 성공 여부 설정
    setIsDomainJobSave(state) {
      this.isDomainJobSave = state;
    },
    // 도메인작업 승인 여부 설정
    setIsDomainJobApproval(state) {
      this.isDomainJobApproval = state;
    },
    // 도메인작업 취소 여부 설정
    setIsDomainJobCancel(state) {
      this.isDomainJobCancel = state;
    },
    // 도메인작업 그리드 표시 여부 설정
    setIsDomainJobVisible(state) {
      this.isDomainJobVisible = state;
    },
    // 선택도메인 데이터 설정
    setSelectDomainMngData(state) {
      this.selectDomainMngData = state;
    },

    // 코드등록 actions
    setCodeNameJobData(state) {
      console.log('코드명작업 데이터:', state);
      this.codeNameJobData = state;
    },
    setCodeValueJobData(state) {
      this.codeValueJobData = state;
    },
    setCodeNameJobUpdateData(state) {
      this.codeNameJobUpdateData = state;
    },
    setCodeValueJobUpdateData(state) {
      this.codeValueJobUpdateData = state;
    },
    setIsCodeJobType(state) {
      console.log('코드작업 타입:', state);
      this.isCodeJobType = state;
    },
    setIsCodeJobSave(state) {
      this.isCodeJobSave = state;
    },
    setIsCodeJobApproval(state) {
      this.isCodeJobApproval = state;
    },
    setCodeJobSelectData(state) {
      this.codeJobSelectData = state;
    },
    setIsCodeJobVisible(state) {
      this.isCodeJobVisible = state;
    },
  },
});
