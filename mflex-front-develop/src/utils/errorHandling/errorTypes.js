// 에러 타입 정의
export const ERROR_TYPES = {
  AUTO: 'auto', // 자동 처리 (alert만)
  COMPONENT: 'component', // 컴포넌트에서 처리 (confirm 등)
  DEFAULT: 'default', // 기본 에러
};

export const DIALOG_TYPES = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
};

export const ERROR_ACTIONS = {
  SYNONYM_REGISTER: 'synonym_register',
  NONSTANDARD_REGISTER: 'nonstandard_register',
  FORCE_SAVE: 'force_save',
  RETRY: 'retry',
};
