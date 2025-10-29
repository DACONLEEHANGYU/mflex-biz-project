<template>
  <div class="menugroup-bottom">
    <div class="db-btn-area">
      <div>
        <button
          class="btn-s"
          :style="{ backgroundColor: connectBackground, color: 'white' }"
          @click="onConnectionTest"
          :disabled="!onlineYnState || selectJobState"
        >
          DB연결 테스트
        </button>
        <div class="db-connect-msg"></div>
      </div>
      <!-- <button class="btn-s">수집필터조건 설정</button> -->
    </div>

    <div class="grid-move__data pt10">
      <div class="grid-l">
        <div class="grid-wrap">
          <div class="grid-top"></div>
          <div class="grid-list">
            <AppGrid
              :rowData="rowDataLeft"
              :columnDefs="columnDefsLeft"
              :context="context"
              rowSelection="single"
              @rowDoubleClicked="onRowDoubleClicked"
              @rowClicked="onRowClicked"
              ref="agGrid"
            />
          </div>
        </div>
      </div>
      <div class="grid-c">
        <div class="data-move__btns">
          <button
            class="btn-s arrow-right"
            @click="onMoveCollectionSchema"
            :disabled="!onlineYnState"
          >
            <i class="icon"></i>
          </button>
          <button
            class="btn-s arrow-left"
            @click="onMoveRowSchema"
            :disabled="!onlineYnState"
          >
            <i class="icon"></i>
          </button>
        </div>
      </div>
      <div class="grid-r">
        <div class="grid-wrap">
          <div class="grid-top"></div>
          <div class="grid-list">
            <AppGrid
              :rowData="rowDataRight"
              :columnDefs="columnDefsRight"
              :context="context"
              rowSelection="single"
              @rowDoubleClicked="onRowDoubleClicked"
              @rowClicked="onRightRowClicked"
              ref="agGrid"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 연결 확인창 -->
  <AppDialog
    v-model:view="connectionTestState.view"
    :title="connectionTestState.title"
    :message="connectionTestState.message"
    @confirm="onReCancel"
  />
  <!-- 연결 확인창 -->
  <AppDialog
    v-model:view="connectionTestFalseState.view"
    :title="connectionTestFalseState.title"
    :message="connectionTestFalseState.message"
    @confirm="onReCancel"
  />
</template>

<script>
  import { ref, reactive, watch, computed } from 'vue';
  import {
    testDbConnection, // DB연결 테스트
    getAllSchemaList, // 전체 스키마 조회
    getTargetSchemaList, // 수집대상 스키마 조회
    saveTargetSchemaList, // 수집대상 스키마 저장
    deleteTargetSchemaList, // 수집대상 스키마 삭제
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import { useSchemaCollectionStore } from '@/stores/schemaCollection';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { storeToRefs } from 'pinia';

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
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked ', value);
        this.selectedRow = value;
        this.selectLeftRow = value;
      },
      onRightRowClicked(value) {
        console.log('onRightRowClicked ', value);
        this.selectedRow = value;
        this.selectRightRow = value;
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props, { emit }) {
      // 스키마 연결 상태값 조회
      const { selectDbInfo, selectJobState, onlineYnState } = storeToRefs(
        useSchemaCollectionStore()
      );
      // 스키마 연결 상태값 저장
      const { setDbConnectionTestState, setSelectJobState } =
        useSchemaCollectionStore();

      // DB 연결 테스트 상태
      const dbConnectionTestState = ref(false);

      // 전체 스키마 원본 데이터를 저장할 ref 추가
      const originalAllSchemas = ref([]);

      const rowDataLeft = reactive({});
      const columnDefsLeft = reactive([
        {
          headerName: '전체 스키마',
          field: 'allSchemaName',
          cellClass: 'grid-cell-centered',
          width: 455,
        },
      ]);

      const rowDataRight = reactive({});
      const columnDefsRight = reactive([
        {
          headerName: '수집 대상 스키마',
          field: 'collectionSchemaName',
          cellClass: 'grid-cell-centered',
          width: 455,
        },
      ]);

      const selectRightRow = ref({});
      const selectLeftRow = ref({});

      // 전체 스키마 목록 필터링 함수
      const filterLeftGridData = (allSchemas, targetSchemas) => {
        return allSchemas.filter(
          (schema) =>
            !targetSchemas.some(
              (target) => target.collectionSchemaName === schema.allSchemaName
            )
        );
      };

      // 데이터 바인딩
      const fetchData = async () => {
        console.log('fetchData');

        rowDataLeft.value = [
          // { id: 1, allSchemaName: 'schema1' },
          // { id: 2, allSchemaName: 'schema2' },
          // { id: 3, allSchemaName: 'schema3' },
          // { id: 4, allSchemaName: 'schema4' },
          // { id: 5, allSchemaName: 'schema5' },
        ];

        // rowDataRight.value = [{ id: 1, collectionSchemaName: 'Moveschema1' }];
        rowDataRight.value = [];
      };

      fetchData();

      const onMoveCollectionSchema = async () => {
        if (!selectLeftRow.value?.allSchemaName) return;

        const data = {
          databaseLinkId: selectValue.value.databaseLinkId,
          instituteId: selectValue.value.instituteId,
          targetSchema: { targetSchemaName: selectLeftRow.value.allSchemaName },
        };

        await saveTargetSchemaList(data);
        const targetSchemaList = await getTargetSchemaList(data);

        const tartgetTempData = targetSchemaList.map((schema, index) => ({
          id: index + 1,
          collectionSchemaName: schema.targetSchemaName,
        }));

        rowDataRight.value = tartgetTempData;

        // 왼쪽 그리드 데이터 필터링 업데이트
        rowDataLeft.value = filterLeftGridData(
          originalAllSchemas.value,
          tartgetTempData
        );
      };

      const onMoveRowSchema = async () => {
        if (!selectRightRow.value?.collectionSchemaName) return;

        const data = {
          databaseLinkId: selectValue.value.databaseLinkId,
          instituteId: selectValue.value.instituteId,
          targetSchema: {
            targetSchemaName: selectRightRow.value.collectionSchemaName,
          },
        };

        await deleteTargetSchemaList(data);
        const targetSchemaList = await getTargetSchemaList(data);

        const tartgetTempData = targetSchemaList.map((schema, index) => ({
          id: index + 1,
          collectionSchemaName: schema.targetSchemaName,
        }));

        rowDataRight.value = tartgetTempData;

        // 왼쪽 그리드 데이터 업데이트
        rowDataLeft.value = filterLeftGridData(
          originalAllSchemas.value,
          tartgetTempData
        );
      };

      // DB연결 테스트 팝업 출력
      const onConnectionTest = async () => {
        const num = Math.floor(Math.random() * 10);

        connectionTestState.view = true;
        dbConnectionTestState.value = true;

        const data = {
          databaseLinkId: selectValue.value.databaseLinkId,
          instituteId: selectValue.value.instituteId,
        };

        const allSchemaList = await getAllSchemaList(data);
        console.log('allSchemaList ===', allSchemaList);
        const targetSchemaList = await getTargetSchemaList(data);

        const allTempData = allSchemaList.map((schema, index) => ({
          id: index + 1,
          allSchemaName: schema.schemaName,
        }));

        const tartgetTempData = targetSchemaList.map((schema, index) => ({
          id: index + 1,
          collectionSchemaName: schema.targetSchemaName,
        }));

        // 원본 전체 스키마 데이터 저장
        originalAllSchemas.value = allTempData;

        // 필터링된 전체 스키마 데이터 설정
        rowDataLeft.value = filterLeftGridData(allTempData, tartgetTempData);
        rowDataRight.value = tartgetTempData;

        setDbConnectionTestState(true);
      };

      // DB연결 성공 팝업 상태
      const connectionTestState = reactive({
        view: false,
        message:
          '해당 데이터베이스의 연결이 성공했습니다.<br>수집대상 스키마를 선택해 주시기 바랍니다.(선택 스키마가 없는 경우 전체 수집)',
      });
      const onReCancel = () => {
        console.log('취소 실행');
      };

      // DB연결 성공 팝업 상태
      const connectionTestFalseState = reactive({
        view: false,
        message:
          '해당 데이터베이스의 연결이 실패했습니다.<br>DB연결정보 및 사용자정보를 확인해 주시기 바랍니다.',
      });

      const selectValue = ref({});

      // 연결상태에 따른 배경색 변경
      const connectBackground = computed(() => {
        return dbConnectionTestState.value ? '#36c270' : '#f44336';
      });

      watch(selectDbInfo, async (value) => {
        console.log('DbSchemaSelectComp selectDbInfo ===', value);

        selectValue.value = value;

        const data = {
          databaseLinkId: value.databaseLinkId,
          instituteId: value.instituteId,
        };

        console.log('onlineYnState.value : ', onlineYnState.value);

        if (value.onlineYn === false) {
          console.warn('DB 연결이 비활성화 상태입니다.');
          dbConnectionTestState.value = false; // DB 연결 테스트 실패 상태로 변경
          setDbConnectionTestState(false); // DB 연결 테스트 실패 상태로 변경

          // 요청 실패 시 그리드 데이터 비우기
          rowDataLeft.value = [];
          rowDataRight.value = [];
          originalAllSchemas.value = [];

          return; // 여기서 함수 실행을 중단
        }

        try {
          // Promise.allSettled을 사용하여 API 요청을 병렬로 실행
          const [allSchemaResult, targetSchemaResult] =
            await Promise.allSettled([
              getAllSchemaList(data),
              getTargetSchemaList(data),
            ]);

          console.log('allSchemaResult ===', allSchemaResult);
          console.log('targetSchemaResult ===', targetSchemaResult);

          // 실패한 API가 있는지 확인
          if (
            allSchemaResult.status !== 'fulfilled' ||
            targetSchemaResult.status !== 'fulfilled'
          ) {
            console.error(
              'API 요청 중 하나 이상 실패!',
              allSchemaResult.reason,
              targetSchemaResult.reason
            );
            dbConnectionTestState.value = false; // DB 연결 테스트 실패 상태로 변경
            setDbConnectionTestState(false); // DB 연결 테스트 실패 상태로 변경

            // 요청 실패 시 그리드 데이터 비우기
            rowDataLeft.value = [];
            rowDataRight.value = [];
            originalAllSchemas.value = [];

            return; // 여기서 함수 실행을 중단
          } else {
            dbConnectionTestState.value = true; // DB 연결 테스트 성공 상태로 변경
            setDbConnectionTestState(true); // DB 연결 테스트 성공 상태로 변경
          }

          const allSchemaList = allSchemaResult.value
            ? allSchemaResult.value
            : [];
          const targetSchemaList = targetSchemaResult.value
            ? targetSchemaResult.value
            : [];

          console.log('allSchemaList ===', allSchemaList);
          console.log('targetSchemaList ===', targetSchemaList);

          const allTempData = allSchemaList.map((schema, index) => ({
            id: index + 1,
            allSchemaName: schema.schemaName,
          }));

          const tartgetTempData = targetSchemaList.map((schema, index) => ({
            id: index + 1,
            collectionSchemaName: schema.targetSchemaName,
          }));

          console.log('allTempData ===', allTempData);
          console.log('tartgetTempData ===', tartgetTempData);

          // 원본 전체 스키마 데이터 저장
          originalAllSchemas.value = allTempData;

          // 필터링된 전체 스키마 데이터 설정
          rowDataLeft.value = filterLeftGridData(allTempData, tartgetTempData);
          rowDataRight.value = tartgetTempData;
        } catch (error) {
          console.error('DB 연결 테스트 중 오류 발생:', error);
          dbConnectionTestState.value = false; // DB 연결 테스트 실패 상태로 변경
          setDbConnectionTestState(false); // DB 연결 테스트 실패 상태로 변경

          // 예외 발생 시 그리드 데이터 비우기
          rowDataLeft.value = [];
          rowDataRight.value = [];
          originalAllSchemas.value = [];
        }
      });

      // 등록 선택 상태감지
      watch(selectJobState, async (value) => {
        console.log('DbSchemaSelectComp selectJobState ===', value);

        // 초기화
        rowDataLeft.value = [];
        rowDataRight.value = [];
        dbConnectionTestState.value = false; // DB 연결 테스트 성공 실패로 변경
        setDbConnectionTestState(false); // DB 연결 테스트 실패 상태로 변경
        // setSelectJobState(false);
      });

      return {
        onConnectionTest,
        rowDataLeft,
        columnDefsLeft,
        rowDataRight,
        columnDefsRight,
        connectionTestState,
        onReCancel,
        onMoveCollectionSchema,
        onMoveRowSchema,
        selectRightRow,
        selectLeftRow,
        connectionTestFalseState,
        connectBackground,
        dbConnectionTestState,
        onlineYnState,
        selectJobState,
      };
    },
  };
</script>

<style scoped>
  .db-btn-area {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }
  .db-btn-area div {
    display: flex;
  }
  .menugroup-bottom {
    margin-top: 5px;
    border: 1px solid #ccc;
    padding: 5px;
  }
  .menugroup-bottom .grid-move__data {
    height: 85%;
    display: flex;
  }
  .connect {
    color: blue;
  }
  .disconnect {
    color: red;
  }
  .db-connect-msg {
    margin-left: 10px;
    display: flex;
    align-items: center;
  }
</style>
