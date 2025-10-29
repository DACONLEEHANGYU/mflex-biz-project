<template>
  <div class="tab-inner">
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="title-s">
          표준화 테이블
          <AppTooltip :htmlContent="getTooltipById('standardizationTable')">
          </AppTooltip>
        </div>
        <div class="top-row">
          <GridSearch
            :gridDefs="gridInfoDefs"
            :resultCount="resultCount"
            :columnFcDefs="columnDefs"
            :modelValue="researchQuery.query"
            @enter="onSearchEnter"
            @save="onSaveGridSettingWindow"
            @remove="onResetGridSet"
            @setup="onSearchSetup"
            @filter-window-closed="onFilterWindowClosed"
          />
          <div class="title-btns__row_btween" style="margin-left: 5px">
            <div class="btns">
              <button class="btn-s green" @click="onOpenTableRefineWindow">
                테이블 정제
              </button>
              <button class="btn-s green" @click="onOpenExtractTableWindow">
                표준화 테이블 수집
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="multiple"
          @rowClicked="onRowClicked"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @rowDoubleClicked="onRowDoubleClicked"
          @column-state-changed="handleColumnStateChanged"
          @gridApi="handleSetGridApi"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
    </div>
  </div>
  <AppWindow
    :view="tableRefineWindowView"
    @close="onCloseTableRefineWindow"
    width="620px"
    height="auto"
  >
    <TableRefineWindow
      :selectedData="selectedData"
      @confirm="onSaveTableRefine"
      @close="onCloseTableRefineWindow"
    />
  </AppWindow>

  <!-- 표준화 테이블 조회 -->
  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="700px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="getTableRefine"
      @close="onCloseConfirmWindow"
    />
  </AppWindow>

  <!-- 테이블명 중복 오류 -->
  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="700px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="getTableRefine"
      @close="onCloseConfirmWindow"
    />
  </AppWindow>

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

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    onActivated,
    onMounted,
    onBeforeMount,
    reactive,
    ref,
    nextTick,
    watchEffect,
  } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { storeToRefs } from 'pinia';

  import {
    getCopyMngTable, // 관리 테이블 복제
    getActualizingTable, // 표준화 테이블 수집
    updateActualizingTable, // 표준화 테이블 업데이트
    getCopyMngColumn,
  } from '@/utils/mflexApi/actualizing/actualizingApi';

  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
    saveStepStateStorage,
  } from '@/utils/cookies';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import TableRefineWindow from '@/components/popWindow/TableRefineWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  export default {
    components: {
      GridSearch,
      AppTooltip,
      AppWindow,
      TableRefineWindow,
      ConfirmWindow,
    },

    data() {
      return {
        selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked ', value);
        this.selectedData = value;

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
      },
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);

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

        const transformedQuery = transformQuery(value);

        this.researchQuery.query = value;

        if (value === '') {
          this.researchQuery.query = '';
          // this.rowData = [];
          await this.fetchData();
        } else {
          this.researchQuery.query = transformedQuery;
          await this.fetchData();
        }
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      onMounted(async () => {
        console.log('onMounted');
        await fetchData();
        // 초기 데이터 없을 시 알림
        if (rowData.value.length === 0) {
          onOpenExtractTableWindow();
        }
      });
      onActivated(() => {
        console.log('onActivated');
      });

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const agGrid = ref(null);
      const gridApi = ref(null);

      const uiStore = useUiStore();
      const { setGridApis } = uiStore;

      const tableRefineGridId = ref('MFGRD100');
      const gridInfoDefs = ref({
        scrnGridId: tableRefineGridId,
        scrnId: '',
      });

      // 현재 인덱스
      const currentRowIndex = ref(0);

      const rowData = reactive({});
      const selectedData = ref({});

      // 데이터 변환 함수
      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          TBL_NM: 'tableName',
          TBL_KORN_NM: 'tableKoreanName',
          RFN_TBL_KORN_NM: 'refineTableKoreanName',
          CURZ_DV_NM: 'actualizationType',
          SCHM_NM: 'schemaName',
          CURZ_NSTD_EXCL_RSN_NM: 'nonStandardReason',
          RFN_TBL_KORN_NM_ERR_CN: 'reviewContent',
          UPDR_INFO: 'updater',
          UPD_DTM: 'updateDateTime',
        };

        const specialConfig = {
          termName: {
            cellRenderer: 'TermJobTypeCellRenderer',
            valueFormatter: '(params) => params.value',
          },
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();
          const config = specialConfig[fieldName] || {};

          // 기본 설정
          const columnConfig = {
            cellClass:
              fieldName === 'schemaName' ||
              fieldName === 'actualizationType' ||
              fieldName === 'updateDateTime' ||
              fieldName === 'no'
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
          };

          // 필드별 cellStyle 설정
          switch (fieldName) {
            case 'tableKoreanName':
              columnConfig.cellStyle = (params) => {
                if (
                  params.data.reviewContent !== '' ||
                  params.data.nonStandardReason
                ) {
                  return { color: 'red' };
                }
                return null;
              };
              break;

            case 'refineTableKoreanName':
              columnConfig.cellStyle = (params) => {
                if (
                  params.data.modifiedFields?.refineTableKoreanName ||
                  params.data.tableKoreanName !==
                    params.data.refineTableKoreanName
                ) {
                  return { backgroundColor: 'rgb(245 187 151)' };
                }
                return null;
              };
              break;

            case 'actualizationType':
              columnConfig.cellStyle = (params) => {
                if (params.data.modifiedFields?.actualizationType) {
                  return { backgroundColor: 'rgb(245 187 151)' };
                }
                return null;
              };
              break;

            case 'nonStandardReason':
              columnConfig.cellStyle = (params) => {
                if (params.data.modifiedFields?.nonStandardReason) {
                  return { backgroundColor: 'rgb(245 187 151)' };
                }
                return null;
              };
              break;
          }

          return columnConfig;
        });
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[tableRefineGridId.value] : ',
          gridStorage[tableRefineGridId.value]
        );

        const fieldMapping = {
          no: 'NO',
          tableName: 'TBL_NM',
          tableKoreanName: 'TBL_KORN_NM',
          refineTableKoreanName: 'RFN_TBL_KORN_NM',
          actualizationType: 'CURZ_DV_NM',
          schemaName: 'SCHM_NM',
          nonStandardReason: 'CURZ_NSTD_EXCL_RSN_NM',
          reviewContent: 'RFN_TBL_KORN_NM_ERR_CN',
          updater: 'UPDR_INFO',
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

        await setUserGridSetting(tableRefineGridId.value, newGridStting);
        researchQuery.value.sort = getSortQuery();
        await fetchData(researchQuery.value);
      };

      // 그리드 초기화
      const onGridReset = async () => {
        console.log('onGridReset');
        console.log('정렬 초기화');

        const gridDefaultData = await getGridDefaultData(
          tableRefineGridId.value
        );

        const transformGrid = await transformGridData(gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        // 그리드 기본값 사용자 세팅
        await setUserGridSetting(tableRefineGridId.value, gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        columnDefs.value = transformGrid;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[tableRefineGridId.value] = transformGrid;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(tableRefineGridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // 필터 초기화 시 검색 쿼리 초기화 추가 24/06/14
        researchQuery.value.query = '';

        fetchData(researchQuery.value);
      };

      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(
            tableRefineGridId.value
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

        if (!gridStorage[tableRefineGridId.value]) {
          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD100', columnDefs.value);
            gridStorage[tableRefineGridId.value] = transformedData;
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
          columnDefs.value = gridStorage[tableRefineGridId.value];
        }
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

      const columnDefs = ref([]);

      const resultCount = ref({
        count: '',
        total: '',
      });

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      const researchQuery = ref({
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        lastItem: {},
        query: '',
        sort: '',
      });

      const fetchData = async (data) => {
        // console.log('getSortQuery : ', getSortQuery());
        const sampleData = [];

        let actualizingTableList;

        if (data) {
          // researchQuery.value = data;
          actualizingTableList = await getActualizingTable(data);
        } else {
          researchQuery.value.sort = getSortQuery();
          actualizingTableList = await getActualizingTable(researchQuery.value);
        }

        // const actualizingTableList = await getActualizingTable(
        //   researchQuery.value
        // );

        resultCount.value.count = actualizingTableList.searchCount;
        resultCount.value.total = actualizingTableList.totalCount;

        const list = actualizingTableList.items;

        for (let i = 0; i < list.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            databaseId: list[i].databaseId,
            instituteId: list[i].instituteId,
            informationSystemId: list[i].informationSystemId,
            databaseSchemaInformation: list[i].databaseSchemaInformation,
            schemaName: list[i].schemaName,
            tableName: list[i].tableName,
            tableKoreanName: list[i].tableKoreanName,
            refineTableKoreanName: list[i].refinedTableKoreanName,
            actualizationType: list[i].currenDivisionName,
            nonStandardReason: list[i].currenNonStandardExcludeReasonName,
            reviewContent: list[i].refinedTableKoreanNameErrorContents,
            updater: list[i].updater,
            updateDateTime: list[i].updateDateTime,
          });
        }
        rowData.value = sampleData;

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
      };

      // fetchData();

      // 테이블 정제
      const onUpdateActualizingTable = async (data) => {
        console.log('onUpdateActualizingTable selected', selectedData.value);

        console.log('onUpdateActualizingTable data', data);

        let currentNonStandardReasonCode;
        let currentNonStandardReasonContents;
        let currentExcludeReasonCode;
        let currentExcludeReasonContents;
        if (data.actualizationType === '20') {
          currentNonStandardReasonCode =
            data.currentNonStandardReasonCode.includes('90')
              ? '90'
              : data.currentNonStandardReasonCode;

          // 괄호 안의 내용 추출
          const nonStandardMatch =
            data.currentNonStandardReasonContents.match(/\((.*?)\)/);
          currentNonStandardReasonContents = nonStandardMatch
            ? nonStandardMatch[1]
            : data.currentNonStandardReasonContents;
        } else if (data.actualizationType === '30') {
          currentExcludeReasonCode = data.currentExcludeReasonCode.includes(
            '90'
          )
            ? '90'
            : data.currentExcludeReasonCode;

          // 괄호 안의 내용 추출
          const excludeMatch =
            data.currentExcludeReasonContents.match(/\((.*?)\)/);
          currentExcludeReasonContents = excludeMatch
            ? excludeMatch[1]
            : data.currentExcludeReasonContents;
        }

        const updateData = {
          instituteId: selectedData.value.instituteId,
          databaseId: selectedData.value.databaseId,
          schemaName: selectedData.value.schemaName,
          tableName: selectedData.value.tableName,
          refinedTableKoreanName: data.refineTableKoreanName,
          currentDivisionCode:
            data.actualizationType === '10'
              ? 'STANDARD'
              : data.actualizationType === '20'
              ? 'NON_STANDARD'
              : data.actualizationType === '30'
              ? 'EXCLUDE'
              : '',
          currentNonStandardReasonCode: currentNonStandardReasonCode,
          currentNonStandardReasonContents: currentNonStandardReasonContents,
          currentExcludeReasonCode: currentExcludeReasonCode,
          currentExcludeReasonContents: currentExcludeReasonContents,
        };

        console.log('updateData', updateData);

        const updateRes = await updateActualizingTable(updateData);
        console.log('updateRes', updateRes);
        return updateRes;
      };

      // 테이블 정제 팝업 상태
      const tableRefineWindowView = ref(false);
      const onOpenTableRefineWindow = () => {
        console.log('onOpenTableRefineWindow');
        tableRefineWindowView.value = true;
      };
      const onCloseTableRefineWindow = () => {
        console.log('onCloseTableRefineWindow');
        tableRefineWindowView.value = false;
      };

      const onSaveTableRefine = async (data) => {
        const result = await onUpdateActualizingTable(data);

        console.log('onUpdateActualizingTable result : ', result);

        if (result.data && result.data.code === 1023) {
          confirmWindowView.value = true;
          popInfo.value.popTitle = '테이블한글명 중복 오류메시지';
          popInfo.value.popMessages =
            '동일한 테이블한글명이 존재합니다. 해당 테이블한글명을 확인하시기 바랍니다.';
          popInfo.value.state = 'error';
          return;
        }

        // 트랜잭션 처리

        console.log('onSaveTableRefine', data);

        // 선택된 row의 node를 찾습니다
        const selectedNode = agGrid.value.gridApi.getRowNode(
          selectedData.value.no - 1
        );

        if (selectedNode) {
          // 데이터 업데이트 전에 변경 여부를 추적하기 위한 필드 추가
          const updatedData = {
            ...selectedNode.data,
            refineTableKoreanName: data.refineTableKoreanName,
            actualizationType: data.actualizationName,
            nonStandardReason: data.currentExcludeReasonContents,
            reviewContent: data.refinedTableKoreanNameErrorContents,
            // updater: userInfo.userId,
            updateDateTime: formatDateTime(new Date()),
            // 변경된 필드 추적을 위한 플래그 추가
            modifiedFields: {
              refineTableKoreanName:
                data.refineTableKoreanName !==
                selectedNode.data.refineTableKoreanName,
              actualizationType:
                data.actualizationName !== selectedNode.data.actualizationType,
              nonStandardReason:
                data.nonStandardReason !== selectedNode.data.nonStandardReason,
              reviewContent:
                data.refinedTableKoreanNameErrorContents !==
                selectedNode.data.reviewContent,
            },
          };

          // row 데이터 업데이트
          selectedNode.setData(updatedData);

          // 변경된 컬럼들만 리프레시
          const columnsToRefresh = [
            'refineTableKoreanName',
            'actualizationType',
            'nonStandardReason',
            'reviewContent',
          ];
          agGrid.value.gridApi.refreshCells({
            rowNodes: [selectedNode],
            columns: columnsToRefresh,
            force: true,
          });
        }

        await fetchData();

        tableRefineWindowView.value = false;
      };

      // 그리드 데이터 추가 함수
      const addGridRowData = async (researchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);

          console.log('oldGridData :', oldGridData);

          // 기존 데이터의 modifiedFields 정보 보존
          // 기존 데이터의 modifiedFields 정보 보존
          const oldDataWithModifications = oldGridData.map((row) => {
            const node = agGrid.value.gridApi.getRowNode(row.id);
            console.log('node ===', node);
            return {
              ...node.data,
              __savedModifiedFields: node?.data?.modifiedFields
                ? { ...node.data.modifiedFields }
                : null,
            };
          });

          console.log('oldDataWithModifications ===', oldDataWithModifications);

          const reloadData = await getActualizingTable(researchQuery);
          const list = reloadData.items;

          // 새로운 데이터 생성
          const newGridData = list.map((item, index) => ({
            id: oldGridData.length + index,
            no: oldGridData.length + index + 1,
            databaseId: item.databaseId,
            instituteId: item.instituteId,
            informationSystemId: item.informationSystemId,
            databaseSchemaInformation: item.databaseSchemaInformation,
            schemaName: item.schemaName,
            tableName: item.tableName,
            tableKoreanName: item.tableKoreanName,
            refineTableKoreanName: item.refinedTableKoreanName,
            actualizationType: item.currenDivisionName,
            nonStandardReason: item.currenNonStandardExcludeReasonName,
            reviewContent: item.refinedTableKoreanNameErrorContents,
            updater: item.updater,
            updateDateTime: item.updateDateTime,
          }));

          // 기존 데이터의 modifiedFields 복원하고 새 데이터와 병합
          rowData.value = [
            ...oldDataWithModifications.map((row) => {
              // 임시 저장된 modifiedFields 정보를 원래 위치로 복원
              const { __savedModifiedFields, ...restData } = row;
              return {
                ...restData,
                modifiedFields: __savedModifiedFields,
              };
            }),
            ...newGridData,
          ];

          resultCount.value.count = Number(rowData.value.length);

          const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
          currentRowIndex.value = lastVisibleRowIndex;

          // 마지막으로 보고 있던 행으로 스크롤
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');

          // 그리드 리프레시 - 스타일 적용을 위해
          agGrid.value.gridApi.refreshCells({
            force: true,
          });
        } catch (error) {
          console.error('Error in addGridRowData:', error);
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

      // gridApi 사용 handler
      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
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
                schemaName: lastItem.schemaName,
                databaseSchemaInformation: lastItem.databaseSchemaInformation,
                tableName: lastItem.tableName,
                tableKoreanName: lastItem.tableKoreanName,
                refineTableKoreanName: lastItem.refineTableKoreanName,
                refinedTableKoreanNameErrorContents: lastItem.reviewContent,
                currenDivisionName: lastItem.actualizationType,
                currenNonStandardExcludeReasonName: lastItem.nonStandardReason,
                updater: lastItem.updater,
                updateDateTime: lastItem.updateDateTime,
              },
              query: '',
              sort: getSortQuery(),
            };

            addGridRowData(researchQuery);
          }
        } catch (error) {
          console.log('lastItem x 에러 발생 ==');
          console.error(error);
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
            query: researchQuery.value.query,
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
            query: researchQuery.value.query,
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

        // localStorage에 에서 gridData json 파싱, MFGRD100에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD100 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD100', newColumnFcDefs);
      }

      const getCellStyle = (fieldName, params) => {
        switch (fieldName) {
          case 'tableKoreanName':
            if (
              params.data.reviewContent !== '' ||
              params.data.nonStandardReason
            ) {
              return { color: 'red' };
            }
            break;

          case 'refineTableKoreanName':
            if (
              params.data.modifiedFields?.refineTableKoreanName ||
              params.data.tableKoreanName !== params.data.refineTableKoreanName
            ) {
              return { backgroundColor: 'rgb(245 187 151)' };
            }
            break;

          case 'actualizationType':
            if (params.data.modifiedFields?.actualizationType) {
              return { backgroundColor: 'rgb(245 187 151)' };
            }
            break;

          case 'nonStandardReason':
            if (params.data.modifiedFields?.nonStandardReason) {
              return { backgroundColor: 'rgb(245 187 151)' };
            }
            break;

          default:
            return null;
        }
        return null;
      };

      watchEffect(async () => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD100) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD100;

        console.log(
          'watchEffect - Grid 데이터 설정 전 : ',
          gridColumnDefs.value.MFGRD100
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
            cellStyle: (params) => getCellStyle(fieldName, params),
            valueFormatter: null,
            cellRenderer: null,
          };
        });

        console.log('watchEffect - Grid 데이터 설정 후 : ', columnDefs.value);
        console.log('watchEffect 정상동작');
      });

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

          researchQuery.value.query = filterSet.searchQuery;
          researchQuery.value.sort = filterSortQuery;

          await fetchData(researchQuery.value);
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD100 : ', gridStorage.MFGRD100);
          columnDefs.value = gridStorage.MFGRD100;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD100);
        }
      };

      // 확인 팝업 상태
      const confirmWindowView = ref(false);
      const onCloseConfirmWindow = () => {
        console.log('onCloseConfirmWindow');
        confirmWindowView.value = false;
      };

      const onOpenExtractTableWindow = () => {
        confirmWindowView.value = true;
        popInfo.value.popTitle = '표준화 테이블 수집 알림';
        popInfo.value.popMessages = '표준화 테이블을 수집하시겠습니까?';
      };
      const onCloseExtractTableWindow = () => {
        confirmWindowView.value = false;
      };

      // 표준화 테이블 수집
      const getTableRefine = async () => {
        confirmWindowView.value = false;

        const tableParams = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
        };

        const copyTableRes = await getCopyMngTable(tableParams);
        console.log('copyTableRes', copyTableRes);

        const columnParams = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
        };

        const response = await getCopyMngColumn(columnParams);

        console.log('response : ', response);

        await fetchData();
      };

      // 날짜 포맷팅 함수
      const formatDateTime = (date) => {
        const d = new Date(date);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      // 필터 초기화 confirm 팝업
      const resetGridSetState = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까? ',
      });

      const onResetGridSet = () => {
        resetGridSetState.view = true;
      };
      // 그리드 설정 초기화
      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

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
        fetchData,
        gridInfoDefs,
        researchQuery,
        onOpenTableRefineWindow,
        onCloseTableRefineWindow,
        tableRefineWindowView,
        selectedData,
        popInfo,
        confirmWindowView,
        onCloseConfirmWindow,
        getTableRefine,
        onSaveTableRefine,
        handleScrollChanged,
        handleSortChanged,
        handleColumnStateChanged,
        handleSetGridApi,
        onSaveGridSettingWindow,
        saveGridSettingView,
        onSetUserGridSetting,
        resetGridSetState,
        onResetGridSet,
        onGridReset,
        onFilterWindowClosed,
        onOpenExtractTableWindow,
        onCloseExtractTableWindow,
        getTooltipById,
      };
    },
  };
</script>

<style scoped>
  .title-btns__row_btween {
    display: flex;
    justify-content: end;
    align-items: center;
    /* margin-left: 20px; */
    padding-top: 0;
    padding-bottom: 5px;
    margin-bottom: 3px;
  }
</style>
