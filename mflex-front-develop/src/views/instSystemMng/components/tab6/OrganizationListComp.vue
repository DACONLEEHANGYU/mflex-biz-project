<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          조직 목록
          <AppTooltip :htmlContent="getTooltipById('databaseList')">
          </AppTooltip>
        </div>
        <div style="display: flex">
          <button
            class="btn-s add-reg"
            @click="onOpenAddOrganization('add')"
            title="추가"
          >
            추가
          </button>
          <button
            class="btn-s change-reg"
            @click="onOpenAddOrganization('edit')"
            title="수정"
          >
            수정
          </button>
          <button
            class="btn-s remove-reg"
            @click="onDeleteConfirm"
            title="삭제"
          >
            삭제
          </button>
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

  <!-- 삭제 알림창 -->
  <AppDialog
    v-model:view="deleteConfirmState.view"
    :title="deleteConfirmState.title"
    :message="deleteConfirmState.message"
    @confirm="onDelete"
  />

  <AppWindow
    :view="addOrganizationWindowView"
    @close="onCloseAddOrganization"
    width="550px"
    height="auto"
  >
    <AddOrganizationWindow
      :jobState="jobState"
      :selectedData="selectGroup"
      @confirm="onConfirmAddOrganization"
      @close="onCloseAddOrganization"
    />
  </AppWindow>
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
    getGroupList,
    deleteGroup,
  } from '@/utils/mflexApi/systemMng/systemManagementApi.js';
  import AddOrganizationWindow from '@/components/popWindow/AddOrganizationWindow.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  export default {
    components: {
      AppWindow,
      AppTooltip,
      AddOrganizationWindow,
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

        this.selectGroup = value;
        this.setSelectGroup(value);
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
        setSaveDatabaseState,
        setDeleteDatabaseState,
        setSelectDatabaseInstituteId,
        setSelectGroup,
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

      // selectInstitute를 ref 대신 reactive로 초기화
      const selectInstitute = reactive({
        id: useMetaMngInstId, // 초기값으로 현재 사용자의 기관 ID 설정
        name: '',
      });

      const selectGroup = ref();

      onBeforeMount(async () => {});

      const jobState = ref('add');

      const columnDefs = ref([
        {
          headerName: '조직명',
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

      const fetchData = async (newDatabaseId) => {
        const groupList = await getGroupList(useMetaMngInstId);
        console.log('groupList : ', groupList);

        let tempData = [];

        for (let i = 0; i < groupList.length; i++) {
          tempData.push({
            id: i,
            instituteId: groupList[i].instituteId,
            instituteName: groupList[i].instituteName,
            delYn: groupList[i].delYn,
            order: groupList[i].order,
          });
        }
        rowData.value = tempData;

        // setSelectGroup(rowData.value[0]);

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
                setSelectGroup(selectedRow);
              } else {
                console.warn(
                  `Element with row-id="${selectedRow.id}" not found`
                );
              }
            }
          });
        } else {
          setSelectGroup(rowData.value[0]);
          selectGroup.value = rowData.value[0];
          firstRowSelectedEvent(); // 첫 번째 행 선택 이벤트 호출
        }
      };

      fetchData();

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      const deleteConfirmState = reactive({
        view: false,
        title: '삭제 확인',
        message:
          '조직을 <span style="color:red">삭제</span> 하시겠습니까?<br></span>',
      });

      const addOrganizationWindowView = ref(false);

      const onOpenAddOrganization = (state) => {
        jobState.value = state;
        addOrganizationWindowView.value = true;
      };

      const onCloseAddOrganization = () => {
        console.log('onCloseAddOrganization');
        addOrganizationWindowView.value = false;
      };

      const onDeleteConfirm = () => {
        console.log('onDeleteConfirm');
        deleteConfirmState.view = true;
      };

      const onDelete = async () => {
        console.log('onDelete');
        console.log('selectGroup : ', selectGroup);

        const data = {
          manageInstituteId: useMetaMngInstId,
          instituteId: selectGroup.value.instituteId,
        };
        await deleteGroup(data);

        deleteConfirmState.view = false;
        fetchData();
      };

      const onConfirmAddOrganization = () => {
        console.log('onConfirmAddOrganization');
        addOrganizationWindowView.value = false;
        fetchData();
      };

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

      return {
        rowData,
        jobState,
        columnDefs,
        agGrid,
        gridApi,
        setSelectColumnData,
        popInfo,
        fetchData,
        metaMngInstList,
        selectInstitute,
        getTooltipById,
        addOrganizationWindowView,
        onConfirmAddOrganization,
        onOpenAddOrganization,
        onCloseAddOrganization,
        deleteConfirmState,
        onDeleteConfirm,
        selectGroup,
        setSelectGroup,
        onDelete,
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
