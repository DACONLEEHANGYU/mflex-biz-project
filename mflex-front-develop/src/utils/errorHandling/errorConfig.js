import { ERROR_TYPES, DIALOG_TYPES, ERROR_ACTIONS } from './errorTypes';

export const ERROR_CONFIG = {
  // 자동 처리 에러 (alert만 표시)
  AUTO_HANDLE_ERRORS: {
    1023: {
      type: DIALOG_TYPES.ALERT,
      message: '테이블 한글명이 중복되었습니다.',
      title: '테이블정제 오류',
    },
    1223: {
      type: DIALOG_TYPES.ALERT,
      message: '동일한 단어명이 이미 존재합니다.',
      title: '단어명 중복',
    },
    1226: {
      type: DIALOG_TYPES.ALERT,
      message: '중복된 용어가 존재합니다.',
      title: '용어 중복',
    },
    1227: {
      type: DIALOG_TYPES.ALERT,
      message: '용어명이 중복되었습니다.',
      title: '용어명 중복',
    },
    1228: {
      type: DIALOG_TYPES.ALERT,
      message: '해당 단어는 분류어로 사용 중입니다.',
      title: '분류어 사용 중',
    },
    1229: {
      type: DIALOG_TYPES.ALERT,
      message: '이음동의어가 이미 존재합니다.',
      title: '이음동의어 중복',
    },
    1231: {
      type: DIALOG_TYPES.ALERT,
      message: '연관용어로 사용 중입니다.',
      title: '연관용어 사용 중',
    },
    1232: {
      type: DIALOG_TYPES.ALERT,
      message: '해당 항목은 사용 중입니다.',
      title: '사용 중',
    },
  },

  // 컴포넌트에서 처리할 에러 (confirm 등 추가 작업 필요)
  COMPONENT_HANDLE_ERRORS: {
    1224: {
      type: DIALOG_TYPES.CONFIRM,
      message:
        '동일한 용어영문약어명/도메인명에 다른 용어명이 존재합니다. 해당 용어를 이음동의어로 등록하시겠습니까?',
      title: '이음동의어 등록 확인',
      action: ERROR_ACTIONS.SYNONYM_REGISTER,
    },
    1225: {
      type: DIALOG_TYPES.CONFIRM,
      message:
        '동일한 용어명/용어영문약어명에 다른 도메인명이 존재합니다. 해당 용어를 비표준용어로 등록 하시겠습니까?',
      title: '비표준용어 등록 확인',
      action: ERROR_ACTIONS.NONSTANDARD_REGISTER,
    },
  },

  // 기본 에러 메시지
  DEFAULT_ERROR: {
    type: DIALOG_TYPES.ALERT,
    message:
      '서버에 알 수 없는 오류가 발생하였습니다. 관리자에게 문의해주세요.',
    title: '시스템 오류',
  },
};

// 에러 타입 확인 함수
export const getErrorType = (errorCode) => {
  if (ERROR_CONFIG.AUTO_HANDLE_ERRORS[errorCode]) {
    return ERROR_TYPES.AUTO;
  }
  if (ERROR_CONFIG.COMPONENT_HANDLE_ERRORS[errorCode]) {
    return ERROR_TYPES.COMPONENT;
  }
  return ERROR_TYPES.DEFAULT;
};

// 에러 설정 가져오기 함수
export const getErrorConfig = (errorCode) => {
  return (
    ERROR_CONFIG.AUTO_HANDLE_ERRORS[errorCode] ||
    ERROR_CONFIG.COMPONENT_HANDLE_ERRORS[errorCode] ||
    ERROR_CONFIG.DEFAULT_ERROR
  );
};
