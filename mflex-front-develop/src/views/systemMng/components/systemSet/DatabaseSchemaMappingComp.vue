<template>
  <div class="database-schema-container">
    <div class="schema-header">
      <div class="title-s">
        연동 데이터베이스-스키마
        <AppTooltip :htmlContent="getTooltipById('relatedDatabaseSchema')">
        </AppTooltip>
      </div>
      <div class="button-group">
        <button class="btn-edit" @click="onOpenEditDatabaseSchemaWindow">
          <span class="btn-text">편집</span>
        </button>
      </div>
    </div>
    <div class="schema-list-wrapper">
      <div class="schema-list" ref="schemaListRef">
        <div v-if="loading" class="loading-indicator">
          <span>데이터를 불러오는 중입니다...</span>
        </div>
        <div v-else-if="databases.length === 0" class="empty-list">
          <span>연동된 데이터베이스가 없습니다.</span>
        </div>
        <div v-else>
          <!-- 데이터베이스별 그룹 -->
          <div
            v-for="db in databases"
            :key="`db-${db.databaseId}`"
            class="database-group"
          >
            <!-- 데이터베이스 헤더 -->
            <div
              class="database-header"
              @click="toggleDatabase(db)"
              :class="{ expanded: db.expanded, loading: db.loading }"
            >
              <div class="db-info">
                <span class="toggle-icon">{{ db.expanded ? '▼' : '▶' }}</span>
                <span class="db-name">{{ db.databaseName }}</span>
                <span class="db-type">({{ db.dbmsKindCode }})</span>
              </div>
              <div class="schema-count-container">
                <span class="schema-count"
                  >{{ db.schemas?.length || 0 }}개 스키마</span
                >
              </div>
            </div>

            <!-- 스키마 목록 (데이터베이스가 확장될 때만 표시) -->
            <div v-if="db.expanded" class="schema-group">
              <div
                v-if="db.schemas && db.schemas.length === 0"
                class="empty-schema-list"
              >
                <span>스키마가 없습니다.</span>
              </div>
              <div
                v-else-if="db.schemas"
                v-for="schema in db.schemas"
                :key="`schema-${db.databaseId}-${schema.schemaId}`"
                class="schema-item"
              >
                <div class="schema-info">
                  <span class="schema-name">{{ schema.schemaName }}</span>
                </div>
              </div>
              <div v-else-if="db.error" class="schema-error">
                <span>스키마 정보를 불러오지 못했습니다.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AppWindow :view="editDatabaseSchemaWindowState" width="1200px" height="auto">
    <EditDatabaseSchemaWindow
      @close="onCloseEditDatabaseSchemaWindow"
      @update:schemas="handleSchemaUpdate"
    />
  </AppWindow>
</template>

<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { storeToRefs } from 'pinia';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import {
    getDbListBySystem, // 시스템에 대한 DB 목록 조회
    getSchemaListBySystem, // 특정 데이터베이스에 대한 스키마 목록 조회
    getSchemaListByDb, // DB 목록에 존재하는 스키마 조회
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import EditDatabaseSchemaWindow from '@/components/popWindow/EditDatabaseSchemaWindow.vue';

  const systemStore = useSystemMngStore();
  const { selectSystem } = storeToRefs(systemStore);

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const props = defineProps({
    isAddnewSystem: {
      type: Boolean,
      required: true,
    },
  });

  const schemaListRef = ref(null);
  // 데이터베이스 목록
  const databases = ref([]);
  // 전체 로딩 상태
  const loading = ref(false);
  // 편집 윈도우 상태
  const editDatabaseSchemaWindowState = ref(false);

  // 초기 데이터 로드
  // const loadDatabases = async () => {
  //   try {
  //     loading.value = true;
  //     const response = await getDbListBySystem(selectSystem.value);

  //     console.log('시스템 데이터베이스 목록:', response);

  //     // 데이터베이스 목록 저장
  //     if (response && Array.isArray(response)) {
  //       databases.value = response.map((db) => ({
  //         ...db,
  //         expanded: false, // 초기에는 접힌 상태
  //         loading: false, // 스키마 로딩 상태
  //         schemas: null, // 스키마 데이터 (null은 아직 로드하지 않았음을 의미)
  //         error: null, // 에러 상태
  //       }));
  //     } else {
  //       databases.value = [];
  //     }
  //   } catch (error) {
  //     console.error('시스템 데이터베이스 목록 로드 실패:', error);
  //     databases.value = [];
  //   } finally {
  //     loading.value = false;
  //   }
  // };

  // 초기 데이터 로드 함수 수정
  const loadDatabases = async () => {
    try {
      console.log('selectSystem.value : ', selectSystem.value);

      loading.value = true;
      // 시스템 연결된 데이터베이스 목록 조회
      const response = await getDbListBySystem(selectSystem.value);

      console.log('시스템 데이터베이스 목록:', response);

      if (response && Array.isArray(response)) {
        // 데이터베이스 목록 기본 정보 저장
        databases.value = response.map((db) => ({
          ...db,
          expanded: false, // 초기에는 접힌 상태
          loading: false, // 스키마 로딩 상태
          schemas: [], // 빈 배열로 초기화 (null 대신 빈 배열 사용)
          error: null, // 에러 상태
        }));

        // 데이터베이스가 있을 경우에만 스키마 정보를 미리 로드
        if (databases.value.length > 0) {
          await loadAllSchemas();
        }
      } else {
        databases.value = [];
      }
    } catch (error) {
      console.error('시스템 데이터베이스 목록 로드 실패:', error);
      databases.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 모든 데이터베이스의 스키마를 한번에 로드하는 새로운 함수 추가
  const loadAllSchemas = async () => {
    try {
      // 모든 데이터베이스 IDs 수집
      const databaseIds = databases.value.map((db) => db.databaseId);

      if (databaseIds.length === 0) return;

      // 모든 데이터베이스에 대한 스키마 정보를 한번에 요청

      console.log(
        'selectSystem.value.instituteId:',
        selectSystem.value.instituteId
      );

      const schemaData = {
        instituteId: selectSystem.value.instituteId,
        informationSystemId: selectSystem.value.informationSystemId,
        databaseIds: databaseIds,
      };

      // 모든 데이터베이스의 스키마 정보를 한 번의 API 호출로 가져옴
      const schemas = await getSchemaListByDb(schemaData);
      console.log('모든 데이터베이스 스키마 정보 로드:', schemas);

      if (schemas && Array.isArray(schemas)) {
        // 각 데이터베이스에 해당하는 스키마 정보 매핑
        databases.value.forEach((db) => {
          // 1. 현재 데이터베이스에 속하는 스키마만 필터링
          // 2. 현재 정보시스템에 할당된 스키마만 필터링 (informationSystemId가 현재 시스템과 일치)
          const dbSchemas = schemas.filter(
            (schema) =>
              schema.databaseId === db.databaseId &&
              schema.informationSystemId ===
                selectSystem.value.informationSystemId
          );

          // 필터링된 스키마 정보 할당
          db.schemas = dbSchemas;
          db.loading = false; // 로딩 상태 해제
        });
      }
    } catch (error) {
      console.error('모든 데이터베이스 스키마 로드 실패:', error);
      // 에러 상태 표시
      databases.value.forEach((db) => {
        db.error = error;
        db.loading = false;
      });
    }
  };

  // 특정 데이터베이스의 스키마 목록 로드
  const loadSchemas = async (db) => {
    // if (db.schemas !== null) return; // 이미 로드되었거나 로드 시도 중인 경우

    try {
      db.loading = true;
      db.error = null;

      console.log(
        'selectSystem.value.instituteId , ',
        selectSystem.value.instituteId
      );

      const data = {
        databaseId: db.databaseId,
        instituteId: selectSystem.value.instituteId,
        informationSystemId: selectSystem.value.informationSystemId,
      };

      const response = await getSchemaListBySystem(data);

      if (response && Array.isArray(response)) {
        db.schemas = response;
      } else {
        db.schemas = [];
      }
    } catch (error) {
      console.error(
        `데이터베이스 ${db.databaseName} 스키마 목록 로드 실패:`,
        error
      );
      db.error = error;
      db.schemas = [];
    } finally {
      db.loading = false;
    }
  };

  // 데이터베이스 토글 (확장 또는 축소)
  const toggleDatabase = async (db) => {
    console.log('데이터베이스 토글:', db);

    db.expanded = !db.expanded;

    // 확장하는 경우에만 스키마를 로드
    // if (db.expanded && db.schemas === null) {
    //   await loadSchemas(db);
    // }
  };

  // 편집 윈도우 닫기
  const onCloseEditDatabaseSchemaWindow = () => {
    editDatabaseSchemaWindowState.value = false;
  };

  // 편집 윈도우 열기
  const onOpenEditDatabaseSchemaWindow = () => {
    editDatabaseSchemaWindowState.value = true;
  };

  // 스키마 업데이트 처리
  const handleSchemaUpdate = async () => {
    // 스키마가 업데이트된 경우 데이터를 다시 로드
    await loadDatabases();

    // 이미 확장된 데이터베이스들의 스키마를 다시 로드
    // for (const db of databases.value) {
    //   if (db.expanded) {
    //     db.schemas = null; // 스키마 데이터 초기화
    //     await loadSchemas(db);
    //   }
    // }
  };

  // 시스템이 변경될 때 데이터베이스 목록 다시 로드
  watch(
    selectSystem,
    async (newValue) => {
      console.log('시스템 변경됨', newValue);

      if (newValue && newValue.informationSystemId) {
        await loadDatabases();
      } else {
        databases.value = [];
      }
    },
    { immediate: true }
  );

  // props를 통해 전달받은 isAddnewSystem 속성 감시
  watch(
    () => props.isAddnewSystem, // 속성 직접 참조
    async (newValue) => {
      console.log('isAddnewSystem 변경됨', newValue);
      if (newValue === true) {
        console.log(
          '새 시스템 추가 시 selectSystem.value : ',
          selectSystem.value
        );
        // 새 시스템 추가 신호를 받으면 팝업 창 열기
        editDatabaseSchemaWindowState.value = true;

        // 부모 컴포넌트의 상태를 변경하기 위해 emit 사용
        emit('update:isAddnewSystem', false);
      }
    },
    { immediate: true } // 컴포넌트 생성 시 즉시 실행
  );

  // emit 정의 추가
  const emit = defineEmits(['update:schemas', 'update:isAddnewSystem']);

  // 컴포넌트 마운트 시 초기 데이터 로드
  onMounted(async () => {
    console.log('DatabaseSchemaMappingComp mounted');
    if (selectSystem && selectSystem.value.informationSystemId) {
      await loadDatabases();
    }
  });
</script>

<style scoped>
  .database-schema-container {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-top: 15px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 395px; /* 고정 높이 설정 */
  }

  .schema-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #e0e0e0;
    background-color: #f8f9fa;
  }

  .title-s {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .btn-edit {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    padding: 0 12px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    background-color: #3d6e5c;
    color: white;
  }

  .btn-edit:hover {
    background-color: #2a4d40;
  }

  .btn-text {
    margin-left: 2px;
  }

  .schema-list-wrapper {
    flex: 1;
    min-height: 100px;
    max-height: 300px;
    overflow: hidden;
  }

  .schema-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #ccc #f5f5f5;
  }

  /* 크롬/엣지 브라우저용 스크롤바 스타일링 */
  .schema-list::-webkit-scrollbar {
    width: 8px;
  }

  .schema-list::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  .schema-list::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  .schema-list::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }

  .empty-list,
  .loading-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    color: #666;
    font-size: 14px;
    font-style: italic;
  }

  .empty-schema-list {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
    color: #888;
    font-size: 13px;
    font-style: italic;
  }

  .schema-error {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
    color: #f44336;
    font-size: 13px;
  }

  /* 데이터베이스 그룹 스타일 */
  .database-group {
    margin-bottom: 5px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    overflow: hidden;
  }

  .database-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #f0f4f8;
    cursor: pointer;
    transition: background-color 0.2s;
    border-bottom: 1px solid transparent; /* 투명 테두리 추가 */
    height: 42px; /* 고정 높이 설정 */
  }

  .database-header:hover {
    background-color: #e4ebf5;
  }

  .database-header.expanded {
    background-color: #e4ebf5;
    border-bottom: 1px solid #e0e0e0;
  }

  .database-header.loading {
    cursor: wait;
  }

  .db-info {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .toggle-icon {
    color: #555;
    font-size: 10px;
    width: 12px;
    display: inline-block;
    text-align: center;
    transition: transform 0.2s;
  }

  .db-name {
    font-weight: 500;
    color: #333;
  }

  .db-type {
    color: #666;
    font-size: 12px;
  }

  .schema-count-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 70px;
    height: 20px; /* 고정 높이 설정 */
  }

  .schema-count {
    font-size: 12px;
    color: #777;
    background-color: #e0e0e0;
    padding: 2px 8px;
    border-radius: 12px;
  }

  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3d6e5c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto; /* 중앙 정렬 */
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* 스키마 그룹 스타일 */
  .schema-group {
    background-color: #fff;
  }

  .schema-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 15px 8px 35px; /* 좌측 패딩 증가로 계층 표현 */
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
  }

  .schema-item:hover {
    background-color: #f8f9fa;
  }

  .schema-item:last-child {
    border-bottom: none;
  }

  .schema-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .schema-name {
    font-size: 13px;
    color: #333;
  }
</style>
