<template>
  <div class="database-schema-container" :class="{ 'with-form': showForm }">
    <div class="schema-content">
      <div class="schema-header">
        <div class="title-s">
          스키마 목록
          <AppTooltip :htmlContent="getTooltipById('schemaList')"> </AppTooltip>
        </div>
        <div class="button-group">
          <button class="btn-add" @click="toggleAddForm">
            <span class="btn-text">{{ showForm ? '취소' : '추가' }}</span>
          </button>
        </div>
      </div>
      <div class="schema-list-wrapper">
        <div class="schema-list" ref="schemaListRef">
          <div v-if="schemaList.length === 0" class="empty-list">
            <span>연동된 스키마가 없습니다.</span>
          </div>
          <div v-else>
            <div
              v-for="(schema, index) in schemaList"
              :key="'schema-' + index"
              class="schema-item"
            >
              <div class="schema-info">
                <span class="schema-name">{{ schema.schemaName }}</span>
                <span class="schema-detail">
                  <span class="db-name">{{ schema.databaseName }}</span>
                  <span class="db-type" v-if="schema.dbType"
                    >({{ schema.dbType }})</span
                  >
                </span>
              </div>
              <div class="schema-actions">
                <button
                  class="btn-delete"
                  @click="onOpenCofirmWindow(schema)"
                  title="삭제"
                >
                  <span class="delete-icon">-</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 간소화된 슬라이딩 입력 폼 -->
    <div class="schema-form-container" :class="{ show: showForm }">
      <div class="form-header">
        <h3>스키마 추가</h3>
      </div>
      <div class="form-body">
        <div class="form-row">
          <label style="color: red" for="schemaName">*스키마명</label>
          <input
            id="schemaName"
            ref="schemaNameInput"
            v-model="newSchema.schemaName"
            class="form-input"
            type="text"
            placeholder="스키마명 입력"
            @keyup.enter="saveNewSchema"
            required
          />
        </div>
      </div>
      <div class="form-footer">
        <button
          class="btn-save"
          @click="saveNewSchema"
          :disabled="!newSchema.schemaName.trim()"
        >
          저장
        </button>
        <button class="btn-cancel" @click="toggleAddForm">취소</button>
      </div>
    </div>
  </div>

  <!-- 스키마 삭제 -->
  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="300px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onDeleteSchema"
      @close="onCloseConfirmWindow"
    />
  </AppWindow>
</template>

<script setup>
  import {
    ref,
    defineProps,
    defineEmits,
    onMounted,
    watch,
    computed,
    nextTick,
  } from 'vue';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import { storeToRefs } from 'pinia';
  import {
    getSchemaList,
    addSchema,
    deleteSchema,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  const systemStore = useSystemMngStore();
  const { selectSystem, selectSystemInstituteId, selectDatabaseInfo } =
    storeToRefs(systemStore);

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const props = defineProps({
    systemId: {
      type: [Number, String],
      required: false,
      default: null,
    },

    isAddnewSchema: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:schemas', 'update:isAddnewSchema']);

  const schemaListRef = ref(null);
  const schemaNameInput = ref(null);
  const showForm = ref(false);
  const schemaList = ref([]);

  // 새 스키마를 위한 폼 데이터 - 스키마 이름만 필요하지만 기존 데이터 구조 유지
  const newSchema = ref({
    schemaName: '',
    databaseName: '',
    dbType: '',
    description: '',
  });

  // 폼 유효성 검증 - 스키마 이름만 필요
  const isFormValid = computed(() => {
    return newSchema.value.schemaName.trim() !== '';
  });

  // 폼 토글
  const toggleAddForm = () => {
    if (showForm.value) {
      // 폼을 닫을 때는 초기화
      resetForm();
    } else {
      // 폼을 열 때는 현재 선택된 데이터베이스 정보로 초기화
      if (selectDatabaseInfo.value) {
        newSchema.value.databaseName =
          selectDatabaseInfo.value.databaseName || '';
        newSchema.value.dbType = selectDatabaseInfo.value.dbmsKindCode || '';
      }

      // 폼이 열리면 입력 필드에 포커스
      nextTick(() => {
        if (schemaNameInput.value) {
          schemaNameInput.value.focus();
        }
      });
    }
    showForm.value = !showForm.value;
  };

  // 폼 초기화
  const resetForm = () => {
    newSchema.value = {
      schemaName: '',
      databaseName: '',
      dbType: '',
      description: '',
    };
  };

  // 새 스키마 저장
  const saveNewSchema = async () => {
    if (!isFormValid.value) return;

    try {
      // 데이터베이스 정보 자동 설정 (사용자가 입력하지 않음)
      if (selectDatabaseInfo.value) {
        newSchema.value.databaseName = selectDatabaseInfo.value.databaseName;
        newSchema.value.dbType = selectDatabaseInfo.value.dbmsKindCode;
      }

      // API 호출을 통해 저장하는 로직
      const schemaData = {
        databaseId: selectDatabaseInfo.value?.databaseId,
        instituteId: selectDatabaseInfo.value?.instituteId,
        schemaName: newSchema.value.schemaName,
      };

      // API 호출
      const response = await addSchema(schemaData);

      console.log('스키마 추가 응답:', response);

      // 성공적으로 추가된 경우

      // 목록에 추가
      schemaList.value.push({
        ...newSchema.value,
        id: response.id || Date.now(), // API가 반환한 ID 또는 임시 ID
      });

      // 폼 초기화 (먼저 내용 초기화 후 폼 닫기)
      resetForm();
      showForm.value = false;

      // 이벤트 발생
      emit('update:schemas', schemaList.value);

      await fetchData(schemaData);
    } catch (error) {
      console.error('스키마 추가 실패:', error);
      alert('스키마 추가 중 오류가 발생했습니다.');
    }
  };

  const fetchData = async (data) => {
    const response = await getSchemaList(data);

    if (response) {
      schemaList.value = response;
    } else {
      schemaList.value = [];
    }
  };

  // 스키마 삭제
  const onDeleteSchema = async (index, schema) => {
    try {
      // API 호출
      const data = {
        databaseId: selectDatabaseInfo.value?.databaseId,
        instituteId: selectDatabaseInfo.value?.instituteId,
        schemaName: schemaToDelete.value.schemaName,
      };

      await deleteSchema(data);

      // 이벤트 발생
      emit('update:schemas', schemaList.value);
      await fetchData(data);

      onCloseConfirmWindow();
    } catch (error) {
      console.error('스키마 삭제 실패:', error);
      alert('스키마 삭제 중 오류가 발생했습니다.');
    }
  };

  // 삭제할 스키마 정보를 저장할 변수
  const schemaToDelete = ref(null);

  const confirmWindowView = ref(false);
  const onCloseConfirmWindow = () => {
    confirmWindowView.value = false;
  };
  const onOpenCofirmWindow = (schema) => {
    // 삭제할 스키마 정보 저장
    schemaToDelete.value = schema;

    confirmWindowView.value = true;
  };

  const popInfo = ref({
    state: 'confirm',
    popTitle: '스키마 삭제 알림',
    popMessages: `스키마를 <span style="color:red; font-weight:500;">삭제</span>하시겠습니까?`,
    confirmBtnText: '스키마 삭제',
    cancelBtnText: '취소',
  });

  // 컴포넌트가 마운트된 후 스크롤 기능 확인
  onMounted(() => {
    console.log('DatabaseSchemaComp mounted');
    // 만약 항목이 많아 스크롤이 필요하면 스크롤바 표시
    if (
      schemaListRef.value &&
      schemaListRef.value.scrollHeight > schemaListRef.value.clientHeight
    ) {
      console.log('스크롤이 필요합니다');
    }
  });

  // 데이터베이스 정보가 변경될 때 스키마 목록 업데이트
  watch(
    selectDatabaseInfo,
    async (newValue) => {
      console.log('selectDatabaseInfo changed:', newValue);

      if (newValue) {
        // 폼이 열려 있다면 닫기
        if (showForm.value) {
          toggleAddForm();
        }

        // 데이터베이스 정보가 변경되면 스키마 목록을 업데이트
        const data = {
          databaseId: newValue.databaseId,
          instituteId: newValue.instituteId,
        };

        try {
          await fetchData(data);
          // const dbSchemaList = await getSchemaList(data);
          // schemaList.value = dbSchemaList || [];
        } catch (error) {
          console.error('스키마 목록 조회 실패:', error);
          schemaList.value = [];
        }
      }
    }
    // { immediate: true }
  );

  watch(
    () => props.isAddnewSchema,
    (newValue) => {
      console.log('isAddnewSchema changed:', newValue);

      if (newValue === true) {
        // 입력 폼 열기
        showForm.value = true;

        // 폼이 열리면 입력 필드에 포커스
        nextTick(() => {
          if (schemaNameInput.value) {
            schemaNameInput.value.focus();
          }
        });

        // 현재 선택된 데이터베이스 정보로 초기화
        if (selectDatabaseInfo.value) {
          newSchema.value.databaseName =
            selectDatabaseInfo.value.databaseName || '';
          newSchema.value.dbType = selectDatabaseInfo.value.dbmsKindCode || '';
        }

        // 부모 컴포넌트의 isAddnewSchema를 false로 초기화
        emit('update:isAddnewSchema', false);
      }
    }
  );
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
    flex-direction: row; /* 가로 방향으로 변경 */
    height: 280px;
    position: relative; /* 상대 위치 설정 */
    transition: all 0.3s ease;
  }

  .database-schema-container.with-form {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }

  .schema-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* 너비가 축소될 때 올바르게 동작하도록 */
    transition: all 0.3s ease;
  }

  .schema-form-container {
    width: 0;
    background-color: #f5f7fa;
    border-left: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    opacity: 0;
  }

  .schema-form-container.show {
    width: 300px; /* 너비 축소 - 입력필드가 하나만 있기 때문 */
    border-left: 1px solid #e0e0e0;
    opacity: 1;
  }

  .schema-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #e0e0e0;
    background-color: #f8f9fa;
    z-index: 1;
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

  .btn-add,
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
  }

  .btn-add {
    background-color: #4caf50;
    color: white;
  }

  .btn-add:hover {
    background-color: #388e3c;
  }

  .btn-edit {
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
    overflow: hidden;
  }

  .schema-list {
    display: flex;
    flex-direction: column;
    height: 100%;
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

  .empty-list {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    color: #666;
    font-size: 14px;
    font-style: italic;
  }

  .schema-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
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
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .schema-detail {
    display: flex;
    gap: 5px;
    font-size: 12px;
    color: #666;
  }

  .db-name {
    color: #333;
  }

  .db-type {
    color: #666;
    font-size: 12px;
  }

  .schema-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-delete {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background-color: #f44336;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    padding: 0;
    transition: background-color 0.2s, transform 0.1s;
  }

  .btn-delete:hover {
    background-color: #d32f2f;
    transform: scale(1.05);
  }

  .delete-icon {
    line-height: 1;
    margin-bottom: 2px;
  }

  /* 간소화된 폼 스타일 */
  .form-header {
    padding: 15px;
    border-bottom: 1px solid #e0e0e0;
    background-color: #f8f9fa;
  }

  .form-header h3 {
    margin: 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }

  .form-body {
    flex: 1;
    padding: 15px;
  }

  .form-row {
    margin-bottom: 15px;
  }

  .form-row label {
    display: block;
    margin-bottom: 5px;
    color: #555;
    font-size: 13px;
    font-weight: 500;
  }

  .form-input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #333;
    transition: border-color 0.2s;
  }

  .form-input:focus {
    border-color: #3d6e5c;
    outline: none;
    box-shadow: 0 0 0 2px rgba(61, 110, 92, 0.1);
  }

  .form-footer {
    margin-top: auto;
    padding: 15px;
    border-top: 1px solid #e0e0e0;
    background-color: #f8f9fa;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .btn-save,
  .btn-cancel {
    padding: 8px 15px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .btn-save {
    background-color: #3d6e5c;
    color: white;
  }

  .btn-save:hover:not(:disabled) {
    background-color: #2a4d40;
  }

  .btn-save:disabled {
    background-color: #c8d6d2;
    cursor: not-allowed;
  }

  .btn-cancel {
    background-color: #f0f0f0;
    color: #333;
  }

  .btn-cancel:hover {
    background-color: #e0e0e0;
  }

  /* 애니메이션 효과 */
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

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
</style>
