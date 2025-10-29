<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          컬럼명 목록
          <AppTooltip :htmlContent="getTooltipById('columnList')"> </AppTooltip>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button @click="onRefineRule" class="btn-s green">정제실행</button>
            <!-- <button @click="onCofirmRefine" class="btn-s">정제 실행</button> -->
          </div>
        </div>
      </div>

      <div class="top-row">
        <GridSearch
          :gridDefs="gridInfoDefs"
          :resultCount="resultCount"
          :columnFcDefs="columnDefs"
          :modelValue="searchBody.query"
          @enter="onSearchEnter"
          @save="onSaveGridSettingWindow"
          @setup="onSearchSetup"
          @remove="onResetGridSet"
          @filter-window-closed="onFilterWindowClosed"
        />
      </div>
    </div>
    <div class="grid-wrap">
      <div class="grid-top"></div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @column-state-changed="handleColumnStateChanged"
          @gridApi="handleSetGridApi"
          :context="context"
          rowSelection="single"
          @rowClicked="onRowClicked"
          ref="agGrid"
        />
      </div>
    </div>
  </div>

  <AppWindow :view="refineRuleWindowView" width="700px" height="auto">
    <RefineRuleWindow
      @confirm="onConfirmRefineRule"
      @close="onCloseRefineRuleWindow"
    />
  </AppWindow>

  <!-- 저장 알림창 -->
  <AppDialog
    v-model:view="saveConfirmState.view"
    :title="saveConfirmState.title"
    :message="saveConfirmState.message"
    @confirm="onRefine"
  />

  <!-- 그리드 설정 초기화 -->
  <AppDialog
    v-model:view="resetGridSetState.view"
    :title="resetGridSetState.title"
    :message="resetGridSetState.message"
    @confirm="onGridReset"
  />
  <!-- 그리드 설정 저장 -->
  <AppDialog
    v-model:view="saveGridSettingView.view"
    :title="saveGridSettingView.title"
    :message="saveGridSettingView.message"
    @confirm="onSetUserGridSetting"
  />
</template>

<script>
  import {
    ref,
    reactive,
    computed,
    watch,
    nextTick,
    onMounted,
    onBeforeMount,
    watchEffect,
    onActivated,
  } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useUiStore } from '@/stores/ui';
  import { useActualizingStore } from '@/stores/actualizing';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';

  import {
    getCopyMngColumn, // 관리 컬럼 복제
    getActualizingColumnSearch, // 컬럼명 분포 현황 조회
    updateActualizingColumnBatch, // 컬럼한글명 정제(일괄)
  } from '@/utils/mflexApi/actualizing/actualizingApi';

  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import RefineRuleWindow from '@/components/popWindow/RefineRuleWindow.vue';
  export default {
    components: {
      GridSearch,
      AppTooltip,
      AppWindow,
      RefineRuleWindow,
    },
    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onRowClicked(value) {
        console.log('onRowClicked ', value);
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

        this.setSelectColumnData(value);
      },
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);

        // 대문자 변환 로직 제거
        this.searchBody.query = value;

        if (value === '') {
          this.searchBody.query = '';
          // this.rowData = [];
          await this.fetchData();
        } else {
          // 변환 로직 없이 원래 입력값 그대로 사용
          this.searchBody.query = value;
          await this.fetchData();
        }
      },
      // async onSearchEnter(value) {
      //   console.log('onSearchEnter', value);

      //   function transformQuery(query) {
      //     // 정규표현식을 사용하여 컬럼명, 연산자, 검색 조건을 분리
      //     const regex =
      //       /(\S+)\s+((?:like|=|<|>|<=|>=))\s+'([^']+)'(\s+(?:and|or)\s+)?/gi;
      //     return query.replace(
      //       regex,
      //       (match, column, operator, searchTerm, logicalOperator) => {
      //         if (column === '최종수정자') {
      //           // 최종수정자는 검색어 유지, 연산자만 대문자로 변환
      //           return `${column} ${operator.toUpperCase()} '${searchTerm}'${
      //             logicalOperator ? logicalOperator.toUpperCase() : ''
      //           }`;
      //         }
      //         // 다른 컬럼들의 경우 영문 검색어와 연산자를 대문자로 변환
      //         const transformedTerm = searchTerm.replace(/[a-zA-Z]+/g, (word) =>
      //           word.toUpperCase()
      //         );
      //         return `${column} ${operator.toUpperCase()} '${transformedTerm}'${
      //           logicalOperator ? logicalOperator.toUpperCase() : ''
      //         }`;
      //       }
      //     );
      //   }

      //   const transformedQuery = transformQuery(value);

      //   this.searchBody.query = value;

      //   if (value === '') {
      //     this.searchBody.query = '';
      //     // this.rowData = [];
      //     await this.fetchData();
      //   } else {
      //     this.searchBody.query = transformedQuery;
      //     await this.fetchData();
      //   }
      // },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props) {
      const actualizingStore = useActualizingStore();
      const { setSelectColumnData, setIsSaveColumnRefine } = actualizingStore;
      const { isSaveColumnRefine } = storeToRefs(actualizingStore);

      const authStore = useAuthStore();
      const { userMetaMngInstListInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      console.log('userMetaMngInstListInfo : ', userMetaMngInstListInfo.value);

      const agGrid = ref(null);
      const gridApi = ref(null);

      const rowData = reactive({});

      const columnRefineGridId = ref('MFGRD110');
      const gridInfoDefs = ref({
        scrnGridId: columnRefineGridId,
        scrnId: '',
      });

      const selectInstituted = computed(() => {
        return userMetaMngInstListInfo.value.find(
          (item) => item.selected === true
        );
      });

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // 현재 인덱스`
      const currentRowIndex = ref(0);

      // gridApi 사용 handler
      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      // 데이터 변환 함수
      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          COL_TYPE_CNT: 'columnTypeCount',
          RFN_COL_KORN_NM_ERR_YN: 'refinedColumnKoreanNameErrorYn',
          COL_NM: 'columnName',
          UPD_DTM: 'updateDateTime',
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();

          // 기본 설정
          const columnConfig = {
            cellClass:
              fieldName === 'refinedColumnKoreanNameErrorYn' ||
              fieldName === 'columnTypeCount' ||
              fieldName === 'no' ||
              fieldName === 'updateDateTime'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: !item.articleDisplayYn,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            sortable: item.articleDataSortYn,
            suppressSorting: !item.articleDataSortYn,
            width: item.articleColumnWidth,
          };

          return columnConfig;
        });
      };

      // 그리드 초기화
      const onGridReset = async () => {
        console.log('onGridReset');
        console.log('정렬 초기화');

        const gridDefaultData = await getGridDefaultData(
          columnRefineGridId.value
        );

        const transformGrid = await transformGridData(gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        // 그리드 기본값 사용자 세팅
        await setUserGridSetting(columnRefineGridId.value, gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        columnDefs.value = transformGrid;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[columnRefineGridId.value] = transformGrid;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(columnRefineGridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // 필터 초기화 시 검색 쿼리 초기화 추가 24/06/14
        searchBody.value.query = '';

        fetchData(searchBody.value);
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[columnRefineGridId.value] : ',
          gridStorage[columnRefineGridId.value]
        );

        const fieldMapping = {
          no: 'NO',
          columnTypeCount: 'COL_TYPE_CNT',
          refinedColumnKoreanNameErrorYn: 'RFN_COL_KORN_NM_ERR_YN',
          columnName: 'COL_NM',
          updateDateTime: 'UPD_DTM',
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

        await setUserGridSetting(columnRefineGridId.value, newGridStting);
        searchBody.value.sort = getSortQuery();
        await fetchData(searchBody.value);
      };

      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(
            columnRefineGridId.value
          );
          const transformedData = await transformGridData(userGridData);
          console.log('Transformed Grid Data:', transformedData);
          return transformedData; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      onBeforeMount(async () => {
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[columnRefineGridId.value]) {
          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD110', columnDefs.value);
            gridStorage[columnRefineGridId.value] = transformedData;
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
          columnDefs.value = gridStorage[columnRefineGridId.value];
        }
      });

      const columnDefs = ref([]);

      onMounted(async () => {
        const data = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
        };

        // const response = await getCopyMngColumn(data);

        // console.log('response : ', response);

        await fetchData();
      });

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

      // 그리드 스크롤 이벤트 함수
      const handleScrollChanged = async (endScrollStaus) => {
        // console.log('endScrollStaus ===', endScrollStaus);
        try {
          if (endScrollStaus === 'Y' && rowData.value != null) {
            const lastItem =
              rowData.value.length > 0
                ? rowData.value[rowData.value.length - 1]
                : null;
            console.log('lastItem ===', lastItem);

            const researchQuery = {
              instituteId: useMetaMngInstId,
              informationSystemId: useInfoSysId,
              lastItem: {
                instituteId: lastItem.instituteId,
                informationSystemId: lastItem.informationSystemId,
                databaseId: lastItem.databaseId,
                columnName: lastItem.columnName,
                columnTypeCount: lastItem.columnTypeCount,
                refinedColumnKoreanNameErrorYn:
                  lastItem.refinedColumnKoreanNameErrorYn,
                updateDateTime: lastItem.updateDateTime,
              },
              query: searchBody.value.query,
              sort: getSortQuery(),
            };

            addGridRowData(researchQuery);
          }
        } catch (error) {
          console.log('lastItem x 에러 발생 ==');
          console.error(error);
        }
      };

      // 그리드 데이터 추가 함수
      const addGridRowData = async (researchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);

          const reloadData = await getActualizingColumnSearch(researchQuery);
          const list = reloadData.items;

          const newGridData = [];

          // 새로운 데이터 생성
          for (let i = 0; i < list.length; i++) {
            newGridData.push({
              rowId: oldGridData.length + i,
              id: oldGridData.length + i,
              no: oldGridData.length + i + 1,
              instituteId: list[i].instituteId,
              informationSystemId: list[i].informationSystemId,
              databaseId: list[i].databaseId,
              columnName: list[i].columnName,
              columnTypeCount: list[i].columnTypeCount,
              refinedColumnKoreanNameErrorYn:
                list[i].refinedColumnKoreanNameErrorYn,
              updateDateTime: list[i].updateDateTime,
            });
          }

          // 기존 데이터의 modifiedFields 복원하고 새 데이터와 병합
          rowData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(rowData.value.length);

          const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
          currentRowIndex.value = lastVisibleRowIndex;

          // 마지막으로 보고 있던 행으로 스크롤
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        } catch (error) {
          console.error('Error in addGridRowData:', error);
        }
      };

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
          const data = {
            instituteId: useMetaMngInstId,
            informationSystemId: useInfoSysId,
            query: searchBody.value.query,
          };

          await fetchData(data);
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          // sortStateQuery.value = sortQuery.value;

          const data = {
            instituteId: useMetaMngInstId,
            informationSystemId: useInfoSysId,
            query: searchBody.value.query,
            sort: sortQuery.value,
          };

          await fetchData(data);
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
              cellClass: colDef.cellClass,
              cellStyle: colDef.cellStyle,
            };
          })
          .filter((colDef) => colDef != null);

        //columnFcDefs.value = newColumnFcDefs; */

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD110에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD110 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD110', newColumnFcDefs);
      }

      watchEffect(async () => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD110) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD110;

        console.log(
          'watchEffect - Grid 데이터 설정 전 : ',
          gridColumnDefs.value.MFGRD110
        );

        columnDefs.value = columnDefs.value.map((col) => {
          const fieldName = col.field;

          return {
            headerName: col.headerName,
            field: fieldName,
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
            valueFormatter: null,
            cellRenderer: null,
          };
        });

        console.log('watchEffect - Grid 데이터 설정 후 : ', columnDefs.value);
        console.log('watchEffect 정상동작');
      });

      const searchBody = ref({
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        lastItem: {},
        query: '',
        sort: '',
      });

      const selectedData = ref({});

      const fetchData = async (reqeustBody) => {
        let response;

        if (reqeustBody) {
          response = await getActualizingColumnSearch(reqeustBody);
        } else {
          response = await getActualizingColumnSearch(searchBody.value);
        }

        resultCount.value.count = response.searchCount;
        resultCount.value.total = response.totalCount;

        const columnList = response.items;
        console.log('columnList : ', columnList);

        const tempData = [];

        for (let i = 0; i < columnList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: columnList[i].instituteId,
            informationSystemId: columnList[i].informationSystemId,
            databaseId: columnList[i].databaseId,
            columnName: columnList[i].columnName,
            columnTypeCount: columnList[i].columnTypeCount,
            refinedColumnKoreanNameErrorYn:
              columnList[i].refinedColumnKoreanNameErrorYn,
            updateDateTime: columnList[i].updateDateTime,
          });
        }

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

            selectedData.value = firstRowData.data;
          });
        }

        setSelectColumnData(selectedData.value);
      };

      fetchData();

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });
      const confirmWindowView = ref(false);
      const onCloseConfirmWindow = () => {
        console.log('onCloseConfirmWindow');
        confirmWindowView.value = false;
      };
      const onCofirmRefine = () => {
        saveConfirmState.view = true;
      };

      const saveConfirmState = reactive({
        view: false,
        title: '컬럼정제 실행 알림',
        message: '컬럼정제를 실행하시겠습니까?',
      });

      // 정제 실행
      const onRefine = async () => {
        const data = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          informationSystemId: useInfoSysId,
        };

        const response = await updateActualizingColumnBatch(data);
        console.log('updateActualizingColumnBatch response : ', response);
        // 재조회
        if (response.status === 200) {
          fetchData();
        } else {
          alert('컬럼정제 오류');
        }
      };

      // 정제조건 팝업
      const refineRuleWindowView = ref(false);
      const onRefineRule = () => {
        refineRuleWindowView.value = true;
      };
      const onCloseRefineRuleWindow = () => {
        refineRuleWindowView.value = false;
      };
      const onConfirmRefineRule = async (result) => {
        console.log('onConfirmRefineRule : ', result);
        // 재조회

        setTimeout(async () => {
          await fetchData();
        }, 100);

        refineRuleWindowView.value = false;
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

          // const termFilterData = await getResaerchTerm(researchQuery);
          // serarchDataBinding(termFilterData);
          console.log('filterSortQuery : ', filterSortQuery);

          searchBody.value.query = filterSet.searchQuery;
          searchBody.value.sort = filterSortQuery;

          await fetchData(searchBody.value);
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD110 : ', gridStorage.MFGRD110);
          columnDefs.value = gridStorage.MFGRD110;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD110);
        }
      };

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

      // 필터 초기화 confirm 팝업
      const resetGridSetState = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
      });

      const onResetGridSet = () => {
        resetGridSetState.view = true;
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      watch(isSaveColumnRefine, (value) => {
        console.log('isSaveColumnRefine : ', value);
        if (value) {
          fetchData();
          setIsSaveColumnRefine(false);
        }
      });

      onActivated(() => {
        nextTick(() => {
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        });
      });

      return {
        rowData,
        columnDefs,
        columnRefineGridId,
        gridInfoDefs,
        resultCount,
        refineRuleWindowView,
        onRefineRule,
        onConfirmRefineRule,
        onCloseRefineRuleWindow,
        agGrid,
        gridApi,
        setSelectColumnData,
        onRefine,
        confirmWindowView,
        popInfo,
        onCofirmRefine,
        saveConfirmState,
        searchBody,
        fetchData,
        handleSetGridApi,
        handleScrollChanged,
        handleSortChanged,
        handleColumnStateChanged,
        onFilterWindowClosed,
        saveGridSettingView,
        onSaveGridSettingWindow,
        resetGridSetState,
        onResetGridSet,
        onGridReset,
        onSetUserGridSetting,
        getTooltipById,
      };
    },
  };
</script>
