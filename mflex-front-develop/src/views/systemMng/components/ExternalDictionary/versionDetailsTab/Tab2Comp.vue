<template>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap word-grid">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            ref="gridSearchComponent"
            :resultCount="resultCount"
            :modelValue="wordQuery.query"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            @save="onSaveGridSettingWindow"
            @search-type="handleChangeSearchType"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onSearchEnter"
            @remove="onDeleteDctnrySrchWrdGridUserStng"
            @filter-window-closed="onFilterWindowClosed"
            @column-state-changed="handleColumnStateChanged"
          />
        </div>
      </div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          :resultCount="resultCount"
          rowSelection="single"
          @rowDoubleClicked="onRowDoubleClicked"
          @rowClicked="onRowClicked"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @column-state-changed="handleColumnStateChanged"
          @gridApi="handleSetGridApi"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
      <AppDialog
        v-model:view="confirmDeleteDctnrySrchTab2State.view"
        :title="confirmDeleteDctnrySrchTab2State.title"
        :message="confirmDeleteDctnrySrchTab2State.message"
        @confirm="onSearchRemove"
      />
      <AppDialog
        v-model:view="saveGridSettingView.view"
        :title="saveGridSettingView.title"
        :message="saveGridSettingView.message"
        @confirm="onSetUserGridSetting"
      />
    </div>
  </div>

  <AppWindow
    :view="chatbotWindowView"
    :moveState="true"
    @close="onCloseChatbotWindow"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="tab1GridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    watch,
    ref,
    nextTick,
    reactive,
    watchEffect,
    onBeforeMount,
    onActivated,
  } from 'vue';

  import { useUiStore } from '@/stores/ui';

  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import { getSearchCommonWord } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { useSpinnerStore } from '@/stores/spinner.js';

  import { useExternalDictionaryStore } from '@/stores/externalDictionary';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
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
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;

        const wordGrid = document.querySelector('.word-grid');

        if (wordGrid) {
          const selectedRows = wordGrid.querySelectorAll(
            '[class~="ag-row-selected"]'
          );
          selectedRows.forEach((node) => {
            node.classList.remove('ag-row-selected');
            node.classList.remove('ag-row-focus');
            node.removeAttribute('aria-selected');
          });

          // term-gird 내에서 클릭된 행을 선택 상태로 설정
          const clickNode = value.id;
          const clickedNode = wordGrid.querySelector(`[row-id="${clickNode}"]`);

          if (clickedNode) {
            clickedNode.classList.add('ag-row-selected');
            clickedNode.classList.add('ag-row-focus');
            clickedNode.setAttribute('aria-selected', 'true');
          }
        }

        this.$emit('row-selected', value);
      },
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);

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

        if (this.searchType === 'natural-query' && value !== '') {
          const searhInfo = {
            gridId: this.tab1GridId,
            query: value,
          };
          const llmAnswer = await getCreateQuery(searhInfo);

          // 컬럼 업데이트
          await this.columnDefsUpdate(
            llmAnswer.data.sort,
            this.columnDefs,
            this.tab1GridId,
            this.gridApi
          );

          // 쿼리 바인딩
          this.wordQuery.query = llmAnswer.data.where;
          this.searchInput = value;

          await this.updateGridData(this.wordQuery);
        } else {
          const transformedQuery = transformQuery(value);

          const researchQuery = {
            dictionaryId: this.externalDictionaryVersion.dictionaryId,
            versionId: this.externalDictionaryVersion.versionId,
            query: transformedQuery,
            sort: this.getSortQuery(),
          };

          this.wordQuery.query = transformedQuery;

          console.log('wordQuery.query ========', this.wordQuery.query);
          this.rowData.value = [];
          const wordResearchResult = await getSearchCommonWord(researchQuery);

          this.serarchDataBinding(wordResearchResult);
        }
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
      const { userStngInfo } = storeToRefs(authStore);
      const rowData = reactive({});
      const newSetColumnDefs = reactive([]);
      const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

      const { setSpinnerStatus } = useSpinnerStore();

      const { externalDictionaryVersion, fileUploadState } = storeToRefs(
        useExternalDictionaryStore()
      );
      const { setFileUploadState } = useExternalDictionaryStore();

      const gridApi = ref(null);

      // AG 그리드가 생성될 때 gridApi 에 params 를 할당
      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const searchType = ref('query');
      const searchInput = ref('');

      const handleChangeSearchType = (searchTypeData) => {
        console.log('handleChangeSearchType : ', searchTypeData);
        searchType.value = searchTypeData;
      };

      const tab1GridId = ref('MFGRD410');
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
        scrnId: '',
      });

      //정렬 쿼리
      const sortStateQuery = ref('');

      const columnDefs = ref([]);

      // 데이터 변환 함수
      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          WRD_NM: 'wordName',
          WRD_EABBR_NM: 'wordAbbreviationName',
          WRD_ENG_NM: 'wordEnglishName',
          FOMT_WRD_YN: 'formatWordYn',
          DMN_CLS_NM: 'domainClassName',
          WRD_EXPLN: 'wordExplain',
          SYNYM_LIST: 'synonymList',
          FRBWRD_LIST: 'prohibitList',
          FRST_ENACT_CYCL: 'enactCycle',
          WRD_NO: 'wordNo',
        };

        const specialConfig = {};

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();
          const config = specialConfig[fieldName] || {};

          return {
            cellClass:
              fieldName === 'wordNo' ||
              fieldName === 'enactCycle' ||
              fieldName === 'formatWordYn'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: item.articleDisplayYn === true ? false : true,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            sortable: item.articleDataSortYn,
            suppressSorting: !item.articleDataSortYn,
            width: item.articleColumnWidth,
          };
        });
      };

      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(tab1GridId.value);
          const transformedData = await transformGridData(userGridData);
          console.log('Transformed Grid Data:', transformedData);
          return transformedData; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      onBeforeMount(async () => {
        console.log('wordSearch beforeMount  ========================');

        // 재 렌더링 시 그리드 정보가 있는 경우 메모리의 그리드 정보 사용
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[tab1GridId.value]) {
          console.log(
            'gridStorage[tab1GridId.value] : ',
            gridStorage[tab1GridId.value]
          );

          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD410', columnDefs.value);
            // localStorage에 gridData json 파싱, MFGRD410에 대한 값 변경
            gridStorage.MFGRD410 = transformedData;
            saveGridInfoToStorage(gridStorage);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              columnDefs.value
            );

            // 모든 설정이 완료된 후 용어 조회 실행
            await updateGridData(wordQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId.value];
          console.log('columnDefs.value : ', columnDefs.value);
          // 모든 설정이 완료된 후 용어 조회 실행
          await updateGridData(wordQuery);
        }
      });

      const resultCount = ref({
        count: '',
        total: '',
      });

      // 용어 사전 데이터 조회 쿼리 객체
      const wordQuery = reactive({
        dictionaryId: useDctnryId,
        domainName: '',
        wordName: '',
        wordAbbreviationName: '',
        wordDictionaryId: '',
        query: '',
        sort: '',
      });

      // 데이터 조회 결과값 바인딩 함수
      const getWordRowData = (getWordSearchResult) => {
        const wordGridData = [];

        try {
          console.log('wordRowData ===================', getWordSearchResult);

          const words = getWordSearchResult.items;
          resultCount.value.count = Number(getWordSearchResult.searchCount);
          resultCount.value.total = Number(getWordSearchResult.totalCount);

          for (let t = 0; t < words.length; t++) {
            wordGridData.push({
              id: t,
              no: t + 1,
              wordNo: words[t].wordNo,
              enactCycle: words[t].enactCycle,
              wordName: words[t].wordName,
              wordAbbreviationName: words[t].wordAbbreviationName,
              wordEnglishName: words[t].wordEnglishName,
              formatWordYn: words[t].formatWordYn,
              domainClassName: words[t].domainClassName,
              wordExplain: words[t].wordExplain,
              synonymList: words[t].synonymList,
              prohibitList: words[t].prohibitList,
            });
          }
          console.log('wordGridData ===================', wordGridData);

          return wordGridData;

          // 조회 결과
        } catch (error) {
          console.error(error);
        }
      };

      const currentRowIndex = ref(0);

      const updateGridData = async (wordQuery) => {
        console.log('updateGridData  실행');

        console.log('updateGridData - columnDefs.value : ', columnDefs.value);

        // 정렬이 적용된 모든 열을 찾습니다.
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

        console.log('sortQuery : ', sortQuery);
        const wordResearchQuery = {
          dictionaryId: externalDictionaryVersion.value.dictionaryId,
          versionId: externalDictionaryVersion.value.versionId,
          query: wordQuery.query,
          sort: sortQuery,
        };

        console.log('updateGridData 실행여부 확인 ======================');
        const getWordSearchResult = await getSearchCommonWord(
          wordResearchQuery
        );
        const initWordRowData = getWordRowData(getWordSearchResult);

        rowData.value = initWordRowData;
      };

      // 그리드 스크롤 이벤트 함수
      const handleScrollChanged = (endScrollStaus) => {
        try {
          if (endScrollStaus === 'Y' && rowData.value != null) {
            const lastItem =
              rowData.value.length > 0
                ? rowData.value[rowData.value.length - 1]
                : null;
            console.log('lastItem ===', lastItem);

            const sortedColumns = columnDefs.value
              .filter((col) => col.sortIndex !== null && col.sort !== null)
              .sort((a, b) => a.sortIndex - b.sortIndex)
              .map(
                (col) =>
                  `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
              );

            const sortQuery = sortedColumns.join(', ');

            const wordResearchQuery = {
              dictionaryId: externalDictionaryVersion.value.dictionaryId,
              versionId: externalDictionaryVersion.value.versionId,
              lastItem: {
                wordNo: lastItem.wordNo,
                enactCycle: lastItem.enactCycle,
                wordName: lastItem.wordName,
                wordAbbreviationName: lastItem.wordAbbreviationName,
                wordEnglishName: lastItem.wordEnglishName,
                formatWordYn: lastItem.formatWordYn,
                domainClassName: lastItem.domainClassName,
                wordExplain: lastItem.wordExplain,
                synonymList: lastItem.synonymList,
                prohibitList: lastItem.prohibitList,
              },
              query: wordQuery.query,
              sort: sortQuery,
            };

            addGridRowData(wordResearchQuery);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // 용어 그리드 데이터 추가 함수
      const addGridRowData = async (wordResearchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          // 인덱스로 핀별하므로 길이에서 -1
          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          console.log('wordResearchQuery ===', wordResearchQuery);

          const reLoadWordData = await getSearchCommonWord(wordResearchQuery);

          const words = reLoadWordData.items;

          const newGridData = [];

          for (let n = 0; n < words.length; n++) {
            newGridData.push({
              id: oldGridData.length + n,
              no: oldGridData.length + n + 1,
              wordNo: words[n].wordNo,
              enactCycle: words[n].enactCycle,
              wordName: words[n].wordName,
              wordAbbreviationName: words[n].wordAbbreviationName,
              wordEnglishName: words[n].wordEnglishName,
              formatWordYn: words[n].formatWordYn,
              domainClassName: words[n].domainClassName,
              wordExplain: words[n].wordExplain,
              synonymList: words[n].synonymList,
              prohibitList: words[n].prohibitList,
            });
          }
          // 재조회 후 rowData에 할당.
          rowData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(rowData.value.length);

          const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
          console.log(
            'lastVisibleRowIndex =================',
            lastVisibleRowIndex
          );
          currentRowIndex.value = lastVisibleRowIndex;
          // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        } catch (error) {
          console.error(error);
        }
      };

      const agGrid = ref(null);

      // keep-alive로 살아있을때,
      onActivated(() => {
        console.log('word search onActivated ========================');
      });

      // 정렬 핸들러
      const handleSortChanged = async (newSortedState) => {
        console.log('newSortedState : ', newSortedState);
        const sortQuery = ref('');
        const sortState = reactive({});

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

        console.log('Sorted state:', sortState.value);
        console.log('rowData.value:', rowData.value);
        console.log('rowData.value.length:', rowData.value.length);

        const lastItem =
          rowData.value.length > 0
            ? rowData.value[rowData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            dictionaryId: externalDictionaryVersion.value.dictionaryId,
            versionId: externalDictionaryVersion.value.versionId,
            query: wordQuery.query,
            sort: '',
          };

          const wordSortData = await getSearchCommonWord(researchQuery);

          // 정렬 조회결과 바인딩 및 rowData 할당
          const sortwordGridData = getWordRowData(wordSortData);
          rowData.value = sortwordGridData;
        } else {
          // 단일 정렬 조건 및 순서 설정 (기존 코드)
          /* sortQuery.value = `${sortState.value[0].headerName} ${sortState.value[0].sort}`;
        sortStateQuery.value = sortQuery.value; */

          // 정렬 순서 배열 생성
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );

          // 배열의 원소를 문자열로 병합
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          const researchQuery = {
            dictionaryId: externalDictionaryVersion.value.dictionaryId,
            versionId: externalDictionaryVersion.value.versionId,
            query: wordQuery.query,
            sort: sortQuery.value,
          };

          const wordSortData = await getSearchCommonWord(researchQuery);
          const sortwordGridData = getWordRowData(wordSortData);

          rowData.value = sortwordGridData;
        }
        firstRowSelectedEvent();
      };

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      function handleColumnStateChanged(newColumnState) {
        console.log('컬럼 이동 핸들러 동작 ====');

        console.log('newColumnState : ', newColumnState);

        // 새 컬럼 헤드 정의
        const newColumnFcDefs = newColumnState
          .map((colState) => {
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

            console.log('colDef.field : ', colDef.field);

            return {
              ...colDef,
              width: colState.width,
              minWidth: colState.minWidth,
              hide: colState.hide,
              pinned: colState.pinned,
              sort: colState.sort,
              sortIndex: colState.sortIndex,
              suppressSorting: true,
              comparator: () => 0,
              valueFormatter: valueFormatter,
            };
          })
          .filter((colDef) => colDef != null);

        //columnFcDefs.value = newColumnFcDefs; */

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD410에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD410 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD410', newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD410) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD410;

        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          // 필드 값에 따라 조건부로 valueFormatter 설정

          return {
            headerName: col.headerName,
            field: col.field,
            hide: col.hide,
            pinned: col.pinned,
            sortable: col.sortable,
            cellClass: col.cellClass,
            width: col.width,
            sort: col.sort,
            sortIndex: col.sortIndex,
            minWidth: col.minWidth,
            suppressSorting: true,
            comparator: () => 0,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });

        console.log('watchEffect 정상동작');
      });

      // 용어 조회 ( 필터 리서치 )
      const serarchDataBinding = (wordResearchResultData) => {
        console.log('wordResearchResultData : ', wordResearchResultData);

        if (wordResearchResultData == null) {
          resultCount.value.count = 0;
          resultCount.value.total = 0;
          rowData.value = [];
          return;
        }

        resultCount.value.count = Number(wordResearchResultData.searchCount);
        resultCount.value.total = Number(wordResearchResultData.totalCount);

        const wordSearchGridData = [];
        const words = wordResearchResultData.items;

        for (let t = 0; t < words.length; t++) {
          wordSearchGridData.push({
            id: t,
            no: t + 1,
            wordNo: words[t].wordNo,
            enactCycle: words[t].enactCycle,
            wordName: words[t].wordName,
            wordAbbreviationName: words[t].wordAbbreviationName,
            wordEnglishName: words[t].wordEnglishName,
            formatWordYn: words[t].formatWordYn,
            domainClassName: words[t].domainClassName,
            wordExplain: words[t].wordExplain,
            synonymList: words[t].synonymList,
            prohibitList: words[t].prohibitList,
          });
        }

        rowData.value = wordSearchGridData;

        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            // 첫 행 select 효과
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            // .ag-row-selected 클래스를 추가합니다.
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
            if (firstRowData) {
              console.log('emit first-row-selected 실행 ====');
              //emit('first-row-selected', firstRowData);
              emit('row-selected', firstRowData);
            }
          });
        }
      };

      // 상단 row
      const firstRowSelectedEvent = () => {
        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            // 첫 행 select 효과
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            // .ag-row-selected 클래스를 추가합니다.
            if (nodesWithRowId0) {
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }

            if (firstRowData) {
              console.log('emit first-row-selected 실행 ====');
              //emit('first-row-selected', firstRowData);
              emit('row-selected', firstRowData);
            }
          });
        }
      };

      // 팝업 필터 저장 핸들러
      const onFilterWindowClosed = async (filterSet) => {
        // 필터 창이 닫힐 때 수행하고 싶은 로직
        console.log('필터 창이 닫혔습니다.');
        console.log('filterSet : ', filterSet);

        // 맞춤형 필터 설정이 있을 때
        if (filterSet) {
          // 정렬이 적용된 모든 열을 찾습니다.
          const sortedColumns = columnDefs.value
            .filter((col) => col.sortIndex !== null && col.sort !== null)
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .map(
              (col) =>
                `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
            );

          console.log('sortedColumns : ', sortedColumns);
          const sortQuery = sortedColumns.join(', ');
          console.log('sortQuery : ', sortQuery);

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
          console.log('filterSet.orderQuery : ', filterSet.orderQuery);
          const researchQuery = {
            dictionaryId: externalDictionaryVersion.value.dictionaryId,
            versionId: externalDictionaryVersion.value.versionId,
            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          const wordFilterData = await getSearchCommonWord(researchQuery);
          console.log('wordFilterData =================== : ', wordFilterData);

          const filterSearchData = getWordRowData(wordFilterData);

          wordQuery.query = filterSet.searchQuery;

          console.log('filterSearchData : ', filterSearchData);
          rowData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD410 : ', gridStorage.MFGRD410);
          columnDefs.value = gridStorage.MFGRD410;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD410);
        }
      };

      // 필터 초기화 confirm 팝업
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

        const gridDefaultData = await getGridDefaultData(tab1GridId.value);

        const transformGrid = await transformGridData(gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        // 그리드 기본값 사용자 세팅
        await setUserGridSetting(tab1GridId.value, gridDefaultData);

        columnDefs.value = transformGrid;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[tab1GridId.value] = transformGrid;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs('MFGRD410', columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // 필터 초기화 시 검색 쿼리 초기화 추가 24/06/14
        wordQuery.query = '';

        await updateGridData(wordQuery);
      };

      const getSortQuery = () => {
        // 정렬이 적용된 모든 열을 찾습니다.
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

        // 쿼리 바인딩하여 조회
        console.log('llmAnswer : ', llmAnswer);
        wordQuery.query = llmAnswer.where;

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          tab1GridId.value,
          gridApi
        );

        console.log('handleBindQuery-wordQuery : ', wordQuery);

        await updateGridData(wordQuery);
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[tab1GridId.value] : ',
          gridStorage[tab1GridId.value]
        );

        const fieldMapping = {
          wordName: 'WRD_NM',
          wordAbbreviationName: 'WRD_EABBR_NM',
          wordEnglishName: 'WRD_ENG_NM',
          formatWordYn: 'FOMT_WRD_YN',
          domainClassName: 'DMN_CLS_NM',
          wordExplain: 'WRD_EXPLN',
          synonymList: 'SYNYM_LIST',
          prohibitList: 'FRBWRD_LIST',
          enactCycle: 'FRST_ENACT_CYCL',
          wordNo: 'WRD_NO',
        };
        const newGridStting = columnDefs.value.map((item, index) => {
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

        console.log('newGridStting : ', newGridStting);

        await setUserGridSetting(tab1GridId.value, newGridStting);
        updateGridData(wordQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      watch(externalDictionaryVersion, async (newVal) => {
        console.log('externalDictionaryVersion : ', newVal);
        if (newVal) {
          wordQuery.dictionaryId = newVal.dictionaryId;
          wordQuery.versionId = newVal.versionId;
          await updateGridData(wordQuery);
        }
      });

      watch(fileUploadState, (newVal) => {
        console.log('fileUploadState : ', newVal);
        if (newVal) {
          updateGridData(wordQuery);
          setFileUploadState(false);
        }
      });

      return {
        agGrid,
        rowData,
        resultCount,
        useDctnryId,
        useMetaMngInstId,
        handleScrollChanged,
        handleColumnStateChanged,
        handleSortChanged, // 정렬 이벤트 핸들러
        serarchDataBinding,
        onFilterWindowClosed,
        gridInfoDefs, // 그리드 Info
        wordQuery,
        newSetColumnDefs,
        handleSetGridApi,
        onSearchRemove, // 필터 및 정렬 삭제
        confirmDeleteDctnrySrchTab2State,
        onDeleteDctnrySrchWrdGridUserStng,
        updateGridData,
        getSortQuery,
        tab1GridId,
        handleBindQuery,
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        onSetUserGridSetting,
        columnDefs,
        saveGridSettingView,
        onSaveGridSettingWindow,

        // searhType 변경
        handleChangeSearchType,
        searchType,
        columnDefsUpdate,
        gridApi,
        searchInput,
        externalDictionaryVersion,
      };
    },
  };
</script>
