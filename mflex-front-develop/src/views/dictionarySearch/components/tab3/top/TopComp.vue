<template>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="col col-2">
      <div class="tree-wrap" style="flex: 0 0 20%">
        <div class="tree-box__absolute">
          <AppTree
            ref="appTree"
            v-model="treeData"
            :roots="treeRoots"
            :drag="false"
            @selectNode="onSelectNode"
          />
        </div>
      </div>
      <div class="grid-wrap">
        <div class="grid-top">
          <div class="top-row">
            <GridSearch
              :columnFcDefs="columnDefs"
              :resultCount="resultCount"
              :gridDefs="gridInfoDefs"
              :modelValue="searchInput"
              @search-type="handleChangeSearchType"
              @save="onSaveGridSettingWindow"
              @open-chatbot-window="onOpenChatbotWindow"
              @enter="onGridSearchClicked"
              @remove="onDeleteDctnrySrchWrdGridUserStng"
              @column-state-changed="handleColumnStateChanged"
              @filter-window-closed="onFilterWindowClosed"
              @gridApi="handleSetGridApi"
              @excel-download="handleExcelDownload"
            />
          </div>
        </div>
        <div class="grid-list">
          <AppGrid
            :rowData="rowData"
            :columnDefs="columnDefs"
            :context="context"
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
  </div>

  <AppWindow
    :view="chatbotWindowView"
    @close="onCloseChatbotWindow"
    :moveState="true"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="domainSearchGridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  // ============================
  // IMPORTS
  // ============================
  import {
    ref,
    watch,
    nextTick,
    reactive,
    watchEffect,
    onBeforeMount,
    onActivated,
  } from 'vue';

  // 분리된 컴포저블들
  import { useDomainSearchState } from '@/composables/dictionarySearch/domainSearch/useDomainSearchState.js';
  import { useDomainSearchTree } from '@/composables/dictionarySearch/domainSearch/useDomainSearchTree.js';
  import { useDomainSearchData } from '@/composables/dictionarySearch/domainSearch/useDomainSearchData.js';
  import { useDomainSearchHandlers } from '@/composables/dictionarySearch/domainSearch/useDomainSearchHandlers.js';
  import { useDomainSearchUtils } from '@/composables/dictionarySearch/domainSearch/useDomainSearchUtils.js';

  // 기존 imports
  import { useUiStore } from '@/stores/ui';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import { getDomainViewDownload } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';

  import { useDictionarySearchStore } from '@/stores/dictionarySearch';

  import AppTree from '@/components/ui/AppTree.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  import { bindingDomainGridData } from '@/utils/mflexApi/dictionarySearchApi';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import {
    getDomainTreeData,
    getConstructDomainTreeView,
    getDomainSearchV2,
  } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
  import {
    getUserGridSetting,
    setUserGridSetting,
    getGridDefaultData,
  } from '@/utils/mflexApi/common/commonApi';

  export default {
    // ============================
    // COMPONENT DEFINITION
    // ============================
    components: {
      TypeCellRenderer,
      GridSearch,
      AppTree,
      ChatbotBtn,
      AppWindow,
      ChatbotWindow,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },

    // ============================
    // METHODS (Options API)
    // ============================
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;

        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(`[row-id="${clickNode}"]`);
        clickedNode.classList.add('ag-row-selected');
        this.$emit('row-selected', value);
        this.setDomainViewSelectData(value);
      },
    },

    beforeMount() {
      this.context = { componentParent: this };
    },

    mounted() {
      this.selectFirstNode();
      this.selectGridFirstNode();
    },

    emits: ['first-row-selected', 'row-selected', 'open-filter-window'],

    // ============================
    // COMPOSITION API SETUP
    // ============================
    setup(props, { emit }) {
      // ============================
      // STORES & AUTH
      // ============================
      const uiStore = useUiStore();
      const { gridColumnDefs } = storeToRefs(uiStore);

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

      const { domainDictionarySearchCode } = storeToRefs(
        useDictionarySearchStore()
      );
      const { setDomainViewSelectData } = useDictionarySearchStore();

      // AG 그리드 API 할당
      const agGrid = ref(null);
      const gridApi = ref(null);

      // ============================
      // COMPOSABLES
      // ============================
      const state = useDomainSearchState();
      const treeHandlers = useDomainSearchTree();
      const dataHandlers = useDomainSearchData();
      const eventHandlers = useDomainSearchHandlers();
      const utils = useDomainSearchUtils();

      // ============================
      // 매개변수 객체들 생성
      // ============================
      const dataParams = {
        useMetaMngInstId,
        useDctnryId,
        domainDictionarySearchCode,
        rowData: state.rowData,
        resultCount: state.resultCount,
        emit,
        setDomainViewSelectData,
        agGrid,
        selectNode: state.selectNode, // ref로 전달
        currentRowIndex: state.currentRowIndex, // 추가
      };

      const treeParams = {
        useMetaMngInstId,
        useDctnryId,
        domainDictionarySearchCode,
        treeData: state.treeData,
        rowData: state.rowData,
        setDomainViewSelectData,
        inputQuery: state.inputQuery,
        searchInput: state.searchInput,
        columnDefs: state.columnDefs,
        selectNode: state.selectNode, // ref로 전달
      };

      const handlerParams = {
        columnDefs: state.columnDefs,
        gridApi,
        uiStore,
        newColumnDefs: state.newColumnDefs,
        useMetaMngInstId,
        useDctnryId,
        domainDictionarySearchCode,
        searchInput: state.searchInput,
        rowData: state.rowData,
        selectNode: state.selectNode, // ref로 전달
        sortStateQuery: state.sortStateQuery,
        getSortQuery: () => utils.getSortQuery(state.columnDefs),
        currentRowIndex: state.currentRowIndex,
        inputQuery: state.inputQuery,
        agGrid,
      };

      // ============================
      // 매개변수 객체들 생성 (수정된 부분)
      // ============================
      const utilParams = {
        ...handlerParams,
        searchType: state.searchType,
        domainSearchGridId: state.domainSearchGridId,
        chatbotWindowView: state.chatbotWindowView,
        focusRootNode: treeHandlers.focusRootNode(state.appTree),
        getSortQuery: utils.getSortQuery(state.columnDefs), // utils에서 가져온 함수
      };

      // ============================
      // 실제 핸들러 함수들 생성
      // ============================
      const fetchData = dataHandlers.fetchData({
        ...dataParams,
        firstRowSelectedEvent: dataHandlers.firstRowSelectedEvent(dataParams),
      });

      const addGridRowData = dataHandlers.addGridRowData({
        rowData: state.rowData,
        agGrid,
        currentRowIndex: state.currentRowIndex, // 명시적으로 전달
        resultCount: state.resultCount,
      });

      // ============================
      // 실제 핸들러 함수들 생성
      // ============================
      const handlers = {
        handleSetGridApi: eventHandlers.handleSetGridApi(gridApi),
        handleChangeSearchType: eventHandlers.handleChangeSearchType(
          state.searchType
        ),
        handleColumnStateChanged:
          eventHandlers.handleColumnStateChanged(handlerParams),
        handleSortChanged: eventHandlers.handleSortChanged({
          ...handlerParams,
          firstRowSelectedEvent: dataHandlers.firstRowSelectedEvent(dataParams),
          getSortQuery: utils.getSortQuery(state.columnDefs), // utils에서 가져온 함수
        }),
        handleScrollChanged: eventHandlers.handleScrollChanged({
          ...handlerParams,
          addGridRowData,
          getSortQuery: utils.getSortQuery(state.columnDefs), // utils에서 가져온 함수
        }),
        onGridSearchClicked: utils.onGridSearchClicked({
          ...utilParams,
          fetchData,
        }),
        onFilterWindowClosed: utils.onFilterWindowClosed({
          ...utilParams,
          fetchData,
        }),
        onSearchRemove: utils.onSearchRemove(utilParams),
        onSetUserGridSetting: utils.onSetUserGridSetting(utilParams),
        handleBindQuery: utils.handleBindQuery({
          ...utilParams,
          fetchData,
        }),
        getGridInfo: utils.getGridInfo(state.domainSearchGridId),
        getSortQuery: utils.getSortQuery(state.columnDefs), // utils에서 가져온 함수
      };

      const treeHandlerFunctions = {
        updateDomainTree: treeHandlers.updateDomainTree({
          ...treeParams,
          fetchData,
          getSortQuery: utils.getSortQuery(state.columnDefs), // utils에서 가져온 함수
        }),
        onSelectNode: treeHandlers.onSelectNode({
          ...treeParams,
          fetchData,
          getSortQuery: utils.getSortQuery(state.columnDefs), // utils에서 가져온 함수
        }),
        selectFirstNode: treeHandlers.selectFirstNode,
        selectGridFirstNode: treeHandlers.selectGridFirstNode,
        focusRootNode: treeHandlers.focusRootNode(state.appTree),
      };

      const handleExcelDownload = async (option) => {
        console.log('option : ', option);

        try {
          if (option === 'all') {
            // 🔥 전체 다운로드 - API 응답을 엑셀 파일로 다운로드
            const params = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              dictionarySearchCode: domainDictionarySearchCode.value,
              domainId: state.selectNode.value?.domainId || '0도메인사전',
              query: state.inputQuery.value || '',
              sort: utils.getSortQuery(state.columnDefs) || '',
            };

            console.log('params : ', params);

            const response = await getDomainViewDownload(params);
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
              link.download = `도메인목록_전체_${new Date()
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

            if (
              !dataParams.rowData.value ||
              dataParams.rowData.value.length === 0
            ) {
              alert('조회된 데이터가 없습니다.');
              return;
            }

            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(
              dataParams.rowData.value
            );

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
            사전명: row.domainName[0].dictionaryName || '',
            사전유형: row.domainName[0].type || '',
            도메인명: extractCellValue(row.domainName),
            도메인분류명: row.domainClassName || '',
            도메인그룹명: row.domainGroupName || '',
            데이터허용값: row.dataPermissionValue || '',
            폐기여부: row.discardYn === true ? 'Y' : 'N' || '',
            제개정일자: row.revisionDate || '',
            최종수정자: row.updater || '',
            최종수정일시: row.updateDatetime || '',
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
          const worksheet = workbook.addWorksheet('도메인목록');

          // 🔥 컬럼 정의 및 헤더 설정
          worksheet.columns = [
            { header: '사전명', key: '사전명', width: 25 },
            { header: '사전유형', key: '사전유형', width: 25 },
            { header: '도메인명', key: '도메인명', width: 40 },
            { header: '도메인분류명', key: '도메인분류명', width: 20 },
            { header: '도메인그룹명', key: '도메인그룹명', width: 15 },
            { header: '데이터허용값', key: '데이터허용값', width: 25 },
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
              // if (colNumber === 1) {
              //   cell.alignment = {
              //     horizontal: 'center',
              //     vertical: 'middle',
              //   };
              // } else {
              //   cell.alignment = {
              //     horizontal: 'left',
              //     vertical: 'middle',
              //   };
              // }

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
          const fileName = `도메인목록_${downloadType}_${new Date()
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
          XLSX.utils.book_append_sheet(workbook, worksheet, '도메인목록');

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

          const fileName = `도메인목록_${downloadType}_${new Date()
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
          link.download = `도메인목록_${downloadType}_${new Date()
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

      // ============================
      // 팝업 핸들러들
      // ============================
      const onDeleteDctnrySrchWrdGridUserStng = () => {
        state.confirmDeleteDctnrySrchTab2State.view = true;
      };

      const onSaveGridSettingWindow = () => {
        state.saveGridSettingView.view = true;
      };

      const onOpenChatbotWindow = () => {
        state.chatbotWindowView.value = true;
      };

      const onCloseChatbotWindow = () => {
        state.chatbotWindowView.value = false;
      };

      // ============================
      // 그리드 헤더 초기화
      // ============================
      const initializeGridColumnDefs = () => {
        const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
        if (storedColumnDefs && storedColumnDefs.MFGRD009) {
          uiStore.setGridColumnDefs('MFGRD009', storedColumnDefs.MFGRD009);
        }
      };

      initializeGridColumnDefs();
      state.columnDefs.value = gridColumnDefs.value.MFGRD009;

      // ============================
      // LIFECYCLE HOOKS
      // ============================
      onBeforeMount(async () => {
        console.log('domainSearch beforeMount  ========================');

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[domainSearchGridId.value] : ',
          gridStorage[state.domainSearchGridId.value]
        );

        if (!gridStorage[state.domainSearchGridId.value]) {
          try {
            const transformedData = await handlers.getGridInfo();
            state.columnDefs.value = transformedData;

            uiStore.setGridColumnDefs('MFGRD009', state.columnDefs.value);
            gridStorage.MFGRD009 = transformedData;
            saveGridInfoToStorage(gridStorage);

            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', state.columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              state.columnDefs.value
            );
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          state.columnDefs.value = gridStorage[state.domainSearchGridId.value];
        }
      });

      // ============================
      // WATCHERS
      // ============================
      watchEffect(() => {
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD009) {
          return;
        }
        state.columnDefs.value = gridColumnDefs.value.MFGRD009;

        state.columnDefs.value = state.columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;

          if (col.field === 'domainName') {
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

      // ... 사전 표시 범위 변경 시 재조회 (수정된 부분)
      watch(domainDictionarySearchCode, async (newVal) => {
        await treeHandlerFunctions.updateDomainTree();
        console.log('사전 표시 범위 변경 tree treeData:', state.treeData);

        const researchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          dictionarySearchCode: domainDictionarySearchCode.value,
          domainId: state.selectNode.value?.domainId || '0도메인사전',
          query: state.inputQuery.value,
          sort: handlers.getSortQuery(), // utils에서 가져온 함수 사용
        };
        await fetchData(researchQuery);
      });

      // 트리 데이터조회 생성
      treeHandlerFunctions.updateDomainTree();

      onActivated(async () => {
        console.log('termSearch activated  ========================');
        agGrid.value.gridApi.ensureIndexVisible(
          dataParams.currentRowIndex.value,
          'top'
        );
      });

      // ============================
      // RETURN
      // ============================
      return {
        // State
        ...state,
        agGrid,

        // Handlers
        ...handlers,
        ...treeHandlerFunctions,

        // Popup Handlers
        onDeleteDctnrySrchWrdGridUserStng,
        onSaveGridSettingWindow,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        handleExcelDownload,

        // Store
        setDomainViewSelectData,
      };
    },
  };
</script>
