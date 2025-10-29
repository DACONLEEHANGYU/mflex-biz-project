<template>
  <!-- filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\components\popWindow\ApprovalCommentWindow.vue -->
  <div class="pop-window">
    <div class="window-header">결재{{ titleName }}</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row">
          <section class="row-wrap">
            <div class="inputs-wrap">
              <div class="input-form">
                <table class="input-table">
                  <colgroup>
                    <col width="30%" />
                    <col width="" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th>{{ titleName }}의견</th>
                      <td>
                        <textarea
                          v-model="approveComment"
                          :placeholder="placeholderText"
                          style="height: 130px"
                        ></textarea>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns-new">
        <div class="btns__r">
          <button class="btn-m btn-new-confirm" @click="onConfirm">
            {{ titleName }}
          </button>
          <button class="btn-m btn-new-close" @click="onClose">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onBeforeMount, reactive, ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useDiagnosisStore } from '@/stores/diagnosis.js';

  const emit = defineEmits(['confirm', 'close']);

  // Props to receive initial data if needed
  const props = defineProps({
    initialData: {
      type: Object,
      default: () => ({
        isExcluded: 'Y',
        excludeReasonCode: '',
        otherReason: '',
      }),
    },
    codeSearchInfo: {
      type: Object,
      default: () => {},
    },
    selectData: {
      type: Object,
      default: () => {},
    },
    approvalType: {
      type: String,
      default: 'approve',
    },
  });

  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);

  const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

  const { selectDataBaseInfo } = storeToRefs(useDiagnosisStore());

  console.log('props.selectData:', props.selectData);

  // List of exclusion reasons
  const excludeReasonList = ref([]);

  // 🔥 승인/반려에 따른 타이틀 계산
  const titleName = computed(() => {
    return props.approvalType === 'approve' ? '승인' : '반려';
  });

  // 🔥 승인/반려에 따른 기본 메시지 계산
  const defaultMessage = computed(() => {
    return props.approvalType === 'approve' ? '승인합니다.' : '반려합니다.';
  });

  // 🔥 placeholder 텍스트 계산
  const placeholderText = computed(() => {
    return `${titleName.value} 의견을 입력해주세요. (미입력 시: "${defaultMessage.value}")`;
  });

  const approveComment = ref('');

  // Form data with reactive state
  const formData = reactive({
    isExcluded: props.initialData.isExcluded || 'N',
    excludeReasonCode: props.initialData.excludeReasonCode || '',
    otherReason: props.initialData.otherReason || '',
  });

  // 🔥 승인 처리 함수 수정 - 빈 입력 시 기본값 사용
  const onConfirm = async () => {
    // 입력된 코멘트가 없거나 공백만 있는 경우 기본 메시지 사용
    const finalComment = approveComment.value.trim() || defaultMessage.value;

    console.log('결재 처리:', {
      approvalType: props.approvalType,
      inputComment: approveComment.value,
      finalComment: finalComment,
      isDefaultUsed: !approveComment.value.trim(),
    });

    emit('confirm', finalComment);
  };

  const onClose = () => {
    console.log('Closing modal');
    emit('close');
  };

  // 🔥 컴포넌트 마운트 시 기본값 설정
  onBeforeMount(async () => {
    try {
      // 기존 API 호출 로직이 필요한 경우 여기에 추가
      // const data = {
      //   instituteId: useMetaMngInstId,
      //   databaseId: selectDataBaseInfo.value,
      // };
      // const response = await getDiagnosisExcludeReasonCode(data);

      // console.log('excludeReasonList:', response);
      // excludeReasonList.value = response || [];
      // console.log('excludeReasonList loaded:', excludeReasonList.value);

      // 🔥 초기 로드 시 기본 메시지 로깅
      console.log('ApprovalCommentWindow 초기화:', {
        approvalType: props.approvalType,
        titleName: titleName.value,
        defaultMessage: defaultMessage.value,
        placeholderText: placeholderText.value,
      });
    } catch (error) {
      console.error('Failed to load exclude reason codes:', error);
      excludeReasonList.value = [];
    }
  });

  // Watch for changes in isExcluded to reset other fields when needed
  watch(
    () => formData.isExcluded,
    (newValue) => {
      if (newValue === 'N') {
        formData.excludeReasonCode = '';
        formData.otherReason = '';
      } else {
        formData.excludeReasonCode = excludeReasonList.value[0]?.code || '';
        formData.otherReason = '';
      }
    }
  );

  // Watch for changes in excludeReasonCode to reset otherReason when needed
  watch(
    () => formData.excludeReasonCode,
    (newValue) => {
      console.log('excludeReasonCode changed:', newValue);

      if (newValue !== 'OTHER') {
        formData.otherReason = '';
      }
    }
  );

  // excludeReasonList가 로드되면 formData.excludeReasonCode 설정
  watch(
    excludeReasonList,
    (newList) => {
      if (
        newList.length > 0 &&
        !formData.excludeReasonCode &&
        formData.isExcluded === 'Y'
      ) {
        formData.excludeReasonCode = newList[0].code;
      }
    },
    { immediate: true } // 즉시 실행
  );

  // 🔥 approvalType이 변경될 때 로깅 (개발용)
  watch(
    () => props.approvalType,
    (newType) => {
      console.log('approvalType 변경:', {
        newType,
        titleName: titleName.value,
        defaultMessage: defaultMessage.value,
        placeholderText: placeholderText.value,
      });
    }
  );
</script>

<style scoped>
  .title-header {
    display: flex;
    align-items: baseline;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .input-table th {
    padding: 10px;
  }

  select:disabled,
  textarea:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }

  /* 🔥 textarea 스타일 개선 */
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    resize: vertical;
    transition: border-color 0.2s ease;
  }

  textarea:focus {
    outline: none;
    border-color: #36c270;
    box-shadow: 0 0 0 2px rgba(54, 194, 112, 0.2);
  }

  /* 🔥 placeholder 스타일 개선 */
  textarea::placeholder {
    color: #999;
    font-style: italic;
  }

  .flex-radio {
    display: flex;
    gap: 20px;
  }

  .btn-new-confirm {
    border: 1px solid #36c270;
    background: #36c270;
    color: #fff;
    width: 114px;
    height: 54px;
    font-size: 20px;
    border-radius: 10px;
    transition: background-color 0.2s ease;
  }

  .btn-new-confirm:hover {
    background: #39aa68;
    color: #fff;
  }

  .btn-new-close {
    border: 1px solid #c1c5c5;
    background: #ffffff;
    color: #8b8989;
    font-size: 20px;
    width: 114px;
    height: 54px;
    border-radius: 10px;
    transition: background-color 0.2s ease;
  }

  .btn-new-close:hover {
    background: #f5f5f5;
    color: #8b8989;
  }

  .inputs-btns-new {
    justify-content: center;
    display: flex;
    padding-left: 25px;
    padding-right: 25px;
    border-top: 1px solid rgba(233, 233, 233, 0.2);
    padding-top: 15px;
    padding-bottom: 20px;
    gap: 10px; /* 🔥 버튼 간격 추가 */
  }

  /* 🔥 반응형 디자인 추가 */
  @media (max-width: 768px) {
    .btn-new-confirm,
    .btn-new-close {
      width: 100px;
      height: 48px;
      font-size: 16px;
    }

    .inputs-btns-new {
      padding-left: 15px;
      padding-right: 15px;
    }
  }

  .input-form {
    border-top: 1px solid #e9e9e9;
  }

  table {
    margin-top: 3px;
  }
</style>
