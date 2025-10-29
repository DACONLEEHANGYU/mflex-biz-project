import { $vxHttp } from '@/api';
import { object, string } from 'yup';
const apiUrl = import.meta.env.VITE_APP_API_URL;
const loginUri = '/api/v1';
const chainApiUrl = '/api/v1/setting';

// 사용자별 기관 설정
const updateUserInstitute = async (instituteId) => {
  let response;
  console.log('instituteId ======================== ', instituteId);
  try {
    response = await $vxHttp.put(
      `${apiUrl}${loginUri}/private/institute/${instituteId}`
    );
  } catch (error) {
    console.error(error);
  }
  return await response;
};
// 사용자별 사전 설정
const updateUserDictionary = async (paramDictionaryData) => {
  let response;

  console.log('paramDictionaryData', paramDictionaryData);
  try {
    const data = {
      instituteId: parseInt(paramDictionaryData.instituteId, 10),
    };

    response = await $vxHttp.put(
      `${apiUrl}${loginUri}/private/dictionary/${paramDictionaryData.dictionaryId}`,
      data
    );
  } catch (error) {
    console.error(error);
  }
  return await response;
};

// 사용자별 정보시스템 설정
const updataUserSystem = async (paramSystemData) => {
  let response;

  try {
    response = await $vxHttp.patch(
      `${apiUrl}${loginUri}/private/information-system/${paramSystemData.systemId}?instituteId=${paramSystemData.instituteId}`
    );
  } catch (error) {
    console.error(error);
  }

  return response;
};

export { updateUserInstitute, updateUserDictionary, updataUserSystem };
