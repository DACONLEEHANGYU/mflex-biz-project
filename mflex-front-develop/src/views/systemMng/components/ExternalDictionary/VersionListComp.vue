<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div
        class="title-top"
        style="display: flex; margin-bottom: 15px; margin-top: 10px"
      >
        <div class="title-s">
          공식사전 버전 목록
          <AppTooltip
            :htmlContent="getTooltipById('externalDictionaryVersionList')"
          >
          </AppTooltip>
        </div>
        <div style="display: flex">
          <button
            class="btn-s add-reg"
            @click="onOpenAddExternalVersion"
            title="추가"
          >
            추가
          </button>
          <button
            class="btn-s change-reg"
            @click="onOpenEditExternalVersion"
            :disabled="regType === '추가'"
            title="수정"
          >
            수정
          </button>
          <button
            class="btn-s remove-reg"
            @click="onDeleteConfirm"
            :disabled="
              regType === '추가' || selectVersion.progressStatusName === '완료'
            "
            title="삭제"
          >
            삭제
          </button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <button
            class="btn-s green"
            :disabled="
              regType === '조회' || selectVersion.progressStatusName === '완료'
            "
            @click="onOpenApply"
            title="저장"
          >
            관리사전적용
          </button>
        </div>
      </div>
      <div class="input-form" style="flex: 1">
        <table class="input-table">
          <colgroup>
            <col width="15%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>공식사전명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <select
                      class="input-select"
                      style="width: 100%"
                      v-model="selectDictionary.id"
                    >
                      <option
                        v-for="option in dictionaryList"
                        :key="option.dictionaryId"
                        :value="option.dictionaryId"
                      >
                        {{ option.dictionaryName }}
                      </option>
                    </select>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

    <!-- 삭제 알림창 -->
    <AppDialog
      v-model:view="deleteConfirmState.view"
      :title="deleteConfirmState.title"
      :message="deleteConfirmState.message"
      @confirm="onDelete"
    />

    <!-- 관리사전반영 알림창 -->
    <AppDialog
      v-model:view="applyConfirmState.view"
      :title="applyConfirmState.title"
      :message="applyConfirmState.message"
      @confirm="onApplyCommonDictionaryVersion"
    />
  </div>

  <AppWindow
    :view="addExternalWindowView"
    @close="onCloseAddExternalVersion"
    width="550px"
    height="auto"
  >
    <AddExternalVersionWindow
      :selectDictionary="selectDictionary"
      :selectVersion="selectVersion"
      :jobState="jobState"
      @confirm="onConfirmAddExternalVersion"
      @close="onCloseAddExternalVersion"
    />
  </AppWindow>
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
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';

  import {
    getCommonDictionaryList, // 공식사전 목록 조회
    getCommonDictionaryVersionList, // 공식사전 버전 목록 조회
    deleteCommonDictionaryVersion, // 공식사전 버전 삭제
    applyCommonDictionaryVersion, // 공식사전 버전 관리사전 적용
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppDialog from '@/components/ui/AppDialog.vue';

  import AddExternalVersionWindow from '@/components/popWindow/AddExternalVersionWindow.vue';
  import ExternalFileUploadWindow from '@/components/popWindow/ExternalFileUploadWindow.vue';

  export default {
    components: {
      AppTooltip,
      AppWindow,
      AppDialog,
      ExternalFileUploadWindow,
      AddExternalVersionWindow,
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

        this.selectVersion = value;

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

        this.setExternalDictionaryVersion(value);
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
      const { userMetaMngInstListInfo, userStngInfo, userMetaMngInstList } =
        storeToRefs(authStore);

      const {
        setSelectDatabaseInfo,
        setSaveDatabaseState,
        setDeleteDatabaseState,
        setSelectDatabaseInstituteId,
      } = useSystemMngStore();
      const { saveDatabaseState, newDatabaseId, deleteDatabaseState } =
        storeToRefs(useSystemMngStore());

      const { setExternalDictionaryVersion } = useExternalDictionaryStore();

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const metaMngInstList = userMetaMngInstList.value;

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

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

      const selectVersion = ref({
        id: null,
        name: '',
      });

      const jobState = ref('add');

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

      onBeforeMount(async () => {});

      const columnDefs = ref([
        {
          headerName: '공식사전명 버전',
          field: 'versionName',
          width: 233,
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
          headerName: '차수',
          field: 'enactCycle',
          width: 50,
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
        {
          headerName: '제정일자',
          field: 'enactDate',
          width: 130,
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
        {
          headerName: '상태',
          field: 'progressStatusName',
          width: 50,
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

      // selectInstitute를 ref 대신 reactive로 초기화
      const dictionaryList = ref([]);

      // 선택된 공식사전 정보를 저장할 reactive 객체 추가
      const selectDictionary = reactive({
        id: null, // 초기값은 null
        name: '',
      });

      onBeforeMount(async () => {
        const dictionaries = await getCommonDictionaryList();

        dictionaryList.value = dictionaries;
        console.log('dictionaryList : ', dictionaryList.value);

        selectDictionary.id = dictionaryList.value[0].dictionaryId;
        selectDictionary.name = dictionaryList.value[0].dictionaryName;

        await fetchData(selectDictionary.id);
      });

      onMounted(async () => {
        // await fetchData();
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

      const fetchData = async (dictionaryId) => {
        const list = await getCommonDictionaryVersionList(dictionaryId);

        // const databaseList = await getDatabaseList(selectInstitute.id);

        let tempData = [];

        for (let i = 0; i < list.length; i++) {
          tempData.push({
            id: i,
            dictionaryId: list[i].dictionaryId,
            enactCycle: list[i].enactCycle,
            enactDate: list[i].enactDate,
            progressStatusName: list[i].progressStatusName,
            registerDateTime: list[i].registerDateTime,
            registerId: list[i].registerId,
            registerName: list[i].registerName,
            updateDateTime: list[i].updateDateTime,
            updaterId: list[i].updaterId,
            updaterName: list[i].updaterName,
            versionId: list[i].versionId,
            versionName: list[i].versionName,
          });
        }
        rowData.value = tempData;

        setExternalDictionaryVersion(rowData.value[0]);
        firstRowSelectedEvent(); // 첫 번째 행 선택 이벤트 호출
      };

      // fetchData();

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      const deleteConfirmState = reactive({
        view: false,
        title: '삭제 확인',
        message:
          '정말 공식사전을 삭제 하시겠습니까?<br><span style="color:red"></span>',
      });

      const onDelete = async () => {
        const data = {
          dictionaryId: selectDictionary.id,
          versionId: selectVersion.value.versionId,
        };

        await deleteCommonDictionaryVersion(data);

        fetchData(selectDictionary.id);
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

      const onDeleteConfirm = () => {
        console.log('onDeleteConfirm');
        deleteConfirmState.view = true;
      };

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

      // 선택된 사전 변경 시 데이터 조회
      watch(
        () => selectDictionary.id,
        async (newDictionaryId) => {
          console.log('선택된 공식사전 변경됨:', newDictionaryId);
          if (newDictionaryId) {
            await fetchData(newDictionaryId);
          }
        }
      );

      const applyCommonDictionaryVersionView = ref(false);

      // 공식사전 버전 추가 팝업 열기기
      const addExternalWindowView = ref(false);

      const onConfirmAddExternalVersion = async () => {
        addExternalWindowView.value = false;
        console.log('onConfirmAddExternalVersion');
        await fetchData(selectDictionary.id);
      };

      const onOpenEditExternalVersion = () => {
        jobState.value = 'edit';
        addExternalWindowView.value = true;
      };
      const onOpenAddExternalVersion = () => {
        jobState.value = 'add';
        addExternalWindowView.value = true;
      };

      const onCloseAddExternalVersion = () => {
        addExternalWindowView.value = false;
      };

      const applyConfirmState = reactive({
        view: false,
        title: '관리사전반영',
        message:
          '공식사전을 관리사전으로 적용하시겠습니까?<br><span style="color:red"></span>',
      });

      const onOpenApply = () => {
        console.log('onConfirmApply');
        applyConfirmState.view = true;
      };

      const onCloseApply = () => {
        applyConfirmState.view = false;
      };

      const onApplyCommonDictionaryVersion = async () => {
        console.log('onApplyCommonDictionaryVersion');
        const data = {
          dictionaryId: selectDictionary.id,
          versionId: selectVersion.value.versionId,
        };

        console.log('onApplyCommonDictionaryVersion data : ', data);

        await applyCommonDictionaryVersion(data);

        await fetchData(selectDictionary.id);
      };

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
        addExternalWindowView,
        onOpenAddExternalVersion,
        onOpenEditExternalVersion,
        onCloseAddExternalVersion,
        onConfirmAddExternalVersion,
        dictionaryList,
        selectDictionary,
        deleteConfirmState,
        onDeleteConfirm,
        selectVersion,
        jobState,
        onDelete,
        useExternalDictionaryStore,
        setExternalDictionaryVersion,
        onApplyCommonDictionaryVersion,
        applyConfirmState,
        onOpenApply,
        onCloseApply,
        getTooltipById,
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
