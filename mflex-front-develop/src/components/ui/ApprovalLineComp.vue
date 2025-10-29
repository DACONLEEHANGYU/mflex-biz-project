<template>
  <!-- 결재선 선택 셀렉트박스 -->
  <div v-if="showSelector" class="approval-select">
    <div class="select-wrapper">
      <label class="select-label">결재선 선택</label>
      <select
        v-model="selectedApprovalLineId"
        class="approval-line-select"
        @change="onApprovalLineChange"
        :disabled="disabled"
      >
        <option value="">결재선을 선택해주세요</option>
        <option
          v-for="line in actualApprovalLineOptions"
          :key="line.approvalLineId"
          :value="line.approvalLineId"
        >
          {{ line.approvalLineName }} ({{ line.approvers?.length || 0 }}명)
        </option>
      </select>
      <button
        v-if="!disabled && selectedApprovalLineId"
        class="btn-reset-selection"
        @click="resetSelection"
        title="선택 해제"
      >
        ✕
      </button>
    </div>
  </div>

  <div class="approval-line-editor">
    <!-- 결재선 카드들 -->
    <div class="approval-cards">
      <div
        v-for="(approver, index) in approvalLine"
        :key="approver.id || index"
        class="approval-card"
        :class="{
          dragging: draggedIndex === index,
          'drop-target': dropTargetIndex === index && draggedIndex !== index,
          'drop-target-before':
            dropTargetIndex === index &&
            draggedIndex !== null &&
            draggedIndex > index,
          'drop-target-after':
            dropTargetIndex === index &&
            draggedIndex !== null &&
            draggedIndex < index,
          'drag-source': draggedIndex === index,
        }"
        :draggable="!disabled && approvalLine.length > 1 && !showSelector"
        @dragstart="handleDragStart($event, index)"
        @dragover="handleDragOver($event, index)"
        @dragenter="handleDragEnter($event, index)"
        @dragleave="handleDragLeave($event, index)"
        @drop="handleDrop($event, index)"
        @dragend="handleDragEnd"
      >
        <!-- 드래그 핸들 -->
        <div
          class="drag-handle"
          v-if="approvalLine.length > 1 && !disabled && !showSelector"
        >
          <span>⋮⋮</span>
        </div>

        <!-- 삭제 버튼 -->
        <button
          v-if="!disabled && !showSelector"
          class="delete-card-btn"
          @click="removeApprover(index)"
        >
          ×
        </button>

        <!-- 결재자 정보 -->
        <div class="approver-info">
          <div class="approver-name">
            {{ approver.name }}
          </div>
          <div class="approver-dept">
            {{ approver.department }}
          </div>
          <div class="approval-order">{{ index + 1 }}순위</div>
          <div class="approval-dept">
            {{ approver.status }}
          </div>
        </div>

        <!-- 🔥 개선된 드롭 인디케이터 -->
        <div
          v-if="
            dropTargetIndex === index &&
            draggedIndex !== null &&
            draggedIndex !== index
          "
          class="drop-indicator"
          :class="{
            'drop-before': draggedIndex > index,
            'drop-after': draggedIndex < index,
          }"
        >
          <div class="drop-line"></div>
          <div class="drop-message">
            {{ draggedIndex > index ? '앞에 배치' : '뒤에 배치' }}
          </div>
        </div>
      </div>

      <!-- 추가 버튼 -->
      <div
        v-if="approvalLine.length < maxApprovers && !disabled && !showSelector"
        class="add-approval-card"
        @click="openApproverSelectWindow"
      >
        <div class="add-icon">+</div>
        <div class="add-text">결재자 추가</div>
      </div>
    </div>

    <!-- 결재자 선택 윈도우 -->
    <AppWindow
      :view="showApproverSelectWindow"
      :width="600"
      :height="550"
      :title="'결재자 선택'"
      @close="closeApproverSelectWindow"
    >
      <ApproverSelectWindow
        :excludeUserIds="excludeUserIds"
        :maxSelection="maxApprovers"
        @confirm="onApproverSelected"
        @close="closeApproverSelectWindow"
      />
    </AppWindow>
  </div>
</template>

<script setup>
  // === Import 구문 ===
  import {
    ref,
    computed,
    watch,
    nextTick,
    onMounted,
    onBeforeMount,
  } from 'vue';

  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';

  import {
    addApprovalLineForSystem,
    removeApprovalLineForSystem,
    getApprovalLineList,
  } from '@/utils/mflexApi/approval/ApprovalApi';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import ApproverSelectWindow from '@/components/popWindow/approval/ApproverSelectWindow.vue';

  import { getSystemDetails } from '@/utils/mflexApi/systemMng/systemManagementApi';

  // === Props 정의 ===
  const props = defineProps({
    modelValue: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    maxApprovers: {
      type: Number,
      default: 5,
    },
    showSuccessMessage: {
      type: Boolean,
      default: false,
    },
    showSelector: {
      type: Boolean,
      default: false,
    },
    approvalLineOptions: {
      type: Array,
      default: () => [],
    },
    selectedLineId: {
      type: [String, Number],
      default: null,
    },
    isSystemSetting: {
      type: Boolean,
      default: false,
    },
    isInitialization: {
      type: Boolean,
      default: false,
    },
    // 🔥 새로운 props 추가
    deleteMode: {
      type: String,
      default: 'api', // 'api' | 'ui'
      validator: (value) => ['api', 'ui'].includes(value),
    },
    // 🔥 추가 옵션: API 삭제 시 확인 대화상자 표시 여부
    showDeleteConfirm: {
      type: Boolean,
      default: true,
    },
  });

  // === Emits 정의 ===
  const emit = defineEmits([
    'change',
    'add-approver', // 결재자 추가 시 emit
    'lineSelected',
    'approverRemoved', // 결재자 삭제 시 emit
    'approverRemovedUI', // 🔥 UI 전용 삭제 시 emit (새로 추가)
    'update-sequence', // 결재자 순서 변경 시 emit
    'update:modelValue',
    'update:selectedLineId',
    'update-selectedApprovalLineId',
  ]);

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);

  const { useMetaMngInstId, userInfoSysList } = userStngInfo.value;

  // === 반응형 데이터 선언 ===
  const approvalLine = ref([]);
  const selectedApprovalLineId = ref(props.selectedLineId);
  const showApproverSelectWindow = ref(false);
  const draggedIndex = ref(null);
  const dropTargetIndex = ref(null);

  // === 더미 데이터 ===
  const dummyApprovalLineOptions = ref([
    {
      id: 1,
      name: '개발팀 결재선',
      approvers: [
        {
          id: 101,
          name: '김개발',
          department: '개발팀',
          position: '선임',
          email: 'kim.dev@company.com',
        },
        {
          id: 102,
          name: '박팀장',
          department: '개발팀',
          position: '팀장',
          email: 'park.leader@company.com',
        },
      ],
    },
  ]);

  // const approvalStatus = computed(() => {
  //   return approvalLine.value.map((approver) => approver.status || '대기중');
  // });

  // === Computed 속성들 ===

  // 실제 사용할 결재선 옵션
  const actualApprovalLineOptions = computed(() => {
    if (props.showSelector && props.approvalLineOptions.length === 0) {
      return dummyApprovalLineOptions.value;
    }
    return props.approvalLineOptions;
  });

  // 이미 선택된 결재자 ID 목록
  const excludeUserIds = computed(() => {
    return approvalLine.value.map((a) => a.id);
  });

  // === Watch 함수들 ===

  // Props 변경 감지 로직
  watch(
    () => props.modelValue,
    (newValue) => {
      console.log('ApprovalLineComp - Props modelValue 변경 감지:', {
        newValue,
        currentValue: approvalLine.value,
      });

      const newValueStr = JSON.stringify(newValue || []);
      const currentValueStr = JSON.stringify(approvalLine.value || []);

      if (newValueStr !== currentValueStr) {
        console.log('ApprovalLineComp - 실제 데이터 변경 감지, 업데이트 중...');
        approvalLine.value = newValue
          ? JSON.parse(JSON.stringify(newValue))
          : [];
        console.log('ApprovalLineComp - 업데이트 완료:', approvalLine.value);
      }
    },
    {
      deep: true,
      immediate: true,
    }
  );

  // 내부 데이터 변경 시 부모에게 전달
  watch(
    approvalLine,
    (newValue) => {
      if (props.showSelector) return;

      console.log('ApprovalLineComp - 내부 approvalLine 변경:', newValue);

      nextTick(() => {
        const clonedValue = JSON.parse(JSON.stringify(newValue || []));
        emit('update:modelValue', clonedValue);
        emit('change', clonedValue);
      });
    },
    { deep: true }
  );

  // 선택된 결재선 ID Props 변경 감지
  watch(
    () => props.selectedLineId,
    (newValue) => {
      console.log('🔄 props.selectedLineId 변경 감지:', newValue);

      if (selectedApprovalLineId.value !== newValue) {
        selectedApprovalLineId.value = newValue || '';

        if (newValue) {
          loadApprovalLineById(newValue);
        } else {
          // 빈 값인 경우 초기화
          approvalLine.value = [];
          emit('update:modelValue', []);
          emit('change', []);
          emit('lineSelected', null);
        }
      }
    },
    { immediate: true }
  );

  watch(
    () => selectedApprovalLineId.value,
    (newValue) => {
      console.log('🔄 selectedApprovalLineId 변경 감지:', newValue);
      emit('update-selectedApprovalLineId', newValue);
    }
  );

  // === 결재선 관련 함수들 ===

  // 결재선 선택 변경 핸들러
  const onApprovalLineChange = () => {
    console.log('결재선 선택 변경:', selectedApprovalLineId.value);

    emit('update:selectedLineId', selectedApprovalLineId.value);
    loadApprovalLineById(selectedApprovalLineId.value);

    console.log('actualApprovalLineOptions:', actualApprovalLineOptions.value);

    // 🔥 선택된 결재선 정보를 부모에게 전달
    const selectedLine = actualApprovalLineOptions.value.find(
      (line) => line.approvalLineId === selectedApprovalLineId.value
    );

    if (selectedLine) {
      // 🔥 결재선 메타데이터와 함께 전달
      const lineInfo = {
        approvalLineId: selectedLine.approvalLineId,
        approvalLineName: selectedLine.approvalLineName,
        approversCount: selectedLine.approvers?.length || 0,
        createDateTime: selectedLine.createDateTime,
        creatorName: selectedLine.creatorName,
        updateDateTime: selectedLine.updateDateTime,
        updaterName: selectedLine.updaterName,
        useYn: selectedLine.useYn,
        originalData: selectedLine, // 원본 데이터도 포함
      };

      console.log('선택된 결재선 정보 전달:', lineInfo);
      emit('lineSelected', lineInfo);
    } else {
      emit('lineSelected', null);
    }
  };

  // 결재선 ID로 결재선 로드
  const loadApprovalLineById = (lineId) => {
    console.log('🔄 loadApprovalLineById 호출:', lineId);

    if (!lineId) {
      console.log('❌ lineId가 없음');
      approvalLine.value = [];
      emit('update:modelValue', []);
      emit('change', []);
      return;
    }

    if (!props.showSelector) {
      console.log('❌ showSelector가 false - 결재선 로드 건너뜀');
      return;
    }

    // 🔥 결재선 옵션이 로드될 때까지 대기하는 함수
    const attemptLoad = (retryCount = 0) => {
      const maxRetries = 5;

      if (actualApprovalLineOptions.value.length === 0) {
        if (retryCount < maxRetries) {
          console.log(
            `⏳ 결재선 옵션 로딩 대기 중... (${retryCount + 1}/${maxRetries})`
          );
          setTimeout(() => attemptLoad(retryCount + 1), 200);
          return;
        } else {
          console.warn('❌ 결재선 옵션 로드 타임아웃');
          return;
        }
      }

      // 🔥 실제 결재선 로드 실행
      try {
        const selectedLine = actualApprovalLineOptions.value.find(
          (line) => line.approvalLineId === lineId
        );

        if (!selectedLine) {
          console.warn('❌ 결재선을 찾을 수 없음:', lineId);
          console.log(
            '사용 가능한 결재선 목록:',
            actualApprovalLineOptions.value.map((line) => ({
              id: line.approvalLineId,
              name: line.approvalLineName,
            }))
          );

          // 🔥 결재선을 찾을 수 없는 경우 기본 상태로 설정
          selectedApprovalLineId.value = '';
          approvalLine.value = [];
          emit('update:selectedLineId', '');
          emit('update:modelValue', []);
          emit('change', []);
          emit('lineSelected', null);
          return;
        }

        console.log('✅ 결재선 발견:', {
          id: selectedLine.approvalLineId,
          name: selectedLine.approvalLineName,
          approversCount: selectedLine.approvers?.length || 0,
        });

        // 🔥 결재자 데이터 변환
        if (selectedLine.approvers && selectedLine.approvers.length > 0) {
          const transformedApprovers = transformApproverData(
            selectedLine.approvers,
            {
              approvalLineId: selectedLine.approvalLineId,
              approvalLineName: selectedLine.approvalLineName,
            }
          );

          console.log('✅ 데이터 변환 완료:', transformedApprovers);

          // 상태 업데이트
          approvalLine.value = transformedApprovers;

          // 부모에게 알림
          nextTick(() => {
            emit('update:modelValue', transformedApprovers);
            emit('change', transformedApprovers);
            console.log('✅ 부모 컴포넌트 업데이트 완료');
          });

          // 🔥 선택된 결재선 정보를 부모에게 전달
          const lineInfo = {
            approvalLineId: selectedLine.approvalLineId,
            approvalLineName: selectedLine.approvalLineName,
            approversCount: selectedLine.approvers.length,
            createDateTime: selectedLine.createDateTime,
            creatorName: selectedLine.creatorName,
            updateDateTime: selectedLine.updateDateTime,
            updaterName: selectedLine.updaterName,
            useYn: selectedLine.useYn,
            originalData: selectedLine,
          };

          emit('lineSelected', lineInfo);
          console.log('✅ 결재선 정보 부모에게 전달:', lineInfo);
        } else {
          console.log('ℹ️ 결재자가 없는 결재선');
          approvalLine.value = [];
          emit('update:modelValue', []);
          emit('change', []);
        }
      } catch (error) {
        console.error('❌ 결재선 로드 중 오류:', error);
        approvalLine.value = [];
        emit('update:modelValue', []);
        emit('change', []);
      }
    };

    // 로드 시도 시작
    attemptLoad();
  };

  // 🔥 데이터 검증 및 안전성 개선 함수 추가
  const validateApproverData = (approver) => {
    const required = ['approverId', 'approverName'];
    const missing = required.filter((field) => !approver[field]);

    if (missing.length > 0) {
      console.warn('결재자 데이터에 필수 필드가 누락됨:', missing, approver);
      return false;
    }
    return true;
  };

  // 🔥 개선된 데이터 변환 함수 (별도 분리)
  const transformApproverData = (approvers, lineMetadata = {}) => {
    if (!Array.isArray(approvers)) {
      console.warn('approvers가 배열이 아닙니다:', approvers);
      return [];
    }

    return approvers
      .filter(validateApproverData) // 유효한 데이터만 필터링
      .sort((a, b) => (a.approvalOrder || 0) - (b.approvalOrder || 0)) // 안전한 정렬
      .map((approver, index) => {
        // 🔥 기본값과 함께 안전한 변환
        const transformed = {
          id: approver.approverId,
          userId: approver.approverId,
          name: approver.approverName,
          department: approver.department || '', // 기본값 설정
          position: approver.position || '직급 미정', // 기본값 설정
          email: approver.email || `${approver.approverId}@company.com`,
          approverSeq: approver.approverSeq || index + 1,
          approvalOrder: approver.approvalOrder || index + 1,
          // 메타데이터 추가
          lineId: lineMetadata.approvalLineId,
          lineName: lineMetadata.approvalLineName,
          isReadOnly: true, // 읽기 전용 플래그
        };

        console.log(`결재자 ${index + 1} 변환 완료:`, {
          원본: approver,
          변환됨: transformed,
        });

        return transformed;
      });
  };

  // 🔥 loadApprovalLineById 함수를 더 안전하게 재작성
  const loadApprovalLineById_Safe = (lineId) => {
    console.log('🔄 결재선 로드 시작:', lineId);

    if (!lineId || !props.showSelector) {
      console.log(
        '❌ 조건 불충족 - lineId:',
        lineId,
        'showSelector:',
        props.showSelector
      );
      return;
    }

    try {
      const selectedLine = actualApprovalLineOptions.value.find(
        (line) => line.approvalLineId === lineId
      );

      if (!selectedLine) {
        console.warn('❌ 결재선을 찾을 수 없음:', lineId);
        approvalLine.value = [];
        emit('update:modelValue', []);
        emit('change', []);
        return;
      }

      console.log('✅ 결재선 발견:', {
        id: selectedLine.approvalLineId,
        name: selectedLine.approvalLineName,
        approversCount: selectedLine.approvers?.length || 0,
      });

      // 🔥 개선된 데이터 변환 사용
      const transformedApprovers = transformApproverData(
        selectedLine.approvers || [],
        {
          approvalLineId: selectedLine.approvalLineId,
          approvalLineName: selectedLine.approvalLineName,
        }
      );

      console.log('✅ 데이터 변환 완료:', transformedApprovers);

      // 상태 업데이트
      approvalLine.value = transformedApprovers;

      // 부모에게 알림
      nextTick(() => {
        emit('update:modelValue', transformedApprovers);
        emit('change', transformedApprovers);
        console.log('✅ 부모 컴포넌트 업데이트 완료');
      });
    } catch (error) {
      console.error('❌ 결재선 로드 중 오류:', error);
      approvalLine.value = [];
      emit('update:modelValue', []);
      emit('change', []);
    }
  };

  // 선택 해제
  const resetSelection = () => {
    selectedApprovalLineId.value = '';
    approvalLine.value = [];
    emit('update:selectedLineId', '');
    emit('update:modelValue', []);
    emit('change', []);
    emit('lineSelected', null);
  };

  // === 결재자 관련 함수들 ===

  // 결재자 선택 윈도우 열기
  const openApproverSelectWindow = () => {
    if (props.disabled || props.showSelector) return;

    if (approvalLine.value.length >= props.maxApprovers) {
      alert(`최대 ${props.maxApprovers}명까지만 추가할 수 있습니다.`);
      return;
    }
    showApproverSelectWindow.value = true;
  };

  // 결재자 선택 윈도우 닫기
  const closeApproverSelectWindow = () => {
    showApproverSelectWindow.value = false;
  };

  // 결재자 선택 완료
  const onApproverSelected = (selectedApprover) => {
    if (props.showSelector) return;

    console.log('선택된 결재자:', selectedApprover);

    const exists = approvalLine.value.some(
      (approver) => approver.id === selectedApprover.id
    );
    if (exists) {
      alert('이미 추가된 결재자입니다.');
      closeApproverSelectWindow();
      return;
    }

    const newApprovalLine = [...approvalLine.value, { ...selectedApprover }];
    approvalLine.value = newApprovalLine;

    emit('add-approver', selectedApprover);

    closeApproverSelectWindow();
  };

  // 🔥 결재자 삭제 함수 수정
  const removeApprover = async (index) => {
    if (props.disabled || props.showSelector) return;

    const approverToRemove = approvalLine.value[index];

    if (!approverToRemove) {
      console.warn('삭제할 결재자를 찾을 수 없습니다.');
      return;
    }

    console.log('결재자 삭제 요청:', {
      approver: approverToRemove,
      mode: props.deleteMode,
      index: index,
    });

    // 🔥 삭제 모드에 따른 분기 처리
    if (props.deleteMode === 'ui') {
      // 🔥 UI 전용 삭제 - 즉시 삭제
      await handleUIDelete(approverToRemove, index);
    } else {
      // 🔥 API 삭제 - 부모 컴포넌트에서 API 호출 후 처리
      await handleAPIDelete(approverToRemove, index);
    }
  };

  // 🔥 API 삭제 처리 (기존 로직)
  const handleAPIDelete = async (approverToRemove, index) => {
    try {
      console.log('API 삭제 요청:', approverToRemove.name);

      // 부모 컴포넌트에게 삭제 요청 emit (API 호출용)
      const removeResult = await new Promise((resolve, reject) => {
        // emit으로 삭제할 결재자 정보를 부모에게 전달
        emit('approverRemoved', {
          approver: approverToRemove,
          index: index,
          resolve: resolve,
          reject: reject,
        });
      });

      // API 호출이 성공하면 UI에서도 제거
      if (removeResult !== false) {
        const newApprovalLine = approvalLine.value.filter(
          (_, i) => i !== index
        );
        approvalLine.value = newApprovalLine;

        console.log('API 결재자 삭제 완료:', approverToRemove.name);

        if (props.showSuccessMessage) {
          showRemoveSuccess(approverToRemove.name);
        }
      }
    } catch (error) {
      console.error('API 결재자 삭제 실패:', error);
      alert(`결재자 삭제 중 오류가 발생했습니다: ${error.message || error}`);
    }
  };

  // 🔥 UI 전용 삭제 처리
  const handleUIDelete = async (approverToRemove, index) => {
    try {
      // 확인 대화상자 표시 (옵션)
      // if (props.showDeleteConfirm) {
      //   const confirmed = confirm(
      //     `${approverToRemove.name} 결재자를 삭제하시겠습니까?`
      //   );
      //   if (!confirmed) {
      //     console.log('사용자가 삭제를 취소했습니다.');
      //     return;
      //   }
      // }

      console.log('UI 전용 삭제 실행:', approverToRemove.name);

      // UI에서 즉시 제거
      const newApprovalLine = approvalLine.value.filter((_, i) => i !== index);
      approvalLine.value = newApprovalLine;

      // 🔥 UI 전용 삭제 이벤트 emit
      emit('approverRemovedUI', {
        approver: approverToRemove,
        index: index,
        newApprovalLine: newApprovalLine,
      });

      console.log('UI 전용 결재자 삭제 완료:', approverToRemove.name);

      if (props.showSuccessMessage) {
        showRemoveSuccess(approverToRemove.name);
      }
    } catch (error) {
      console.error('UI 삭제 중 오류:', error);
      alert(`결재자 삭제 중 오류가 발생했습니다: ${error.message || error}`);
    }
  };

  // === 성공 메시지 관련 함수들 ===

  // 삭제 성공 메시지 표시
  const showRemoveSuccess = (approverName) => {
    const successMessage = document.createElement('div');
    successMessage.className = 'approver-remove-success';
    successMessage.textContent = `✓ ${approverName} 결재자가 삭제되었습니다`;
    document.body.appendChild(successMessage);

    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        successMessage.remove();
      }
    }, 3000);
  };

  // 순서 변경 성공 메시지 표시
  const showChangeSuccess = () => {
    const successMessage = document.createElement('div');
    successMessage.className = 'order-change-success';
    successMessage.textContent = '✓ 결재 순서가 변경되었습니다';
    document.body.appendChild(successMessage);

    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        successMessage.remove();
      }
    }, 2000);
  };

  // === 드래그 앤 드롭 함수들 ===

  // 드래그 시작
  const handleDragStart = (event, index) => {
    if (props.disabled || props.showSelector) return;
    draggedIndex.value = index;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());

    console.log('드래그 시작:', { draggedIndex: index });
  };

  // 드래그 오버
  const handleDragOver = (event, index) => {
    if (props.disabled || props.showSelector) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  // 드래그 진입
  const handleDragEnter = (event, index) => {
    if (props.disabled || props.showSelector) return;
    event.preventDefault();

    if (draggedIndex.value !== null && draggedIndex.value !== index) {
      dropTargetIndex.value = index;
      console.log('드래그 진입:', {
        draggedIndex: draggedIndex.value,
        dropTargetIndex: index,
      });
    }
  };

  // 드래그 떠남
  const handleDragLeave = (event, index) => {
    if (props.disabled || props.showSelector) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    // 마우스가 요소 경계를 벗어났는지 확인
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      if (dropTargetIndex.value === index) {
        dropTargetIndex.value = null;
      }
    }
  };

  // 드롭 처리 (핵심 수정)
  const handleDrop = (event, dropIndex) => {
    if (props.disabled || props.showSelector) return;
    event.preventDefault();

    const sourceIndex = draggedIndex.value;

    if (sourceIndex === null || sourceIndex === dropIndex) {
      resetDragState();
      return;
    }

    console.log('드롭 실행:', {
      sourceIndex,
      dropIndex,
      approvalLine: approvalLine.value.map((a) => a.name),
      isDropBefore: draggedIndex.value > dropIndex,
      isDropAfter: draggedIndex.value < dropIndex,
    });

    // 드래그된 아이템 복사
    const draggedItem = { ...approvalLine.value[sourceIndex] };
    const newApprovalLine = [...approvalLine.value];

    // 1. 먼저 원본 위치에서 아이템 제거
    newApprovalLine.splice(sourceIndex, 1);

    // 2. 새로운 위치 계산 - "앞에 배치"와 "뒤에 배치" 구분
    let finalDropIndex;

    if (draggedIndex.value > dropIndex) {
      // "앞에 배치" - 드롭 대상 앞에 삽입
      finalDropIndex = dropIndex;
    } else {
      // "뒤에 배치" - 드롭 대상 뒤에 삽입
      // 원본이 제거되었으므로 dropIndex를 그대로 사용 (원본이 뒤에 있었으므로 인덱스 보정 불필요)
      finalDropIndex = dropIndex;
    }

    newApprovalLine.splice(finalDropIndex, 0, draggedItem);

    console.log('이동 결과:', {
      before: approvalLine.value.map((a) => a.name),
      after: newApprovalLine.map((a) => a.name),
      draggedItem: draggedItem.name,
      sourceIndex,
      dropIndex,
      finalDropIndex,
      action: draggedIndex.value > dropIndex ? '앞에 배치' : '뒤에 배치',
    });

    // 상태 업데이트
    approvalLine.value = newApprovalLine;

    // 성공 메시지 및 이벤트 발생
    if (props.showSuccessMessage) {
      const action = draggedIndex.value > dropIndex ? '앞으로' : '뒤로';
      console.log(`결재자 순서 변경: ${draggedItem.name}이(가) ${action} 이동`);
      showChangeSuccess();
    }

    // 부모 컴포넌트에 순서 변경 알림
    emit('update-sequence', newApprovalLine);

    resetDragState();
  };

  // 드래그 종료
  const handleDragEnd = () => {
    console.log('드래그 종료');
    resetDragState();
  };

  // 드래그 상태 리셋
  const resetDragState = () => {
    draggedIndex.value = null;
    dropTargetIndex.value = null;
  };

  onBeforeMount(async () => {
    console.log('컴포넌트 마운트 전');

    console.log('userStngInfo : ', userStngInfo.value);
    console.log('userInfoSysList', userInfoSysList);

    try {
      // 🔥 먼저 결재선 목록을 로드
      const approvalLineList = await getApprovalLineList(useMetaMngInstId);
      console.log('결재선 목록:', approvalLineList);

      // 🔥 actualApprovalLineOptions 업데이트
      if (props.showSelector && props.approvalLineOptions.length === 0) {
        // props가 없으면 더미 데이터 사용 (기존 로직 유지)
        console.log('더미 결재선 옵션 사용');
      } else {
        // 실제 결재선 목록이 있으면 업데이트
        console.log('실제 결재선 옵션 사용:', approvalLineList);
      }

      if (props.isInitialization) {
        const params = {
          systemId: userStngInfo.value.useInfoSysId,
          instituteId: useMetaMngInstId,
        };

        const systemDetails = await getSystemDetails(params);
        console.log('시스템 상세 정보:', systemDetails);

        // 🔥 approvalLines 배열에서 초기 결재선 설정
        if (
          systemDetails.approvalLines &&
          Array.isArray(systemDetails.approvalLines) &&
          systemDetails.approvalLines.length > 0
        ) {
          const initialApprovalLineId = systemDetails.approvalLines[0];
          console.log('초기 결재선 ID 설정:', initialApprovalLineId);

          // 🔥 선택된 결재선 ID 설정
          selectedApprovalLineId.value = initialApprovalLineId;

          // 🔥 부모 컴포넌트에 선택된 결재선 ID 전달
          emit('update:selectedLineId', initialApprovalLineId);

          // 🔥 결재선 옵션이 로드된 후 결재선 데이터 로드
          nextTick(() => {
            console.log('결재선 데이터 로드 시작:', initialApprovalLineId);
            loadApprovalLineById(initialApprovalLineId);
          });
        } else {
          // 🔥 결재선이 없는 경우 기본값으로 설정

          if (!props.isSystemSetting) {
            console.log('결재선이 없음 - 기본 선택 상태로 설정');
            selectedApprovalLineId.value = '';
            approvalLine.value = [];
            emit('update:selectedLineId', '');
            emit('update:modelValue', []);
            emit('change', []);
            emit('lineSelected', null);
          }
        }

        console.log('props.approvalLineOptions:', props.approvalLineOptions);
      }
    } catch (error) {
      console.error('컴포넌트 초기화 중 오류 발생:', error);

      // 🔥 오류 발생 시 기본 상태로 설정
      selectedApprovalLineId.value = '';
      approvalLine.value = [];
      emit('update:selectedLineId', '');
      emit('update:modelValue', []);
      emit('change', []);
      emit('lineSelected', null);
    }
  });

  // === 외부 노출 메서드들 ===
  defineExpose({
    addApprover: (approver) => {
      if (!props.showSelector) {
        onApproverSelected(approver);
      }
    },
    removeApprover: (index) => {
      if (!props.showSelector) {
        removeApprover(index);
      }
    },
    clearApprovers: () => {
      approvalLine.value = [];
    },
    setApprovers: (approvers) => {
      console.log('ApprovalLineComp - setApprovers 호출:', approvers);
      const clonedApprovers = JSON.parse(JSON.stringify(approvers || []));
      approvalLine.value = clonedApprovers;
    },
    selectApprovalLine: (lineId) => {
      selectedApprovalLineId.value = lineId;
      onApprovalLineChange();
    },
    getDummyOptions: () => {
      return dummyApprovalLineOptions.value;
    },
  });
</script>

<style scoped>
  /* === 결재선 선택 스타일 === */
  .approval-select {
    margin-bottom: 15px;
  }

  .select-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
  }

  .select-label {
    font-size: 14px;
    font-weight: 600;
    color: #495057;
    white-space: nowrap;
  }

  .approval-line-select {
    flex: 1;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    background: white;
    color: #495057;
    transition: border-color 0.2s ease;
    appearance: auto;
    -webkit-appearance: menulist;
    -moz-appearance: menulist;
    cursor: pointer;
    min-height: 32px;
    padding-right: 30px;
  }

  .approval-line-select:focus {
    outline: none;
    border-color: #379583;
    box-shadow: 0 0 0 2px rgba(55, 149, 131, 0.2);
  }

  .approval-line-select:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.65;
  }

  .btn-reset-selection {
    padding: 6px 8px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-reset-selection:hover {
    background: #c82333;
    transform: scale(1.05);
  }

  /* === 결재선 에디터 스타일 === */
  .approval-line-editor {
    width: 100%;
  }

  .approval-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    min-height: 100px;
    padding: 10px;
    border: 1px dashed #ddd;
    border-radius: 4px;
    position: relative;
  }

  /* === 결재자 카드 스타일 === */
  .approval-card {
    position: relative;
    width: 120px;
    height: 85px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 8px;
    cursor: move;
    transition: all 0.3s ease;
    user-select: none;
  }

  .approval-card[draggable='false'] {
    cursor: default;
  }

  .approval-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #379583;
  }

  /* === 드래그 핸들 스타일 === */
  .drag-handle {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    color: #999;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: grab;
  }

  .approval-card:hover .drag-handle {
    opacity: 1;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  /* === 드래그 상태 스타일 === */
  .approval-card.dragging {
    opacity: 0.7;
    transform: rotate(5deg) scale(1.05);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: #379583;
    z-index: 1000;
    background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  }

  /* === 드롭 타겟 스타일 === */
  .approval-card.drop-target-before {
    border-left: 3px solid #22c55e;
    background: linear-gradient(
      90deg,
      rgba(34, 197, 94, 0.1) 0%,
      transparent 20%
    );
  }

  .approval-card.drop-target-after {
    border-right: 3px solid #22c55e;
    background: linear-gradient(
      270deg,
      rgba(34, 197, 94, 0.1) 0%,
      transparent 20%
    );
  }

  /* === 드롭 인디케이터 스타일 === */
  .drop-indicator {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(34, 197, 94, 0.1);
    border-radius: 6px;
    z-index: 10;
    pointer-events: none;
  }

  .drop-indicator.drop-before .drop-line {
    position: absolute;
    left: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #22c55e;
    border-radius: 2px;
  }

  .drop-indicator.drop-after .drop-line {
    position: absolute;
    right: -2px;
    top: 0;
    bottom: 0;
    width: 4px;
    background: #22c55e;
    border-radius: 2px;
  }

  .drop-message {
    background: #22c55e;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  }

  /* === 삭제 버튼 스타일 === */
  .delete-card-btn {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 18px;
    height: 18px;
    background: #ff4757;
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.2s ease;
  }

  .delete-card-btn:hover {
    background: #ff3742;
    transform: scale(1.1);
  }

  /* === 결재자 정보 스타일 === */
  .approver-info {
    text-align: center;
    font-size: 13px;
  }

  .approver-name {
    font-weight: bold;
    margin-bottom: 2px;
    color: #333;
  }

  .approver-dept {
    color: #666;
    margin-bottom: 2px;
  }

  .approval-order {
    color: #379583;
    font-size: 10px;
    font-weight: 600;
    background: rgba(55, 149, 131, 0.1);
    padding: 2px 6px;
    border-radius: 8px;
    display: inline-block;
  }

  /* === 추가 버튼 스타일 === */
  .add-approval-card {
    width: 120px;
    height: 80px;
    border: 2px dashed #379583;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #379583;
    transition: all 0.2s ease;
  }

  .add-approval-card:hover {
    background: #f0fdf4;
    border-color: #22c55e;
    transform: scale(1.02);
  }

  .add-icon {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .add-text {
    font-size: 11px;
  }

  /* === 성공 메시지 스타일 === */
  :global(.approver-remove-success) {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(220, 53, 69, 0.4);
    z-index: 10000;
    animation: slideInSuccess 0.5s ease, fadeOutSuccess 0.5s ease 2.5s forwards;
  }

  :global(.order-change-success) {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
    z-index: 10000;
    animation: slideInSuccess 0.5s ease, fadeOutSuccess 0.5s ease 1.5s forwards;
  }

  /* === 애니메이션 === */
  @keyframes slideInSuccess {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes fadeOutSuccess {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  /* === 반응형 스타일 === */
  @media (max-width: 768px) {
    .approval-cards {
      justify-content: center;
    }

    .select-wrapper {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .select-label {
      text-align: center;
    }
  }
</style>
