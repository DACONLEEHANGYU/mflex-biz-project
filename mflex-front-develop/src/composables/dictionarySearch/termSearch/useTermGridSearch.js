import {
  ref,
  watch,
  nextTick,
  reactive,
  watchEffect,
  onBeforeMount,
} from 'vue';

import {
  getSortQuery, // 정렬 쿼리 생성 함수
} from '@/composables/dictionarySearch/useTermSearch.js';
import { columnDefsUpdate } from '@/utils/js/searchModule';
import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
import { transformQuery } from '@/composables/dictionarySearch/dictionarySearch.js';
import { getTermViewSearch } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';

const getLlmResearchQuery = async (value, columnDefs, tab1GridId, gridApi) => {
  // 원본 코드
  // this.termQuery.query = llmAnswer.data.where;
  // this.searchInput = value;
  // const searhInfo = {
  //   gridId: this.tab1GridId,
  //   query: value,
  // };
  // const llmAnswer = await getCreateQuery(searhInfo);
  // // 컬럼 업데이트
  // await this.columnDefsUpdate(
  //   llmAnswer.data.sort,
  //   this.columnDefs,
  //   this.tab1GridId,
  //   this.gridApi
  // );
  // // 쿼리 바인딩
  // this.termQuery.query = llmAnswer.data.where;
  // this.searchInput = value;
  const searhInfo = {
    gridId: tab1GridId.value,
    query: value,
  };
  const llmAnswer = await getCreateQuery(searhInfo);
  console.log('llmAnswer', llmAnswer);
  // 컬럼 업데이트
  await columnDefsUpdate(llmAnswer.data.sort, columnDefs, tab1GridId, gridApi);
  // 쿼리 바인딩
  return llmAnswer.data.where;
};

const getResearchResult = async (
  value,
  useMetaMngInstId,
  useDctnryId,
  termDictionarySearchCode,
  columnDefs
) => {
  try {
    // 쿼리 변환
    const transformedQuery = transformQuery(value);

    // 검색 쿼리 객체 생성
    const researchQuery = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      dictionarySearchCode: termDictionarySearchCode,
      query: transformedQuery,
      sort: getSortQuery(columnDefs),
    };

    console.log('getResearchResult - researchQuery:', researchQuery);

    // API 호출
    const termResearchResult = await getTermViewSearch(researchQuery);
    console.log('termResearchResult:', termResearchResult);

    return {
      success: true,
      transformedQuery,
      termResearchResult,
    };
  } catch (error) {
    console.error('getResearchResult 오류:', error);
    return {
      success: false,
      error,
    };
  }
};

const filterSeearchResult = async (
  filterSet,
  columnDefs,
  useDctnryId,
  useMetaMngInstId,
  termDictionarySearchCode
) => {
  const sortedColumns = columnDefs.value
    .filter((col) => col.sortIndex !== null && col.sort !== null)
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((col) => `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`);

  console.log('sortedColumns : ', sortedColumns);
  const sortQuery = sortedColumns.join(', ');
  console.log('sortQuery : ', sortQuery);

  let filterSortQuery;
  if (sortQuery != '') {
    filterSortQuery =
      filterSet.orderQuery != ''
        ? `${sortQuery}, ${filterSet.orderQuery}`
        : sortQuery;
  } else {
    filterSortQuery = filterSet.orderQuery;
  }

  const researchQuery = {
    dictionaryId: useDctnryId,
    instituteId: useMetaMngInstId,
    dictionarySearchCode: termDictionarySearchCode.value,
    domainName: filterSet.domainName,
    query: filterSet.searchQuery,
    sort: filterSortQuery,
  };

  const termFilterData = await getTermViewSearch(researchQuery);
  console.log('termFilterData =================== : ', termFilterData);

  return termFilterData;
};

export { getLlmResearchQuery, getResearchResult, filterSeearchResult };
