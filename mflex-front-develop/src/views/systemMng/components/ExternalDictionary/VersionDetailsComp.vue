<template>
  <div class="full-contents">
    <div class="content-top">
      <div class="title-s">
        공식사전 상세 정보
        <AppTooltip
          :htmlContent="getTooltipById('externalDictionaryVersionDetails')"
        >
        </AppTooltip>
      </div>
      <button
        class="btn-s excle-btn"
        title="공식사전파일업로드"
        @click="onOpenExternalFileUpload"
        :disabled="
          !externalDictionaryVersion.dictionaryId ||
          externalDictionaryVersion.progressStatusName === '완료'
        "
      >
        공식사전파일업로드
      </button>
    </div>
    <div class="inputs-row">
      <div class="input-top"></div>
      <div class="inputs-wrap">
        <!-- <DictionarySearchView /> -->
        <VersionDetailsTabComp />
      </div>
    </div>

    <!-- 저장 알림창 -->
    <AppDialog
      v-model:view="saveConfirmState.view"
      :title="saveConfirmState.title"
      :message="saveConfirmState.message"
      @confirm="onSave"
    />

    <!-- 취소 확인창 -->
    <AppDialog
      v-model:view="cancelConfirmState.view"
      :title="cancelConfirmState.title"
      :message="cancelConfirmState.message"
      @confirm="onReCancel"
    />

    <!-- 삭제 알림창 -->
    <AppDialog
      v-model:view="deleteConfirmState.view"
      :title="deleteConfirmState.title"
      :message="deleteConfirmState.message"
      @confirm="onDelete"
    />
  </div>

  <AppWindow
    :view="externalFileUploadWindowView"
    @close="onCloseExternalFileUpload"
    width="1500px"
    height="700px"
  >
    <ExternalFileUploadWindow
      @confirm="onConfirmExternalFileUpload"
      @close="onCloseExternalFileUpload"
    >
    </ExternalFileUploadWindow>
  </AppWindow>
</template>

<script setup>
  import { ref, reactive, computed, watch, onMounted } from 'vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppDialog from '@/components/ui/AppDialog.vue';
  import VersionDetailsTabComp from '@/views/systemMng/components/ExternalDictionary/VersionDetailsTabComp.vue';
  import ExternalFileUploadWindow from '@/components/popWindow/ExternalFileUploadWindow.vue';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import { useAuthStore } from '@/stores/auth';
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import { storeToRefs } from 'pinia';

  // Props 정의
  const props = defineProps({
    selectedData: {
      type: Object,
      default: () => ({}),
    },
    instituteId: {
      type: [Number, String],
      default: 0,
    },
  });

  // Emit 이벤트 정의
  const emit = defineEmits([
    'save-dictionary',
    'delete-dictionary',
    'cancel',
    'change-mode',
  ]);

  // 사용자 정보 가져오기
  const authStore = useAuthStore();
  const { userInfo } = storeToRefs(authStore);
  const { userId, userNm } = userInfo.value || { userId: '', userNm: '' };

  const { externalDictionaryVersion } = storeToRefs(
    useExternalDictionaryStore()
  );

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const { setExternalDictionaryVersion, setFileUploadState } =
    useExternalDictionaryStore();

  // 작성자 정보
  const writerInfo = computed(() => `${userNm}(${userId})`);

  // 작업 구분 상태
  const regType = ref('추가');

  // 사전 유형 목록 및 선택값
  const dictionaryTypeOptions = reactive([
    { code: '10', name: '일반사전' },
    { code: '20', name: '특수사전' },
    { code: '30', name: '공식사전' },
  ]);
  const dictionaryTypeSelected = ref('30');

  // 사전 유형 텍스트 계산
  const dictionaryTypeText = computed(() => {
    const selectedOption = dictionaryTypeOptions.find(
      (option) => option.code === dictionaryTypeSelected.value
    );
    return selectedOption ? selectedOption.name : '공식사전';
  });

  // 현재 날짜 및 시간 포맷
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8);
  const formattedDate = ref(`${dateStr} ${timeStr}`);

  // 사전 데이터
  const dictionaryData = ref({
    dictionaryId: '',
    dictionaryName: '',
    dictionaryTypeCode: '30',
    dictionaryTypeName: '공식사전',
    dictionaryFontColorName: '#FFFFFF',
    dictionaryBackGroundColorName: '#F0823E',
    dictionaryExplain: '',
    userId: userId,
    username: userNm,
    state: 'init',
  });

  // 알림창 상태
  const saveConfirmState = reactive({
    view: false,
    title: '저장 확인',
    message: '작업 내용을 저장하시겠습니까?',
  });

  const cancelConfirmState = reactive({
    view: false,
    title: '취소 확인',
    message: '작업 내용을 취소 하시겠습니까?',
  });

  const deleteConfirmState = reactive({
    view: false,
    title: '삭제 확인',
    message:
      '정말 공식사전을 삭제 하시겠습니까?<br><span style="color:red">(삭제 후 초기 화면으로 돌아갑니다.)</span>',
  });

  // 작업 구분 변경 함수
  const onSelectReg = (value) => {
    switch (value) {
      case 0:
        regType.value = '추가';
        dictionaryData.value.state = 'add';
        initializeFormForAdd();
        break;
      case 1:
        regType.value = '수정';
        dictionaryData.value.state = 'edit';
        dictionaryData.value.action = '수정';
        break;
      case 2:
        regType.value = '삭제';
        break;
      case 3:
        regType.value = '조회';
        dictionaryData.value.state = 'lookup';
        break;
    }

    emit('change-mode', regType.value);
  };

  // 폼 초기화 함수 (추가 모드용)
  const initializeFormForAdd = () => {
    dictionaryData.value = {
      dictionaryId: '',
      dictionaryName: '',
      dictionaryTypeCode: '30',
      dictionaryTypeName: '공식사전',
      dictionaryFontColorName: '#FFFFFF',
      dictionaryBackGroundColorName: '#F0823E',
      dictionaryExplain: '',
      userId: userId,
      username: userNm,
      state: 'add',
      action: '추가',
    };

    dictionaryTypeSelected.value = '30';
    updateFormattedDate();
  };

  // 날짜 업데이트 함수
  const updateFormattedDate = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8);
    formattedDate.value = `${dateStr} ${timeStr}`;
  };

  // 확인 다이얼로그 함수들
  const onSaveConfirm = () => {
    saveConfirmState.view = true;
  };

  const onCancelConfirm = () => {
    cancelConfirmState.view = true;
  };

  const onDeleteConfirm = () => {
    deleteConfirmState.view = true;
  };

  // 액션 처리 함수들
  const onSave = () => {
    // 저장 데이터 준비
    const saveData = {
      instituteId: props.instituteId,
      dictionaryId: dictionaryData.value.dictionaryId || null,
      dictionaryName: dictionaryData.value.dictionaryName,
      dictionaryTypeCode: dictionaryTypeSelected.value,
      dictionaryTypeForegroundColorName:
        dictionaryData.value.dictionaryFontColorName,
      dictionaryTypeBackgroundColorName:
        dictionaryData.value.dictionaryBackGroundColorName,
      description: dictionaryData.value.dictionaryExplain,
      action: regType.value,
    };

    // 유효성 검증
    if (!saveData.dictionaryName) {
      alert('공식사전명은 필수 입력 항목입니다.');
      return;
    }

    if (!saveData.description) {
      alert('공식사전 설명은 필수 입력 항목입니다.');
      return;
    }

    // 부모 컴포넌트에 저장 이벤트 발생
    emit('save-dictionary', saveData);

    // 작업 완료 후 조회 모드로 변경
    onSelectReg(3);
  };

  const onDelete = () => {
    if (dictionaryData.value.dictionaryId) {
      emit('delete-dictionary', {
        dictionaryId: dictionaryData.value.dictionaryId,
        instituteId: props.instituteId,
      });
    }

    // 초기화
    initializeFormForAdd();
    onSelectReg(0);
  };

  const onReCancel = () => {
    if (regType.value === '수정' && props.selectedData?.dictionaryId) {
      // 수정 취소 시 원본 데이터로 복원
      loadDictionaryDetails(props.selectedData);
      onSelectReg(3);
    } else {
      // 추가 취소 시 초기화
      initializeFormForAdd();
    }

    emit('cancel');
  };

  // 선택된 사전 데이터가 변경될 때 상세 정보 불러오기
  const loadDictionaryDetails = (data) => {
    if (!data || !data.dictionaryId) return;

    dictionaryData.value = {
      dictionaryId: data.dictionaryId,
      dictionaryName: data.dictionaryName || '',
      dictionaryTypeCode: data.dictionaryTypeCode || '30',
      dictionaryTypeName: data.dictionaryTypeName || '공식사전',
      dictionaryFontColorName: data.dictionaryFontColorName || '#FFFFFF',
      dictionaryBackGroundColorName:
        data.dictionaryBackGroundColorName || '#F0823E',
      dictionaryExplain: data.dictionaryExplain || '',
      userId: data.userId || userId,
      username: data.username || userNm,
      state: 'lookup',
    };

    // 사전 유형 선택 상태 업데이트
    dictionaryTypeSelected.value = data.dictionaryTypeCode || '30';

    // 수정일 업데이트
    if (data.updateDateTime) {
      formattedDate.value = data.updateDateTime;
    } else {
      updateFormattedDate();
    }

    // 조회 모드로 설정
    onSelectReg(3);
  };

  const externalFileUploadWindowView = ref(false);

  const onConfirmExternalFileUpload = async () => {
    setFileUploadState(true);
  };

  const onOpenExternalFileUpload = () => {
    externalFileUploadWindowView.value = true;
  };

  const onCloseExternalFileUpload = () => {
    externalFileUploadWindowView.value = false;
  };

  // props.selectedData가 변경될 때마다 상세 정보 로드
  watch(
    () => props.selectedData,
    (newData) => {
      if (newData && Object.keys(newData).length > 0) {
        loadDictionaryDetails(newData);
      }
    },
    { deep: true, immediate: true }
  );

  // 컴포넌트 마운트 시 초기화
  onMounted(() => {
    if (props.selectedData?.dictionaryId) {
      loadDictionaryDetails(props.selectedData);
    } else {
      initializeFormForAdd();
    }
  });
</script>

<style lang="scss" scoped>
  .full-contents {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-right: 10px;
    padding-left: 10px;
  }

  .content-top {
    display: flex;
    align-items: center;
    padding: 10px 0;
    padding-bottom: 0px;
  }

  .title-s {
    font-size: 16px;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-right: 15px;
  }

  .inputs-row {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .input-top {
    margin-bottom: 10px;
  }

  .inputs-wrap {
    flex: 1;
    overflow: auto;
  }

  .title-btns__row_btween {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .input-form .input-table {
    width: 100%;
    border-collapse: collapse;

    th {
      background-color: #f7f7f7;
      padding: 10px 13px 10px 1px;
      text-align: right;
      font-size: 13px;
      font-weight: 500;
      line-height: normal;
      width: 120px;
      border: 1px solid #ddd;
    }

    td {
      // padding: 10px;
      border: 1px solid #ddd;
    }
  }

  .td-col {
    display: flex;
    // align-items: center;
  }

  .col-row {
    display: flex;
    align-items: center;
    // gap: 20px;
  }

  .select-pickers {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .application-category__icon-s {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px 12px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    min-width: 80px;
    text-align: center;
  }

  // .regbox {
  //   padding: 5px 15px;
  //   border-radius: 4px;
  //   font-weight: 500;
  //   min-width: 80px;
  //   text-align: center;

  //   &-select {
  //     background-color: #e0e0e0;
  //     color: #333;
  //   }

  //   &-add {
  //     background-color: #4caf50;
  //     color: white;
  //   }

  //   &-change {
  //     background-color: #2196f3;
  //     color: white;
  //   }
  // }

  // .btn-s {
  //   padding: 5px 12px;
  //   margin-left: 5px;
  //   border-radius: 4px;
  //   font-size: 13px;
  //   background-color: #f5f5f5;
  //   border: 1px solid #ddd;
  //   cursor: pointer;

  //   &:hover {
  //     background-color: #e0e0e0;
  //   }

  //   &:disabled {
  //     opacity: 0.5;
  //     cursor: not-allowed;
  //   }

  //   &.green {
  //     background-color: #4caf50;
  //     color: white;
  //     border: none;

  //     &:hover {
  //       background-color: #45a049;
  //     }
  //   }
  // }

  .label {
    font-size: 12px;
    margin-right: 5px;
  }
</style>
