<template>
  <div class="tab-inner">
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            :resultCount="resultCount"
            :modelValue="searchInput"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            :gridName="gridName"
            :isDictionayMngGrid="true"
            @search-type="handleChangeSearchType"
            @save="onSaveGridSettingWindow"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onSearchEnter"
            @remove="onDeleteDctnrySrchWrdGridUserStng"
            @filter-window-closed="onFilterWindowClosed"
            @excel-download="handleExcelDownload"
          />
        </div>
      </div>
      <div class="grid-list term-mng-top-grid">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="single"
          @rowDoubleClicked="onRowDoubleClicked"
          @body-scroll="handleScrollChanged"
          @rowClicked="onRowClicked"
          @column-state-changed="handleColumnStateChanged"
          @sort-changed="handleSortChanged"
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
<!-- <script type="module" src="@/utils/js/termManagement.js"></script> -->
<script>
  import {
    reactive,
    ref,
    onMounted,
    watchEffect,
    nextTick,
    inject,
    watch,
    onBeforeMount,
    onActivated,
    onDeactivated,
  } from 'vue';
  import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router';
  import { useUiStore } from '@/stores/ui';
  import TermJobTypeCellrenderer from '@/utils/TermJobTypeCellrenderer.js';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { storeToRefs } from 'pinia';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useAuthStore } from '@/stores/auth';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
    saveStepStateStorage,
    saveIncludeJobTerm,
  } from '@/utils/cookies';

  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  import {
    getTermListV2, // 용어 작업 목록 필터
    getTermDetailsV2, // 용어 작업 상세
    getTermJobDetailsV2, // 용어 작업 상세
    getMngTermDownload, // 관리 용어 다운로드
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';

  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  export default {
    components: {
      TypeCellRenderer,
      TermJobTypeCellrenderer,
      GridSearch,
      AppWindow,
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
      async onRowClicked(value) {
        this.setIsTermJobState(false);

        this.selectedTermData = value;
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

        console.log('onRowClicked', value);

        if (value.termSourceCode === 'MNG') {
          // const focusCell = document.querySelectorAll(
          //   '.term-job-grid [class~="ag-cell-focus"]'
          // );
          // // 선택된 모든 요소에서 ag-row-focus 클래스를 제거합니다.
          // focusCell.forEach((node) => {
          //   node.classList.remove('ag-cell-focus');
          // });

          this.termJobSelected = false;
          // this.$emit('row-selected', value);

          this.setIsTermJobUpdate(false);

          // 관리/작업용어 구분 값 변경
          this.setTermSourceCode(value.termSourceCode);

          const data = {
            instituteId: value.instituteId,
            dictionaryId: value.dictionaryId,
            termName: value.termName.name,
            termAbbreviationName: value.termEngAbbreviationName,
            domainName: value.domainName,
          };

          // const termDetailsDataInfo = await getTermDetailInfo(termBaseQuery);

          const termDetailsData = await getTermDetailsV2(data);
          console.log('termDetailsData : ', termDetailsData);

          nextTick(() => {
            this.setTermJobData(termDetailsData.data);
          });
        } else if (value.termSourceCode === 'JOB') {
          this.termJobSelected = false;

          // 관리/작업용어 구분 값 변경
          this.setTermSourceCode(value.termSourceCode);

          const data = {
            instituteId: value.instituteId,
            dictionaryId: value.dictionaryId,
            jobTermId: value.jobTermId,
          };

          const termDetailsData = await getTermJobDetailsV2(data);

          nextTick(() => {
            this.setTermJobUpdateData(termDetailsData.data);
          });
        }
      },
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);

        this.setIsTermJobState(false);

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

        console.log('this.searchType : ', this.searchType);

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

          // const termResearchQuery = {
          //   instituteId: this.useMetaMngInstId,
          //   dictionaryId: this.useDctnryId,
          //   includeJobTerm: this.isTermJobVisible,
          //   query: llmAnswer.data.where,
          //   sort: llmAnswer.data.sort,
          // };

          console.log('termQuery ========', this.termQuery);

          const list = await getTermListV2(this.termQuery);
          this.termDataBinding(list);

          // await this.updateGridData(this.termQuery);
        } else {
          const transformedQuery = transformQuery(value);

          const researchQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            includeJobTerm: this.isTermJobVisible,
            query: transformedQuery,
            sort: this.getSortQuery(),
            jobTypeCode: 'STD',
          };

          this.termQuery.query = transformedQuery;
          this.searchInput = transformedQuery;

          console.log('termQuery.query ========', this.termQuery.query);
          this.rowData.value = [];

          const list = await getTermListV2(researchQuery);
          this.termDataBinding(list);

          // let termResearchResult = await getResaerchTerm(researchQuery);
          // this.serarchDataBinding(termResearchResult);
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
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const agGrid = ref(null);
      const gridApi = ref(null);

      const dictionaryMngStore = useDictionaryMngStore();
      const { isTermJobApproval, isTermJobCancel, isTermJobVisible } =
        storeToRefs(dictionaryMngStore);

      const {
        setTermJobData,
        setIsTermJobUpdate,
        setIsTermJobApproval,
        setIsTermJobCancel,
        setTermSourceCode,
        setTermJobUpdateData,
        setIsTermJobState,
      } = dictionaryMngStore;

      const actualizingStore = useActualizingStore();
      const { setSelectTermData, setSelectTermJobData } =
        storeToRefs(actualizingStore);

      // gridApi 사용 handler
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

      const rowData = reactive({});

      const gridName = '용어';

      onBeforeRouteUpdate((to, from, next) => {
        console.log('라우트 변경 감지');
        // 데이터 초기화 및 재조회

        next();
      });

      onBeforeRouteLeave((to, from, next) => {
        console.log('라우트 변경 감지');
        // 데이터 초기화 및 재조회
        next();
      });

      // 선택 행 데이터터
      const selectedTermData = ref(null);

      // 현재 인덱스
      const currentRowIndex = ref(0);
      // gridRefresh 상태
      const gridRefreshState = inject('gridRefresh');

      // termJobSelected 상태
      const termJobSelected = inject('term-job-selected');

      //정렬 변경 여부
      const sortStateQuery = ref('');

      // GRID ID
      const tab1GridId = ref('MFGRD040');
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
        scrnId: '',
      });

      const columnDefs = ref([]);

      // 데이터 변환 함수
      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          DCTNRY_ID: 'dctnryId',
          NO: 'no',
          TRM_NM: 'termName',
          TRM_EABBR_NM: 'termEngAbbreviationName',
          TRM_ENG_NM: 'termEngName',
          TRM_TYPE_NM: 'termType',
          DMN_NM: 'domainName',
          CD_TYPE_NM: 'codeTypeName',
          REL_CD_NM: 'relatedCodeName',
          TRM_STD_YN_NM: 'termStandardYnName',
          REVISION_INFO: 'revisionDate',
          RVSN_DT: 'revisionDate',
          UPDR_INFO: 'lastChangeInfo',
          UPD_DTM: 'lastChangeDate',
        };

        const specialConfig = {
          termName: {
            cellRenderer: 'TermJobTypeCellRenderer',
            valueFormatter: '(params) => params.value',
          },
          // domainName: {
          //   cellRenderer: 'TypeCellRenderer',
          //   valueFormatter: '(params) => params.value',
          // },
          // relatedCodeName: {
          //   cellRenderer: 'TypeCellRenderer',
          //   valueFormatter: '(params) => params.value',
          // },
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();
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
              config.valueFormatter !== undefined
                ? config.valueFormatter
                : null,
            width: item.articleColumnWidth,
            cellStyle: (params) => {
              // 조건에 따라 취소선 적용
              if (params.data.termName.jobDivisionCode === 'D') {
                return { textDecoration: 'line-through', color: 'red' };
              } else if (params.data.termName.jobDivisionCode === 'C') {
                // 작업 신규등록
                return { color: 'blue' };
              } else if (params.data.termName.jobDivisionCode === 'U') {
                // 작업 변경등록
                return { color: 'green' };
              } else if (
                // 작업 폐기등록
                params.data.termName.jobDivisionCode === 'X' &&
                !params.data.discardYn
              ) {
                return { color: 'red' };
              } else if (
                // 작업 복구등록
                params.data.termName.jobDivisionCode === 'V' &&
                params.data.discardYn
              ) {
                return { textDecoration: 'line-through', color: 'green' };
              } else if (
                // 관리 폐기등록
                !params.data.termName.jobDivisionCode &&
                params.data.discardYn
              ) {
                return { textDecoration: 'line-through', color: 'red' };
              }
              return null;
            },
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

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        console.log(
          'gridStorage[tab1GridId.value] : ',
          gridStorage[tab1GridId.value]
        );
        if (!gridStorage[tab1GridId.value]) {
          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD040', columnDefs.value);
            gridStorage[tab1GridId.value] = transformedData;
            saveGridInfoToStorage(gridStorage);
            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              columnDefs.value
            );
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId.value];
        }

        termQuery.sort = getSortQuery();

        // 모든 설정이 완료된 후 용어 조회 실행
        // await updateGridData(termQuery);
      });

      // const initializeGridColumnDefs = () => {
      //   const termStoredColumnDefs = JSON.parse(getGridInfoFromStorage());
      //   if (termStoredColumnDefs && termStoredColumnDefs.MFGRD040) {
      //     uiStore.setGridColumnDefs('MFGRD040', termStoredColumnDefs.MFGRD040);
      //   }
      // };

      // initializeGridColumnDefs();

      // 용어 그리드 데이터 할당

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // 정렬(소팅) 정보 문자열을 반환하는 함수
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

      // 전역 TermQuery
      const termQuery = reactive({
        dictionaryId: useDctnryId,
        domainName: '',
        termName: '',
        termAbbreviationName: '',
        termDictionaryId: '',
        query: '',
        sort: getSortQuery(),
      });

      // 용어 그리드 데이터 조회 및 바인딩
      const updateGridData = async (termQuery) => {
        console.log('updateGridData  실행');

        // termQuery가 전달되는 경우
        if (termQuery != null) {
          // const getTermSearchResult = await getResaerchTerm(termQuery);
          // 데이터 바인딩
          // serarchDataBinding(getTermSearchResult);
          return;
        } else {
          const sortQuery = getSortQuery();
          const termResearchQuery = {
            dictionaryId: useDctnryId,
            query: '',
            sort: sortQuery,
          };

          console.log('updateGridData 실행여부 확인 ======================');
          // const getTermSearchResult = await getResaerchTerm(termResearchQuery);
          // 데이터 바인딩
          // serarchDataBinding(getTermSearchResult);
        }
      };

      //valueFormatter 함수 설정
      // 컬럼이 변경되면 JSON파일에서 읽어온 컬럼 정보에 그리드 설정에 맞게 컬럼 정보 재생성
      /*
      watchEffect >  cellRender 서버에서 가져오는 정보가 아니기 때문에 클라이언트에서 설정해줘야함.
      추후 전달받은 그리드 정보로 판별하여 cellRender 할당 필요
    */
      watchEffect(async () => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD040) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD040;

        console.log(
          'watchEffect - Grid 데이터 설정 전 : ',
          gridColumnDefs.value.MFGRD040
        );

        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          let cellStyle = null;
          // 필드 값에 따라 조건부로 valueFormatter 설정
          if (col.field === 'termName') {
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
            if (params.data.termName.jobDivisionCode === 'D') {
              return { textDecoration: 'line-through', color: 'red' };
            } else if (params.data.termName.jobDivisionCode === 'C') {
              return { color: 'blue' };
            } else if (params.data.termName.jobDivisionCode === 'U') {
              return { color: 'green' };
            } else if (
              params.data.termName.jobDivisionCode === 'X' &&
              !params.data.discardYn
            ) {
              // 작업 폐기등록
              return { color: 'red' };
            } else if (
              // 작업 복구등록
              params.data.termName.jobDivisionCode === 'V'
            ) {
              return { textDecoration: 'line-through', color: 'green' };
            } else if (
              !params.data.termName.jobDivisionCode &&
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
            sort: col.sort,
            sortIndex: col.sortIndex,
            minWidth: col.minWidth,
            suppressSorting: true,
            comparator: () => 0,
            cellStyle: cellStyle,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });

        console.log('watchEffect - Grid 데이터 설정 후 : ', columnDefs.value);

        console.log('watchEffect 정상동작');
      });

      // 용어 그리드 데이터 추가 함수
      const addGridRowData = async (termResearchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          const lastItem =
            rowData.value.length > 0
              ? rowData.value[rowData.value.length - 1]
              : null;

          console.log('termResearchQuery ===', termResearchQuery);

          const reLoadTermData = await getTermListV2(termResearchQuery);

          const terms = reLoadTermData.data.items;

          const newGridData = [];

          for (let i = 0; i < terms.length; i++) {
            newGridData.push({
              id: oldGridData.length + i,
              no: oldGridData.length + i + 1,
              instituteId: terms[i].instituteId,
              dictionaryId: terms[i].dictionaryId,
              termSourceCode: terms[i].termSourceCode,
              jobDivisionCode: terms[i].jobDivisionCode,
              jobDivisionName: terms[i].jobDivisionName,
              discardYn: terms[i].discardYn,
              jobTermId: terms[i].jobTermId,
              termName: {
                name: terms[i].termName,
                jobDivisionCode: terms[i].jobDivisionCode,
                discardYn: terms[i].discardYn,
              },
              termType: terms[i].termTypeName,
              termEngAbbreviationName: terms[i].termAbbreviationName,
              termStandardYnName: terms[i].termStandardYnName,
              domainName: terms[i].domainName,
              codeTypeName: terms[i].codeTypeName,
              relatedCodeName: terms[i].relatedCodeName,
              revisionDate: terms[i].revisionDate,
              lastChangeInfo: terms[i].updater,
              lastChangeDate: terms[i].updateDateTime,
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

      // 필터 종료 시 이벤트
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

          // const termFilterData = await getResaerchTerm(researchQuery);
          // serarchDataBinding(termFilterData);

          termQuery.query = filterSet.searchQuery;
          searchInput.value = filterSet.searchQuery;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD040 : ', gridStorage.MFGRD040);
          columnDefs.value = gridStorage.MFGRD040;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD040);
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

      const onSearchRemove = async () => {
        console.log('onSearchRemove');
        console.log('정렬 초기화');

        const gridDefaultData = await getGridDefaultData(tab1GridId.value);

        const transformGrid = await transformGridData(gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        // 그리드 기본값 사용자 세팅
        await setUserGridSetting(tab1GridId.value, gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        columnDefs.value = transformGrid;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[tab1GridId.value] = transformGrid;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(tab1GridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // 필터 초기화 시 검색 쿼리 초기화 추가 24/06/14
        termQuery.query = '';
        searchInput.value = '';

        await updateGridData(termQuery);
      };

      // 상단 row 선택
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
          });
        }
      };

      // 그리드 스크롤 이벤트 함수
      const handleScrollChanged = (endScrollStaus) => {
        console.log('endScrollStaus ===', endScrollStaus);
        try {
          if (endScrollStaus === 'Y' && rowData.value != null) {
            const lastItem =
              rowData.value.length > 0
                ? rowData.value[rowData.value.length - 1]
                : null;
            console.log('lastItem ===', lastItem);

            const termResearchQuery = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              includeJobTerm: isTermJobVisible.value,
              lastItem: {
                instituteId: useMetaMngInstId,
                dictionaryId: lastItem.dictionaryId,
                termName: lastItem.termName.name,
                termAbbreviationName: lastItem.termEngAbbreviationName,
                termStandardYnName: lastItem.termStandardYnName,
                termTypeName: lastItem.termType,
                domainName: lastItem.domainName,
                codeTypeName: lastItem.codeTypeName,
                relationCodeName: lastItem.relatedCodeName,
                revisionDate: lastItem.revisionDate,
                updater: lastItem.lastChangeInfo,
                updateDateTime: lastItem.lastChangeDate,
              },
              query: termQuery.query,
              sort: getSortQuery(),
              jobTypeCode: 'STD',
            };

            addGridRowData(termResearchQuery);
          }
        } catch (error) {
          console.log('lastItem x 에러 발생 ==');
          console.error(error);
        }
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

            // 필드 값에 따라 조건부로 valueFormatter 및 cellRenderer 설정
            if (colDef.field === 'termName') {
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
              cellRenderer:
                colDef.field === 'termName' ||
                colDef.field === 'domainName' ||
                colDef.field === 'relatedCodeName'
                  ? cellRenderer
                  : null,
              cellClass: colDef.cellClass,
              cellStyle: colDef.cellStyle,
            };
          })
          .filter((colDef) => colDef != null);

        //columnFcDefs.value = newColumnFcDefs; */

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD040에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD040 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD040', newColumnFcDefs);
      }

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

        const lastItem =
          rowData.value.length > 0
            ? rowData.value[rowData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            includeJobTerm: isTermJobVisible.value,
            query: termQuery.query,
            jobTypeCode: 'STD',
          };

          const termSortData = await getTermListV2(researchQuery);

          termDataBinding(termSortData);
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            includeJobTerm: isTermJobVisible.value,
            query: termQuery.query,
            sort: sortQuery.value,
            jobTypeCode: 'STD',
          };

          const termSortData = await getTermListV2(researchQuery);
          termDataBinding(termSortData);
        }

        firstRowSelectedEvent();
      };

      onMounted(async () => {
        console.log('onMounted ========================');

        const researchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          includeJobTerm: isTermJobVisible.value,
          sort: getSortQuery(),
          jobTypeCode: 'STD',
        };

        const response = await getTermListV2(researchQuery);

        console.log('response-termV2: ', response);
        termDataBinding(response);
        // updateGridData(termQuery);
        //initializeGridColumnDefs();
      });

      // 작업 그리드 선택 감시
      watch(termJobSelected, (value) => {
        console.log('termJobSelected : ', value);

        if (value == true) {
          const selectedRow = document.querySelectorAll(
            '[class~="ag-row-selected"]'
          );
          // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
          selectedRow.forEach((node) => {
            node.classList.remove('ag-row-selected');
          });
        }
      });

      // LeftComp => 용어 작업완료(승인) 상태 감시
      watch(
        () => isTermJobApproval.value,
        async (value) => {
          console.log('isTermJobApproval : ', value);
          if (value) {
            console.log('grid refresh =======');
            rowData.value = [];

            // 검색 쿼리 초기화
            termQuery.query = '';
            searchInput.value = '';
            // 데이터 조회 및 바인딩

            const researchQuery = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              includeJobTerm: isTermJobVisible.value,
              sort: getSortQuery(),
              jobTypeCode: 'STD',
            };

            const response = await getTermListV2(researchQuery);

            console.log('response-termV2: ', response);
            termDataBinding(response);
            // store 초기화
            setIsTermJobApproval(false);
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

        console.log('llmAnswer :', llmAnswer);
        console.log('handleBindQuery :', llmAnswer);
        termQuery.query = llmAnswer.where;
        searchInput.value = llmAnswer.where;

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          tab1GridId.value,
          gridApi
        );

        termQuery.query = llmAnswer.where;

        console.log('handleBindQuery : termQuery : ', termQuery);

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
          dctnryId: 'DCTNRY_ID',
          no: 'NO',
          termName: 'TRM_NM',
          termEngAbbreviationName: 'TRM_EABBR_NM',
          termStandardYnName: 'TRM_STD_YN_NM',
          termEngName: 'TRM_ENG_NM',
          termType: 'TRM_TYPE_NM',
          domainName: 'DMN_NM',
          codeTypeName: 'CD_TYPE_NM',
          relatedCodeName: 'REL_CD_NM',
          revisionDate: 'RVSN_DT',
          lastChangeInfo: 'UPDR_INFO',
          lastChangeDate: 'UPD_DTM',
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
            articleDisplayYn: item.hide,
            articleFixedCode: item.pinned,
            articleDataSortYn: item.sortable,
            articleDataSortOrder: item.sortIndex,
            articleDataSortCode: item.sort,
          };
        });

        console.log('newGridStting : ', newGridStting);

        await setUserGridSetting(tab1GridId.value, newGridStting);
        termQuery.sort = getSortQuery();
        updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      // onActivated(async () => {
      //   console.log('onActivated ========================');

      //   const researchQuery = {
      //     instituteId: useMetaMngInstId,
      //     dictionaryId: useDctnryId,
      //     includeJobTerm: isTermJobVisible.value,
      //     query: termQuery.query,
      //     sort: getSortQuery(),
      //     jobTypeCode: 'STD',
      //   };

      //   const termList = await getTermListV2(researchQuery);
      //   termDataBinding(termList);

      //   saveStepStateStorage('term');
      // });

      onDeactivated(() => {
        console.log('onDeactivated ========================');
      });

      // 작업 취소 감지
      watch(
        () => isTermJobCancel.value,
        async (value) => {
          console.log('isTermJobCancel ====: ', value);
          console.log('selectedTermData.value : ', selectedTermData.value);

          // 컴포넌트 변경 TermJobComp
          setTermSourceCode('MNG');
          setIsTermJobCancel(false);

          const data = selectedTermData.value;

          // 그리드 첫행 값 전달
          // const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

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
            // emit('row-selected', firstRowData);

            const termBaseQuery = {
              instituteId: data.instituteId,
              dictionaryId: useDctnryId,
              termName: data.termName.name,
              termAbbreviationName: data.termEngAbbreviationName,
              domainName: data.domainName,
            };

            const termDetailsDataInfo = await getTermDetailsV2(termBaseQuery);

            console.log('termDetailsDataInfo : ', termDetailsDataInfo);
            // null 값으로 중복 데이터 초기화
            setTermJobData(null);

            setTermJobData(termDetailsDataInfo.data);
          }

          // 초기값으로 설정
          setIsTermJobCancel(false);
        }
      );

      // 표준용어조회 데이터 바인딩
      const termDataBinding = (termData) => {
        console.log('termData : ', termData);

        resultCount.value.count = termData.data.searchCount;
        resultCount.value.total = termData.data.totalCount;

        const tempData = [];

        const terms = termData.data.items;

        console.log('terms : ', terms);
        for (let i = 0; i < terms.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: terms[i].instituteId,
            dictionaryId: terms[i].dictionaryId,
            termSourceCode: terms[i].termSourceCode,
            jobDivisionCode: terms[i].jobDivisionCode,
            jobDivisionName: terms[i].jobDivisionName,
            discardYn: terms[i].discardYn,
            jobTermId: terms[i].jobTermId,
            termName: {
              name: terms[i].termName,
              jobDivisionCode: terms[i].jobDivisionCode,
              discardYn: terms[i].discardYn,
            },
            termType: terms[i].termTypeName,
            termEngAbbreviationName: terms[i].termAbbreviationName,
            termStandardYnName: terms[i].termStandardYnName,
            domainName: terms[i].domainName,
            codeTypeName: terms[i].codeTypeName,
            relatedCodeName: terms[i].relationCodeName,
            revisionDate: terms[i].revisionDate,
            lastChangeInfo: terms[i].updater,
            lastChangeDate: terms[i].updateDateTime,
          });
        }

        // 하단 컴포넌트 렌더링 변경
        setIsTermJobUpdate(false);
        rowData.value = tempData;

        if (rowData.value.length > 0) {
          nextTick(async () => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

            // 첫 행 select 효과
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');

            // .ag-row-selected 클래스를 추가합니다.
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
            if (firstRowData) {
              // 사전등록 최초 신규등록 상태 이므로 emit 주석
              console.log('firstRowData : ', firstRowData);

              if (firstRowData.data.termSourceCode === 'JOB') {
                // termJobSelected.value = false;
                setTermSourceCode(firstRowData.data.termSourceCode);
                const data = {
                  instituteId: firstRowData.data.instituteId,
                  dictionaryId: firstRowData.data.dictionaryId,
                  jobTermId: firstRowData.data.jobTermId,
                };

                const termDetailsData = await getTermJobDetailsV2(data);

                nextTick(() => {
                  setTermJobUpdateData(termDetailsData.data);
                });
                return;
              }

              setTermSourceCode(firstRowData.data.termSourceCode);

              const data = {
                instituteId: firstRowData.data.instituteId,
                dictionaryId: firstRowData.data.dictionaryId,
                termName: firstRowData.data.termName.name,
                termAbbreviationName: firstRowData.data.termEngAbbreviationName,
                domainName: firstRowData.data.domainName,
              };

              const termDetailsDataInfo = await getTermDetailsV2(data);

              setTermJobData(termDetailsDataInfo.data);
            }
          });
        }

        console.log('tempData : ', tempData);
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
              includeJobTerm: isTermJobVisible.value,
              jobTypeCode: 'STD',
              query: termQuery.query,
              sort: termQuery.sort,
            };

            console.log('params : ', params);

            const response = await getMngTermDownload(params);
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
              link.download = `용어목록_전체_${new Date()
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
            console.log('rowData.value : ', rowData.value);

            if (!rowData.value || rowData.value.length === 0) {
              alert('조회된 데이터가 없습니다.');
              return;
            }

            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(rowData.value);

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
            용어명: row.termName.name || '',
            용어영문약어명: row.termEngAbbreviationName || '',
            작업구분명: row.jobDivisionName || '',
            표준구분: row.termStandardYnName || '',
            용어유형: row.termType || '',
            도메인명: row.domainName,
            코드유형: row.codeTypeName || '',
            연관코드명: row.relationCodeName || '',
            폐기여부: row.discardYn === true ? 'Y' : 'N',
            제개정일자: row.revisionDate || '',
            최종수정자: row.lastChangeInfo || '',
            최종수정일시: row.lastChangeDate || '',
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
          const worksheet = workbook.addWorksheet('용어목록');

          // 🔥 컬럼 정의 및 헤더 설정
          worksheet.columns = [
            { header: '용어명', key: '용어명', width: 25 },
            { header: '용어영문약어명', key: '용어영문약어명', width: 40 },
            { header: '작업구분명', key: '작업구분명', width: 15 },
            { header: '표준구분', key: '표준구분', width: 20 },
            { header: '용어유형', key: '용어유형', width: 15 },
            { header: '도메인명', key: '도메인명', width: 20 },
            { header: '코드유형', key: '코드유형', width: 15 },
            { header: '연관코드명', key: '연관코드명', width: 25 },
            { header: '폐기여부', key: '폐기여부', width: 20 },
            { header: '제개정일자', key: '제개정일자', width: 15 },
            { header: '최종수정자', key: '최종수정자', width: 20 },
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
          const fileName = `용어목록_${downloadType}_${new Date()
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
          XLSX.utils.book_append_sheet(workbook, worksheet, '용어목록');

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

          const fileName = `용어목록_${downloadType}_${new Date()
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
          link.download = `용어목록_${downloadType}_${new Date()
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

      watch(isTermJobVisible, async (value) => {
        console.log('termTopComp-isTermJobVisible : ', value);

        const termQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          includeJobTerm: value,
          sort: getSortQuery(),
          jobTypeCode: 'STD',
        };

        const response = await getTermListV2(termQuery);

        console.log('response-termV2: ', response);
        termDataBinding(response);
      });

      onActivated(() => {
        nextTick(() => {
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        });
      });

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        handleScrollChanged, // 그리드 스크롤 핸들러
        handleSortChanged,
        handleColumnStateChanged,
        handleSetGridApi,
        termQuery,
        useDctnryId,
        onFilterWindowClosed,
        onDeleteDctnrySrchWrdGridUserStng,
        confirmDeleteDctnrySrchTab2State,
        onSearchRemove,
        gridInfoDefs,
        getSortQuery,
        termJobSelected,
        setTermJobData,
        setIsTermJobUpdate,
        setIsTermJobApproval,
        onOpenChatbotWindow,
        chatbotWindowView,
        onCloseChatbotWindow,
        handleBindQuery,
        tab1GridId,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        // searchType 변경
        handleChangeSearchType,
        searchType,
        columnDefsUpdate,
        updateGridData,
        gridApi,
        searchInput,
        gridName,
        termDataBinding,
        isTermJobVisible,
        useMetaMngInstId,
        setTermSourceCode,
        selectedTermData,
        setTermJobUpdateData,
        setIsTermJobState,
        handleExcelDownload,
      };
    },
  };
</script>
