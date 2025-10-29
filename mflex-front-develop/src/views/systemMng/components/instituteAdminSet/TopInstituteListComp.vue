<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          기관 목록
          <AppTooltip :htmlContent="getTooltipById('topInstituteList')">
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
  import { ref, reactive, watch, nextTick, onBeforeMount } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useInstituteAdminStore } from '@/stores/InstituteAdmin';

  import { getTopInstituteList } from '@/utils/mflexApi/systemMng/systemManagementApi';

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

        this.setSelectTopInstitute(value);
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
      const { userStngInfo, userMetaMngInstList } = storeToRefs(authStore);

      const {
        setSelectDatabaseInfo,
        setSaveDatabaseState,
        setDeleteDatabaseState,
        setSelectDatabaseInstituteId,
      } = useSystemMngStore();
      const { saveDatabaseState, newDatabaseId, deleteDatabaseState } =
        storeToRefs(useSystemMngStore());

      const { useMetaMngInstId } = userStngInfo.value;

      const { getTooltipById } = useHelpToolTipStore();

      const metaMngInstList = userMetaMngInstList.value;

      const useInstituteAdmin = useInstituteAdminStore();
      const { isUpdateAdminList } = storeToRefs(useInstituteAdmin);
      const { setSelectTopInstitute, setIsUpdateAdminList } = useInstituteAdmin;

      const agGrid = ref(null);
      const gridApi = ref(null);

      const rowData = reactive({});

      const columnRefineGridId = ref('MFGRD110');
      const gridInfoDefs = ref({
        scrnGridId: columnRefineGridId,
        scrnId: '',
      });

      // selectInstitute를 ref 대신 reactive로 초기화
      const selectInstitute = reactive({
        id: useMetaMngInstId, // 초기값으로 현재 사용자의 기관 ID 설정
        name: '',
      });

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
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
        {
          headerName: '관리자지정여부',
          field: 'hasAdmin',
          width: 150,
          cellClass: 'grid-cell-centered',
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

      const fetchData = async () => {
        // 1차 기관 목록 조회
        const response = await getTopInstituteList();

        let tempData = [];

        for (let i = 0; i < response.length; i++) {
          tempData.push({
            no: i + 1,
            id: i,
            instituteId: response[i].instituteId,
            instituteName: response[i].instituteName,
            hasAdmin: response[i].hasAdmin === true ? '설정' : '미설정',
          });
        }

        rowData.value = tempData;
        firstRowSelectedEvent(rowData.value[0]); // 첫 번째 행 선택 이벤트 호출
      };

      fetchData();

      const firstRowSelectedEvent = (firstData) => {
        nextTick(() => {
          // 첫 번째 데이터 저장
          setSelectTopInstitute(firstData);

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

      onBeforeMount(async () => {
        await fetchData();
      });

      watch(isSaveColumnRefine, (value) => {
        console.log('isSaveColumnRefine : ', value);
        if (value) {
          fetchData();
          setIsSaveColumnRefine(false);
        }
      });

      watch(
        () => selectInstitute.id,
        async (newValue) => {
          console.log('기관 변경됨', newValue);
          setSelectDatabaseInstituteId(newValue);

          await fetchData();
        }
      );

      // 저장상태 변경 감지
      watch(
        () => saveDatabaseState.value,
        async (newValue) => {
          console.log('saveDatabaseState : ', newValue);
          if (newValue) {
            await fetchData(newDatabaseId.value);
            setSaveDatabaseState(false);
          }
        }
      );

      watch(
        () => deleteDatabaseState.value,
        async (newValue) => {
          console.log('selectedRow : ', newValue);
          if (newValue) {
            await fetchData();
            setDeleteDatabaseState(false);
          }
        }
      );

      watch(isUpdateAdminList, (newValue) => {
        console.log('isUpdateAdminList : ', newValue);
        if (newValue) {
          fetchData();
          setIsUpdateAdminList(false);
        }
      });

      return {
        rowData,
        columnDefs,
        columnRefineGridId,
        gridInfoDefs,
        agGrid,
        gridApi,
        setSelectColumnData,
        popInfo,
        fetchData,
        metaMngInstList,
        selectInstitute,
        setSelectDatabaseInfo,
        getTooltipById,
        setSelectTopInstitute,
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
