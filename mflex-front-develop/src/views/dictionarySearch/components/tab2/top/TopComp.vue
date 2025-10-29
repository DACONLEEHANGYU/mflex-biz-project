<template>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            ref="gridSearchComponent"
            :modelValue="searchInput"
            :resultCount="resultCount"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            @search-type="handleChangeSearchType"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onGridSearchClicked"
            @save="onSaveGridSettingWindow"
            @remove="onRemoveWordHeaderData"
            @column-state-changed="handleColumnStateChanged"
            @filter-window-closed="onFilterWindowClosed"
            @excel-download="handleExcelDownload"
          />
        </div>
      </div>
      <div class="grid-list">
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
      v-model:view="confirmSaveDctnrySrchTab2State.view"
      :title="confirmSaveDctnrySrchTab2State.title"
      :message="confirmSaveDctnrySrchTab2State.message"
      @confirm="onSearchRemove"
    />
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

  <AppWindow
    :view="chatbotWindowView"
    @close="onCloseChatbotWindow"
    :moveState="true"
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

<script>
  // ============================
  // IMPORTS
  // ============================
  import { ref, watchEffect, onBeforeMount, watch, onActivated } from 'vue';

  // 분리된 컴포저블들
  import { useWordSearchState } from '@/composables/dictionarySearch/wordSearch/useWordSearchState.js';
  import { useWordSearchData } from '@/composables/dictionarySearch/wordSearch/useWordSearchData.js';
  import { useWordSearchHandlers } from '@/composables/dictionarySearch/wordSearch/useWordSearchHandlers.js';
  import { useWordSearchUtils } from '@/composables/dictionarySearch/wordSearch/useWordSearchUtils.js';

  // 기존 imports
  import { useUiStore } from '@/stores/ui';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import HeaderDragIcon from '@/utils/HeaderDragIcon.js';

  import {
    getTermViewDownload,
    getWordViewDownload,
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';

  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import { useDictionarySearchStore } from '@/stores/dictionarySearch';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  export default {
    // ============================
    // COMPONENT DEFINITION
    // ============================
    components: {
      TypeCellRenderer,
      HeaderDragIcon,
      GridSearch,
      AppWindow,
      ChatbotBtn,
      ChatbotWindow,
    },

    emits: ['first-row-selected', 'row-selected', 'open-filter-window'],

    // ============================
    // DATA & CONTEXT
    // ============================
    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },

    beforeMount() {
      this.context = { componentParent: this };
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
        this.setWordViewSelectData(value);
      },
    },

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
      const { userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useDctnryId } = userStngInfo.value;

      const { wordDictionarySearchCode } = storeToRefs(
        useDictionarySearchStore()
      );
      const { setWordViewSelectData } = useDictionarySearchStore();

      // AG 그리드 API 할당
      const agGrid = ref(null);
      const gridApi = ref(null);

      // ============================
      // COMPOSABLES
      // ============================
      const state = useWordSearchState();
      const dataHandlers = useWordSearchData();
      const eventHandlers = useWordSearchHandlers();
      const utils = useWordSearchUtils();

      // ============================
      // 매개변수 객체들 생성
      // ============================
      const dataParams = {
        resultCount: state.resultCount,
        rowFcData: state.rowFcData,
        emit,
        setWordViewSelectData,
        agGrid, // agGrid 추가
        currentRowIndex: state.currentRowIndex,
      };

      const handlerParams = {
        columnDefs: state.columnDefs,
        gridApi,
        uiStore,
        useMetaMngInstId,
        useDctnryId,
        wordDictionarySearchCode,
        searchInput: state.searchInput,
        rowFcData: state.rowFcData,
        agGrid,
        currentRowIndex: state.currentRowIndex,
        sortStateQuery: state.sortStateQuery,
        bindingWordRowData: dataHandlers.bindingWordRowData,
        firstRowSelectedEvent: dataHandlers.firstRowSelectedEvent(dataParams),
        addGridRowData: dataHandlers.addGridRowData(dataParams),
      };

      const utilParams = {
        ...handlerParams,
        searchType: state.searchType,
        tab2GridId: state.tab2GridId,
        chatbotWindowView: state.chatbotWindowView,
        fetchData: dataHandlers.fetchData(dataParams),
        getSortQuery: utils.getSortQuery(state.columnDefs),
      };

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
        handleSortChanged: eventHandlers.handleSortChanged(handlerParams),
        handleScrollChanged: eventHandlers.handleScrollChanged(handlerParams),
        onGridSearchClicked: utils.onGridSearchClicked(utilParams),
        onFilterWindowClosed: utils.onFilterWindowClosed(utilParams),
        onSearchRemove: utils.onSearchRemove(utilParams),
        onSetUserGridSetting: utils.onSetUserGridSetting(utilParams),
        handleBindQuery: utils.handleBindQuery(utilParams),
        fetchData: dataHandlers.fetchData(dataParams),
        getGridInfo: utils.getGridInfo(state.tab2GridId),
        getSortQuery: utils.getSortQuery(state.columnDefs),
      };

      const handleExcelDownload = async (state) => {
        console.log('state : ', state);

        try {
          if (state === 'all') {
            // 🔥 전체 다운로드 - API 응답을 엑셀 파일로 다운로드
            const params = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              dictionarySearchCode: wordDictionarySearchCode.value,
              query: handlerParams.searchInput.value || '',
              sort: utils.getSortQuery(handlerParams.columnDefs) || '',
            };

            console.log('params : ', params);

            const response = await getWordViewDownload(params);
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

            if (
              !dataParams.rowFcData.value ||
              dataParams.rowFcData.value.length === 0
            ) {
              alert('조회된 데이터가 없습니다.');
              return;
            }

            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(
              dataParams.rowFcData.value
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
            사전명: row.dictionaryName || '',
            사전유형: row.wordName[0].type || '',
            단어명: extractCellValue(row.wordName),
            단어영문약어명: row.wordAbbreviationName || '',
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
            { header: '사전명', key: '사전명', width: 25 },
            { header: '사전유형', key: '사전유형', width: 25 },
            { header: '단어명', key: '단어명', width: 40 },
            { header: '단어영문약어명', key: '단어영문약어명', width: 20 },
            { header: '단어유형', key: '단어유형', width: 15 },
            { header: '도메인분류명', key: '도메인분류명', width: 15 },
            { header: '이음동의어목록', key: '이음동의어목록', width: 15 },
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

              // // 순번 컬럼은 중앙 정렬, 나머지는 좌측 정렬
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

      // ============================
      // 팝업 핸들러들
      // ============================
      const onSaveDctnrySrchWrdGridUserStng = () => {
        state.confirmSaveDctnrySrchTab2State.view = true;
      };

      const onRemoveWordHeaderData = () => {
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
      // LIFECYCLE HOOKS
      // ============================
      onBeforeMount(async () => {
        console.log('wordSearch beforeMount  ========================');

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[state.tab2GridId.value]) {
          try {
            const transformedData = await handlers.getGridInfo();
            state.columnDefs.value = transformedData;

            uiStore.setGridColumnDefs('MFGRD005', state.columnDefs.value);
            gridStorage.MFGRD005 = transformedData;
            saveGridInfoToStorage(gridStorage);

            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', state.columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              state.columnDefs.value
            );

            const sortedColumns = state.columnDefs.value
              .filter((col) => col.sort && col.sortIndex !== undefined)
              .sort((a, b) => a.sortIndex - b.sortIndex);

            const sortQuery =
              sortedColumns.length > 0
                ? sortedColumns
                    .map((col) => `${col.headerName} ${col.sort}`)
                    .join(', ')
                : '';

            const researchQuery = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              dictionarySearchCode: wordDictionarySearchCode.value,
              query: state.searchInput.value,
              sort: sortQuery,
            };

            await handlers.fetchData(researchQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          state.columnDefs.value = gridStorage[state.tab2GridId.value];

          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            dictionarySearchCode: wordDictionarySearchCode.value,
            query: state.searchInput.value,
            sort: handlers.getSortQuery(),
          };

          await handlers.fetchData(researchQuery);
        }
      });

      // ============================
      // WATCHERS
      // ============================
      watchEffect(() => {
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD005) {
          state.columnDefs.value = gridColumnDefs.value.MFGRD005;
          return;
        }
        state.columnDefs.value = gridColumnDefs.value.MFGRD005;

        state.columnDefs.value = state.columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;

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

      watch(wordDictionarySearchCode, async (newVal) => {
        const researchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          dictionarySearchCode: newVal,
          query: state.searchInput.value,
          sort: handlers.getSortQuery(),
        };
        await handlers.fetchData(researchQuery);
      });

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
        handleExcelDownload,

        // Popup Handlers
        onSaveDctnrySrchWrdGridUserStng,
        onRemoveWordHeaderData,
        onSaveGridSettingWindow,
        onOpenChatbotWindow,
        onCloseChatbotWindow,

        // Store
        setWordViewSelectData,
      };
    },
  };
</script>
