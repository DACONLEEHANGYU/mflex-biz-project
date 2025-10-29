<template>
  <div class="tab-inner">
    <div class="content-top pt5">
      <div class="title-s" style="display: flex; margin-bottom: 10px">
        표준진단결과
        <AppTooltip :htmlContent="getTooltipById('diagnosisResult')">
        </AppTooltip>
      </div>
    </div>
    <div>
      <div class="input-form">
        <table class="input-table" style="margin-bottom: 20px">
          <colgroup>
            <col width="20%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>DB</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <select
                      class="input-select"
                      style="width: 100%"
                      v-model="selectedDatabase"
                    >
                      <option
                        v-for="option in databaseOptions"
                        :key="option.databaseId"
                        :value="option.databaseId"
                      >
                        {{ option.logicalDatabaseName }}
                      </option>
                    </select>
                  </div>
                </div>
              </td>
              <th>스키마</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <select
                      class="input-select"
                      style="width: 100%"
                      v-model="selectedSchema"
                    >
                      <option
                        v-for="option in schemaOptions"
                        :key="option.schemaId"
                        :value="option.schemaName"
                      >
                        {{ option.schemaName }}
                      </option>
                    </select>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <table
          class="input-table"
          style="border-top: 1px solid; margin-bottom: 20px"
        >
          <colgroup>
            <col width="20%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>
                진단항목
                <div
                  class="item-controls"
                  v-if="activeDiagnosisItems.length > 0"
                ></div>
              </th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <!-- 진단항목 리스트 및 표준진단 실행 영역 -->
                    <div
                      class="diagnosis-area"
                      style="display: flex; margin-top: 20px"
                    >
                      <!-- 진단항목 리스트 - 고정 높이 추가 -->
                      <div
                        class="diagnosis-list"
                        style="
                          flex: 7;
                          background-color: #f9f9f9;
                          min-height: 150px;
                          position: relative;
                        "
                      >
                        <div
                          v-if="activeDiagnosisItems.length === 0"
                          class="empty-list-message"
                        >
                          진단항목을 추가하세요
                        </div>
                        <div
                          class="list-item"
                          v-for="(item, index) in activeDiagnosisItems"
                          :key="item.id"
                          style="
                            display: flex;
                            align-items: center;
                            padding: 0px 10px 10px;
                            border-bottom: 1px solid #eee;
                          "
                        >
                          <!-- 체크박스 추가 -->
                          <div class="item-checkbox" style="margin-right: 10px">
                            <input
                              type="checkbox"
                              :id="'check-item-' + item.id"
                              v-model="item.selected"
                              style="width: 18px; height: 18px"
                            />
                          </div>
                          <div
                            class="item-number"
                            :style="{ backgroundColor: item.color }"
                            style="
                              width: 30px;
                              height: 30px;
                              color: white;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              margin-right: 10px;
                            "
                          >
                            {{ index + 1 }}
                          </div>
                          <div
                            class="item-title"
                            :style="{ backgroundColor: item.color }"
                            style="
                              flex: 1;
                              color: white;
                              display: flex;
                              height: 30px;
                              font-size: 14px;
                              padding-left: 10px;
                              align-items: center;
                            "
                          >
                            {{ item.title }}
                          </div>
                        </div>
                      </div>

                      <!-- 표준진단 실행 버튼 -->
                      <div
                        class="diagnosis-execute"
                        style="
                          flex: 3;
                          background-color: #2ca58d;
                          border-radius: 5px;
                          color: white;
                          display: flex;
                          flex-direction: column;
                          align-items: center;
                          justify-content: center;
                          cursor: pointer;
                          height: 150px; /* 고정 높이 추가 */
                        "
                        @click="executeDiagnosis"
                      >
                        <div style="font-size: 1.2em; font-weight: bold">
                          표준진단
                        </div>
                        <div style="font-size: 1.2em; font-weight: bold">
                          실행
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->

    <div class="result-container" style="height: 380px">
      <div class="grid-wrap" style="height: 46%">
        <div class="grid-top">
          <div class="top-row"></div>
        </div>
        <div class="grid-list">
          <AppGrid
            :rowData="resultRowData"
            :columnDefs="resultColumnDefs"
            :context="context"
            :resultCount="resultCount"
            rowSelection="single"
            @gridApi="handleSetGridApi"
            @rowDoubleClicked="onRowDoubleClicked"
            @rowClicked="onRowClicked"
            @body-scroll="handleScrollChanged"
            @sort-changed="handleSortChanged"
            @column-state-changed="handleColumnStateChanged"
            ref="agGrid"
          />
        </div>
        <!-- <div class="grid-bottom"></div> -->
      </div>

      <div class="chart-container">
        <canvas id="acquisitions"></canvas>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    ref,
    reactive,
    onMounted,
    onBeforeUnmount,
    computed,
    onBeforeMount,
    watch,
  } from 'vue';
  import DiagnosisRolesCellrenderer from '@/utils/DiagnosisRolesCellrenderer.js';
  import Chart from 'chart.js/auto';

  import { useUiStore } from '@/stores/ui';

  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { getTermViewSearch } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useDiagnosisStore } from '@/stores/diagnosis';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';
  import {
    getSearchDbName,
    getSchemaListByDatabase,
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import {
    getDbListBySystem,
    getSchemaListBySystem,
  } from '@/utils/mflexApi/systemMng/systemManagementApi.js';

  import {
    getDiagnosis,
    getLatestDiagnosis,
  } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';
  // import { getSchemaListByDatabase } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';
  // 표준진단 실행 API 추가 (실제 API URL로 대체 필요)

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
      AppWindow,
      AppTooltip,
      ChatbotBtn,
      ChatbotWindow,
      DiagnosisRolesCellrenderer,
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

        // result-container 내부의 ag-row-selected 요소만 선택
        const resultContainer = document.querySelector('.result-container');
        const selectedRow = resultContainer.querySelectorAll(
          '[class~="ag-row-selected"]'
        );

        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        // result-container 내부에서만 찾음
        const clickedNode = resultContainer.querySelector(
          `[row-id="${clickNode}"]`
        );
        if (clickedNode) {
          clickedNode.classList.add('ag-row-selected');
        }

        this.$emit('row-selected', value);
        this.setSelectDiagnosisMetricCode(value.diagnosisItem);
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
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            dictionarySearchCode: this.termDictionarySearchCode,
            query: transformedQuery,
            sort: this.getSortQuery(),
          };

          this.termQuery.query = transformedQuery;

          console.log('termQuery.query ========', this.termQuery.query);
          this.rowData.value = [];
          const termResearchResult = await getTermViewSearch(researchQuery);
          console.log('termResearchResult : ', termResearchResult);

          this.serarchDataBinding(termResearchResult);
        }
      },
      // 항목 삭제 메서드 추가
      // 항목 삭제 메서드 수정
      removeItem(id) {
        // 하나 이상의 항목을 유지
        if (this.activeDiagnosisItems.length <= 1) {
          alert('최소 1개의 진단항목이 필요합니다.');
          return;
        }

        this.activeDiagnosisItems = this.activeDiagnosisItems.filter(
          (item) => item.id !== id
        );
      },
      // 모든 항목 초기화 (기본 항목 하나만 남김)
      resetItems() {
        if (confirm('모든 항목을 초기화하시겠습니까?')) {
          this.activeDiagnosisItems = [this.diagnosisItems[0]]; // 첫번째 항목만 유지
        }
      },

      // 모든 항목 복원
      restoreAllItems() {
        this.activeDiagnosisItems = [...this.diagnosisItems];
      },
      // 표준진단 실행 메서드 추가
      async executeDiagnosis() {
        try {
          const loadingOverlay = document.createElement('div');
          loadingOverlay.className = 'diagnosis-loading-overlay';
          loadingOverlay.innerHTML =
            '<div class="loading-spinner"></div><div>진단 중...</div>';
          document.querySelector('.tab-inner').appendChild(loadingOverlay);

          // 이전 하이라이트 효과 제거
          document
            .querySelector('.result-container')
            ?.classList.remove('highlight-result');

          // 활성화된 진단항목들의 코드 가져오기
          const diagnosisMetricCodes = this.activeDiagnosisItems
            .filter((item) => item.selected === true)
            .map((item) => {
              const codeMapping = {
                1: 'STANDARD',
                2: 'STANDARD_DOMAIN',
                3: 'STANDARD_KOREAN_NAME',
                4: 'STANDARD_KOREAN_NAME_DOMAIN',
              };
              return codeMapping[item.id];
            });

          // API 요청 데이터 구성
          const requestData = {
            instituteId: this.useMetaMngInstId,
            databaseId: this.selectedDatabase,
            dictionaryId: this.useDctnryId,
            schemaName: this.selectedSchema,
            diagnosisMetricCodes: diagnosisMetricCodes,
          };

          console.log('표준진단 요청 데이터:', requestData);

          // 진단 실행
          await getDiagnosis(requestData);

          const diagnosisResult = await getLatestDiagnosis(requestData);
          // 로딩 제거
          document.querySelector('.diagnosis-loading-overlay')?.remove();

          console.log('diagnosisResult : ', diagnosisResult);
          this.bindDiagnosisResults(diagnosisResult);

          // 차트 업데이트
          this.updateChart(diagnosisResult);

          // result-container에 하이라이트 적용
          const resultContainer = document.querySelector('.result-container');
          resultContainer.classList.remove('highlight-result');
          void resultContainer.offsetWidth; // DOM 리플로우 강제
          resultContainer.classList.add('highlight-result');

          // 결과 알림 표시
          const resultNotification = document.createElement('div');
          // resultNotification.className = 'diagnosis-result-notification';
          // resultNotification.textContent = '표준진단이 완료되었습니다.';
          document.querySelector('.tab-inner').appendChild(resultNotification);

          // 8초 후 하이라이트 제거
          setTimeout(() => {
            resultContainer.classList.remove('highlight-result');
          }, 8000);
        } catch (error) {
          // 로딩 제거
          document.querySelector('.diagnosis-loading-overlay')?.remove();
          console.error('표준진단 실행 오류:', error);
          alert('표준진단 실행 중 오류가 발생했습니다.');
        }
      },
      // updateChart(diagnosisResults) {
      //   console.log('updateChart 진단결과:', diagnosisResults);

      //   try {
      //     // 데이터 준비
      //     const labels = [];
      //     const complianceData = []; // 준수율 데이터
      //     const errorData = []; // 오류율 데이터
      //     const barBackgroundColor = [];

      //     // metricCode에 따라 데이터 정렬 및 설정
      //     const codeOrder = [
      //       'STANDARD',
      //       'STANDARD_DOMAIN',
      //       'STANDARD_KOREAN_NAME',
      //       'STANDARD_KOREAN_NAME_DOMAIN',
      //     ];

      //     // 색상 매핑
      //     const colorMapping = {
      //       STANDARD: '#1a4968',
      //       STANDARD_DOMAIN: '#3d6e5c',
      //       STANDARD_KOREAN_NAME: '#5d9082',
      //       STANDARD_KOREAN_NAME_DOMAIN: '#8eb9a1',
      //     };

      //     // 라벨 매핑
      //     const labelMapping = {
      //       STANDARD: '표준용어',
      //       STANDARD_DOMAIN: '표준용어[+도메인]',
      //       STANDARD_KOREAN_NAME: '표준용어[한글명포함]',
      //       STANDARD_KOREAN_NAME_DOMAIN: '표준용어(한글명포함)[+도메인]',
      //     };

      //     // 정렬하여 데이터 구성
      //     const sortedResults = [...diagnosisResults].sort((a, b) => {
      //       return (
      //         codeOrder.indexOf(a.diagnosisMetricCode) -
      //         codeOrder.indexOf(b.diagnosisMetricCode)
      //       );
      //     });

      //     // 데이터 구성
      //     sortedResults.forEach((item) => {
      //       labels.push(
      //         labelMapping[item.diagnosisMetricCode] || item.diagnosisMetricCode
      //       );
      //       complianceData.push(parseFloat(item.concordanceRate) || 0);
      //       errorData.push(parseFloat(item.errorRate) || 0); // 오류율 데이터 추가
      //       barBackgroundColor.push(
      //         colorMapping[item.diagnosisMetricCode] || '#1a4968'
      //       );
      //     });

      //     // 새 차트 데이터 구성 - 준수율과 오류율 모두 막대 그래프로 표현
      //     const newData = {
      //       labels: labels,
      //       datasets: [
      //         {
      //           type: 'bar',
      //           label: '준수율',
      //           data: complianceData,
      //           backgroundColor: barBackgroundColor,
      //           borderColor: 'transparent',
      //           borderWidth: 0,
      //           barPercentage: 0.4, // 막대 너비 조정
      //           categoryPercentage: 0.8,
      //           order: 2, // 렌더링 순서 (뒤에 그려짐)
      //           yAxisID: 'y',
      //         },
      //         {
      //           type: 'bar', // bar 타입 유지
      //           label: '오류율',
      //           data: errorData,
      //           backgroundColor: 'rgba(231, 76, 60, 0.7)', // 불투명도 증가로 더 선명하게
      //           borderColor: '#e74c3c',
      //           borderWidth: 1,
      //           barPercentage: 0.4, // 준수율과 동일한 너비
      //           categoryPercentage: 0.8,
      //           order: 1, // 렌더링 순서 (앞에 그려짐)
      //           yAxisID: 'y', // 같은 Y축 사용
      //         },
      //       ],
      //     };

      //     // 기존 차트가 있으면 파괴
      //     if (this.chartInstance) {
      //       this.chartInstance.destroy();
      //     }

      //     // 새 차트 생성
      //     const ctx = document.getElementById('acquisitions');
      //     if (ctx) {
      //       this.chartInstance = new Chart(ctx, {
      //         type: 'bar',
      //         data: newData,
      //         options: {
      //           responsive: true,
      //           maintainAspectRatio: false,
      //           layout: {
      //             padding: {
      //               top: 20,
      //               right: 20,
      //               bottom: 20,
      //               left: 20,
      //             },
      //           },
      //           scales: {
      //             y: {
      //               beginAtZero: true,
      //               max: 100,
      //               display: true,
      //               position: 'left',
      //               grid: {
      //                 display: false,
      //               },
      //             },
      //             x: {
      //               grid: {
      //                 display: false,
      //               },
      //               ticks: {
      //                 maxRotation: 0,
      //                 minRotation: 0,
      //                 callback: function (value) {
      //                   // 긴 라벨은 짧게 표시
      //                   const label = this.getLabelForValue(value);
      //                   if (label.includes('[+도메인]')) {
      //                     return '표준용어+도메인';
      //                   } else if (label.includes('한글명포함')) {
      //                     return '표준용어(한글)';
      //                   } else if (label.includes('한글명포함)[+도메인]')) {
      //                     return '표준용어(한글)+도메인';
      //                   }
      //                   return label;
      //                 },
      //               },
      //             },
      //           },
      //           plugins: {
      //             legend: {
      //               display: true, // 범례 표시
      //               position: 'top',
      //             },
      //             tooltip: {
      //               enabled: true,
      //               mode: 'index', // 같은 x축 값에 대한 모든 데이터 표시
      //               intersect: false,
      //               callbacks: {
      //                 label: function (context) {
      //                   let label = context.dataset.label || '';
      //                   if (label) {
      //                     label += ': ';
      //                   }
      //                   if (context.parsed.y !== null) {
      //                     label += context.parsed.y + '%';
      //                   }
      //                   return label;
      //                 },
      //               },
      //             },
      //           },
      //           // animations 설정 수정
      //           animation: false,
      //           transitions: {
      //             active: {
      //               animation: {
      //                 duration: 0,
      //               },
      //             },
      //           },
      //           // 호버 효과
      //           hover: {
      //             mode: 'index',
      //             intersect: false,
      //             animationDuration: 400,
      //           },
      //         },
      //       });

      //       // 결과 영역 하이라이팅을 위해 차트 컨테이너에 특별 클래스 추가
      //       const chartContainer = document.querySelector('.chart-container');

      //       // 이미 하이라이트가 적용된 경우, 애니메이션 효과를 재시작하기 위해 클래스 제거 후 다시 추가
      //       chartContainer.classList.remove('highlight-result');

      //       // DOM 리플로우를 강제하여 애니메이션이 다시 시작되도록 함
      //       void chartContainer.offsetWidth;

      //       // 하이라이트 클래스 추가
      //       chartContainer.classList.add('highlight-result');

      //       // 8초 후 하이라이팅 제거 (애니메이션과 일치하도록 시간 조정)
      //       setTimeout(() => {
      //         chartContainer.classList.remove('highlight-result');
      //       }, 8000);
      //     } else {
      //       console.error('차트를 그릴 캔버스 요소를 찾을 수 없습니다');
      //     }
      //   } catch (error) {
      //     console.error('차트 업데이트 오류:', error);
      //   }
      // },
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
      const rowData = ref([]);

      const newSetColumnDefs = reactive([]);
      const { useDctnryId, useMetaMngInstId, useInfoSysId } =
        userStngInfo.value;

      const gridApi = ref(null);

      // 사전조회 사전표시 범위 상태
      const { termDictionarySearchCode } = storeToRefs(
        useDictionarySearchStore()
      );
      const { setTermViewSelectData } = useDictionarySearchStore();

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const {
        setSelectTab2DatabaseId,
        setSelectTab2SchemaName,
        setSelectDiagnosisMetricCode,
      } = useDiagnosisStore();

      const selectedDatabase = ref('');
      // setup 함수 내부에 추가
      const databaseList = ref([]);
      // 데이터베이스 옵션을 위한 computed 속성 - 기본 옵션 제거
      const databaseOptions = computed(() => {
        return databaseList.value.map((db) => ({
          databaseId: db.databaseId,
          logicalDatabaseName: db.logicalDatabaseName,
        }));
      });

      const selectedSchema = ref('');
      const schemaList = ref([]);
      const schemaOptions = computed(() => {
        // 문자열 배열을 객체 배열로 변환
        return schemaList.value.map((schemaName, index) => ({
          schemaId: index === 0 ? 'all' : `schema_${index}`, // 첫 번째 항목("전체")은 "all", 나머지는 인덱스 기반 ID
          schemaName: schemaName,
        }));
      });

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

      const tab1GridId = ref('MFGRD300');
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
        scrnId: '',
      });

      const resultColumnDefs = ref([
        {
          headerName: '진단항목',
          field: 'diagnosisItem',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'DiagnosisRolesCellrenderer',
          valueFormatter: (params) => params.value,
          dragStatus: false,
          width: 100,
        },
        {
          headerName: '컬럼수',
          field: 'columnCount',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 100,
        },
        {
          headerName: '오류수',
          field: 'errorCount',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 100,
        },
        {
          headerName: '오류율',
          field: 'errorRate',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 100,
          cellRenderer: 'StatusCellRenderer',
        },
        {
          headerName: '준수율',
          field: 'complianceRate',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 100,
          cellRenderer: 'StatusCellRenderer',
        },
        {
          headerName: '최근진단일시',
          field: 'lastDiagnosisDate',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 160,
          cellRenderer: 'StatusCellRenderer',
        },
      ]);

      const resultRowData = reactive([]);

      const columnDefs = ref([]);

      const resultCount = ref({
        count: '',
        total: '',
      });

      // 진단항목 데이터
      const diagnosisItems = ref([
        { id: 1, title: '표준용어', color: '#1a4968', selected: true },
        { id: 2, title: '표준용어[+도메인]', color: '#3d6e5c', selected: true },
        {
          id: 3,
          title: '표준용어[한글명포함]',
          color: '#5d9082',
          selected: true,
        },
        {
          id: 4,
          title: '표준용어(한글명포함)[+도메인]',
          color: '#8eb9a1',
          selected: true,
        },
      ]);

      // 활성화된 진단항목을 저장할 ref 추가 - 원본 배열 복사
      const activeDiagnosisItems = ref([...diagnosisItems.value]);

      const fetchData = async () => {
        const sampleData1 = [];
        for (let i = 0; i < 4; i++) {
          sampleData1.push({
            id: i,
            no: i + 1,
            diagnosisItem: activeDiagnosisItems.value[i].title,
            columnCount: i + 1,
            errorCount: i + 1,
            errorRate: i + 1 + '%',
            complianceRate: (i + 7) * 10 + '%',
            lastDiagnosisDate: '2023-10-01 12:00:00',
          });
        }
        rowData.value = sampleData1;
      };

      const agGrid = ref(null);

      const chartInstance = ref(null);

      onMounted(() => {
        // 기존 차트 인스턴스를 먼저 체크하고 초기화
        if (chartInstance.value) {
          chartInstance.value.destroy();
        }

        initChart(initialDiagnosisData);
        // fetchData(); // 초기 데이터 로드
      });

      onBeforeUnmount(() => {
        if (chartInstance.value) {
          chartInstance.value.destroy();
        }
      });

      const bindDiagnosisResults = (data) => {
        console.log('bindDiagnosisResults : ', data);

        // metricCode를 항목명으로 매핑하는 함수
        const getMetricTitle = (metricCode) => {
          const metricMapping = {
            STANDARD: '표준용어',
            STANDARD_DOMAIN: '표준용어[+도메인]',
            STANDARD_KOREAN_NAME: '표준용어[한글명포함]',
            STANDARD_KOREAN_NAME_DOMAIN: '표준용어(한글명포함)[+도메인]',
          };

          return metricMapping[metricCode] || metricCode; // 매핑이 없으면 원래 코드 반환
        };

        // 코드 순서 정의
        const codeOrder = [
          'STANDARD',
          'STANDARD_DOMAIN',
          'STANDARD_KOREAN_NAME',
          'STANDARD_KOREAN_NAME_DOMAIN',
        ];

        // 데이터를 정렬하여 순서대로 표시
        const sortedData = [...data].sort((a, b) => {
          return (
            codeOrder.indexOf(a.diagnosisMetricCode) -
            codeOrder.indexOf(b.diagnosisMetricCode)
          );
        });

        resultRowData.value = sortedData.map((item, index) => ({
          id: index,
          no: index + 1,
          diagnosisItem: item.diagnosisMetricCode, // 코드를 항목명으로 변환
          columnCount: item.columnCount,
          errorCount: item.errorCount,
          errorRate: item.errorRate,
          complianceRate: item.concordanceRate,
          lastDiagnosisDate: item.diagnosisDateTime,
        }));
      };

      // 표시용 라벨 매핑 - 함수 외부에 정의하여 재사용
      const displayLabelMapping = {
        STANDARD: '표준용어',
        STANDARD_DOMAIN: '표준용어+도메인',
        STANDARD_KOREAN_NAME: '표준용어(한글)',
        STANDARD_KOREAN_NAME_DOMAIN: '표준용어(한글)+도메인',
      };

      const initChart = (diagnosisData = null) => {
        console.log('initChart 진단데이터:', diagnosisData);
        const ctx = document.getElementById('acquisitions');

        // 기존 차트 인스턴스가 있으면 파괴
        if (chartInstance.value) {
          chartInstance.value.destroy();
        }

        // 데이터가 없는 경우 빈 차트를 그리고 함수 종료
        if (!diagnosisData || diagnosisData.length === 0) {
          console.log('진단 데이터가 없어 빈 차트를 표시합니다.');
          // 빈 차트 생성
          chartInstance.value = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: [],
              datasets: [],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: '표준진단 결과가 없습니다',
                  font: {
                    size: 16,
                  },
                },
              },
            },
          });
          return;
        }

        console.log('진단 데이터로 차트를 그립니다:', diagnosisData);

        // 데이터 준비
        let labels = [];
        let complianceData = [];
        let errorData = [];
        let barBackgroundColor = [];

        // 기본 색상 및 라벨 매핑
        const colorMapping = {
          STANDARD: '#1a4968',
          STANDARD_DOMAIN: '#3d6e5c',
          STANDARD_KOREAN_NAME: '#5d9082',
          STANDARD_KOREAN_NAME_DOMAIN: '#8eb9a1',
        };

        const labelMapping = {
          STANDARD: '표준용어',
          STANDARD_DOMAIN: '표준용어[+도메인]',
          STANDARD_KOREAN_NAME: '표준용어[한글명포함]',
          STANDARD_KOREAN_NAME_DOMAIN: '표준용어(한글명포함)[+도메인]',
        };

        // 코드 순서 정의
        const codeOrder = [
          'STANDARD',
          'STANDARD_DOMAIN',
          'STANDARD_KOREAN_NAME',
          'STANDARD_KOREAN_NAME_DOMAIN',
        ];

        // 정렬하여 데이터 구성
        const sortedResults = [...diagnosisData].sort((a, b) => {
          return (
            codeOrder.indexOf(a.diagnosisMetricCode) -
            codeOrder.indexOf(b.diagnosisMetricCode)
          );
        });

        // 데이터 구성
        sortedResults.forEach((item) => {
          labels.push(
            labelMapping[item.diagnosisMetricCode] || item.diagnosisMetricCode
          );
          complianceData.push(parseFloat(item.concordanceRate) || 0);
          errorData.push(parseFloat(item.errorRate) || 0);
          barBackgroundColor.push('#1a4968');
        });

        // initChart 함수 내 데이터셋 부분 수정
        const chartData = {
          labels: labels,
          datasets: [
            {
              type: 'bar',
              label: '준수율',
              data: complianceData,
              backgroundColor: barBackgroundColor,
              borderColor: 'transparent',
              borderWidth: 0,
              barPercentage: 0.4, // 막대 너비 유지하되 stack 제거
              categoryPercentage: 0.8, // 이전에 1.0이었으나 0.8로 변경
              order: 1,
              yAxisID: 'y',
            },
            // 오류율 데이터셋 제거
          ],
        };

        if (ctx) {
          chartInstance.value = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              layout: {
                padding: {
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    display: false,
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    maxRotation: 0,
                    minRotation: 0,
                    callback: function (value, index) {
                      // 메트릭 코드 기반 직접 매핑
                      const label = this.getLabelForValue(value);
                      if (!label) return '';

                      switch (label) {
                        case '표준용어':
                          return '표준용어';
                        case '표준용어[+도메인]':
                          return '표준용어+도메인';
                        case '표준용어[한글명포함]':
                          return '표준용어(한글)';
                        case '표준용어(한글명포함)[+도메인]':
                          return '표준용어(한글)+도메인';
                        default:
                          return label;
                      }
                    },
                  },
                },
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                },
                tooltip: {
                  enabled: true,
                  mode: 'index',
                  intersect: false,
                  callbacks: {
                    title: function (tooltipItems) {
                      return chartData.labels[tooltipItems[0].dataIndex];
                    },
                    label: function (context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += context.parsed.y + '%';
                      }
                      return label;
                    },
                  },
                },
              },
              animation: false,
              animations: false,
              transitions: {
                active: {
                  animation: {
                    duration: 0,
                  },
                },
              },
              hover: {
                mode: 'index',
                intersect: false,
                animationDuration: 400,
              },
            },
          });
        }
      };

      // 참조 변수 설정
      let initialDiagnosisData = null;

      onBeforeMount(async () => {
        // 데이터베이스 목록 조회

        const dbData = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
        };

        const dbList = await getDbListBySystem(dbData);

        databaseList.value = dbList;

        // 데이터가 있으면 첫 번째 항목을 기본 선택
        if (databaseList.value && databaseList.value.length > 0) {
          selectedDatabase.value = databaseList.value[0].databaseId;
        }

        // 선택 databaseId 초기화
        setSelectTab2DatabaseId(databaseList.value[0].databaseId);

        const data = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
          databaseId: selectedDatabase.value,
        };

        const schemaListData = await getSchemaListBySystem(data);
        console.log('스키마 목록:', schemaListData);

        const schemaNames = schemaListData.map((schema) => schema.schemaName);

        schemaList.value = schemaNames;

        if (schemaList.value && schemaList.value.length > 0) {
          selectedSchema.value = schemaList.value[0];
        }

        // 선택 schemaName 초기화
        setSelectTab2SchemaName(selectedSchema.value);

        // 초기 그리드 초기화
        resultRowData.value = [];

        setSelectDiagnosisMetricCode('STANDARD');

        // 최신 진단 결과 조회
        const params = {
          instituteId: useMetaMngInstId,
          databaseId: selectedDatabase.value,
          schemaName: selectedSchema.value,
        };

        try {
          console.log('최초 로딩시 최신 진단 결과 조회 파라미터:', params);
          const latestDiagnosis = await getLatestDiagnosis(params);
          console.log('최초 로딩시 최신 진단 결과:', latestDiagnosis);

          // 결과가 있으면 데이터 바인딩
          if (latestDiagnosis && latestDiagnosis.length > 0) {
            bindDiagnosisResults(latestDiagnosis);
            // 참조 변수에 저장하여 onMounted에서 사용
            initialDiagnosisData = latestDiagnosis;
            initChart(latestDiagnosis);
          }
        } catch (error) {
          console.error('최신 진단 결과 조회 오류:', error);
        }
      });

      const updateChart = (diagnosisResults) => {
        console.log('updateChart 진단결과:', diagnosisResults);

        try {
          // 데이터 준비
          const labels = [];
          const complianceData = []; // 준수율 데이터
          const errorData = []; // 오류율 데이터
          const barBackgroundColor = [];

          // metricCode에 따라 데이터 정렬 및 설정
          const codeOrder = [
            'STANDARD',
            'STANDARD_DOMAIN',
            'STANDARD_KOREAN_NAME',
            'STANDARD_KOREAN_NAME_DOMAIN',
          ];

          // // 색상 매핑
          // const colorMapping = {
          //   STANDARD: '#1a4968',
          //   STANDARD_DOMAIN: '#3d6e5c',
          //   STANDARD_KOREAN_NAME: '#5d9082',
          //   STANDARD_KOREAN_NAME_DOMAIN: '#8eb9a1',
          // };

          // 라벨 매핑
          const labelMapping = {
            STANDARD: '표준용어',
            STANDARD_DOMAIN: '표준용어[+도메인]',
            STANDARD_KOREAN_NAME: '표준용어[한글명포함]',
            STANDARD_KOREAN_NAME_DOMAIN: '표준용어(한글명포함)[+도메인]',
          };

          // 정렬하여 데이터 구성
          const sortedResults = [...diagnosisResults].sort((a, b) => {
            return (
              codeOrder.indexOf(a.diagnosisMetricCode) -
              codeOrder.indexOf(b.diagnosisMetricCode)
            );
          });

          // 데이터 구성
          sortedResults.forEach((item) => {
            labels.push(
              labelMapping[item.diagnosisMetricCode] || item.diagnosisMetricCode
            );
            complianceData.push(parseFloat(item.concordanceRate) || 0);
            errorData.push(parseFloat(item.errorRate) || 0); // 오류율 데이터 추가
            barBackgroundColor.push('#1a4968');
          });

          // 새 차트 데이터 구성 - 준수율과 오류율 모두 막대 그래프로 표현
          const newData = {
            labels: labels,
            datasets: [
              {
                type: 'bar',
                label: '준수율',
                data: complianceData,
                backgroundColor: barBackgroundColor,
                borderColor: 'transparent',
                borderWidth: 0,
                barPercentage: 0.4,
                categoryPercentage: 0.6, // 1.0에서 0.8로 변경
                order: 1,
                yAxisID: 'y',
              },
              // 오류율 데이터셋 제거
            ],
          };

          // 기존 차트가 있으면 파괴
          if (chartInstance.value) {
            chartInstance.value.destroy();
          }

          // 새 차트 생성
          const ctx = document.getElementById('acquisitions');
          if (ctx) {
            chartInstance.value = new Chart(ctx, {
              type: 'bar',
              data: newData,
              options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                  padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    display: true,
                    position: 'left',
                    grid: {
                      display: false,
                    },
                  },
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      maxRotation: 0,
                      minRotation: 0,
                      callback: function (value, index) {
                        // 메트릭 코드 기반 직접 매핑
                        const label = this.getLabelForValue(value);
                        if (!label) return '';

                        switch (label) {
                          case '표준용어':
                            return '표준용어';
                          case '표준용어[+도메인]':
                            return '표준용어+도메인';
                          case '표준용어[한글명포함]':
                            return '표준용어(한글)';
                          case '표준용어(한글명포함)[+도메인]':
                            return '표준용어(한글)+도메인';
                          default:
                            return label;
                        }
                      },
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: true, // 범례 표시
                    position: 'top',
                  },
                  tooltip: {
                    enabled: true,
                    mode: 'index', // 같은 x축 값에 대한 모든 데이터 표시
                    intersect: false,
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += context.parsed.y + '%';
                        }
                        return label;
                      },
                    },
                  },
                },
                // animations 설정 수정
                animation: false,
                transitions: {
                  active: {
                    animation: {
                      duration: 0,
                    },
                  },
                },
                // 호버 효과
                hover: {
                  mode: 'index',
                  intersect: false,
                  animationDuration: 400,
                },
              },
            });

            // result-container에 하이라이트 적용
            const resultContainer = document.querySelector('.result-container');
            resultContainer.classList.remove('highlight-result');
            void resultContainer.offsetWidth; // DOM 리플로우 강제
            resultContainer.classList.add('highlight-result');

            // 8초 후 하이라이트 제거
            setTimeout(() => {
              resultContainer.classList.remove('highlight-result');
            }, 3000);
          } else {
            console.error('차트를 그릴 캔버스 요소를 찾을 수 없습니다');
          }
        } catch (error) {
          console.error('차트 업데이트 오류:', error);
        }
      };

      watch(selectedDatabase, async (newValue) => {
        console.log('selectedDatabase:', newValue);
        setSelectTab2DatabaseId(newValue);

        const data = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
          databaseId: newValue,
        };

        const schemaListData = await getSchemaListBySystem(data);
        console.log('schemaList:', schemaListData);
        const schemaNames = schemaListData.map((schema) => schema.schemaName);
        schemaList.value = schemaNames;

        if (schemaList.value && schemaList.value.length > 0) {
          selectedSchema.value = schemaList.value[0];
          setSelectTab2SchemaName(schemaList.value[0]);

          // 최신 진단 결과 로드
          const params = {
            instituteId: useMetaMngInstId,
            databaseId: newValue,
            schemaName: schemaList.value[0],
          };

          try {
            const latestDiagnosis = await getLatestDiagnosis(params);
            console.log(
              '데이터베이스 변경 후 최신 진단 결과:',
              latestDiagnosis
            );

            // 결과가 있으면 바인딩 및 차트 업데이트
            if (latestDiagnosis && latestDiagnosis.length > 0) {
              bindDiagnosisResults(latestDiagnosis);
              updateChart(latestDiagnosis);
            } else {
              // 결과가 없으면 초기화
              resultRowData.value = [];
              initChart(null); // 빈 차트 표시
            }
          } catch (error) {
            console.error('진단 결과 로드 오류:', error);
            resultRowData.value = [];
            initChart(null); // 오류 시 빈 차트 표시
          }
        } else {
          resultRowData.value = [];
          initChart(null); // 스키마가 없을 경우 빈 차트 표시
        }
      });

      watch(selectedSchema, async (newValue) => {
        console.log('selectedSchema:', newValue);
        setSelectTab2SchemaName(newValue);

        // 최신 진단 결과 로드
        if (newValue) {
          const params = {
            instituteId: useMetaMngInstId,
            databaseId: selectedDatabase.value,
            schemaName: newValue,
          };

          try {
            const latestDiagnosis = await getLatestDiagnosis(params);
            console.log('스키마 변경 후 최신 진단 결과:', latestDiagnosis);

            // 결과가 있으면 바인딩 및 차트 업데이트
            if (latestDiagnosis && latestDiagnosis.length > 0) {
              bindDiagnosisResults(latestDiagnosis);
              updateChart(latestDiagnosis);
            } else {
              // 결과가 없으면 초기화
              resultRowData.value = [];
              initChart(null); // 빈 차트 표시
            }
          } catch (error) {
            console.error('진단 결과 로드 오류:', error);
            resultRowData.value = [];
            initChart(null); // 오류 시 빈 차트 표시
          }
        }
      });

      return {
        agGrid,
        rowData,
        resultRowData,
        resultCount,
        useDctnryId,
        useMetaMngInstId,
        gridInfoDefs, // 그리드 Info
        newSetColumnDefs,
        handleSetGridApi,
        tab1GridId,
        columnDefs,
        diagnosisItems,
        activeDiagnosisItems, // 활성화된 진단항목 추가
        // searhType 변경
        handleChangeSearchType,
        searchType,
        columnDefsUpdate,
        gridApi,
        searchInput,
        setTermViewSelectData,
        termDictionarySearchCode,
        resultColumnDefs,
        databaseOptions,
        selectedDatabase,
        schemaList,
        schemaOptions,
        selectedSchema,
        chartInstance, // 차트 인스턴스 공개
        bindDiagnosisResults,
        setSelectDiagnosisMetricCode,
        updateChart,
        getTooltipById,
      };
    },
  };
</script>

<style scoped>
  .content-top .title-s {
    font-size: 15px;
    font-weight: 600;
    height: 29px;
    display: flex;
    align-items: center;
  }

  .input-form .input-table th {
    text-align: center;
    font-size: 16px;
  }

  .chart-container {
    position: relative;
    width: 680px;
    height: 220px;
    margin: 0 auto;
  }

  .chart-container canvas {
    width: 100% !important;
    height: 100% !important;
  }

  .diagnosis-execute:hover {
    background-color: #249e85 !important;
    transition: background-color 0.3s ease;
  }

  .empty-list-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #aaa;
    font-size: 14px;
  }

  /* 결과 컨테이너 스타일 - 통합된 효과 적용 */
  .result-container {
    box-sizing: border-box;
    position: relative;
    transition: all 0.5s ease;
  }

  /* 하이라이트 효과를 result-container에 적용 */
  .result-container.highlight-result {
    box-shadow: 0 0 15px rgba(44, 165, 141, 0.5);
  }

  .result-container.highlight-result::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 3px solid #2ca58d;
    pointer-events: none;
    z-index: 5;
    animation: glowing 2s infinite alternate;
  }

  .result-container.highlight-result::after {
    content: '업데이트 완료';
    position: absolute;
    top: -10px;
    right: 10px;
    background-color: #2ca58d;
    color: white;
    padding: 2px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    z-index: 6;
    animation: fadeInOut 7s ease-in-out forwards;
  }

  /* 필수 애니메이션 효과만 유지 */
  @keyframes glowing {
    0% {
      box-shadow: 0 0 5px rgba(44, 165, 141, 0.5);
    }
    100% {
      box-shadow: 0 0 15px rgba(44, 165, 141, 0.8);
    }
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  /* 진단 중 로딩 오버레이와 알림 스타일 유지 */
  .diagnosis-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #2ca58d;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .diagnosis-result-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #2ca58d;
    color: white;
    padding: 15px 25px;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    font-weight: bold;
    animation: slideIn 0.5s ease-out, stayVisible 7s forwards;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes stayVisible {
    0% {
      opacity: 1;
      transform: translateX(0);
    }
    85% {
      opacity: 1;
      transform: translateX(0);
    }
    100% {
      opacity: 0;
      transform: translateX(10px);
    }
  }
</style>
