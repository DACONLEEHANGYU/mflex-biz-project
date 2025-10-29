<template>
  <div class="pop-window">
    <div class="window-header">연동 데이터베이스-스키마 편집</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="schema-editor-container h-450">
          <!-- 데이터베이스 목록 (왼쪽) -->
          <div class="schema-tree-container">
            <div v-if="loading" class="loading-data">
              <div class="loading-spinner"></div>
              <p>데이터베이스를 불러오는 중...</p>
            </div>
            <div v-else-if="databases.length === 0" class="empty-data">
              <p>표시할 데이터베이스가 없습니다.</p>
            </div>
            <div v-else class="schema-tree">
              <!-- 선택된 데이터베이스를 상단에 표시 -->
              <!-- 데이터베이스 목록 항목 -->
              <div
                v-for="db in sortedDatabases"
                :key="db.databaseId"
                :class="[
                  'db-item',
                  {
                    'selected-db-item': db.selected && !hasSelectedSchemas(db),
                  },
                  {
                    'schema-mapped-db-item':
                      db.selected && hasSelectedSchemas(db),
                  },
                ]"
              >
                <div class="db-checkbox-wrapper">
                  <input
                    type="checkbox"
                    :id="`db-${db.databaseId}`"
                    v-model="db.selected"
                    @change="handleDbSelectionChange(db)"
                    class="db-checkbox"
                    :disabled="db.selected && hasSelectedSchemas(db)"
                  />
                  <label :for="`db-${db.databaseId}`" class="db-label">
                    <span class="db-name">{{ db.databaseName }}</span>
                    <span class="db-type">({{ db.dbmsKindCode }})</span>
                    <span
                      v-if="db.selected && hasSelectedSchemas(db)"
                      class="db-status-badge schema-mapped-badge"
                    >
                      <i class="fas fa-check-circle"></i> 스키마 매핑됨
                    </span>
                    <span
                      v-else-if="db.selected"
                      class="db-status-badge db-only-badge"
                    >
                      <i class="fas fa-database"></i> DB 매핑됨
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 스키마 목록 (오른쪽) -->
          <div class="selection-summary">
            <div class="summary-header">
              <h3>스키마 목록</h3>
              <!-- <div class="header-actions">
                <button
                  class="btn-select-all"
                  @click="selectAllSchemas"
                  :disabled="!hasVisibleSchemas"
                >
                  모두 선택
                </button>
                <button
                  class="btn-clear"
                  @click="clearAllSelections"
                  :disabled="selectedDbs.length === 0"
                >
                  모두 지우기
                </button>
              </div> -->
            </div>
            <div class="summary-content">
              <div v-if="selectedDbs.length === 0" class="empty-selection">
                <p>데이터베이스를 선택하면 스키마가 표시됩니다.</p>
              </div>
              <div v-else>
                <div
                  v-for="db in selectedDbs"
                  :key="db.databaseId"
                  class="selected-db"
                >
                  <div class="selected-db-header">
                    <div class="selected-db-name">
                      {{ db.databaseName }}
                      <span class="selected-db-type"
                        >({{ db.dbmsKindCode }})</span
                      >
                    </div>
                    <div class="db-schema-actions">
                      <!-- <button
                        class="btn-select-db-schemas"
                        @click="selectAllSchemasForDb(db)"
                        :disabled="!db.schemas || db.schemas.length === 0"
                      >
                        모두 선택
                      </button> -->
                    </div>
                  </div>
                  <div v-if="db.loading" class="schema-loading">
                    <div class="loading-spinner-small"></div>
                    <span>스키마를 불러오는 중...</span>
                  </div>
                  <div v-else-if="db.error" class="schema-error">
                    <span>스키마 정보를 불러오지 못했습니다.</span>
                    <button @click="loadSchemas(db)" class="btn-retry">
                      재시도
                    </button>
                  </div>
                  <div
                    v-else-if="!db.schemas || db.schemas.length === 0"
                    class="no-schemas"
                  >
                    <span>스키마가 없습니다.</span>
                  </div>
                  <div v-else class="selected-schemas">
                    <div
                      v-for="schema in db.schemas"
                      :key="`${db.databaseId}-${schema.schemaId}`"
                      :class="[
                        'schema-item',
                        { 'selected-schema-item': schema.selected },
                        {
                          'other-system-schema-item':
                            schema.isAssignedToOtherSystem,
                        },
                      ]"
                      :title="
                        schema.isAssignedToOtherSystem
                          ? `이 스키마는 이미 다른 정보시스템에 연결되어 있습니다`
                          : ''
                      "
                    >
                      <div class="schema-checkbox-wrapper">
                        <input
                          type="checkbox"
                          :id="`schema-${db.databaseId}-${schema.schemaId}`"
                          v-model="schema.selected"
                          @change="handleSchemaSelectionChange(db, schema)"
                          class="schema-checkbox"
                          :disabled="schema.isAssignedToOtherSystem"
                        />
                        <label
                          :for="`schema-${db.databaseId}-${schema.schemaId}`"
                          class="schema-label"
                        >
                          <span class="schema-name">{{
                            schema.schemaName
                          }}</span>
                          <span
                            v-if="schema.isAssignedToOtherSystem"
                            class="assigned-badge"
                          >
                            <i class="fas fa-exclamation-triangle"></i> 사용중
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <!-- <button
            class="btn-m confirm"
            @click="onConfirm"
            :disabled="selectedDbs.length === 0"
          >
            저장
          </button> -->
          <button class="btn-m close" @click="onClose">닫기</button>
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

  <!-- 데이터베이스 매핑 알림 -->
  <AppWindow
    :view="databaseMappingWindowView"
    @close="onCloseDatabaseMappingWindow"
    width="700px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onOpenEditDatabaseSchemaWindow"
      @close="onCloseDatabaseMappingWindow"
    />
  </AppWindow>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { storeToRefs } from 'pinia';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import { getDatabaseList } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import {
    getDbListBySystem,
    getSchemaListBySystem,
    getInfoSystemConection,
    addDbToSystem,
    removeDbFromSystem,
    getDbDetailsBySystem as addSchemaToSystem, // 기능에 맞게 별칭 사용
    removeSchemaFromSystem,
    getSchemaListByDb,
    // saveSystemDatabases,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  const emit = defineEmits(['update:schemas', 'close']);
  const systemStore = useSystemMngStore();
  const { selectSystem, selectSystemInstituteId } = storeToRefs(systemStore);

  // 로딩 상태
  const loading = ref(false);

  // 데이터베이스 목록
  const databases = ref([]);

  // 선택된 데이터베이스를 상단에 표시하도록 정렬된 데이터베이스 목록
  // const sortedDatabases = computed(() => {
  //   return [...databases.value].sort((a, b) => {
  //     // 1. 스키마가 매핑된 DB를 최상위에 배치
  //     const aHasSelectedSchemas = hasSelectedSchemas(a);
  //     const bHasSelectedSchemas = hasSelectedSchemas(b);

  //     if (aHasSelectedSchemas && !bHasSelectedSchemas) return -1;
  //     if (!aHasSelectedSchemas && bHasSelectedSchemas) return 1;

  //     // 2. 그 다음으로 DB만 매핑된 항목 배치
  //     if (a.selected && !b.selected) return -1;
  //     if (!a.selected && b.selected) return 1;

  //     // 3. 같은 우선순위라면 이름 순으로 정렬
  //     return a.databaseName.localeCompare(b.databaseName);
  //   });
  // });

  // const sortedDatabases = computed(() => {
  //   return [...databases.value].sort((a, b) => {
  //     // 이름순으로만 정렬
  //     return a.databaseName.localeCompare(b.databaseName);
  //   });
  // });

  // 선택된 데이터베이스 (스키마가 있는 항목이 상단에 배치)
  // const selectedDbs = computed(() => {
  //   const selected = databases.value.filter((db) => db.selected);

  //   // 스키마가 있는 DB를 상단에 배치
  //   return selected.sort((a, b) => {
  //     // 1. 스키마가 있는 DB를 상단에 배치
  //     const aHasSchemas = a.schemas && a.schemas.length > 0;
  //     const bHasSchemas = b.schemas && b.schemas.length > 0;

  //     if (aHasSchemas && !bHasSchemas) return -1;
  //     if (!aHasSchemas && bHasSchemas) return 1;

  //     // 2. 그 다음으로 매핑된 스키마가 있는 DB를 상단에 배치
  //     const aHasSelectedSchemas = hasSelectedSchemas(a);
  //     const bHasSelectedSchemas = hasSelectedSchemas(b);

  //     if (aHasSelectedSchemas && !bHasSelectedSchemas) return -1;
  //     if (!aHasSelectedSchemas && bHasSelectedSchemas) return 1;

  //     // 3. 같은 조건이면 이름순으로 정렬
  //     return a.databaseName.localeCompare(b.databaseName);
  //   });
  // });

  // 초기 로드 여부를 추적하는 변수
  const initialLoad = ref(true);

  // 원본 정렬 순서를 저장할 배열
  const originalOrder = ref([]);

  // 데이터베이스 목록을 선택 상태에 따라 정렬하되, 초기 로드 시에만 적용
  const sortedDatabases = computed(() => {
    if (initialLoad.value) {
      // 최초 로드 시에는 선택된 항목이 상단에 오도록 정렬
      return [...databases.value].sort((a, b) => {
        // 1. 스키마가 매핑된 DB를 최상위에 배치
        const aHasSelectedSchemas = hasSelectedSchemas(a);
        const bHasSelectedSchemas = hasSelectedSchemas(b);

        if (aHasSelectedSchemas && !bHasSelectedSchemas) return -1;
        if (!aHasSelectedSchemas && bHasSelectedSchemas) return 1;

        // 2. 그 다음으로 DB만 매핑된 항목 배치
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;

        // 3. 같은 우선순위라면 이름 순으로 정렬
        return a.databaseName.localeCompare(b.databaseName);
      });
    } else {
      // 초기 로드 이후에는 원본 순서 유지
      // originalOrder에 저장된 ID 순서대로 데이터 정렬
      return [...databases.value].sort((a, b) => {
        const indexA = originalOrder.value.indexOf(a.databaseId);
        const indexB = originalOrder.value.indexOf(b.databaseId);
        return indexA - indexB;
      });
    }
  });

  // 선택된 데이터베이스 (원래 순서 유지)
  const selectedDbs = computed(() => {
    // 선택된 데이터베이스만 필터링하고, 원래 순서 유지
    return databases.value.filter((db) => db.selected);
  });

  // 스키마가 표시되는지 여부
  const hasVisibleSchemas = computed(() => {
    return selectedDbs.value.some((db) => db.schemas && db.schemas.length > 0);
  });

  // 선택된 스키마
  const selectedSchemas = computed(() => {
    const result = [];
    selectedDbs.value.forEach((db) => {
      if (db.schemas) {
        const selectedDbSchemas = db.schemas.filter(
          (schema) => schema.selected
        );
        selectedDbSchemas.forEach((schema) => {
          result.push({
            databaseId: db.databaseId,
            databaseName: db.databaseName,
            schemaId: schema.schemaId,
            schemaName: schema.schemaName,
          });
        });
      }
    });
    return result;
  });

  // 데이터베이스가 매핑된 스키마를 가지고 있는지 확인하는 함수
  const hasSelectedSchemas = (db) => {
    if (!db.schemas) return false;
    return db.schemas.some((schema) => schema.selected);
  };

  // 각 데이터베이스의 체크박스 비활성화 여부
  const getDbCheckboxDisabled = (db) => {
    // 체크되지 않은 상태에서는 항상 선택 가능
    if (!db.selected) return false;

    // 체크된 상태에서는 선택된 스키마가 있으면 해제 불가능
    return hasSelectedSchemas(db);
  };

  // 초기 데이터베이스 목록 로드
  // 초기 데이터베이스 목록 로드
  // 초기 데이터베이스 목록 로드
  const loadDatabases = async () => {
    console.log('loadDatabases', selectSystem.value);

    if (!selectSystem.value) return;

    try {
      loading.value = true;
      // 초기 로드 상태로 설정
      initialLoad.value = true;

      // 시스템에 연결된 데이터베이스 정보 가져오기

      console.log('selectSystemInstituteId', selectSystemInstituteId.value);

      const connectionData = {
        instituteId: selectSystemInstituteId.value,
        informationSystemId: selectSystem.value?.informationSystemId,
      };

      // 연결된 데이터베이스 목록 가져오기
      const connectionList = await getInfoSystemConection(connectionData);

      console.log('connectionList', connectionList);

      // 모든 데이터베이스 목록 가져오기
      const response = await getDatabaseList(selectSystemInstituteId.value);

      if (response && Array.isArray(response)) {
        // 매핑 정보를 기준으로 데이터베이스 목록을 변환
        let dbList = response
          .filter((db) => {
            // 시스템에 연결된 데이터베이스만 필터링
            return db.delYn === false;
          })
          .map((db) => {
            // connectionList에서 현재 데이터베이스가 매핑되어 있는지 확인
            const mappedInfo = connectionList?.find(
              (conn) => conn.databaseId === db.databaseId
            );

            // 매핑 여부에 따라 selected 초기화
            const isSelected = mappedInfo?.isMapped === true;

            return {
              ...db,
              selected: isSelected,
              loading: false,
              error: null,
              schemas: null,
            };
          });

        // 정렬된 목록 저장
        databases.value = dbList;

        // 데이터 로드 후 원본 순서 저장
        originalOrder.value = sortedDatabases.value.map((db) => db.databaseId);
        // 초기 로드 상태 해제 - 이후부터는 정렬 순서 변경 없음
        initialLoad.value = false;

        // 선택된 데이터베이스들의 스키마를 한번에 로드
        if (selectedDbs.value.length > 0) {
          await loadSelectedDbSchemas();
        }
      } else {
        databases.value = [];
        originalOrder.value = [];
        initialLoad.value = false;
      }
    } catch (error) {
      console.error('데이터베이스 목록 로드 실패:', error);
      databases.value = [];
      originalOrder.value = [];
      initialLoad.value = false;
    } finally {
      loading.value = false;
    }
  };

  // 선택된 모든 데이터베이스의 스키마 정보를 한번에 로드
  const loadSelectedDbSchemas = async () => {
    try {
      if (selectedDbs.value.length === 0) return;

      // 모든 선택된 DB를 로딩 상태로 설정
      selectedDbs.value.forEach((db) => {
        db.loading = true;
        db.error = null;
      });

      // 선택된 모든 데이터베이스 ID 수집
      const databaseIds = selectedDbs.value.map((db) => db.databaseId);

      // API 호출 데이터 준비
      const data = {
        instituteId: selectSystemInstituteId.value,
        informationSystemId: selectSystem.value?.informationSystemId,
        databaseIds: databaseIds,
      };

      // 스키마 목록 API 호출
      const response = await getSchemaListByDb(data);

      if (response && Array.isArray(response)) {
        // 각 데이터베이스별로 스키마 분류
        const schemasByDbId = {};

        // 모든 응답 스키마를 데이터베이스 ID로 그룹화
        response.forEach((schema) => {
          if (!schemasByDbId[schema.databaseId]) {
            schemasByDbId[schema.databaseId] = [];
          }

          // 현재 시스템 ID와 다른 정보시스템 ID가 있으면 다른 시스템에 할당된 것임
          const isAssignedToOtherSystem =
            schema.informationSystemId &&
            schema.informationSystemId !==
              selectSystem.value?.informationSystemId;

          schemasByDbId[schema.databaseId].push({
            schemaId: schema.schemaId || schema.schemaName,
            schemaName: schema.schemaName,
            selected: schema.isMapped === true && !isAssignedToOtherSystem, // 매핑되었고 다른 시스템에 할당되지 않은 경우만 선택
            dbmsKindCode: schema.dbmsKindCode,
            logicalDatabaseName: schema.logicalDatabaseName,
            physicalDatabaseName: schema.physicalDatabaseName,
            isAssignedToOtherSystem: isAssignedToOtherSystem, // 다른 시스템에 할당되었는지 여부
            assignedSystemId: schema.informationSystemId, // 할당된 시스템 ID (있는 경우)
            assignedSystemName:
              schema.informationSystemName || '다른 정보시스템', // 연결된 시스템 이름
          });
        });

        // 각 데이터베이스에 스키마 할당
        selectedDbs.value.forEach((db) => {
          db.schemas = schemasByDbId[db.databaseId] || [];
          db.loading = false;
        });
      } else {
        // 응답이 배열이 아니면 모든 DB에 빈 스키마 목록 설정
        selectedDbs.value.forEach((db) => {
          db.schemas = [];
          db.loading = false;
        });
      }
    } catch (error) {
      console.error('다중 데이터베이스 스키마 로드 실패:', error);
      // 에러 처리
      selectedDbs.value.forEach((db) => {
        db.error = error;
        db.loading = false;
      });
    }
  };

  // 데이터베이스 선택 처리 함수 수정
  const handleDbSelectionChange = async (db) => {
    // 체크박스 변경 시 항상 초기 로드 상태가 아님을 보장
    initialLoad.value = false;

    try {
      // 선택 해제 시, 매핑된 스키마가 있으면 해제 불가
      if (!db.selected && hasSelectedSchemas(db)) {
        db.selected = true; // 상태 되돌리기
        alert(
          '매핑된 스키마가 있는 데이터베이스는 해제할 수 없습니다. 먼저 모든 스키마 매핑을 해제해주세요.'
        );
        return;
      }

      console.log('체크박스 체크 변경:', db.selected);

      const data = {
        informationSystemId: selectSystem.value.informationSystemId,
        databaseId: db.databaseId,
        instituteId: selectSystemInstituteId.value,
      };

      if (db.selected) {
        // 선택되었을 때 DB를 시스템에 추가
        await addDbToSystem(data);
        console.log(`데이터베이스 ${db.databaseName} 시스템에 추가됨`);

        // 스키마 로드
        if (!db.schemas) {
          await loadSchemas(db);
        }

        // 데이터베이스 매핑 상태 변경 알림
        emit('update:schemas');
      } else {
        // 선택 해제되었을 때 DB를 시스템에서 제거
        await removeDbFromSystem(data);
        console.log(`데이터베이스 ${db.databaseName} 시스템에서 제거됨`);

        // 스키마 정보 초기화
        db.schemas = null;

        // 데이터베이스 매핑 상태 변경 알림
        emit('update:schemas');
      }
    } catch (error) {
      console.error('데이터베이스 매핑 상태 변경 중 오류:', error);

      // 오류 발생 시 체크박스 상태 원복
      db.selected = !db.selected;

      // 사용자에게 알림
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === 1030
      ) {
        alert(
          '매핑된 스키마가 있는 데이터베이스는 해제할 수 없습니다. 먼저 모든 스키마 매핑을 해제해주세요.'
        );
      } else {
        alert(
          `데이터베이스 ${
            db.selected ? '추가' : '제거'
          } 중 오류가 발생했습니다.`
        );
      }
    }
  };

  // 단일 데이터베이스의 스키마 로드
  const loadSchemas = async (db) => {
    if (!db || db.loading) return;

    try {
      db.loading = true;
      db.error = null;

      const data = {
        databaseId: db.databaseId,
        instituteId: selectSystemInstituteId.value,
        informationSystemId: selectSystem.value?.informationSystemId,
      };

      const response = await getSchemaListByDb(data);

      if (response && Array.isArray(response)) {
        // API 응답에서 스키마 정보와 매핑 상태 활용
        db.schemas = response.map((schema) => {
          // 현재 시스템 ID와 다른 정보시스템 ID가 있으면 다른 시스템에 할당된 것임
          const isAssignedToOtherSystem =
            schema.informationSystemId &&
            schema.informationSystemId !==
              selectSystem.value?.informationSystemId;

          return {
            schemaId: schema.schemaId || schema.schemaName,
            schemaName: schema.schemaName,
            selected: schema.isMapped === true && !isAssignedToOtherSystem, // 매핑되었고 다른 시스템에 할당되지 않은 경우만 선택
            dbmsKindCode: schema.dbmsKindCode,
            logicalDatabaseName: schema.logicalDatabaseName,
            physicalDatabaseName: schema.physicalDatabaseName,
            isAssignedToOtherSystem: isAssignedToOtherSystem, // 다른 시스템에 할당되었는지 여부
            assignedSystemId: schema.informationSystemId, // 할당된 시스템 ID (있는 경우)
            assignedSystemName:
              schema.informationSystemName || '다른 정보시스템', // 연결된 시스템 이름
          };
        });
      } else {
        db.schemas = [];
      }
    } catch (error) {
      console.error(`데이터베이스 ${db.databaseName} 스키마 로드 실패:`, error);
      db.error = error;
    } finally {
      db.loading = false;
    }
  };

  // 스키마 선택 처리
  const handleSchemaSelectionChange = async (db, schema) => {
    // 다른 시스템에 할당된 스키마는 선택 변경 불가
    if (schema.isAssignedToOtherSystem) {
      schema.selected = false; // 강제로 선택 해제
      return;
    }

    try {
      console.log('스키마 체크박스 변경:', schema.selected);

      const data = {
        informationSystemId: selectSystem.value.informationSystemId,
        instituteId: selectSystemInstituteId.value,
        databaseId: db.databaseId,
        schemaId: schema.schemaId,
        schemaName: schema.schemaName,
      };

      if (schema.selected) {
        // 스키마가 선택되었을 때 API 호출하여 등록
        await addSchemaToSystem(data);
        console.log(`스키마 ${schema.schemaName} 시스템에 추가됨`);

        // 스키마 매핑 상태 변경 알림
        emit('update:schemas');
      } else {
        // 스키마가 선택 해제되었을 때 API 호출하여 등록 해제
        await removeSchemaFromSystem(data);
        console.log(`스키마 ${schema.schemaName} 시스템에서 제거됨`);

        // 스키마 매핑 상태 변경 알림
        emit('update:schemas');
      }
    } catch (error) {
      console.error('스키마 매핑 상태 변경 중 오류:', error);

      // 오류 발생 시 체크박스 상태 원복
      schema.selected = !schema.selected;

      // 사용자에게 알림
      alert(
        `스키마 ${schema.selected ? '추가' : '제거'} 중 오류가 발생했습니다.`
      );
    }
  };

  const popInfo = ref({
    state: 'confirm',
    popTitle: '에러 제목',
    popMessages: '에러 메시지',
  });

  // 데이터베이스 매핑 메시지
  const databaseMappingWindowView = ref(false);
  const onOpenDatabaseMappingWindow = () => {
    popInfo.value.popTitle = '데이터베이스 연동 알림';
    popInfo.value.popMessages =
      '정보시스템에 데이터베이스 매핑을 진행하시겠습니까?';
    databaseMappingWindowView.value = true;
  };
  const onCloseDatabaseMappingWindow = () => {
    databaseMappingWindowView.value = false;
  };

  // 특정 데이터베이스의 모든 스키마 선택
  const selectAllSchemasForDb = async (db) => {
    if (db.schemas && db.schemas.length > 0) {
      for (const schema of db.schemas) {
        if (!schema.selected && !schema.isAssignedToOtherSystem) {
          schema.selected = true;
          // API 호출하여 시스템에 모든 스키마 등록
          try {
            const data = {
              informationSystemId: selectSystem.value.informationSystemId,
              instituteId: selectSystemInstituteId.value,
              databaseId: db.databaseId,
              schemaId: schema.schemaId,
              schemaName: schema.schemaName,
            };
            await addSchemaToSystem(data);
            console.log(`스키마 ${schema.schemaName} 시스템에 추가됨`);
          } catch (error) {
            console.error(`스키마 ${schema.schemaName} 추가 중 오류:`, error);
            schema.selected = false; // 실패 시 상태 원복
          }
        }
      }
    }
  };

  // 모든 데이터베이스의 모든 스키마 선택
  const selectAllSchemas = () => {
    selectedDbs.value.forEach((db) => {
      if (db.schemas && db.schemas.length > 0) {
        db.schemas.forEach((schema) => {
          if (!schema.isAssignedToOtherSystem) {
            schema.selected = true;
          }
        });
      }
    });
  };

  // 모든 선택 해제
  const clearAllSelections = () => {
    databases.value.forEach((db) => {
      db.selected = false;
    });
  };

  // 저장
  const onConfirm = async () => {
    try {
      // 선택된 데이터베이스와 스키마 정보
      const selectionData = selectedDbs.value.map((db) => {
        return {
          databaseId: db.databaseId,
          schemas: db.schemas
            ? db.schemas
                .filter((schema) => schema.selected)
                .map((schema) => ({
                  schemaId: schema.schemaId,
                  schemaName: schema.schemaName,
                }))
            : [],
        };
      });

      console.log('저장할 데이터:', selectionData);

      // 여기에 API 호출 추가
      // await saveDbSchemaMappings({
      //   systemId: selectSystem.value.systemId,
      //   instituteId: selectSystem.value.instituteId,
      //   mappings: selectionData
      // });

      // 성공 후 부모 컴포넌트에 이벤트 발생
      emit('update:schemas');
      emit('close');
    } catch (error) {
      console.error('데이터베이스-스키마 매핑 저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 편집 윈도우 상태
  const editDatabaseSchemaWindowState = ref(false);

  // 편집 윈도우 닫기
  const onCloseEditDatabaseSchemaWindow = () => {
    editDatabaseSchemaWindowState.value = false;
  };

  // 편집 윈도우 열기
  const onOpenEditDatabaseSchemaWindow = () => {
    editDatabaseSchemaWindowState.value = true;
  };

  // 취소
  const onClose = () => {
    emit('close');
  };

  // 컴포넌트 마운트 시 초기화
  onMounted(async () => {
    await loadDatabases();
  });

  // 시스템 변경 시 데이터 다시 로드
  watch(selectSystem, async (newVal) => {
    if (newVal && newVal.systemId) {
      await loadDatabases();
    }
  });
</script>

<style scoped>
  .window-content {
    padding: 0 15px;
  }

  .schema-editor-container {
    display: flex;
    height: 100%;
    gap: 15px;
  }

  /* 데이터베이스 목록 컨테이너 (왼쪽) */
  .schema-tree-container {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f9f9f9;
    padding: 8px;
  }

  .loading-data,
  .empty-data {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #666;
    padding: 20px;
    text-align: center;
  }

  .loading-spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3d6e5c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }

  .loading-spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3d6e5c;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .schema-tree {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* 데이터베이스 단일 항목 스타일 */
  .db-item {
    padding: 8px 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #fff;
    transition: all 0.2s;
  }

  .db-item:hover {
    background-color: #f5f5f5;
  }

  /* 선택된 항목 스타일링 (데이터베이스만 매핑된 경우) */
  .selected-db-item {
    background-color: #fffbeb;
    border-color: #fbbf24;
    border-left: 3px solid #fbbf24;
  }

  /* 스키마가 매핑된 데이터베이스 항목 스타일 */
  .schema-mapped-db-item {
    background-color: #ecfdf5;
    border-color: #10b981;
    border-left: 3px solid #10b981;
  }

  /* 상태 배지 공통 스타일 */
  .db-status-badge {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    padding-right: 5px;
    border-radius: 3px;
    margin-left: 8px;
    font-weight: 500;
  }

  .db-checkbox-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
  }

  /* 체크박스 크기 키우기 */
  .db-checkbox {
    margin-right: 10px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #3d6e5c; /* 체크박스 색상 변경 */
  }

  .db-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    flex: 1;
  }

  .db-name {
    font-weight: 500;
    color: #333;
    margin-right: 6px;
  }

  .db-type {
    color: #666;
    font-size: 12px;
  }

  /* 스키마 목록 컨테이너 (오른쪽) */
  .selection-summary {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f9f9f9;
    overflow: hidden;
  }

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 15px;
    background-color: #f0f4f8;
    border-bottom: 1px solid #e0e0e0;
  }

  .summary-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }

  .btn-select-all,
  .btn-clear {
    background: none;
    border: none;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
  }

  .btn-select-all {
    color: #3d6e5c;
  }

  .btn-clear {
    color: #f44336;
  }

  .btn-select-all:disabled,
  .btn-clear:disabled {
    color: #ccc;
    cursor: not-allowed;
  }

  .summary-content {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
  }

  .empty-selection {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    color: #666;
    font-style: italic;
    text-align: center;
  }

  .selected-db {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e0e0e0;
  }

  .selected-db:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }

  .selected-db-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
  }

  .selected-db-name {
    font-weight: 500;
    color: #333;
    font-size: 14px;
  }

  .selected-db-type {
    color: #666;
    font-size: 12px;
    font-weight: normal;
  }

  .db-schema-actions {
    display: flex;
    gap: 10px;
  }

  .btn-select-db-schemas {
    background: none;
    border: none;
    color: #3d6e5c;
    font-size: 12px;
    cursor: pointer;
    padding: 0;
  }

  .btn-select-db-schemas:disabled {
    color: #ccc;
    cursor: not-allowed;
  }

  .schema-loading {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    color: #666;
    font-size: 13px;
  }

  .schema-error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    color: #f44336;
    font-size: 13px;
  }

  .btn-retry {
    background: none;
    border: 1px solid #f44336;
    color: #f44336;
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 3px;
    cursor: pointer;
  }

  .btn-retry:hover {
    background-color: #fff5f5;
  }

  .no-schemas {
    padding: 10px 0;
    color: #666;
    font-style: italic;
    font-size: 13px;
  }

  .selected-schemas {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .schema-item {
    padding: 8px 12px;
    background-color: #f0f0f0;
    border-radius: 4px;
    font-size: 13px;
    color: #333;
    transition: all 0.2s;
  }

  /* 선택된 스키마 항목 스타일 */
  .selected-schema-item {
    background-color: #e8f4f0;
    border: 1px solid #3d6e5c;
  }

  /* 다른 시스템에 할당된 스키마 스타일 */
  .other-system-schema-item {
    background-color: #fff0f0;
    border: 1px dashed #ffcccc;
    opacity: 0.85;
  }

  .other-system-schema-item:hover {
    background-color: #ffe0e0;
  }

  .schema-checkbox-wrapper {
    display: flex;
    align-items: center;
  }

  /* 스키마 체크박스 스타일 */
  .schema-checkbox {
    margin-right: 8px;
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #3d6e5c;
  }

  /* 비활성화된 체크박스의 레이블 스타일 */
  input[type='checkbox']:disabled + .schema-label {
    color: #888;
    cursor: not-allowed;
  }

  .schema-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    flex: 1;
  }

  .schema-name {
    font-weight: 400;
  }

  .assigned-badge {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    background-color: #e74c3c;
    color: white;
    padding-right: 5px;
    border-radius: 3px;
    margin-left: 8px;
    font-weight: 500;
  }

  .assigned-badge i {
    margin-right: 4px;
    font-size: 10px;
  }

  /* 버튼 스타일 */
  .btn-m {
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }

  .btn-m:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .confirm {
    background-color: #3d6e5c;
    color: white;
  }

  .confirm:hover:not(:disabled) {
    background-color: #2a4d40;
  }

  .close {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;
  }

  .close:hover {
    background-color: #e5e5e5;
  }

  /* 잠긴 데이터베이스 항목 스타일 */
  .locked-db-item {
    background-color: #f8f4e0;
    border-left: 3px solid #e7c13c;
  }

  .db-locked-badge {
    display: inline-flex;
    align-items: center;
    font-size: 10px;
    background-color: #e7c13c;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    margin-left: 8px;
    font-weight: 500;
  }

  .db-locked-badge i {
    margin-right: 4px;
    font-size: 10px;
  }

  /* 스키마 매핑된 배지 */
  .schema-mapped-badge {
    background-color: #10b981;
    color: white;
  }

  /* 데이터베이스만 매핑된 배지 */
  .db-only-badge {
    background-color: #fbbf24;
    color: #78350f;
  }

  .db-status-badge i {
    margin-right: 4px;
    font-size: 10px;
  }

  /* 비활성화된 체크박스의 레이블 스타일을 수정 - 비활성화된 경우에도 가독성 유지 */
  input[type='checkbox']:disabled + .db-label {
    color: #333; /* 텍스트 색상은 그대로 유지 */
    cursor: not-allowed;
    opacity: 0.9; /* 약간만 투명하게 */
  }

  /* 스크롤바 스타일 */
  .schema-tree-container::-webkit-scrollbar,
  .selection-summary::-webkit-scrollbar,
  .summary-content::-webkit-scrollbar {
    width: 8px;
  }

  .schema-tree-container::-webkit-scrollbar-track,
  .selection-summary::-webkit-scrollbar-track,
  .summary-content::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  .schema-tree-container::-webkit-scrollbar-thumb,
  .selection-summary::-webkit-scrollbar-thumb,
  .summary-content::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  .schema-tree-container::-webkit-scrollbar-thumb:hover,
  .selection-summary::-webkit-scrollbar-thumb:hover,
  .summary-content::-webkit-scrollbar-thumb:hover {
    background: #aaa;
  }
</style>
