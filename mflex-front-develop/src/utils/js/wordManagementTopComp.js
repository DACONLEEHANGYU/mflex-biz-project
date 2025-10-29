import {
  reactive,
  ref,
  nextTick,
  onActivated,
  onMounted,
  watchEffect,
  inject,
} from 'vue';
import { useUiStore } from '@/stores/ui';
import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
import { basicWhereQueryCheck } from '@/utils/utils.js';
import GridSearch from '@/components/grid/GridSearch.vue';
import HeaderDragIcon from '@/utils/HeaderDragIcon.js';
import { getResaerchWord } from '@/utils/mflexApi/dictionarySearchApi';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';
import { $vxHttp } from '@/api';
import { useAlert } from '@/composables/alert';

export default {
  components: {
    TypeCellRenderer,
    HeaderDragIcon,
    GridSearch,
  },

  data() {
    return {
      context: null,
      selectedRow: {},
      tab2SearchValue: null,
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
      this.$emit('selectedWordData', value);
    },
    onSearchEnter(textValue) {
      console.log('단어 onSearchEnter', textValue);
      //단어 검증
      this.tab2SearchValue = textValue;
    },
  },
  beforeMount() {
    this.context = { componentParent: this };
    //this.selectGridFirstNode();
  },

  emits: [
    'first-row-selected',
    'row-selected',
    'open-filter-window',
    'selectedWordData',
  ],
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
    const tab2GridId = ref('MFGRD020');
    const bscFetchCnt = ref('50');

    //Grid Header 설정
    const columnFcDefs = ref([]);
    const columnHeadData = ref([]);
    const gridInfoDefs = ref({
      scrnGridId: tab2GridId,
      scrnId: '',
    });
    //Grid Row Data 설정
    const rowFcData = reactive([]);
    const lastFcGridData = reactive([]);
    //그리드 상태 변경 값
    //const newColumnFcDefs = ref([]);
    //lth

    const defaultGridHeadrParamData = {
      paramGridId: tab2GridId.value,
      paramUserId: userId,
    };

    onMounted(() => {
      console.log('onMounted ========================');
      //initializeGridColumnDefs();
    });

    // 단어 그리드 헤더 데이터

    const initializeGridColumnDefs = () => {
      const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
      if (storedColumnDefs && storedColumnDefs.MFGRD020) {
        uiStore.setGridColumnDefs('MFGRD020', storedColumnDefs.MFGRD020);
      }
    };
    initializeGridColumnDefs();

    const storedMFGRD020ColumnDefs = ref([]);
    storedMFGRD020ColumnDefs.value = gridColumnDefs.value.MFGRD020;

    // 이후 그리드 개인화 시 참조
    /* const getGridHeadrData = async () => {
      const gridHeadrData = await $vxHttp.post(
        `${apiUrl}/grid/user/grdHeadr`,
        defaultGridHeadrParamData
      );
      if (gridHeadrData.data.gridHeadrList !== null) {
        console.log('Header Info1 : ', gridHeadrData.data.gridHeadrList);
        const userGridHearData = [];
        for (let h = 0; h < gridHeadrData.data.gridHeadrList.length; h++) {
          userGridHearData.push({
            headerName:
              gridHeadrData.data.gridHeadrList[h].gridColumnHeaderNm,
            field: gridHeadrData.data.gridHeadrList[h].gridColumnField,
            hide:
              gridHeadrData.data.gridHeadrList[h].gridColumnIndct === 'Y'
                ? false
                : true,
            pinned:
              gridHeadrData.data.gridHeadrList[h].gridColumnPinned !== null
                ? gridHeadrData.data.gridHeadrList[h].gridColumnPinned
                : '',
            sortable:
              gridHeadrData.data.gridHeadrList[h].gridColumnSortable === 'Y'
                ? true
                : false,
            sort:
              typeof gridHeadrData.data.gridHeadrList[h].gridColumnSort ===
              'string'
                ? gridHeadrData.data.gridHeadrList[
                    h
                  ].gridColumnSort.toLowerCase()
                : '',
            sortIndex:
              gridHeadrData.data.gridHeadrList[h].gridColumnSortindex === 0
                ? '0'
                : '' +
                  gridHeadrData.data.gridHeadrList[h].gridColumnSortindex,
            cellClass:
              gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                'wrdNm' ||
              gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                'wrdEabbrNm' ||
              gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                'wrdEngNm' ||
              gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                'dmnClsNm'
                ? 'ag-left-aligned-cell'
                : 'grid-cell-centered',
            width: gridHeadrData.data.gridHeadrList[h].gridColumnWidth,
            cellRenderer:
              gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                'wrdNm' ||
              gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                'dmnClsNm'
                ? 'TypeCellRenderer'
                : null,
            valueFormatter:
              gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                'wrdNm' ||
              gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                'dmnClsNm'
                ? (params) => {
                    if (
                      params.value &&
                      Array.isArray(params.value) &&
                      params.value.length > 0
                    ) {
                      return params.value[0].excVal;
                    }
                    return '';
                  }
                : gridHeadrData.data.gridHeadrList[h].gridColumnField ===
                  'rvsnDt'
                ? (params) => {
                    const value = params.value;
                    if (value && value.length === 8) {
                      return `${value.substring(0, 4)}-${value.substring(
                        4,
                        6
                      )}-${value.substring(6)}`;
                    }
                    return value;
                  }
                : null,
          });
        }

        console.log('userGridHearData : ', userGridHearData);

        columnHeadData.value = userGridHearData;
      }
    };

    getGridHeadrData(); */

    const firstGridData = reactive([]);

    //사용자 기존 설정 데이터
    const paramWhereDataInt = ref('');
    const paramOrderByDataInt = ref('');
    //정렬 변경 여부
    const sortChangeYn = ref('');
    //추가 조회 관련 데이터
    const paramWhereData = ref('');
    const paramOrderByData = ref('');
    const paramLastClmnInfoData = ref('');
    const paramLastCmprInfoData = ref('');
    const paramLastDataInfoData = ref('');
    const refLastClmnInfoData = ref('');

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
    const addParamData = reactive(defaultParamData);

    // AG 그리드 API 할당
    const gridApi = ref(null);

    const handleSetGridApi = (params) => {
      gridApi.value = params;
      console.log('gridApi.value : ', gridApi.value);
    };

    const newColumnDefs = ref([]);

    //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
    function handleColumnStateChanged(newColumnState) {
      console.log('컬럼 이동 핸들러 동작 ====');

      console.log('newColumnState : ', newColumnState);

      console.log(
        'storedMFGRD020ColumnDefs.value : ',
        storedMFGRD020ColumnDefs.value
      );

      // 새 컬럼 헤드 정의
      const newColumnFcDefs = newColumnState
        .map((colState) => {
          console.log('colState : ', colState);
          const colDef = storedMFGRD020ColumnDefs.value.find(
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
      storedMFGRD020ColumnDefs.value = newColumnFcDefs;
      newColumnDefs.value = newColumnFcDefs;

      storedMFGRD020ColumnDefs.value = newColumnFcDefs;

      // localStorage에 에서 gridData json 파싱, MFGRD020에 대한 값 변경
      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage.MFGRD020 = newColumnFcDefs;
      // 로컬스토레지에 저장
      saveGridInfoToStorage(gridStorage);
      // 스토어에 저장
      uiStore.setGridColumnDefs('MFGRD020', newColumnFcDefs);
    }

    const resultCount = ref({
      count: '0',
      total: '0',
    });

    const wordSearchQuery = reactive({
      dictionaryId: useDctnryId,
      wordTypeName: '',
      wordAbbreviationName: '',
      wordName: '',
      wordDictionaryId: '',
      query: '',
    });

    const gridRefreshState = inject('gridRefresh');

    //valueFormatter 함수 설정
    watchEffect(async () => {
      console.log('columnDefs 변경 감지');
      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

      // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
      if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD020) {
        storedMFGRD020ColumnDefs.value = gridColumnDefs.value.MFGRD020;
        return;
      }
      storedMFGRD020ColumnDefs.value = gridColumnDefs.value.MFGRD020;

      storedMFGRD020ColumnDefs.value = storedMFGRD020ColumnDefs.value.map(
        (col) => {
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
        }
      );

      if (gridRefreshState.value == true) {
        console.log('grid refresh =======');
        rowFcData.value = [];

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: '',
          sort: getSortQuery(),
        };

        wordSearchQuery.query = '';
        searchInput.value = '';
        await fetchData(researchQuery);
        gridRefreshState.value = false;
      }
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
      const wordSearchData = await getResaerchWord(researchQuery);

      console.log('wordSearchData ==================', wordSearchData);
      const tempData = [];

      if (wordSearchData.status === 409) {
        resultCount.value.count = '0';
        resultCount.value.total = '0';
        rowFcData.value = [];
        emit('selectedWordData', null);
        return;
      } else if (wordSearchData != null) {
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
              emit('selectedWordData', firstRowData);
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
        // 추가 조회 전 데이터 저장
        let oldGridData = rowFcData.value;

        const lastRowIndex = oldGridData.length - 1;
        const lastRowNode =
          agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);

        const lastItem =
          rowFcData.value.length > 0
            ? rowFcData.value[rowFcData.value.length - 1]
            : null;

        wordSearchQuery.dictionaryId = useDctnryId;
        wordSearchQuery.wordTypeName = lastItem.wordTypeName;
        wordSearchQuery.wordName = lastItem.wordName[0].label;
        wordSearchQuery.wordAbbreviationName = lastItem.wordAbbreviationName;
        wordSearchQuery.wordDictionaryId = lastItem.wordDictionaryId;

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

        const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
        console.log(
          'lastVisibleRowIndex =================',
          lastVisibleRowIndex
        );
        // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
        agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
      } catch (error) {
        console.error(error);
      }
    };

    // //추가 데이터 불러오기
    // const addGridRowData = async () => {
    //   //기존데이터 가져오기
    //   console.log('sortChangeYn : ', sortChangeYn.value);
    //   console.log('paramLastClmnInfoData : ', paramLastClmnInfoData.value);
    //   console.log('refLastClmnInfoData : ', refLastClmnInfoData.value);
    //   console.log('sortChangeYn.value : ', sortChangeYn.value);
    //   let LastChangeClumnData = '';
    //   let oldFcGridData = rowFcData.value;
    //   if (oldFcGridData) {
    //     paramLastDataInfoData.value = '';
    //     let lastFcIndex = agGrid.value.gridApi.getDisplayedRowCount() - 1;
    //     let lastChangeClumnData = [];
    //     let lastValue = '';
    //     if (refLastClmnInfoData.value != '') {
    //       if (refLastClmnInfoData.value.includes('|')) {
    //         lastChangeClumnData = refLastClmnInfoData.value.split('|');
    //       } else {
    //         lastChangeClumnData.push(refLastClmnInfoData.value);
    //       }
    //       for (let k = 0; k < lastChangeClumnData.length; k++) {
    //         if (
    //           lastChangeClumnData[k] == 'wrdNm' ||
    //           lastChangeClumnData[k] == 'dmnClsNm'
    //         ) {
    //           let cssColData =
    //             agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
    //               lastChangeClumnData[k]
    //             ];
    //           lastValue = cssColData[0].label;
    //         } else {
    //           lastValue =
    //             agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
    //               lastChangeClumnData[k]
    //             ];
    //         }
    //         if (paramLastDataInfoData.value != '') {
    //           paramLastDataInfoData.value =
    //             paramLastDataInfoData.value + '|' + lastValue;
    //         } else {
    //           paramLastDataInfoData.value = lastValue;
    //         }
    //       }
    //     } else {
    //       // 없을 경우 추가 가져오기를 못하여 기본 값 설정
    //       paramLastClmnInfoData.value = 'WRD_TYPE_NM|WRD_EABBR_NM|WRD_NM';
    //       paramLastCmprInfoData.value = 'ASC|ASC|ASC';
    //       let wrdNmData =
    //         agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
    //           'wrdNm'
    //         ];

    //       lastValue =
    //         agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
    //           'wrdTypeNm'
    //         ] +
    //         '|' +
    //         agGrid.value.gridApi.getDisplayedRowAtIndex(lastFcIndex).data[
    //           'wrdEabbrNm'
    //         ] +
    //         '|' +
    //         wrdNmData[0].label;
    //       paramLastDataInfoData.value = lastValue;
    //     }
    //     //새로 불러올 경우 정렬 순번 정하는 부분 - 화요일 작업 필요
    //     addParamData.paramLastClmnInfo = paramLastClmnInfoData.value;
    //     addParamData.paramLastCmprInfo = paramLastCmprInfoData.value;
    //     addParamData.paramLastDataInfo = paramLastDataInfoData.value;
    //   }

    //   if (
    //     oldFcGridData.length > 0 &&
    //     oldFcGridData.length % parseInt(bscFetchCnt.value, 10) === 0
    //   ) {
    //     // 새로운 데이터 로드
    //     const addNewData = await $vxHttp.post(
    //       `${apiUrl}/dcntry/wrd/srchFc`,
    //       addParamData
    //     );
    //     let newFcData = addNewData.data.gridWordList;
    //     const addGridFormatData = [];

    //     //데이터가 있을 경우에 데이터 합치기
    //     if (newFcData) {
    //       for (let j = 0; j < newFcData.length; j++) {
    //         addGridFormatData.push({
    //           id: oldFcGridData.length + j,
    //           metaMngInstId: newFcData[j].metaMngInstId,
    //           dctnryId: newFcData[j].wrdDctnryId,
    //           no: oldFcGridData.length + j + 1,
    //           wrdNm: [
    //             {
    //               id: 0,
    //               type: newFcData[j].wrdDctnryTypeNm,
    //               label: newFcData[j].wrdNm,
    //               color: newFcData[j].wrdDctnryTypeFclrNm,
    //               bgColor: newFcData[j].wrdDctnryTypeBclrNm,
    //               excVal:
    //                 (newFcData[j].wrdDctnryTypeNm !== null
    //                   ? '[' + newFcData[j].wrdDctnryTypeNm + '] '
    //                   : '') + newFcData[j].wrdNm,
    //               size: 52,
    //             },
    //           ],
    //           wrdEabbrNm: newFcData[j].wrdEabbrNm,
    //           wrdEngNm: newFcData[j].wrdEngNm,
    //           wrdTypeNm: newFcData[j].wrdTypeNm,
    //           dmnClsNm: [
    //             {
    //               id: 0,
    //               type: newFcData[j].dmnClsDctnryTypeNm,
    //               label: newFcData[j].dmnClsNm,
    //               color: newFcData[j].dmnClsDctnryTypeFclrNm,
    //               bgColor: newFcData[j].dmnClsDctnryTypeBclrNm,
    //               excVal:
    //                 (newFcData[j].dmnClsDctnryTypeNm !== null
    //                   ? '[' + newFcData[j].dmnClsDctnryTypeNm + '] '
    //                   : '') + newFcData[j].dmnClsNm,
    //               size: 52,
    //             },
    //           ],
    //           wrdSmlwrdDvNm: newFcData[j].wrdSmlwrdDvNm,
    //           rvsnDt: newFcData[j].rvsnDt,
    //           updrInfo: newFcData[j].updrInfo,
    //           updDtm: newFcData[j].updDtm,
    //         });
    //       }
    //       rowFcData.value = [];
    //       if (oldFcGridData) {
    //         rowFcData.value = [...oldFcGridData, ...addGridFormatData];
    //       } else {
    //         rowFcData.value = [...addGridFormatData];
    //       }
    //     }
    //   }
    //   //데이터 수 반영
    //   resultCount.value.count = Number(
    //     rowFcData.value.length
    //   ).toLocaleString();
    // };

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

    /* // 정렬 핸들러
    function handleSortChanged(newSortedState) {
      let gridSortState = ref([]);
      let sortStateField = ref({});
      paramOrderByData.value = '';
      paramLastClmnInfoData.value = '';
      paramLastCmprInfoData.value = '';
      refLastClmnInfoData.value = '';

      // 정렬이 변경된 컬럼을 찾음
      newSortedState.forEach((state) => {
        sortStateField.value = {
          sort: state.sort.toUpperCase(),
          colId: state.colId,
          field: state.field,
          sortIndex: state.sortIndex,
          tbName: camelToSnakeCaseUpper(state.colId).toUpperCase(), //카멜표기를 스네이크표기법으로 변환
        };
        //정렬 배열에 담기
        gridSortState.value.push(sortStateField.value);
      });

      if (gridSortState.value.length > 0) {
        gridSortState.value.sort((a, b) => a.sortIndex - b.sortIndex);
        paramOrderByData.value = gridSortState.value
          .map((item) => `${item.tbName} ${item.sort}`)
          .join(',');
        paramLastClmnInfoData.value = gridSortState.value
          .map((item) => `${item.tbName}`)
          .join('|');
        paramLastCmprInfoData.value = gridSortState.value
          .map((item) => `${item.sort}`)
          .join('|');
        refLastClmnInfoData.value = gridSortState.value
          .map((item) => `${item.field}`)
          .join('|');
        sortChangeYn.value = 'Y';
      }
    } */

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
        const researchQuery = {
          dictionaryId: useDctnryId,
          query: wordSearchQuery.query,
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
          query: wordSearchQuery.query,
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

        const sortedColumns = storedMFGRD020ColumnDefs.value
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
          query: wordSearchQuery.query,
          sort: sortQuery,
          // sort: sortQuery,
        };

        addGridRowData(wordResearchQuery);
      }
    };

    const searchInput = ref('');

    function onGridSearchClicked(textValue) {
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
      // const chgTextValue = textValue.replace(/\n/g, ' ');
      if (chgTextValue.trim()) {
        //대문자로 변환
        // const upperTextValue = chgTextValue.trim().toUpperCase();
        const upperTextValue = transformQuery(chgTextValue).trim();
        searchInput.value = upperTextValue;
        if (basicWhereQueryCheck(upperTextValue) === 'PASS') {
          console.log('PASS WORD');
          wordSearchQuery.query = upperTextValue;

          const researchQuery = {
            dictionaryId: useDctnryId,

            query: upperTextValue,
            sort: sortStateQuery.value,
          };

          fetchData(researchQuery);

          console.log('upperTextValue ===', upperTextValue);
          defaultParamData.paramWhereQuery = upperTextValue;
          defaultParamData.paramLastDataInfo = '';
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
        wordSearchQuery.query = '';

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: textValue,
          sort: getSortQuery(),
          userId: userId,
        };

        console.log('wordManagement - researchQuery ===', researchQuery);
        // wordSearchQuery.query = '';
        fetchData(researchQuery);
      }
    }

    const confirmSaveDctnrySrchTab2State = reactive({
      view: false,
      message:
        '사전등록 - 단어등록의 <br> Header 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
    });

    const onSaveDctnrySrchWrdGridUserStng = () => {
      confirmSaveDctnrySrchTab2State.view = true;
    };

    const onSaveUserGridTab2StngInfo = async () => {
      console.log('Grid 설정 등록 : ', defaultGridHeadrParamData);
      console.log('columnFcDefs.value : ', columnFcDefs.value);

      //컬럼 설정
      if (columnFcDefs.value != null) {
        const checkRowData = [];
        const agGridHeadrData = [];

        for (let i = 0; i < columnFcDefs.value.length; i++) {
          agGridHeadrData.push({
            gridColumnHeaderNm: columnFcDefs.value[i].headerName,
            gridColumnOrd: i + 1,
            gridColumnWidth: columnFcDefs.value[i].width,
            gridColumnIndct: columnFcDefs.value[i].hide === true ? 'Y' : 'N',
            gridColumnPinned:
              columnFcDefs.value[i].pinned === null
                ? ''
                : checkRowData.value[i].pinned,
            gridColumnSortable:
              columnFcDefs.value[i].sortable === true ? 'Y' : 'N',
            gridColumnSort:
              typeof columnFcDefs.value[i].sort === 'string'
                ? columnFcDefs.value[i].sort.toUpperCase()
                : '',
            gridColumnSortindex:
              columnFcDefs.value[i].sortIndex === '' ||
              columnFcDefs.value[i].sortIndex === null
                ? -1
                : columnFcDefs.value[i].sortIndex,
            gridColumnFilter: '',
          });
        }

        console.log('agGridHeadrData', agGridHeadrData);

        const gridHeadrSetData = {
          paramGridId: tab2GridId.value,
          paramUserId: userId,
          paramUserNm: userNm,
          paramUserAgGridHeadrList: agGridHeadrData,
        };

        const rsltSaveData = await $vxHttp.post(
          `${apiUrl}/grid/user/setGrdHeadr`,
          gridHeadrSetData
        );

        console.log('서버 응답:', rsltSaveData.data);
        if (rsltSaveData.data.rsltCd === '200') {
          console.log('SUCCESS');
        } else {
          console.log('FAIL');
        }
      }
    };

    const confirmDeleteDctnrySrchTab2State = reactive({
      view: false,
      message:
        '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
    });

    const onDeleteDctnrySrchWrdGridUserStng = () => {
      confirmDeleteDctnrySrchTab2State.view = true;
    };

    // 필터 및 정렬 삭제
    const onSearchRemove = async () => {
      console.log('onSearchRemove');
      console.log('정렬 초기화');

      wordSearchQuery.query = '';
      searchInput.value = '';

      const gridResponse = await fetch('/sampledata/gridDefaultData.json');

      const gridDefaultData = await gridResponse.json();

      console.log('초기 데이터 gridDefaultData : ', gridDefaultData);
      console.log(
        '초기 데이터 gridDefaultData : ',
        gridDefaultData[tab2GridId.value]
      );
      storedMFGRD020ColumnDefs.value = gridDefaultData[tab2GridId.value];

      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage[tab2GridId.value] = gridDefaultData[tab2GridId.value];
      saveGridInfoToStorage(gridStorage);

      console.log(
        'storedMFGRD020ColumnDefs.value : ',
        storedMFGRD020ColumnDefs.value
      );
      uiStore.setGridColumnDefs('MFGRD020', storedMFGRD020ColumnDefs.value);
      gridApi.value.setGridOption('columnDefs', storedMFGRD020ColumnDefs.value);

      //onGridSearchClicked();

      const researchQuery = {
        dictionaryId: useDctnryId,
        query: '',
        sort: '',
      };

      fetchData(researchQuery);
    };

    //팝업 창 닫기 후 설정 재호출
    const onFilterWindowClosed = async (filterSet) => {
      // 필터 창이 닫힐 때 수행하고 싶은 로직
      console.log('필터 창이 닫혔습니다.');

      if (filterSet) {
        // 정렬이 적용된 모든 열을 찾습니다.
        const sortQuery = getSortQuery();

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
        fetchData(researchQuery);
        // 조건식 GridSearch Input에 반영
        searchInput.value = filterSet.searchQuery;
        wordSearchQuery.query = filterSet.searchQuery;
      } else {
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage.MFGRD020 : ', gridStorage.MFGRD020);
        storedMFGRD020ColumnDefs.value = gridStorage.MFGRD020;

        gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD020);
      }
    };

    const agGrid = ref(null);

    const mountedActive = ref(false);
    console.log('그리드 on mountedActive :', mountedActive.value);

    onMounted(() => {
      console.log(
        'storedMFGRD020ColumnDefs.value : ',
        storedMFGRD020ColumnDefs.value
      );

      const sortQuery = getSortQuery();

      console.log('colSortQuery =====================', sortQuery);

      const researchQuery = {
        dictionaryId: useDctnryId,
        query: wordSearchQuery.query,
        sort: sortQuery,
      };

      fetchData(researchQuery);
      console.log('그리드 onMounted 실행?');
      mountedActive.value = true;
      setTimeout(() => {
        //setGridApis([agGrid.value.gridApi]);
      }, 200);
      console.log('그리드 onMounted mountedActive :', mountedActive.value);
    });

    onActivated(() => {
      console.log(
        'storedMFGRD020ColumnDefs.value : ',
        storedMFGRD020ColumnDefs.value
      );
      const sortQuery = getSortQuery();

      console.log('colSortQuery =====================', sortQuery);

      const researchQuery = {
        dictionaryId: useDctnryId,
        query: wordSearchQuery.query,
        sort: sortQuery,
      };

      fetchData(researchQuery);
      setTimeout(() => {}, 200);
    });

    // 소팅 쿼리 반환 함수
    const getSortQuery = () => {
      const sortedColumns = storedMFGRD020ColumnDefs.value
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

    return {
      agGrid,
      rowFcData,
      columnFcDefs,
      optionSelected,
      searchOptions,
      paramWhereDataInt,
      paramOrderByDataInt,
      defaultParamData,
      sortChangeYn,
      paramWhereData,
      paramOrderByData,
      paramLastClmnInfoData,
      paramLastCmprInfoData,
      paramLastDataInfoData,
      refLastClmnInfoData,
      tab2GridId,
      gridInfoDefs,
      addParamData,
      lastFcGridData,
      addGridRowData,
      DownloadGridDataToCsv,
      DownloadExcel,
      handleSortChanged,
      handleScrollChanged,
      viewGridHeaderIndex,
      resultCount,
      columnHeadData,
      handleColumnStateChanged,
      firstGridData,
      onGridSearchClicked,
      confirmSaveDctnrySrchTab2State,
      onSaveDctnrySrchWrdGridUserStng,
      onSaveUserGridTab2StngInfo,
      confirmDeleteDctnrySrchTab2State,
      onDeleteDctnrySrchWrdGridUserStng,
      onFilterWindowClosed,
      wordSearchQuery,
      handleSetGridApi, // 그리드 API 할당
      storedMFGRD020ColumnDefs, // 단어 그리드 default 컬럼
      onSearchRemove, // 필터 및 정렬 삭제
      searchInput,
      getSortQuery,
    };
  },
};
