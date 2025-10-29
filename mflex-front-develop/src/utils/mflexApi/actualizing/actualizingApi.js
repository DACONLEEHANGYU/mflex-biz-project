import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v2';

/*
  API 명 : 관리 테이블 복제
*/
const getCopyMngTable = async (data) => {
  const { instituteId, informationSystemId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/table/replication?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}`,
      {},
      { skipTimeoutAlert: true, timeout: 0 }
    );
    return response;
  } catch (error) {
    console.error('getCopyMngTable error : ', error);
    return error;
  }
};
/*
  API 명 : 표준화 테이블 조회
*/
const getActualizingTable = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/table/search`,
      data
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 표준화 테이블 상세
*/
const getActualizingTableDetail = async (data) => {
  const { instituteId, databaseId, schemaName, tableName } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/synchronize/table?` +
        `instituteId=${instituteId}&` +
        `databaseId=${databaseId}&` +
        `schemaName=${schemaName}&` +
        `tableName=${tableName}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 표준화 비표준사유 코드 목록
*/
const getActualizingNonStandardReason = async (data) => {
  const { instituteId, databaseId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/synchronize/common/non-standard-code?` +
        `instituteId=${instituteId}&` +
        `databaseId=${databaseId}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 표준화 제외 사유코드 목록
*/
const getActualizingExclusionReason = async (data) => {
  const { instituteId, databaseId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/synchronize/common/exclude-code?` +
        `instituteId=${instituteId}&` +
        `databaseId=${databaseId}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 표준화 테이블 업데이트
*/
const updateActualizingTable = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/synchronize/table`,
      data
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 관리 컬럼 복제
*/
const getCopyMngColumn = async (data) => {
  const { instituteId, informationSystemId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/column/replication?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}`,
      {},
      { skipTimeoutAlert: true, timeout: 0 }
    );
    return response;
  } catch (error) {
    console.error('getCopyMngColumn error : ', error);
    return error;
  }
};

/*
  API 명 : 컬럼명 분포 현황 조회
*/
const getActualizingColumnSearch = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/column/search`,
      data
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 컬럼명 정제조건 조회
*/
const getActualizingColumnCondition = async (data) => {
  const { instituteId, informationSystemId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/synchronize/column/condition?instituteId=${instituteId}&informationSystemId=${informationSystemId}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 컬럼명 정제조건 설정
 */
const updateActualizingColumnCondition = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/synchronize/column/condition`,
      data
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 컬럼한글명 정제(일괄)
*/
const updateActualizingColumnBatch = async (data) => {
  const { instituteId, dictionaryId, informationSystemId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/column/refine-batch?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `informationSystemId=${informationSystemId}`,
      {},
      { skipTimeoutAlert: true, timeout: 0 }
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 컬럼한글명 정제(단일)
*/
const updateActualizingColumnRefine = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/column/refine`,
      data
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 컬럼한글명 분포도 조회
*/
const getActualizingColumnDistribution = async (data) => {
  const { instituteId, informationSystemId, databaseId, columnName } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/synchronize/column/distribution?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `columnName=${columnName}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 컬럼한글명 연관테이블 조회
*/
const getActualizingColumnAssociation = async (data) => {
  const {
    instituteId,
    informationSystemId,
    databaseId,
    columnName,
    columnKoreanName,
    refinedColumnKoreanName,
  } = data;

  // columnKoreanName이 [NULL]인 경우 URL 인코딩된 값으로 변경
  const encodedColumnKoreanName =
    columnKoreanName === '[NULL]' ? '%5BNULL%5D' : columnKoreanName;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/synchronize/column/relation?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `databaseId=${databaseId}&` +
        `columnName=${columnName}&` +
        `columnKoreanName=${encodedColumnKoreanName}&` +
        `refinedColumnKoreanName=${refinedColumnKoreanName}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 표준화 용어 추출
*/
const getExtractTerm = async (data) => {
  const { instituteId, dictionaryId, informationSystemId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/term/extract?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `informationSystemId=${informationSystemId}`,
      {},
      { skipTimeoutAlert: true, timeout: 0 }
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 용어영문약어명 단어분할(단일)
*/
const termEnglishAbbreviationSplit = async (data) => {
  const { instituteId, dictionaryId, termAbbreviationName } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/term/korean-term-name?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `termAbbreviationName=${termAbbreviationName}`
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 용어영문약어명 단어분할(일괄)
*/
const termEnglishAbbreviationSplitBatch = async (data) => {
  const { instituteId, dictionaryId, termAbbreviationNames } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/term/korean-term-name-batch?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}`,
      termAbbreviationNames
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 작업용어 패치
*/
const getTermPatch = async (data) => {
  try {
    const response = await $vxHttp.patch(
      `${apiUrl}${defaultUrl}/job/term`,
      data
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 도메인그룹명 조회
*/
const getDomainGroup = async (data) => {
  const { instituteId, dictionaryId, domainGroupName, jobTypeCode } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/domain-group/name?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `domainGroupName=${domainGroupName}&` +
        `jobTypeCode=${jobTypeCode}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/**
  API 명 : 도메인분류명 조회 - 그룹명
 */
const getDomainClassByGroup = async (data) => {
  const { instituteId, dictionaryId, domainGroupName, jobTypeCode } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/domain-class/group?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `domainGroupName=${domainGroupName}&` +
        `jobTypeCode=${jobTypeCode}`
    );
    return response.data;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 표준화 단어 추출
*/
const getExtractWord = async (data) => {
  const { instituteId, dictionaryId, informationSystemId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/word/extract?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `informationSystemId=${informationSystemId}`,
      {},
      { skipTimeoutAlert: true, timeout: 0 }
    );
    return response;
  } catch (error) {
    return error;
  }
};

/*
  API 명 : 표준화 도메인 추출
*/
const getExtractDomain = async (data) => {
  const { instituteId, dictionaryId } = data;
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/synchronize/domain/extract?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}`,
      {},
      { skipTimeoutAlert: true, timeout: 0 }
    );
    return response;
  } catch (error) {
    return error;
  }
};

/**
 * API 명 : 사전표준화 작업용어 변경
 */
const getUpdateSynchronizeTerm = async (data) => {
  const isTemporary = data.term.isTemporary;

  const temporaryState = isTemporary ? true : false;

  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/synchronize/term?isTemporary=${temporaryState}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('getUpdateSynchronizeTerm error : ', error);
    return error;
  }
};

export {
  getCopyMngTable, // 관리 테이블 복제
  getActualizingTable, // 표준화 테이블 조회
  getActualizingTableDetail, // 표준화 테이블 상세
  getActualizingNonStandardReason, // 표준화 비표준사유 코드 목록
  getActualizingExclusionReason, // 표준화 제외 사유코드 목록
  updateActualizingTable, // 표준화 테이블 업데이트
  getCopyMngColumn, // 관리 컬럼 복제
  getActualizingColumnSearch, // 컬럼명 분포 현황 조회
  getActualizingColumnCondition, // 컬럼명 정제조건 조회
  getActualizingColumnDistribution, // 컬럼한글명 분포도 조회
  getActualizingColumnAssociation, // 컬럼한글명 연관테이블 조회
  updateActualizingColumnCondition, // 컬럼명 정제조건 설정
  updateActualizingColumnBatch, // 컬럼한글명 정제(일괄)
  updateActualizingColumnRefine, // 컬럼한글명 정제(단일)
  getExtractTerm, // 표준화 용어 추출
  getExtractWord, // 표준화 단어 추출
  termEnglishAbbreviationSplit, // 용어영문약어명 단어분할(단일)
  termEnglishAbbreviationSplitBatch, // 용어영문약어명 단어분할(일괄)
  getDomainClassByGroup, // 도메인분류명 조회 - 그룹명
  getDomainGroup, // 도메인그룹명 조회
  getTermPatch, // 작업용어 패치
  getExtractDomain, // 표준화 도메인 추출
  getUpdateSynchronizeTerm, // 사전표준화 작업용어 변경
};
