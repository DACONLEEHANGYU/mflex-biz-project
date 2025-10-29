import {
  reactive,
  ref,
  nextTick,
  onActivated,
  onDeactivated,
  onUnmounted,
  onMounted,
  watchEffect,
  onBeforeMount,
} from 'vue';
import { useUiStore } from '@/stores/ui';
import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
import { basicWhereQueryCheck } from '@/utils/utils.js';
import { columnDefsUpdate } from '@/utils/js/searchModule';
import GridSearch from '@/components/grid/GridSearch.vue';
import HeaderDragIcon from '@/utils/HeaderDragIcon.js';
import {
  getWordSearchData,
  getResaerchWord,
} from '@/utils/mflexApi/dictionarySearchApi';
import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';
import { $vxHttp } from '@/api';
import { useAlert } from '@/composables/alert';

import AppWindow from '@/components/ui/AppWindow.vue';
import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

import {
  getUserGridSetting, // 사용자별 Grid 세팅 조회
  setUserGridSetting, // 사용자별 Grid 세팅 설정
  getGridDefaultData, // 그리드 기본값 조회
} from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

export default {
  components: {
    TypeCellRenderer,
    HeaderDragIcon,
    GridSearch,
    AppWindow,
    ChatbotBtn,
    ChatbotWindow,
  },

  data() {
    return {
      context: null,
      selectedRow: {},
    };
  },
  methods: {
    onRowDoubleClicked(value) {
      console.log('onRowDoubleClicked ', value);
      this.selectedRow = value;
      //상위로 전다
      // this.$emit('row-double-clicked', value);
    },
    onRowClicked(value) {
      console.log('onRowClicked', value);
      this.selectedRow = value;

      const selectedRow = document.querySelectorAll(
        '[class~="ag-row-selected"]'
      );
      // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
      selectedRow.forEach((node) => {
        node.classList.remove('ag-row-selected');
      });

      const clickNode = value.id;
      const clickedNode = document.querySelector(`[row-id="${clickNode}"]`);
      clickedNode.classList.add('ag-row-selected');
      this.$emit('row-selected', value);
    },
  },
  beforeMount() {
    this.context = { componentParent: this };
  },

  emits: ['first-row-selected', 'row-selected', 'open-filter-window'],
  setup(props, { emit }) {
    const uiStore = useUiStore();
    const { gridColumnDefs } = storeToRefs(uiStore);

    const authStore = useAuthStore();
    const { userInfo, userStngInfo } = storeToRefs(authStore);
    //사용자 아이디
    const { userId, userNm } = userInfo.value;
    //사용자 사용 시스템 정보
    const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
      userStngInfo.value;

    const apiUrl = import.meta.env.VITE_APP_API_URL;

    console.log('사전 조회 단어 - 기관 아이디 : ', useMetaMngInstId);
    console.log('사전 조회 단어 - 사전 아이디 : ', useDctnryId);

    //Grid 아이디
    const tab2GridId = ref('MFGRD005');
    const bscFetchCnt = ref('50');

    //Grid Header 설정
    const gridInfoDefs = ref({
      scrnGridId: tab2GridId,
      scrnId: '',
    });

    const columnDefs = ref([]);

    //Grid Row Data 설정
    const rowFcData = reactive([]);

    onBeforeMount(async () => {
      console.log('wordSearch beforeMount  ========================');

      // 재 렌더링 시 그리드 정보가 있는 경우 메모리의 그리드 정보 사용
      const gridStorage = JSON.parse(getGridInfoFromStorage());
      console.log('gridStorage[tab2GridId.value] : ', gridStorage['MFGRD005']);
      if (!gridStorage[tab2GridId.value]) {
        try {
          // transformedData를 직접 받아서 처리
          const transformedData = await getGridInfo();

          // columnDefs 설정
          columnDefs.value = transformedData;

          // columnDefs가 설정된 후에 실행
          uiStore.setGridColumnDefs('MFGRD05', columnDefs.value);

          gridStorage.MFGRD05 = transformedData;
          saveGridInfoToStorage(gridStorage);

          // gridApi 설정이 유효한지 확인
          if (gridApi.value) {
            gridApi.value.setGridOption('columnDefs', columnDefs.value);
          }

          console.log('그리드데이터 할당 =============== : ', columnDefs.value);

          const sortedColumns = columnDefs.value
            .filter((col) => col.sort && col.sortIndex !== undefined)
            .sort((a, b) => a.sortIndex - b.sortIndex);

          console.log('sortedColumns : ', sortedColumns);

          // 정렬 쿼리 문자열을 생성합니다.
          const sortQuery =
            sortedColumns.length > 0
              ? sortedColumns
                  .map((col) => `${col.headerName} ${col.sort}`)
                  .join(', ')
              : '';

          console.log('colSortQuery =====================', sortQuery);

          const researchQuery = {
            dictionaryId: useDctnryId,
            query: searchInput.value,
            sort: sortQuery,
          };

          await fetchData(researchQuery);
        } catch (error) {
          console.error('Error in onBeforeMount:', error);
        }
      } else {
        columnDefs.value = gridStorage[tab2GridId.value];

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: searchInput.value,
          sort: getSortQuery(),
        };

        await fetchData(researchQuery);
      }
    });

    const getGridInfo = async () => {
      try {
        const userGridData = await getUserGridSetting(tab2GridId.value);
        const transformedData = await transformGridData(userGridData);
        console.log('Transformed Grid Data:', transformedData);
        return transformedData; // transformedData를 반환
      } catch (error) {
        console.error('Error in getGridInfo:', error);
        throw error;
      }
    };

    // 데이터 변환 함수
    const transformGridData = (data) => {
      console.log('transformGridData-data : ', data);

      const fieldMapping = {
        NO: 'no',
        WRD_NM: 'wordName',
        WRD_EABBR_NM: 'wordAbbreviationName',
        WRD_ENG_NM: 'wordEnglishName',
        WRD_TYPE_NM: 'wordTypeName',
        DMN_CLS_NM: 'domainClassName',
        WRD_SMLWRD_DV_NM: 'similarDivisionName',
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
        domainClassName: {
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: '(params) => params.value',
        },
      };

      return data.map((item) => {
        const fieldName =
          fieldMapping[item.gridArticleName] ||
          item.gridArticleName.toLowerCase();
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
          hide: fieldName === 'wordEnglishName' ? true : !item.articleDisplayYn,
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

    // 단어 그리드 헤더 초기화 함수
    const initializeGridColumnDefs = () => {
      const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
      if (storedColumnDefs && storedColumnDefs.MFGRD005) {
        uiStore.setGridColumnDefs('MFGRD005', storedColumnDefs.MFGRD005);
      }
    };
    initializeGridColumnDefs();

    columnDefs.value = gridColumnDefs.value.MFGRD005;

    //그리드 데이터 조회 관련 Parameter
    const defaultParamData = {
      paramMetaMngInstId: useMetaMngInstId,
      paramDctnryId: useDctnryId,
      paramFetchCnt: bscFetchCnt.value,
      paramWhereQuery: '',
      paramOrderByQuery: '',
      paramLastClmnInfo: '',
      paramLastCmprInfo: '',
      paramLastDataInfo: '',
    };

    // AG 그리드 API 할당
    const gridApi = ref(null);

    const handleSetGridApi = (params) => {
      gridApi.value = params;
      console.log('gridApi.value : ', gridApi.value);
    };

    const searchType = ref('query');

    const handleChangeSearchType = (searchTypeData) => {
      console.log('handleChangeSearchType : ', searchTypeData);
      searchType.value = searchTypeData;
    };

    //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
    function handleColumnStateChanged(newColumnState) {
      console.log('컬럼 이동 핸들러 동작 ====');

      console.log('newColumnState : ', newColumnState);

      //gridApi.value.setGridOption('columnDefs', newColumnState);

      console.log('columnDefs.value : ', columnDefs.value);

      // 새 컬럼 헤드 정의
      const newColumnFcDefs = newColumnState
        .map((colState) => {
          // console.log('colState : ', colState);
          const colDef = columnDefs.value.find(
            (col) => col.field === colState.colId
          );
          if (!colDef) {
            console.error(
              `No column definition found for colId: ${colState.colId}`
            );
            return null;
          }

          // valueFormatter 및 cellRenderer 초기화
          let valueFormatter = null;
          let cellRenderer = null;

          // 필드 값에 따라 조건부로 valueFormatter 및 cellRenderer 설정
          if (
            colDef.field === 'wordName' ||
            colDef.field === 'domainClassName'
          ) {
            valueFormatter = (params) => {
              if (
                params.value &&
                Array.isArray(params.value) &&
                params.value.length > 0
              ) {
                return params.value[0].excVal;
              }
              return '';
            };
            cellRenderer = 'TypeCellRenderer'; // 여기서 cellRenderer 설정
          }

          return {
            ...colDef,
            width: colState.width,
            minWidth: colState.minWidth,
            hide: colState.hide,
            pinned: colState.pinned,
            sort: colState.sort,
            sortIndex: colState.sortIndex,
            valueFormatter: valueFormatter,
            comparator: () => 0,
            cellRenderer:
              colDef.field === 'wordName' || colDef.field === 'domainClassName'
                ? cellRenderer
                : null,
          };
        })
        .filter((colDef) => colDef != null);

      console.log('newColumnFcDefs : ', newColumnFcDefs);

      gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
      columnDefs.value = newColumnFcDefs;

      // localStorage에 에서 gridData json 파싱, MFGRD005에 대한 값 변경
      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage.MFGRD005 = newColumnFcDefs;
      // 로컬스토레지에 저장
      saveGridInfoToStorage(gridStorage);

      // 스토어에 저장
      uiStore.setGridColumnDefs('MFGRD005', newColumnFcDefs);

      /*  const gridStorage = JSON.parse(getGridInfoFromStorage());
      console.log('gridStorage ==', gridStorage);
      console.log('gridStorage.MFGRD017 ==', gridStorage.MFGRD017); */
    }

    //valueFormatter 함수 설정
    watchEffect(() => {
      console.log('columnDefs 변경 감지');
      const uiStore = useUiStore();
      const { gridColumnDefs } = storeToRefs(uiStore);

      // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
      if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD005) {
        columnDefs.value = gridColumnDefs.value.MFGRD005;
        return;
      }
      columnDefs.value = gridColumnDefs.value.MFGRD005;

      columnDefs.value = columnDefs.value.map((col) => {
        let valueFormatter = null;
        let cellRenderer = null;
        // 필드 값에 따라 조건부로 valueFormatter 설정
        if (col.field === 'wordName' || col.field === 'domainClassName') {
          valueFormatter = (params) => {
            if (
              params.value &&
              Array.isArray(params.value) &&
              params.value.length > 0
            ) {
              return params.value[0].excVal;
            }
            return '';
          };
          cellRenderer = 'TypeCellRenderer';
        }

        return {
          headerName: col.headerName,
          field: col.field,
          hide: col.hide,
          pinned: col.pinned,
          sortable: col.sortable,
          cellClass: col.cellClass,
          width: col.width,
          minWidth: col.minWidth,
          sort: col.sort,
          sortIndex: col.sortIndex,
          comparator: () => 0,
          valueFormatter: valueFormatter,
          cellRenderer: cellRenderer,
        };
      });
    });

    const resultCount = ref({
      count: '0',
      total: '0',
    });

    const currentRowIndex = ref(0);

    // 단어 로우데이터 바인딩
    const bindingWordRowData = (getWordSearchResult) => {
      console.log('wordSearchData ==================', getWordSearchResult);
      const wordGridData = [];

      try {
        if (getWordSearchResult != null) {
          //조회결과 반영
          resultCount.value.count = Number(
            getWordSearchResult.data.searchCount
          ).toLocaleString();
          resultCount.value.total = Number(
            getWordSearchResult.data.totalCount
          ).toLocaleString();
        }
        for (let i = 0; i < getWordSearchResult.data.words.length; i++) {
          wordGridData.push({
            id: i,
            no: i + 1,
            // 단어명
            wordName: [
              {
                id: 0,
                type: getWordSearchResult.data.words[i].word.dictionary.type
                  .name,
                label: getWordSearchResult.data.words[i].word.name,
                color:
                  getWordSearchResult.data.words[i].word.dictionary.type
                    .fontColor,
                bgColor:
                  getWordSearchResult.data.words[i].word.dictionary.type
                    .backgroundColor,
                size: 60,
              },
            ],
            // 단어영문약어명
            wordAbbreviationName:
              getWordSearchResult.data.words[i].word.abbreviationName,
            // 단어영문명
            wordEnglishName: getWordSearchResult.data.words[i].word.englishName,
            // 단어타입명
            wordTypeName: getWordSearchResult.data.words[i].word.typeName,
            // 단어 사전 ID
            wordDictionaryId:
              getWordSearchResult.data.words[i].word.dictionary.id,
            // 단어유사어명
            similarDivisionName:
              getWordSearchResult.data.words[i].word.similarDivisionName,
            // 도메인클래스명
            domainClassName: [
              {
                id: 0,
                type: getWordSearchResult.data.words[i].domainClass.dictionary
                  .type.name,
                label: getWordSearchResult.data.words[i].domainClass.name,
                color:
                  getWordSearchResult.data.words[i].domainClass.dictionary.type
                    .fontColor,
                bgColor:
                  getWordSearchResult.data.words[i].domainClass.dictionary.type
                    .backgroundColor,
                size: 60,
              },
            ],
            revisionDate: getWordSearchResult.data.words[i].revisionDate,
            updater: getWordSearchResult.data.words[i].updater,
            updateDateTime: getWordSearchResult.data.words[i].updateDateTime,
          });
        }

        return wordGridData;
      } catch (error) {
        console.error(error);
      }
    };

    // 단어 사전 데이터 조회
    const fetchData = async (researchQuery) => {
      let wordSearchData;

      wordSearchData = await getResaerchWord(researchQuery);
      console.log('wordSearchData ==================', wordSearchData);
      const tempData = [];

      if (wordSearchData.status === 409) {
        resultCount.value.count = 0;
        resultCount.value.total = 0;
        rowFcData.value = [];
        emit('row-selected', null);
      } else {
        //조회결과 반영
        resultCount.value.count = Number(
          wordSearchData.data.searchCount
        ).toLocaleString();
        resultCount.value.total = Number(
          wordSearchData.data.totalCount
        ).toLocaleString();
      }

      for (let i = 0; i < wordSearchData.data.words.length; i++) {
        console.log(wordSearchData.data.words[i].revisionCycle);
        tempData.push({
          id: i,
          no: i + 1,
          // 단어명
          wordName: [
            {
              id: 0,
              type: wordSearchData.data.words[i].word.dictionary.type.name,
              label: wordSearchData.data.words[i].word.name,
              color:
                wordSearchData.data.words[i].word.dictionary.type.fontColor,
              bgColor:
                wordSearchData.data.words[i].word.dictionary.type
                  .backgroundColor,
              size: 60,
            },
          ],
          // 단어영문약어명
          wordAbbreviationName:
            wordSearchData.data.words[i].word.abbreviationName,
          // 단어영문명
          wordEnglishName: wordSearchData.data.words[i].word.englishName,
          // 단어타입명
          wordTypeName: wordSearchData.data.words[i].word.typeName,
          // 단어 사전 ID
          wordDictionaryId: wordSearchData.data.words[i].word.dictionary.id,
          // 단어유사어명
          similarDivisionName:
            wordSearchData.data.words[i].word.similarDivisionName,
          // 도메인클래스명
          domainClassName: [
            {
              id: 0,
              type: wordSearchData.data.words[i].domainClass.dictionary.type
                .name,
              label: wordSearchData.data.words[i].domainClass.name,
              color:
                wordSearchData.data.words[i].domainClass.dictionary.type
                  .fontColor,
              bgColor:
                wordSearchData.data.words[i].domainClass.dictionary.type
                  .backgroundColor,
              size: 60,
            },
          ],
          revisionDate: wordSearchData.data.words[i].revisionDate,
          updater: wordSearchData.data.words[i].updater,
          updateDateTime: wordSearchData.data.words[i].updateDateTime,
        });
      }
      rowFcData.value = tempData;

      if (rowFcData.value.length > 0) {
        // 첫 번째 행의 데이터를 이벤트를 통해 상위 컴포넌트로 전달
        if (rowFcData.value.length > 0) {
          nextTick(() => {
            console.log(
              'wordSearch - agGrid.value.gridApi =========',
              agGrid.value.gridApi
            );
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            if (nodesWithRowId0 !== null) {
              // .ag-row-selected 클래스를 추가합니다.
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }

            if (firstRowData) {
              //emit('first-row-selected', firstRowData);
              emit('row-selected', firstRowData);
            }
          });
        }
      }
      return tempData;
    };

    const firstRowSelectedEvent = () => {
      if (rowFcData.value.length > 0) {
        // 첫 번째 행의 데이터를 이벤트를 통해 상위 컴포넌트로 전달
        if (rowFcData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            // .ag-row-selected 클래스를 추가합니다.
            if (nodesWithRowId0) {
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }

            if (firstRowData) {
              //emit('first-row-selected', firstRowData);
              emit('row-selected', firstRowData);
            }
          });
        }
      }
    };

    // 단어 그리드 데이터 추가 함수
    const addGridRowData = async (wordResearchQuery) => {
      try {
        // 추가 조회 전 데이터 초기화
        const oldGridData = rowFcData.value;

        let reLoadWordData;

        if (wordResearchQuery.query) {
          // 검색 조회시 스크롤
          reLoadWordData = await getResaerchWord(wordResearchQuery);
          console.log('reLoadWordData ===', reLoadWordData);
        } else {
          // 기본 스크롤
          reLoadWordData = await getResaerchWord(wordResearchQuery);
        }

        console.log('reLoadWordData ====================', reLoadWordData);
        const words = reLoadWordData.data.words;

        console.log('words =============', words);

        const newGridData = [];

        for (let n = 0; n < words.length; n++) {
          newGridData.push({
            id: oldGridData.length + n,
            no: oldGridData.length + n + 1,
            // 단어명
            wordName: [
              {
                id: 0,
                type: words[n].word.dictionary.type.name,
                label: words[n].word.name,
                color: words[n].word.dictionary.type.fontColor,
                bgColor: words[n].word.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            // 단어영문약어명
            wordAbbreviationName: words[n].word.abbreviationName,
            // 단어영문명
            wordEnglishName: words[n].word.englishName,
            // 단어타입명
            wordTypeName: words[n].word.typeName,
            // 단어 사전 ID
            wordDictionaryId: words[n].word.dictionary.id,
            // 단어유사어명
            similarDivisionName: words[n].word.similarDivisionName,
            // 도메인클래스명
            domainClassName: [
              {
                id: 0,
                type: words[n].domainClass.dictionary.type.name,
                label: words[n].domainClass.name,
                color: words[n].domainClass.dictionary.type.fontColor,
                bgColor: words[n].domainClass.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            revisionDate: words[n].revisionDate,
            updater: words[n].updater,
            updateDateTime: words[n].updateDateTime,
          });
        }

        // 재조회 후 rowData에 할당.
        rowFcData.value = [...oldGridData, ...newGridData];

        resultCount.value.count = Number(rowFcData.value.length);

        // const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
        // console.log(
        //   'lastVisibleRowIndex =================',
        //   lastVisibleRowIndex
        // );
        // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
        agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
      } catch (error) {
        console.error(error);
      }
    };

    // 리스트 갯수 셀렉트
    const optionSelected = ref(10);
    const searchOptions = reactive([
      { label: '10개', value: 10 },
      { label: '20개', value: 20 },
      { label: '30개', value: 30 },
    ]);

    //CSV 다운로드
    const DownloadGridDataToCsv = () => {
      if (agGrid.value) {
        agGrid.value.exportCsv('WordList');
      }
    };

    //엑셀 다운로드 시작
    const DownloadExcel = async () => {
      const rsltSaveData = await $vxHttp.post(
        `${apiUrl}/dcntry/wrd/excelDwn`,
        defaultParamData,
        { responseType: 'blob' } // 'arraybuffer' 대신 'blob'을 직접 사용할 수도 있습니다.
      );

      if (rsltSaveData.data) {
        const contentDisposition = rsltSaveData.headers['content-disposition'];
        let fileName = 'WordList.xlsx'; // 기본 파일명 설정
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        }

        const url = window.URL.createObjectURL(rsltSaveData.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log('다운로드할 데이터가 없습니다.');
      }
    };
    //엑셀 다운로드 마지막

    const viewGridHeaderIndex = () => {
      const cols = agGrid.value.gridApi.getAllGridColumns();
      const colToNameFunc = (col, index) => index + ' = ' + col.getId();
      const colNames = cols.map(colToNameFunc).join(', ');
      console.log('columns are: ' + colNames);
    };

    const sortStateQuery = ref('');

    const handleSortChanged = async (newSortedState) => {
      console.log('newSortedState : ', newSortedState);
      const sortQuery = ref('');
      const sortState = reactive({});

      //sortState.value = newSortedState;

      // newSortedState를 sortIndex를 기준으로 오름차순 정렬
      sortState.value = newSortedState
        .filter((state) => state.sort !== null) // sort가 null이 아닌 항목만 선택
        .sort((a, b) => {
          // sortIndex가 없는 경우 맨 뒤로 보냄
          if (a.sortIndex === undefined && b.sortIndex === undefined) return 0;
          if (a.sortIndex === undefined) return 1;
          if (b.sortIndex === undefined) return -1;
          // sortIndex를 기준으로 오름차순 정렬
          return a.sortIndex - b.sortIndex;
        });

      const lastItem =
        rowFcData.value.length > 0
          ? rowFcData.value[rowFcData.value.length - 1]
          : null;
      console.log('lastItem ===', lastItem);

      console.log('sortState :', sortState);

      // sort의 결과가 초기화 상태일 때,
      if (sortState.value.length == 0) {
        console.log('searchInput.value ===', searchInput.value);

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: searchInput.value,
          // query: wordSearchQuery.query,
        };

        const wordSortData = await getResaerchWord(researchQuery);

        const sortTermGridData = bindingWordRowData(wordSortData);
        rowFcData.value = sortTermGridData;
      } else {
        /* sortQuery.value = `${sortState.value[0].headerName} ${sortState.value[0].sort}`;
        sortStateQuery.value = sortQuery.value; */

        const sortParts = sortState.value.map(
          (column) => `${column.headerName} ${column.sort}`
        );
        sortQuery.value = sortParts.join(', ');
        sortStateQuery.value = sortQuery.value;

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: searchInput.value,
          sort: sortQuery.value,
        };

        const wordSortData = await getResaerchWord(researchQuery);
        console.log('termSortData : ', wordSortData);

        const sortTermGridData = bindingWordRowData(wordSortData);

        rowFcData.value = sortTermGridData;
      }
      firstRowSelectedEvent();
    };

    // 그리드 스크롤 이벤트 함수
    const handleScrollChanged = (endScrollStaus) => {
      if (endScrollStaus === 'Y' && rowFcData.value != null) {
        const lastRowNode =
          agGrid.value.gridApi.getRenderedNodes()[
            agGrid.value.gridApi.getRenderedNodes().length - 1
          ];

        currentRowIndex.value = lastRowNode.rowIndex;
        console.log(
          'currentRowIndex.value ================',
          currentRowIndex.value
        );

        const lastItem =
          rowFcData.value.length > 0
            ? rowFcData.value[rowFcData.value.length - 1]
            : null;

        const sortedColumns = columnDefs.value
          .filter((col) => col.sortIndex !== null && col.sort !== null)
          .sort((a, b) => a.sortIndex - b.sortIndex)
          .map(
            (col) => `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
          );

        const sortQuery = sortedColumns.join(', ');

        let wordResearchQuery = {
          dictionaryId: useDctnryId,
          lastItem: {
            wordName: lastItem.wordName[0].label,
            wordAbbreviationName: lastItem.wordAbbreviationName,
            wordTypeName: lastItem.wordTypeName,
            domainClassName: lastItem.domainClassName[0].label,
            similarDivisionName: lastItem.similarDivisionName,
            revisionDate: lastItem.revisionDate,
            updater: lastItem.updater,
            updateDateTime: lastItem.updateDateTime,
            wordDictionaryId: lastItem.wordDictionaryId,
          },
          query: searchInput.value,
          sort: sortQuery,
          // sort: sortQuery,
        };

        //agGrid.value.gridApi.ensureIndexVisible(49, 'top');

        addGridRowData(wordResearchQuery);
      }
    };

    const searchInput = ref('');

    async function onGridSearchClicked(textValue) {
      rowFcData.value = [];
      console.log('textValue ===', textValue);

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

      const chgTextValue = textValue.replace(/\n/g, ' ');
      if (chgTextValue.trim()) {
        //대문자로 변환
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

            // 컬럼 업데이트
            await columnDefsUpdate(
              llmAnswer.data.sort,
              columnDefs,
              tab2GridId.value,
              gridApi
            );

            const researchQuery = {
              dictionaryId: useDctnryId,
              query: llmAnswer.data.where,
              sort: getSortQuery(),
            };

            await fetchData(researchQuery);
          } else {
            const researchQuery = {
              dictionaryId: useDctnryId,
              query: upperTextValue,
              sort: sortStateQuery.value,
            };

            fetchData(researchQuery);

            console.log('upperTextValue ===', upperTextValue);
            defaultParamData.paramWhereQuery = upperTextValue;
            defaultParamData.paramLastDataInfo = '';
          }
          //fetchData();
        } else {
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
          dictionaryId: useDctnryId,
          query: '',
          sort: getSortQuery(),
        };
        fetchData(researchQuery);
      }
    }

    const confirmSaveDctnrySrchTab2State = reactive({
      view: false,
      message:
        '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
    });

    const onSaveDctnrySrchWrdGridUserStng = () => {
      confirmSaveDctnrySrchTab2State.view = true;
    };

    const confirmDeleteDctnrySrchTab2State = reactive({
      view: false,
      message:
        '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
    });

    const onRemoveWordHeaderData = () => {
      confirmDeleteDctnrySrchTab2State.view = true;
    };

    // 필터 및 정렬 삭제
    const onSearchRemove = async () => {
      console.log('onSearchRemove');
      console.log('정렬 초기화');

      searchInput.value = '';

      const gridDefaultData = await getGridDefaultData(tab2GridId.value);

      const transformGrid = transformGridData(gridDefaultData);

      await setUserGridSetting(tab2GridId.value, gridDefaultData);

      console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

      columnDefs.value = transformGrid;

      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage[tab2GridId.value] = transformGrid;
      saveGridInfoToStorage(gridStorage);

      uiStore.setGridColumnDefs('MFGRD005', columnDefs.value);
      gridApi.value.setGridOption('columnDefs', columnDefs.value);

      const researchQuery = {
        dictionaryId: useDctnryId,
        query: searchInput.value,
        sort: '',
      };

      await fetchData(researchQuery);
    };

    //팝업 창 닫기 후 설정 재호출
    const onFilterWindowClosed = async (filterSet) => {
      // 필터 창이 닫힐 때 수행하고 싶은 로직
      console.log('필터 창이 닫혔습니다.');

      if (filterSet) {
        // 정렬이 적용된 모든 열을 찾습니다.
        const sortedColumns = columnDefs.value
          .filter((col) => col.sortIndex !== null && col.sort !== null)
          .sort((a, b) => a.sortIndex - b.sortIndex)
          .map(
            (col) => `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
          );

        const sortQuery = sortedColumns.join(', ');

        // sortQuery 유무에 따른 정렬 및 필터 쿼리 설정
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
          query: filterSet.searchQuery,
          sort: filterSortQuery,
        };

        // 그리드 데이터 할당
        await fetchData(researchQuery);

        // 조건식 GridSearch Input에 반영
        searchInput.value = filterSet.searchQuery;
      } else {
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage.MFGRD005 : ', gridStorage.MFGRD005);
        columnDefs.value = gridStorage.MFGRD005;

        gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD005);
      }
    };

    const agGrid = ref(null);

    const mountedActive = ref(false);
    console.log('그리드 on mountedActive :', mountedActive.value);

    onActivated(() => {
      // console.log('columnDefs.value : ', columnDefs.value);
      // const sortedColumns = columnDefs.value
      //   .filter((col) => col.sort && col.sortIndex !== undefined)
      //   .sort((a, b) => a.sortIndex - b.sortIndex);
      // console.log('sortedColumns : ', sortedColumns);
      // // 정렬 쿼리 문자열을 생성합니다.
      // const sortQuery =
      //   sortedColumns.length > 0
      //     ? sortedColumns
      //         .map((col) => `${col.headerName} ${col.sort}`)
      //         .join(', ')
      //     : '';
      // console.log('colSortQuery =====================', sortQuery);
      // const researchQuery = {
      //   dictionaryId: useDctnryId,
      //   query: searchInput.value,
      //   sort: sortQuery,
      // };
      // fetchData(researchQuery);
      // setTimeout(() => {
      //   //setGridApis([agGrid.value.gridApi]);
      // }, 200);
    });

    onDeactivated(() => {
      console.log('그리드 onDeactivated 실행?');
      //setGridApis(null);
      mountedActive.value = false;
      console.log('그리드 onDeactivated mountedActive :', mountedActive.value);
    });
    onUnmounted(() => {
      console.log('그리드 onUnmounted 실행?');
      //setGridApis(null);
      mountedActive.value = false;
      console.log('그리드 onUnmounted mountedActive :', mountedActive.value);
    });

    // 소팅 정보 반환 함수
    const getSortQuery = () => {
      const sortedColumns = columnDefs.value
        .filter((col) => col.sort && col.sortIndex !== undefined)
        .sort((a, b) => a.sortIndex - b.sortIndex);

      console.log('sortedColumns : ', sortedColumns);

      // 정렬 쿼리 문자열을 생성합니다.
      const sortQuery =
        sortedColumns.length > 0
          ? sortedColumns
              .map((col) => `${col.headerName} ${col.sort}`)
              .join(', ')
          : '';
      return sortQuery;
    };

    // 챗봇 팝업창 열기
    const chatbotWindowView = ref(false);
    const onOpenChatbotWindow = () => {
      chatbotWindowView.value = true;
    };
    const onCloseChatbotWindow = () => {
      chatbotWindowView.value = false;
    };

    // 챗봇 팝업창에서 쿼리 바인딩
    const handleBindQuery = async (llmAnswer) => {
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
        query: searchInput.value,
        sort: getSortQuery(),
      };

      await fetchData(researchQuery);
    };

    const onSetUserGridSetting = async () => {
      console.log('columnDefs.value : ', columnDefs.value);

      const gridStorage = JSON.parse(getGridInfoFromStorage());
      console.log(
        'gridStorage[tab2GridId.value] : ',
        gridStorage[tab2GridId.value]
      );

      const fieldMapping = {
        no: 'NO',
        wordName: 'WRD_NM',
        wordAbbreviationName: 'WRD_EABBR_NM',
        wordEnglishName: 'WRD_ENG_NM',
        wordTypeName: 'WRD_TYPE_NM',
        domainClassName: 'DMN_CLS_NM',
        similarDivisionName: 'WRD_SMLWRD_DV_NM',
        relatedCodeName: 'REL_CD_NM',
        revisionInfo: 'REVISION_INFO',
        revisionDate: 'RVSN_DT',
        updater: 'UPDR_INFO',
        updateDateTime: 'UPD_DTM',
      };

      const newGridStting = columnDefs.value.map((item, index) => {
        const articleName = fieldMapping[item.field];

        console.log('articleName : ', articleName);

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

      console.log('newGridStting : ', newGridStting);

      await setUserGridSetting(tab2GridId.value, newGridStting);

      const researchQuery = {
        dictionaryId: useDctnryId,
        query: searchInput.value,
        sort: getSortQuery(),
      };

      fetchData(researchQuery);
    };

    const saveGridSettingView = reactive({
      view: false,
      message: '그리드 설정 정보를 저장하시겠습니까?',
    });

    const onSaveGridSettingWindow = () => {
      saveGridSettingView.view = true;
    };

    return {
      agGrid,
      rowFcData,
      optionSelected,
      searchOptions,
      defaultParamData,
      tab2GridId,
      gridInfoDefs,
      addGridRowData,
      DownloadGridDataToCsv,
      DownloadExcel,
      handleSortChanged,
      handleScrollChanged,
      viewGridHeaderIndex,
      resultCount,
      handleColumnStateChanged,
      onGridSearchClicked,
      confirmSaveDctnrySrchTab2State,
      onSaveDctnrySrchWrdGridUserStng,
      confirmDeleteDctnrySrchTab2State,
      onFilterWindowClosed,
      handleSetGridApi, // 그리드 API 할당
      columnDefs, // 단어 그리드 default 컬럼
      onSearchRemove, // 필터 및 정렬 삭제
      searchInput,
      onRemoveWordHeaderData,
      getSortQuery,
      handleBindQuery,
      chatbotWindowView,
      onOpenChatbotWindow,
      onCloseChatbotWindow,
      onSaveGridSettingWindow,
      saveGridSettingView,
      onSetUserGridSetting,
      searchType,
      handleChangeSearchType,
    };
  },
};
