<template>
  <div class="pop-window">
    <div class="window-header">결재선 추가</div>
    <div class="signup-body" style="margin-bottom: 15px">
      <div class="window-content pt15">
        <div class="inputs-wrap">
          <div class="input-form">
            <table class="input-table">
              <colgroup>
                <col width="15%" />
              </colgroup>
              <tbody>
                <tr>
                  <th class="required">*결재선명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <input
                        type="text"
                        class="input-text"
                        v-model="approvalLineForm.approvalLineName"
                        placeholder="결재선명을 입력해주세요."
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>결재자 지정</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <!-- 결재선 에디터 컴포넌트 사용 -->
                      <ApprovalLineComp
                        v-model="approvalLine"
                        :max-approvers="5"
                        delete-mode="ui"
                        :show-success-message="false"
                        @change="onApprovalLineChange"
                        @approverRemovedUI="onApproverRemovedUI"
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="window-footer">
      <div class="dialog-footer">
        <button type="button" class="ui-button" @click="onConfirm">저장</button>
        <button type="button" class="ui-button" @click="onClose">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onBeforeMount } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { addApprovalLine } from '@/utils/mflexApi/approval/ApprovalApi';
  import ApprovalLineComp from '@/components/ui/ApprovalLineComp.vue';

  const emit = defineEmits(['confirm', 'close']);

  const props = defineProps({
    selectedData: {
      type: Object,
      default: () => {},
    },
    jobState: {
      type: String,
      default: '',
    },
  });

  // API 형식에 맞는 폼 데이터
  const approvalLineForm = ref({
    approvalLineName: '',
    approvers: [],
  });

  // 결재선 컴포넌트용 데이터 (내부적으로 사용)
  const approvalLine = ref([]);

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId } = userStngInfo.value;

  // 결재선 변경 핸들러 - API 형식으로 변환
  const onApprovalLineChange = (newApprovalLine) => {
    console.log('결재선이 변경되었습니다:', newApprovalLine);

    // ApprovalLineComp에서 받은 데이터를 API 형식으로 변환
    approvalLineForm.value.approvers = newApprovalLine.map((approver) => ({
      approverId: approver.id || approver.empNo || approver.userId, // 사용자 ID 필드명에 따라 조정
      approverName: approver.name || approver.empName || approver.userName, // 사용자 이름 필드명에 따라 조정
    }));

    console.log('변환된 approvers:', approvalLineForm.value.approvers);
  };

  // 🔥 UI 전용 삭제 핸들러 추가
  const onApproverRemovedUI = (deleteInfo) => {
    console.log('UI에서 결재자가 삭제되었습니다:', deleteInfo);

    // 폼 데이터 동기화
    approvalLineForm.value.approvers = deleteInfo.newApprovalLine.map(
      (approver) => ({
        approverId: approver.id || approver.empNo || approver.userId,
        approverName: approver.name || approver.empName || approver.userName,
      })
    );

    console.log(
      '삭제 후 동기화된 approvers:',
      approvalLineForm.value.approvers
    );
  };

  const onConfirm = async () => {
    // 유효성 검사
    if (!approvalLineForm.value.approvalLineName.trim()) {
      alert('결재선명을 입력해주세요.');
      return;
    }

    if (approvalLineForm.value.approvers.length === 0) {
      alert('최소 1명 이상의 결재자를 추가해주세요.');
      return;
    }

    // API 형식으로 데이터 준비
    const apiData = {
      approvalLineName: approvalLineForm.value.approvalLineName.trim(),
      approvers: approvalLineForm.value.approvers,
      instituteId: useMetaMngInstId, // 기관 ID
    };

    console.log('결재선 저장 API 데이터:', apiData);

    await addApprovalLine(apiData);

    // 부모 컴포넌트로 전달
    emit('confirm', apiData);
  };

  const onClose = () => {
    emit('close');
  };

  onBeforeMount(async () => {
    // 수정 모드인 경우 기존 데이터 로드
    if (props.jobState === 'edit' && props.selectedData) {
      // API에서 받은 데이터 형식에 맞게 설정
      approvalLineForm.value.approvalLineName =
        props.selectedData.approvalLineName || '';

      // API의 approvers 데이터를 ApprovalLineComp 형식으로 변환
      if (
        props.selectedData.approvers &&
        Array.isArray(props.selectedData.approvers)
      ) {
        approvalLine.value = props.selectedData.approvers.map((approver) => ({
          id: approver.approverId,
          name: approver.approverName,
          // ApprovalLineComp에서 필요한 추가 필드들 (필요에 따라 조정)
          department: approver.department || '',
          position: approver.position || '',
          email: approver.email || '',
        }));

        // 폼 데이터도 동기화
        approvalLineForm.value.approvers = [...props.selectedData.approvers];
      }
    } else {
      // 추가 모드 초기화
      approvalLineForm.value = {
        approvalLineName: '',
        approvers: [],
      };
      approvalLine.value = [];
    }
  });

  // // 디버깅용 - 실제 배포 시에는 제거
  // const logCurrentData = () => {
  //   console.log('현재 폼 데이터:', approvalLineForm.value);
  //   console.log('현재 결재선 데이터:', approvalLine.value);
  // };

  // // 개발 중 확인용 (실제 배포 시 제거)
  // if (process.env.NODE_ENV === 'development') {
  //   window.logApprovalData = logCurrentData;
  // }
</script>

<style scoped>
  /* 기존 스타일들 */
  .input-form {
    border-top: 3px solid #379583;
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

  /* 반응형 대응 */
  @media (max-width: 768px) {
    .approval-cards {
      justify-content: center;
    }
  }
</style>
