<template>
  <div class="tab-inner">
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            ref="gridSearchComponent"
            :modelValue="searchInput"
            :resultCount="resultCount"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            :gridName="gridName"
            :isDictionayMngGrid="true"
            @search-type="handleChangeSearchType"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onGridSearchClicked"
            @save="onSaveGridSettingWindow"
            @remove="onDeleteDctnrySrchWrdGridUserStng"
            @column-state-changed="handleColumnStateChanged"
            @filter-window-closed="onFilterWindowClosed"
            @excel-download="handleExcelDownload"
          />
        </div>
      </div>
      <div class="grid-list word-mng-top-grid">
        <AppGrid
          :rowData="rowFcData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="single"
          @rowDoubleClicked="onRowDoubleClicked"
          @rowClicked="onRowClicked"
          @sort-changed="handleSortChanged"
          @body-scroll="handleScrollChanged"
          @column-state-changed="handleColumnStateChanged"
          @gridApi="handleSetGridApi"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
    </div>
    <AppDialog
      v-model:view="saveGridSettingView.view"
      :title="saveGridSettingView.title"
      :message="saveGridSettingView.message"
      @confirm="onSetUserGridSetting"
    />
    <AppDialog
      v-model:view="confirmDeleteDctnrySrchTab2State.view"
      :title="confirmDeleteDctnrySrchTab2State.title"
      :message="confirmDeleteDctnrySrchTab2State.message"
      @confirm="onSearchRemove"
    />
  </div>

  <AppWindow
    :view="chatbotWindowView"
    :moveState="true"
    @close="onCloseChatbotWindow"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="tab2GridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->
<!-- <script type="module" src="@/utils/js/wordManagementTopComp.js"></script> -->
<script>
  import {
    reactive,
    ref,
    nextTick,
    onActivated,
    onMounted,
    watchEffect,
    watch,
    onBeforeMount,
  } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import TermJobTypeCellrenderer from '@/utils/TermJobTypeCellrenderer.js';
  import { basicWhereQueryCheck } from '@/utils/utils.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import HeaderDragIcon from '@/utils/HeaderDragIcon.js';
  import { getWordDetailInfo } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import {
    getWordListV2, // 단어 관리 목록 조회
    getWordDetailsV2, // 관리단어 상세조회
    getWordJobDetailsV2, // 작업단어 상세조회
    getMngWordDownload, // 단어 엑셀 다운로드
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';
  import { $vxHttp } from '@/api';
  import { useAlert } from '@/composables/alert';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  export default {
    components: {
      TypeCellRenderer,
      TermJobTypeCellrenderer,
      HeaderDragIcon,
      GridSearch,
      AppWindow,
      ChatbotWindow,
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
      async onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedWordData = value;
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

        let wordDetailsQuery;
        let wordDetailsDataInfo;
        if (value.wordSourceCode === 'JOB') {
          this.setIsWordJobUpdate(true);

          wordDetailsQuery = {
            instituteId: value.instituteId,
            dictionaryId: value.dictionaryId,
            jobWordId: value.jobWordId,
          };

          wordDetailsDataInfo = await getWordJobDetailsV2(wordDetailsQuery);
        } else {
          wordDetailsQuery = {
            instituteId: value.instituteId,
            dictionaryId: value.dictionaryId,
            wordName: value.wordName.name,
            wordAbbreviationName: this.extractBracketData(
              value.wordAbbreviationName
            ),
            wordTypeCode: value.wordTypeName,
          };
          wordDetailsDataInfo = await getWordDetailsV2(wordDetailsQuery);
        }
        this.setIsWordJobUpdate(false);

        nextTick(() => {
          wordDetailsDataInfo.data.wordSourceCode = value.wordSourceCode;
          if (value.wordSourceCode === 'JOB') {
            this.setWordJobUpdateData(wordDetailsDataInfo.data);
          } else {
            this.setWordJobData(wordDetailsDataInfo.data);
          }
        });
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

      const dictionaryMngStore = useDictionaryMngStore();
      const {
        setWordJobData,
        getWordJobData,
        setWordJobUpdateData,
        setIsWordJobUpdate,
        setIsWordJobSave,
        setIsWordJobApproval,
        setIsWordJobCancel,
      } = dictionaryMngStore;
      const { isWordJobApproval, isWordJobVisible, isWordJobCancel } =
        storeToRefs(dictionaryMngStore);

      const apiUrl = import.meta.env.VITE_APP_API_URL;

      console.log('사전 조회 단어 - 기관 아이디 : ', useMetaMngInstId);
      console.log('사전 조회 단어 - 사전 아이디 : ', useDctnryId);

      //Grid 아이디
      const tab2GridId = ref('MFGRD041');
      const bscFetchCnt = ref('50');

      const gridName = '단어';

      //Grid Header 설정
      const columnFcDefs = ref([]);
      const columnHeadData = ref([]);
      const gridInfoDefs = ref({
        scrnGridId: tab2GridId.value,
        scrnId: '',
      });
      //Grid Row Data 설정
      const rowFcData = reactive([]);
      // 선택 행 데이터터
      const selectedWordData = ref(null);

      onBeforeMount(async () => {
        console.log('wordSearch beforeMount  ========================');

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[tab2GridId.value]) {
          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs(tab2GridId.value, columnDefs.value);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              columnDefs.value
            );

            // 모든 설정이 완료된 후 용어 조회 실행
            // await updateGridData(termQuery);

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
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          // columnDefs 설정
          columnDefs.value = gridStorage[tab2GridId.value];
        }

        const researchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          includeJobWord: isWordJobVisible.value,
          jobTypeCode: 'STD',
          query: searchInput.value,
          sort: getSortQuery(),
        };

        await fetchData(researchQuery);
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
          SYNYM_LIST: 'synonymList',
          REVISION_INFO: 'revisionInfo',
          RVSN_DT: 'revisionDate',
          UPDR_INFO: 'updater',
          UPD_DTM: 'updateDateTime',
        };

        const specialConfig = {
          wordName: {
            cellRenderer: `TermJobTypeCellRenderer`,
            valueFormatter: `(params)=> params.value`,
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
            hide: !item.articleDisplayYn,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            sortable: item.articleDataSortYn,
            suppressSorting: !item.articleDataSortYn,
            valueFormatter:
              config.valueFormatter !== undefined
                ? config.valueFormatter
                : null,
            width: item.articleColumnWidth,
            cellStyle: (params) => {
              if (params.data.wordName.jobDivisionCode === 'D') {
                return { textDecoration: 'line-through', color: 'red' };
              } else if (params.data.wordName.jobDivisionCode === 'C') {
                // 작업 신규등록
                return { color: 'blue' };
              } else if (params.data.wordName.jobDivisionCode === 'U') {
                // 작업 수정
                return { color: 'green' };
              } else if (
                params.data.wordName.jobDivisionCode === 'X' &&
                !params.data.discardYn
              ) {
                // 작업 승인
                return { color: 'red' };
              } else if (
                params.data.wordName.jobDivisionCode === 'V' &&
                params.data.discardYn
              ) {
                // 작업 승인 취소
                return { textDecoration: 'line-through', color: 'green' };
              } else if (
                // 관리 폐기등록
                !params.data.wordName.jobDivisionCode &&
                params.data.discardYn
              ) {
                return { textDecoration: 'line-through', color: 'red' };
              }
              return null;
            },
          };
        });
      };

      const lastFcGridData = reactive([]);

      const defaultGridHeadrParamData = {
        paramGridId: tab2GridId.value,
        paramUserId: userId,
      };

      onMounted(() => {
        console.log('onMounted ========================');
      });

      const columnDefs = ref([]);

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

      const searchType = ref('query');

      const handleChangeSearchType = (searchTypeData) => {
        console.log('handleChangeSearchType : ', searchTypeData);
        searchType.value = searchTypeData;
      };

      const newColumnDefs = ref([]);

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      function handleColumnStateChanged(newColumnState) {
        console.log('컬럼 이동 핸들러 동작 ====');

        console.log('newColumnState : ', newColumnState);

        console.log('columnDefs.value : ', columnDefs.value);

        // 새 컬럼 헤드 정의
        const newColumnFcDefs = newColumnState
          .map((colState) => {
            console.log('colState : ', colState);
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
            if (colDef.field === 'wordName') {
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
              cellRenderer = 'TermJobTypeCellrenderer'; // 여기서 cellRenderer 설정
            }

            // // 필드 값에 따라 조건부로 valueFormatter 및 cellRenderer 설정
            // if (
            //   colDef.field === 'wordName' ||
            //   colDef.field === 'domainClassName'
            // ) {
            //   valueFormatter = (params) => {
            //     if (
            //       params.value &&
            //       Array.isArray(params.value) &&
            //       params.value.length > 0
            //     ) {
            //       return params.value[0].excVal;
            //     }
            //     return '';
            //   };
            //   cellRenderer = 'TypeCellRenderer'; // 여기서 cellRenderer 설정
            // }

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
                colDef.field === 'wordName' ||
                colDef.field === 'domainClassName'
                  ? cellRenderer
                  : null,
              cellClass: colDef.cellClass,
              cellStyle: colDef.cellStyle,
            };
          })
          .filter((colDef) => colDef != null);

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
        columnDefs.value = newColumnFcDefs;
        newColumnDefs.value = newColumnFcDefs;

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD041에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD041 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD041', newColumnFcDefs);
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

      //valueFormatter 함수 설정
      watchEffect(async () => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD041) {
          columnDefs.value = gridColumnDefs.value.MFGRD041;
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD041;

        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          let cellStyle = null;
          // 필드 값에 따라 조건부로 valueFormatter 설정
          // if (col.field === 'wordName' || col.field === 'domainClassName') {
          //   valueFormatter = (params) => {
          //     if (
          //       params.value &&
          //       Array.isArray(params.value) &&
          //       params.value.length > 0
          //     ) {
          //       return params.value[0].excVal;
          //     }
          //     return '';
          //   };
          //   cellRenderer = 'TypeCellRenderer';
          // }

          if (col.field === 'wordName') {
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
            cellRenderer = 'TermJobTypeCellrenderer';
          }

          cellStyle = (params) => {
            // 조건에 따라 취소선 적용
            if (params.data.wordName.jobDivisionCode === 'D') {
              return { textDecoration: 'line-through', color: 'red' };
            } else if (params.data.wordName.jobDivisionCode === 'C') {
              return { color: 'blue' };
            } else if (params.data.wordName.jobDivisionCode === 'U') {
              return { color: 'green' };
            } else if (
              params.data.wordName.jobDivisionCode === 'X' &&
              !params.data.discardYn
            ) {
              // 작업 폐기등록
              return { color: 'red' };
            } else if (
              // 작업 복구등록
              params.data.wordName.jobDivisionCode === 'V'
            ) {
              return { textDecoration: 'line-through', color: 'green' };
            } else if (
              !params.data.wordName.jobDivisionCode &&
              params.data.discardYn
            ) {
              // 관리 폐기등록
              return { textDecoration: 'line-through', color: 'red' };
            }
            return null;
          };

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
            cellStyle: cellStyle,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });
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
              wordEnglishName:
                getWordSearchResult.data.words[i].word.englishName,
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
                    getWordSearchResult.data.words[i].domainClass.dictionary
                      .type.fontColor,
                  bgColor:
                    getWordSearchResult.data.words[i].domainClass.dictionary
                      .type.backgroundColor,
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
        const wordSearchData = await getWordListV2(researchQuery);

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

        const wordList = wordSearchData.data.items;

        for (let i = 0; i < wordList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            dictionaryId: wordList[i].dictionaryId,
            instituteId: wordList[i].instituteId,
            // 단어명
            wordName: {
              name: wordList[i].wordName,
              jobDivisionCode: wordList[i].jobDivisionCode,
              discardYn: wordList[i].discardYn,
            },
            // 단어영문약어명
            wordAbbreviationName: wordList[i].wordAbbreviationName,
            // 단어영문명
            wordEnglishName: wordList[i].wordEnglishName,
            // 단어타입명
            wordTypeName: wordList[i].wordTypeName,
            // 단어 사전 ID
            wordDictionaryId: wordList[i].dictionaryId,
            // 단어유사어명
            similarDivisionName: wordList[i].synonymList,
            // 이음동의어 목록
            synonymList: wordList[i].synonymList,
            // 도메인클래스명
            domainClassName: wordList[i].domainClassName,
            wordSearchData: wordList[i].wordSearchData,
            revisionDate: wordList[i].revisionDate,
            updater: wordList[i].updater,
            updateDateTime: wordList[i].updateDateTime,
            discardYn: wordList[i].discardYn,
            jobDivisionCode: wordList[i].jobDivisionCode,
            jobDivisionName: wordList[i].jobDivisionName,
            wordSourceCode: wordList[i].wordSourceCode,
            userId: wordList[i].userId,
            jobWordId: wordList[i].jobWordId,
          });
        }

        setIsWordJobUpdate(false);
        rowFcData.value = tempData;

        if (rowFcData.value.length > 0) {
          // 첫 번째 행의 데이터를 이벤트를 통해 상위 컴포넌트로 전달
          if (rowFcData.value.length > 0) {
            nextTick(async () => {
              const firstRowData =
                agGrid.value.gridApi.getDisplayedRowAtIndex(0);

              const nodesWithRowId0 = document.querySelector('[row-id="0"]');
              console.log('nodeWithRowId0 ========', nodesWithRowId0);

              if (nodesWithRowId0 !== null) {
                // .ag-row-selected 클래스를 추가합니다.
                nodesWithRowId0.classList.add('ag-row-selected');
                nodesWithRowId0.classList.add('ag-row-focus');
                nodesWithRowId0.setAttribute('aria-selected', true);
              }

              if (firstRowData) {
                // emit('row-selected', firstRowData);
                // emit('selectedWordData', firstRowData);

                let wordDetailsQuery;
                let wordDetailsDataInfo;

                // 작업구분에 따른 API 호출 변경
                if (firstRowData.data.wordSourceCode === 'JOB') {
                  wordDetailsQuery = {
                    instituteId: firstRowData.data.instituteId,
                    dictionaryId: firstRowData.data.dictionaryId,
                    jobWordId: firstRowData.data.jobWordId,
                  };
                  wordDetailsDataInfo = await getWordJobDetailsV2(
                    wordDetailsQuery
                  );
                } else {
                  wordDetailsQuery = {
                    instituteId: firstRowData.data.instituteId,
                    dictionaryId: firstRowData.data.dictionaryId,
                    wordName: firstRowData.data.wordName.name,
                    wordAbbreviationName: extractBracketData(
                      firstRowData.data.wordAbbreviationName
                    ),
                    wordTypeCode: firstRowData.data.wordTypeName,
                  };
                  wordDetailsDataInfo = await getWordDetailsV2(
                    wordDetailsQuery
                  );
                }

                wordDetailsDataInfo.data.wordSourceCode =
                  firstRowData.data.wordSourceCode;

                if (firstRowData.data.wordSourceCode === 'JOB') {
                  setWordJobUpdateData(wordDetailsDataInfo.data);
                } else {
                  setWordJobData(wordDetailsDataInfo.data);
                }
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
              const firstRowData =
                agGrid.value.gridApi.getDisplayedRowAtIndex(0);

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
          wordSearchQuery.wordName = lastItem.wordName.name;
          wordSearchQuery.wordAbbreviationName = lastItem.wordAbbreviationName;
          wordSearchQuery.wordDictionaryId = lastItem.wordDictionaryId;

          let reLoadWordData;

          if (wordResearchQuery.query) {
            // 검색 조회시 스크롤
            reLoadWordData = await getWordListV2(wordResearchQuery);
            console.log('reLoadWordData ===', reLoadWordData);
          } else {
            // 기본 스크롤
            reLoadWordData = await getWordListV2(wordResearchQuery);
          }

          console.log('reLoadWordData ====================', reLoadWordData);
          const words = reLoadWordData.data.items;

          console.log('words =============', words);

          const newGridData = [];

          for (let n = 0; n < words.length; n++) {
            newGridData.push({
              id: oldGridData.length + n,
              no: oldGridData.length + n + 1,
              dictionaryId: words[n].dictionaryId,
              instituteId: words[n].instituteId,
              // 단어명
              wordName: {
                name: words[n].wordName,
                jobDivisionCode: words[n].jobDivisionCode,
                discardYn: words[n].discardYn,
              },
              // 단어영문약어명
              wordAbbreviationName: words[n].wordAbbreviationName,
              // 단어영문명
              wordEnglishName: words[n].wordEnglishName,
              // 단어타입명
              wordTypeName: words[n].wordTypeName,
              // 단어 사전 ID
              wordDictionaryId: words[n].dictionaryId,
              // 단어유사어명
              similarDivisionName: words[n].synonymList,
              // 도메인클래스명
              domainClassName: words[n].domainClassName,
              wordSearchData: words[n].wordSearchData,
              discardYn: words[n].discardYn,
              jobDivisionCode: words[n].jobDivisionCode,
              jobDivisionName: words[n].jobDivisionName,
              userId: words[n].userId,
              jobWordId: words[n].jobWordId,
              revisionDate: words[n].revisionDate,
              updater: words[n].updater,
              updateDateTime: words[n].updateDateTime,
            });
          }

          // 재조회 후 rowData에 할당.
          rowFcData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(rowFcData.value.length);

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
          const contentDisposition =
            rsltSaveData.headers['content-disposition'];
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
            if (a.sortIndex === undefined && b.sortIndex === undefined)
              return 0;
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
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            includeJobWord: isWordJobVisible.value,
            jobTypeCode: 'STD',
            query: searchInput.value,
          };

          await fetchData(researchQuery);
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            includeJobWord: isWordJobVisible.value,
            jobTypeCode: 'STD',
            query: wordSearchQuery.query,
            sort: sortQuery.value,
          };

          await fetchData(researchQuery);
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

          // const sortedColumns = columnDefs.value
          //   .filter((col) => col.sortIndex !== null && col.sort !== null)
          //   .sort((a, b) => a.sortIndex - b.sortIndex)
          //   .map(
          //     (col) =>
          //       `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
          //   );

          // const sortQuery = sortedColumns.join(', ');

          let wordResearchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            includeJobWord: isWordJobVisible.value,
            jobTypeCode: 'STD',
            lastItem: {
              instituteId: lastItem.instituteId,
              userId: lastItem.userId,
              dictionaryId: lastItem.dictionaryId,
              wordSourceCode: lastItem.wordSourceCode,
              jobWordId: lastItem.jobWordId,
              wordName: lastItem.wordName.name,
              wordAbbreviationName: lastItem.wordAbbreviationName,
              jobDivisionCode: lastItem.jobDivisionCode,
              jobDivisionName: lastItem.jobDivisionName,
              wordEnglishName: lastItem.wordEnglishName,
              wordTypeName: lastItem.wordTypeName,
              domainClassName: lastItem.domainClassName,
              synonymList: lastItem.synonymList,
              revisionDate: lastItem.revisionDate,
              discardYn: lastItem.discardYn,
              updater: lastItem.updater,
              updateDateTime: lastItem.updateDateTime,
            },
            query: wordSearchQuery.query,
            sort: getSortQuery(),
          };

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
                instituteId: useMetaMngInstId,
                dictionaryId: useDctnryId,
                includeJobWord: isWordJobVisible.value,
                jobTypeCode: 'STD',
                query: llmAnswer.data.where,
                sort: getSortQuery(),
              };
              wordSearchQuery.query = llmAnswer.data.where;
              searchInput.value = upperTextValue;

              if (llmAnswer.data.sort === '') {
                await fetchData(researchQuery);
              }
            } else {
              const researchQuery = {
                instituteId: useMetaMngInstId,
                dictionaryId: useDctnryId,
                includeJobWord: isWordJobVisible.value,
                jobTypeCode: 'STD',
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
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            includeJobWord: isWordJobVisible.value,
            jobTypeCode: 'STD',
            query: '',
            sort: getSortQuery(),
          };
          fetchData(researchQuery);
        }
      }

      //  function onGridSearchClicked(textValue) {
      //     rowFcData.value = [];
      //     console.log('textValue ===', textValue);

      //     // 쿼리 변환 함수
      //     function transformQuery(query) {
      //       // 정규표현식을 사용하여 컬럼명, 연산자, 검색 조건을 분리
      //       const regex =
      //         /(\S+)\s+((?:like|=|<|>|<=|>=))\s+'([^']+)'(\s+(?:and|or)\s+)?/gi;
      //       return query.replace(
      //         regex,
      //         (match, column, operator, searchTerm, logicalOperator) => {
      //           if (column === '최종수정자') {
      //             // 최종수정자는 검색어 유지, 연산자만 대문자로 변환
      //             return `${column} ${operator.toUpperCase()} '${searchTerm}'${
      //               logicalOperator ? logicalOperator.toUpperCase() : ''
      //             }`;
      //           }
      //           // 다른 컬럼들의 경우 영문 검색어와 연산자를 대문자로 변환
      //           const transformedTerm = searchTerm.replace(/[a-zA-Z]+/g, (word) =>
      //             word.toUpperCase()
      //           );
      //           return `${column} ${operator.toUpperCase()} '${transformedTerm}'${
      //             logicalOperator ? logicalOperator.toUpperCase() : ''
      //           }`;
      //         }
      //       );
      //     }

      //     const chgTextValue = textValue.replace(/\n/g, ' ');
      //     // const chgTextValue = textValue.replace(/\n/g, ' ');
      //     if (chgTextValue.trim()) {
      //       //대문자로 변환
      //       // const upperTextValue = chgTextValue.trim().toUpperCase();
      //       const upperTextValue = transformQuery(chgTextValue).trim();
      //       searchInput.value = upperTextValue;
      //       if (basicWhereQueryCheck(upperTextValue) === 'PASS') {
      //         console.log('PASS WORD');
      //         wordSearchQuery.query = upperTextValue;

      //         const researchQuery = {
      //           dictionaryId: useDctnryId,

      //           query: upperTextValue,
      //           sort: sortStateQuery.value,
      //         };

      //         fetchData(researchQuery);

      //         console.log('upperTextValue ===', upperTextValue);
      //         defaultParamData.paramWhereQuery = upperTextValue;
      //         defaultParamData.paramLastDataInfo = '';
      //       } else {
      //         const alertMsgText = ref('');
      //         switch (basicWhereQueryCheck(upperTextValue)) {
      //           case 'ERR_FRBWRD':
      //             alertMsgText.value =
      //               '<br>(사유 : <strong style="color:red">금칙어가 포함되어 있습니다.</strong> )';
      //             break;
      //           case 'ERR_ANDOR':
      //             alertMsgText.value =
      //               '<br>(사유 : <strong style="color:red">문자열의 처음이나 끝에 AND와 OR를 포함할 수 없습니다.</strong> )';
      //             break;
      //           case 'ERR_BRCKTCNT':
      //             alertMsgText.value =
      //               '<br>(사유 : <strong style="color:red">괄호의 개수가 다릅니다.</strong> )';
      //             break;
      //           case 'ERR_QUOTECNT':
      //             alertMsgText.value =
      //               '<br>(사유 : <strong style="color:red">조회값의 형식이 다릅니다.</strong> )';
      //             break;
      //           case 'ERR_BRCKTORD':
      //             alertMsgText.value =
      //               '<br>(사유 : <strong style="color:red">괄호의 순서가 다릅니다.</strong> )';
      //             break;
      //           default:
      //             alertMsgText.value = '';
      //             break;
      //         }
      //         const { setAlertStatus } = useAlert();
      //         setAlertStatus({
      //           view: true,
      //           message:
      //             '입력한 문자열이 유효한 유형이 아닙니다.' + alertMsgText.value,
      //         });
      //         return false;
      //       }
      //     } else {
      //       wordSearchQuery.query = '';

      //       const researchQuery = {
      //         dictionaryId: useDctnryId,
      //         query: textValue,
      //         sort: getSortQuery(),
      //         userId: userId,
      //       };

      //       console.log('wordManagement - researchQuery ===', researchQuery);
      //       // wordSearchQuery.query = '';
      //       fetchData(researchQuery);
      //     }
      //   }

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

        searchInput.value = '';

        const gridDefaultData = await getGridDefaultData(tab2GridId.value);

        const transformGrid = await transformGridData(gridDefaultData);

        await setUserGridSetting(tab2GridId.value, gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        columnDefs.value = transformGrid;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[tab2GridId.value] = transformGrid;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(tab2GridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        const researchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          includeJobWord: isWordJobVisible.value,
          jobTypeCode: 'STD',
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
          console.log('gridStorage.MFGRD041 : ', gridStorage.MFGRD041);
          columnDefs.value = gridStorage.MFGRD041;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD041);
        }
      };

      const agGrid = ref(null);

      const mountedActive = ref(false);
      console.log('그리드 on mountedActive :', mountedActive.value);

      // 소팅 쿼리 반환 함수
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

      // 작업완료(승인) 시 데이터 갱신
      watch(
        () => isWordJobApproval.value,
        async (newVal) => {
          if (newVal) {
            rowFcData.value = [];
            const researchQuery = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              query: '',
              includeJobWord: isWordJobVisible.value,
              jobTypeCode: 'STD',
              sort: getSortQuery(),
            };

            wordSearchQuery.query = '';
            searchInput.value = '';
            await fetchData(researchQuery);
            setIsWordJobApproval(false);
          }
        }
      );

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

        wordSearchQuery.value = llmAnswer.where;

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
          synonymList: 'WRD_SMLWRD_LIST',
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
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          query: searchInput.value,
          includeJobWord: isWordJobVisible.value,
          jobTypeCode: 'STD',
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

      const handleExcelDownload = async (state) => {
        console.log('state : ', state);

        try {
          if (state === 'all') {
            // 🔥 전체 다운로드 - API 응답을 엑셀 파일로 다운로드
            const params = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              dictionarySearchCode: 'INDIVIDUAL',
              includeJobWord: isWordJobVisible.value,
              jobTypeCode: 'STD',
              query: searchInput.value,
              sort: getSortQuery(),
            };

            console.log('params : ', params);

            const response = await getMngWordDownload(params);
            console.log('response : ', response);

            // 🔥 API 응답 데이터를 Blob으로 변환하여 엑셀 파일 다운로드
            if (response && response.data) {
              const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });

              // 🔥 파일 다운로드 실행
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `단어목록_전체_${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`;

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);

              console.log('전체 다운로드 완료');
            } else {
              console.error('API 응답 데이터가 없습니다.');
              alert('다운로드할 데이터가 없습니다.');
            }
          } else {
            // 🔥 조회 건 다운로드 (기존 방식 유지)
            console.log('조회건 다운로드 시작');
            // console.log('rowData.value : ', rowData.value);

            if (!rowFcData.value || rowFcData.value.length === 0) {
              alert('조회된 데이터가 없습니다.');
              return;
            }

            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(rowFcData.value);

            // 🔥 엑셀 파일 생성 및 다운로드
            await downloadExcelFromData(excelData, '조회건');
          }
        } catch (error) {
          console.error('엑셀 다운로드 실패:', error);

          // 🔥 에러 상세 정보 표시
          if (error.response && error.response.status) {
            alert(
              `엑셀 다운로드 중 오류가 발생했습니다. (${error.response.status})`
            );
          } else {
            alert('엑셀 다운로드 중 오류가 발생했습니다.');
          }
        }
      };

      // 🔥 rowData를 엑셀 다운로드용 데이터로 변환하는 함수
      const convertRowDataToExcelFormat = (data) => {
        return data.map((row, index) => {
          console.log('row : ', row);
          return {
            단어명: row.wordName.name,
            단어영문약어명: row.wordAbbreviationName || '',
            작업구분명: row.jobDivisionName || '',
            단어영문명: row.wordEnglishName || '',
            단어유형: row.wordTypeName || '',
            도메인분류명: row.domainClassName || '',
            이음동의어목록: row.synonymList || '',
            폐기여부: row.discardYn === true ? 'Y' : 'N' || '',
            제개정일자: row.revisionDate || '',
            최종수정자: row.updater || '',
            최종수정일시: row.updateDateTime || '',
          };
        });
      };

      // 🔥 셀 값 추출 함수 (복잡한 객체 구조에서 실제 값 추출)
      const extractCellValue = (cellData) => {
        if (!cellData) return '';

        // 배열 형태인 경우 (예: termName: [{label: "값"}])
        if (Array.isArray(cellData) && cellData.length > 0) {
          return cellData[0].label || cellData[0].value || cellData[0];
        }

        // 객체 형태인 경우
        if (typeof cellData === 'object' && cellData.label) {
          return cellData.label;
        }

        // 문자열이나 기본 값인 경우
        return String(cellData);
      };

      // 🔥 ExcelJS를 사용한 스타일 적용 가능한 엑셀 다운로드 함수
      const downloadExcelFromData = async (data, downloadType) => {
        try {
          // 🔥 ExcelJS 라이브러리 import
          const ExcelJS = await import('exceljs');

          // 워크북과 워크시트 생성
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('단어목록');

          // 🔥 컬럼 정의 및 헤더 설정
          worksheet.columns = [
            { header: '단어명', key: '단어명', width: 40 },
            { header: '단어영문약어명', key: '단어영문약어명', width: 20 },
            { header: '작업구분명', key: '작업구분명', width: 15 },
            { header: '단어영문명', key: '단어영문명', width: 30 },
            { header: '단어유형', key: '단어유형', width: 15 },
            { header: '도메인분류명', key: '도메인분류명', width: 15 },
            { header: '이음동의어목록', key: '이음동의어목록', width: 20 },
            { header: '폐기여부', key: '폐기여부', width: 15 },
            { header: '제개정일자', key: '제개정일자', width: 25 },
            { header: '최종수정자', key: '최종수정자', width: 15 },
            { header: '최종수정일시', key: '최종수정일시', width: 20 },
          ];

          // 🔥 헤더 스타일 적용
          const headerRow = worksheet.getRow(1);
          headerRow.height = 20; // 행 높이 설정

          headerRow.eachCell((cell) => {
            cell.font = {
              bold: true,
              name: 'Arial',
              size: 11,
              color: { argb: 'FF000000' }, // 검은색
            };
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle',
            };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFBFBFBF' }, // #BFBFBF 배경색
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } },
            };
          });

          // 🔥 데이터 행 추가 및 스타일 적용
          data.forEach((rowData, index) => {
            const row = worksheet.addRow(rowData);
            row.height = 20; // 행 높이 설정

            // 각 셀에 스타일 적용
            row.eachCell((cell, colNumber) => {
              cell.font = {
                name: 'Arial',
                size: 10,
                color: { argb: 'FF000000' },
              };

              // 순번 컬럼은 중앙 정렬, 나머지는 좌측 정렬

              cell.alignment = {
                horizontal: 'left',
                vertical: 'middle',
              };

              // 모든 셀에 테두리 적용
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } },
              };

              // 🔥 데이터 타입별 추가 포맷팅
              if (colNumber === 1) {
                // 순번은 숫자 형식
                cell.numFmt = '0';
              } else if (colNumber >= 10) {
                // 날짜 컬럼들
                if (
                  cell.value &&
                  cell.value.toString().match(/\d{4}-\d{2}-\d{2}/)
                ) {
                  cell.numFmt = 'yyyy-mm-dd';
                }
              }
            });
          });

          // 🔥 워크시트 전체 설정
          worksheet.pageSetup = {
            paperSize: 9, // A4
            orientation: 'landscape', // 가로 방향
            fitToPage: true,
            fitToHeight: 0,
            fitToWidth: 1,
            margins: {
              left: 0.7,
              right: 0.7,
              top: 0.75,
              bottom: 0.75,
              header: 0.3,
              footer: 0.3,
            },
          };

          // 🔥 인쇄 제목 설정 (헤더 행 반복)
          worksheet.pageSetup.printTitlesRow = '1:1';

          // 🔥 자동 필터 설정
          worksheet.autoFilter = {
            from: 'A1',
            to: `J${data.length + 1}`,
          };

          // 🔥 셀 고정 (헤더 행 고정)
          worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

          // 🔥 파일 다운로드
          const fileName = `단어목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log(`${downloadType} 스타일 적용 다운로드 완료:`, fileName);
        } catch (error) {
          console.error('ExcelJS 파일 생성 실패:', error);

          // 🔥 ExcelJS 실패 시 기본 XLSX 방식으로 폴백
          console.log('기본 XLSX 방식으로 재시도...');
          await downloadExcelFromDataFallback(data, downloadType);
        }
      };

      // 🔥 폴백용 기본 다운로드 함수
      const downloadExcelFromDataFallback = async (data, downloadType) => {
        try {
          const XLSX = await import('xlsx');

          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, '단어목록');

          const columnWidths = [
            { wch: 8 },
            { wch: 15 },
            { wch: 25 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
          ];
          worksheet['!cols'] = columnWidths;

          const fileName = `단어목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

          XLSX.writeFile(workbook, fileName);
          console.log(`${downloadType} 기본 다운로드 완료:`, fileName);
        } catch (error) {
          console.error('기본 XLSX 다운로드도 실패:', error);
          downloadCSVFromData(data, downloadType);
        }
      };

      // 🔥 XLSX 라이브러리가 없는 경우 CSV 다운로드 대안
      const downloadCSVFromData = (data, downloadType) => {
        try {
          if (data.length === 0) return;

          // CSV 헤더 생성
          const headers = Object.keys(data[0]);
          const csvContent = [
            headers.join(','), // 헤더 행
            ...data.map((row) =>
              headers
                .map((header) => `"${String(row[header]).replace(/"/g, '""')}"`)
                .join(',')
            ),
          ].join('\n');

          // BOM 추가 (한글 깨짐 방지)
          const BOM = '\uFEFF';
          const blob = new Blob([BOM + csvContent], {
            type: 'text/csv;charset=utf-8;',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `단어목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log(`${downloadType} CSV 다운로드 완료`);
        } catch (error) {
          console.error('CSV 파일 생성 실패:', error);
        }
      };

      // 작업단어 표시 여부 감시
      watch(isWordJobVisible, async (value) => {
        const researchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          includeJobWord: value,
          jobTypeCode: 'STD',
          query: searchInput.value,
          sort: getSortQuery(),
        };
        await fetchData(researchQuery);
      });

      // 작업 취소 감지
      watch(
        () => isWordJobCancel.value,
        async (value) => {
          console.log('isTermJobCancel ====: ', value);

          const data = selectedWordData.value;

          const selectedRow = document.querySelectorAll(
            '[class~="ag-row-selected"]'
          );
          // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
          selectedRow.forEach((node) => {
            node.classList.remove('ag-row-selected');
          });

          // 첫 행 select 효과
          const nodesWithRowId0 = document.querySelector(
            `[row-id="${data.id}"]`
          );
          // .ag-row-selected 클래스를 추가합니다.
          nodesWithRowId0.classList.add('ag-row-selected');
          nodesWithRowId0.classList.add('ag-row-focus');
          nodesWithRowId0.setAttribute('aria-selected', true);
          if (data) {
            // 사전등록 최초 신규등록 상태 이므로 emit 주석
            console.log('firstRowData : ', data);

            if (data.wordSourceCode === 'JOB') {
              const wordDetailsQuery = {
                instituteId: data.instituteId,
                dictionaryId: useDctnryId,
                jobWordId: data.jobWordId,
              };
              const termDetailsDataInfo = await getWordJobDetailsV2(
                wordDetailsQuery
              );
              // null 값으로 중복 데이터 초기화
              setWordJobUpdateData(null);
              setWordJobUpdateData(termDetailsDataInfo.data);
            } else {
              console.log('data.wordTypeName ===', data.wordTypeName);

              const wordDetailsQuery = {
                instituteId: data.instituteId,
                dictionaryId: useDctnryId,
                wordName: data.wordName.name,
                wordAbbreviationName: extractBracketData(
                  data.wordAbbreviationName
                ),
                wordTypeCode: data.wordTypeName,
              };

              const termDetailsDataInfo = await getWordDetailsV2(
                wordDetailsQuery
              );
              // null 값으로 중복 데이터 초기화
              setWordJobData(null);
              setWordJobData(termDetailsDataInfo.data);
            }
          }
          // 초기값으로 설정
          setIsWordJobCancel(false);
        }
      );

      function extractBracketData(input) {
        // 입력값이 문자열이 아니면 null 반환
        if (typeof input !== 'string') {
          return null;
        }

        // 정규식을 사용하여 대괄호 안의 내용 추출
        const regex = /\[(.*?)\]/;
        const match = input.match(regex);

        // 매치된 결과가 있으면 첫 번째 그룹(대괄호 안의 내용) 반환
        if (match && match[1]) {
          return match[1];
        } else {
          return input;
        }
      }

      onActivated(() => {
        nextTick(() => {
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        });
      });

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
        columnDefs, // 단어 그리드 default 컬럼
        onSearchRemove, // 필터 및 정렬 삭제
        searchInput,
        getSortQuery,
        setWordJobData,
        getWordJobData,
        setIsWordJobUpdate,
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        handleBindQuery,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        handleChangeSearchType,
        gridName,
        setWordJobUpdateData,
        selectedWordData,
        extractBracketData,
        handleExcelDownload,
      };
    },
  };
</script>
