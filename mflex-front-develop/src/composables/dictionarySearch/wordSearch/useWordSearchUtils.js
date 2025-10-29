// composables/dictionarySearch/wordSearch/useWordSearchUtils.js
import { ref } from 'vue';
import { basicWhereQueryCheck } from '@/utils/utils.js';
import { columnDefsUpdate } from '@/utils/js/searchModule';
import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
import { useAlert } from '@/composables/alert';
import {
  getUserGridSetting,
  setUserGridSetting,
  getGridDefaultData,
} from '@/utils/mflexApi/common/commonApi';
import {
  transformGridData,
  newGridSettingFuc,
} from '@/composables/dictionarySearch/useWordSearch';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';

export function useWordSearchUtils() {
  const getGridInfo = (tab2GridId) => async () => {
    try {
      const userGridData = await getUserGridSetting(tab2GridId.value);
      const transformedData = await transformGridData(userGridData);
      console.log('Transformed Grid Data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error in getGridInfo:', error);
      throw error;
    }
  };

  const getSortQuery = (columnDefs) => () => {
    const sortedColumns = columnDefs.value
      .filter((col) => col.sort && col.sortIndex !== undefined)
      .sort((a, b) => a.sortIndex - b.sortIndex);

    const sortQuery =
      sortedColumns.length > 0
        ? sortedColumns.map((col) => `${col.headerName} ${col.sort}`).join(', ')
        : '';
    return sortQuery;
  };

  const transformQuery = (query) => {
    const regex =
      /(\S+)\s+((?:like|=|<|>|<=|>=))\s+'([^']+)'(\s+(?:and|or)\s+)?/gi;
    return query.replace(
      regex,
      (match, column, operator, searchTerm, logicalOperator) => {
        if (column === '최종수정자') {
          return `${column} ${operator.toUpperCase()} '${searchTerm}'${
            logicalOperator ? logicalOperator.toUpperCase() : ''
          }`;
        }
        const transformedTerm = searchTerm.replace(/[a-zA-Z]+/g, (word) =>
          word.toUpperCase()
        );
        return `${column} ${operator.toUpperCase()} '${transformedTerm}'${
          logicalOperator ? logicalOperator.toUpperCase() : ''
        }`;
      }
    );
  };

  const onGridSearchClicked = (params) => async (textValue) => {
    const {
      rowFcData,
      searchInput,
      searchType,
      tab2GridId,
      useMetaMngInstId,
      useDctnryId,
      wordDictionarySearchCode,
      sortStateQuery,
      columnDefs,
      gridApi,
      fetchData,
      getSortQuery,
    } = params;

    rowFcData.value = [];
    console.log('textValue ===', textValue);

    const chgTextValue = textValue.replace(/\n/g, ' ');
    if (chgTextValue.trim()) {
      const upperTextValue = transformQuery(chgTextValue).trim();
      searchInput.value = upperTextValue;

      if (basicWhereQueryCheck(upperTextValue) === 'PASS') {
        console.log('PASS WORD');

        if (searchType.value === 'natural-query' && textValue !== '') {
          const searhInfo = {
            gridId: tab2GridId.value,
            query: upperTextValue,
          };
          const llmAnswer = await getCreateQuery(searhInfo);

          console.log('word - llmAnswer ===', llmAnswer);

          await columnDefsUpdate(
            llmAnswer.data.sort,
            columnDefs,
            tab2GridId.value,
            gridApi
          );

          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            dictionarySearchCode: wordDictionarySearchCode.value,
            query: llmAnswer.data.where,
            sort: getSortQuery(),
          };

          await fetchData(researchQuery);
        } else {
          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            dictionarySearchCode: wordDictionarySearchCode.value,
            query: upperTextValue,
            sort: sortStateQuery.value,
          };

          fetchData(researchQuery);
        }
      } else {
        // 에러 처리 로직
        const alertMsgText = ref('');
        switch (basicWhereQueryCheck(upperTextValue)) {
          case 'ERR_FRBWRD':
            alertMsgText.value =
              '<br>(사유 : <strong style="color:red">금칙어가 포함되어 있습니다.</strong> )';
            break;
          case 'ERR_ANDOR':
            alertMsgText.value =
              '<br>(사유 : <strong style="color:red">문자열의 처음이나 끝에 AND와 OR를 포함할 수 없습니다.</strong> )';
            break;
          case 'ERR_BRCKTCNT':
            alertMsgText.value =
              '<br>(사유 : <strong style="color:red">괄호의 개수가 다릅니다.</strong> )';
            break;
          case 'ERR_QUOTECNT':
            alertMsgText.value =
              '<br>(사유 : <strong style="color:red">조회값의 형식이 다릅니다.</strong> )';
            break;
          case 'ERR_BRCKTORD':
            alertMsgText.value =
              '<br>(사유 : <strong style="color:red">괄호의 순서가 다릅니다.</strong> )';
            break;
          default:
            alertMsgText.value = '';
            break;
        }
        const { setAlertStatus } = useAlert();
        setAlertStatus({
          view: true,
          message:
            '입력한 문자열이 유효한 유형이 아닙니다.' + alertMsgText.value,
        });
        return false;
      }
    } else {
      searchInput.value = '';
      const researchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        dictionarySearchCode: wordDictionarySearchCode.value,
        query: '',
        sort: getSortQuery(),
      };
      fetchData(researchQuery);
    }
  };

  const onFilterWindowClosed = (params) => async (filterSet) => {
    const {
      columnDefs,
      useDctnryId,
      useMetaMngInstId,
      wordDictionarySearchCode,
      fetchData,
      searchInput,
      gridApi,
    } = params;

    console.log('필터 창이 닫혔습니다.');

    if (filterSet) {
      const sortedColumns = columnDefs.value
        .filter((col) => col.sortIndex !== null && col.sort !== null)
        .sort((a, b) => a.sortIndex - b.sortIndex)
        .map(
          (col) => `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
        );

      const sortQuery = sortedColumns.join(', ');

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
        dictionarySearchCode: wordDictionarySearchCode.value,
        query: filterSet.searchQuery,
        sort: filterSortQuery,
      };

      await fetchData(researchQuery);
      searchInput.value = filterSet.searchQuery;
    } else {
      const gridStorage = JSON.parse(getGridInfoFromStorage());
      columnDefs.value = gridStorage.MFGRD005;
      gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD005);
    }
  };

  // 팝업 관련 함수들
  const onSearchRemove = (params) => async () => {
    const {
      searchInput,
      tab2GridId,
      columnDefs,
      uiStore,
      gridApi,
      useMetaMngInstId,
      useDctnryId,
      wordDictionarySearchCode,
      fetchData,
    } = params;

    console.log('onSearchRemove');
    searchInput.value = '';

    const gridDefaultData = await getGridDefaultData(tab2GridId.value);
    const transformGrid = transformGridData(gridDefaultData);

    await setUserGridSetting(tab2GridId.value, gridDefaultData);
    columnDefs.value = transformGrid;

    const gridStorage = JSON.parse(getGridInfoFromStorage());
    gridStorage[tab2GridId.value] = transformGrid;
    saveGridInfoToStorage(gridStorage);

    uiStore.setGridColumnDefs('MFGRD005', columnDefs.value);
    gridApi.value.setGridOption('columnDefs', columnDefs.value);

    const researchQuery = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      dictionarySearchCode: wordDictionarySearchCode.value,
      query: searchInput.value,
      sort: '',
    };

    await fetchData(researchQuery);
  };

  const onSetUserGridSetting = (params) => async () => {
    const {
      columnDefs,
      tab2GridId,
      useMetaMngInstId,
      useDctnryId,
      wordDictionarySearchCode,
      searchInput,
      getSortQuery,
      fetchData,
    } = params;

    const newGridSetting = newGridSettingFuc(columnDefs);
    await setUserGridSetting(tab2GridId.value, newGridSetting);

    const researchQuery = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      dictionarySearchCode: wordDictionarySearchCode.value,
      query: searchInput.value,
      sort: getSortQuery(),
    };

    fetchData(researchQuery);
  };

  const handleBindQuery = (params) => async (llmAnswer) => {
    const {
      chatbotWindowView,
      searchInput,
      columnDefs,
      tab2GridId,
      gridApi,
      useDctnryId,
      useMetaMngInstId,
      wordDictionarySearchCode,
      getSortQuery,
      fetchData,
    } = params;

    chatbotWindowView.value = false;
    searchInput.value = llmAnswer.where;

    await columnDefsUpdate(
      llmAnswer.sort,
      columnDefs,
      tab2GridId.value,
      gridApi
    );

    const researchQuery = {
      dictionaryId: useDctnryId,
      instituteId: useMetaMngInstId,
      dictionarySearchCode: wordDictionarySearchCode.value,
      query: searchInput.value,
      sort: getSortQuery(),
    };

    await fetchData(researchQuery);
  };

  return {
    getGridInfo,
    getSortQuery,
    transformQuery,
    onGridSearchClicked,
    onFilterWindowClosed,
    onSearchRemove,
    onSetUserGridSetting,
    handleBindQuery,
  };
}
