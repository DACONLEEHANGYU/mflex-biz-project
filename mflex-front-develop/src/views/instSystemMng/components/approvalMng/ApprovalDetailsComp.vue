<template>
  <div class="full-contents pl10">
    <!-- 헤더 영역 -->
    <div class="content-top pt5">
      <div class="title-s">
        결재선 상세 정보
        <AppTooltip :htmlContent="getTooltipById('approvalDetails')">
        </AppTooltip>
      </div>
    </div>

    <!-- 입력 폼 영역 -->
    <div class="inputs-row">
      <div class="inputs-wrap">
        <div class="input-form">
          <!-- 결재선명 입력 섹션 -->
          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr>
                <th class="required">*결재선명</th>
                <td>
                  <div
                    class="td-col"
                    style="
                      display: flex;
                      justify-content: flex-start;
                      flex-direction: row;
                      align-items: center;
                      gap: 10px;
                    "
                  >
                    <div>
                      <input
                        class="input-text"
                        v-model="approvalLineDetails.approvalLineName"
                        type="text"
                        style="width: 300px"
                        @input="onApprovalLineNameChanged"
                        :disabled="isDisabled"
                      />
                    </div>
                    <div>
                      <!-- 수정 버튼 -->
                      <button
                        class="btn-s"
                        style="background-color: #379583; color: white"
                        :disabled="!isApprovalLineNameChanged"
                        :class="{ disabled: !isApprovalLineNameChanged }"
                        @click="onUpdateApprovalLineName"
                      >
                        수정
                      </button>
                      <!-- 초기화 버튼 -->
                      <button
                        class="btn-s"
                        :disabled="!isApprovalLineNameChanged"
                        :class="{ disabled: !isApprovalLineNameChanged }"
                        @click="onResetApprovalLineName"
                      >
                        초기화
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 결재선 설정 섹션 -->
          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr>
                <th>결재선 설정</th>
                <td>
                  <div class="td-col">
                    <ApprovalLineComp
                      v-model="approvalLine"
                      :max-approvers="5"
                      :show-success-message="true"
                      :isSystemSetting="true"
                      :disabled="isDisabled"
                      @change="onApprovalLineChange"
                      @approverRemoved="onApproverRemoved"
                      @add-approver="onAddApprover"
                      @update-sequence="onUpdateApprovalLineSequence"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 사용여부 및 수정 정보 섹션 -->
          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr>
                <th>사용여부</th>
                <td colspan="4">
                  <div class="td-col" style="width: 3%">
                    <input
                      type="checkbox"
                      v-model="approvalLineDetails.useYn"
                      id="standard"
                      @change="onChangeUseYn"
                      :disabled="isDisabled"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>최종수정자</th>
                <td>
                  <div class="td-col">{{ approvalLineDetails.updater }}</div>
                </td>
                <th>최종수정일시</th>
                <td>
                  <div class="td-col">
                    {{ approvalLineDetails.updateDateTime }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  // === Import 구문 ===
  import { reactive, ref, computed, watch, onBeforeMount } from 'vue';
  import { storeToRefs } from 'pinia';

  // Stores
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useApprovalStore } from '@/stores/approval';

  // API
  import {
    addApprover,
    deleteApprover,
    changeApproverOrder,
    getApprovalLineDetails,
    updateApprovalLine,
  } from '@/utils/mflexApi/approval/ApprovalApi';

  // Components
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import ApprovalLineComp from '@/components/ui/ApprovalLineComp.vue';

  // === Pinia 스토어 초기화 ===
  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);

  const { useMetaMngInstId } = userStngInfo.value;
  const { getTooltipById } = useHelpToolTipStore();

  const approvalStore = useApprovalStore();
  const { selectApprovalLine } = storeToRefs(approvalStore);
  const { setIsUpdateApprovalLine } = approvalStore;

  // === 반응형 데이터 선언 ===

  // 결재선 상세 정보
  const approvalLineDetails = ref({
    approvalLineName: '',
    approvers: [],
    useYn: false,
    updateDateTime: '',
    updater: '',
  });

  // 결재선 데이터
  const approvalLine = ref([]);

  // 결재선명 변경 상태 관리
  const originalApprovalLineName = ref(''); // 원본 결재선명 저장
  const isApprovalLineNameChanged = ref(false); // 변경 여부 플래그

  // === 이벤트 핸들러 함수들 ===

  // 결재선명 변경 감지
  const onApprovalLineNameChanged = () => {
    const currentName = approvalLineDetails.value.approvalLineName || '';
    const originalName = originalApprovalLineName.value || '';

    isApprovalLineNameChanged.value = currentName !== originalName;
  };

  // 결재선명 초기화
  const onResetApprovalLineName = () => {
    if (!isApprovalLineNameChanged.value) {
      return;
    }

    console.log('결재선명 초기화');

    // 원본값으로 복원
    approvalLineDetails.value.approvalLineName = originalApprovalLineName.value;
    isApprovalLineNameChanged.value = false;

    console.log('결재선명이 초기화되었습니다:', originalApprovalLineName.value);
  };

  // 결재선 변경 핸들러
  const onApprovalLineChange = (newApprovalLine) => {
    console.log('결재선이 변경되었습니다:', newApprovalLine);

    // approverSeq 배열 생성 (결재 순서대로)
    const approverSeqArray = newApprovalLine.map((approver, index) => {
      return approver.approverSeq || index + 1;
    });

    console.log('생성된 approverSeq 배열:', approverSeqArray);

    // API 전달용 데이터 구성
    const approvalLineData = {
      approvers: newApprovalLine,
      approverSeqArray: approverSeqArray, // [3, 56] 형식
    };

    console.log('API 전달용 데이터:', approvalLineData);
  };

  // 사용여부 변경 핸들러
  const onChangeUseYn = async () => {
    console.log('사용여부 변경:', approvalLineDetails.value.useYn);

    const data = {
      approvalLineId: selectApprovalLine.value.approvalLineId,
      instituteId: useMetaMngInstId,
      approvalLineName: approvalLineDetails.value.approvalLineName,
      useYn: approvalLineDetails.value.useYn,
    };

    await updateApprovalLine(data);

    const updateDate = {
      isUpdate: true,
      approvalLineId: selectApprovalLine.value.approvalLineId,
    };

    setIsUpdateApprovalLine(updateDate);
  };

  // === API 호출 함수들 ===

  // 결재선명 수정 API 호출
  const onUpdateApprovalLineName = async () => {
    if (!isApprovalLineNameChanged.value) {
      return;
    }

    console.log('결재선명 수정 API 호출');

    const data = {
      approvalLineId: selectApprovalLine.value.approvalLineId,
      instituteId: useMetaMngInstId,
      approvalLineName: approvalLineDetails.value.approvalLineName.trim(),
      useYn: approvalLineDetails.value.useYn,
    };

    console.log('결재선명 수정 API 파라미터:', data);

    const response = await updateApprovalLine(data);

    const updateDate = {
      isUpdate: true,
      approvalLineId: selectApprovalLine.value.approvalLineId,
    };

    setIsUpdateApprovalLine(updateDate);
  };

  // 결재자 삭제 처리
  const onApproverRemoved = async (approver) => {
    console.log('onApproverRemoved', approver.approver);

    const deleteData = {
      approvalLineId: selectApprovalLine.value.approvalLineId,
      instituteId: useMetaMngInstId,
      approverId: approver.approver.userId,
      approverName: approver.approver.name,
    };

    const response = await deleteApprover(deleteData);

    const responseDetails = await getApprovalLineDetails(
      selectApprovalLine.value.approvalLineId
    );

    console.log('responseDetails : ', responseDetails);

    const updateDate = {
      isUpdate: true,
      approvalLineId: selectApprovalLine.value.approvalLineId,
    };

    setIsUpdateApprovalLine(updateDate);
  };

  // 결재자 추가 처리
  const onAddApprover = async (selectedApprover) => {
    console.log('onAddApprover', selectedApprover);

    const data = {
      approvalLineId: selectApprovalLine.value.approvalLineId,
      instituteId: useMetaMngInstId,
      approverId: selectedApprover.userId,
      approverName: selectedApprover.name,
    };

    await addApprover(data);

    const updateDate = {
      isUpdate: true,
      approvalLineId: selectApprovalLine.value.approvalLineId,
    };

    setIsUpdateApprovalLine(updateDate);
  };

  // 결재자 순서 변경 처리
  const onUpdateApprovalLineSequence = async (newApprovalLine) => {
    // approverSeq 배열 생성 (결재 순서대로)
    const approverSeqArray = newApprovalLine.map((approver, index) => {
      return approver.approverSeq || index + 1;
    });

    console.log('생성된 approverSeq 배열:', approverSeqArray);

    // API 전달용 데이터 구성
    const approvalLineData = {
      approvers: newApprovalLine,
      approverSeqArray: approverSeqArray, // [3, 56] 형식
    };

    console.log('API 전달용 데이터:', approvalLineData);

    const data = {
      approvalLineId: selectApprovalLine.value.approvalLineId,
      instituteId: useMetaMngInstId,
      approverSeqArray: approvalLineData.approverSeqArray, // [3, 56] 형식
    };

    await changeApproverOrder(data);

    const updateDate = {
      isUpdate: true,
      approvalLineId: selectApprovalLine.value.approvalLineId,
    };

    setIsUpdateApprovalLine(updateDate);
  };

  // === 유틸리티 함수들 ===

  // 결재선 데이터 바인딩
  const bindApprovalLineDetails = (approvalLineData) => {
    approvalLineDetails.value.approvalLineName =
      approvalLineData.approvalLineName || '';
    approvalLineDetails.value.approvers = approvalLineData.approvers || [];

    // 원본 결재선명 저장
    originalApprovalLineName.value = approvalLineData.approvalLineName || '';
    isApprovalLineNameChanged.value = false; // 초기 상태는 변경되지 않음

    // 결재자 데이터 매핑
    const approvers = approvalLineData.approvers.map((approver, index) => ({
      id: approver.approverId,
      userId: approver.approverId,
      name: approver.approverName,
      department: approver.department || '',
      position: approver.position || '',
      email: approver.email || '',
      approverSeq: approver.approverSeq,
      approvalOrder: approver.approvalOrder,
    }));

    console.log('bindApprovalLineDetails approvers : ', approvers);

    approvalLine.value = approvers;

    approvalLineDetails.value.useYn = approvalLineData.useYn || false;
    approvalLineDetails.value.updateDateTime =
      approvalLineData.updateDateTime || '';
    approvalLineDetails.value.updater = approvalLineData.updaterName || '';
  };

  // === 라이프사이클 훅 ===
  onBeforeMount(async () => {
    console.log('onBeforeMount');
  });

  const isDisabled = ref(false);

  // === Watch 함수들 ===

  // 선택된 결재선 변경 감지
  watch(
    selectApprovalLine,
    (value) => {
      console.log('watch selectApprovalLine', value);

      if (value === undefined || value === null) {
        isDisabled.value = true;
        return;
      }

      bindApprovalLineDetails(value);
      console.log('approvalLineDetails : ', approvalLineDetails.value);
      isDisabled.value = false;
    },
    { deep: true }
  );
</script>

<style scoped>
  /* 테이블 및 레이아웃 스타일 */
  .title-btns__row_btween {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 5px;
    border-top: 1px solid #dddddd;
    padding-top: 5px;
  }

  .input-form .input-table td {
    padding: 5px 5px 5px 10px;
  }

  #standard {
    height: 20px;
  }

  /* 버튼 비활성화 스타일 */
  .btn-s.disabled {
    background-color: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
    opacity: 0.65;
    border-color: #dee2e6;
  }

  .btn-s.disabled:hover {
    background-color: #e9ecef;
    color: #6c757d;
    transform: none;
  }

  /* 성공 메시지 스타일 */
  :global(.approval-line-success) {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.4);
    z-index: 10000;
    animation: slideInSuccess 0.5s ease, fadeOutSuccess 0.5s ease 2.5s forwards;
  }

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
</style>
