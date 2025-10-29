import { $vxHttp } from '@/api';

const apiUrl = import.meta.env.VITE_APP_API_URL;
const defaultUrl = '/api/v1';

/*
  API 명 :용어 작업 조회
*/

const getTermJobList = async (termJobQuery) => {
  console.log('getTermJobList - 용어 작업 조회 실행 ');
  console.log('termJobQuery - termJobQuery : ', termJobQuery);
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/term?managementInstituteId=${termJobQuery.instituteId}`
    );
    console.log('getTermJobList response : ', response);

    return response;
  } catch (error) {
    console.error('getTermJobList error : ', error);
  }
};

/*
  API 명 :용어 작업 취소 
 */
const getCancelTermJob = async (termJobCancelQuery) => {
  console.log('termJobCancelQuery : ', termJobCancelQuery);
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/cancel`,
      termJobCancelQuery
    );
    console.log('getCancelTermJob response:', response);
    return response;
  } catch (error) {
    console.error('getCancelTermJob error:', error);
  }
};

/*
   API 명 : 용어 작업 완료
 */
const getCompleteTermJob = async (termJobCompleteQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/apply`,
      termJobCompleteQuery
    );
    console.log('getCompleteTermJob response:', response);
    return response;
  } catch (error) {
    console.error('getCompleteTermJob error:', error);
    return error;
  }
};

/*
  API 명 : 용어 관리 - 작업 상세
*/
const getTermJobDetail = async (termJobDetailQuery) => {
  console.log('getTermJobDetail - 용어 관리/작업 상세 조회 실행 ');
  console.log('termJobDetailQuery - termJobDetailQuery : ', termJobDetailQuery);
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/term/details?` +
        `managementInstituteId=${termJobDetailQuery.managementInstituteId}&` +
        `userId=${termJobDetailQuery.userId}&` +
        `termDictionaryId=${termJobDetailQuery.termDictionaryId}&` +
        `jobTermId=${termJobDetailQuery.jobTermId}`,
      { skipSpinner: true }
    );
    console.log('getTermJobDetail response : ', response);

    return response;
  } catch (error) {
    console.error('getTermJobDetail error : ', error);
  }
};

/*
API 명 : 용어 관리 - 상세정보
 */
const getTermDetailInfo = async (termDetailsQuery) => {
  console.log('getTermDetailInfo - 용어 관리/상세정보 조회 실행 ');
  console.log('getTermDetailInfo termDetailsQuery : ', termDetailsQuery);

  const { termDictionaryId, termName, termAbbreviationName } = termDetailsQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/details?` +
        `termDictionaryId=${termDictionaryId}&` +
        `termName=${termName}&` +
        `termAbbreviationName=${termAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('getTermDetailInfo response : ', response);

    return response;
  } catch (error) {
    console.error('getTermDetailInfo error : ', error);
  }
};

/*
  API 명 : 용어등록 자동분할
*/
const getTermDivide = async (termDivideQuery) => {
  console.log('getTermDivide - 용어 관리/자동분할 실행 ');
  console.log('termDivideQuery - termDivideQuery ');
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/term/divide`,
      termDivideQuery
    );
    console.log('getTermDivide response : ', response);

    return await response;
  } catch (error) {
    console.error('getTermDivide error : ', error);
    return error;
  }
};

/* 
  API 명 : 용어 분할 목록
*/
const getTermDivideList = async (termDivideListQuery) => {
  console.log('getTermDivideList - 용어 관리/자동분할 실행 ');
  console.log('termDivideListQuery - termDivideListQuery ');

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/term/divide?` +
        `termDictionaryId=${termDivideListQuery.dictionaryId}&` +
        `managementInstituteId=${termDivideListQuery.managementInstituteId}&`
    );
    console.log('getTermDivideList response : ', response);

    return await response;
  } catch (error) {
    console.error('getTermDivideList error : ', error);
  }
};

/*
  API 명 : 용어 선택 분할 목록
*/
const getTermDivideSelectList = async (selectedData, dictionaryId) => {
  console.log('getTermDivideSelectList - 용어 관리/자동분할 실행 ');
  console.log('termDivideSelectListQuery - termDivideSelectListQuery ');

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/divide?dictionaryId=${dictionaryId}`,
      selectedData
    );
    console.log('getTermDivideSelectList response : ', response);

    return await response;
  } catch (error) {
    console.error('getTermDivideSelectList error : ', error);
  }
};

/*
  API 명 : 용어 일괄 등록
 */
const getTermUploadFile = async (formData) => {
  console.log('getTermUploadFile - 용어 일괄 등록 실행 ');
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('getTermUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getTermUploadFile error : ', error);
  }
};

/*
  API 명 : 용어 작업 상세 vol.1
*/
// const getJobTermDetail = async (jobTermDetailsQuery) => {
//   console.log('getJobTermDetail - 용어 작업 상세 조회 실행 ');
//   console.log('jobTermDetailsQuery : ', jobTermDetailsQuery);
//   try {
//     const response = await $vxHttp.post(
//       `${apiUrl}${defaultUrl}/job/term/details`,
//       jobTermDetailsQuery
//     );
//     console.log('jobTermDetail response : ', response);

//     return response;
//   } catch (error) {
//     console.error('jobTermDetail error : ', error);
//   }
// };

/*
  API 명 : 용어 작업 상세 vol.2
*/
const getJobTermDetail = async (jobTermDetailsQuery) => {
  const { termDictionaryId, managementInstituteId, userId, jobTermId } =
    jobTermDetailsQuery;
  console.log('getJobTermDetail - 용어 작업 상세 조회 실행 ');
  console.log('jobTermDetailsQuery : ', jobTermDetailsQuery);
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/term/details?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `termDictionaryId=${termDictionaryId}&` +
        `jobTermId=${jobTermId}`,
      { skipSpinner: true }
    );
    console.log('jobTermDetail response : ', response);

    return response;
  } catch (error) {
    console.error('jobTermDetail error : ', error);
  }
};

/*
  API 명 : 용어 작업 수정
*/
const getUpdateJobTerm = async (jobTermUpdateQuery) => {
  console.log('getUpdateJobTerm - 용어 작업 수정 실행 ');
  console.log('jobTermUpdateQuery : ', jobTermUpdateQuery);
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/term/details`,
      jobTermUpdateQuery
    );
    console.log('getUpdateJobTerm response : ', response);

    return response;
  } catch (error) {
    console.error('getUpdateJobTerm error : ', error);
  }
};

/* 
  API 명 : 용어 작업 목록 필터 검색
*/
const getResaerchTermJob = async (termJobQuery) => {
  console.log('getResaerchTermJob - 용어 작업 조회 실행 ');
  console.log('termJobQuery : ', termJobQuery);
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/search`,
      termJobQuery
    );
    console.log('getResaerchTermJob response : ', response);

    return response;
  } catch (error) {
    console.error('getResaerchTermJob error : ', error);
    return error;
  }
};

/*
  모듈 명 : 작업 조회 결과 그리드 데이터 생성 
*/
const jobTermSearchResultBinding = (termJobSearchResult) => {
  console.log('jobTermSearchResult - 조회된 데이터 : ', termJobSearchResult);

  const termJobs = termJobSearchResult.items;
  const termJobData = [];

  // 조회된 데이터의 구분에 맞는 신청구분 표시
  for (let i = 0; termJobs.length > i; i++) {
    let category;

    if (termJobs[i].jobDivisionName === '신규등록') {
      category = '신규';
    } else if (termJobs[i].jobDivisionName === '변경등록') {
      category = '변경';
    } else if (termJobs[i].jobDivisionName === '폐기등록') {
      category = '폐기';
    } else if (termJobs[i].jobDivisionName === '복구등록') {
      category = '복구';
    } else if (termJobs[i].jobDivisionName === '삭제등록') {
      category = '삭제';
    } else {
      category = termJobs[i].jobDivisionName;
    }

    termJobData.push({
      rowId: i,
      id: termJobs[i].jobTermId,
      no: i + 1,
      jobTermId: termJobs[i].jobTermId,
      managementInstituteId: termJobs[i].instituteId,
      dictionaryId: termJobs[i].dictionaryId,
      applicationCategory: category,
      termName: termJobs[i].termName,
      termEngAbbreviationName: termJobs[i].termAbbreviationName,
      domainName: termJobs[i].domainName,
      abbreviationYn: termJobs[i].abbreviationYn ? '완료' : '미완료',
      termErrorName: termJobs[i].termNameErrorName,
      termErrorYn: termJobs[i].termNameErrorYn,
      termNameErrorName: termJobs[i].termNameErrorName,
      termNameErrorYn: termJobs[i].termNameErrorYn,
      termStandardYnName: termJobs[i].termStandardYnName,
      updateDateTime: termJobs[i].updateDateTime,
      updater: termJobs[i].updater,
      userId: termJobs[i].userId,
    });
  }

  console.log('termJobData : ', termJobData);
  return termJobData;
};

/*
API 명 : 용어등록 신규등록
*/
const createNewTerm = async (termDetailsQuery) => {
  console.log('createNewTerm - 용어 관리/신규 실행 ');

  console.log('termDetailsQuery : ', termDetailsQuery);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/new`,
      termDetailsQuery
    );
    console.log('createNewTerm response : ', response);

    return await response;
  } catch (error) {
    console.error('createNewTerm error : ', error);
    return error;
  }
};

/* 
  API 명 : 용어등록 변경등록
*/
const modifyTerm = async (termDetailsQuery) => {
  console.log('modifyTerm - 용어 관리/변경 실행 ');

  console.log('termDetailsQuery : ', termDetailsQuery);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/modify`,
      termDetailsQuery
    );
    console.log('modifyTerm response : ', response);

    return await response;
  } catch (error) {
    console.error('modifyTerm error : ', error);
    return error;
  }
};

/*
 API 명 : 용어등록 삭제등록
 */
const deleteTerm = async (termDetailsQuery) => {
  console.log('deleteTerm - 용어 관리/삭제 실행 ');

  console.log('termDetailsQuery : ', termDetailsQuery);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/term/delete`,
      termDetailsQuery
    );
    console.log('deleteTerm response : ', response);

    return await response;
  } catch (error) {
    console.error('deleteTerm error : ', error);
    return error;
  }
};

/*
  용어등록 데이터 바인딩
*/
const termManagementDataBinding = (termDetailsData) => {
  console.log(
    'termDetailsData.value : ',
    JSON.parse(JSON.stringify(termDetailsData))
  );

  // 용어 타입 코드
  let termTypeCode = '';

  if (
    termDetailsData.termType === '일반어' ||
    termDetailsData.termType === 'GENERAL'
  ) {
    termTypeCode = 'GENERAL';
  } else if (
    termDetailsData.termType === '이음동의어' ||
    termDetailsData.termType === 'SYNONYM'
  ) {
    termTypeCode = 'SYNONYM';
  }

  let codeTypeCode = '';
  let individualCodeName = '';
  let unityCodeName = '';

  if (
    termDetailsData.codeTypeName === '개별코드' ||
    termDetailsData.codeTypeName === 'INDIVIDUAL_CODE'
  ) {
    codeTypeCode = 'INDIVIDUAL_CODE';
    individualCodeName = termDetailsData.codeName;
  } else if (
    termDetailsData.codeTypeName === '통합코드' ||
    termDetailsData.codeTypeName === 'UNITY_CODE'
  ) {
    codeTypeCode = 'UNITY_CODE';
    unityCodeName = termDetailsData.codeName;
  } else {
    codeTypeCode = null;
  }
  // request 형시에 맞게 변환
  let standardReasonContents = '';

  if (termDetailsData.standardDivision === 'N') {
    if (termDetailsData.selectNonStandardReason === '10') {
      standardReasonContents = '솔루션 용어';
    } else if (termDetailsData.selectNonStandardReason === '20') {
      standardReasonContents = '분류어 오류';
    } else if (termDetailsData.selectNonStandardReason === '30') {
      standardReasonContents = '상이한 도메인';
    } else if (termDetailsData.selectNonStandardReason.includes('90')) {
      standardReasonContents = termDetailsData.nonStandardReasonContents;
    }
  } else {
    termDetailsData.selectNonStandardReason = null;
    standardReasonContents = null;
  }

  const termQuery = {
    instituteId: termDetailsData.managementInstituteId,
    dictionaryId: termDetailsData.termDictionaryId,
    jobTypeCode: 'STD',
    jobDivisionCode: termDetailsData.jobDivisionCode,
    jobDivisionName: termDetailsData.jobDivisionName,
    termName: termDetailsData.termName,
    termAbbreviationName: termDetailsData.termAbbreviationName,
    logicalDataTypeName: termDetailsData.logicalDataTypeName,
    termStandardYn: termDetailsData.standardDivision === 'Y' ? true : false,
    termTypeCode: termTypeCode,
    termExplain: termDetailsData.termExplain,
    domainClassName: termDetailsData.domainClassName,
    domainName: termDetailsData.domainName,
    codeTypeCode: codeTypeCode,
    individualCodeName: individualCodeName,
    unityCodeName: unityCodeName,
    nonStandardReasonCode: termDetailsData.selectNonStandardReason,
    nonStandardReasonContents: standardReasonContents,
    departmentName: termDetailsData.managementDepartmentName,
    taskFieldName: termDetailsData.taskFieldName,
    revisionDate: termDetailsData.revisionDate,
  };

  // const realTermQurey = {
  //   managementInstituteId: termDetailsData.managementInstituteId,
  //   termDictionaryId: termDetailsData.termDictionaryId,
  //   termName: termDetailsData.termName.label,
  //   termAbbreviationName: termDetailsData.termAbbreviationName,
  //   termEnglishName: termDetailsData.termEnglishName,

  //   termTypeCode:
  //     termTypeCode !== '' ? termTypeCode : termDetailsData.termTypeCode,

  //   termExplain: termDetailsData.termExplain,

  //   domainClassDictionaryId: termDetailsData.domainClassInfo.dictionaryId,
  //   domainClassName: termDetailsData.domainClassInfo.domainClassName,

  //   domainDictionaryId: termDetailsData.domainName[0].dictionaryId,
  //   domainName: termDetailsData.domainName[0].label,
  //   // logicalDataTypeCode: 'VARCHAR',
  //   // dataLength: termDetailsData.dataLength,
  //   // dataDecimalPointLength: termDetailsData.dataDecimalPointLength,
  //   codeTypeCode:
  //     codeTypeCode != '' ? codeTypeCode : termDetailsData.codeTypeName,
  //   individualCodeName: termDetailsData.individualCodeName,
  //   unityCodeDictionaryId: termDetailsData.unityCodeName[0]
  //     ? termDetailsData.unityCodeName[0].dictionaryId
  //     : termDetailsData.unityCodeName.dictionaryId,

  //   unityCodeName: termDetailsData.unityCodeName[0]
  //     ? termDetailsData.unityCodeName[0].name
  //     : termDetailsData.unityCodeName,
  //   dataUnitName: termDetailsData.dataUnitName,
  //   dataPermissionValue: termDetailsData.dataPermissionValue,
  //   storageFormatContext: termDetailsData.storageFormatContext,
  //   expressionFormatContext: termDetailsData.expressionFormatContext,
  //   managementDepartmentName: termDetailsData.managementDepartmentName,
  //   taskFieldName: termDetailsData.taskFieldName,
  //   enactContext: termDetailsData.enactContext,
  //   enactCycle: null,
  //   enactDate: null,
  //   revisionCycle: termDetailsData.revisionCycle,
  //   revisionDate: termDetailsData.revisionDate,
  // };

  //console.log('realTermQurey ========== : ', realTermQurey);

  return termQuery;
};
/*
  API 명 : 도메인 클래스 목록 조회
*/
const getDomainClassList = async (dictionaryId) => {
  console.log('getDomainClassList - 도메인 클래스 목록 조회 실행 ');
  try {
    const domainClassList = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/class?dictionaryId=${dictionaryId}`
    );
    console.log('domainClassList - 도메인 클래스 리스트 : ', domainClassList);
    return await domainClassList;
  } catch (error) {
    console.error('getDomainClassList error : ', error);
  }
};

/* 
API 명 : 도메인 검색
*/
const getDomainSimpleList = async (domainSimpleParam) => {
  console.log('getDomainSimpleList - 도메인 검색 실행 ');
  const { dictionaryId, domainClassDictionaryId, domainClassName } =
    domainSimpleParam;
  try {
    const domainSimpleList = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/simple?` +
        `dictionaryId=${dictionaryId}&` +
        `domainClassDictionaryId=${domainClassDictionaryId}&` +
        `domainClassName=${domainClassName}`
    );
    console.log('domainSimpleList - 도메인 심플 리스트 : ', domainSimpleList);
    return await domainSimpleList;
  } catch (error) {
    console.error('getDomainSimpleList error : ', error);
  }
};

/* 
API 명 : 통합코드명 검색
*/
const getUnityCodeSimpleList = async (termCodeQuery) => {
  console.log('getUnityCodeSimpleList - 통합코드명 검색 실행 ');
  try {
    const unityCodeSimpleList = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/simple?dictionaryId=${termCodeQuery.dictionaryId}`
    );
    console.log('api unityCodeSimpleList : ', unityCodeSimpleList);
    return await unityCodeSimpleList;
  } catch (error) {
    console.error('getUnityCodeSimpleList error : ', error);
  }
};

/*
  API 명 : 용어등록 - 연관컬럼 유무 조회
*/
const getRelationColumnYn = async (termRelationQuery) => {
  const termAbbreviationName = termRelationQuery.termAbbreviationName;
  const dictionaryId = termRelationQuery.dictionaryId;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/relation-column/exists?` +
        `dictionaryId=${dictionaryId}&` +
        `termAbbreviationName=${termAbbreviationName}`,
      { skipSpinner: true }
    );
    console.log('getRelationColumnYn response : ', response);

    return response;
  } catch (error) {
    console.error('getRelationColumnYn error : ', error);
  }
};

/*
  API 명 : 용어등록 - 연관컬럼 목록 조회
*/
const getRelationColumnList = async (termRelationQuery) => {
  const dictionaryId = termRelationQuery.dictionaryId;
  const termAbbreviationName = termRelationQuery.termAbbreviationName;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/relation-column?` +
        `dictionaryId=${dictionaryId}&` +
        `termAbbreviationName=${termAbbreviationName}`
    );
    console.log('getRelationColumnList response : ', response);

    return response;
  } catch (error) {
    console.error('getRelationColumnList error : ', error);
  }
};

/* 단어등록 ======================================================================= */

/*
 API 명 : 단어등록 - 단어 상세정보 조회
 */
const getWordDetailInfo = async (wordDetailsQuery) => {
  console.log('getWordDetailInfo - 단어 관리/상세정보 조회 실행 ');
  console.log('wordDetailsQuery - wordDetailsQuery : ', wordDetailsQuery);

  const { wordDictionaryId, wordName, wordAbbreviationName } = wordDetailsQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/word/details?` +
        `wordDictionaryId=${wordDictionaryId}&` +
        `wordName=${wordName}&` +
        `wordAbbreviationName=${wordAbbreviationName}&`,
      { skipSpinner: true }
    );
    console.log('getWordDetailInfo response : ', response);

    return response;
  } catch (error) {
    console.error('getWordDetailInfo error : ', error);
  }
};

/*
  API 명 : 단어등록 - 단어 작업 목록 필터
*/
const getResaerchWordJob = async (wordJobQuery) => {
  console.log('getResaerchWordJob - 단어 작업 조회 실행 ');
  console.log('wordJobQuery : ', wordJobQuery);
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/search`,
      wordJobQuery
    );
    console.log('getResaerchWordJob response : ', response);

    return response;
  } catch (error) {
    console.error('getResaerchWordJob error : ', error);
    return error;
  }
};

/*
  API 명 : 단어등록 - 신규등록
*/
const createNewWord = async (wordDetailsQuery) => {
  console.log('createNewWord - 단어 관리/신규 실행 ');

  console.log('wordDetailsQuery : ', wordDetailsQuery);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/new`,
      wordDetailsQuery
    );
    console.log('createNewWord response : ', response);

    return await response;
  } catch (error) {
    console.error('createNewWord error : ', error);
    return error;
  }
};
/*
  API 명 : 단어등록 - 변경등록
*/
const modifyWord = async (wordDetailsQuery) => {
  console.log('modifyWord - 단어 관리/변경 실행 ');

  console.log('wordDetailsQuery : ', wordDetailsQuery);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/modify`,
      wordDetailsQuery
    );
    console.log('modifyWord response : ', response);

    return await response;
  } catch (error) {
    console.error('modifyWord error : ', error);
    return error;
  }
};
/*
  API 명 : 단어등록 - 삭제등록
*/
const removeWord = async (wordDetailsQuery) => {
  console.log('deleteWord - 단어 관리/삭제 실행 ');

  console.log('wordDetailsQuery : ', wordDetailsQuery);

  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/delete`,
      wordDetailsQuery
    );
    console.log('deleteWord response : ', response);

    return await response;
  } catch (error) {
    console.error('deleteWord error : ', error);
    return error;
  }
};

/*
  단어 등록 데이터 바인딩
*/
const wordManagementDataBinding = (wordDetailsData) => {
  console.log('wordDetailsData.value : ', wordDetailsData);

  const wordDetailsQuery = {
    jobWordId: wordDetailsData.jobWordId,
    managementInstituteId: wordDetailsData.managementInstituteId,
    wordDictionaryId: wordDetailsData.wordDictionaryId,
    wordName: wordDetailsData.wordName,
    wordAbbreviationName: wordDetailsData.abbreviationName,
    wordEnglishName: wordDetailsData.englishName,
    wordTypeCode: wordDetailsData.typeName,
    wordExplain: wordDetailsData.explain,
    domainClassDictionaryId:
      wordDetailsData.domainClassName[0].id === 0
        ? 1
        : wordDetailsData.domainClassName[0].id,

    domainClassName: wordDetailsData.domainClassName[0].label,
    wordSimilarYn: wordDetailsData.similarYn,
    wordSimilarDivisionCode:
      wordDetailsData.similarDivisionCode == ''
        ? null
        : wordDetailsData.similarDivisionCode,
    enactContext: wordDetailsData.enactContext,
    enactCycle: null,
    enactDate: null,
    revisionCycle: wordDetailsData.revisionCycle,
    revisionDate: wordDetailsData.revisionDate,
  };

  const testData = {
    managementInstituteId: 2,
    wordDictionaryId: 3,
    wordName: '용',
    wordAbbreviationName: 'DRAGON',
    wordEnglishName: '',
    wordTypeCode: 'GENERAL',
    wordExplain: '개별 공시 지가',
    domainClassDictionaryId: 2,
    domainClassName: '값',
    wordSimilarYn: true,
    wordSimilarDivisionCode: 'SYNONYMS',
    enactContext: '수정',
    enactCycle: '1차',
    enactDate: '2024-06-11',
    revisionCycle: '2차',
    revisionDate: '2024-06-11',
  };

  return wordDetailsQuery;
};

/*
  API 명 : 작업취소
*/
const getCancelWordJob = async (wordJobCancelQuery) => {
  console.log('wordJobCancelQuery : ', wordJobCancelQuery);
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/cancel`,
      wordJobCancelQuery
    );
    console.log('getCancelWordJob response:', response);
    return response;
  } catch (error) {
    console.error('getCancelWordJob error:', error);
  }
};

/*
  API 명 : 작업완료
*/
const getCompleteWordJob = async (wordJobCompleteQuery) => {
  console.log('wordJobCompleteQuery : ', wordJobCompleteQuery);
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/apply`,
      wordJobCompleteQuery
    );
    console.log('getCompleteWordJob response:', response);
    return response;
  } catch (error) {
    console.error('getCompleteWordJob error:', error);
  }
};

/*
  API 명 : 도메인 그룹 목록
*/
const getDomainGroupList = async (dictionaryId) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/group?dictionaryId=${dictionaryId}`
    );
    console.log('getDomainGroupList response : ', response);

    return response;
  } catch (error) {
    console.error('getDomainGroupList error : ', error);
  }
};

/*
  API 명 : 도메인 분류 목록 by domainGroup
 */
const getDomainClassByGroup = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/class-group?` +
        `dictionaryId=${domainGroupQuery.dictionaryId}&` +
        `domainGroupName=${domainGroupQuery.domainGroupName}`
    );
    console.log('getDomainClassByGroup response : ', response);

    return response;
  } catch (error) {
    console.error('getDomainClassByGroup error : ', error);
  }
};

/*
  API 명 : 단어 엑셀 일괄 업로드 
*/
const getWordUploadFile = async (formData) => {
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/word/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('getTermUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getTermUploadFile error : ', error);
  }
};

/*
  API명 연관용어 목록 조회
*/
const getRelationWordList = async (wordRelationQuery) => {
  const dictionaryId = wordRelationQuery.dictionaryId;
  const wordAbbreviationName = wordRelationQuery.wordAbbreviationName;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/word/relation-term?` +
        `dictionaryId=${dictionaryId}&` +
        `wordAbbreviationName=${wordAbbreviationName}`
    );
    console.log('getRelationWordList response : ', response);

    return response;
  } catch (error) {
    console.error('getRelationWordList error : ', error);
  }
};

/*
  API 명 : 단어 관리 - 단어 상세정보 조회
*/
const getJobWordDetailInfo = async (wordDetailsQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/word/details?` +
        `managementInstituteId=${wordDetailsQuery.managementInstituteId}&` +
        `userId=${wordDetailsQuery.userId}&` +
        `wordDictionaryId=${wordDetailsQuery.wordDictionaryId}&` +
        `jobWordId=${wordDetailsQuery.jobWordId}`,
      { skipSpinner: true }
    );
    return await response;
  } catch (error) {
    console.error('getJobWordDetailInfo error : ', error);
  }
};

/*
  API 명 : 단어 관리 - 단어 작업 상세정보 수정
*/
const getUpdateJobWord = async (jobTermUpdateQuery) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/word/details`,
      jobTermUpdateQuery
    );
    return response;
  } catch (error) {
    console.error('getUpdateJobWord error : ', error);
    return error;
  }
};

// // 작업단어 데이터바인딩
// const bindJobWordDetails = (wordJobawait) => {
//   const data = wordJobawait;

//   console.log('bindJobWordDetails - data', data);

//   const wordDetailsQuery = {
//     managementInstituteId: data.managementInstituteId,
//     userId: data.userId,
//     wordDictionaryId: data.word.dictionary.id,
//     jobWordId: data.jobWordId,
//     wordName: data.word.name,
//     wordAbbreviationName: data.word.abbreviationName,
//     wordEnglishName: data.word.englishName,
//     wordTypeCode: data.wordTypeName,
//     wordExplain: data.word.explain,
//     domainClassDictionaryId: data.domainClass.dictionary.id,
//     domainClassName: data.domainClass.name,
//     wordSimilarYn: data.word.similarYn,
//     wordSimilarDivisionCode: data.word.similarDivisionCode,
//     enactContext: data.enactContext,
//     revisionCycle: data.revisionCycle,
//     revisionDate: data.revisionDate,
//     userName: data.userId,
//   };

//   return wordDetailsQuery;
// };

const bindJobWordDetails = (wordDetailsData) => {};

/*도메인 관리 API ==========================================================================*/

/*
  API 명 : 사전등록 도메인 트리 조회
*/
const getJobDomainSearchTreeData = async (domainTreeQuery) => {
  const { dictionaryId, withJob, managementInstituteId } = domainTreeQuery;

  let domainTreeData;
  try {
    domainTreeData = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/tree?` +
        `dictionaryId=${dictionaryId}&` +
        `withJob=${withJob}&` +
        `managementInstituteId=${managementInstituteId}`,
      {
        skipSpinner: true,
      }
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
  API 명 : 도메인그룹 상세 조회
*/
const getDomainGroupDetails = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/group/details?` +
        `domainGroupDictionaryId=${domainGroupQuery.domainGroupDictionaryId}&` +
        `domainGroupId=${domainGroupQuery.domainGroupId}&` +
        `managementInstituteId=${domainGroupQuery.managementInstituteId}&` +
        `userId=${domainGroupQuery.userId}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getDomainGroupDetails error : ', error);
  }
};

/*
  API 명 : 도메인분류 상세 조회
*/
const getDomainClassDetails = async (domainClassQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/class/details?` +
        `domainClassDictionaryId=${domainClassQuery.domainClassDictionaryId}&` +
        `domainClassId=${domainClassQuery.domainClassId}&` +
        `managementInstituteId=${domainClassQuery.managementInstituteId}&` +
        `userId=${domainClassQuery.userId}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getDomainGroupDetails error : ', error);
  }
};

/*
  API 명 : 도메인 상세 조회
*/
const getDomainNameDetails = async (domainQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/plain/details?` +
        `domainDictionaryId=${domainQuery.domainDictionaryId}&` +
        `domainId=${domainQuery.domainId}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getDomainGroupDetails error : ', error);
  }
};

/*
  API 명 : 도메인 작업 목록 필터 
*/
const getResearchDomainJob = async (domainJobQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain/search`,
      domainJobQuery
    );
    return response;
  } catch (error) {
    console.error('getResearchDomainJob error : ', error);
    return error;
  }
};

/*
  API 명 : 도메인그룹 작업 상세조회
*/
const getDomainGroupJobDetails = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/domain-group?` +
        `domainGroupDictionaryId=${domainGroupQuery.domainGroupDictionaryId}&` +
        `domainGroupId=${domainGroupQuery.domainGroupId}&` +
        `managementInstituteId=${domainGroupQuery.managementInstituteId}&` +
        `userId=${domainGroupQuery.userId}&`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getDomainGroupJobDetails error : ', error);
  }
};

/*
  API 명 : 도메인그룹 작업수정
*/
const getUpdateDomainGroup = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/domain-group`,
      domainGroupQuery
    );
    return response;
  } catch (error) {
    console.error('getUpdateDomainGroup error : ', error);
  }
};

/*
  API 명 : 도메인분류 작업 상세조회
*/
const getDomainClassJobDetails = async (domainClassQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/domain-class?` +
        `domainClassDictionaryId=${domainClassQuery.domainClassDictionaryId}&` +
        `domainClassId=${domainClassQuery.domainClassId}&` +
        `managementInstituteId=${domainClassQuery.managementInstituteId}&` +
        `userId=${domainClassQuery.userId}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getDomainGroupJobDetails error : ', error);
  }
};
/*
  API 명 : 도메인분류 작업수정
*/
const getUpdateDomainClass = async (domainClassQuery) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/domain-class`,
      domainClassQuery
    );
    return response;
  } catch (error) {
    console.error('getUpdateDomainClass error : ', error);
  }
};

/*
  API 명 : 도메인명 작업 상세조회
*/
const getDomainNameJobDetails = async (domainNameQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/domain-plain?` +
        `domainPlainDictionaryId=${domainNameQuery.domainPlainDictionaryId}&` +
        `domainPlainId=${domainNameQuery.domainPlainId}&` +
        `managementInstituteId=${domainNameQuery.managementInstituteId}&` +
        `userId=${domainNameQuery.userId}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getDomainGroupJobDetails error : ', error);
  }
};
/*
  API 명 : 도메인명 작업수정
*/
const getUpdateDomainName = async (domainNameQuery) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/domain-plain`,
      domainNameQuery
    );
    return response;
  } catch (error) {
    console.error('getUpdateDomainName error : ', error);
  }
};

/*
  API 명 : 도메인그룹 작업 신규등록
*/
const createNewDomainGroup = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-group/new`,
      domainGroupQuery
    );
    return response;
  } catch (error) {
    console.error('createNewDomainGroup error : ', error);
    return error;
  }
};

/*
  API 명 : 도메인그룹 작업 변경등록
*/
const modifyDomainGroup = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-group/modify`,
      domainGroupQuery
    );
    return response;
  } catch (error) {
    console.error('modifyDomainGroup error : ', error);
    return error;
  }
};
/*
  API 명 : 도메인그룹 작업 삭제등록
*/
const deleteDomainGroup = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-group/delete`,
      domainGroupQuery
    );
    return response;
  } catch (error) {
    console.error('deleteDomainGroup error : ', error);
    return error;
  }
};

/*
  API 명: 도메인분류 작업 신규등록
*/
const createNewDomainClass = async (domainClassQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-class/new`,
      domainClassQuery
    );
    return response;
  } catch (error) {
    console.error('createNewDomainClass error : ', error);
    return error;
  }
};

/*
  API 명: 도메인분류 작업 변경등록
*/
const modifyDomainClass = async (domainClassQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-class/modify`,
      domainClassQuery
    );
    return response;
  } catch (error) {
    console.error('modifyDomainClass error : ', error);
    return error;
  }
};

/*
  API 명: 도메인분류 작업 삭제등록
 */
const deleteDomainClass = async (domainClassQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-class/delete`,
      domainClassQuery
    );
    return response;
  } catch (error) {
    console.error('deleteDomainClass error : ', error);
    return error;
  }
};

/*
  API 명 : 도메인명 작업 신규등록
*/
const createNewDomainName = async (domainNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-plain/new`,
      domainNameQuery
    );
    return response;
  } catch (error) {
    console.error('createNewDomainName error : ', error);
    return error;
  }
};
/*
  API 명 : 도메인명 작업 변경등록
*/
const modifyDomainName = async (domainNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-plain/modify`,
      domainNameQuery
    );
    return response;
  } catch (error) {
    console.error('modifyDomainName error : ', error);
    return error;
  }
};
/*
  API 명 : 도메인명 작업 삭제등록
*/
const deleteDomainName = async (domainNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-plain/delete`,
      domainNameQuery
    );
    return response;
  } catch (error) {
    console.error('deleteDomainName error : ', error);
    return error;
  }
};

/*
  API 명 : 도메인등록 - 작업도메인그룹 완료
*/
const getApplyDomainGroup = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-group/apply`,
      domainGroupQuery
    );
    return response;
  } catch (error) {
    console.error('getCreateDomainGroup error : ', error);
    return error;
  }
};

/*
  API 명 : 도메인등록 - 작업도메인그룹 취소
*/
const getCancleDomainGroup = async (domainGroupQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-group/cancel`,
      domainGroupQuery
    );
    return response;
  } catch (error) {
    console.error('getCancleDomainGroup error : ', error);
  }
};

/*
  API 명 : 도메인등록 - 작업도메인분류 완료
*/
const getApplyDomainClass = async (domainClassQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-class/apply`,
      domainClassQuery
    );
    return response;
  } catch (error) {
    console.error('getApplyDomainClass error : ', error);
  }
};
/*
  API 명 : 도메인등록 - 작업도메인분류 취소
*/
const getCancleDomainClass = async (domainClassQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-class/cancel`,
      domainClassQuery
    );
    return response;
  } catch (error) {
    console.error('getCancleDomainClass error : ', error);
  }
};

/*
  API 명 : 도메인등록 - 작업도메인 완료
*/
const getApplyDomainName = async (domainNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-plain/apply`,
      domainNameQuery
    );
    return response;
  } catch (error) {
    console.error('getApplyDomainName error : ', error);
  }
};

/*
  API 명 : 도메인등록 - 작업도메인 취소
*/
const getCancleDomainName = async (domainNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-plain/cancel`,
      domainNameQuery
    );
    return response;
  } catch (error) {
    console.error('getCancleDomainName error : ', error);
  }
};

/*
  API 명 : 연관도메인분류 조회 by 그룹
*/
const getRelatedDomainClassList = async (domainGroupName) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/class/relation?domainGroupName=${domainGroupName}`
    );
    console.log('getRelatedDomainClassList response : ', response);
    return response;
  } catch (error) {
    console.error('getRelatedDomainClassList error : ', error);
  }
};
/*
  API 명 : 연관도메인 조회 by 분류
*/
const getRelatedDomainNameList = async (domainClassName) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/domain/relation?domainClassName=${domainClassName}`
    );
    console.log('getRelatedDomainNameList response : ', response);
    return response;
  } catch (error) {
    console.error('getRelatedDomainNameList error : ', error);
  }
};

/*
  API 명 : 연관용어 조회 by 도메인
*/
const getRelatedTermList = async (domainName) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/relation/domain?domainName=${domainName}`
    );
    console.log('getRelatedTermList response : ', response);
    return response;
  } catch (error) {
    console.error('getRelatedTermList error : ', error);
  }
};

/*
  API 명 : 도메인등록 - 도메인그룹 엑셀 업로드
*/
const getDomainGroupUploadFile = async (formData) => {
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-group/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('getDomainGroupUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getDomainGroupUploadFile error : ', error);
  }
};

/*
  API 명 : 도메인등록 - 도메인분류 엑셀 업로드
*/
const getDomainClassUploadFile = async (formData) => {
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-class/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('getDomainClassUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getDomainClassUploadFile error : ', error);
  }
};

/*
  API 명 : 도메인등록 - 도메인명 엑셀 업로드
*/
const getDomainNameUploadFile = async (formData) => {
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain-plain/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('getDomainNameUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getDomainNameUploadFile error : ', error);
  }
};

/*
  API 명 : 도메인등록 - 도메인 엑셀 업로드
*/
const getDomainUplaodFile = async (formData) => {
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/domain/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('getDomainNameUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getDomainNameUploadFile error : ', error);
  }
};
/* 코드 관리 API ==========================================================================*/

// 통합 코드명 조회 - 필터
const getCodeNameSearchJob = async (codeNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/code/name/search-job`,
      codeNameQuery
    );
    return response;
  } catch (error) {
    console.error('getCodeNameSearchJob error : ', error);
    return error;
  }
};

// 통합코드명 상세 조회
const getCodeNameDetails = async (codeNameParams) => {
  const {
    managementInstituteId,
    userId,
    unityCodeDictionaryId,
    unityCodeName,
  } = codeNameParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/name/details?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getCodeNameDetails error : ', error);
  }
};

/*
  API 명 : 코드 작업 목록 필터
*/
const getResearchCodeJob = async (codeJobQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/search`,
      codeJobQuery
    );
    return response;
  } catch (error) {
    console.error('getResearchCodeJob error : ', error);
    return error;
  }
};

/*
  API 명 : 통합 코드값 job 조회
*/
const getCodeValueSearchJob = async (codeValueParams) => {
  const {
    managementInstituteId,
    userId,
    unityCodeDictionaryId,
    unityCodeName,
  } = codeValueParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/value-job?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getCodeValueSearchJob error : ', error);
    return error;
  }
};

/*
  API 명 : 통합 코드명 상세조회
*/
const getCodeValueSearchDetails = async (codeValueParams) => {
  const {
    managementInstituteId,
    userId,
    unityCodeDictionaryId,
    unityCodeName,
    unityCodeValue,
  } = codeValueParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/value-job/details?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}&` +
        `unityCodeValue=${unityCodeValue}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getCodeValueSearchDetails error : ', error);
  }
};

/*
  API 명 : 통합 코드값 job 상세조회
*/
const getCodeValueDetails = async (codeValueParams) => {
  console.log('통합코드값 조회 API === ', codeValueParams);
  const {
    managementInstituteId,
    userId,
    unityCodeDictionaryId,
    unityCodeName,
    unityCodeValue,
  } = codeValueParams;

  console.log(
    'codeValueParams.unityCodeDictionaryId === ',
    codeValueParams.unityCodeDictionaryId
  );
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/code/value?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}&` +
        `unityCodeValue=${unityCodeValue}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getCodeValueDetails error : ', error);
  }
};

/*
  API 명 : 통합코드명 작업 신규등록
*/
const createNewCodeName = async (codeNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/name/new`,
      codeNameQuery
    );
    return response;
  } catch (error) {
    console.error('createNewCodeName error : ', error);
    return error;
  }
};

/*
  API 명 : 통합코드명 작업 변경등록
*/
const modifyCodeName = async (codeNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/name/modify`,
      codeNameQuery
    );
    return response;
  } catch (error) {
    console.error('modifyCodeName error : ', error);
    return error;
  }
};
/*
  API 명 : 통합코드명 작업 삭제등록
*/
const deleteCodeName = async (codeNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/name/delete`,
      codeNameQuery
    );
    return response;
  } catch (error) {
    console.error('deleteCodeName error : ', error);
    return error;
  }
};

/*
  API 명 : 통합코드명 작업 반영
*/
const getApplyCodeNameJob = async (codeNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/name/apply`,
      codeNameQuery
    );
    return response;
  } catch (error) {
    console.error('getApplyCodeNameJob error : ', error);
  }
};

/*
  API 명 : 통합코드명 작업 취소
*/
const getCancelCodeNameJob = async (codeNameQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/name/cancel`,
      codeNameQuery
    );
    return response;
  } catch (error) {
    console.error('getCancelCodeNameJob error : ', error);
  }
};

/*
 API 명 : 통합코드값 작업 완료
*/
const getApplyCodeValueJob = async (codeValueQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/value/apply`,
      codeValueQuery
    );
    return response;
  } catch (error) {
    console.error('getApplyCodeValueJob error : ', error);
  }
};

/*
  API 명 : 통합코드값 작업 취소
*/
const getCancelCodeValueJob = async (codeValueQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/value/cancel`,
      codeValueQuery
    );
    return response;
  } catch (error) {
    console.error('getCancelCodeNameJob error : ', error);
  }
};

/*
  API 명 : 연관용어 조회 by 통합코드명
*/
const getRelatedTermListByCode = async (relationTermParams) => {
  const { unityCodeName, dictionaryId } = relationTermParams;
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/term/relation/code-name?` +
        `unityCodeName=${unityCodeName}&` +
        `dictionaryId=${dictionaryId}`
    );
    console.log('getRelatedTermListByCode response : ', response);
    return response;
  } catch (error) {
    console.error('getRelatedTermListByCode error : ', error);
  }
};

/*
  API 명 : 코드등록 - 상위코드값(통합코드명) 검색
*/
const getParentCodeKoreanNameList = async (unityCodeKoreanNameParmas) => {
  const { managementInstituteId, userId, dictionaryId } =
    unityCodeKoreanNameParmas;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/name/parent?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `dictionaryId=${dictionaryId}`
    );
    return response;
  } catch (error) {
    console.error('getParentCodeList error : ', error);
  }
};
/*
  API 명 : 코드등록 - 상위코드값 검색
*/
const getParentCodeList = async (parentCodeParams) => {
  const {
    managementInstituteId,
    userId,
    dictionaryId,
    unityCodeName,
    unityCodeValue,
  } = parentCodeParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/value/parent?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `unityCodeDictionaryId=${dictionaryId}&` +
        `unityCodeName=${unityCodeName}&` +
        `unityCodeValue=${unityCodeValue}`
    );
    return response;
  } catch (error) {
    console.error('getParentCodeList error : ', error);
  }
};

/*
  API 명 : 코드등록 - 참조코드값(통합코드한글명) 검색
*/
const getReferenceCodeKoreanNameList = async (referenceCodeParams) => {
  const { managementInstituteId, userId, dictionaryId, unityCodeName } =
    referenceCodeParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/name/reference?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `dictionaryId=${dictionaryId}&` +
        `unityCodeName=${unityCodeName}`
    );
    return response;
  } catch (error) {
    console.error('getReferenceCodeKoreanNameList error : ', error);
  }
};

/*
  API 명 : 코드등록 - 통합코드값 신규등록
*/
const createNewCodeValue = async (codeValueQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/value/new`,
      codeValueQuery
    );
    return response;
  } catch (error) {
    console.error('createNewCodeValue error : ', error);
    return error;
  }
};
/*
  API 명 : 코드등록 - 통합코드값 변경등록
*/
const modifyCodeValue = async (codeValueQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/value/modify`,
      codeValueQuery
    );
    return response;
  } catch (error) {
    console.error('modifyCodeValue error : ', error);
    return error;
  }
};
/*
  API 명 : 코드등록 - 통합코드값 삭제등록
*/
const deleteCodeValue = async (codeValueQuery) => {
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/value/delete`,
      codeValueQuery
    );
    return response;
  } catch (error) {
    console.error('deleteCodeValue error : ', error);
  }
};

/*
  API 명 : 코드등록 - 연관/참조 코드값 조회
*/
const getClassReferenceCodeList = async (classReferenceParams) => {
  const {
    managementInstituteId,
    userId,
    unityCodeDictionaryId,
    unityCodeName,
    unityCodeValue,
  } = classReferenceParams;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/code/value/class-reference?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}&` +
        `unityCodeValue=${unityCodeValue}`
    );
    return response;
  } catch (error) {
    console.error('getRelatedReferenceCodeList error : ', error);
  }
};

/*
  API 명 : 코드등록 - 통합코드명 엑셀 등록
*/
const getCodeNameUploadFile = async (formData) => {
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/name/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('getCodeNameUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getCodeNameUploadFile error : ', error);
  }
};

/*
  API 명 : 코드등록 - 통합코드값 엑셀 등록
*/
const getCodeValueUploadFile = async (formData) => {
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/value/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    console.log('getCodeValueUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getCodeValueUploadFile error : ', error);
  }
};

const getCodeUploadFile = async (formData) => {
  console.log('fileData : ', formData);
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
  try {
    const response = await $vxHttp.post(
      `${apiUrl}${defaultUrl}/job/code/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    // console.log('getCodeValueUploadFile response : ', response);

    return response;
  } catch (error) {
    console.error('getCodeValueUploadFile error : ', error);
  }
};

/*
  API 명 : 통합코드명 작업 상세조회
*/
const getCodeNameJobDetails = async (codeNameQuery) => {
  const {
    managementInstituteId,
    userId,
    unityCodeDictionaryId,
    unityCodeName,
  } = codeNameQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/code/name?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}`,
      { skipSpinner: true }
    );
    return response;
  } catch (error) {
    console.error('getCodeNameJobDetails error : ', error);
  }
};

/*
  API 명 : 통합코드명 작업 수정
*/
const getUpdateCodeName = async (codeNameQuery) => {
  console.log('codeNameQuery : ', codeNameQuery);
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/code/name`,
      codeNameQuery
    );
    return response;
  } catch (error) {
    console.error('getUpdateCodeName error : ', error);
  }
};

/*
  API 명 : 통합코드값 작업 상세조회
*/
const getCodeValueJobDetails = async (codeValueQuery) => {
  const {
    managementInstituteId,
    userId,
    unityCodeDictionaryId,
    unityCodeName,
    unityCodeValue,
  } = codeValueQuery;

  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/job/code/value?` +
        `managementInstituteId=${managementInstituteId}&` +
        `userId=${userId}&` +
        `unityCodeDictionaryId=${unityCodeDictionaryId}&` +
        `unityCodeName=${unityCodeName}&` +
        `unityCodeValue=${unityCodeValue}`
    );
    return response;
  } catch (error) {
    console.error('getCodeValueJobDetails error : ', error);
  }
};

/*
  API 명 : 통합코드값 작업 수정
*/
const getUpdateCodeValue = async (codeValueQuery) => {
  try {
    const response = await $vxHttp.put(
      `${apiUrl}${defaultUrl}/job/code/value`,
      codeValueQuery
    );
    return response;
  } catch (error) {
    console.error('getUpdateCodeValue error : ', error);
  }
};

/*  엑셀다운로드 ------------------------------------------ */

const getTermExcelDownload = async (termExcelDownloadQuery) => {
  try {
    const response = await $vxHttp.get(
      `${apiUrl}${defaultUrl}/download/term-template`
    );
    return response;
  } catch (error) {
    console.error('getTermExcelDownload error : ', error);
  }
};

export {
  getTermJobList, // 용어 작업 조회
  getCancelTermJob, // 용어 작업 취소
  getCompleteTermJob, // 용어 작업 완료
  getTermJobDetail, // 용어 관리 - 작업 상세
  getTermDetailInfo, // 용어 관리 - 상세정보
  getResaerchTermJob, // 용어 작업 목록 필터 검색
  getJobTermDetail, // 용어 작업 상세
  getUpdateJobTerm, // 용어 작업 수정
  jobTermSearchResultBinding, // 작업 조회 결과 그리드 데이터 생성
  createNewTerm, // 용어 관리 - 신규
  modifyTerm, // 용어 관리 - 변경,
  deleteTerm, // 용어 관리 - 삭제
  termManagementDataBinding, // 용어 관리 데이터 바인딩
  getDomainClassList, // 도메인 클래스 목록 조회
  getDomainSimpleList, // 도메인 검색
  getUnityCodeSimpleList, // 통합코드명 검색
  getTermDivide, // 용어 관리 - 자동분할
  getTermDivideList, // 용어 분할 목록
  getTermDivideSelectList, // 용어 선택 분할 목록
  getTermUploadFile, // 용어 일괄 등록
  getRelationColumnYn, // 용어 관리 - 연관컬럼 유무 조회
  getRelationColumnList, // 용어 관리 - 연관컬럼 목록 조회
  getWordDetailInfo, // 단어 관리 - 단어 상세정보 조회
  getResaerchWordJob, // 단어 관리 - 단어 작업 목록 필터
  createNewWord, // 단어 관리 - 신규등록,
  modifyWord, // 단어 관리 - 변경등록,
  removeWord, // 단어 관리 - 삭제등록
  wordManagementDataBinding, // 단어 등록 데이터 바인딩
  getDomainGroupList, // 도메인 그룹 목록
  getDomainClassByGroup, // 도메인 분류 목록 by domainGroup
  getCancelWordJob, // 작업취소
  getCompleteWordJob, // 작업완료
  getWordUploadFile, // 단어 엑셀 일괄 업로드
  getRelationWordList, // 단어 관리 -연관용어 리스트 조호
  getJobWordDetailInfo, // 단어 관리 - 작업 단어 상세정보 조회
  getUpdateJobWord, // 단어 관리 - 작업 단어 수정
  bindJobWordDetails, // 작업단어 데이터바인딩
  getJobDomainSearchTreeData, // 도메인 관리 - 작업도메인 트리 데이터 조회
  getDomainGroupDetails, // 도메인그룹 상세 조회
  getDomainClassDetails, // 도메인분류 상세 조회
  getDomainNameDetails, // 도메인명 상세 조회
  getUpdateDomainGroup, // 도메인그룹 작업 수정
  getUpdateDomainClass, // 도메인분류 작업 수정
  getUpdateDomainName, // 도메인명 작업 수정
  getResearchDomainJob, // 도메인 작업 목록 필터
  getDomainGroupJobDetails, // 도메인그룹 작업 상세조회
  getDomainClassJobDetails, // 도메인분류 작업 상세조회
  getDomainNameJobDetails, // 도메인명 작업 상세조회
  createNewDomainGroup, // 도메인그룹 작업 신규등록
  modifyDomainGroup, // 도메인그룹 작업 변경등록
  deleteDomainGroup, // 도메인그룹 작업 삭제등록
  createNewDomainClass, // 도메인분류 작업 신규등록
  modifyDomainClass, // 도메인분류 작업 변경등록
  deleteDomainClass, // 도메인분류 작업 삭제등록
  createNewDomainName, // 도메인명 작업 신규등록
  modifyDomainName, // 도메인명 작업 변경등록
  deleteDomainName, // 도메인명 작업 삭제등록
  getCancleDomainGroup, // 도메인등록 - 작업도메인그룹 취소
  getCancleDomainClass, // 도메인등록 - 작업도메인분류 취소
  getCancleDomainName, // 도메인등록 - 작업도메인 취소
  getRelatedDomainClassList, // 연관도메인분류 조회 by 그룹
  getRelatedDomainNameList, // 연관도메인 조회 by 분류
  getRelatedTermList, // 연관용어 조회 by 도메인
  getApplyDomainGroup, // 도메인등록 - 작업도메인그룹 완료
  getApplyDomainClass, // 도메인등록 - 작업도메인분류 완료
  getApplyDomainName, // 도메인등록 - 작업도메인 완료
  getDomainGroupUploadFile, // 도메인등록 - 도메인그룹 엑셀 업로드
  getDomainClassUploadFile, // 도메인등록 - 도메인분류 엑셀 업로드
  getDomainNameUploadFile, // 도메인등록 - 도메인명 엑셀 업로드
  getDomainUplaodFile, // 도메인등록 - 도메인 엑셀 업로드
  getCodeNameSearchJob, // 통합 코드명 조회 - 필터
  getCodeNameDetails, // 통합코드명 상세 조회
  getResearchCodeJob, // 코드 작업 목록 필터
  getCodeValueSearchJob, // 통합코드값 job 조회
  getCodeValueDetails, // 통합코드값 job 상세조회
  createNewCodeName, // 통합코드명 작업 신규등록
  modifyCodeName, // 통합코드명 작업 변경등록
  deleteCodeName, // 통합코드명 작업 삭제등록
  getApplyCodeNameJob, // 통합코드명 작업 반영
  getCancelCodeNameJob, // 통합코드명 작업 취소
  getRelatedTermListByCode, // 연관용어 조회 by 통합코드명
  getParentCodeKoreanNameList, // 코드 관리 - 상위코드값(통합코드명) 검색
  getParentCodeList, // 코드 관리 - 상위코드값 검색
  getReferenceCodeKoreanNameList, // 코드 관리 - 참조코드값(통합코드한글명) 검색
  createNewCodeValue, // 코드등록 - 통합코드값 신규등록
  modifyCodeValue, // 코드등록 - 통합코드값 변경등록
  deleteCodeValue, // 코드등록 - 통합코드값 삭제등록
  getClassReferenceCodeList, // 코드등록 - 연관/참조 코드값 조회
  getCancelCodeValueJob, // 코드등록 - 통합코드값 취소
  getApplyCodeValueJob, // 코드등록 - 통합코드값 완료
  getTermExcelDownload, // 용어 엑셀 다운로드
  getCodeNameUploadFile, // 코드등록 - 통합코드명 엑셀 등록
  getCodeValueUploadFile, // 코드등록 - 통합코드값 엑셀 등록
  getCodeUploadFile, // 코드등록 - 코드 엑셀 등록.
  getCodeNameJobDetails, // 통합코드명 작업 상세조회
  getUpdateCodeName, // 통합코드명 작업 수정
  getCodeValueJobDetails, // 통합코드값 작업 상세조회
  getUpdateCodeValue, // 통합코드값 작업 수정
  getCodeValueSearchDetails,
};
