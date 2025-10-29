const transformDomianGridData = (data) => {
  console.log('transformGridData-data : ', data);

  const fieldMapping = {
    DCTNRY_ID: 'dictionaryId',
    NO: 'no',
    DMN_NM: 'domainName',
    DMN_GRP_NM: 'domainGroupName',
    DMN_CLS_NM: 'domainClassName',
    REVISION_INFO: 'revisionInfo',
    RVSN_DT: 'revisionDate',
    DATA_PRM_VL: 'dataPermissionValue',
    UPDR_INFO: 'updater',
    UPD_DTM: 'updateDatetime',
  };

  const specialConfig = {
    domainName: {
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
        fieldName === 'codeTypeName' ||
        fieldName === 'updater' ||
        fieldName === 'updateDatetime' ||
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

// 도메인 검색 결과를 그리드 데이터 변환하는 함수
const pushDomainSearchData = (domains, selectNode) => {
  const domainGridData = [];

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
          dictionaryName: domains[i].dictionaryName,
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

// 도메인 그리드 추가 함수
const addDomainGridData = (domains, oldGirdLength, lastItem) => {
  const newGridData = [];

  for (let i = 0; i < domains.length; i++) {
    newGridData.push({
      id: oldGirdLength + i,
      no: oldGirdLength + i + 1,
      instituteId: domains[i].instituteId,
      dictionaryId: domains[i].dictionaryId,
      domainName: [
        {
          id: 0,
          type: domains[i].dictionaryTypeName,
          label: domains[i].domainName,
          color: domains[i].dictionaryTypeForegroundColorName,
          bgColor: domains[i].dictionaryTypeBackgroundColorName,
          dictionaryName: domains[i].dictionaryName,
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
      domainId: lastItem.domainId,
      treeDomainDictionaryId: lastItem.treeDomainDictionaryId,
    });
  }

  return newGridData;
};

// 쿼리 변환 함수
function transformQuery(query) {
  // 정규표현식을 사용하여 컬럼명, 연산자, 검색 조건을 분리
  const regex =
    /(\S+)\s+((?:like|=|<|>|<=|>=))\s+'([^']+)'(\s+(?:and|or)\s+)?/gi;
  return query.replace(
    regex,
    (match, column, operator, searchTerm, logicalOperator) => {
      if (column === '최종수정자') {
        // 최종수정자는 검색어 유지, 연산자만 대문자로 변환
        return `${column} ${operator.toUpperCase()} '${searchTerm}'${
          logicalOperator ? logicalOperator.toUpperCase() : ''
        }`;
      }
      // 다른 컬럼들의 경우 영문 검색어와 연산자를 대문자로 변환
      const transformedTerm = searchTerm.replace(/[a-zA-Z]+/g, (word) =>
        word.toUpperCase()
      );
      return `${column} ${operator.toUpperCase()} '${transformedTerm}'${
        logicalOperator ? logicalOperator.toUpperCase() : ''
      }`;
    }
  );
}

const newGridSettingFuc = (columnDefs) => {
  const fieldMapping = {
    dictionaryId: 'DCTNRY_ID',
    no: 'NO',
    domainName: 'DMN_NM',
    domainGroupName: 'DMN_GRP_NM',
    domainClassName: 'DMN_CLS_NM',
    dataPermissionValue: 'DATA_PRM_VL',
    revisionInfo: 'REVISION_INFO',
    revisionDate: 'RVSN_DT',
    updater: 'UPDR_INFO',
    updateDatetime: 'UPD_DTM',
  };
  const newGridSetting = columnDefs.value.map((item, index) => {
    const articleName = fieldMapping[item.field];

    return {
      gridArticleName: articleName,
      gridArticleKoreanName: item.headerName,
      articlePositionOrder: index + 1,
      articleColumnWidth: item.width,
      articleDisplayYn: !item.hide,
      articleFixedCode: item.pinned,
      articleDataSortYn: item.sortable,
      articleDataSortOrder: item.sortIndex,
      articleDataSortCode: item.sort,
    };
  });

  return newGridSetting;
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

  console.log('sortQuery : ', sortQuery);
  return sortQuery;
};

export {
  transformDomianGridData, // 도메인 그리드 변환 함수
  pushDomainSearchData, // 도메인 검색 결과를 그리드 데이터로 변환하는 함수
  addDomainGridData, // 도메인 그리드 추가 함수
  transformQuery, // 쿼리 변환 함수
  newGridSettingFuc, // 새로운 그리드 설정 함수
  getSortQuery, // 소팅 정보 반환 함수
};
