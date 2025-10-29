<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          기관 목록
          <AppTooltip :htmlContent="getTooltipById('instituteList')">
          </AppTooltip>
        </div>
      </div>
      <div class="top-row"></div>
    </div>
    <div class="grid-wrap">
      <div class="grid-top"></div>
      <div class="grid-list database-grid">
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
</template>

<script>
  import {
    ref,
    reactive,
    watch,
    nextTick,
    onMounted,
    onBeforeMount,
  } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useUiStore } from '@/stores/ui';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';

  import {
    getInstList, // 기관 목록 조회
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  export default {
    components: {
      AppTooltip,
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

        // this.setSelectDatabaseInfo(value);
        this.setSelectInstitute(value);
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

        this.searchBody.query = value;

        if (value === '') {
          this.searchBody.query = '';
          // this.rowData = [];
          await this.fetchData();
        } else {
          this.searchBody.query = transformedQuery;
          await this.fetchData();
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props) {
      const actualizingStore = useActualizingStore();
      const { setSelectColumnData, setIsSaveColumnRefine } = actualizingStore;
      const { isSaveColumnRefine } = storeToRefs(actualizingStore);

      const authStore = useAuthStore();
      const { userMetaMngInstListInfo, userStngInfo, userInstituteAdminList } =
        storeToRefs(authStore);

      const {
        setSelectDatabaseInfo,
        setSaveDatabaseState,
        setDeleteDatabaseState,
        setSelectDatabaseInstituteId,
      } = useSystemMngStore();
      const { saveDatabaseState, newDatabaseId, deleteDatabaseState } =
        storeToRefs(useSystemMngStore());

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const metaMngInstList = userInstituteAdminList.value;

      const uiStore = useUiStore();

      console.log('userMetaMngInstListInfo : ', userMetaMngInstListInfo.value);

      const agGrid = ref(null);
      const gridApi = ref(null);

      const rowData = reactive({});

      const columnRefineGridId = ref('MFGRD110');
      const gridInfoDefs = ref({
        scrnGridId: columnRefineGridId,
        scrnId: '',
      });

      // store
      const { setSaveState, setDeleteState, setSelectInstitute } =
        useSystemMngStore();

      const { setSaveInstState, setNewInstituteId } = useSystemMngStore();

      const { saveState, deleteState, newInstituteId, saveInstState } =
        storeToRefs(useSystemMngStore());

      // selectInstitute를 ref 대신 reactive로 초기화
      const selectInstitute = reactive({
        id: useMetaMngInstId, // 초기값으로 현재 사용자의 기관 ID 설정
        name: '',
      });

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const columnDefs = ref([
        {
          headerName: '기관명',
          field: 'instituteName',
          width: 300,
          cellClass: 'ag-left-aligned-cell',
          cellClassRules: {
            'deleted-row': (params) =>
              params.data && params.data.delYn === true,
          },
          cellRenderer: (params) => {
            if (params.data && params.data.delYn === true) {
              return `<span class="deleted-text">${params.value}</span>`;
            }
            return params.value;
          },
          dragStatus: false,
        },
      ]);

      onBeforeMount(async () => {
        // useMetaMngInstId와 일치하는 항목이 있는지 찾기
        if (metaMngInstList && metaMngInstList.length > 0) {
          const matchedInstitute = metaMngInstList.find(
            (institute) => institute.instituteId === useMetaMngInstId
          );

          if (matchedInstitute) {
            // 일치하는 항목이 있으면 해당 항목 선택
            selectInstitute.id = matchedInstitute.instituteId;
            selectInstitute.name = matchedInstitute.instituteName;
            console.log('useMetaMngInstId와 일치하는 기관으로 설정됨:', {
              id: selectInstitute.id,
              name: selectInstitute.name,
            });
          } else {
            // 일치하는 항목이 없으면 첫 번째 항목 선택
            const firstInstitute = metaMngInstList[0];
            selectInstitute.id = firstInstitute.instituteId;
            selectInstitute.name = firstInstitute.instituteName;
            console.log('일치하는 항목이 없어 첫 번째 기관으로 설정됨:', {
              id: selectInstitute.id,
              name: selectInstitute.name,
              originalId: useMetaMngInstId,
            });
          }

          setSelectDatabaseInstituteId(selectInstitute.id); // 선택된 기관 ID 저장
        } else {
          // 리스트가 비어있을 경우 기본값 사용
          selectInstitute.id = useMetaMngInstId;
          console.log('기본 기관 ID 사용 (리스트 없음):', selectInstitute.id);
          setSelectDatabaseInstituteId(useMetaMngInstId);
        }

        // 초기 데이터 로드
        await fetchData();
      });

      onMounted(async () => {
        await fetchData();
      });

      const firstRowSelectedEvent = () => {
        nextTick(() => {
          const collectionGrid = document.querySelector('.database-grid');

          if (!collectionGrid) {
            console.error('Collection grid not found!');
            return;
          }

          const nodesWithRowId0 = collectionGrid.querySelector('[row-id="0"]');
          console.log('nodeWithRowId0 ========', nodesWithRowId0);

          if (nodesWithRowId0) {
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          }
        });
      };

      const selectedData = ref({});

      const fetchData = async (newDatabaseId) => {
        const instituteList = await getInstList();

        let tempData = [];

        for (let i = 0; i < instituteList.length; i++) {
          tempData.push({
            id: i,
            instituteId: instituteList[i].instituteId,
            instituteName: instituteList[i].instituteName,
            order: instituteList[i].order,
            delYn: instituteList[i].delYn,
          });
        }
        rowData.value = tempData;

        // 신규등록 시
        if (newDatabaseId) {
          nextTick(() => {
            const selectedRow = rowData.value.find(
              (row) => row.databaseId === newDatabaseId
            );

            console.log('selectedRow : ', selectedRow);
            console.log('newDatabaseId : ', newDatabaseId);

            if (selectedRow) {
              // 변수명을 다르게 지정하여 충돌 방지
              const selectedElements = document.querySelectorAll(
                '[class~="ag-row-selected"]'
              );
              // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
              selectedElements.forEach((node) => {
                node.classList.remove('ag-row-selected');
              });

              console.log('selectedRow : ', selectedRow); // 원래의 selectedRow 객체 로깅
              const clickedNode = document.querySelector(
                `[row-id="${selectedRow.id}"]`
              );

              console.log('clickedNode : ', clickedNode);
              if (clickedNode) {
                // clickedNode가 null이 아닌지 확인
                clickedNode.classList.add('ag-row-selected');
                setSelectInstitute(selectedRow);
              } else {
                console.warn(
                  `Element with row-id="${selectedRow.id}" not found`
                );
              }
            }
          });
        } else {
          setSelectInstitute(rowData.value[0]);
          firstRowSelectedEvent(); // 첫 번째 행 선택 이벤트 호출
        }
      };

      fetchData();

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      // 저장 상태 확인
      watch(saveInstState, () => {
        if (saveInstState.value) {
          fetchData();
          setSaveInstState(false);
        }
      });
      // 삭제 상태 확인
      watch(deleteState, () => {
        console.log('deleteState : ', deleteState);
        if (deleteState) {
          fetchData();
        }
      });

      return {
        rowData,
        columnDefs,
        columnRefineGridId,
        gridInfoDefs,
        resultCount,
        agGrid,
        gridApi,
        setSelectColumnData,
        popInfo,
        fetchData,
        metaMngInstList,
        selectInstitute,
        setSelectDatabaseInfo,
        getTooltipById,
        setSelectInstitute,
      };
    },
  };
</script>

<style scoped>
  /* 기존 스타일 유지 */

  /* 삭제된 행에 대한 스타일 */
  :deep(.deleted-row) {
    background-color: #fff5f5;
  }

  :deep(.deleted-text) {
    color: #ff4040;
    text-decoration: line-through;
  }
</style>
