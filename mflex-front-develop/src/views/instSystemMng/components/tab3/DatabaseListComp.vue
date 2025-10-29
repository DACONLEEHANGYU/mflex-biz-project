<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          데이터베이스 목록
          <AppTooltip :htmlContent="getTooltipById('databaseList')">
          </AppTooltip>
        </div>
      </div>
      <!-- <div class="input-form" style="flex: 1">
        <table class="input-table">
          <colgroup>
            <col width="15%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>조직명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <select
                      class="input-select"
                      style="width: 100%"
                      v-model="selectGroupId"
                    >
                      <option
                        v-for="option in groupMngList"
                        :key="option.instituteId"
                        :value="option.instituteId"
                      >
                        {{ option.instituteName }}
                      </option>
                    </select>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div> -->

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
    computed,
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

  import { getDatabaseList } from '@/utils/mflexApi/dataMng/schemaCollectionApi';

  import {
    getGroupList, // 그룹 목록 조회
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

        this.setSelectDatabaseInfo(value);
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
      const {
        userMetaMngInstListInfo,
        userStngInfo,
        userMetaMngInstList,
        userInstituteAdminList,
      } = storeToRefs(authStore);

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
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

      console.log('userMetaMngInstListInfo : ', userMetaMngInstListInfo.value);

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

      const columnDefs = ref([
        {
          headerName: '데이터베이스명',
          field: 'databaseName',
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
          headerName: 'DBMS 종류',
          field: 'dbmsKindCode',
          width: 190,
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

      const selectGroupId = ref(null);

      const groupMngList = ref([]);

      onBeforeMount(async () => {
        // const groupList = await getGroupList(useMetaMngInstId);
        // groupMngList.value = groupList;
        // console.log('groupList : ', groupList);

        // useMetaMngInstId = groupList[0]?.instituteId || null;

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
        const databaseList = await getDatabaseList(useMetaMngInstId);

        console.log('databaseList : ', databaseList);

        let tempData = [];

        for (let i = 0; i < databaseList.length; i++) {
          tempData.push({
            id: i,
            instituteId: databaseList[i].instituteId,
            databaseId: databaseList[i].databaseId,
            logicalDatabaseName: databaseList[i].logicalDatabaseName,
            physicalDatabaseName: databaseList[i].physicalDatabaseName,
            databaseName: databaseList[i].databaseName,
            dbmsKindCode: databaseList[i].dbmsKindCode,
            dbmsKindName: databaseList[i].dbmsKindName,
            delYn: databaseList[i].delYn,
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
                setSelectDatabaseInfo(selectedRow);
              } else {
                console.warn(
                  `Element with row-id="${selectedRow.id}" not found`
                );
              }
            }
          });
        } else {
          setSelectDatabaseInfo(rowData.value[0]);
          firstRowSelectedEvent(); // 첫 번째 행 선택 이벤트 호출
        }
      };

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      watch(isSaveColumnRefine, (value) => {
        console.log('isSaveColumnRefine : ', value);
        if (value) {
          fetchData();
          setIsSaveColumnRefine(false);
        }
      });

      watch(
        () => selectGroupId.value,
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
        selectGroupId,
        groupMngList,
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
