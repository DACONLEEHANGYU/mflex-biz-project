<template>
  <div class="pop-window">
    <div class="window-header">회원정보수정</div>
    <div class="signup-body" style="margin-bottom: 15px">
      <div class="window-content pt15">
        <div class="signup-form">
          <div class="form-group">
            <label for="id">아이디</label>
            <input
              type="id"
              id="id"
              v-model="userDetails.userId"
              readonly
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div class="form-group">
            <label for="username">사용자 이름</label>
            <input
              type="text"
              id="username"
              v-model="userDetails.userName"
              placeholder="사용자 이름을 입력하세요"
            />
          </div>

          <div class="form-group">
            <label for="confirm-password">회사 전화번호</label>
            <input
              type="text"
              v-model="userDetails.officePhoneNumber"
              placeholder="'-'를 제외한 전화번호를 입력해주세요"
            />
          </div>
          <div class="form-group">
            <label for="confirm-password">휴대폰번호</label>
            <input
              type="text"
              id="confirm-password"
              v-model="userDetails.personalPhoneNumber"
              placeholder="휴대폰번호를 입력해주세요"
            />
          </div>
          <div class="form-group">
            <label for="confirm-password">이메일</label>
            <input
              type="text"
              id="confirm-password"
              v-model="userDetails.email"
              placeholder="이메일을 입력해주세요"
            />
          </div>
          <div class="form-group"></div>
        </div>
      </div>

      <div class="form-group form-section child-section">
        <div class="label-section">
          <label class="">사용자 타입</label>
        </div>
        <div class="select-container">
          <select v-model="selectUserType" name="" id="select-usertype">
            <option>타입선택</option>
            <option
              v-for="option in userTypeOptions"
              :value="option.code"
              :key="option.code"
            >
              {{ option.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div
      class="user-info-content"
      style="border: 1px solid #ccc; border-radius: 10px; padding: 20px"
    >
      <div class="form-group form-group form-section child-section">
        <div class="label-section">
          <label for="permission">기관</label>
        </div>

        <div class="form-group">
          <input
            type="text"
            id="confirm-password"
            style="padding: 8px; border: 1px solid #ccc; border-radius: 4px"
            v-model="userDetails.instituteName"
            disabled
          />
        </div>
      </div>
      <div style="display: flex; justify-content: space-around">
        <div class="form-group form-section child-section">
          <div class="label-section child-label">
            <label for="permission">부서</label>
          </div>
          <div class="select-container">
            <select v-model="selectDepartment" name="" id="select-department">
              <option
                v-for="option in departmentOptions"
                :value="option.code"
                :key="option.code"
              >
                {{ option.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group form-section child-section">
          <div class="label-section child-label">
            <label for="permission">직급</label>
          </div>
          <div class="select-container">
            <select v-model="selectPosition" name="" id="select-position">
              <option
                v-for="option in userPositionOptions"
                :value="option.code"
                :key="option.code"
              >
                {{ option.name }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onEditUserInfo">수정</button>
          <button class="btn-m close" @click="onCancel">취소</button>
        </div>
      </div>
    </div>
  </div>

  <!-- <AppDialog
    v-model:view="errorState.view"
    :title="errorState.title"
    :message="errorState.message"
    @confirm="onCloseErrorState"
    @close="onCloseErrorState"
  >
  </AppDialog> -->
</template>

<script setup>
  import { defineProps, defineEmits, onBeforeMount } from 'vue';
  import { ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import {
    getUserTypeList,
    getInstituteList,
    getUserPositionList,
    getDepartmentByInstitute,
    editUSserDetails,
  } from '@/utils/mflexApi/userManagementApi';

  import {
    getOtherInstituteList, // 타 기관명 조회
    getInfoSystemList,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  const userTypeOptions = ref([]);
  const selectUserType = ref('');

  const instituteInfoOptions = ref([]);
  const selectInstituteInfo = ref('');

  const departmentOptions = ref([]);
  const selectDepartment = ref('');

  const userPositionOptions = ref([]);
  const selectPosition = ref('');

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);

  const { useMetaMngInstId } = userStngInfo.value;

  const infoInstChange = async (selectInstituteInfo) => {
    const departmentList = await getDepartmentByInstitute(selectInstituteInfo);
    departmentOptions.value = departmentList;
    selectDepartment.value = departmentList[0].code;
  };

  const props = defineProps({
    userDetails: Object,
  });

  const emits = defineEmits(['close', 'confirm', 'edit-user-info']);

  const userDetails = props.userDetails;

  console.log('props.userDetails', props.userDetails);

  onBeforeMount(async () => {
    const userTypeList = await getUserTypeList();
    userTypeOptions.value = userTypeList;
    selectUserType.value = userDetails.userTypeCode;

    const userPositionList = await getUserPositionList();
    userPositionOptions.value = userPositionList;
    selectPosition.value = userDetails.positionCode;

    const departmentList = await getDepartmentByInstitute(
      userDetails.instituteId
    );
    departmentOptions.value = departmentList;
    selectDepartment.value = userDetails.departmentCode;
  });

  const onCancel = () => {
    emits('close');
  };

  const onEditUserInfo = async () => {
    const userInfo = {
      userId: userDetails.userId,
      userName: userDetails.userName,
      officePhoneNumber: userDetails.officePhoneNumber,
      personalPhoneNumber: userDetails.personalPhoneNumber,
      email: userDetails.email,
      userTypeCode: selectUserType.value,
      instituteId: useMetaMngInstId,
      departmentCode: selectDepartment.value,
      positionCode: selectPosition.value,
    };

    const response = await editUSserDetails(userInfo);

    if (response.status === 200) {
      // alert('수정이 완료되었습니다.');
      emits('edit-user-info');
    } else {
      alert('수정이 실패하였습니다.');
    }

    console.log('userInfo', userInfo);
  };

  console.log('userDetails', userDetails);
</script>

<style>
  .user-info-content {
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 20px;
    margin: 0px 30px 20px 30px;
  }
</style>
