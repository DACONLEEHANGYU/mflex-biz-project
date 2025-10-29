import { $vxHttp } from '@/api';
import { object, string } from 'yup';
const apiUrl = import.meta.env.VITE_APP_API_URL;
const loginUri = '/api/v1';
const chainApiUrl = '/api/v1/setting';
// 로그인 API
const loginApi = async (logInfo) => {
  try {
    const loginResponse = await $vxHttp.post(
      `${apiUrl}${loginUri}/login`,
      logInfo
    );

    console.log('로그인 응답 : ', loginResponse);
    return await loginResponse;
  } catch (error) {
    console.error(error);
    return error;
  }
};

// Header 사용자 상세 정보 조회 API
const getUserProfile = async () => {
  let response;
  let userProfile;
  try {
    response = await $vxHttp.get(`${apiUrl}${loginUri}/private/profile`);
    userProfile = {
      userId: response.data.userId,
      userNm: response.data.username,
      userTypeCd: response.data.userType.code,
      userTypeNm: response.data.userType.name,
      ogdpInstId: response.data.institute.id,
      ogdpInstNm: response.data.institute.name,
      ogdpDeptCd: response.data.department.code,
      ogdpDeptNm: response.data.department.name,
      jbgdCd: response.data.position.code,
      jbgdNm: response.data.position.name,
      coTelno: response.data.officePhoneNumber,
      mblTelno: response.data.personalPhoneNumber,
      emlAddr: response.data.email,
    };
  } catch (error) {
    console.error(error);
  }
  return await userProfile;
};

// 사용자별 메뉴 목록 조회 API
const getUserMenuList = async (userId) => {
  let menuResponse;
  try {
    menuResponse = await $vxHttp.get(`${apiUrl}${loginUri}/private/menu`);
  } catch (error) {
    console.error(error);
  }
  return await menuResponse.data;
};

// 사용자별 메타관리 기관 목록 조회 API
const getUserMetaMngInstList = async (userId) => {
  let InstituteResponse;
  try {
    InstituteResponse = await $vxHttp.get(
      `${apiUrl}${loginUri}/private/institute`
    );
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
const getUserDictionaryList = async (instituteId) => {
  let DictionaryResponse;
  try {
    DictionaryResponse = await $vxHttp.get(
      `${apiUrl}${loginUri}/private/dictionary?instituteId=${instituteId}`
    );
  } catch (error) {
    console.error(error);
  }
  return await DictionaryResponse.data;
};
// 사용자별 주제영역 조회 API
const getUserSbjarList = async (instituteId) => {
  let sbjarResponse;
  try {
    sbjarResponse = await $vxHttp.get(`${apiUrl}`, paramUserInfo);
  } catch (error) {
    console.error(error);
    return throwError(() => error);
  }
  return await sbjarResponse;
};
// 사용자별 정보시스템 목록 조회 API
// /private/information-system?instituteId=2
const getUserInfoSysList = async (instituteId) => {
  let systemInfoResponse;
  try {
    systemInfoResponse = await $vxHttp.get(
      `${apiUrl}${loginUri}/private/information-system?instituteId=${instituteId}`
    );
  } catch (error) {
    console.error(error);
  }
  return await systemInfoResponse.data;
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
  username: string()
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
  password: string()
    .required('패스워드를 입력하세요.')
    .min(4, (data) => `패스워드는 ${data.min}글자 이상 입력`),
});

/* 
  API 명 : 비밀번호 변경
*/
// const changePassword = async (passWordInfo) => {
//   const token = passWordInfo.token;
//   console.log('changePassword - token : ', token);

//   try {
//     const response = await $vxHttp.put(
//       `${apiUrl}/api/v1/user/password`,
//       passWordInfo
//     );
//     return response;
//   } catch (error) {
//     console.error(error);
//     return error;
//   }
// };

const changePassword = async (passWordInfo) => {
  const token = passWordInfo.token;
  console.log('changePassword - token : ', token);

  try {
    const response = await $vxHttp.put(
      `${apiUrl}/api/v1/user/password`,
      passWordInfo,
      {
        headers: {
          Authorization: token, // Bearer 스키마를 사용하여 토큰 전송
        },
      }
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 회원가입
*/
const signUp = async (userInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}/api/v1/user/signup`,
      userInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/**
 * API 명 : 사용자별 조직 조회
 */
const getPrivateGroup = async (instituteId) => {
  let response;
  try {
    response = await $vxHttp.get(
      `${apiUrl}${loginUri}/private/group?instituteId=${instituteId}`
    );
  } catch (error) {
    console.error(error);
  }
  return await response.data;
};

/**
 * API 명 : 사용자별 조직 설정
 */
const getPrivateGroupSetting = async (data) => {
  let response;
  try {
    response = await $vxHttp.patch(
      `${apiUrl}${loginUri}/private/group/${data.groupId}?instituteId=${data.instituteId}`
    );
  } catch (error) {
    console.error(error);
  }
  return await response.data;
};

export {
  loginApi, // 로그인 API
  getUserProfile, // Header 사용자 상세 정보 조회 API
  schema, // 검증객체
  getUserMenuList, // 사용자별 메뉴 목록 조회 API
  getUserMetaMngInstList, // 사용자별 메타관리 기관 목록 조회 API
  getUserDictionaryList, // 사용자별 사전 목록 조회 API
  getUserSbjarList, // 사용자별 주제영역 조회 API
  getUserInfoSysList, // 사용자 설정 정보 조회 API
  getUserStngInfo, // 사용자 설정 정보 조회 API
  changePassword, // 비밀번호 변경 API
  signUp, // 회원가입
  getPrivateGroup, // 사용자별 조직 조회 API
  getPrivateGroupSetting,
};
