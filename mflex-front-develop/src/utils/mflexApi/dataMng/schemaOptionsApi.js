import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = `/api/v1/schema`;
const systemMngUrl = `/api/v1/manage`;

/**
 * API 명 : 부가정보 - db/schema 목록
 */
const getDbSchemaList = async (params) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/additional-meta/db-schema?instituteId=${params.instituteId}&informationSystemId=${params.informationSystemId}`
    );

    console.log('getDbSchemaList response : ', response.data);

    return response.data;
  } catch (error) {
    console.error('getDbSchemaList response : ', error);
  }
};

/**
 * API 명 : 부가정보 - 테이블 목록
 */
const getTableList = async (params) => {
  console.log('getTableList params : ', params);

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/additional-meta/table?instituteId=${params.instituteId}&informationSystemId=${params.informationSystemId}&dbSchema=${params.dbSchema}`
    );
    console.log('getTableList response : ', response.data);
    return response.data;
  } catch (error) {
    console.error('getTableList response : ', error);
  }
};

/**
 * API 명: 부가정보 - 컬럼 목록
 */

const getColumnList = async (params) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/additional-meta/column?instituteId=${params.instituteId}` +
        `&informationSystemId=${params.informationSystemId}` +
        `&dbSchema=${params.dbSchema}` +
        `&table=${params.table}`
    );
    console.log('getColumnList response : ', response.data);
    return response.data;
  } catch (error) {
    console.error('getColumnList response : ', error);
  }
};

/**
 * API 명: 부가정보 - 컬럼 수정
 */
const patchChangeColumn = async (parmas) => {
  try {
    const response = await $vxHttp.patch(
      `${apiUrl}${defaultUrl}/additional-meta/column`,
      parmas
    );
    console.log('patchChangeColumn response : ', response.data);
    return response.data;
  } catch (error) {
    console.error('patchChangeColumn response : ', error);
  }
};

export {
  getDbSchemaList, // 부가정보 - db/schema 목록
  getTableList, // 부가정보 - 테이블 목록
  getColumnList, // 부가정보 - 컬럼 목록
  patchChangeColumn, // 부가정보 - 컬럼 수정
};
