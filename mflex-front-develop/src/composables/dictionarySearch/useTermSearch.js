// 용어 그리드 설정 변환 함수
const transformTermGridData = (data) => {
  console.log('transformGridData-data : ', data);

  const fieldMapping = {
    DCTNRY_ID: 'dctnryId',
    NO: 'no',
    TRM_NM: 'termName',
    TRM_EABBR_NM: 'termEngAbbreviationName',
    TRM_ENG_NM: 'termEngName',
    TRM_TYPE_NM: 'termType',
    TRM_STD_YN_NM: 'termStandardYnName',
    DMN_NM: 'domainName',
    CD_TYPE_NM: 'codeTypeName',
    REL_CD_NM: 'relationCodeName',
    REVISION_INFO: 'revisionInfo',
    RVSN_DT: 'revisionDate',
    UPDR_INFO: 'lastChangeInfo',
    UPD_DTM: 'lastChangeDate',
  };

  const specialConfig = {
    termName: {
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
        fieldName === 'termType' ||
        fieldName === 'codeTypeName' ||
        fieldName === 'termEngName' ||
        fieldName === 'lastChangeInfo' ||
        fieldName === 'lastChangeDate' ||
        fieldName === 'revisionDate' ||
        fieldName === 'termStandardYnName'
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

// 용어 검색 데이터 바인딩 함수
const pushTermSearchData = (data) => {
  console.log('pushTermSearchData-data : ', data);
  const termGridData = [];

  const terms = data;
  for (let t = 0; t < terms.length; t++) {
    let revisionInfo = '';
    if (terms[t].revisionCycle === null || terms[t].revisionCycle === '') {
      revisionInfo = `${terms[t].revisionDate}`;
    } else {
      revisionInfo = `${terms[t].revisionDate}(${terms[t].revisionCycle})`;
    }

    termGridData.push({
      id: t,
      no: t + 1,
      instituteId: terms[t].instituteId,
      dictionaryId: terms[t].dictionaryId,
      dictionaryName: terms[t].dictionaryName,
      termName: [
        {
          id: 0,
          type: terms[t].dictionaryTypeName,
          label: terms[t].termName,
          color: terms[t].dictionaryTypeForegroundColorName,
          bgColor: terms[t].dictionaryTypeBackgroundColorName,
          dictionaryName: terms[t].dictionaryName,
          size: 60,
        },
      ],
      termEngAbbreviationName: terms[t].termAbbreviationName,
      termType: terms[t].termTypeName,
      dictionarySourceCode: terms[t].dictionarySourceCode,
      domainName: terms[t].domainName,
      codeTypeName: terms[t].codeTypeName,
      relationCodeName: terms[t].relationCodeName,
      revisionInfo: revisionInfo,
      logicalDataTypeName: terms[t].logicalDataTypeName,
      termStandardYnName: terms[t].termStandardYnName,
      discardYn: terms[t].discardYn,
      revisionDate: terms[t].revisionDate,
      lastChangeInfo: terms[t].updater,
      lastChangeDate: terms[t].updateDateTime,
    });
  }

  return termGridData;
};

// 용어 그리드 데이터 추가 함수
const addTermGridData = (terms, oldGridLength) => {
  const newGridData = [];

  for (let n = 0; n < terms.length; n++) {
    let revisionInfo = '';
    if (terms[n].revisionCycle === null || terms[n].revisionCycle === '') {
      revisionInfo = `${terms[n].revisionDate}`;
    } else {
      revisionInfo = `${terms[n].revisionDate}(${terms[n].revisionCycle})`;
    }

    newGridData.push({
      id: oldGridLength + n,
      no: oldGridLength + n + 1,
      instituteId: terms[n].instituteId,
      dictionaryId: terms[n].dictionaryId,
      dictionaryName: terms[n].dictionaryName,
      termName: [
        {
          id: 0,
          type: terms[n].dictionaryTypeName,
          label: terms[n].termName,
          color: terms[n].dictionaryTypeForegroundColorName,
          bgColor: terms[n].dictionaryTypeBackgroundColorName,
          dictionaryName: terms[n].dictionaryName,
          size: 60,
        },
      ],
      termEngAbbreviationName: terms[n].termAbbreviationName,
      termType: terms[n].termTypeName,
      dictionarySourceCode: terms[n].dictionarySourceCode,
      domainName: terms[n].domainName,
      codeTypeName: terms[n].codeTypeName,
      relationCodeName: terms[n].relationCodeName,
      revisionInfo: revisionInfo,
      logicalDataTypeName: terms[n].logicalDataTypeName,
      termStandardYnName: terms[n].termStandardYnName,
      discardYn: terms[n].discardYn,
      revisionDate: terms[n].revisionDate,
      lastChangeInfo: terms[n].updater,
      lastChangeDate: terms[n].updateDateTime,
    });
  }

  return newGridData;
};

// 새로운 그리드 설정 생성 함수
const newGridSettingFuc = (columnDefs) => {
  const fieldMapping = {
    dctnryId: 'DCTNRY_ID',
    no: 'NO',
    termName: 'TRM_NM',
    termEngAbbreviationName: 'TRM_EABBR_NM',
    termEngName: 'TRM_ENG_NM',
    termType: 'TRM_TYPE_NM',
    termStandardYnName: 'TRM_STND_YN_NM',
    relationCodeName: 'REL_CD_NM',
    domainName: 'DMN_NM',
    codeTypeName: 'CD_TYPE_NM',
    relatedCodeName: 'REL_CD_NM',
    revisionInfo: 'REVISION_INFO',
    revisionDate: 'RVSN_DT',
    lastChangeInfo: 'UPDR_INFO',
    lastChangeDate: 'UPD_DTM',
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

const getSortQuery = (columnDefs) => {
  console.log('getSortQuery-columnDefs : ', columnDefs);

  let defs = '';

  if (columnDefs.value) {
    defs = columnDefs.value;
  } else {
    defs = columnDefs;
  }

  // 정렬이 적용된 모든 열을 찾습니다.
  const sortedColumns = defs
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

const updateTermData = async (data) => {
  // 용어 데이터 업데이트 로직
};

// // 그리드 관련 함수
// const handleColumnStateChanged = (newColumnState, uiStore) => {
//     console.log('컬럼 이동 핸들러 동작 ====');

//     const newColumnFcDefs = newColumnState
//       .map((colState) => {
//         const colDef = columnDefs.value.find(
//           (col) => col.field === colState.colId
//         );
//         if (!colDef) {
//           console.error(
//             `No column definition found for colId: ${colState.colId}`
//           );
//           return null;
//         }

//         // valueFormatter 및 cellRenderer 설정
//         let valueFormatter = null;
//         let cellRenderer = null;

//         if (
//           colDef.field === 'termName' ||
//           colDef.field === 'domainName' ||
//           colDef.field === 'relationCodeName'
//         ) {
//           valueFormatter = (params) => {
//             if (
//               params.value &&
//               Array.isArray(params.value) &&
//               params.value.length > 0
//             ) {
//               return params.value[0].excVal;
//             }
//             return '';
//           };
//           cellRenderer = 'TypeCellRenderer';
//         }

//         return {
//           ...colDef,
//           width: colState.width,
//           minWidth: colState.minWidth,
//           hide: colState.hide,
//           pinned: colState.pinned,
//           sort: colState.sort,
//           sortIndex: colState.sortIndex,
//           suppressSorting: true,
//           comparator: () => 0,
//           valueFormatter: valueFormatter,
//           cellRenderer:
//             colDef.field === 'termName' ||
//             colDef.field === 'domainName' ||
//             colDef.field === 'relationCodeName'
//               ? cellRenderer
//               : null,
//         };
//       })
//       .filter((colDef) => colDef != null);

//     gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
//     columnDefs.value = newColumnFcDefs;

//     // localStorage 저장
//     const gridStorage = JSON.parse(getGridInfoFromStorage());
//     gridStorage[gridId] = newColumnFcDefs;
//     saveGridInfoToStorage(gridStorage);
//     uiStore.setGridColumnDefs(gridId, newColumnFcDefs);
// }

export {
  updateTermData,
  transformTermGridData,
  pushTermSearchData,
  addTermGridData,
  newGridSettingFuc,
  getSortQuery,
};
