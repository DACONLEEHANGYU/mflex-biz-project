import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v2';
const excelUrl = '/api/v1/excel/download';

const mockSlowRequest = async (method, url, data, options) => {
  console.log(`[Mock] 요청 시작: ${method} ${url}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`[Mock] 요청 완료 (10초 후 응답)`);
      resolve({ data: { message: 'Mock response after delay' } });
    }, 11000); // 11초 후 응답 (10초 초과)
  });
};

/*
  API 명 :용어 관리 목록 필터
*/
const getTermListV2 = async (termJobQuery) => {
  console.log('getTermJobList - 용어 관리 조회 실행 ');
  console.log('termJobQuery - termJobQuery : ', termJobQuery);
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/manage/term/search`,
      termJobQuery
    );
    console.log('getTermJobList response : ', response);

    return response;
  } catch (error) {
    console.error('getTermJobList error : ', error);
  }
};

// const getTermListV2 = async (termJobQuery) => {
//   console.log('getTermJobList - 용어 관리 조회 실행 ');
//   console.log('termJobQuery - termJobQuery : ', termJobQuery);
//   try {
//     const response = await mockSlowRequest(
//       'post',
//       `${apiUrl}${defaultUrl}/manage/term/search`,
//       termJobQuery
//     );
//     console.log('getTermJobList response : ', response);

//     return response;
//   } catch (error) {
//     console.error('getTermJobList error : ', error);
//   }
// };

/*
  API 명 : 용어 관리 상세
*/
const getTermDetailsV2 = async (data) => {
  console.log('getTermDetailsV2 - 용어 관리 상세 조회 실행 ');
  console.log('getTermDetailsV2 - data : ', data);

  const {
    instituteId,
    dictionaryId,
    termName,
    termAbbreviationName,
    domainName,
  } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/term/details?instituteId=${instituteId}&dictionaryId=${dictionaryId}&termName=${termName}&termAbbreviationName=${termAbbreviationName}&domainName=${domainName}`
    );
    return response;
  } catch (error) {
    console.error('getTermDetailsV2 error : ', error);
  }
};

/*
  API 명 : 용어 작업 목록 조회
*/
const getTermJobListV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/search`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('getTermJobList error : ', error);
  }
};

/*
  API 명 : 용어 작업항목 상세 조회
*/
const getTermJobDetailsV2 = async (data) => {
  const { instituteId, dictionaryId, jobTermId } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/term/details?instituteId=${instituteId}&dictionaryId=${dictionaryId}&jobTermId=${jobTermId}`
    );
    return response;
  } catch (error) {
    console.error('getTermJobDetails error : ', error);
  }
};

/*
  API 명 : 비표준사유코드 조회
*/
const getNonStandardReasonCode = async (data) => {
  const { instituteId, dictionaryId, jobTypeCode } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/common/non-standard-code?instituteId=${instituteId}&dictionaryId=${dictionaryId}&jobTypeCode=${jobTypeCode}`
    );
    return response;
  } catch (error) {
    console.error('getNonStandardReasonCode error : ', error);
  }
};

/**
 * API 명 : 지원하는 데이터타입
 */
const getSupportedDataTypes = async (data) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/common/data-type`
    );

    return response.data;
  } catch (error) {
    console.error('getSupportedDataTypes error : ', error);
  }
};

/*
  API 명 : 도메인분류명 조회
*/
const getResearchDomainClassListV2 = async (data) => {
  console.log('getResearchDomainClassListV2 - 도메인분류명 조회 실행 ');
  console.log('getResearchDomainClassListV2 - data : ', data);
  const { instituteId, dictionaryId, domainClassName, jobTypeCode } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/domain-class/name?instituteId=${instituteId}&dictionaryId=${dictionaryId}&domainClassName=${domainClassName}&jobTypeCode=${jobTypeCode}`
    );
    return response;
  } catch (error) {
    console.error('getResarchDomainClassList error : ', error);
  }
};
/*
  API 명 : 도메인명 검색
*/
const getResearchDomainNameListV2 = async (data) => {
  const { instituteId, dictionaryId, domainClassName, jobTypeCode } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/domain/name?instituteId=${instituteId}&dictionaryId=${dictionaryId}&domainClassName=${domainClassName}&jobTypeCode=${jobTypeCode}`
    );
    return response;
  } catch (error) {
    console.error('getResarchDomainNameList error : ', error);
  }
};

/*
  API 명 : 통합코드구분명 조회
*/
const getResearchUnityCodeListV2 = async (data) => {
  const { instituteId, dictionaryId, unityCodeKoreanName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/unity-code-name/name?instituteId=${instituteId}&dictionaryId=${dictionaryId}&unityCodeKoreanName=${unityCodeKoreanName}`
    );
    return response;
  } catch (error) {
    console.error('getResarchUnityCodeList error : ', error);
  }
};

/*
  API 명 : 용어 자동분할
*/
const getTermDivideV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/composition`,
      data
    );
    return response;
  } catch (error) {
    console.error('getTermDivide error : ', error);
  }
};

/*
  API 명 : 용어 일괋 자동분할
*/
const getTermsDivideV2 = async (data) => {
  const { instituteId, dictionaryId, terms } = data;

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/divide?instituteId=${instituteId}&dictionaryId=${dictionaryId}`,
      terms
    );
    return response;
  } catch (error) {
    console.error('getTermDivide error : ', error);
  }
};

/*
  API 명 : 용어 무결성 체크
*/
const getTermCheckIntegrityV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/check-integrity`,
      data
    );
    return response;
  } catch (error) {
    console.error('getTermIntegrityCheck error : ', error);
  }
};

/*
  API 명 : 용어 신규등록
*/
const manageTermV2 = async (data) => {
  const isTemporary = data.isTemporary;

  const temporaryState = isTemporary ? true : false;

  console.log('temporaryState : ', temporaryState);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term?isTemporary=${temporaryState}`,
      data
    );
    return response;
  } catch (error) {
    console.error('addTerm error : ', error);
    return error;
  }
};

/*
  API 명 : 작업용어 수정
*/
const updateTermV2 = async (data) => {
  console.log('updateTermV2 - data : ', data);
  const isTemporary = data.isTemporary;

  const temporaryState = isTemporary ? true : false;

  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/term?isTemporary=${temporaryState}`,
      data
    );
    return response;
  } catch (error) {
    console.error('updateTerm error : ', error);
    return error;
  }
};

/*
  API 명 : 작업용어 삭제(작업취소)
*/
const deleteTermV2 = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/job/term`,
      data
    );
    return response;
  } catch (error) {
    console.error('deleteTerm error : ', error);
    return error;
  }
};

/*
  API 명 : 연관컬럼 조회
*/
const getRelatedColumnListV2 = async (data) => {
  const { instituteId, termAbbreviationName, logicalDataTypeName } = data;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/term/relation-column?instituteId=${instituteId}&termAbbreviationName=${termAbbreviationName}&logicalDataTypeName=${logicalDataTypeName}`
    );
    return response;
  } catch (error) {
    console.error('getRelatedColumnList error : ', error);
    return error;
  }
};

/*
  API 명 : 작업완료 (관리영역 반영)
*/
const getTermCompliteJobV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/manage/term/apply`,
      data
    );
    return response;
  } catch (error) {
    console.error('getCompliteJob error : ', error);
    return error;
  }
};

/// 단어관리

/**
  API 명 : 단어 관리 목록 조회
 */
const getWordListV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/manage/word/search`,
      data
    );
    return response;
  } catch (error) {
    console.error('getWordList error : ', error);
    return error;
  }
};

/*
  API 명 : 단어관리 상세 조회
*/
const getWordDetailsV2 = async (data) => {
  const {
    instituteId,
    dictionaryId,
    wordAbbreviationName,
    wordName,
    wordTypeCode,
  } = data;

  let typeCode;

  if (wordTypeCode === '일반어') {
    typeCode = 'GENERAL';
  } else if (wordTypeCode === '분류어') {
    typeCode = 'CLASSIFICATION';
  } else if (wordTypeCode === '이음동의어') {
    typeCode = 'SYNONYM';
  } else if (wordTypeCode === '대체어') {
    typeCode = 'ALTERNATIVE';
  } else if (wordTypeCode === '금칙어') {
    typeCode = 'PROHIBITIVE';
  }

  try {
    // 금칙어인 경우 wordAbbreviationName을 URL에서 제외
    let requestUrl =
      `${apiUrl}${defaultUrl}/manage/word/details?instituteId=${instituteId}&` +
      `dictionaryId=${dictionaryId}&` +
      `wordName=${wordName}&` +
      `wordTypeCode=${typeCode}`;

    // 금칙어가 아닌 경우에만 wordAbbreviationName 파라미터 추가
    if (typeCode !== 'PROHIBITIVE' && wordAbbreviationName) {
      requestUrl += `&wordAbbreviationName=${wordAbbreviationName}`;
    }

    const response = await $vxHttp.get(requestUrl);
    return response;
  } catch (error) {
    console.error('getWordDetails error : ', error);
    return error;
  }
};

/*
  API 명 : 단어작업 목록 조회
*/
const getWordJobListV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/search`,
      data
    );
    return response;
  } catch (error) {
    console.error('getWordJobList error : ', error);
    return error;
  }
};

/*
  API 명 : 단어 작업 상세 조회
*/
const getWordJobDetailsV2 = async (data) => {
  console.log('getWordJobDetailsV2 - 단어 작업 상세 조회 실행 ');
  console.log('getWordJobDetailsV2 - data : ', data);

  const { instituteId, dictionaryId, jobWordId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/word/details?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `jobWordId=${jobWordId}`
    );
    return response;
  } catch (error) {
    console.error('getWordJobDetails error : ', error);
    return error;
  }
};

/*
  API 명 : 단어관리 - 타표준조회(단어명)
*/
const getOtherStandardList = async (data) => {
  const { instituteId, dictionaryId, wordName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/word/extend-standard/word-name?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `wordName=${wordName}`
    );
    return response.data;
  } catch (error) {
    console.error('getOtherStandardList error : ', error);
    return error;
  }
};

/*
  API 명 : 단어관리 - 타표준조회(단어약어명)
*/
const getOtherStandardAbbreviationList = async (data) => {
  const { instituteId, dictionaryId, wordAbbreviationName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/word/extend-standard/word-abbreviation-name?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `wordAbbreviationName=${wordAbbreviationName}`
    );
    return response.data;
  } catch (error) {
    console.error('getOtherStandardList error : ', error);
    return error;
  }
};

/*
  API 명 : 단어관리 - 무결성 체크
*/
const getWordCheckIntegrityV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/check-integrity`,
      data
    );
    return response;
  } catch (error) {
    console.error('getWordIntegrityCheck error : ', error);
    return error;
  }
};

/*
  API 명 : 단어관리 - 작업단어 등록
 */
const manageWordV2 = async (data) => {
  const isTemporary = data.isTemporary;
  const temporaryState = isTemporary ? true : false;

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word?isTemporary=${temporaryState}`,
      data
    );
    return response;
  } catch (error) {
    console.error('manageWord error : ', error);
    return error;
  }
};

/**
 * API 명 : 단어관리 - 작업취소
 */
const deleteWordV2 = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/job/word`,
      data
    );
    return response;
  } catch (error) {
    console.error('deleteWord error : ', error);
    return error;
  }
};

/**
 * API 명 : 단어관리 - 작업완료
 */
const getWordCompliteJobV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/manage/word/apply`,
      data
    );
    return response;
  } catch (error) {
    console.error('getWordCompliteJob error : ', error);
    return error;
  }
};

/**
 * API 명 : 단어관리 - 분류어로 사용된 용어 조회
 */
const getRelatedWordClassificationListV2 = async (data) => {
  const { instituteId, dictionaryId, wordAbbreviationName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/word/classification-term?instituteId=${instituteId}&dictionaryId=${dictionaryId}&wordAbbreviationName=${wordAbbreviationName}`
    );
    return response;
  } catch (error) {
    console.error('getRelatedWordClassificationList error : ', error);
    return error;
  }
};

/*
  API 명 : 단어관리 - 연관용어 확인 메시지
*/
const getRelatedWordListV2 = async (data) => {
  const { instituteId, dictionaryId, wordAbbreviationName, wordName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/word/relation-term?instituteId=${instituteId}&dictionaryId=${dictionaryId}&wordAbbreviationName=${wordAbbreviationName}&wordName=${wordName}`
    );
    return response;
  } catch (error) {
    console.error('getRelatedWordList error : ', error);
    return error;
  }
};

/**
 * API 명 : 단어관리 - 작업단어 수정
 */
const getUpdateWordV2 = async (data) => {
  const isTemporary = data.isTemporary;
  const temporaryState = isTemporary ? true : false;
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/word?isTemporary=${temporaryState}`,
      data
    );
    return response;
  } catch (error) {
    console.error('updateWord error : ', error);
    return error;
  }
};

// 도메인관리

/**
 *  API 명 : 도메인관리 - 도메인 트리 조회
 */
const getDomainTreeListV2 = async (data) => {
  const { instituteId, dictionaryId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/domain/tree?instituteId=${instituteId}&dictionaryId=${dictionaryId}`
    );
    return response;
  } catch (error) {
    return error;
  }
};

// /* API 명 : 도메인 트리 생성  */
// const getConstructDomainTreeV2 = (domainTreeRowData) => {
//   console.log('domainTreeRowData ============', domainTreeRowData);
//   const domainNode = {};
//   let i = 0;
//   let allIds = []; // 모든 ID 저장

//   for (let domain of domainTreeRowData) {
//     i++;
//     // 타입이 없을 때.
//     let size = 55;

//     // 트리 루트사전일때
//     if (!domain.domainName) {
//       domain.domainName = '[도메인사전]';
//     }
//     domainNode[`${i}`] = {
//       text: `${domain.domainName}`,
//       id: i,
//       state: { opened: true },
//       children: ['2', '3'],
//       size: size,
//       domainId: domain.domainId,
//       dictionaryId: domain.dictionaryId,
//       domainTypeCode: domain.domainTypeCode,
//     };

//     allIds.push(i); // 모든 ID 저장
//   }

//   // 모든 최상위 항목에 children 추가
//   // for (let key in domainNode) {
//   //   domainNode[key].children = [...allIds];
//   // }
//   console.log('domainNode : ', domainNode);
//   return domainNode;
// };

// const getConstructDomainTreeV2 = (domainTreeRowData) => {
//   console.log('domainTreeRowData ============', domainTreeRowData);
//   const domainNode = {};
//   let i = 0;
//   let allIds = []; // 모든 ID 저장

//   // 먼저 모든 노드를 생성하고 ID를 수집
//   for (let domain of domainTreeRowData) {
//     i++;
//     // 타입이 없을 때.
//     let size = 55;

//     // 트리 루트사전일때
//     if (!domain.domainName) {
//       domain.domainName = '[도메인사전]';
//     }

//     const nodeId = i.toString();
//     domainNode[nodeId] = {
//       text: `${domain.domainName}`,
//       id: i,
//       state: { opened: true },
//       children: [], // 초기에는 빈 배열로 설정
//       size: size,
//       domainId: domain.domainId,
//       instituteId: domain.instituteId,
//       dictionaryId: domain.dictionaryId,
//       domainTypeCode: domain.domainTypeCode,
//     };

//     allIds.push(nodeId); // 문자열 ID 저장
//   }

//   // 최상위 노드 식별 (예: 첫 번째 노드를 최상위로 가정)
//   const rootNodeId = '1';

//   // 최상위 노드에 나머지 모든 ID를 children으로 추가
//   // 단, 자기 자신은 제외
//   domainNode[rootNodeId].children = allIds.filter((id) => id !== rootNodeId);

//   console.log('domainNode : ', domainNode);
//   return domainNode;
// };

const getConstructDomainTreeV2 = (domainTreeRowData) => {
  console.log('domainTreeRowData ============', domainTreeRowData);
  const domainNode = {};
  const domainIdToNodeIdMap = {}; // Map to track domainId to nodeId
  let i = 0;

  // First pass - create all nodes and map domainIds to nodeIds
  for (let domain of domainTreeRowData) {
    i++;
    let size = 55;

    // For root dictionary node
    if (!domain.domainName) {
      domain.domainName = '[도메인사전]';
    }

    const nodeId = i.toString();
    domainNode[nodeId] = {
      text: `${domain.domainName}`,
      id: i,
      state: { opened: true },
      children: [], // Initialize with empty array
      size: size,
      domainId: domain.domainId,
      instituteId: domain.instituteId,
      dictionaryId: domain.dictionaryId,
      domainTypeCode: domain.domainTypeCode,
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
 * API 명 : 도메인관리 - 관리 도메인 조회
 */
const getDomainListV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/manage/domain/search`,
      data
    );
    return response;
  } catch (error) {
    console.error('getDomainList error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인관리 - 관리도메인 상세
 */
const getDomainDetailsV2 = async (data) => {
  const { instituteId, dictionaryId, domainName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/domain/details?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `domainName=${domainName}`
    );
    return response;
  } catch (error) {
    console.error('getDomainDetails error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인관리 - 작업 도메인 조회
 */
const getDomainJobListV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain/search`,
      data
    );
    return response;
  } catch (error) {
    console.error('getDomainJobListV2 error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인관리 - 작업 도메인 상세
 */
const getDomainJobDetailsV2 = async (data) => {
  const { instituteId, dictionaryId, jobTypeCode, jobDomainId } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/domain/details?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `jobTypeCode=${jobTypeCode}&` +
        `jobDomainId=${jobDomainId}`
    );
    return response;
  } catch (error) {
    console.error('getDomainJobDetails error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인관리 - 작업 도메인 등록
 */
const manageDomainV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain`,
      data
    );
    return response;
  } catch (error) {
    console.error('manageDomain error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인관리 - 작업 도메인 수정
 */
const updateDomainV2 = async (data) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/domain`,
      data
    );
    return response;
  } catch (error) {
    console.error('updateDomain error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인관리 - 작업 도메인 삭제
 */
const deleteDomainV2 = async (data) => {
  try {
    const response = await $vxHttp.delete(
      `${apiUrl}${defaultUrl}/job/domain`,
      data
    );
    return response;
  } catch (error) {
    console.error('deleteDomain error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인관리 - 작업 도메인 승인
 */
const approveDomainV2 = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/manage/domain/apply`,
      data
    );
    return response;
  } catch (error) {
    console.error('approveDomain error : ', error);
    return error;
  }
};

/*
  API 명 : 도메인관리 - 연관용어 조회
 */
const getRelatedTermDomainListV2 = async (data) => {
  const { instituteId, dictionaryId, domainName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/domain/relation-term?` +
        `instituteId=${instituteId}&` +
        `dictionaryId=${dictionaryId}&` +
        `domainName=${domainName}`
    );
    return response;
  } catch (error) {
    console.error('getRelatedDomainList error : ', error);
    return error;
  }
};

/**
 * API 명 : 도메인관리 - 도메인분류명 조회
 */
const getDomainClassByDomainMng = async (data) => {
  const { instituteId, dictionaryId, domainClassName } = data;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/manage/domain-class/name?instituteId=${instituteId}&dictionaryId=${dictionaryId}&domainClassName=${domainClassName}`
    );
    return response;
  } catch (error) {
    console.error('getDomainClassByDomainMng error : ', error);
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
 * 용어 엑셀 일괄 업로드
 */
const uploadTermFileV2 = async (data) => {
  console.log('fileData : ', data);
  for (let [key, value] of data.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/excel-upload`,
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

/**
 * 단어 엑셀 일괄 업로드
 */
const uploadWordFileV2 = async (data) => {
  console.log('fileData : ', data);
  for (let [key, value] of data.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/excel-upload`,
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

/**
 * 도메인 엑셀 일괄 업로드
 */
const uploadDomainFileV2 = async (data) => {
  console.log('fileData : ', data);
  for (let [key, value] of data.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain/excel-upload`,
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

/**
 * API 명 : 뷰용어 다운로드
 */
const getTermViewDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/view-term-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정
        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getTermViewDownload error : ', error);
    throw error; // 🔥 에러를 다시 던져서 호출한 곳에서 처리할 수 있도록
  }
};

/**
 * API 명 : 뷰단어 다운로드
 */
const getWordViewDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/view-word-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정
        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getWordViewDownload error : ', error);
    throw error;
  }
};
/**
 * API 명 : 뷰도메인 다운로드
 */
const getDomainViewDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/view-domain-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정
        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getDomainViewDownload error : ', error);
    throw error;
  }
};

/**
 * API 명 : 관리 용어 엑셀 다운로드
 */
const getMngTermDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/manage-term-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정
        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getMngTermDownload error : ', error);
    throw error;
  }
};
/**
 * API 명 : 관리 단어 엑셀 다운로드
 */
const getMngWordDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/manage-word-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정

        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getMngWordDownload error : ', error);
    throw error;
  }
};
/**
 * API 명 : 관리 도메인 엑셀 다운로드
 */
const getMngDomainDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/manage-domain-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정
        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getMngDomainDownload error : ', error);
    throw error;
  }
};

/**
 * API 명 : 작업용어 다운로드
 */
const getJobTermDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/job-term-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정
        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getJobTermDownload error : ', error);
    throw error;
  }
};

/**
 * API 명 : 작업단어 다운로드
 */
const getJobWordDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/job-word-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정
        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getJobWordDownload error : ', error);
    throw error;
  }
};

/**
 *  API 명 : 작업도메인 다운로드
 */
const getJobDomainDownload = async (data) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${excelUrl}/job-domain-streaming`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob', // 🔥 중요: 파일 다운로드를 위해 blob 타입으로 설정
        timeout: 0, // 🔥 큰 파일의 경우 타임아웃 해제
      }
    );
    return response;
  } catch (error) {
    console.error('getJobDomainDownload error : ', error);
    throw error;
  }
};

export {
  getTermListV2, // 용어 관리 목록 필터
  getTermDetailsV2, // 용어 관리 상세
  getTermJobListV2, // 용어 작업 목록 조회
  getTermJobDetailsV2, // 용어 작업항목 상세 조회
  getNonStandardReasonCode, // 비표준사유코드 조회
  getResearchDomainClassListV2, // 도메인분류명 조회
  getResearchDomainNameListV2, // 도메인명 검색
  getResearchUnityCodeListV2, // 통합코드구분명 조회
  getTermDivideV2, // 용어 자동분할
  getTermsDivideV2, // 용어 일괄괄 자동분할
  getTermCheckIntegrityV2, // 용어 무결성 체크
  manageTermV2, // 용어 등록
  updateTermV2, // 용어 수정
  deleteTermV2, // 용어 작업취소
  getRelatedColumnListV2, // 연관컬럼 조회
  getTermCompliteJobV2, // 작업완료 (관리영역 반영)
  getWordListV2, // 단어 관리 목록 조회
  getWordDetailsV2, // 단어관리 상세 조회
  getWordJobListV2, // 단어작업 목록 조회
  getWordJobDetailsV2, // 단어 작업 상세 조회
  getOtherStandardList, // 타표준조회
  getOtherStandardAbbreviationList, // 타표준조회(단어약어명)
  getWordCheckIntegrityV2, // 단어 무결성 체크
  manageWordV2, // 단어 등록
  deleteWordV2, // 단어 작업취소
  getWordCompliteJobV2, // 단어 작업완료
  getRelatedWordListV2, // 연관 용어 조회
  getRelatedWordClassificationListV2, // 분류어로 사용된 용어 조회
  getUpdateWordV2,
  getDomainTreeListV2,
  getConstructDomainTreeV2,
  getDomainListV2,
  getDomainDetailsV2,
  getDomainJobListV2,
  getDomainJobDetailsV2,
  manageDomainV2,
  updateDomainV2,
  deleteDomainV2,
  approveDomainV2,
  getRelatedTermDomainListV2,
  getDomainClassByDomainMng,
  uploadTermFileV2, // 용어 엑셀 업로드
  uploadWordFileV2, // 단어 엑셀 업로드
  uploadDomainFileV2, // 도메인 엑셀 업로드
  getSupportedDataTypes, // 지원하는 데이터타입 조회
  getTermViewDownload, // 뷰 용어 다운로드
  getWordViewDownload, // 뷰 단어 다운로드
  getDomainViewDownload, // 뷰 도메인 다운로드
  getMngTermDownload, // 관리 용어 다운로드
  getMngWordDownload, // 관리 단어 다운로드
  getMngDomainDownload, // 관리 도메인 다운로드
  getJobTermDownload, // 작업 용어 다운로드
  getJobWordDownload, // 작업 단어 다운로드
  getJobDomainDownload, // 작업 도메인 다운로드
};
