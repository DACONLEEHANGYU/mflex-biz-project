import { $vxHttp } from '@/api';
import { object, string } from 'yup';
const apiUrl = import.meta.env.VITE_APP_API_URL;

// 로그인 API
const loginApi = async (logInfo) => {
  let loginResponse;
  try {
    loginResponse = await $vxHttp.post(`${apiUrl}/login`, logInfo);
  } catch (error) {
    console.error(error);
  }
  return await loginResponse;
};

// Header 사용자 상세 정보 조회 API
const getHeaderUserInfo = async () => {
  let headerUserInfoResponse;
  try {
    headerUserInfoResponse = await $vxHttp.get(`${apiUrl}/`);
  } catch (error) {
    console.error(error);
  }
  return await headerUserInfoResponse;
};

// 사용자별 메뉴 목록 조회 API
const getUserMenuList = async (userId) => {
  let menuResponse;
  try {
    menuResponse = await $vxHttp.get(`${apiUrl}`, userId);
  } catch (error) {
    console.error(error);
  }
  return await menuResponse.data;
};

// 사용자별 메타관리 기관 목록 조회 API
const getUserMetaMngInstList = async (userId) => {
  let InstituteResponse;
  try {
    InstituteResponse = await $vxHttp.get(`${apiUrl}`, userId);
  } catch (error) {
    console.error(error);
  }
  return await InstituteResponse.data;
};

// 사용자별 사전목록 조회 API
/*  paramUserInfo : {
    userId : '',
    metaMngInstId : 2L,  
  } 
*/
const getUserDictionaryList = async (paramUserInfo) => {
  let DictionaryResponse;
  try {
    DictionaryResponse = await $vxHttp.get(`${apiUrl}`, paramUserInfo);
  } catch (error) {
    console.error(error);
  }
  return await DictionaryResponse.data;
};
// 사용자별 주제영역 조회 API
const getUserSbjarList = async (paramUserInfo) => {
  let sbjarResponse;
  try {
    sbjarResponse = await $vxHttp.get(`${apiUrl}`, paramUserInfo);
  } catch (error) {
    console.error(error);
  }
  return await sbjarResponse;
};
// 사용자별 정보시스템 목록 조회 API
const userInfoSysList = async (paramUserInfo) => {
  let systemInfoResponse;
  try {
    systemInfoResponse = await $vxHttp.get(`${apiUrl}`, paramUserInfo);
  } catch (error) {
    console.error(error);
  }
  return await systemInfoResponse;
};
// 사용자 설정 정보 조회 API
const getUserStngInfo = async (paramUserInfo) => {
  let response;
  try {
    response = await $vxHttp.get(`${apiUrl}`, paramUserInfo);
  } catch (error) {
    console.error(error);
  }
  return await response;
};

// id,password 검증
const schema = object().shape({
  loginId: string()
    .required('아이디를 입력하세요.')
    .min(5, '아이디는 5글자 이상 입력')
    .test('no-korean', '한글은 입력할 수 없습니다.', (value) => {
      return !/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g.test(value);
    })
    .test(
      'no-special-characters',
      '특수문자는 입력할 수 없습니다.',
      (value) => {
        return !/[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/.test(value);
      }
    ),
  loginPswd: string()
    .required('패스워드를 입력하세요.')
    .min(4, (data) => `패스워드는 ${data.min}글자 이상 입력`),
});

export {
  loginApi, // 로그인 API
  getHeaderUserInfo, // Header 사용자 상세 정보 조회 API
  schema, // 검증객체
  getUserMenuList, // 사용자별 메뉴 목록 조회 API
  getUserMetaMngInstList, // 사용자별 메타관리 기관 목록 조회 API
  getUserDictionaryList, // 사용자별 사전 목록 조회 API
  getUserSbjarList, // 사용자별 주제영역 조회 API
  userInfoSysList, // 사용자 설정 정보 조회 API
  getUserStngInfo, // 사용자 설정 정보 조회 API
};
