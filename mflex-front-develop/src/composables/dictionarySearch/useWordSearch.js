// 데이터 변환 함수
const transformGridData = (data) => {
  console.log('transformGridData-data : ', data);

  const fieldMapping = {
    NO: 'no',
    WRD_NM: 'wordName',
    WRD_EABBR_NM: 'wordAbbreviationName',
    WRD_TYPE_NM: 'wordTypeName',
    WRD_ENG_NM: 'wordEnglishName',
    DMN_CLS_NM: 'domainClassName',
    SYNYM_LIST: 'synonymList',
    REL_CD_NM: 'relatedCodeName',
    REVISION_INFO: 'revisionInfo',
    RVSN_DT: 'revisionDate',
    UPDR_INFO: 'updater',
    UPD_DTM: 'updateDateTime',
  };

  const specialConfig = {
    wordName: {
      cellRenderer: 'TypeCellRenderer',
      valueFormatter: '(params) => params.value',
    },
  };

  return data.map((item) => {
    const fieldName =
      fieldMapping[item.gridArticleName] || item.gridArticleName.toLowerCase();
    const config = specialConfig[fieldName] || {};

    return {
      cellClass:
        fieldName === 'no' ||
        fieldName === 'wordTypeName' ||
        fieldName === 'updater' ||
        fieldName === 'updateDateTime' ||
        fieldName === 'revisionDate'
          ? 'grid-cell-centered'
          : 'ag-left-aligned-cell',
      cellRenderer: config.cellRenderer || null,
      field: fieldName,
      headerName: item.gridArticleKoreanName,
      hide: item.articleDisplayYn === true ? false : true,
      minWidth: item.articleColumnWidth,
      pinned: item.articleFixedCode || '',
      sort: item.articleDataSortCode,
      sortIndex: item.articleDataSortOrder,
      sortable: item.articleDataSortYn,
      suppressSorting: !item.articleDataSortYn,
      valueFormatter:
        config.valueFormatter !== undefined ? config.valueFormatter : null,
      width: item.articleColumnWidth,
    };
  });
};

// 단어 검색 결과를 그리드 데이터로 변환하는 함수
const pushWordSearchData = (words) => {
  console.log('pushWordSearchData-words : ', words);
  const wordGridData = [];

  for (let i = 0; i < words.length; i++) {
    wordGridData.push({
      id: i,
      no: i + 1,
      instituteId: words[i].instituteId,
      dictionaryId: words[i].dictionaryId,
      dictionaryName: words[i].dictionaryName, // 사전명
      // 단어명
      wordName: [
        {
          id: 0,
          type: words[i].dictionaryTypeName,
          label: words[i].wordName,
          color: words[i].dictionaryTypeForegroundColorName,
          bgColor: words[i].dictionaryTypeBackgroundColorName,
          dictionaryName: words[i].dictionaryName,
          size: 60,
        },
      ],
      // 단어영문약어명
      wordAbbreviationName: words[i].wordAbbreviationName,
      // 단어영문명
      wordEnglishName: words[i].wordEnglishName,
      wordTypeName: words[i].wordTypeName, // 단어타입명
      synonymList: words[i].synonymList, // 단어유사어명
      domainClassName: words[i].domainClassName, // 도메인클래스명
      revisionDate: words[i].revisionDate, // 수정일자
      updater: words[i].updater, // 수정자
      updateDateTime: words[i].updateDateTime, // 수정일시
    });
  }

  return wordGridData;
};

// 단어 그리드 추가 함수
const addWordGridData = (words, oldGridLength) => {
  const newGridData = [];

  console.log('addWordGridData-words : ', words);

  for (let n = 0; n < words.length; n++) {
    newGridData.push({
      id: oldGridLength + n,
      no: oldGridLength + n + 1,
      instituteId: words[n].instituteId,
      dictionaryId: words[n].dictionaryId,
      dictionaryName: words[n].dictionaryName, // 사전명
      // 단어명
      wordName: [
        {
          id: 0,
          type: words[n].dictionaryTypeName,
          label: words[n].wordName,
          color: words[n].dictionaryTypeForegroundColorName,
          bgColor: words[n].dictionaryTypeBackgroundColorName,
          dictionaryName: words[n].dictionaryName,
          size: 60,
        },
      ],
      wordAbbreviationName: words[n].wordAbbreviationName, // 단어영문약어명
      wordEnglishName: words[n].wordEnglishName, // 단어영문명
      wordTypeName: words[n].wordTypeName, // 단어타입명
      synonymList: words[n].synonymList, // 단어유사어명
      domainClassName: words[n].domainClassName, // 도메인클래스명
      revisionDate: words[n].revisionDate, // 수정일자
      updater: words[n].updater, // 수정자
      updateDateTime: words[n].updateDateTime, // 수정일시
    });
  }

  return newGridData;
};

// 새로운 그리드 설정 함수
const newGridSettingFuc = (columnDefs) => {
  const fieldMapping = {
    dctnryId: 'DCTNRY_ID',
    no: 'NO',
    wordName: 'WRD_NM',
    wordAbbreviationName: 'WRD_EABBR_NM',
    wordEnglishName: 'WRD_ENG_NM',
    wordTypeName: 'WRD_TYPE_NM',
    domainClassName: 'DMN_CLS_NM',
    synonymList: 'SYNYM_LIST',
    revisionDate: 'RVSN_DT',
    updater: 'UPDR_INFO',
    updateDateTime: 'UPD_DTM',
  };

  const newGridStting = columnDefs.value.map((item, index) => {
    const articleName = fieldMapping[item.field];

    return {
      gridArticleName: articleName,
      gridArticleKoreanName: item.headerName,
      articlePositionOrder: index + 1,
      articleColumnWidth: item.width,
      articleDisplayYn: item.hide,
      articleFixedCode: item.pinned,
      articleDataSortYn: item.sortable,
      articleDataSortOrder: item.sortIndex,
      articleDataSortCode: item.sort,
    };
  });

  return newGridStting;
};

// 소팅 정보 반환 함수
const getSortQuery = (columnDefs) => {
  const sortedColumns = columnDefs.value
    .filter((col) => col.sort && col.sortIndex !== undefined)
    .sort((a, b) => a.sortIndex - b.sortIndex);

  console.log('sortedColumns : ', sortedColumns);

  // 정렬 쿼리 문자열을 생성합니다.
  const sortQuery =
    sortedColumns.length > 0
      ? sortedColumns.map((col) => `${col.headerName} ${col.sort}`).join(', ')
      : '';
  return sortQuery;
};

export {
  transformGridData, // 데이터 변환 함수
  pushWordSearchData, // 단어 검색 결과를 그리드 데이터로 변환하는 함수
  addWordGridData, // 단어 그리드 추가 함수
  newGridSettingFuc, // 새로운 그리드 설정 생성 함수
  getSortQuery, // 소팅 정보 반환 함수
};
