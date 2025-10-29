<template>
  <div class="tab-inner">
    <div class="content-top pt5">
      <div class="title-s">
        진단항목추세
        <AppTooltip :htmlContent="getTooltipById('diagnosisTrend')">
        </AppTooltip>
      </div>
    </div>

    <!-- 기간 설정 항목 추가 -->
    <div class="date-filter-container">
      <div class="date-picker-group">
        <label for="startDate">시작일</label>
        <input
          type="date"
          id="startDate"
          v-model="startDate"
          class="date-input"
          @change="handleDateChange"
        />
      </div>
      <div class="date-filter-separator">~</div>
      <div class="date-picker-group">
        <label for="endDate">종료일</label>
        <input
          type="date"
          id="endDate"
          v-model="endDate"
          class="date-input"
          @change="handleDateChange"
        />
      </div>
      <!-- <button class="search-btn" @click="loadData">조회</button> -->
    </div>

    <!-- 차트 영역 -->
    <div class="chart-container"></div>
  </div>
</template>
<script>
  import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { useAuthStore } from '@/stores/auth';
  import {
    getDiagnosisHistory,
    getHistorySampling,
  } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import Chart from 'chart.js/auto';
  import { useDiagnosisStore } from '@/stores/diagnosis.js';
  import { storeToRefs } from 'pinia';

  export default {
    components: {
      AppTooltip,
    },
    setup() {
      // 스토어에서 정보 가져오기
      const { selectHistoryDatabaseId, selectHistorySchemaName } = storeToRefs(
        useDiagnosisStore()
      );
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId } = userStngInfo.value;

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      // 차트 인스턴스
      const chart = ref(null);
      // 처리된 데이터
      const processedData = ref([]);

      // 날짜 필터 추가
      const startDate = ref('');
      const endDate = ref('');

      // 날짜 초기화 함수
      const initDateFilters = () => {
        const today = new Date();
        // 기본값: 오늘부터 30일 전
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        startDate.value = thirtyDaysAgo.toISOString().split('T')[0];
        endDate.value = today.toISOString().split('T')[0];
      };

      // 날짜 변경 핸들러
      const handleDateChange = async () => {
        console.log('날짜 변경:', startDate.value, endDate.value);
        // 종료일이 시작일보다 이전이면 조정
        if (
          startDate.value &&
          endDate.value &&
          endDate.value < startDate.value
        ) {
          endDate.value = startDate.value;
        }

        await loadData(); // 데이터 로드
      };

      // 메트릭 코드에 따른 표시 이름 반환
      const getMetricDisplayName = (metricCode) => {
        switch (metricCode) {
          case 'STANDARD':
            return '표준용어';
          case 'STANDARD_DOMAIN':
            return '표준용어(도메인)';
          case 'STANDARD_KOREAN_NAME':
            return '표준용어(한글명)';
          case 'STANDARD_KOREAN_NAME_DOMAIN':
            return '표준용어(한글명+도메인)';
          default:
            return metricCode;
        }
      };

      // historyData 처리 함수
      const processHistoryData = (historyData) => {
        console.log('진단 이력 데이터:', historyData);

        if (!historyData || !historyData.items.length) return [];

        // 날짜별 그룹화
        const groupedByDate = {};

        historyData.items.forEach((item) => {
          // 날짜만 추출 (시간 제외)
          const dateOnly = item.diagnosisDateTime.split(' ')[0];

          if (!groupedByDate[dateOnly]) {
            groupedByDate[dateOnly] = {};
          }

          // 진단 메트릭 코드를 키로 사용
          groupedByDate[dateOnly][item.diagnosisMetricCode] = {
            complianceRate: 100 - item.diagnosisErrorRate, // 준수율 계산 (100 - 오류율)
            columnCount: item.diagnosisColumnCount,
            errorCount: item.diagnosisErrorCount,
            errorRate: item.diagnosisErrorRate,
            metricName: item.diagnosisMetricName,
          };
        });

        console.log('날짜별 그룹화 결과:', groupedByDate);

        // 형식 변환: 차트 데이터 형식으로
        const processedDataArray = Object.keys(groupedByDate).map((date) => {
          const dateData = {
            date: date,
          };

          // 각 메트릭 추가
          [
            'STANDARD',
            'STANDARD_DOMAIN',
            'STANDARD_KOREAN_NAME',
            'STANDARD_KOREAN_NAME_DOMAIN',
          ].forEach((metric) => {
            dateData[metric] = groupedByDate[date][metric] || {
              complianceRate: 0,
              columnCount: 0,
              errorCount: 0,
              errorRate: 0,
              metricName: getMetricDisplayName(metric),
            };
          });

          return dateData;
        });

        // 날짜순 정렬
        return processedDataArray.sort((a, b) => a.date.localeCompare(b.date));
      };

      // 차트 초기화 함수 수정 부분
      const initChart = (data) => {
        try {
          console.log('차트 초기화 시작, 데이터: ', data);

          // 1. 이전 차트 인스턴스가 있다면 명시적으로 정리
          if (chart.value) {
            chart.value.destroy();
            chart.value = null;
          }

          // 2. 데이터 유효성 검사
          if (!data || data.length === 0) {
            console.log('차트 데이터가 없습니다');
            return;
          }

          // 3. 차트 컨테이너와 캔버스 재생성 (중요: 이 방법으로 많은 문제 해결)
          const chartContainer = document.querySelector('.chart-container');
          if (!chartContainer) {
            console.error('차트 컨테이너를 찾을 수 없습니다');
            return;
          }

          // 기존 캔버스 제거 후 새로 생성
          chartContainer.innerHTML = '';
          const canvas = document.createElement('canvas');
          canvas.id = 'trendChart';
          chartContainer.appendChild(canvas);

          // 4. Chart.js 옵션 설정
          const options = {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // 애니메이션 비활성화로 안정성 향상
            elements: {
              line: {
                tension: 0.3,
                fill: false, // 모든 라인의 기본 채우기 비활성화
                borderWidth: 3,
              },
              point: {
                radius: 6,
                hoverRadius: 8,
                borderWidth: 1.5,
              },
            },
            interaction: {
              mode: 'nearest',
              intersect: false,
            },
            scales: {
              y: {
                beginAtZero: true,
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: '준수율 (%)',
                },
              },
              x: {
                title: {
                  display: true,
                  text: '날짜',
                },
                ticks: {
                  maxRotation: 0,
                  minRotation: 0,
                },
              },
            },
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  boxWidth: 10,
                  padding: 20,
                },
              },
              tooltip: {
                enabled: true,
                callbacks: {
                  title: function (tooltipItems) {
                    return '날짜: ' + tooltipItems[0].label;
                  },
                  label: function (context) {
                    const datasetLabel = context.dataset.label || '';
                    const index = context.dataIndex;
                    const dataPoint = data[index];

                    if (!dataPoint) return [datasetLabel];

                    const itemKey =
                      context.datasetIndex === 0
                        ? 'STANDARD'
                        : context.datasetIndex === 1
                        ? 'STANDARD_DOMAIN'
                        : context.datasetIndex === 2
                        ? 'STANDARD_KOREAN_NAME'
                        : 'STANDARD_KOREAN_NAME_DOMAIN';

                    const item = dataPoint[itemKey];

                    if (!item) return [datasetLabel];

                    // 상세 정보 포맷
                    return [
                      `${datasetLabel}`,
                      `준수율: ${item.complianceRate.toFixed(2)}%`,
                      `컬럼수: ${item.columnCount}개`,
                      `오류수: ${item.errorCount}개`,
                      `오류율: ${item.errorRate}%`,
                    ];
                  },
                },
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                displayColors: true,
              },
            },
          };

          // 5. 차트 데이터 설정 - 간소화된 버전
          const chartData = {
            labels: data.map((item) => item.date),
            datasets: [
              {
                label: '표준용어',
                data: data.map((item) => item.STANDARD?.complianceRate || 0),
                borderColor: '#1a496a',
                backgroundColor: 'transparent',
                pointBackgroundColor: '#1a496a',
                pointBorderColor: '#fff',
              },
              {
                label: '표준용어[+도메인]',
                data: data.map(
                  (item) => item.STANDARD_DOMAIN?.complianceRate || 0
                ),
                borderColor: '#3d6e5c',
                backgroundColor: 'transparent',
                pointBackgroundColor: '#3d6e5c',
                pointBorderColor: '#fff',
              },
              {
                label: '표준용어(한글명포함)',
                data: data.map(
                  (item) => item.STANDARD_KOREAN_NAME?.complianceRate || 0
                ),
                borderColor: '#5d9082',
                backgroundColor: 'transparent',
                pointBackgroundColor: '#5d9082',
                pointBorderColor: '#fff',
              },
              {
                label: '표준용어(한글명포함)[+도메인]',
                data: data.map(
                  (item) =>
                    item.STANDARD_KOREAN_NAME_DOMAIN?.complianceRate || 0
                ),
                borderColor: '#8eb9a1',
                backgroundColor: 'transparent',
                pointBackgroundColor: '#8eb9a1',
                pointBorderColor: '#fff',
              },
            ],
          };

          // 6. 안전하게 차트 생성
          // 비동기적으로 차트 생성 (DOM 업데이트 후)
          setTimeout(() => {
            try {
              chart.value = new Chart(canvas, {
                type: 'line',
                data: chartData,
                options: options,
              });
              console.log('차트 생성 완료');
            } catch (error) {
              console.error('차트 생성 중 오류 발생:', error);
            }
          }, 0);
        } catch (error) {
          console.error('차트 초기화 전체 오류:', error);
        }
      };

      // 차트 업데이트 함수 - 단순화
      const updateChart = () => {
        try {
          // 데이터가 없으면 return
          if (!processedData.value || processedData.value.length === 0) {
            console.log('업데이트할 데이터가 없습니다');
            return;
          }

          // 차트가 없으면 초기화
          if (!chart.value) {
            initChart(processedData.value);
            return;
          }

          // 차트가 있으면 데이터만 업데이트하지 않고 차트를 재생성
          initChart(processedData.value);
        } catch (error) {
          console.error('차트 업데이트 오류:', error);
        }
      };

      // 데이터 로드 함수 - 단순화
      // 데이터 로드 함수 - 수정
      const loadData = async () => {
        let isLoading = false;

        try {
          isLoading = true;

          console.log('데이터 로드 시작');

          // 로딩 효과 시작 - 차트 컨테이너에 updating 클래스 추가
          const chartContainer = document.querySelector('.chart-container');
          if (chartContainer) {
            chartContainer.classList.add('updating');
          }

          if (!useMetaMngInstId || !selectHistoryDatabaseId.value) {
            console.log('필요한 파라미터가 없습니다.');
            return;
          }

          // 네 가지 진단항목 정의
          const diagnosticItems = [
            {
              code: 'STANDARD',
              name: '표준용어',
              query: "진단항목 = '표준용어'",
            },
            {
              code: 'STANDARD_DOMAIN',
              name: '표준용어[+도메인]',
              query: "진단항목 = '표준용어[+도메인]'",
            },
            {
              code: 'STANDARD_KOREAN_NAME',
              name: '표준용어(한글명포함)',
              query: "진단항목 = '표준용어(한글명포함)'",
            },
            {
              code: 'STANDARD_KOREAN_NAME_DOMAIN',
              name: '표준용어(한글명포함)[+도메인]',
              query: "진단항목 = '표준용어(한글명포함)[+도메인]'",
            },
          ];

          // 모든 진단항목에 대한 데이터를 가져오기 위한 병렬 호출
          const allResults = await Promise.all(
            diagnosticItems.map(async (item) => {
              const params = {
                instituteId: useMetaMngInstId,
                databaseId: selectHistoryDatabaseId.value,
                schemaName: selectHistorySchemaName.value || '',
                diagnosisMetricCode: item.code,
                startDate: startDate.value,
                endDate: endDate.value,
              };

              console.log(`API 요청 파라미터(${item.name}):`, params);
              try {
                const result = await getHistorySampling(params);
                console.log(`${item.name} 진단 이력 데이터:`, result);
                return { item, data: result };
              } catch (error) {
                console.error(`${item.name} 조회 중 오류:`, error);
                return { item, data: { items: [] } };
              }
            })
          );

          // 모든 데이터를 날짜별로 통합
          const combinedData = {};

          // 각 진단항목의 데이터를 날짜별로 분류
          allResults.forEach(({ item, data }) => {
            if (!data || !data.items || data.items.length === 0) return;

            data.items.forEach((record) => {
              const dateOnly = record.diagnosisDateTime.split(' ')[0];

              if (!combinedData[dateOnly]) {
                combinedData[dateOnly] = {};
              }

              combinedData[dateOnly][item.code] = {
                complianceRate: 100 - record.diagnosisErrorRate,
                columnCount: record.diagnosisColumnCount,
                errorCount: record.diagnosisErrorCount,
                errorRate: record.diagnosisErrorRate,
                metricName: record.diagnosisMetricName || item.name,
              };
            });
          });

          // 차트용 데이터 형식으로 변환
          const chartData = Object.keys(combinedData).map((date) => {
            const entry = { date };

            // 각 진단항목별 데이터 추가
            diagnosticItems.forEach((item) => {
              entry[item.code] = combinedData[date][item.code] || {
                complianceRate: 0,
                columnCount: 0,
                errorCount: 0,
                errorRate: 0,
                metricName: item.name,
              };
            });

            return entry;
          });

          // 날짜 기준 정렬
          const sortedData = chartData.sort((a, b) =>
            a.date.localeCompare(b.date)
          );

          console.log('가공된 차트 데이터:', sortedData);
          processedData.value = sortedData;
          // 데이터 처리가 완료된 후 차트 초기화 시작
          if (sortedData && sortedData.length > 0) {
            // 충분한 지연 시간 부여
            setTimeout(() => {
              initChart(sortedData);

              // 로딩 효과 종료 - 약간의 지연 후 updating 클래스 제거
              setTimeout(() => {
                if (chartContainer) {
                  chartContainer.classList.remove('updating');
                }
              }, 500); // 차트 렌더링 후 0.5초 더 효과 유지
            }, 300);
          } else {
            console.log('표시할 데이터가 없습니다');
            const chartContainer = document.querySelector('.chart-container');
            setTimeout(() => {
              if (chartContainer) {
                chartContainer.classList.remove('updating');
              }
            }, 500); // 차트 렌더링 후 0.5초 더 효과 유지
            showEmptyChart(); // 빈 차트 표시 함수 호출
          }
        } catch (error) {
          console.error('데이터 로드 오류:', error);

          // 오류 발생 시에도 로딩 효과 종료
          const chartContainer = document.querySelector('.chart-container');
          if (chartContainer) {
            chartContainer.classList.remove('updating');
          }
        }
      };

      // 차트 크기 조정 핸들러
      const handleResize = () => {
        if (chart.value) {
          chart.value.resize();
        }
      };

      // 컴포넌트 마운트 시
      onMounted(() => {
        console.log('컴포넌트 마운트 - 데이터 로드 시작');

        // 날짜 필터 초기화
        initDateFilters();

        // DOM이 완전히 렌더링된 후 데이터 로드 시작
        setTimeout(() => {
          loadData();
        }, 300);

        // 창 크기 변경 이벤트 리스너 등록
        window.addEventListener('resize', handleResize);
      });

      // 빈 차트를 표시하는 함수 추가
      const showEmptyChart = () => {
        try {
          // 이전 차트 인스턴스가 있다면 명시적으로 정리
          if (chart.value) {
            chart.value.destroy();
            chart.value = null;
          }

          // 차트 컨테이너 찾기
          const chartContainer = document.querySelector('.chart-container');
          if (!chartContainer) {
            console.error('차트 컨테이너를 찾을 수 없습니다');
            return;
          }

          // 기존 캔버스 제거 및 새로운 캔버스 생성
          chartContainer.innerHTML = '';
          const canvas = document.createElement('canvas');
          canvas.id = 'trendChart';
          chartContainer.appendChild(canvas);

          // 빈 메시지를 표시할 div 생성
          const messageDiv = document.createElement('div');
          messageDiv.className = 'empty-chart-message';
          messageDiv.textContent = '표시할 데이터가 없습니다';
          chartContainer.appendChild(messageDiv);

          // 빈 차트 옵션
          const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: '준수율 (%)',
                },
              },
              x: {
                title: {
                  display: true,
                  text: '날짜',
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          };

          // 빈 데이터로 차트 생성
          const emptyData = {
            labels: [],
            datasets: [],
          };

          // 차트 생성
          setTimeout(() => {
            try {
              chart.value = new Chart(canvas, {
                type: 'line',
                data: emptyData,
                options: options,
              });
            } catch (error) {
              console.error('빈 차트 생성 중 오류 발생:', error);
            }
          }, 0);
        } catch (error) {
          console.error('빈 차트 표시 중 오류:', error);
        }
      };

      // 컴포넌트 언마운트 시
      onBeforeUnmount(() => {
        console.log('컴포넌트 언마운트');

        // 명시적으로 차트와 이벤트 리스너 정리
        if (chart.value) {
          chart.value.destroy();
          chart.value = null;
        }

        window.removeEventListener('resize', handleResize);

        // 캔버스 요소 정리
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
          chartContainer.innerHTML = '';
        }
      });

      // DB ID 변경 감시
      watch(selectHistoryDatabaseId, async (newValue) => {
        console.log('데이터베이스 ID 변경:', newValue);
        if (newValue) {
          await loadData();
        }
      });

      // 스키마명 변경 감시
      watch(selectHistorySchemaName, async (newValue) => {
        console.log('스키마 이름 변경:', newValue);
        if (newValue) {
          await loadData();
        }
      });

      return {
        updateChart,
        loadData,
        startDate,
        endDate,
        handleDateChange,
        getTooltipById,
      };
    },
  };
</script>

<style scoped>
  .tab-inner {
    padding: 15px;
    background-color: white;
  }

  .title-s {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* 날짜 필터 스타일 추가 */
  .date-filter-container {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
  }

  .date-picker-group {
    display: flex;
    align-items: center;
    margin-right: 10px;
  }

  .date-picker-group label {
    margin-right: 8px;
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  .date-input {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
    width: 150px;
  }

  .date-filter-separator {
    margin: 0 10px;
    font-weight: bold;
    color: #555;
  }

  .search-btn {
    margin-left: auto;
    padding: 6px 20px;
    background-color: #3d6e5c;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .search-btn:hover {
    background-color: #2a4d40;
  }

  .chart-container {
    height: 570px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    padding: 15px;
    background-color: white;
    margin-top: 10px;
    position: relative;
    transition: all 0.3s ease-in-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  }

  /* 데이터 변경 시 시각적 효과를 위한 클래스 */
  .chart-container.updating {
    border-color: #3d6e5c;
    box-shadow: 0 3px 12px rgba(61, 110, 92, 0.15);
  }

  .empty-chart-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #666;
    font-size: 16px;
    text-align: center;
    padding: 20px;
  }
</style>
