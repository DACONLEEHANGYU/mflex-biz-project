import axios from 'axios';
import { setInterceptors } from './config/interceptors';
import { useAlert } from '@/composables/alert';
import router from '../router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { deleteStorage, deleteCookie } from '@/utils/cookies';
import { isComponentHandleError } from '@/utils/errorHandling/errorCodeMap';
import { ERROR_CONFIG, getErrorType } from '@/utils/errorHandling/errorConfig';
import { ERROR_TYPES } from '@/utils/errorHandling/errorTypes';

const { setAlertStatus } = useAlert();

const $axios = axios.create(
  Object.assign(
    { baseURL: import.meta.env.VITE_APP_API_URL, timeout: 10000 },
    // { baseURL: import.meta.env.VITE_APP_API_URL },
    {}
  )
);

// 타임아웃 알림을 제외할 API 엔드포인트 목록
const timeoutAlertExcludedEndpoints = [];

$axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      // 요청 설정에서 타임아웃 알림 제외 여부 확인
      const skipTimeoutAlert = error.config.skipTimeoutAlert || false;

      // 특정 엔드포인트 제외 확인
      const url = error.config.url;
      const isExcludedEndpoint = timeoutAlertExcludedEndpoints.some(
        (endpoint) => url.includes(endpoint)
      );

      // 알림 제외 설정이 없고 제외 엔드포인트가 아닐 경우에만 알림 표시
      if (!skipTimeoutAlert && !isExcludedEndpoint) {
        setAlertStatus({
          view: true,
          message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
        });
      }
    }
    return Promise.reject(error);
  }
);

// setInterceptors($axios);

function execute(method, url, data, options = {}) {
  console.log('요청 data : ', data);

  // if (data.token) {
  // }
  console.log('요청 options.headers : ', options.headers);
  if (data == typeof Array) {
    data = removeEmptyParams(data);
  }
  return new Promise(function (resolve, reject) {
    let params;
    if (method === 'get') {
      params = { params: data };
    } else {
      params = Array.isArray(data) ? { data: data } : { data };
      console.log('요청 params : ', params);
    }

    // 타임아웃 알림 설정 전달
    const skipTimeoutAlert = options.skipTimeoutAlert || false;
    const requestOptions = { ...options, skipTimeoutAlert };

    $axios({ method, url, ...params, ...requestOptions })
      .then(function (response) {
        console.log(
          'axios response ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ : ',
          response
        );
        resolve(response);
        if (hasInternalError(response) === false) {
          resolve(response);
          console.log('=====> 2');
        } else {
          reject(response);
          console.log('=====> 3');
        }
      })
      .catch(function (err) {
        console.log('========================>end', err);
        if (axios.isCancel(err)) {
          //Vue.vxAlert('처리 중인 요청이 취소되었습니다.');
          // resolve(err);
          console.log('=====> 4');
          console.log({ err });
          reject(err); // 요청이 취소된 경우에도 reject 호출
          return err;
        } else {
          //HTTP STATUS 오류의 경우, vxHttp.catch로 예외를 처리할 수 없음
          console.log('=====> 5');
          console.log(err);
          doErrorHandler(err); //reject(err);
          reject(err); // 오류를 거부
          return err;
        }
      });
  });
}

const $vxHttp = {
  get: (url, params = null, options = {}) => {
    console.log('get', typeof $axios, url, params, options);
    console.log('$axios.interceptors ====', $axios.interceptors);
    setInterceptors($axios);
    return execute('get', url, params, options);
  },
  post: (url, data, options = {}) => {
    console.log('post', url, data, options);
    console.log('$axios.interceptors ====', $axios.interceptors);
    setInterceptors($axios);
    return execute('post', url, data, options);
  },
  put: (url, data, options = {}) => {
    console.log('put url : ', url);
    console.log('put data : ', data);
    console.log('put options : ', options);
    console.log('put', $axios, url, data, options);

    console.log('put $axios.interceptors ====', $axios.interceptors);

    if (url.includes('password')) {
      const instance = axios.create();
      instance.interceptors.request.use((config) => {
        config.headers.Authorization = data.token;
        return config;
      });

      return instance.put(url, data, options);
    } else {
      setInterceptors($axios, data);
      return execute('put', url, data, options);
    }
  },
  patch: (url, data, options = {}) => {
    setInterceptors($axios);
    return execute('patch', url, data, options);
  },
  delete: (url, data, options = {}) => {
    setInterceptors($axios);
    return execute('delete', url, data, options);
  },

  // 타임아웃 알림을 제외할 API 엔드포인트 추가 메서드
  addTimeoutAlertExcludedEndpoint: (endpoint) => {
    if (!timeoutAlertExcludedEndpoints.includes(endpoint)) {
      timeoutAlertExcludedEndpoints.push(endpoint);
    }
  },

  // 타임아웃 알림 제외 목록 초기화
  clearTimeoutAlertExcludedEndpoints: () => {
    timeoutAlertExcludedEndpoints.length = 0;
  },
};

function removeEmptyParams(params) {
  console.log('removeEmptyParams : params : ', params);

  if (params == null) {
    return null;
  }

  if (Array.isArray(params)) {
    return params.filter((value) => value !== '' && value !== null);
  }

  let data = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null) {
      data[key] = value;
    }
  }

  return data;
}

function hasInternalError(response) {
  // let resCode = response.data && response.status;
  console.log('response : ', response);
  let resCode = response.status;
  console.log('[hasInternalError] 1: ', resCode, response);

  switch (resCode) {
    case 0:
    case 200:
      return false;
    case 2001:
      console.log('[response.data.resMsg]=', response.data.resMsg);
      return true;
    case 2004:
    case 2005:
      console.log('[response.data.resMsg]=', response.data.resMsg);
      return false;
    case 2006:
      console.log('[response.data.resMsg]=', response.data.resMsg);
      return false;
    case 2008:
      return false;
    case 2007:
      console.log('[response.data.resMsg]=', response.data.resMsg);
      return false;
    case 2018:
      console.log('[response.data.resMsg]=', response.data.resMsg);
      return false;
    case 1011:
      console.log('[response.data.resMsg]=', response.data.resMsg);
      return false;
    default:
      return true;
  }
}

const authStore = useAuthStore();
const { userInfo, userStngInfo } = storeToRefs(authStore);

const { resetAuth } = authStore;

async function doErrorHandler(err, vm, info) {
  console.log('errrr', err);
  // let { response } = { response: { status: 900 }, ...err };
  // console.log({ response });

  if (!err) {
    console.log('[doErrorHandler] 서버에 알 수 없는 오류가 발생하였습니다.');
    setAlertStatus({
      view: true,
      message: '서버에 알 수 없는 오류가 발생하였습니다.',
    });
    return err;
  }

  const { status, data } = err;
  console.log('[doErrorHandler] status =', status);
  switch (status) {
    case 401:
      console.log('staus err', err);

      if (err.config.url.includes('login')) {
        await setAlertStatus({
          view: true,
          message: '아이디 또는 비밀번호가 일치하지 않습니다.',
        });

        return;
      } else if (err.config.url.includes('password')) {
        await setAlertStatus({
          view: true,
          message: '비밀번호 변경 도중 오류가 발생하였습니다.',
        });

        return;
      }

      await router.replace('/login');
      await setAlertStatus({
        view: true,
        message: '세션이 만료되었습니다. 다시 로그인 후 시도해주세요.',
      });

      await resetAuth();
      authStore.$reset;
      // 쿠키 삭제
      deleteCookie('x_auth');

      // 로컬 스토리지 항목 삭제
      deleteStorage('x_user');
      deleteStorage('x_tabNavi');
      deleteStorage('mflex_grid_info');

      // 로컬 스토리지 완전 삭제
      localStorage.clear();

      // 세션 스토리지 삭제
      sessionStorage.clear();

      break;
    case 404:
      {
        const { baseURL, url } = err.config;
        console.log(`요청이 올바르지 않습니다.<br>(${baseURL}${url})`);
      }
      break;
    // case 500:
    case 900:
      console.log('[doErrorHandler] 스크립트 오류가 발생하였습니다.');
      break;
    default:
      if (isComponentHandleError(err.data.code)) {
        console.log(`에러 코드 ${err.data.code}는 컴포넌트에서 처리됩니다.`);
        break;
      }
      console.log('[doErrorHandler] 서버에 알 수 없는 오류가 발생하였습니다.');

      await setAlertStatus({
        view: true,
        message:
          '서버에 알 수 없는 오류가 발생하였습니다. 관리자에게 문의해주세요.',
      });
      break;

    // if (
    //   err.data.code === 1023 || // 테이블정제 테이블 한글명 중복
    //   err.data.code === 1223 || // 단어명 중복
    //   err.data.code === 1224 || // 이음동의어
    //   err.data.code === 1225 || // 도메인명 다름
    //   err.data.code === 1226 || // 중복용어
    //   err.data.code === 1227 || // 용어명 중복
    //   err.data.code === 1228 || // 분류어로 사용중
    //   err.data.code === 1229 || // 이음동의어
    //   err.data.code === 1231 || // 연관용어로 사용중
    //   err.data.code === 1232
    // ) {
    //   break;
    // } else {
    //   await setAlertStatus({
    //     view: true,
    //     message:
    //       '서버에 알 수 없는 오류가 발생하였습니다. 관리자에게 문의해주세요.',
    //   });

    //   break;
    // }
  }
}

// async function doErrorHandler(err, vm, info) {
//   console.log('Error occurred:', err);

//   if (!err) {
//     await setAlertStatus({
//       view: true,
//       message: ERROR_CONFIG.DEFAULT_ERROR.message,
//     });
//     return err;
//   }

//   const { status, data } = err;
//   console.log('[doErrorHandler] status =', status);

//   switch (status) {
//     case 401:
//       // 인증 에러 처리 (기존 로직 유지)
//       if (err.config.url.includes('login')) {
//         await setAlertStatus({
//           view: true,
//           message: '아이디 또는 비밀번호가 일치하지 않습니다.',
//         });
//         return;
//       } else if (err.config.url.includes('password')) {
//         await setAlertStatus({
//           view: true,
//           message: '비밀번호 변경 도중 오류가 발생하였습니다.',
//         });
//         return;
//       }

//       await router.replace('/login');
//       await setAlertStatus({
//         view: true,
//         message: '세션이 만료되었습니다. 다시 로그인 후 시도해주세요.',
//       });

//       await resetAuth();
//       authStore.$reset;
//       deleteCookie('x_auth');
//       deleteStorage('x_user');
//       deleteStorage('x_tabNavi');
//       deleteStorage('mflex_grid_info');
//       localStorage.clear();
//       sessionStorage.clear();
//       break;

//     case 404: {
//       const { baseURL, url } = err.config;
//       await setAlertStatus({
//         view: true,
//         message: `요청이 올바르지 않습니다.<br>(${baseURL}${url})`,
//       });
//       break;
//     }

//     case 409:
//     case 500:
//     default: {
//       // 중괄호로 블록 스코프 생성
//       const errorCode = err.data?.code;

//       if (errorCode) {
//         const errorType = getErrorType(errorCode);

//         if (errorType === ERROR_TYPES.AUTO) {
//           // 자동 처리 에러는 글로벌에서 처리
//           const errorConfig = ERROR_CONFIG.AUTO_HANDLE_ERRORS[errorCode];
//           await setAlertStatus({
//             view: true,
//             message: errorConfig.message,
//             title: errorConfig.title,
//           });
//         } else if (errorType === ERROR_TYPES.COMPONENT) {
//           // 컴포넌트 처리 에러는 각 컴포넌트에서 처리하도록 넘김
//           // 에러를 그대로 throw하여 컴포넌트에서 catch할 수 있게 함
//           throw err;
//         } else {
//           // 정의되지 않은 에러 코드
//           await setAlertStatus({
//             view: true,
//             message: ERROR_CONFIG.DEFAULT_ERROR.message,
//           });
//         }
//       } else {
//         // 에러 코드가 없는 경우
//         await setAlertStatus({
//           view: true,
//           message: ERROR_CONFIG.DEFAULT_ERROR.message,
//         });
//       }
//       break;
//     }
//   }
// }

export { $vxHttp };
