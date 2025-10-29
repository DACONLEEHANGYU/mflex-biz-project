<template>
  <div class="pop-window">
    <div class="window-header">결재요청서</div>
    <div class="signup-body" style="margin-bottom: 15px">
      <div class="window-content pt15">
        <div class="inputs-wrap">
          <div class="input-form">
            <table class="input-table">
              <colgroup>
                <col width="30%" />
                <col width="30%" />
              </colgroup>
              <tbody>
                <tr>
                  <th>요청구분/건수</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ approvalData.requestType }} /
                      {{ approvalData.requestCount }}건
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>요청자</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ approvalData.requester }}
                    </div>
                  </td>
                  <th>요청일시</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ approvalData.requestDateTime }}
                    </div>
                  </td>
                </tr>
                <!-- <tr>
                  <th>요청내용</th>
                  <td class="manage-input-form-td" colspan="3">
                    <div class="td-col">
                      <textarea
                        v-model="approvalData.requestContent"
                        class="request-textarea"
                        placeholder="요청내용을 입력해주세요"
                        rows="20"
                      ></textarea>
                    </div>
                  </td>
                </tr> -->
              </tbody>
            </table>
          </div>
          <ApprovalLineComp
            v-model="approvalLine"
            :max-approvers="5"
            :show-success-message="true"
            :showSelector="true"
            :isInitialization="true"
            :approvalLineOptions="approvalLineOptions"
            @update-selectedApprovalLineId="onUpdateSelectedApprovalLineId"
            @change="onApprovalLineChange"
          />
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="dialog-footer">
        <button
          type="button"
          class="ui-button approval-button"
          @click="onConfirm"
          :disabled="!selectApprovalId"
        >
          <span>결재요청</span>
          <div
            class="approval-icon"
            style="
              background: url('/src/assets/images/icon_approval_check.png')
                no-repeat center;
              background-size: contain;
            "
          ></div>
        </button>
        <button type="button" class="ui-button" @click="onClose">취소</button>
      </div>
    </div>
  </div>
  <!-- 기타 사유 입력 팝업-->
  <AppWindow
    :view="additionalReasonsWindowView"
    @close="onCloseAdditionalReasonsWindow"
    width="550px"
    height="auto"
  >
    <AdditionalReasonsWindow
      @confirm="onAdditionalReasonsSave"
      @close="onCloseAdditionalReasonsWindow"
    />
  </AppWindow>
</template>

<script setup>
  import { onMounted, ref, computed, watch, onBeforeMount } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ApprovalLineComp from '@/components/ui/ApprovalLineComp.vue'; // 새로운 컴포넌트
  import AdditionalReasonsWindow from '@/components/popWindow/AdditionalReasonsWindow.vue';

  import { getApprovalLineList } from '@/utils/mflexApi/approval/ApprovalApi.js';
  import { getApprovalRequest } from '@/utils/mflexApi/approval/ApprovalApi.js';

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);

  //사용자 아이디
  const { userId, userNm } = userInfo.value;
  const { useMetaMngInstId } = userStngInfo.value;

  const emit = defineEmits(['confirm', 'close', 'error']);

  const props = defineProps({
    type: {
      type: String,
      default: 'default', // 'domain' or 'dictionary'
    },
    selectedData: {
      type: Object,
      default: () => {},
    },
  });

  const approvalData = ref({
    requestType: '',
    requestCount: '',
    requester: '',
    requestDateTime: '',
    requestContent: '',
    requestData: {},
  });

  const tableRefineData = ref({
    schemaName: '',
    tableName: '',
    tableKoreanName: '',
    refineTableKoreanName: '',
    reviewContent: '',
    actualizationType: '',
    updater: '',
    updateDateTime: '',
  });

  const selectApprovalId = ref(null);

  const onUpdateSelectedApprovalLineId = (id) => {
    selectApprovalId.value = id;

    console.log('Selected Approval Line ID:', selectApprovalId.value);
  };

  const onConfirm = async () => {
    console.log('props.type : ', props.type);
    console.log('onConfirm - selectedData : ', props.selectedData);

    let jobIds = [];
    let targetType;
    let jobTypeCode = 'STD'; // 기본값 설정

    // 결재요청 분기
    if (props.type === 'domain') {
      console.log('도메인 결재 요청');
      targetType = 'DMN';
      jobIds = props.selectedData.value.map((item) => item.jobDomainId);
      jobTypeCode = 'STD';
    } else if (props.type === 'word') {
      console.log('단어 결재 요청');
      targetType = 'WRD';
      jobIds = props.selectedData.value.map((item) => item.jobWordId);
      jobTypeCode = 'STD';
    } else if (props.type === 'term') {
      console.log('용어 결재 요청');
      targetType = 'TRM';
      jobIds = props.selectedData.value.map((item) => item.jobTermId);
      jobTypeCode = 'STD';
    } // 표준화
    else if (props.type === 'term-synchronize') {
      targetType = 'TRM';
      jobIds = props.selectedData.value.map((item) => item.jobTermId);
      jobTypeCode = 'CUR';
    } else if (props.type === 'word-synchronize') {
      targetType = 'WRD';
      jobIds = props.selectedData.value.map((item) => item.jobWordId);
      jobTypeCode = 'CUR';
    } else if (props.type === 'domain-synchronize') {
      targetType = 'DMN';
      jobIds = props.selectedData.value.map((item) => item.jobDomainId);
      jobTypeCode = 'CUR';
    }

    const approvalData = {
      instituteId: useMetaMngInstId,
      approvalLineId: selectApprovalId.value,
      targetType: targetType,
      dictionaryId: userStngInfo.value.useDctnryId,
      jobTypeCode: jobTypeCode,
      jobIds: jobIds,
    };

    const response = await getApprovalRequest(approvalData);

    console.log('Approval Request Response:', response);

    if (response.status != 200) {
      emit('error');
      // emit('close');
      return;
    } else {
      // emit('error');
      emit('confirm', {
        approvalData: approvalData,
        selectedData: props.selectedData.value,
      });
    }
  };

  const onClose = () => {
    console.log('onClose');
    emit('close');
  };

  // 비표준사유 리스트
  const noneStandardReasonList = ref([]);
  // 제외사유 리스트
  const excludeReasonList = ref([]);

  // 현재 선택된 사유 리스트를 computed로 관리
  const currentReasonList = computed(() => {
    switch (tableRefineData.value.actualizationType) {
      case '20': // 비표준
        return noneStandardReasonList.value;
      case '30': // 대상제외
        return excludeReasonList.value;
      default:
        return [];
    }
  });

  onMounted(async () => {
    console.log('onMount - selectedData', props.selectedData);

    if (props.type.includes('term')) {
      approvalData.value.requestType = '용어';
    } else if (props.type.includes('word')) {
      approvalData.value.requestType = '단어';
    } else if (props.type.includes('domain')) {
      approvalData.value.requestType = '도메인';
    }

    approvalData.value.requestCount = props.selectedData.value
      ? props.selectedData.value.length
      : props.selectedData.length;
    approvalData.value.requester = `${userNm}(${userId})`; // 실제 사용자 정보로 변경 필요
    approvalData.value.requestDateTime = new Date().toISOString().split('T')[0];
  });

  // 기타 사유 추가 팝업
  const additionalReasonsWindowView = ref(false);
  const onOpenAdditionalReasonsWindow = () => {
    additionalReasonsWindowView.value = true;
  };
  const onCloseAdditionalReasonsWindow = () => {
    additionalReasonsWindowView.value = false;
  };
  const onAdditionalReasonsSave = (data) => {
    additionalReasonsWindowView.value = false;

    currentReasonList.value.filter(
      (item) => item.code === '90'
    )[0].name = `기타(${data})`;

    tableRefineData.value.currentNonStandardReasonContents = data;
    tableRefineData.value.currentExcludeReasonContents = data;
  };

  const approvalLineOptions = ref([]);

  onBeforeMount(async () => {
    const approvalLineList = await getApprovalLineList(useMetaMngInstId);

    console.log('approvalLineList', approvalLineList);

    approvalLineOptions.value = approvalLineList;
  });

  watch(
    () => tableRefineData.value.reasonCode,
    (newValue) => {
      console.log('newValue', newValue);
      if (newValue === '90') {
        onOpenAdditionalReasonsWindow();
      }
    }
  );
</script>

<style scoped>
  .flex-radio {
    display: flex;
    gap: 10px;
  }

  .flex-radio div {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  input[type='radio'] {
    margin: 0;
    zoom: 1.4;
  }

  .input-form .input-table th,
  .input-form .input-table td {
    border: none;
  }

  .flex-radio label {
    display: inline-block;
    vertical-align: middle;
  }

  .input-form {
    border-top: 3px solid #379583;
    margin-bottom: 10px;
  }

  .input-form .input-table th {
    font-size: 15px;
    background-color: #ecfaf2;
    padding: 10px 20px;
  }

  tr {
    border: 1px solid #bebebe;
  }

  .td-col {
    font-size: 15px;
  }

  .standard {
    color: #379583;
  }

  .request-textarea {
    width: 100%;
    min-height: 120px;
    padding: 10px;
    border: 1px solid #bebebe;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    box-sizing: border-box;
  }

  .request-textarea:focus {
    outline: none;
    border-color: #379583;
    box-shadow: 0 0 0 2px rgba(55, 149, 131, 0.2);
  }

  .request-textarea::placeholder {
    color: #999;
  }

  /* 결재요청 버튼 스타일 */
  .approval-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px; /* 텍스트와 아이콘 사이의 간격 */
    transition: all 0.3s ease; /* 부드러운 전환 효과 */
  }

  .approval-icon {
    width: 25px; /* 아이콘 너비 조정 */
    height: 25px; /* 아이콘 높이 조정 */
    display: inline-block;
    flex-shrink: 0; /* 아이콘 크기 고정 */
    transition: filter 0.3s ease; /* 부드러운 색상 전환 */

    /* 기본 상태: 회색 필터 적용 */
    filter: grayscale(100%) brightness(0.6);
  }

  /* 🔥 disabled 상태에서는 모든 효과 제거 */
  .approval-button:disabled {
    cursor: auto !important; /* 커서 변경 */
    opacity: 0.6; /* 비활성화 투명도 */
    transform: none !important; /* 변형 효과 제거 */
    box-shadow: none !important; /* 그림자 효과 제거 */
    transition: none; /* 전환 효과 제거 */
    background-color: #f5f5f5 !important; /* 고정된 배경색 */
    color: #999 !important; /* 고정된 텍스트 색상 */
  }

  .approval-button:disabled .approval-icon {
    filter: grayscale(100%) brightness(0.4) !important; /* disabled 상태 아이콘 */
    transition: none; /* 전환 효과 제거 */
  }

  /* 🔥 disabled 상태에서 hover 효과 완전 제거 */
  .approval-button:disabled:hover {
    background-color: #f5f5f5 !important; /* hover 시에도 배경색 고정 */
    color: #999 !important; /* hover 시에도 텍스트 색상 고정 */
    transform: none !important; /* hover 시에도 변형 효과 제거 */
    box-shadow: none !important; /* hover 시에도 그림자 효과 제거 */
  }

  .approval-button:disabled:hover .approval-icon {
    filter: grayscale(100%) brightness(0.4) !important; /* hover 시에도 아이콘 상태 고정 */
  }

  /* 🔥 dialog-footer 내 첫 번째 버튼이 disabled일 때 hover 효과 제거 */
  .dialog-footer .ui-button:nth-child(1):disabled:hover {
    background-color: #f5f5f5 !important;
    color: #999 !important;
    transform: none !important;
    box-shadow: none !important;
    border-color: #ddd !important;
  }

  /* 🔥 추가: dialog-box 전체에서 disabled 버튼 hover 효과 제거 */
  .dialog-box .dialog-footer .ui-button:nth-child(1):disabled:hover {
    background-color: #f5f5f5 !important;
    color: #999 !important;
    transform: none !important;
    box-shadow: none !important;
    border-color: #ddd !important;
    /* cursor: not-allowed !important; */
  }

  /* 🔥 disabled가 아닌 상태에서만 hover 효과 적용 */
  .approval-button:not(:disabled):hover .approval-icon {
    filter: grayscale(0%) brightness(1.2) contrast(1.1); /* 원래 색상 + 밝기 증가 */
  }

  /* 버튼 전체 hover 효과 (disabled가 아닌 경우에만) */
  .approval-button:not(:disabled):hover {
    transform: translateY(-1px); /* 살짝 위로 이동 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  }

  /* 🔥 disabled가 아닌 상태에서만 클릭 효과 적용 */
  .approval-button:not(:disabled):active {
    transform: translateY(0); /* 원래 위치로 */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 그림자 감소 */
  }

  .approval-button:not(:disabled):active .approval-icon {
    filter: grayscale(0%) brightness(1) contrast(1); /* 살짝 어둡게 */
  }

  /* 다양한 아이콘 크기 클래스 (필요시 사용) */
  .approval-icon.small {
    width: 12px;
    height: 12px;
  }

  .approval-icon.medium {
    width: 16px;
    height: 16px;
  }

  .approval-icon.large {
    width: 20px;
    height: 20px;
  }

  /* 🔥 disabled가 아닌 상태에서만 다양한 색상 변형 옵션들 적용 */
  .approval-button:not(:disabled):hover .approval-icon.white-theme {
    filter: brightness(2) contrast(1.5); /* 더 밝은 흰색 */
  }

  .approval-button:not(:disabled):hover .approval-icon.green-theme {
    filter: hue-rotate(90deg) saturate(1.5) brightness(1.3); /* 초록색 톤 */
  }

  .approval-button:not(:disabled):hover .approval-icon.blue-theme {
    filter: hue-rotate(180deg) saturate(1.3) brightness(1.2); /* 파란색 톤 */
  }

  /* 🔥 전반적인 disabled 버튼 스타일 통합 */
  .ui-button:disabled,
  .approval-button:disabled {
    /* cursor: not-allowed !important; */
    opacity: 0.6 !important;
    background-color: #f5f5f5 !important;
    color: #999 !important;
    border-color: #ddd !important;
    transform: none !important;
    box-shadow: none !important;
    transition: none !important;
  }

  .ui-button:disabled:hover,
  .approval-button:disabled:hover {
    background-color: #f5f5f5 !important;
    color: #999 !important;
    border-color: #ddd !important;
    transform: none !important;
    box-shadow: none !important;
    /* cursor: not-allowed !important; */
  }
</style>
