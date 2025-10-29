import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v2';

/*
  API 명 : 용어 목록 조회
*/
const getTermViewSearch = async (termViewQuery) => {
  console.log('getTermViewSearch - 용어 조회 실행 ');
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/view/term/search`,
      termViewQuery
    );
    console.log('getTermJobList response : ', response);

    return response;
  } catch (error) {
    console.error('getTermJobList error : ', error);
  }
};

/**
 * API 명 : 용어 기본정보 조회
 */
const getTermBaseInfo = async (requestParams) => {
  const {
    termName,
    domainName,
    instituteId,
    dictionaryId,
    termAbbreviationName,
    termStandardYn, // 표준 여부 추가
  } = requestParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/term/base?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}&` +
        `domainName=${domainName}&` +
        `termStandardYn=${termStandardYn}` // 표준 여부 추가
    );
    return response.data;
  } catch (error) {
    console.error('getTermBaseInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 용어 단어 구성정보 조회
 */
const getTermWordInfo = async (requestParams) => {
  const {
    instituteId,
    dictionaryId,
    termName,
    termAbbreviationName,
    domainName,
  } = requestParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/term/word-composition?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getTermWordInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 용어 도메인 정보 조회
 */
const getTermDomainInfo = async (requestParams) => {
  const {
    instituteId,
    dictionaryId,
    termName,
    termAbbreviationName,
    domainName,
  } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/term/domain?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getTermDomainInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 이음동의어 조회
 */
const getTermSynonymInfo = async (requestParams) => {
  const {
    instituteId,
    dictionaryId,
    termName,
    termAbbreviationName,
    domainName,
  } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/term/synonym?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getTermSynonymInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 연관통합코드명 조회
 */
const getTermCodeNameInfo = async (requestParams) => {
  const {
    instituteId,
    dictionaryId,
    termName,
    termAbbreviationName,
    domainName,
  } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/term/relation-code-name?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getTermCodeInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 연관통합코드값 조회
 */
const getTermCodeValueInfo = async (requestParams) => {
  const {
    instituteId,
    dictionaryId,
    termName,
    termAbbreviationName,
    domainName,
  } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/term/relation-code-value?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getTermCodeInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 연관컬럼 조회
 */
const getTermColumnInfo = async (requestParams) => {
  const {
    instituteId,
    informationSystemId,
    termName,
    termAbbreviationName,
    logicalDataTypeName,
  } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/term/relation-column?instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}&` +
        `logicalDataTypeName=${logicalDataTypeName}`
    );
    return response.data;
  } catch (error) {
    console.error('getTermColumnInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 히스토리 조회
 */
const getTermHistoryInfo = async (requestParams) => {
  const {
    instituteId,
    dictionaryId,
    termName,
    termAbbreviationName,
    domainName,
  } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/term/history?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getTermHistoryInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 단어조회 - 단어목록 조회
 */
const getWordViewSearch = async (wordViewQuery) => {
  console.log('getWordViewSearch - 단어 조회 실행 ');
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/view/word/search`,
      wordViewQuery
    );
    console.log('getWordViewSearch response : ', response);

    return response;
  } catch (error) {
    console.error('getWordViewSearch error : ', error);
  }
};

/**
 * API 명 : 단어조회 - 단어 기본정보 조회
 */
const getWordBaseInfo = async (requestParams) => {
  const {
    instituteId,
    dictionaryId,
    wordName,
    wordAbbreviationName,
    wordTypeCode,
  } = requestParams;

  try {
    // 금칙어인 경우 wordAbbreviationName을 URL에서 제외
    let requestUrl =
      `${apiUrl}${defaultUrl}/view/word/base?instituteId=${instituteId}&` +
      `dictionaryId=${dictionaryId}&` +
      `wordName=${wordName}&` +
      `wordTypeCode=${wordTypeCode}`;

    // 금칙어가 아닌 경우에만 wordAbbreviationName 파라미터 추가
    if (wordTypeCode !== 'PROHIBITIVE' && wordAbbreviationName) {
      requestUrl += `&wordAbbreviationName=${wordAbbreviationName}`;
    }

    const response = await $vxHttp.get(requestUrl);
    return response.data;
  } catch (error) {
    console.error('getWordBaseInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 단어조회 - 단어 이음동의어 조회
 */
const getWordSynonymInfo = async (requestParams) => {
  const { instituteId, dictionaryId, wordAbbreviationName, wordTypeCode } =
    requestParams;
  try {
    // let requestUrl =
    //   `${apiUrl}${defaultUrl}/view/word/base?instituteId=${instituteId}&` +
    //   `dictionaryId=${dictionaryId}&` +
    //   `wordAbbreviationName=${wordAbbreviationName}`;

    // // 금칙어가 아닌 경우에만 wordAbbreviationName 파라미터 추가
    // if (wordTypeCode !== 'PROHIBITIVE' && wordAbbreviationName) {
    //   requestUrl += `&wordAbbreviationName=${wordAbbreviationName}`;
    // }

    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/word/synonym?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `wordAbbreviationName=${wordAbbreviationName}`
    );
    return response.data;
  } catch (error) {
    console.error('getWordSynonymInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 단어조회 - 단어 연관용어 조회
 */
const getWordRelatedTermList = async (requestParams) => {
  const { instituteId, dictionaryId, wordName, wordAbbreviationName } =
    requestParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/word/relation-term?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `wordName=${wordName}&` +
        `wordAbbreviationName=${wordAbbreviationName}`
    );
    return response.data;
  } catch (error) {
    console.error('getWordRelatedTermList error : ', error);
    return error;
  }
};

/**
 * API 명 : 단어조회 - 변경이력 조회
 */
const getWordHistoryInfo = async (requestParams) => {
  const { instituteId, dictionaryId, wordName, wordAbbreviationName } =
    requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/word/history?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `wordName=${wordName}&` +
        `wordAbbreviationName=${wordAbbreviationName}`
    );
    return response.data;
  } catch (error) {
    console.error('getWordHistoryInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인 트리 조회
 */
const getDomainTreeData = async (requestParams) => {
  const { instituteId, dictionaryId, parentDomainId, dictionarySearchCode } =
    requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/domain/tree?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `parentDomainId=${parentDomainId}&` +
        `dictionarySearchCode=${dictionarySearchCode}`
    );
    return response.data;
  } catch (error) {
    console.error('getDomainTreeData error : ', error);
    return error;
  }
};

/* API 명 : 도메인 트리 생성  */
const getConstructDomainTreeView = (domainTreeRowData) => {
  console.log('domainTreeRowData ============', domainTreeRowData);
  const domainNode = {};
  const domainIdToNodeIdMap = {}; // Map to track domainId to nodeId
  let i = 0;

  // First pass - create all nodes and map domainIds to nodeIds
  for (let domain of domainTreeRowData) {
    i++;
    // 타입이 없을 때.
    let size = 55;
    let type = domain.dictionaryTypeName;

    if (domain.dictionaryTypeName == null) {
      size = 0;
      type = '';
    }

    // 트리 루트사전일때
    if (domain.typeCode === '00' || !domain.domainName) {
      domain.domainName = '[도메인사전]';
    }

    const nodeId = i.toString();
    domainNode[nodeId] = {
      text: `${domain.domainName}`,
      id: i,
      state: { opened: true },
      children: [], // Initialize with empty array
      type: type,
      color: `${domain.dictionaryTypeForegroundColorName}`,
      bgColor: `${domain.dictionaryTypeBackgroundColorName}`,
      size: size,
      domainId: domain.domainId,
      domainLevel: domain.domainLevel,
      domainName: domain.domainName,
      dictionaryId: domain.dictionaryId,
      domainTypeCode: domain.domainTypeCode,
      parentDomainId: domain.parentDomainId,
    };

    // Map domainId to nodeId for later reference
    domainIdToNodeIdMap[domain.domainId] = nodeId;
  }

  // Second pass - establish parent-child relationships
  for (let domain of domainTreeRowData) {
    const nodeId = domainIdToNodeIdMap[domain.domainId];

    // Skip if nodeId not found (shouldn't happen)
    if (!nodeId) continue;

    // If this node has a parent, add this node to parent's children
    if (domain.parentDomainId && domainIdToNodeIdMap[domain.parentDomainId]) {
      const parentNodeId = domainIdToNodeIdMap[domain.parentDomainId];
      domainNode[parentNodeId].children.push(nodeId);
    }
  }

  console.log('domainNode : ', domainNode);
  return domainNode;
};

/**
 * API 명 : 도메인 조회
 */
const getDomainSearchV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/view/domain/search`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('getDomainSearchV2 error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인 기본정보 조회
 */
const getDomainBaseInfo = async (requestParams) => {
  const { instituteId, dictionaryId, domainName } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/domain/base?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getDomainBaseInfo error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인 연관용어 조회
 */
const getDomainRelatedTermList = async (requestParams) => {
  const { instituteId, dictionaryId, domainName } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/domain/relation-term?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getDomainRelatedTermList error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인 변경이력 조회
 */
const getDomainHistoryInfo = async (requestParams) => {
  const { instituteId, dictionaryId, domainName } = requestParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/view/domain/history?instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `domainName=${domainName}`
    );
    return response.data;
  } catch (error) {
    console.error('getDomainHistoryInfo error : ', error);
    return error;
  }
};

export {
  getTermViewSearch, // 용어 목록 조회
  getTermBaseInfo, // 용어 기본정보 조회
  getTermWordInfo, // 용어 단어 구성정보 조회
  getTermCodeNameInfo, // 연관통합코드명 조회
  getTermCodeValueInfo, // 연관통합코드값 조회
  getTermDomainInfo, // 용어 도메인 정보 조회
  getTermSynonymInfo, // 이음동의어 조회
  getTermColumnInfo, // 연관컬럼 조회
  getTermHistoryInfo, // 히스토리 조회
  getWordViewSearch, // 단어조회 - 단어목록 조회
  getWordBaseInfo, // 단어조회 - 단어 기본정보 조회
  getWordSynonymInfo, // 단어조회 - 단어 이음동의어 조회
  getWordRelatedTermList, // 단어조회 - 단어 연관용어 조회
  getWordHistoryInfo, // 단어조회 - 변경이력 조회
  getDomainTreeData, // 도메인 트리 조회
  getConstructDomainTreeView, // 도메인 트리 생성
  getDomainSearchV2, // 도메인 조회
  getDomainBaseInfo, // 도메인 기본정보 조회
  getDomainRelatedTermList, // 도메인 연관용어 조회
  getDomainHistoryInfo, // 도메인 변경이력 조회
};
