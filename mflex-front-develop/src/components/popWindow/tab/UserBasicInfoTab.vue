<template>
  <div class="pop-window">
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row">
          <div class="window-top">
            <!-- <button class="btn-s" @click="onUserLock">잠금/잠금해제</button>
            <button class="btn-s" @click="onUserActivate">활성화/정지</button> -->
          </div>
          <div class="inputs-wrap">
            <div class="input-form">
              <table class="input-table">
                <colgroup>
                  <col width="20%" />
                  <col width="30%" />
                  <col width="20%" />
                  <col width="30%" />
                </colgroup>
                <tbody>
                  <tr>
                    <th>사용자 ID</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.userId"
                          readonly
                        />
                      </div>
                    </td>
                    <th>사용자명</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.userName"
                          readonly
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>사용자상태</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userState"
                          readonly
                        />
                      </div>
                    </td>

                    <th>승인 상태</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.approvalStatus"
                          readonly
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>사용자 유형</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.userTypeName"
                          readonly
                        />
                      </div>
                    </td>
                    <th>이메일</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.email"
                          readonly
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>회사전화번호</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.officePhoneNumber"
                          readonly
                        />
                      </div>
                    </td>
                    <th>휴대폰번호</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.personalPhoneNumber"
                          readonly
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>직급</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.positionName"
                          readonly
                        />
                      </div>
                    </td>
                    <th>사용자타입</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.userTypeName"
                          readonly
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>기관</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.instituteName"
                          readonly
                        />
                      </div>
                    </td>
                    <th>부서</th>
                    <td class="manage-input-form-td">
                      <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetails.departmentName"
                          readonly
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>잠금상태</th>
                    <td class="manage-input-form-td">
                      <!-- <div class="td-col">
                        <input
                          class="input-text"
                          type="text"
                          v-model="userDetail.locked"
                          readonly
                        />
                      </div> -->
                      <div class="td-col">
                        <i
                          v-if="userDetails.locked"
                          class="icon-cell__lock"
                        ></i>
                        <i v-else class="icon-cell__unlock"></i>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onResetPassWord">
            비밀번호 초기화
          </button>
          <button class="btn-m confirm" @click="onConfirm">확인</button>
          <button class="btn-m close" @click="onClose">닫기</button>
        </div>
      </div>
    </div> -->
  </div>

  <AppWindow :view="mngResetWindeView" @close="onCloseMngResetWindow">
    <ManagerResetPassWordWindow
      :userId="userDetail.userId"
      @close="onCloseMngResetWindow"
    >
    </ManagerResetPassWordWindow>
  </AppWindow>

  <AppWindow
    width="500px"
    :view="userApproValView"
    @close="onCloseUserApproval"
  >
    <UserApprovalWindow @close="onCloseUserApproval"> </UserApprovalWindow>
  </AppWindow>
</template>
<script setup>
  import { computed, onMounted, reactive, ref, watch, inject } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import wordDivisionCellRender from '@/utils/wordDivisionCellRender.js';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ManagerResetPassWordWindow from '@/components/popWindow/ManagerResetPassWordWindow.vue';
  import UserApprovalWindow from '@/components/popWindow/UserApprovalWindow.vue';
  import {
    activeUserByAdmin, // 사용자 활성화/비활성화
    lockUserByAdmin, // 사용자 잠금/해제
    getResourceInstitute,
    getResourceInfoSystem,
    getResourceDictionary,
  } from '@/utils/mflexApi/userManagementApi.js';
  /*  const onConfirm = () => {
        emit('confirm', this.selectedRow);
        emit('close');
      }; */

  const props = defineProps({
    userDetails: Object,
  });

  const userDetails = inject('userDetails', props.userDetails);

  console.log('inject userDetials : ', userDetails);

  const emit = defineEmits(['close']);

  const userDetail = ref({});

  onMounted(() => {
    userDetail.value = props.userDetails;
  });

  // const userDetail = ref(props.userDetails);
  // console.log('userDetail', userDetail);

  // 비밀번호 초기화 팝업 상태
  const mngResetWindeView = ref(false);

  // 비밀번호 초기화 팝업 출력
  const onResetPassWord = () => {
    mngResetWindeView.value = true;
  };

  const onClose = () => {
    emit('close');
  };

  const onCloseMngResetWindow = () => {
    mngResetWindeView.value = false;
    // emit('close');
  };

  const userApproValView = ref(false);

  // 사용자 승인 팝업 출력
  const onUserApproval = () => {
    userApproValView.value = true;
  };

  // 사용자 승인 팝업 닫기
  const onCloseUserApproval = () => {
    userApproValView.value = false;
  };

  // 사용자 활성화/정지
  const onUserActivate = async () => {
    console.log('onUserActivate');

    const activeInfo = {
      userId: userDetail.value.userId,
      state: userDetail.value.userState === 'WILT' ? 'active' : 'inactive',
    };

    const response = await activeUserByAdmin(activeInfo);
    console.log('response', response);

    if (response.status === 200 && userDetail.value.userState === 'WILT') {
      alert('사용자가 활성화 되었습니다.');
      return;
    } else {
      alert('사용자가 비활성화 되었습니다.');
    }
  };

  // 사용자상태
  const userState = computed(() => {
    const userStateIcon = ref('');

    if (
      userDetails.userState === 'SEED' ||
      userDetails.userState === 'SEED_ADMIN'
    ) {
      userStateIcon.value = '🌰';
      // return '🌰';
    } else if (userDetails.userState === 'SPROUT') {
      userStateIcon.value = '🌱';
      // return '🌱';
    } else if (userDetails.userState === 'TREE') {
      userStateIcon.value = '🌳';
      // return '🌳';
    } else if (userDetails.userState === 'WILT') {
      userStateIcon.value = '🍂';
      // return '🍂';
    }

    return userStateIcon.value;
  });

  const onUserLock = async () => {
    console.log('onUserLock');

    const lockInfo = {
      userId: userDetail.value.userId,
      state: userDetail.value.locked === false ? 'lock' : 'unlock',
    };

    const response = await lockUserByAdmin(lockInfo);
    console.log('response', response);

    if (response.status === 200 && userDetail.value.locked === true) {
      alert('사용자가 잠금 해제 되었습니다.');
      return;
    } else {
      alert('사용자가 잠금 되었습니다.');
    }
  };
</script>
