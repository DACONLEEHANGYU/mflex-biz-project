import { ref, isProxy, toRaw, watch } from 'vue';
import { $vxHttp } from '@/api';
import { object, string } from 'yup';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v1';
const chainApiUrl = '/api/v1/setting';

/* 
  API : 그리드 헤더 조회 
*/
const getGridHeaderList = async (pramData) => {
  try {
    const headerList = await $vxHttp.get(`${apiUrl}${defaultUrl}/`, pramData);
    const userGridHeaderData = [];

    if (headerList.data !== null) {
      for (let h = 0; h < headerList.data.length; h++) {
        userGridHeaderData.push({
          headerName: '',
          field: '',
          hide: '',
          pinned: '',
          sortable: '',
          sort: '',
          sortIndex: '',
          cellClass: '',
          width: '',
          cellRenderer: '',
          valueFormatter: '',
        });
        return await userGridHeaderData;
      }
    }
  } catch (error) {
    console.log('그리드 헤더 데이터 조회 ERROR ===========');
    console.error(error);

    return null;
  }
};

/* 
  API : 그리드 데이터 조회
   - component에서 paramData( 각 api 주소를 함께 )를 전달
*/
const getGridRowDataList = async (paramData) => {
  const uri = paramData.uri;
  const apiData = {
    paramMetaMngInstId: paramData.paramMetaMngInstId,
    paramDctnryId: paramData.paramDctnryId,
    paramFetchCnt: paramData.paramFetchCnt,
    paramWhereQuery: '',
    paramOrderByQuery: '',
    paramLastClmnInfo: '',
    paramLastCmprInfo: '',
    paramLastDataInfo: '',
  };

  // 조회결과값
  const loadResultCount = { count: '', total: '' };

  const gridRowDataList = await $vxHttp.get(
    `${apiUrl}${defaultUrl}/${paramData.uri}`,
    apiData
  );

  // grid 데이터 초기화
  const gridFormatData = [];

  if (gridRowDataList.data != null) {
    loadResultCount.count = Number(gridRowDataList.data).toLocaleString();
    loadResultCount.total = Number(gridRowDataList.data).toLocaleString();
  }
  return await { loadResultCount, gridRowDataList };
};

/*
  API : 용어사전 그리드 데이터 바인딩
*/

/*
  API : 용어사전 기본정보 조회
*/
const getTermBaseInfo = async (termBaseQuery) => {
  const params = {
    termDictionaryId: termBaseQuery.termDictionaryId,
    termName: termBaseQuery.termName,
    termAbbreviationName: termBaseQuery.termAbbreviationName,
  };

  const options = {
    skipSpinner: true,
  };

  const termBaseInfo = await $vxHttp.get(
    `${apiUrl}${defaultUrl}/term/base`,
    params, // 두 번째 인자로 params
    options // 세 번째 인자로 options
  );

  const defaultAttribute = termBaseInfo.data;

  console.log('termBaseInfo ===============', termBaseInfo.data);

  /* const termBaseData = {
    termName: {
      type: defaultAttribute.term.dictionary.type.name,
      label: defaultAttribute.term.name,
      color: defaultAttribute.term.dictionary.type.fontColor,
      bgColor: defaultAttribute.term.dictionary.type.backgroundColor,
      size: 60,
    },
    typeName: defaultAttribute.term.typeName,
    explain: defaultAttribute.term.explain,
    abbreviationName: defaultAttribute.term.abbreviationName,
    englishName: defaultAttribute.term.englishName,
    domainName: {
      type: defaultAttribute.domain.dictionary.type.name,
      label: defaultAttribute.domain.name,
      color: defaultAttribute.domain.dictionary.type.fontColor,
      bgColor: defaultAttribute.domain.dictionary.type.backgroundColor,
    },
    codeTypeName: defaultAttribute.codeTypeName,
    dataPermissionValue: defaultAttribute.dataPermissionValue,
    dataUnitName: defaultAttribute.dataUnitName,
    enactCycle: defaultAttribute.enactCycle,
    enactDate: defaultAttribute.enactDate,
    expressionFormatContext: defaultAttribute.expressionFormatContext,
    managementDepartmentName: defaultAttribute.managementDepartmentName,
    relationCode: {
      type: defaultAttribute.relationCode.type.name,
      label: defaultAttribute.relationCode.name,
      color: defaultAttribute.relationCode.type.fontColor,
      bgColor: defaultAttribute.relationCode.type.backgroundColor,
      size: 60,
    },
    revisionCycle: defaultAttribute.revisionCycle,
    revisionDate: defaultAttribute.revisionDate,
    storageFormatContext: defaultAttribute.storageFormatContext,
    taskFieldName: defaultAttribute.taskFieldName,
    updateDateTime: defaultAttribute.updateDateTime,
    updater: defaultAttribute.updater,
  }; */

  const termBaseData = {
    typeName: defaultAttribute.term.typeName,
    explain: defaultAttribute.term.explain,
    abbreviationName: defaultAttribute.term.abbreviationName,
    englishName: defaultAttribute.term.englishName,
    codeTypeName: defaultAttribute.codeTypeName,
    dataPermissionValue: defaultAttribute.dataPermissionValue,
    dataUnitName: defaultAttribute.dataUnitName,
    enactCycle: defaultAttribute.enactCycle,
    enactDate: defaultAttribute.enactDate,
    expressionFormatContext: defaultAttribute.expressionFormatContext,
    managementDepartmentName: defaultAttribute.managementDepartmentName,
    relationCode: {
      type: defaultAttribute.relationCode.type.name,
      label: defaultAttribute.relationCode.name,
      color: defaultAttribute.relationCode.type.fontColor,
      bgColor: defaultAttribute.relationCode.type.backgroundColor,
      size: 60,
    },
    revisionCycle: defaultAttribute.revisionCycle,
    revisionDate: defaultAttribute.revisionDate,
    storageFormatContext: defaultAttribute.storageFormatContext,
    taskFieldName: defaultAttribute.taskFieldName,
    updateDateTime: defaultAttribute.updateDateTime,
    updater: defaultAttribute.updater,
  };

  const termName = {
    type: defaultAttribute.term.dictionary.type.name,
    label: defaultAttribute.term.name,
    color: defaultAttribute.term.dictionary.type.fontColor,
    bgColor: defaultAttribute.term.dictionary.type.backgroundColor,
    size: 60,
  };

  const domainName = {
    domainName: {
      type: defaultAttribute.domain.dictionary.type.name,
      label: defaultAttribute.domain.name,
      color: defaultAttribute.domain.dictionary.type.fontColor,
      bgColor: defaultAttribute.domain.dictionary.type.backgroundColor,
    },
  };

  //console.log('API termBaseData ====', termBaseData);

  return await { termBaseData, termName, domainName };
};

/* 
  API 명 : 용어 상세조회 (구성단어 조회) 
*/
const getTermStructureWord = async (termStructureWordQeury) => {
  const { dictionaryId, termDictionaryId, termName, termAbbreviationName } =
    termStructureWordQeury;

  try {
    let termStructureWordData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/structure-word?` +
        `dictionaryId=${dictionaryId}&` +
        `termDictionaryId=${termDictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('api js / termStructureWordData === ', termStructureWordData);
    return await termStructureWordData;
  } catch (error) {
    console.error(error);
  }
};

/*
  API 명 : 용어 상세조회 (연관통합코드 조회)
*/
const getTermRelationCode = async (termRelationCodeQuery) => {
  const { termName, termAbbreviationName, dictionaryId, termDictionaryId } =
    termRelationCodeQuery;
  let termRelationCodeData;
  /* const { dictionaryId, termDictionaryId } = termRelationCodeQuery;
  const termName = '결산구분코드';
  const termAbbreviationName = 'STAC_SE_CD'; */
  try {
    termRelationCodeData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/relation-code?` +
        `dictionaryId=${dictionaryId}&` +
        `termDictionaryId=${termDictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('api js / getTermRelationCode === ', termRelationCodeData);
    return await termRelationCodeData;
  } catch (error) {
    console.log('api js / getTermRelationCode === ', termRelationCodeData);
    //console.error(error);
    return await termRelationCodeData;
  }
};

/*
  API 명 : 용어 상세조회 (연관통합코드값 조회)
*/
const getTermRelationCodeValue = async (termRelationCodeQuery) => {
  const { termName, termAbbreviationName, dictionaryId, termDictionaryId } =
    termRelationCodeQuery;
  /* const { dictionaryId, termDictionaryId } = termRelationCodeQuery;
  const termName = '결산구분코드';
  const termAbbreviationName = 'STAC_SE_CD'; */
  try {
    let termRelationCodeData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/relation-code-value?` +
        `dictionaryId=${dictionaryId}&` +
        `termDictionaryId=${termDictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('api js / getTermRelationCodeValue === ', termRelationCodeData);
    return await termRelationCodeData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/* 
  API 명 : 용어 상세조회 (연관속성 조회) 
*/
const getRelationAttribute = async (termRelationElementQuery) => {
  const { instituteId, informationSystemId, termAbbreviationName } =
    termRelationElementQuery;
  /* const { dictionaryId, termDictionaryId } = termDomainQuery;
  const termName = '결산구분코드';
  const termAbbreviationName = 'STAC_SE_CD'; */
  try {
    let termElementData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/relation-element?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=${informationSystemId}&` +
        `termAbbreviationName=${termAbbreviationName}`,
      { skipSpinner: true }
    );

    /* let termElementData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/relation-element?` +
        `instituteId=${instituteId}&` +
        `informationSystemId=4&` +
        `termAbbreviationName=REQ_MGT_ID`
    ); */
    console.log('api js / getTermDomainInfo === ', termElementData);
    return await termElementData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/* 
  API 명 : 용어 상세조회 (도메인 정보 조회)
*/

const getTermDomainInfo = async (termDomainQuery) => {
  const { termName, termAbbreviationName, dictionaryId, termDictionaryId } =
    termDomainQuery;
  /* const { dictionaryId, termDictionaryId } = termDomainQuery;
  const termName = '결산구분코드';
  const termAbbreviationName = 'STAC_SE_CD'; */
  try {
    let termDomainData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/domain?` +
        `dictionaryId=${dictionaryId}&` +
        `termDictionaryId=${termDictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('api js / getTermDomainInfo === ', termDomainData);
    return await termDomainData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/* 
 API 명 : 용어 상세조회 (유사어 조회)
*/
const getTermSynonymInfo = async (termSynonymQuery) => {
  const { termAbbreviationName, dictionaryId } = termSynonymQuery;

  // 데이터 있는 항목
  /* const termAbbreviationName = 'PRCHS_DCSN_YMD';
  const dictionaryId = 4; */
  try {
    let termSynonymData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/synonym?` +
        `dictionaryId=${dictionaryId}&` +
        `termAbbreviationName=${termAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('api js / termSynonymData === ', termSynonymData);
    return await termSynonymData;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/*
  API 명 : 용어 상세조회 ( 변경이력 조회 )
*/
const getTermHistoryInfo = async (termHistoryQuery) => {
  const { termDictionaryId, termName } = termHistoryQuery;
  // 1, 공시가

  let termHistoryData;
  // 데이터 있는 항목
  /* const termAbbreviationName = 'PRCHS_DCSN_YMD';
const dictionaryId = 4; */
  try {
    termHistoryData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/history?` +
        `termName=${termName}&` +
        `termDictionaryId=${termDictionaryId}`,
      { skipSpinner: true }
    );
    console.log('api js / termHistoryData === ', termHistoryData);
    return await termHistoryData;
  } catch (error) {
    console.error(error);
    console.log('termHistoryData ============', termHistoryData);
    return null;
  }
};

/*
  API 명 : 용어 필터 리서치 
*/
const getResaerchTerm = async (researchQuery) => {
  console.log('researchQuery', researchQuery);
  /*  let query = {
    paging: {
      dictionaryId: 2,
    },
    query: `용어유형 = '일반어'`,
  }; */

  let termResearchResult;
  try {
    termResearchResult = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/term/search`,
      researchQuery
    );
    console.log('api js / getResaerchTerm === ', termResearchResult);
    return await termResearchResult;
  } catch (error) {
    console.log('api js / getResaerchTerm === ', termResearchResult);
    return error;
  }
};

/*
  API 명 : 단어 조회
*/
const getWordSearchData = async (wordQuery) => {
  let wordSearchData;

  const {
    dictionaryId,
    wordTypeName,
    wordAbbreviationName,
    wordName,
    wordDictionaryId,
  } = wordQuery;

  try {
    wordSearchData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/word?` +
        `dictionaryId=${dictionaryId}&` +
        `wordTypeName=${wordTypeName}&` +
        `wordAbbreviationName=${wordAbbreviationName}&` +
        `wordName=${wordName}&` +
        `wordDictionaryId=${wordDictionaryId}`
    );

    console.log('api js / wordSearchData === ', wordSearchData);
    return await wordSearchData;
  } catch (error) {
    console.error(error);
    console.log('wordSearchData ============', wordSearchData);
    return null;
  }
};

// 단어 rowDatabinding
const bindingWordRowData = (getWordSearchResult) => {};

/* 
  API 명 : 단어상세 조회 (기본정보 조회)
*/
const getWordBaseInfo = async (wordBaseQuery) => {
  let wordBaseData;

  const { dictionaryId, wordAbbreviationName, wordName } = wordBaseQuery;

  try {
    wordBaseData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/word/base?` +
        `dictionaryId=${dictionaryId}&` +
        `wordAbbreviationName=${wordAbbreviationName}&` +
        `wordName=${wordName}`,
      { skipSpinner: true }
    );

    console.log('api js / getWordBaseInfo === ', wordBaseData);
    return await wordBaseData;
  } catch (error) {
    console.error(error);
    console.log('getWordBaseInfo ============', wordBaseData);
    return null;
  }
};

/*
  API 명 : 단어상세 조회 ( 유사어 조회 )
*/
const getWordSimilarInfo = async (wordSynonymQuery) => {
  let wordSimilarData;

  const { dictionaryId, wordAbbreviationName } = wordSynonymQuery;

  try {
    wordSimilarData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/word/synonym?` +
        `dictionaryId=${dictionaryId}&` +
        `wordAbbreviationName=${wordAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('api js / getWordSimilarInfo === ', wordSimilarData);
    return await wordSimilarData;
  } catch (error) {
    console.error(error);
    console.log('api js / getWordSimilarInfo === ', wordSimilarData);
    return null;
  }
};

/*
  API 명 : 단어상세 조회 ( 연관용어 조회 )
*/
const getWordRelationTermInfo = async (wordRelationQuery) => {
  let wordRelationData;

  const { dictionaryId, wordAbbreviationName } = wordRelationQuery;
  try {
    wordRelationData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/word/relation-term?` +
        `dictionaryId=${dictionaryId}&` +
        `wordAbbreviationName=${wordAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('api js / getWordRelationTermInfo === ', wordRelationData);
    return await wordRelationData;
  } catch (error) {
    console.error(error);
    console.log('api js / getWordRelationTermInfo === ', wordRelationData);
    return null;
  }
};

/*
  API 명 : 단어상세 조회 ( 변경이력 조회 )
*/
const getWordHistoryInfo = async (wordHistoryQuery) => {
  let wordHistoryData;
  const { wordName, wordDictionaryId, wordAbbreviationName } = wordHistoryQuery;

  /* 
  // 샘플 데이터
  const wordAbbreviationName = 'IDRCO';
  const wordName = '간접비';
  const wordDictionaryId = 2; */

  try {
    wordHistoryData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/word/history?` +
        `wordName=${wordName}&` +
        `wordDictionaryId=${wordDictionaryId}&` +
        `wordAbbreviationName=${wordAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('api js / getWordHistoryInfo === ', wordHistoryData);
    return await wordHistoryData;
  } catch (error) {
    console.error(error);
    console.log('api js / getWordHistoryInfo === ', wordHistoryData);
    return null;
  }
};

/*
  API 명 : 단어 필터 리서치 
*/
const getResaerchWord = async (researchQuery) => {
  console.log('researchQuery', researchQuery);
  /*  let query = {
    paging: {
      dictionaryId: 2,
    },
    query: `용어유형 = '일반어'`,
  }; */

  let wordResearchResult;

  try {
    wordResearchResult = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/word/search`,
      researchQuery
    );
    console.log('api js / wordResearchResult === ', wordResearchResult);
    return await wordResearchResult;
  } catch (error) {
    console.log('api js / wordResearchResult === ', wordResearchResult);
    console.error(error);
    return error;
  }
};

/* 
  API 명 : 도메인 그리드 바인딩 
*/
const bindingDomainGridData = (domainRowData, selectNode) => {
  let domainGridData = [];

  console.log('domainRowData ============', domainRowData.items);
  console.log('selectNode ============', selectNode);

  const domains = domainRowData.items;
  for (let i = 0; i < domains.length; i++) {
    domainGridData.push({
      id: i,
      no: i + 1,
      instituteId: domains[i].instituteId,
      dictionaryId: domains[i].dictionaryId,
      domainName: [
        {
          id: 0,
          type: domains[i].dictionaryTypeName,
          label: domains[i].domainName,
          color: domains[i].dictionaryTypeForegroundColorName,
          bgColor: domains[i].dictionaryTypeBackgroundColorName,
          size: 55,
        },
      ],
      dataPermissionValue: domains[i].dataPermissionValue,
      domainGroupName: domains[i].domainGroupName,
      domainClassName: domains[i].domainClassName,
      codeTypeName: domains[i].codeTypeName,
      discardYn: domains[i].discardYn,
      revisionDate: domains[i].revisionDate,
      updater: domains[i].updater,
      updateDatetime: domains[i].updateDatetime,
      domainId: selectNode.domainId,
      treeDomainDictionaryId: selectNode.dictionaryId,
    });
  }
  return domainGridData;
};

/* API 명 : 도메인 트리 조회  */
const getDomainSearchTreeData = async (dictionaryId) => {
  let domainTreeData;

  try {
    domainTreeData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/tree?` + `dictionaryId=${dictionaryId}`,
      { skipSpinner: true }
    );
    console.log('api js / getDomainSearchTreeData === ', domainTreeData.data);

    return await domainTreeData;
  } catch (error) {
    console.error(error);
    console.log('api js / getDomainSearchTreeData === ', domainTreeData);
    return null;
  }
};

/*
  
*/

/* API 명 : 도메인 트리 생성  */
const getConstructDomainTree = (domainTreeRowData) => {
  console.log('domainTreeRowData ============', domainTreeRowData);
  const domainNode = {};
  for (let domain of domainTreeRowData.data) {
    // 타입이 없을 때.
    let size = 55;
    let type = domain.dictionary.type.name;

    if (domain.dictionary.type.name == null) {
      size = 0;
      type = '';
    }

    const virtualId = domain.virtualId.toString();

    // 트리 루트사전일때
    if (domain.typeCode === '00') {
      domain.domainName = '[도메인사전]';
    }
    domainNode[`${virtualId}`] = {
      text: `${domain.domainName}`,
      id: virtualId,
      children: domain.children.map((childId) => childId.toString()),
      state: { opened: true },
      type: type,
      color: `${domain.dictionary.type.fontColor}`,
      bgColor: `${domain.dictionary.type.backgroundColor}`,
      size: size,
      domainId: domain.domainId,
      dictionaryId: domain.dictionary.id,
      typeCode: domain.typeCode,
    };
  }
  console.log('domainNode : ', domainNode);
  return domainNode;
};

/* API 명 : 도메인 조회 */
const getDomainSearchData = async (domainQuery) => {
  const {
    dictionaryId, // 사전 ID (필수)
    treeDomainDictionaryId, //트리 도메인 사전아이디 (필수)
    domainDictionaryId, // 도메인 사전아이디 (필수)
    domainId, // 도메인 uniqueId (필수)
    domainClassName, // 도메인클래스명
    domainName, // 도메인명
    revisionDate, // 개정일자
  } = domainQuery;

  console.log('domainQuery =============', domainQuery);

  let domainData;
  let encodedDomainName;

  let encodedRevisionDate = encodeURIComponent(revisionDate);
  console.log('revisionDate ===', revisionDate);

  const originalDate = revisionDate;

  // 시분초 제거
  const withoutTime = originalDate.split(' ')[0];
  // "2024-03-20"

  // 하이픈(-) 제거
  const withoutHyphen = withoutTime.replace(/-/g, '');
  console.log('withoutHyphen', withoutHyphen);

  // domainName에 대괄호가 있는지 확인하고, 있으면 퍼센트 인코딩을 수행
  if (domainName.includes('[') && domainName.includes(']')) {
    encodedDomainName = encodeURIComponent(domainName);
  } else {
    encodedDomainName = domainName;
  }

  try {
    domainData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain?` +
        `dictionaryId=${dictionaryId}&` +
        `treeDomainDictionaryId=${treeDomainDictionaryId}&` +
        `domainId=${domainId}&` +
        `domainClassName=${domainClassName}&` +
        `domainName=${encodedDomainName}&` +
        `domainDictionaryId=${domainDictionaryId}&` +
        `revisionDate=${withoutTime}`
    );
    console.log('api js / getDomainSearchData === ', domainData);
    return await domainData;
  } catch (error) {
    console.error(error);
    console.log('api js / getDomainSearchData === ', domainData);
    return null;
  }
};
/* API 명 : 도메인 상세조회 ( 기본정보 조회 )  */
const getDomainBaseInfo = async (domainBaseQuery) => {
  let domainBaseData;

  const { domainDictionaryId, domainName } = domainBaseQuery;
  try {
    domainBaseData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/base?` +
        `domainDictionaryId=${domainDictionaryId}&` +
        `domainName=${domainName}`,
      { skipSpinner: true }
    );

    /* domainBaseData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/base?` +
        `domainDictionaryId=2&` +
        `domainName=수N38`
    ); */
    console.log('api js / getDomainBaseInfo === ', domainBaseData);
    return await domainBaseData;
  } catch (error) {
    console.error(error);
    console.log('getDomainBaseInfo ============', domainBaseData);
    return null;
  }
};

/* API 명 : 도메인 상세조회 ( 연관용어 조회 ) */
const getDomainRelationInfo = async (domainRelationCodeQuery) => {
  let domainRelationCodeData;

  const { dictionaryId, domainName } = domainRelationCodeQuery;

  try {
    domainRelationCodeData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/relation-term?` +
        `dictionaryId=${dictionaryId}&` +
        `domainName=${domainName}`,
      { skipSpinner: true }
    );

    /*  domainRelationCodeData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/relation-term?` +
        `dictionaryId=2&` +
        `domainName=수N38`
    ); */

    console.log('api js / getDomainRelationInfo === ', domainRelationCodeData);
    return await domainRelationCodeData;
  } catch (error) {
    console.error(error);
    console.log('getDomainRelationInfo ============', domainRelationCodeData);
    return null;
  }
};

/* API 명 : 도메인 상세조회 ( 변경이력 조회 ) */
const getDoaminHistoryInfo = async (domainHistoryQuery) => {
  let doaminHistoryData;

  const { domainDictionaryId, domainName } = domainHistoryQuery;

  try {
    doaminHistoryData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/history?` +
        `domainDictionaryId=${domainDictionaryId}&` +
        `domainName=${domainName}`,
      { skipSpinner: true }
    );

    /* doaminHistoryData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/history?` +
        `domainDictionaryId=2&` +
        `domainName=수N38`
    ); */

    console.log('api js / getDoaminHistoryInfo === ', doaminHistoryData);
    return await doaminHistoryData;
  } catch (error) {
    console.error(error);
    console.log('getDoaminHistoryInfo ============', doaminHistoryData);
    return null;
  }
};

/*
   API 명 : 도메인 필터 리서치
 */

const getResaerchDomain = async (researchQuery) => {
  console.log('researchQuery', researchQuery);
  /*  let query = {
      paging: {
        dictionaryId: 2,
      },
      query: `용어유형 = '일반어'`,
    }; */

  // if (researchQuery.paging.revisionDate != null) {
  //   const originalDate = researchQuery.paging.revisionDate;

  //   // 시분초 제거
  //   const withoutTime = originalDate.split(' ')[0];
  //   console.log('withoutTime', withoutTime);

  //   // 하이픈(-) 제거
  //   /*   const withoutHyphen = withoutTime.replace(/-/g, '');
  //   console.log('withoutHyphen', withoutHyphen); */

  //   researchQuery.paging.revisionDate = withoutTime;
  // }

  console.log('researchQuery', researchQuery);

  let domainResearchResult;

  try {
    domainResearchResult = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/domain/search`,
      researchQuery
    );
    console.log('api js / getResaerchDomain === ', domainResearchResult);
    return await domainResearchResult;
  } catch (error) {
    console.log('api js / getResaerchDomain === ', domainResearchResult);
    console.error(error);
    return error;
  }
};

/* API 명 : 통합코드명 조회 */
const getUnityCodeNameList = async (dictionaryId) => {
  let unityCodeList;

  try {
    unityCodeList = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/name?dictionaryId=${dictionaryId}`
    );
    console.log('getUnityCodeNameList ============', unityCodeList);
    return await unityCodeList;
  } catch (error) {
    console.log('getUnityCodeNameList ============', unityCodeList);
    console.error(error);
  }
};

/* API 명 : 통합코드값 조회 */
const getUnityCodeVauleList = async (unityCodeValueQuery) => {
  let unityCodeValueList;

  const { unityCodeDictionaryId, unityCodeName } = unityCodeValueQuery;

  try {
    unityCodeValueList = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/value?` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}`,
      { skipSpinner: true }
    );
    console.log('getUnityCodeVauleList ============', unityCodeValueList);
    return await unityCodeValueList;
  } catch (error) {
    console.log('getUnityCodeVauleList ============', unityCodeValueList);
    console.error(error);
  }
};

/* API 명 : 코드 상세조회 ( 기본정보 조회 )*/
const getCodeBaseInfo = async (unityCodeBaseQuery) => {
  let codeBaseInfoData;

  const { unityCodeDictionaryId, unityCodeName } = unityCodeBaseQuery;

  try {
    codeBaseInfoData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/base?` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}`,
      { skipSpinner: true }
    );

    return await codeBaseInfoData;
  } catch (error) {
    console.error(error);
  }
};
/* API 명 : 코드 상세조회 ( 연관용어 조회 ) */
const getCodeRelationTermInfo = async (unityRelationTermQuery) => {
  let codeRelationInfoData;

  const { dictionaryId, unityCodeName } = unityRelationTermQuery;

  try {
    codeRelationInfoData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/relation-term?` +
        `dictionaryId=${dictionaryId}&` +
        `unityCodeName=${unityCodeName}`,
      { skipSpinner: true }
    );
    console.log('getCodeRelationTermInfo ============', codeRelationInfoData);
    return await codeRelationInfoData;
  } catch (error) {
    console.log('getCodeRelationTermInfo ============', codeRelationInfoData);
    console.error(error);
  }
};
/* API 명 : 코드 상세조회 ( 계층 코드값 조회 ) */
const getHierarchyCodeValueInfo = async (structuredCodeValueQuery) => {
  let hierarchyCodeInfoData;

  const { unityCodeDictionaryId, unityCodeName, unityCodeValue } =
    structuredCodeValueQuery;

  try {
    hierarchyCodeInfoData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/structured-code-value?` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}&` +
        `unityCodeValue=${unityCodeValue}`,
      { skipSpinner: true }
    );
    console.log(
      'getHierarchyCodeValueInfo ============',
      hierarchyCodeInfoData
    );
    return await hierarchyCodeInfoData;
  } catch (error) {
    console.log(
      'getHierarchyCodeValueInfo ============',
      hierarchyCodeInfoData
    );
    console.error(error);
  }
};
/* API 명 : 코드 상세조회 ( 참조 코드명 조회 ) */
const getReferenceCodeNameInfo = async (referenceCodeQuery) => {
  let referenceCodeNameData;

  const { dictionaryId, referenceCodeName } = referenceCodeQuery;
  try {
    referenceCodeNameData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/reference-code-name?` +
        `dictionaryId=${dictionaryId}&` +
        `referenceCodeName=${referenceCodeName}`,
      { skipSpinner: true }
    );
    console.log('getReferenceCodeNameInfo ============', referenceCodeNameData);
    return await referenceCodeNameData;
  } catch (error) {
    console.log('getReferenceCodeNameInfo ============', referenceCodeNameData);
    console.error(error);
  }
};
/* API 명 : 코드 상세조회 ( 참조 코드값 조회 ) */
const getReferenceCodeValueInfo = async (referenceCodeQuery) => {
  let referenceCodeValueData;

  const { dictionaryId, referenceCodeName } = referenceCodeQuery;
  try {
    referenceCodeValueData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/reference-code-value?` +
        `dictionaryId=${dictionaryId}&` +
        `referenceCodeName=${referenceCodeName}`,
      { skipSpinner: true }
    );
    console.log(
      'getReferenceCodeValueInfo ============',
      referenceCodeValueData
    );
    return await referenceCodeValueData;
  } catch (error) {
    console.log(
      'getReferenceCodeValueInfo ============',
      referenceCodeValueData
    );
    console.error(error);
  }
};
/* API 명 : 코드 상세조회 ( 코드명 변경이력 조회 ) */
const getCodeNameHistoryInfo = async (historyQuery) => {
  let codeNameHistoryData;

  const { unityCodeDictionaryId, unityCodeName, unityCodeValue } = historyQuery;

  try {
    codeNameHistoryData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/history?` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}`,
      { skipSpinner: true }
    );
    console.log('getCodeNameHistoryInfo ============', codeNameHistoryData);
    return await codeNameHistoryData;
  } catch (error) {
    console.error(error);
    console.log('getCodeNameHistoryInfo ============', codeNameHistoryData);
  }
};
/* API 명 : 코드 상세조회 ( 코드값 변경이력 조회 ) */
const getCodeValueHistoryInfo = async (valueHistoryQuery) => {
  let codeValueHistoryData;

  const { unityCodeDictionaryId, unityCodeName, unityCodeValue } =
    valueHistoryQuery;

  try {
    codeValueHistoryData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/value-history?` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}&` +
        `unityCodeValue=${unityCodeValue}`,
      { skipSpinner: true }
    );
    console.log('getCodeValueHistoryInfo ============', codeValueHistoryData);
    return await codeValueHistoryData;
  } catch (error) {
    console.error(error);
    console.log('getCodeValueHistoryInfo ============', codeValueHistoryData);
  }
};

/* 
API 명 : 코드 필터 리서치 
*/
const getResaerchCode = async (researchQuery) => {
  console.log('researchQuery', researchQuery);
  /*  let query = {
    paging: {
      dictionaryId: ,
    },
    query: `통합코드명 = 'RAEX_RSN_CD'`,
  }; */

  let codeResearchResult;

  try {
    codeResearchResult = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/code/name/search`,
      researchQuery
    );
    console.log('api js / termHistoryData === ', codeResearchResult);
    return await codeResearchResult;
  } catch (error) {
    console.log('api js / termHistoryData === ', codeResearchResult);
    console.error(error);
    return error;
  }
};

export {
  getGridHeaderList,
  getGridRowDataList,
  getTermBaseInfo,
  getTermStructureWord, // 용어 상세조회 (구성단어 조회)
  getTermRelationCode, // 용어 상세조회 (연관통합코드 조회)
  getTermRelationCodeValue, // 용어 상세조회 (연관통합코드값 조회)
  getRelationAttribute, // 용어 상세조회 (연관속성 조회)
  getTermDomainInfo, // 용어 상세조회 (도메인 정보 조회)
  getTermSynonymInfo, // 용어 상세조회 (유사어 조회)
  getTermHistoryInfo, // 용어 상세조회 (변경이력 조회)
  getResaerchTerm, // 용어 필터 리서치
  getWordSearchData, // 단어 조회
  getWordBaseInfo, // 단어 상세조회 (기본정보 조회)
  getWordSimilarInfo, // 단어 상세조회 (유사어 조회)
  getWordRelationTermInfo, // 단어 상세조회 (연관용어 조회)
  getWordHistoryInfo, // 단어상세 조회 ( 변경이력 조회 )
  getResaerchWord, // 단어 필터 리서치
  bindingDomainGridData, // 도메인 그리드 바인딩
  getDomainSearchTreeData, // 도메인 트리 조회
  getConstructDomainTree, // 도메인 트리 생성
  getDomainSearchData, // 도메인 조회
  getDomainBaseInfo, // 도메인 상세조회 ( 기본정보 조회 )
  getDomainRelationInfo, // 도메인 상세조회 ( 연관용어 조회 )
  getDoaminHistoryInfo, // 도메인 상세조회 ( 변경이력 조회 )
  getResaerchDomain, // 도메인 필터 리서치
  getUnityCodeNameList, // 통합코드명 조회
  getUnityCodeVauleList, // 통합코드값 조회
  getCodeBaseInfo, // 코드 상세조회 ( 기본정보 조회 )
  getCodeRelationTermInfo, // 코드 상세조회 ( 연관용어 조회 )
  getHierarchyCodeValueInfo, // 코드 상세조회 ( 계층 코드값 조회 )
  getReferenceCodeNameInfo, // 코드 상세조회 ( 참조 코드명 조회 )
  getReferenceCodeValueInfo, // 코드 상세조회 ( 참조 코드값 조회 )
  getCodeNameHistoryInfo, // 코드 상세조회 ( 코드명 변경이력 조회 )
  getCodeValueHistoryInfo, // 코드 상세조회 ( 코드값 변경이력 조회 )
  getResaerchCode, // 코드 필터 리서치
};
