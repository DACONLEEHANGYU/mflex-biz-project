import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = `/api/v1/schema/manage`;
const systemMngUrl = `/api/v1/manage`;

/*
  API 명 : DB 연결정보 목록 조회
*/
const getDbConnectionList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/database-link?instituteId=${instituteId}`
    );

    console.log('getDbConnectionList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getDbConnectionList response : ', error);
  }
};

/*
  API 명 : DB 연결정보 상세조회
*/
const getDbConnectionDetails = async (data) => {
  const { databaseLinkId, instituteId } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/database-link/${databaseLinkId}?instituteId=${instituteId}`
    );

    console.log('getDbConnectionDetails response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getDbConnectionDetails response : ', error);
  }
};

/*
  API 명 : 온라인 스키마 수집
*/
const getOnlineSchemaCollection = async (data) => {
  const { instituteId, databaseLinkId } = data;

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/physical/database-meta?instituteId=${instituteId}&databaseLinkId=${databaseLinkId}`
    );

    console.log('getOnlineSchemaCollection response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getOnlineSchemaCollection response : ', error);
  }
};

/*
  API 명 : 연결 DB명 조회
*/
const getSearchDbName = async (instituteId, useInfoSysId) => {
  let url = `${apiUrl}${systemMngUrl}/information-system/${useInfoSysId}/database?instituteId=${instituteId}`;

  try {
    const response = await $vxHttp.get(url);
    console.log('getSearchDbName response : ', response.data);
    return response.data;
  } catch (error) {
    console.error('getSearchDbName response : ', error);
  }
};

/**
 * DB 목록 조회
 */
const getDatabaseList = async (instituteId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${systemMngUrl}/database?instituteId=${instituteId}`
    );
    return response.data;
  } catch (error) {
    console.error('getDatabaseList response : ', error);
    return error;
  }
};

/**
 * API 명 : DB별 스키마 목록
 */
const getSchemaListByDatabase = async (data) => {
  const { instituteId, informationSystemId, databaseId } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${systemMngUrl}/information-system/${informationSystemId}/schema?` +
        `instituteId=${instituteId}&` +
        `databaseId=${databaseId}`
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching schema list by database:', error);
    return error;
  }
};

/*
  API 명 : DB 연결정보 추가
*/
const addDbConnection = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/database-link`,
      data
    );

    console.log('addDbConnection response : ', response.data);
    return response.data;
  } catch (error) {
    console.error('addDbConnection response : ', error);
    return error;
  }
};

/*
  API 명 : DB 연결정보 수정
*/
const modifyDbConnection = async (data) => {
  console.log('modifyDbConnection data : ', data);

  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/database-link/${parseInt(
        data.databaseLinkId
      )}?instituteId=${data.instituteId}`,
      data
    );

    console.log('modifyDbConnection response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('modifyDbConnection response : ', error);
  }
};

/*
  API 명 : DB 연결정보 삭제
*/
const discardDbConnection = async (data) => {
  const { databaseLinkId, instituteId } = data;

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/database-link/${databaseLinkId}/discard?instituteId=${instituteId}`
    );

    console.log('deleteDbConnection response : ', response);

    return response.data;
  } catch (error) {
    console.error('deleteDbConnection response : ', error);
  }
};

/*
  API 명 : DB 연결 테스트
*/
const testDbConnection = async (data) => {
  try {
    const response = await $vxHttp.post(`${apiUrl}/connection/test`, data);

    console.log('testDbConnection response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('testDbConnection response : ', error);
  }
};

/*
  API 명 : 전체 스키마 조회
*/
const getAllSchemaList = async (data) => {
  const { databaseLinkId, instituteId } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/physical/database-schema?instituteId=${instituteId}&databaseLinkId=${databaseLinkId}`
    );

    console.log('getAllSchemaList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getAllSchemaList response : ', error);
    return error;
  }
};

/*
  API 명 : 수집 대상 스키마 조회
*/
const getTargetSchemaList = async (data) => {
  const { databaseLinkId, instituteId } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/database-link/${databaseLinkId}/target-schema?instituteId=${instituteId}`
    );

    console.log('getTargetSchemaList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getTargetSchemaList response : ', error);
    return error;
  }
};

/*
  API 명 : 수집 대상 스키마 저장
*/
const saveTargetSchemaList = async (data) => {
  const { databaseLinkId, instituteId, targetSchema } = data;

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/database-link/${databaseLinkId}/target-schema/enable?instituteId=${instituteId}`,
      targetSchema
    );

    console.log('saveTargetSchemaList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('saveTargetSchemaList response : ', error);
  }
};

/*
  API 명 : 수집 대상 스키마 삭제
*/
const deleteTargetSchemaList = async (data) => {
  const { databaseLinkId, instituteId, targetSchema } = data;

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/database-link/${databaseLinkId}/target-schema/disable?instituteId=${instituteId}`,
      targetSchema
    );

    console.log('deleteTargetSchemaList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('deleteTargetSchemaList response : ', error);
  }
};

/*
  API 명 : 수집결과 목록 조회
*/
const getSchemaCollectionList = async (data) => {
  console.log('getSchemaCollectionList data : ', data);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/collection`,
      data
    );

    console.log('getSchemaCollectionList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getSchemaCollectionList response : ', error);
  }
};

/*
  API 명 : 스키마 수집제외
*/
const excludeSchemaCollection = async (data) => {
  try {
    const response = await $vxHttp.post(`${apiUrl}/schema/exclude`, data);

    console.log('excludeSchemaCollection response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('excludeSchemaCollection response : ', error);
  }
};

/*
  API 명 : 스키마 수집포함
*/
const includeSchemaCollection = async (data) => {
  try {
    const response = await $vxHttp.post(`${apiUrl}/schema/include`, data);

    console.log('includeSchemaCollection response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('includeSchemaCollection response : ', error);
  }
};

/*
  API 명 : DB 테이블 수집내역 조회
*/
const getTableCollectionList = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/collection/table`,
      data
    );

    console.log('getTableCollectionList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getTableCollectionList response : ', error);
  }
};

/*
  API 명 : DB 함수 수집내역 조회
*/
const getFunctionCollectionList = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/collection/function`,
      data
    );

    console.log('getFunctionCollectionList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getFunctionCollectionList response : ', error);
  }
};

/*
  API 명 : DB 프로시저 수집내역 조회
*/
const getProcedureCollectionList = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/collection/procedure`,
      data
    );

    console.log('getProcedureCollectionList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getProcedureCollectionList response : ', error);
  }
};

/*
  API 명 : 관리 DB 적용
*/
const applyManageDb = async (data) => {
  const { instituteId, collectionId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/save?instituteId=${instituteId}&` +
        `collectionId=${collectionId}`
    );

    return response;
  } catch (error) {
    console.error('applyManageDb response : ', error);
  }
};

/*
  API 명 : DB 연결 정보 복구
*/
const restoreDbConnection = async (data) => {
  const { instituteId, databaseLinkId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/database-link/${databaseLinkId}/restore?instituteId=${instituteId}`
    );

    console.log('restoreDbConnection response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('restoreDbConnection response : ', error);
    return error;
  }
};

/*
  API 명 : DB 연결 정보 삭제
*/
const deleteDbConnection = async (data) => {
  const { instituteId, databaseLinkId } = data;
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/database-link/${databaseLinkId}?instituteId=${instituteId}`
    );

    console.log('deleteDbConnection response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('deleteDbConnection response : ', error);
    return error;
  }
};

/**
 * API 명 : 스키마 관리 제외 코드
 */
const getSchemaExcludeCode = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}/api/v1/schema/manage/exclude-code`
    );

    console.log('getSchemaExcludeCode response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getSchemaExcludeCode response : ', error);
  }
};

/*
 * API 명 : 스키마관리 테이블 수집제외 수정
 */
const patchTableExclude = async (data) => {
  try {
    const response = await $vxHttp.patch(
      `${apiUrl}${defaultUrl}/table/exclude`,
      data
    );

    console.log('patchTableExclude response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('patchTableExclude response : ', error);
  }
};

/*
 * API 명 : 스키마관리 함수 수집제외 수정
 */
const patchFunctionExclude = async (data) => {
  try {
    const response = await $vxHttp.patch(
      `${apiUrl}${defaultUrl}/function/exclude`,
      data
    );

    console.log('patchFunctionExclude response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('patchFunctionExclude response : ', error);
  }
};

/**
 * API 명 : 스키마관리 프로시저 수집제외 수정
 */
const patchProcedureExclude = async (data) => {
  try {
    const response = await $vxHttp.patch(
      `${apiUrl}${defaultUrl}/procedure/exclude`,
      data
    );

    console.log('patchProcedureExclude response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('patchProcedureExclude response : ', error);
  }
};

/**
 * API 명 : 오프라인 스키마 업로드
 */
const uploadOfflineSchema = async (data) => {
  console.log('fileData : ', data);
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/physical/database-excel-meta`,
      data,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        skipTimeoutAlert: true,
        timeout: 0,
      }
    );
    console.log('getTermUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getTermUploadFile error : ', error);
  }
};

export {
  // DB연결정보 API
  getDbConnectionList, // DB 연결정보 목록 조회
  getDbConnectionDetails, // DB 연결정보 상세조회
  getSearchDbName, // 연결 DB명 조회
  getOnlineSchemaCollection, // 온라인 스키마 수집
  addDbConnection, // DB 연결정보 추가
  modifyDbConnection, // DB 연결정보 수정
  testDbConnection, // DB 연결 테스트
  getAllSchemaList, // 전체 스키마 조회
  getTargetSchemaList, // 수집 대상 스키마 조회
  saveTargetSchemaList, // 수집 대상 스키마 저장
  deleteTargetSchemaList, // 수집 대상 스키마 삭제
  uploadOfflineSchema, // 오프라인 스키마 업로드

  // DB수집결과 API
  getSchemaCollectionList, // 수집결과 목록 조회
  excludeSchemaCollection, // 스키마 수집제외
  includeSchemaCollection, // 스키마 수집포함
  getTableCollectionList, // DB 테이블 수집내역 조회
  getFunctionCollectionList, // DB 함수 수집내역 조회
  getProcedureCollectionList, // DB 프로시저 수집내역 조회
  applyManageDb, // 관리 DB 적용
  restoreDbConnection, // DB 연결 정보 복구
  discardDbConnection, // DB 연결정보 폐기
  deleteDbConnection, // DB 연결 정보 삭제
  getSchemaExcludeCode, // 스키마 관리 제외 코드
  patchTableExclude, // 스키마관리 테이블 수집제외 수정
  patchFunctionExclude, // 스키마관리 함수 수집제외 수정
  patchProcedureExclude, // 스키마관리 프로시저 수집제외 수정
  getSchemaListByDatabase,
  getDatabaseList, // DB 목록 조회
};
