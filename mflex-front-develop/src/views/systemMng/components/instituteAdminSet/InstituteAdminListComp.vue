<template>
  <div class="institute-admin-container" :class="{ 'with-form': showForm }">
    <div class="admin-content">
      <div class="admin-header">
        <div class="title-s">
          기관 관리자 목록
          <AppTooltip :htmlContent="getTooltipById('schemaList')"> </AppTooltip>
        </div>
        <div class="button-group">
          <button class="btn-add" @click="toggleAddForm">
            <span class="btn-text">{{ showForm ? '취소' : '추가' }}</span>
          </button>
        </div>
      </div>
      <div class="admin-list-wrapper">
        <div class="admin-list" ref="adminListRef">
          <div v-if="adminList.length === 0" class="empty-list">
            <span>기관 지정된 관리자가 없습니다.</span>
          </div>
          <div v-else>
            <div
              v-for="(user, index) in adminList"
              :key="'user-' + index"
              class="admin-item"
            >
              <div class="admin-info">
                <span class="admin-name">{{
                  `${user.userName}(${user.userId})`
                }}</span>
              </div>
              <div class="admin-actions">
                <button
                  class="btn-delete"
                  @click="onOpenCofirmWindow(user)"
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
    <div class="admin-form-container" :class="{ show: showForm }">
      <div class="form-header">
        <h3>관리자 추가</h3>
      </div>
      <div class="form-body">
        <div class="form-row">
          <label style="color: red" for="userName">*관리자명</label>
          <select
            id="userName"
            ref="userNameInput"
            v-model="selectedUserId"
            class="form-input"
            @change="onUserSelect"
            required
          >
            <option value="">선택</option>
            <option
              v-for="user in userList"
              :key="user.userId"
              :value="user.userId"
            >
              {{ user.userName }}({{ user.userId }})
            </option>
          </select>
        </div>
      </div>
      <div class="form-footer">
        <button
          class="btn-save"
          @click="saveNewAdmin"
          :disabled="!selectedUserId"
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
  import { storeToRefs } from 'pinia';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useInstituteAdminStore } from '@/stores/InstituteAdmin';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import {
    getInstituteAdminList,
    getInstituteUserList,
    addInstituteAdmin,
    deleteInstituteAdmin,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  const systemStore = useSystemMngStore();
  const { selectDatabaseInfo } = storeToRefs(systemStore);
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

  const adminListRef = ref(null);
  const userNameInput = ref(null);
  const showForm = ref(false);
  const adminList = ref([]);
  const userList = ref([]);

  // 선택된 사용자 ID를 저장하는 변수 추가
  const selectedUserId = ref('');
  const selectedUser = ref(null);

  // 새 관리자를 위한 폼 데이터
  const newAdmin = ref({
    userId: '',
    userName: '',
    databaseName: '',
    dbType: '',
    description: '',
  });

  const { selectTopInstitute } = storeToRefs(useInstituteAdminStore());
  const { setIsUpdateAdminList } = useInstituteAdminStore();

  // 폼 유효성 검증 - 사용자 선택 여부 확인
  const isFormValid = computed(() => {
    return selectedUserId.value !== '';
  });

  // 사용자 선택 시 호출되는 함수
  const onUserSelect = () => {
    if (selectedUserId.value) {
      selectedUser.value = userList.value.find(
        (user) => user.userId === selectedUserId.value
      );
      if (selectedUser.value) {
        newAdmin.value.userId = selectedUser.value.userId;
        newAdmin.value.userName = selectedUser.value.userName;
      }
    } else {
      selectedUser.value = null;
      newAdmin.value.userId = '';
      newAdmin.value.userName = '';
    }
  };

  // 폼 토글
  const toggleAddForm = () => {
    if (showForm.value) {
      // 폼을 닫을 때는 초기화
      resetForm();
    } else {
      // 폼을 열 때는 현재 선택된 데이터베이스 정보로 초기화
      if (selectDatabaseInfo.value) {
        newAdmin.value.databaseName =
          selectDatabaseInfo.value.databaseName || '';
        newAdmin.value.dbType = selectDatabaseInfo.value.dbmsKindCode || '';
      }

      // 폼이 열리면 select에 포커스
      nextTick(() => {
        if (userNameInput.value) {
          userNameInput.value.focus();
        }
      });
    }
    showForm.value = !showForm.value;
  };

  // 폼 초기화
  const resetForm = () => {
    selectedUserId.value = '';
    selectedUser.value = null;
    newAdmin.value = {
      userId: '',
      userName: '',
      databaseName: '',
      dbType: '',
      description: '',
    };
  };

  // 새 관리자 저장
  const saveNewAdmin = async () => {
    if (!isFormValid.value) {
      alert('관리자를 선택해주세요.');
      return;
    }

    const addAdminData = {
      instituteId: selectTopInstitute.value?.instituteId,
      userId: selectedUserId.value,
      roleType: 'ROLE_ADMIN',
    };

    await addInstituteAdmin(addAdminData);
    // 관리자 목록 업데이트 상태
    setIsUpdateAdminList(true);
    getSearchAdminList(selectTopInstitute.value.instituteId)
      .then(() => {
        console.log('관리자 추가 후 목록 조회 성공');
      })
      .catch((error) => {
        console.error('관리자 추가 후 목록 조회 실패:', error);
      });
  };

  // 관리자 삭제
  const onDeleteSchema = async (index, schema) => {
    try {
      // API 호출
      const data = {
        instituteId: selectTopInstitute.value?.instituteId,
        userId: adminToDelete.value.userId,
        roleType: 'ROLE_ADMIN',
      };

      await deleteInstituteAdmin(data);

      // 이벤트 발생
      emit('update:schemas', adminList.value);

      // 관리자 목록 다시 조회
      if (selectTopInstitute.value?.instituteId) {
        await getSearchAdminList(selectTopInstitute.value.instituteId);
      }

      onCloseConfirmWindow();

      // 관리자 목록 업데이트 상태
      setIsUpdateAdminList(true);
    } catch (error) {
      console.error('관리자 삭제 실패:', error);
      alert('기관관리자 삭제 중 오류가 발생했습니다.');
    }
  };

  // 삭제할 관리자 정보를 저장할 변수
  const adminToDelete = ref(null);

  const confirmWindowView = ref(false);
  const onCloseConfirmWindow = () => {
    confirmWindowView.value = false;
  };
  const onOpenCofirmWindow = (admin) => {
    // 삭제할 관리자 정보 저장
    adminToDelete.value = admin;
    confirmWindowView.value = true;
  };

  const popInfo = ref({
    state: 'confirm',
    popTitle: '기관관리자 삭제 알림',
    popMessages: `기관관리자를 <span style="color:red; font-weight:500;">삭제</span>하시겠습니까?`,
    confirmBtnText: '기관관리자 삭제',
    cancelBtnText: '취소',
  });

  // 기관 관리자 목록 조회
  const getSearchAdminList = async (instituteId) => {
    try {
      const response = await getInstituteAdminList(instituteId);
      console.log('기관 관리자 목록 조회:', response);
      adminList.value = response || [];
    } catch (error) {
      console.error('기관 관리자 목록 조회 실패:', error);
      adminList.value = [];
    }
  };

  // 기관 유저 목록 조회
  const getUserList = async (instituteId) => {
    try {
      const instituteUserList = await getInstituteUserList(instituteId);
      console.log('기관 유저 목록 조회 : ', instituteUserList);
      userList.value = instituteUserList || [];
    } catch (error) {
      console.error('기관 유저 목록 조회 실패:', error);
      userList.value = [];
    }
  };

  // 컴포넌트가 마운트된 후 스크롤 기능 확인
  onMounted(() => {
    console.log('InstituteAdminListComp mounted');
    if (
      adminListRef.value &&
      adminListRef.value.scrollHeight > adminListRef.value.clientHeight
    ) {
      console.log('스크롤이 필요합니다');
    }
  });

  // 데이터베이스 정보가 변경될 때 관리자 목록 업데이트
  watch(selectDatabaseInfo, async (newValue) => {
    console.log('selectDatabaseInfo changed:', newValue);

    if (newValue) {
      // 폼이 열려 있다면 닫기
      if (showForm.value) {
        toggleAddForm();
      }
    }
  });

  watch(
    () => props.isAddnewSchema,
    (newValue) => {
      console.log('isAddnewSchema changed:', newValue);

      if (newValue === true) {
        // 입력 폼 열기
        showForm.value = true;

        // 폼이 열리면 select에 포커스
        nextTick(() => {
          if (userNameInput.value) {
            userNameInput.value.focus();
          }
        });

        // 현재 선택된 데이터베이스 정보로 초기화
        if (selectDatabaseInfo.value) {
          newAdmin.value.databaseName =
            selectDatabaseInfo.value.databaseName || '';
          newAdmin.value.dbType = selectDatabaseInfo.value.dbmsKindCode || '';
        }

        // 부모 컴포넌트의 isAddnewSchema를 false로 초기화
        emit('update:isAddnewSchema', false);
      }
    }
  );

  watch(selectTopInstitute, async (newValue) => {
    console.log('새로운 기관 선택됨:', newValue);

    if (newValue?.instituteId) {
      await getSearchAdminList(newValue.instituteId)
        .then(() => {
          console.log('기관 관리자 목록 조회 성공');
        })
        .catch((error) => {
          console.error('기관 관리자 목록 조회 실패:', error);
        });

      await getUserList(newValue.instituteId);
    }
  });
</script>

<style scoped>
  .institute-admin-container {
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

  .institute-admin-container.with-form {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }

  .admin-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0; /* 너비가 축소될 때 올바르게 동작하도록 */
    transition: all 0.3s ease;
  }

  .admin-form-container {
    width: 0;
    background-color: #f5f7fa;
    border-left: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    opacity: 0;
  }

  .admin-form-container.show {
    width: 300px; /* 너비 축소 - 입력필드가 하나만 있기 때문 */
    border-left: 1px solid #e0e0e0;
    opacity: 1;
  }

  .admin-header {
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

  .admin-list-wrapper {
    flex: 1;
    min-height: 100px;
    overflow: hidden;
  }

  .admin-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #ccc #f5f5f5;
  }

  /* 크롬/엣지 브라우저용 스크롤바 스타일링 */
  .admin-list::-webkit-scrollbar {
    width: 8px;
  }

  .admin-list::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  .admin-list::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 4px;
  }

  .admin-list::-webkit-scrollbar-thumb:hover {
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

  .admin-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color 0.2s;
  }

  .admin-item:hover {
    background-color: #f8f9fa;
  }

  .admin-item:last-child {
    border-bottom: none;
  }

  .admin-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .admin-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .admin-detail {
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

  .admin-actions {
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

  #userName {
    height: 40px;
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
