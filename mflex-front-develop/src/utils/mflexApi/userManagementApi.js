import { $vxHttp } from '@/api';
const apiUrl = import.meta.env.VITE_APP_API_URL;
const baseUrl = '/api/v1';
const chainApiUrl = '/api/v1/manage';

/*
  API 명 : 사용자 목록 조회
*/
const getUserList = async (userQuery) => {
  try {
    const response = await $vxHttp.get(`${apiUrl}${baseUrl}/user?${userQuery}`);
    console.log('사용자 목록 조회 getUserList :', response);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};
/**
 * API 명 : 기관별 사용자 목록 조회
 */
const getInstUserList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${baseUrl}/user?instituteId=${instituteId}`
    );
    console.log('사용자 목록 조회 getUserList :', response);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 기관목록 조회
*/
const getInstituteList = async () => {
  try {
    const response = await $vxHttp.get(`${apiUrl}${chainApiUrl}/institute`);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명: 기관이 관리하는 사전 목록
*/
const getDictionaryByInstitute = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${chainApiUrl}/institute/${instituteId}/dictionary`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 기관이 관리하는 정보시스템 목록
*/
const getInfoSystemByInstitute = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${chainApiUrl}/institute/${instituteId}/information-system`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 기관에 속한 부서 목록
*/
const getDepartmentByInstitute = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${chainApiUrl}/institute/${instituteId}/department`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 사용자 타입 조회
*/
const getUserTypeList = async () => {
  try {
    const response = await $vxHttp.get(`${apiUrl}${baseUrl}/user/type`);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 사용자 직급 조회
*/
const getUserPositionList = async () => {
  try {
    const response = await $vxHttp.get(`${apiUrl}${baseUrl}/user/position`);
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 회원가입 - 관리자용
*/
const createUserByAdmin = async (userInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/signup-super`,
      userInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/**
 * API 명 : 회원가입 - 기관 관리자용
 */
const createUserByInstAdmin = async (userInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/signup-admin`,
      userInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 관리자 승인
*/
const acceotUserByAdmin = async (acceptInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/accept`,
      acceptInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 관리자 - 비밀번호 초기화
*/
const resetPasswordByAdmin = async (resetInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/reset-password`,
      resetInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 사용자 활성화/비활성화
*/
const activeUserByAdmin = async (activeInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/${activeInfo.state}`,
      activeInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 사용자 잠금/잠금해제
*/
const lockUserByAdmin = async (lockInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/${lockInfo.state}`,
      lockInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 조직 조회
*/
const getResourceInstitute = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${baseUrl}/user/resource/institute/${data.instituteId}/group?userId=${data.userId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 기관 할당
*/
const setResourceInstitute = async (resourceInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/resource/institute`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 기관 할당 변경
*/
const updateResourceInstitute = async (resourceInfo) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${baseUrl}/user/resource/institute`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 기관 할당 제거
*/
const deleteResourceInstitute = async (resourceInfo) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${baseUrl}/user/resource/institute`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 정보시스템 조회
*/
const getResourceInfoSystem = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${baseUrl}/user/resource/institute/${data.instituteId}/information-system?userId=${data.userId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 정보시스템 할당
*/
const setResourceInfoSystem = async (resourceInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/resource/institute/${resourceInfo.instituteId}/information-system`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 정보시스템 할당 변경
*/
const updateResourceInfoSystem = async (resourceInfo) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${baseUrl}/user/resource/information-system`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 정보시스템 할당 제거
*/
const deleteResourceInfoSystem = async (resourceInfo) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${baseUrl}/user/resource/institute/${resourceInfo.instituteId}/information-system`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 사전 조회
 */
const getResourceDictionary = async (userId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${baseUrl}/user/resource/dictionary?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 사전 할당
 */
const setResourceDictionary = async (resourceInfo) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${baseUrl}/user/resource/dictionary`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 사전 할당 변경
 */
const updateResourceDictionary = async (resourceInfo) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${baseUrl}/user/resource/dictionary`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

/*
  API 명 : 리소스 - 사전 할당 제거
*/
const deleteResourceDictionary = async (resourceInfo) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${baseUrl}/user/resource/dictionary`,
      resourceInfo
    );
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const editUSserDetails = async (userInfo) => {
  try {
    const response = await $vxHttp.put(`${apiUrl}${baseUrl}/user`, userInfo);
    return response;
  } catch (error) {
    console.error(error);
    return error;
  }
};

const getGroupList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${baseUrl}/instituteId/${instituteId}/group`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export {
  getUserList, // 사용자 목록 조회 API
  getInstUserList, // 기관별 사용자 목록 조회 API
  getInstituteList, // 로그인 API
  getDictionaryByInstitute, // 사용자별 사전목록 조회 API
  getInfoSystemByInstitute, // 사용자별 정보시스템 목록 조회 API
  getDepartmentByInstitute, // 사용자별 부서 목록 조회 API
  getUserTypeList, // 사용자 타입 조회 API
  getUserPositionList, // 사용자 직급 조회 API
  createUserByAdmin, // 회원가입 - 관리자용
  createUserByInstAdmin, // 기관 관리자 회원가입
  acceotUserByAdmin,
  getResourceInstitute, // 리소스 - 기관 조회
  resetPasswordByAdmin, // 관리자 - 비밀번호 초기화
  activeUserByAdmin, // 사용자 활성화/비활성화
  lockUserByAdmin, // 사용자 잠금/잠금해제
  setResourceInstitute, // 리소스 - 기관 할당
  updateResourceInstitute, // 리소스 - 기관 할당 변경
  deleteResourceInstitute, // 리소스 - 기관 할당 제거
  getResourceInfoSystem, // 리소스 - 정보시스템 조회
  setResourceInfoSystem, // 리소스 - 정보시스템 할당
  updateResourceInfoSystem, // 리소스 - 정보시스템 할당 변경
  deleteResourceInfoSystem, // 리소스 - 정보시스템 할당 제거
  getResourceDictionary, // 리소스 - 사전 조회
  setResourceDictionary, // 리소스 - 사전 할당
  updateResourceDictionary, // 리소스 - 사전 할당 변경
  deleteResourceDictionary, // 리소스 - 사전 할당 제거
  editUSserDetails, // 사용자 정보 수정
  getGroupList, // 그룹 목록 조회 API
};
