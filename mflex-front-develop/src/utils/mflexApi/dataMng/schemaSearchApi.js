import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v1/schema';

/* 
  API 명 : 테이블 조회 - 필터
*/
const getTableList = async (researchQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/table`,
      researchQuery
    );
    console.log('getTableList response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableList error : ', error);
  }
};

/*
  API 명 : 테이블 상세 - 기본조회
*/
const getTableBaseInfo = async (tableBaseQuery) => {
  console.log('getTableBaseInfo tableBaseInfo : ', tableBaseQuery);

  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/base?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}`,
      { skipSpinner: true }
    );
    console.log('getTableBaseInfo response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableBaseInfo error : ', error);
  }
};

/*
  API 명 : 테이블 상세 - 컬럼 조회
*/

const getTableColumnInfo = async (tableBaseQuery) => {
  console.log('getTableColumnInfo tableBaseInfo : ', tableBaseQuery);

  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/column?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}`,
      { skipSpinner: true }
    );
    console.log('getTableColumnInfo response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableColumnInfo error : ', error);
  }
};

/*
  API 명 : 테이블 상세 - 기본키 
*/
const getTablePrimaryKey = async (tableBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/primary-key?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}`,
      { skipSpinner: true }
    );
    console.log('getTablePrimaryKey response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTablePrimaryKey error : ', error);
    return error;
  }
};

/*
  API 명 : 테이블 상세 - 기본키 상세
*/
const getTablePrimaryKeyDetail = async (tableBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    primaryKeyName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/primary-key/details?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `primaryKeyName=${primaryKeyName}`,
      { skipSpinner: true }
    );
    console.log('getTablePrimaryKeyDetail response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTablePrimaryKeyDetail error : ', error);
  }
};

/*
  API 명 : 테이블 상세 - 상위 외래키
*/
const getTableUpperForeignKey = async (tableBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/foreign-key/parent?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}`,
      { skipSpinner: true }
    );
    console.log('getTableUpperForeignKey response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableUpperForeignKey error : ', error);
  }
};

/*
  API 명 : 테이블 상세 - 하위 외래키
*/
const getTableChildForeignKey = async (tableBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/foreign-key/child?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}`,
      { skipSpinner: true }
    );
    console.log('getTableChildForeignKey response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableChildForeignKey error : ', error);
  }
};

/*
  API 명 : 테이블 상세 - 인덱스 조회
*/
const getTableIndex = async (tableBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/index?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}`,
      { skipSpinner: true }
    );
    console.log('getTableIndex response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableIndex error : ', error);
  }
};

/*
  API 명 : 테이블 상세- 인덱스 상세
*/
const getTableIndexDetail = async (tableBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    indexName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/index/details?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `indexName=${indexName}`,
      { skipSpinner: true }
    );
    console.log('getTableIndexDetail response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableIndexDetail error : ', error);
  }
};

/*
  API 명 : 테이블 상세 - 트리거 조회
*/
const getTableTrigger = async (tableBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/trigger?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}`,
      { skipSpinner: true }
    );
    console.log('getTableTrigger response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableTrigger error : ', error);
  }
};

/*
  API 명 : 테이블 상세 - 트리거 소스
*/
const getTableTriggerSource = async (tableBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    triggerName,
  } = tableBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/table/trigger/source?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `triggerName=${triggerName}`,
      { skipSpinner: true }
    );
    console.log('getTableTriggerDetail response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTableTriggerDetail error : ', error);
  }
};

/*
   컬럼 조회 -------------------------------------------------------------------------------------------- 
 */

/*
  API 명 : 컬럼 조회 - 필터
*/
const getColumnList = async (researchQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/column`,
      researchQuery,
      { skipSpinner: true }
    );
    console.log('getColumnList response : ', response);
    return response.data;
  } catch (error) {
    console.error('getColumnList error : ', error);
  }
};

/*
  API 명 : 컬럼 상세 - 기본정보
*/
const getColumnBaseInfo = async (columnBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    columnName,
    columnKoreanName,
    dataTypeName,
  } = columnBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/column/base?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `columnName=${columnName}&` +
        `columnKoreanName=${columnKoreanName}&` +
        `dataTypeName=${dataTypeName}`,
      { skipSpinner: true }
    );
    console.log('getColumnBaseInfo response : ', response);
    return response.data;
  } catch (error) {
    console.error('getColumnBaseInfo error : ', error);
  }
};

/*
  API 명 : 컬럼 상세 - 연관 테이블
*/
const getColumnRelatedTable = async (columnBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    columnName,
    columnKoreanName,
    dataTypeName,
  } = columnBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/column/relation/table?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `columnName=${columnName}&` +
        `columnKoreanName=${columnKoreanName}&` +
        `dataTypeName=${dataTypeName}`,
      { skipSpinner: true }
    );
    console.log('getColumnRelatedTable response : ', response);
    return response.data;
  } catch (error) {
    console.error('getColumnRelatedTable error : ', error);
  }
};

/*
  API 명 : 컬럼 상세 - 연관 기본키
*/
const getColumnRelatedPrimaryKey = async (columnBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    columnName,
    columnKoreanName,
    dataTypeName,
  } = columnBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/column/relation/primary-key?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `columnName=${columnName}&` +
        `columnKoreanName=${columnKoreanName}&` +
        `dataTypeName=${dataTypeName}`,
      { skipSpinner: true }
    );
    console.log('getColumnRelatedPrimaryKey response : ', response);
    return response.data;
  } catch (error) {
    console.error('getColumnRelatedPrimaryKey error : ', error);
  }
};

/*
  API 명 : 컬럼 상세 - 연관 기본키 상세
*/
const getColumnPKDetails = async (columnBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    columnName,
    columnKoreanName,
    dataTypeName,
    tableName,
    primaryKeyName,
  } = columnBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/column/relation/primary-key/details?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `primaryKeyName=${primaryKeyName}`,
      { skipSpinner: true }
    );
    console.log('getColumnRelatedPrimaryKeyDetail response : ', response);
    return response.data;
  } catch (error) {
    console.error('getColumnRelatedPrimaryKeyDetail error : ', error);
  }
};

/*
  API 명 : 컬럼 상세 - 연관 외래키
*/
const getColumnRelatedForeignKey = async (columnBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    columnName,
    columnKoreanName,
    dataTypeName,
  } = columnBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/column/relation/foreign-key?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `columnName=${columnName}&` +
        `columnKoreanName=${columnKoreanName}&` +
        `dataTypeName=${dataTypeName}`,
      { skipSpinner: true }
    );
    console.log('getColumnRelatedForeignKey response : ', response);
    return response.data;
  } catch (error) {
    console.error('getColumnRelatedForeignKey error : ', error);
  }
};

/*
  API 명 : 컬럼 상세 - 연관 인덱스
*/
const getColumnRelatedIndex = async (columnBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    columnName,
  } = columnBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/column/relation/index?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `columnName=${columnName}&`,
      { skipSpinner: true }
    );
    console.log('getColumnRelatedIndex response : ', response);
    return response.data;
  } catch (error) {
    console.error('getColumnRelatedIndex error : ', error);
  }
};

/*
  API 명 : 컬럼 사세 - 연관 인덱스 상세
*/
const getColumnIndexDetails = async (columnBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    tableName,
    databaseId,
    schemaName,
    columnName,
    indexName,
  } = columnBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/column/relation/index/details?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `tableName=${tableName}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `columnName=${columnName}&` +
        `indexName=${indexName}`,
      { skipSpinner: true }
    );
    console.log('getColumnIndexDetails response : ', response);
    return response.data;
  } catch (error) {
    console.error('getColumnIndexDetails error : ', error);
  }
};

/*
   기본키 조회 -------------------------------------------------------------------------------------------- 
 *

/*
  API 명 : 기본키 조회 - 필터
*/

const getPrimaryKeyList = async (researchQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/primary-key`,
      researchQuery
    );
    console.log('getPrimaryKeyList response : ', response);
    return response.data;
  } catch (error) {
    console.error('getPrimaryKeyList error : ', error);
  }
};

/*
  API 명 : 기본키 상세 - 기본정보
*/
const getPrimaryKeyBaseInfo = async (primaryKeyBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    primaryKeyName,
  } = primaryKeyBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/primary-key/base?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `primaryKeyName=${primaryKeyName}`,
      { skipSpinner: true }
    );
    console.log('getPrimaryKeyBaseInfo response : ', response);
    return response.data;
  } catch (error) {
    console.error('getPrimaryKeyBaseInfo error : ', error);
  }
};

/*
  API 명 : 기본키 상세 - 컬럼
 */
const getPrimaryKeyColumn = async (primaryKeyBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    primaryKeyName,
  } = primaryKeyBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/primary-key/column?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `primaryKeyName=${primaryKeyName}`,
      { skipSpinner: true }
    );
    console.log('getPrimaryKeyColumn response : ', response);
    return response.data;
  } catch (error) {
    console.error('getPrimaryKeyColumn error : ', error);
  }
};

/*
  외래키 조회 --------------------------------------------------------------------------------------------
*/

/*
  API 명 : 외래키 조회 - 필터
*/
const getForeignKeyList = async (researchQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/foreign-key`,
      researchQuery
    );
    console.log('getForeignKeyList response : ', response);
    return response.data;
  } catch (error) {
    console.error('getForeignKeyList error : ', error);
  }
};

/*
  API 명 : 외래키 상세 - 기본정보
*/
const getForeignKeyBaseInfo = async (foreignKeyBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    foreignKeyName,
  } = foreignKeyBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/foreign-key/base?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `foreignKeyName=${foreignKeyName}`,
      { skipSpinner: true }
    );
    console.log('getForeignKeyBaseInfo response : ', response);
    return response.data;
  } catch (error) {
    console.error('getForeignKeyBaseInfo error : ', error);
  }
};

/*
  API 명 : 외래키 조회 - 컬럼
*/
const getForeignKeyColumn = async (foreignKeyBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    foreignKeyName,
  } = foreignKeyBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/foreign-key/column?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `foreignKeyName=${foreignKeyName}`,
      { skipSpinner: true }
    );
    console.log('getForeignKeyColumn response : ', response);
    return response.data;
  } catch (error) {
    console.error('getForeignKeyColumn error : ', error);
  }
};

/*
  인덱스 조회 --------------------------------------------------------------------------------------------
*/

/*
  API 명 : 인덱스 조회 - 필터
*/
const getIndexList = async (researchQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/index`,
      researchQuery
    );
    console.log('getIndexList response : ', response);
    return response.data;
  } catch (error) {
    console.error('getIndexList error : ', error);
  }
};

/*
  API 명 : 인덱스 상세 - 기본정보
*/
const getIndexBaseInfo = async (indexBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    indexName,
  } = indexBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/index/base?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `indexName=${indexName}`,
      { skipSpinner: true }
    );
    console.log('getIndexBaseInfo response : ', response);
    return response.data;
  } catch (error) {
    console.error('getIndexBaseInfo error : ', error);
  }
};

/*
  API 명 : 인덱스 상세 - 컬럼
*/
const getIndexColumn = async (indexBaseQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    indexName,
  } = indexBaseQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/index/column?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `indexName=${indexName}`,
      { skipSpinner: true }
    );
    console.log('getIndexColumn response : ', response);
    return response.data;
  } catch (error) {
    console.error('getIndexColumn error : ', error);
  }
};

/*
  트리거 조회 --------------------------------------------------------------------------------------------
*/

/*
  API 명 : 트리거 조회 - 필터
*/
const getTriggerList = async (researchQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/trigger`,
      researchQuery
    );
    console.log('getTriggerList response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTriggerList error : ', error);
  }
};

/*
  API 명 : 트리거 상세 - 기본 정보
*/
const getTriggerBaseInfo = async (researchQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    triggerName,
  } = researchQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/trigger/base?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `triggerName=${triggerName}`,
      { skipSpinner: true }
    );
    console.log('getTriggerSource response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTriggerSource error : ', error);
  }
};

/*
  API 명 : 트리거 상세 - 소스
*/
const getTriggerSource = async (researchQuery) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    schemaName,
    tableName,
    triggerName,
  } = researchQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/trigger/source?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}&` +
        `triggerName=${triggerName}`,
      { skipSpinner: true }
    );
    console.log('getTrigger response : ', response);
    return response.data;
  } catch (error) {
    console.error('getTrigger error : ', error);
  }
};

export {
  // 테이블 조회
  getTableList, // 테이블 조회 - 필터
  getTableBaseInfo, // 테이블 상세 - 기본조회
  getTableColumnInfo, // 테이블 상세 - 컬럼 조회
  getTablePrimaryKey, // 테이블 상세 - 기본키
  getTablePrimaryKeyDetail, // 테이블 상세 - 기본키 상세
  getTableUpperForeignKey, // 테이블 상세 - 상위 외래키
  getTableChildForeignKey, // 테이블 상세 - 하위 외래키
  getTableIndex, // 테이블 상세 - 인덱스 조회
  getTableIndexDetail, // 테이블 상세- 인덱스 상세
  getTableTrigger, // 테이블 상세 - 트리거 조회
  getTableTriggerSource, // 테이블 상세 - 트리거 소스

  // 컬럼 조회
  getColumnList, // 컬럼 조회 - 필터
  getColumnBaseInfo, // 컬럼 상세 - 기본정보
  getColumnRelatedTable, // 컬럼 상세 - 연관 테이블
  getColumnRelatedPrimaryKey, // 컬럼 상세 - 연관 기본키
  getColumnPKDetails, // 컬럼 상세 - 연관 기본키 상세
  getColumnRelatedForeignKey, // 컬럼 상세 - 연관 외래키
  getColumnRelatedIndex, // 컬럼 상세 - 연관 인덱스
  getColumnIndexDetails, // 컬럼 사세 - 연관 인덱스 상세

  // 기본키 조회
  getPrimaryKeyList, // 기본키 조회 - 필터
  getPrimaryKeyBaseInfo, // 기본키 상세 - 기본정보
  getPrimaryKeyColumn,

  // 외래키 조회
  getForeignKeyList, // 외래키 조회 - 필터
  getForeignKeyBaseInfo, // 외래키 상세 - 기본정보
  getForeignKeyColumn, // 외래키 조회 - 컬럼

  // 인덱스 조회
  getIndexList, // 인덱스 조회 - 필터
  getIndexBaseInfo, // 인덱스 상세 - 기본정보
  getIndexColumn, // 인덱스 상세 - 컬럼

  // 트리거 조회
  getTriggerList, // 트리거 조회 - 필터
  getTriggerBaseInfo, // 트리거 상세 - 기본 정보
  getTriggerSource, // 트리거 상세 - 소스
};
