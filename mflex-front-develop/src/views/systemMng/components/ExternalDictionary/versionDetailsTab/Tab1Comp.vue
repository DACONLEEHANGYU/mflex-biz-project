<template>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap term-gird">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            ref="gridSearchComponent"
            :resultCount="resultCount"
            :modelValue="termQuery.query"
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
    reactive,
    ref,
    nextTick,
    watch,
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
  import { getSearchCommonTerm } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { useSpinnerStore } from '@/stores/spinner.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
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

        // .term-gird 내에서만 선택 효과 적용
        const termGrid = document.querySelector('.term-gird');

        if (termGrid) {
          // term-gird 내의 선택된 모든 요소에서 ag-row-selected 클래스를 제거
          const selectedRows = termGrid.querySelectorAll(
            '[class~="ag-row-selected"]'
          );
          selectedRows.forEach((node) => {
            node.classList.remove('ag-row-selected');
            node.classList.remove('ag-row-focus');
            node.removeAttribute('aria-selected');
          });

          // term-gird 내에서 클릭된 행을 선택 상태로 설정
          const clickNode = value.id;
          const clickedNode = termGrid.querySelector(`[row-id="${clickNode}"]`);

          if (clickedNode) {
            clickedNode.classList.add('ag-row-selected');
            clickedNode.classList.add('ag-row-focus');
            clickedNode.setAttribute('aria-selected', 'true');
          }
        }

        this.$emit('row-selected', value);
        // this.setTermViewSelectData(value);
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
          this.termQuery.query = llmAnswer.data.where;
          this.searchInput = value;

          await this.updateGridData(this.termQuery);
        } else {
          const transformedQuery = transformQuery(value);

          const researchQuery = {
            dictionaryId: this.externalDictionaryVersion.dictionaryId,
            versionId: this.externalDictionaryVersion.versionId,
            query: transformedQuery,
            sort: this.getSortQuery(),
          };

          this.termQuery.query = transformedQuery;

          console.log('termQuery.query ========', this.termQuery.query);
          this.rowData.value = [];
          const termResearchResult = await getSearchCommonTerm(researchQuery);
          console.log('termResearchResult : ', termResearchResult);

          this.serarchDataBinding(termResearchResult);
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
      console.log('term beforeMount  ========================');
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

      const gridApi = ref(null);

      // 사전조회 사전표시 범위 상태
      const { termDictionarySearchCode } = storeToRefs(
        useDictionarySearchStore()
      );
      const { setTermViewSelectData } = useDictionarySearchStore();

      const { externalDictionaryVersion, fileUploadState } = storeToRefs(
        useExternalDictionaryStore()
      );
      const { setFileUploadState } = useExternalDictionaryStore();

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

      const tab1GridId = ref('MFGRD400');
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
          TRM_NO: 'termNo',
          FRST_ENACT_CYCL: 'enactCycle',
          TRM_NM: 'termName',
          TRM_EXPLN: 'termExplain',
          TRM_EABBR_NM: 'termAbbreviationName',
          DMN_NM: 'domainName',
          DATA_PRM_VL: 'dataPermissionValue',
          STRG_FOMT_CN: 'storageFormatContent',
          EXPR_FOMT_CN: 'expressionFormatContent',
          PBADMS_STD_CD_NM: 'publicAdministrationStandardCodeName',
          JRSD_INST_NM: 'revisionDate',
          SYNYM_LIST: 'synonymList',
        };

        const specialConfig = {};

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();
          const config = specialConfig[fieldName] || {};

          return {
            cellClass:
              fieldName === 'termNo' || fieldName === 'enactCycle'
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
        console.log('termSearch beforeMount  ========================');

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
            uiStore.setGridColumnDefs('MFGRD400', columnDefs.value);
            // localStorage에 gridData json 파싱, MFGRD400에 대한 값 변경
            gridStorage.MFGRD400 = transformedData;
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
            await updateGridData(termQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId.value];
          console.log('columnDefs.value : ', columnDefs.value);
          // 모든 설정이 완료된 후 용어 조회 실행
          await updateGridData(termQuery);
        }
      });

      const resultCount = ref({
        count: '',
        total: '',
      });

      // 용어 사전 데이터 조회 쿼리 객체
      const termQuery = reactive({
        dictionaryId: useDctnryId,
        domainName: '',
        termName: '',
        termAbbreviationName: '',
        termDictionaryId: '',
        query: '',
        sort: '',
      });

      // 데이터 조회 결과값 바인딩 함수
      const getTermRowData = (getTermSearchResult) => {
        const termGridData = [];

        try {
          console.log('termRowData ===================', getTermSearchResult);

          const terms = getTermSearchResult.items;
          resultCount.value.count = Number(getTermSearchResult.searchCount);
          resultCount.value.total = Number(getTermSearchResult.totalCount);

          for (let t = 0; t < terms.length; t++) {
            termGridData.push({
              id: t,
              no: t + 1,
              termNo: terms[t].termNo,
              dictionaryId: terms[t].dictionaryId,
              dataPermissionValue: terms[t].dataPermissionValue,
              dataUnitName: terms[t].dataUnitName,
              domainName: terms[t].domainName,
              enactCycle: terms[t].enactCycle,
              expressionFormatContent: terms[t].expressionFormatContent,
              jurisdictionInstitutionName: terms[t].jurisdictionInstitutionName,
              publicAdministrationStandardCodeName:
                terms[t].publicAdministrationStandardCodeName,
              revisionContent: terms[t].revisionContent,
              revisionCycle: terms[t].revisionCycle,
              storageFormatContent: terms[t].storageFormatContent,
              synonymList: terms[t].synonymList,
              termAbbreviationName: terms[t].termAbbreviationName,
              termExplain: terms[t].termExplain,
              termName: terms[t].termName,
              updateDateTime: terms[t].updateDateTime,
              updaterId: terms[t].updaterId,
              updaterName: terms[t].updaterName,
              versionId: terms[t].versionId,
            });
          }

          console.log('termGridData ===================', termGridData);

          return termGridData;

          // 조회 결과
        } catch (error) {
          console.error(error);
        }
      };

      const currentRowIndex = ref(0);

      const updateGridData = async (termQuery) => {
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

        console.log('externalDictionaryVersion : ', externalDictionaryVersion);

        if (
          externalDictionaryVersion.value.versionId === null ||
          externalDictionaryVersion.value.versionId === undefined
        ) {
          return;
        }

        const termResearchQuery = {
          dictionaryId: externalDictionaryVersion.value.dictionaryId,
          versionId: externalDictionaryVersion.value.versionId,
          query: termQuery.query,
          sort: sortQuery,
        };

        console.log('termResearchQuery : ', termResearchQuery);

        console.log('updateGridData 실행여부 확인 ======================');
        const getTermSearchResult = await getSearchCommonTerm(
          termResearchQuery
        );

        console.log('getTermSearchResult : ', getTermSearchResult);

        const initTermRowData = getTermRowData(getTermSearchResult);

        rowData.value = initTermRowData;
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

            const termResearchQuery = {
              dictionaryId: externalDictionaryVersion.value.dictionaryId,
              versionId: externalDictionaryVersion.value.versionId,
              lastItem: {
                dictionaryId: lastItem.dictionaryId,
                versionId: lastItem.versionId,
                termNo: lastItem.termNo,
                enactCycle: lastItem.enactCycle,
                termName: lastItem.termName,
                termAbbreviationName: lastItem.termAbbreviationName,
                domainName: lastItem.domainName,
                termExplain: lastItem.termExplain,
                dataUnitName: lastItem.dataUnitName,
                dataPermissionValue: lastItem.dataPermissionValue,
                storageFormatContent: lastItem.storageFormatContent,
                expressionFormatContent: lastItem.expressionFormatContent,
                publicAdministrationStandardCodeName:
                  lastItem.publicAdministrationStandardCodeName,
                jurisdictionInstitutionName:
                  lastItem.jurisdictionInstitutionName,
                synonymList: lastItem.synonymList,
                revisionContent: lastItem.revisionContent,
                revisionCycle: lastItem.revisionCycle,
                updaterId: lastItem.updaterId,
                updaterName: lastItem.updaterName,
                updateDateTime: lastItem.updateDateTime,
              },
              query: termQuery.query,
              sort: sortQuery,
            };

            addGridRowData(termResearchQuery);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // 용어 그리드 데이터 추가 함수
      const addGridRowData = async (termResearchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          // 인덱스로 핀별하므로 길이에서 -1
          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          console.log('termResearchQuery ===', termResearchQuery);

          const reLoadTermData = await getSearchCommonTerm(termResearchQuery);

          const terms = reLoadTermData.items;

          const newGridData = [];

          for (let n = 0; n < terms.length; n++) {
            newGridData.push({
              id: oldGridData.length + n,
              no: oldGridData.length + n + 1,
              termNo: terms[n].termNo,
              dictionaryId: terms[n].dictionaryId,
              dataPermissionValue: terms[n].dataPermissionValue,
              dataUnitName: terms[n].dataUnitName,
              domainName: terms[n].domainName,
              enactCycle: terms[n].enactCycle,
              expressionFormatContent: terms[n].expressionFormatContent,
              jurisdictionInstitutionName: terms[n].jurisdictionInstitutionName,
              publicAdministrationStandardCodeName:
                terms[n].publicAdministrationStandardCodeName,
              revisionContent: terms[n].revisionContent,
              revisionCycle: terms[n].revisionCycle,
              storageFormatContent: terms[n].storageFormatContent,
              synonymList: terms[n].synonymList,
              termAbbreviationName: terms[n].termAbbreviationName,
              termExplain: terms[n].termExplain,
              termName: terms[n].termName,
              updateDateTime: terms[n].updateDateTime,
              updaterId: terms[n].updaterId,
              updaterName: terms[n].updaterName,
              versionId: terms[n].versionId,
            });
          }
          // 재조회 후 rowData에 할당.
          rowData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(rowData.value.length);

          const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
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
        console.log('term search onActivated ========================');
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

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            dictionaryId: externalDictionaryVersion.value.dictionaryId,
            versionId: externalDictionaryVersion.value.versionId,
            query: termQuery.query,
            sort: '',
          };

          const termSortData = await getSearchCommonTerm(researchQuery);

          // 정렬 조회결과 바인딩 및 rowData 할당
          const sortTermGridData = getTermRowData(termSortData);
          rowData.value = sortTermGridData;
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
            query: termQuery.query,
            sort: sortQuery.value,
          };

          const termSortData = await getSearchCommonTerm(researchQuery);
          const sortTermGridData = getTermRowData(termSortData);

          rowData.value = sortTermGridData;
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

            // else if (colDef.field === 'rvsnDt') {
            //   valueFormatter = (params) => {
            //     const value = params.value;
            //     if (value && value.length === 8) {
            //       return `${value.substring(0, 4)}-${value.substring(
            //         4,
            //         6
            //       )}-${value.substring(6)}`;
            //     }
            //     return value;
            //   };
            // }

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
            };
          })
          .filter((colDef) => colDef != null);

        //columnFcDefs.value = newColumnFcDefs; */

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD400에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD400 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD400', newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD400) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD400;

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
      const serarchDataBinding = (termResearchResultData) => {
        console.log(
          'serarchDataBinding - termResearchResultData : ',
          termResearchResultData
        );
        resultCount.value.count = Number(termResearchResultData.searchCount);
        resultCount.value.total = Number(termResearchResultData.totalCount);

        const termSearchGridData = [];
        const terms = termResearchResultData.items;

        for (let t = 0; t < terms.length; t++) {
          termSearchGridData.push({
            id: t,
            no: t + 1,
            termNo: terms[t].termNo,
            dictionaryId: terms[t].dictionaryId,
            dataUnitName: terms[t].dataUnitName,
            domainName: terms[t].domainName,
            enactCycle: terms[t].enactCycle,
            expressionFormatContent: terms[t].expressionFormatContent,
            jurisdictionInstitutionName: terms[t].jurisdictionInstitutionName,
            publicAdministrationStandardCodeName:
              terms[t].publicAdministrationStandardCodeName,
            revisionContent: terms[t].revisionContent,
            revisionCycle: terms[t].revisionCycle,
            storageFormatContent: terms[t].storageFormatContent,
            dataPermissionValue: terms[t].dataPermissionValue,
            synonymList: terms[t].synonymList,
            termAbbreviationName: terms[t].termAbbreviationName,
            termExplain: terms[t].termExplain,
            termName: terms[t].termName,
          });
        }

        rowData.value = termSearchGridData;

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
              // setTermViewSelectData(firstRowData.data);
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
              setTermViewSelectData(firstRowData.data);
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

          const termFilterData = await getSearchCommonTerm(researchQuery);
          console.log('termFilterData =================== : ', termFilterData);

          // if (termFilterData.status != 200) {
          //   resultCount.value.count = 0;
          //   resultCount.value.total = 0;
          //   rowData.value = [];
          //   emit('row-selected', null);
          //   // setTermViewSelectData(null);
          //   return;
          // }
          const filterSearchData = getTermRowData(termFilterData);

          termQuery.query = filterSet.searchQuery;

          console.log('filterSearchData : ', filterSearchData);
          rowData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD400 : ', gridStorage.MFGRD400);
          columnDefs.value = gridStorage.MFGRD400;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD400);
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

        uiStore.setGridColumnDefs('MFGRD400', columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // 필터 초기화 시 검색 쿼리 초기화 추가 24/06/14
        termQuery.query = '';

        await updateGridData(termQuery);
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
        termQuery.query = llmAnswer.where;

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          tab1GridId.value,
          gridApi
        );

        console.log('handleBindQuery-termQuery : ', termQuery);

        await updateGridData(termQuery);
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[tab1GridId.value] : ',
          gridStorage[tab1GridId.value]
        );

        const fieldMapping = {
          termNo: 'TRM_NO',
          enactCycle: 'FRST_ENACT_CYCL',
          termName: 'TRM_NM',
          termExplain: 'TRM_EXPLN',
          termAbbreviationName: 'TRM_EABBR_NM',
          domainName: 'DMN_NM',
          dataPermissionValue: 'DATA_PRM_VL',
          storageFormatContent: 'STRG_FOMT_CN',
          expressionFormatContent: 'EXPR_FOMT_CN',
          publicAdministrationStandardCodeName: 'PBADMS_STD_CD_NM',
          jurisdictionInstitutionName: 'JRSD_INST_NM',
          synonymList: 'SYNYM_LIST',
          revisionDate: 'UPD_DTM',
          revisionContent: 'RVSN_CN',
          revisionCycle: 'RVSN_CYCL',
          updaterId: 'UPDUSR_ID',
          updaterName: 'UPDUSR_NM',
          updateDateTime: 'UPD_DTM',
          dataUnitName: 'DATA_UNIT_NM',
          dictionaryId: 'DCTNRY_ID',
          versionId: 'VERSION_ID',
        };
        const newGridStting = columnDefs.value.map((item, index) => {
          const articleName = fieldMapping[item.field];

          //     "gridArticleName": "UPD_DTM",
          // "gridArticleKoreanName": "최종수정일시",
          // "articlePositionOrder": 1,
          // "articleColumnWidth": 150,
          // "articleDisplayYn": false,
          // "articleFixedCode": null,
          // "articleDataSortYn": true,
          // "articleDataSortOrder": null,
          // "articleDataSortCode": null

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
        updateGridData(termQuery);
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
          termQuery.dictionaryId = newVal.dictionaryId;
          termQuery.versionId = newVal.versionId;
          await updateGridData(termQuery);
        }
      });

      watch(fileUploadState, (newVal) => {
        console.log('fileUploadState : ', newVal);
        if (newVal) {
          updateGridData(termQuery);
          setFileUploadState(false);
        }
      });

      onActivated(() => {
        console.log('termSearch onActivated ========================');
        // updateGridData(termQuery);
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
        termQuery,
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
        setTermViewSelectData,
        termDictionarySearchCode,
        externalDictionaryVersion,
      };
    },
  };
</script>
