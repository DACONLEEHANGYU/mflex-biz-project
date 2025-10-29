import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v1/diagnosis';

/**
 * API 명 : 스키마정보 복제
 */
const postSchemaCopy = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/replica?instituteId=${data.instituteId}&databaseId=${data.databaseId}`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Error copying schema:', error);
    return error;
  }
};

/**
 * API 명 : 진단대상테이블 조회
 */
const getTableInclude = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/table/include/search`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching table include:', error);
    return error;
  }
};

/**
 * API 명 : 진단제외테이블 조회
 */
const getTableExclude = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/table/exclude/search`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching table exclude:', error);
    return error;
  }
};

/**
 * API 명 : 진단테이블제외 등록
 */
const postTableExclude = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/table/exclude`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Error posting table exclude:', error);
    return error;
  }
};

/**
 * API 명 : 진단테이블제외 삭제
 */
const deleteTableExclude = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/table/exclude`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Error deleting table exclude:', error);
    return error;
  }
};

/**
 * API 명 : 진단테이블제외 변경
 */
const putTableExclude = async (data) => {
  try {
    const response = await $vxHttp.patch(
      `${apiUrl}${defaultUrl}/table/exclude`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Error putting table exclude:', error);
    return error;
  }
};

/**
 * API 명 : 진단제외사유코드
 */
const getDiagnosisExcludeReasonCode = async (data) => {
  const { instituteId, databaseId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/exclude-code?instituteId=${instituteId}&databaseId=${databaseId}`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching diagnosis exclude reason code:', error);
    return error;
  }
};

/**
 * API 명 : 진단
 */
const getDiagnosis = async (data) => {
  try {
    const response = await $vxHttp.post(`${apiUrl}${defaultUrl}`, data);

    return response.data;
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    return error;
  }
};

/**
 * API 명 : 최근 진단 조회
 */
const getLatestDiagnosis = async (data) => {
  const { instituteId, databaseId, schemaName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/latest?instituteId=${instituteId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    return error;
  }
};

/**
 * API 명 : DB별 스키마 목록
 */
const getSchemaListByDatabase = async (data) => {
  const { instituteId, informationSchemaId, databaseId } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/schema?instituteId=${instituteId}&` +
        `databaseId=${databaseId}&` +
        `informationSchemaId=${informationSchemaId}`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching schema list by database:', error);
    return error;
  }
};

/**
 * API 명 : 진단상세
 */
const getDiagnosisDetail = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/details/search`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching diagnosis detail:', error);
    return error;
  }
};

/**
 * API 명 : 진단이력
 */
const getDiagnosisHistory = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/history/search`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching diagnosis history:', error);
    return error;
  }
};

/**
 * API 명 : 진단이력 샘플링
 */
const getHistorySampling = async (data) => {
  const {
    instituteId,
    databaseId,
    schemaName,
    diagnosisMetricCode,
    startDate,
    endDate,
  } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/history/sampling?instituteId=${instituteId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `diagnosisMetricCode=${diagnosisMetricCode}&` +
        `startDate=${startDate}&` +
        `endDate=${endDate}`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching history sampling:', error);
    return error;
  }
};

export {
  postSchemaCopy, // 스키마정보 복제
  getTableInclude, // 진단대상테이블 조회
  getTableExclude, // 진단제외테이블 조회
  postTableExclude, // 진단테이블제외 등록
  deleteTableExclude, // 진단테이블제외 삭제
  putTableExclude, // 진단테이블제외 변경
  getDiagnosisExcludeReasonCode, // 진단제외사유코드
  getDiagnosis,
  getLatestDiagnosis,
  getSchemaListByDatabase, // DB별 스키마 목록
  getDiagnosisDetail, // 진단상세
  getDiagnosisHistory, // 진단이력
  getHistorySampling, // 진단이력 샘플링
};
