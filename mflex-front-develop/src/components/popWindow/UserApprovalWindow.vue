<template>
  <div class="pop-window">
    <div class="window-header">사용자 승인 설정</div>
    <div class="window-body" style="margin-bottom: 15px">
      <div class="signup-form">
        <div class="form-group">
          <div class="signup-body">
            <label for="id" style="font-weight: 800">아이디</label>
            <input
              style="margin-left: 40px"
              type="id"
              id="id"
              v-model="userId"
              placeholder="아이디를 입력하세요"
              readonly
            />
          </div>
          <div class="signup-body">
            <label for="id" style="font-weight: 800">사용자명</label>
            <input
              style="margin-left: 40px"
              type="id"
              id="id"
              v-model="userDetails.userName"
              placeholder="아이디를 입력하세요"
              readonly
            />
          </div>
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
      <div style="border: 1px solid #ccc; border-radius: 10px; padding: 20px">
        <div class="form-group form-section child-section">
          <div class="label-section">
            <label for="permission">기관</label>
          </div>
          <div class="select-container">
            <select
              v-model="selectInstituteInfo"
              @change="infoInstChange(selectInstituteInfo)"
              id="select-institute"
            >
              <option
                v-for="option in instituteInfoOptions"
                :value="option.instituteId"
                :key="option.instituteId"
              >
                {{ option.instituteName }}
              </option>
            </select>
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

      <!-- <div v-if="userState != 'admin'" class="form-group parent-group">
        <label class="label-section">리소스</label>

        <div class="resource-group">
          <div class="resource-header label-section">
            기관 설정
            <button class="add-btn" @click="addInstitution">
              <span>+</span>
            </button>
          </div>
          <div
            v-for="(institution, index) in institutions"
            :key="index"
            class="institution-box"
          >
            <div class="form-group form-section child-section">
              <div class="label-section">
                <label class="child-label">기관</label>
              </div>
              <div class="select-container">
                <select
                  v-model="institution.id"
                  @change="onInstitutionChange(index)"
                >
                  <option value="">기관선택</option>
                  <option
                    v-for="option in instituteInfoOptions"
                    :value="option.id"
                    :key="option.id"
                  >
                    {{ option.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="system-group">
              <div class="resource-header label-section">
                시스템 설정
                <button class="add-btn" @click="addSystem(index)">
                  <span>+</span>
                </button>
              </div>
              <div
                v-for="(system, sysIndex) in institution.systems"
                :key="sysIndex"
                class="form-group form-section child-section"
              >
                <label class="label-section child-label">시스템</label>
                <div class="select-container">
                  <select
                    v-model="system.id"
                    :disabled="institution.id == null"
                  >
                    <option value="">시스템 선택</option>
                    <option
                      v-for="option in institution.systemOptions"
                      :value="option.informationSystemId"
                      :key="option.informationSystemId"
                    >
                      {{ option.informationSystemName }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="dictionary-group">
              <div class="resource-header label-section">
                사전 설정
                <button class="add-btn" @click="addDictionary(index)">
                  <span>+</span>
                </button>
              </div>
              <div
                v-for="(dictionary, dictIndex) in institution.dictionaries"
                :key="dictIndex"
                class="form-group form-section child-section"
              >
                <div class="label-section">
                  <label class="child-label">사전</label>
                </div>
                <div class="select-container">
                  <select v-model="dictionary.id">
                    <option value="">사전선택</option>
                    <option
                      v-for="option in institution.dictionaryOptions"
                      :value="option.dictionaryId"
                      :key="option.dictionaryId"
                    >
                      {{ option.dictionaryName }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> -->
    </div>

    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">확인</button>
          <button class="btn-m close" @click="onCancel">취소</button>
        </div>
      </div>
    </div>
  </div>
  <AppDialog
    v-model:view="dialogState.view"
    :title="dialogState.title"
    :message="dialogState.message"
    @confirm="onDialogClose"
    @close="onDialogClose"
  />

  <AppDialog
    v-model:view="errorState.view"
    :title="errorState.title"
    :message="errorState.message"
    @confirm="onCloseErrorState"
    @close="onCloseErrorState"
  >
  </AppDialog>
</template>

<script setup>
  import { storeToRefs } from 'pinia';
  import { onMounted, ref, reactive, onBeforeMount } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import {
    getUserTypeList,
    getUserPositionList,
    getDepartmentByInstitute,
    acceotUserByAdmin,
    getResourceInstitute,
    setResourceInstitute, // 리소스 기관 할당
    setResourceInfoSystem, // 리소스 시스템 할당
  } from '@/utils/mflexApi/userManagementApi.js';
  import {
    getInfoSystemList,
    getInstList,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import { getParentDictionaryList } from '@/utils/mflexApi/dictionarySet.js';

  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId } = userStngInfo.value;

  const emit = defineEmits(['close', 'confirm', 'user-approval']);
  const props = defineProps({
    userId: String,
    userDetails: Object,
  });

  const userDetails = ref(props.userDetails);

  console.log('userDetails: ', userDetails.value);

  const userId = ref(props.userId);

  console.log('userId: ', userId.value);
  console.log('props.userId: ', props.userId);

  onMounted(async () => {
    console.log('mounted');
    // const data = {
    //   userId: userId.value,
    //   instituteId: useMetaMngInstId,
    // };
    // const instituteList = await getResourceInstitute(data);
    // console.log('리소스 기관 조회 : ', instituteList);
  });

  const institutions = ref([
    {
      id: '',
      systems: [{ id: '' }],
      dictionaries: [{ id: '' }],
      systemOptions: [],
      dictionaryOptions: [],
    },
  ]);

  const addInstitution = () => {
    institutions.value.push({
      id: '',
      systems: [{ id: '' }],
      dictionaries: [{ id: '' }],
      systemOptions: [],
      dictionaryOptions: [],
    });
  };

  const addSystem = (institutionIndex) => {
    institutions.value[institutionIndex].systems.push({ id: '' });
  };

  const addDictionary = (institutionIndex) => {
    institutions.value[institutionIndex].dictionaries.push({ id: '' });
  };

  const onInstitutionChange = async (index) => {
    const institution = institutions.value[index];
    if (institution.id) {
      const systemList = await getInfoSystemList(institution.id);
      institution.systemOptions = systemList;

      const dictionaryList = await getParentDictionaryList(institution.id);
      institution.dictionaryOptions = dictionaryList;

      institution.systems = [{ id: '' }];
      institution.dictionaries = [{ id: '' }];
    } else {
      institution.systemOptions = [];
      institution.dictionaryOptions = [];
      institution.systems = [{ id: '' }];
      institution.dictionaries = [{ id: '' }];
    }
  };

  const userState = ref('user');

  const dialogState = reactive({
    view: false,
    title: '',
    message: '',
  });

  const errorState = reactive({
    view: false,
    title: '회원가입 오류',
    message: '',
  });

  const onCloseErrorState = () => {
    errorState.view = false;
  };

  const onDialogClose = () => {
    dialogState.view = false;
    emit('close');
  };

  const onConfirm = async () => {
    console.log('승인 완료');

    // 리소스 할당
    // for (const institution of institutions.value) {
    //   // 기관 할당
    //   const instituteResource = {
    //     userId: userId.value,
    //     instituteId: institution.id,
    //   };
    //   console.log('instituteResource: ', instituteResource);
    //   await setResourceInstitute(instituteResource);

    //   // 정보시스템 할당
    //   // for (const system of institution.systems) {
    //   //   const systemResource = {
    //   //     userId: userId.value,
    //   //     instituteId: institution.id,
    //   //     informationSystemId: system.id,
    //   //   };
    //   //   console.log('systemResource: ', systemResource);
    //   //   await setResourceInfoSystem(systemResource);
    //   // }

    //   // // 사전 할당
    //   // for (const dictionary of institution.dictionaries) {
    //   //   const dictionaryResource = {
    //   //     userId: userId.value,
    //   //     instituteId: institution.id,
    //   //     dictionaryId: dictionary.id,
    //   //   };
    //   //   console.log('dictionaryResource: ', dictionaryResource);
    //   //   await setResourceDictionary(dictionaryResource);
    //   // }
    // }

    const acceptInfo = {
      userId: userId.value,
      userName: userDetails.value.userName,
      userTypeCode: selectUserType.value,
      instituteId: selectInstituteInfo.value,
      positionCode: selectPosition.value,
      departmentCode: selectDepartment.value,
    };

    const response = await acceotUserByAdmin(acceptInfo);

    if (response.status === 200) {
      console.log('승인 완료');
      dialogState.view = true;
      dialogState.title = '사용자 승인';
      dialogState.message = '승인이 완료되었습니다.';
      emit('close');
      emit('user-approval');
    } else {
      console.log('승인 실패');
      errorState.view = true;
      errorState.message = '사용자 승인에 실패하였습니다.';
    }

    console.log('response: ', response);
  };

  // const onConfirm = async () => {
  //   console.log('승인 완료');

  //   // 리소스 할당
  //   for (const institution of institutions.value) {
  //     // 기관 할당
  //     const instituteResource = {
  //       userId: userId.value,
  //       instituteId: institution.id,
  //     };
  //     console.log('instituteResource: ', instituteResource);
  //     await setResourceInstitute(instituteResource);

  //     // 정보시스템 할당
  //     for (const system of institution.systems) {
  //       const systemResource = {
  //         userId: userId.value,
  //         instituteId: institution.id,
  //         informationSystemId: system.id,
  //       };
  //       console.log('systemResource: ', systemResource);
  //       await setResourceInfoSystem(systemResource);
  //     }

  //     // 사전 할당
  //     for (const dictionary of institution.dictionaries) {
  //       const dictionaryResource = {
  //         userId: userId.value,
  //         instituteId: institution.id,
  //         dictionaryId: dictionary.id,
  //       };
  //       console.log('dictionaryResource: ', dictionaryResource);
  //       await setResourceDictionary(dictionaryResource);
  //     }
  //   }

  //   const acceptInfo = {
  //     userId: userId.value,
  //     userTypeCode: selectUserType.value,
  //     instituteId: selectInstituteInfo.value,
  //     positionCode: selectPosition.value,
  //     departmentCode: selectDepartment.value,
  //   };

  //   const response = await acceotUserByAdmin(acceptInfo);

  //   if (response.status === 200) {
  //     console.log('승인 완료');
  //     dialogState.view = true;
  //     dialogState.title = '사용자 승인';
  //     dialogState.message = '승인이 완료되었습니다.';
  //     emit('close');
  //     emit('confirm');
  //   } else {
  //     console.log('승인 실패');
  //     errorState.view = true;
  //     errorState.message = '사용자 승인에 실패하였습니다.';
  //   }

  //   console.log('response: ', response);
  // };

  // const onConfirm = async () => {
  //   console.log('승인 완료');

  //   // 리소스 할당

  //   // 기관 할당
  //   const instituteResource = {
  //     userId: userId.value,
  //     instituteId: institutions.value[0].id,
  //   };
  //   console.log('instituteResource: ', instituteResource);
  //   await setResourceInstitute(instituteResource);

  //   // 정보시스템 할당
  //   const systemResource = {
  //     userId: userId.value,
  //     instituteId: institutions.value[0].id,
  //     informationSystemId: institutions.value[0].systems[0].id,
  //   };

  //   console.log('systemResource: ', systemResource);
  //   await setResourceInfoSystem(systemResource);

  //   // 사전 할당
  //   const dictionaryResource = {
  //     userId: userId.value,
  //     instituteId: institutions.value[0].id,
  //     dictionaryId: institutions.value[0].dictionaries[0].id,
  //   };
  //   console.log('dictionaryResource: ', dictionaryResource);
  //   await setResourceDictionary(dictionaryResource);

  //   // for (const institution of institutions.value) {
  //   //   if (institution.id) {
  //   //     for (const system of institution.systems) {
  //   //       if (system.id) {
  //   //         const response = await setResourceInfoSystem(userId.value, system.id);
  //   //         console.log('setResourceInfoSystem response: ', response);
  //   //       }
  //   //     }

  //   //     for (const dictionary of institution.dictionaries) {
  //   //       if (dictionary.id) {
  //   //         const response = await setResourceDictionary(userId.value, dictionary.id);
  //   //         console.log('setResourceDictionary response: ', response);
  //   //       }
  //   //     }
  //   //   }
  //   // }

  //   const acceptInfo = {
  //     userId: userId.value,
  //     userTypeCode: selectUserType.value,
  //     instituteId: selectInstituteInfo.value,
  //     positionCode: selectPosition.value,
  //     departmentCode: selectDepartment.value,
  //   };

  //   const response = await acceotUserByAdmin(acceptInfo);

  //   if (response.status === 200) {
  //     console.log('승인 완료');
  //     dialogState.view = true;
  //     dialogState.title = '사용자 승인';
  //     dialogState.message = '승인이 완료되었습니다.';
  //     emit('close');
  //     emit('confirm');
  //   } else {
  //     console.log('승인 실패');
  //     errorState.view = true;
  //     errorState.message = '사용자 승인에 실패하였습니다.';
  //   }

  //   console.log('response: ', response);
  // };

  const onCancel = () => {
    console.log('설정 취소');
    emit('close');
  };

  const userTypeOptions = ref([]);
  const selectUserType = ref('');

  const instituteInfoOptions = ref([]);
  const selectInstituteInfo = ref('');

  const userPositionOptions = ref([]);
  const selectPosition = ref('');

  const departmentOptions = ref([]);
  const selectDepartment = ref('');

  onBeforeMount(async () => {
    const userTypeList = await getUserTypeList();
    userTypeOptions.value = userTypeList;
    console.log('beforeMount-userTypeList : ', userTypeList);
    selectUserType.value = userTypeList[0].code;

    const instituteList = await getInstList();
    // const instituteList = await getOtherInstituteList(0);

    const filteredInstitutes = instituteList.filter(
      (inst) => inst.delYn !== true
    );

    instituteInfoOptions.value = filteredInstitutes;
    console.log('instituteList: ', instituteList);
    selectInstituteInfo.value = filteredInstitutes[0].instituteId;

    const userPositionList = await getUserPositionList();
    console.log('beforeMount-userPositionList : ', userPositionList);
    userPositionOptions.value = userPositionList;
    selectPosition.value = userPositionList[0].code;

    const departmentList = await getDepartmentByInstitute(1);
    console.log('beforeMount-departmentList : ', departmentList);
    departmentOptions.value = departmentList;
    selectDepartment.value = departmentList[0].code;

    if (institutions.value[0].id) {
      await onInstitutionChange(0);
    }
  });

  // 기관정보 변경
  const infoInstChange = async (instituteId) => {
    console.log('instituteId: ', instituteId);

    const departmentList = await getDepartmentByInstitute(instituteId);

    console.log('departmentList: ', departmentList);

    departmentOptions.value = departmentList;
    selectDepartment.value = departmentList[0].code;
  };
</script>

<style scoped>
  .window-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
  }

  .window-body {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 10px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .select-btn,
  .add-btn {
    padding: 5px 10px;
    margin-left: 10px;
  }

  .resource-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    padding-left: 10px;
  }

  .resource-group {
    border-top: 1px solid #ccc;
    padding-top: 5px;
  }

  .window-footer {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .label-section {
    font-weight: 600;
    padding-bottom: 10px;
    flex: 0 0 auto;
    margin-right: 10px;
  }

  .select-container {
    flex: 1 1 auto;
  }

  select {
    width: 100%;
    box-sizing: border-box;
  }

  .form-section {
    display: flex;
    flex-direction: row;
  }

  .brother-section {
    padding-left: 10px;
  }

  .child-section {
    padding-left: 25px;
    padding-right: 25px;
  }

  .child-label {
    font-weight: 400;
  }

  .parent-group {
    margin-top: 20px;
    border: 1px solid #b3b2b2;
    padding: 10px;
    border-radius: 5px;
  }

  .child-label {
    font-weight: 400;
  }

  #select-position {
    width: 130px;
  }

  #select-department {
    width: 130px;
  }

  .institution-box {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 5px;
  }

  .system-group,
  .dictionary-group {
    margin-top: 10px;
    padding-left: 20px;
  }
</style>
