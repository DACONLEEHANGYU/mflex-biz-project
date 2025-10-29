import { reactive, ref } from 'vue';
import {
  ERROR_CONFIG,
  getErrorType,
  getErrorConfig,
} from '@/utils/errorHandling/errorConfig';
import { ERROR_TYPES } from '@/utils/errorHandling/errorTypes';
import { useAlert } from '@/composables/useAlert';

export function useErrorHandler() {
  const { setAlertStatus } = useAlert();

  // 전역 에러 상태 (여러 컴포넌트에서 공유 가능)
  const errorState = reactive({
    isVisible: false,
    type: '',
    title: '',
    message: '',
    action: '',
    errorCode: null,
    originalError: null,
    resolveCallback: null,
  });

  // 에러 핸들링 메인 함수
  const handleError = async (error, options = {}) => {
    console.log('Error handling:', error);

    const errorCode = error?.data?.code || error?.response?.data?.code;
    const { autoHandle = true } = options;

    if (!errorCode) {
      // 에러 코드가 없는 경우 기본 에러 처리
      if (autoHandle) {
        await setAlertStatus({
          view: true,
          message: ERROR_CONFIG.DEFAULT_ERROR.message,
          title: ERROR_CONFIG.DEFAULT_ERROR.title,
        });
      }
      return { handled: autoHandle, type: ERROR_TYPES.DEFAULT };
    }

    const errorType = getErrorType(errorCode);
    const errorConfig = getErrorConfig(errorCode);

    switch (errorType) {
      case ERROR_TYPES.AUTO:
        // 자동 처리 - alert만 표시
        if (autoHandle) {
          await setAlertStatus({
            view: true,
            message: errorConfig.message,
            title: errorConfig.title,
          });
        }
        return {
          handled: autoHandle,
          type: ERROR_TYPES.AUTO,
          config: errorConfig,
        };

      case ERROR_TYPES.COMPONENT:
        // 컴포넌트에서 처리 - Promise를 반환하여 결과 대기
        return new Promise((resolve) => {
          errorState.isVisible = true;
          errorState.type = errorConfig.type;
          errorState.title = errorConfig.title;
          errorState.message = errorConfig.message;
          errorState.action = errorConfig.action;
          errorState.errorCode = errorCode;
          errorState.originalError = error;
          errorState.resolveCallback = resolve;
        });

      default:
        // 기본 에러 처리
        if (autoHandle) {
          await setAlertStatus({
            view: true,
            message: ERROR_CONFIG.DEFAULT_ERROR.message,
            title: ERROR_CONFIG.DEFAULT_ERROR.title,
          });
        }
        return { handled: autoHandle, type: ERROR_TYPES.DEFAULT };
    }
  };

  // 에러 해결 함수
  const resolveError = (result = 'cancel') => {
    const callback = errorState.resolveCallback;

    // 상태 초기화
    errorState.isVisible = false;
    errorState.type = '';
    errorState.title = '';
    errorState.message = '';
    errorState.action = '';
    errorState.errorCode = null;
    errorState.originalError = null;
    errorState.resolveCallback = null;

    // 콜백 실행
    if (callback) {
      callback({
        handled: false,
        type: ERROR_TYPES.COMPONENT,
        result,
        action: errorState.action,
        errorCode: errorState.errorCode,
      });
    }
  };

  // 특정 에러 코드인지 확인
  const isErrorCode = (error, targetCode) => {
    const errorCode = error?.data?.code || error?.response?.data?.code;
    return errorCode === targetCode;
  };

  // 여러 에러 코드 중 하나인지 확인
  const isAnyErrorCode = (error, targetCodes) => {
    const errorCode = error?.data?.code || error?.response?.data?.code;
    return targetCodes.includes(errorCode);
  };

  return {
    errorState,
    handleError,
    resolveError,
    isErrorCode,
    isAnyErrorCode,
  };
}
