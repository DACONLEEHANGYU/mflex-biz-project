import { useAuthStore } from '@/stores/auth';
import { getAuthFromCookie } from '@/utils/cookies.js';
import { useSpinnerStore } from '@/stores/spinner.js';

const { setSpinnerStatus } = useSpinnerStore();

function setInterceptors(instance) {
  // console.log('setInterceptors 토큰 ===', userToken);
  const store = useAuthStore();
  // console.log('store 데이터 ===', store);

  instance.interceptors.request.use(
    (config) => {
      // console.log('interceptors-config : ', config);

      // console.log('interceptors-config : ', config);

      // // 스피너 처리 로직 개선
      // let shouldShowSpinner =
      //   config.skipSpinner != null
      //     ? !config.skipSpinner
      //     : !config.params.skipSpinner;
      // console.log('shouldShowSpinner : ', shouldShowSpinner);

      // 스피너 처리 로직 개선
      let shouldShowSpinner = true; // 기본값을 true로 설정

      // config.skipSpinner 또는 config.params.skipSpinner 중 하나라도 true이면 스피너 비활성화
      if (config.skipSpinner === true || config.params?.skipSpinner === true) {
        shouldShowSpinner = false;
      }

      // console.log('shouldShowSpinner : ', shouldShowSpinner);

      // console.log('shouldShowSpinner : ', shouldShowSpinner);

      if (shouldShowSpinner) {
        setSpinnerStatus(true);
      } else {
        setSpinnerStatus(false);
      }

      // if (config.params) {
      //   console.log(
      //     'config.params.headers.skipSpinner : ',
      //     config.params.headers.skipSpinner
      //   );
      //   // if (!config.params.headers.skipSpinner) {
      //   //   setSpinnerStatus(true);
      //   // }
      // }

      const { userToken } = store;

      // console.log('스토어 토큰 ===', userToken);
      const testToken = userToken
        ? 'Bearer ' + userToken
        : getAuthFromCookie()
        ? 'Bearer ' + getAuthFromCookie()
        : null;
      // console.log('testToken : ', testToken);

      config.headers.Authorization = testToken;

      // if (!testToken && data) {
      //   config.headers.Authorization = data.token;
      // } else {
      //   config.headers.Authorization = testToken;
      // }
      return config;
    },
    (error) => Promise.reject(error.response)
  );
  instance.interceptors.response.use(
    (config) => {
      setSpinnerStatus(false);

      return config;
    },
    (error) => {
      // error.response가 undefined일 때에 대한 처리 추가

      setSpinnerStatus(false);

      if (!error.response) {
        console.error('서버로부터 응답이 없습니다.');
        return Promise.reject(error);
      }

      console.log('ERROR status : ', error.response.status);
      console.log('ERROR code : ', error.response.data.code);
      console.log('ERROR message : ', error.response.data.message);
      console.log(error);
      return Promise.reject(error.response);
    }
  );

  return instance;
}

// function setInterceptors(instance) {
//   const store = useAuthStore();
//   const { userToken } = store;

//   instance.interceptors.request.use(
//     (config) => {
//       const token = userToken ? userToken : getAuthFromCookie();
//       if (token) {
//         config.headers.Authorization = 'Bearer ' + token;
//       }
//       console.log('Request config:', config);
//       return config;
//     },
//     (error) => {
//       console.error('Request error:', error);
//       return Promise.reject(error);
//     }
//   );

//   instance.interceptors.response.use(
//     (response) => {
//       console.log('Response:', response);
//       return response;
//     },
//     (error) => {
//       if (!error.response) {
//         console.error('서버로부터 응답이 없습니다.');
//         return Promise.reject(error);
//       }

//       console.log('ERROR status : ', error.response.status);
//       console.log('ERROR code : ', error.response.data.code);
//       console.log('ERROR message : ', error.response.data.message);
//       console.error('Response error:', error);
//       return Promise.reject(error.response);
//     }
//   );

//   return instance;
// }

export { setInterceptors };
