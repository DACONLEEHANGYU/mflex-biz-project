<template>
  <div class="pop-window">
    <div class="window-header">리소스 할당</div>
    <div class="window-body" style="margin-bottom: 15px">
      <div class="signup-form">
        <div class="form-group"></div>
      </div>

      <div v-if="userState != 'admin'" class="form-group parent-group">
        <label class="label-section">리소스</label>

        <div class="resource-group">
          <div class="resource-header label-section">
            기관 설정
            <!-- <button class="add-btn" @click="addInstitution">
              <span>+</span>
            </button> -->
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

            <!-- <div class="system-group">
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
                    v-model="system.informationSystemId"
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
            </div> -->
          </div>
        </div>
      </div>
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
  import { onMounted, ref, reactive, onBeforeMount } from 'vue';
  import { useAlert } from '@/composables/alert';
  import {
    getInstituteList,
    getDictionaryByInstitute,
    getInfoSystemByInstitute,
    getUserTypeList,
    getUserPositionList,
    getDepartmentByInstitute,
    acceotUserByAdmin,
    getResourceInstitute,
    getResourceInfoSystem,
    getResourceDictionary,
    setResourceInstitute,
    setResourceInfoSystem,
    setResourceDictionary,
  } from '@/utils/mflexApi/userManagementApi.js';

  import {
    getOtherInstituteList,
    getInfoSystemList,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import { getParentDictionaryList } from '@/utils/mflexApi/dictionarySet.js';

  const emit = defineEmits(['close', 'confirm', 'add-resource']);
  const props = defineProps({
    userId: String,
  });

  const userId = ref(props.userId);

  console.log('userId: ', userId.value);
  console.log('props.userId: ', props.userId);

  const { setAlertStatus } = useAlert();

  onMounted(async () => {
    console.log('mounted');

    // const instituteList = await getResourceInstitute(userId.value);
    // console.log('리소스 기관 조회 : ', instituteList);
  });

  const institutions = ref([
    {
      id: '',
      systems: [{ informationSystemId: '' }], // 속성명을 informationSystemId로 통일
      dictionaries: [{ dictionaryId: '' }], // 속성명을 dictionaryId로 통일
      systemOptions: [],
      dictionaryOptions: [],
    },
  ]);

  const addInstitution = () => {
    institutions.value.push({
      id: '',
      systems: [{ informationSystemId: '' }],
      dictionaries: [{ dictionaryId: '' }],
      systemOptions: [],
      dictionaryOptions: [],
    });
  };

  const addSystem = (institutionIndex) => {
    institutions.value[institutionIndex].systems.push({
      informationSystemId: '',
    });
  };

  const addDictionary = (institutionIndex) => {
    institutions.value[institutionIndex].dictionaries.push({
      dictionaryId: '',
    });
  };

  // 시스템관리 시스템을 찾는 헬퍼 함수
  const findSystemManagementSystem = (systemList) => {
    return systemList.find(
      (system) =>
        system.informationSystemName &&
        system.informationSystemName.includes('시스템관리')
    );
  };

  const onInstitutionChange = async (index) => {
    const institution = institutions.value[index];
    if (institution.id) {
      try {
        const systemList = await getInfoSystemList(institution.id);
        console.log('systemList: ', systemList);

        institution.systemOptions = systemList;

        // 시스템관리 시스템을 찾아서 기본 선택
        const systemManagementSystem = findSystemManagementSystem(systemList);

        if (systemManagementSystem) {
          // 시스템관리가 있으면 기본 선택
          institution.systems = [
            {
              informationSystemId: systemManagementSystem.informationSystemId,
            },
          ];
          console.log('시스템관리 기본 선택:', systemManagementSystem);
        } else {
          // 시스템관리가 없으면 빈 값으로 초기화
          institution.systems = [{ informationSystemId: '' }];
        }

        // // 사전 옵션 로드
        // const dictionaryList = await getParentDictionaryList(institution.id);
        // institution.dictionaryOptions = dictionaryList;
        // institution.dictionaries = [{ dictionaryId: '' }];
      } catch (error) {
        console.error('기관 변경 시 오류 발생:', error);
        institution.systemOptions = [];
        institution.dictionaryOptions = [];
        institution.systems = [{ informationSystemId: '' }];
        institution.dictionaries = [{ dictionaryId: '' }];
      }
    } else {
      // 기관이 선택되지 않은 경우 초기화
      institution.systemOptions = [];
      institution.dictionaryOptions = [];
      institution.systems = [{ informationSystemId: '' }];
      institution.dictionaries = [{ dictionaryId: '' }];
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
    try {
      let response;

      // 리소스 할당
      for (const institution of institutions.value) {
        if (!institution.id) {
          console.warn('기관이 선택되지 않았습니다.');
          continue;
        }
        // 기관 할당
        const instituteResource = {
          userId: userId.value,
          instituteId: institution.id,
        };
        console.log('instituteResource: ', instituteResource);
        response = await setResourceInstitute(instituteResource);

        // 정보시스템 할당
        for (const system of institution.systems) {
          if (system.informationSystemId) {
            const systemResource = {
              userId: userId.value,
              instituteId: institution.id,
              informationSystemId: system.informationSystemId,
            };
            console.log('systemResource: ', systemResource);
            await setResourceInfoSystem(systemResource);
          }
        }

        // 사전 할당 (주석 처리된 부분)
        // for (const dictionary of institution.dictionaries) {
        //   if (dictionary.dictionaryId) {
        //     const dictionaryResource = {
        //       userId: userId.value,
        //       instituteId: institution.id,
        //       dictionaryId: dictionary.dictionaryId,
        //     };
        //     console.log('dictionaryResource: ', dictionaryResource);
        //     await setResourceDictionary(dictionaryResource);
        //   }
        // }
      }

      console.log('addResource - response : ', response);

      if (response && (response.status === 200 || response.status === 409)) {
        emit('close');
        emit('confirm');
        emit('add-resource');

        setAlertStatus({
          view: true,
          message: '리소스 할당이 완료되었습니다.',
          type: 'success',
        });
      } else {
        console.log('리소스 할당 실패');
        setAlertStatus({
          view: true,
          message: '리소스 할당에 실패하였습니다.',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('리소스 할당 중 오류 발생:', error);
      setAlertStatus({
        view: true,
        message: '리소스 할당 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  };

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
    try {
      // 사용자 타입 목록 로드
      const userTypeList = await getUserTypeList();
      userTypeOptions.value = userTypeList;
      console.log('beforeMount-userTypeList : ', userTypeList);
      if (userTypeList.length > 0) {
        selectUserType.value = userTypeList[0].code;
      }

      // 기관 목록 로드
      const instituteList = await getOtherInstituteList(0);
      instituteInfoOptions.value = instituteList;
      console.log('instituteList: ', instituteList);
      if (instituteList.length > 0) {
        selectInstituteInfo.value = instituteList[0].id;
      }

      // 사용자 직급 목록 로드
      const userPositionList = await getUserPositionList();
      console.log('beforeMount-userPositionList : ', userPositionList);
      userPositionOptions.value = userPositionList;
      if (userPositionList.length > 0) {
        selectPosition.value = userPositionList[0].code;
      }

      // 부서 목록 로드
      const departmentList = await getDepartmentByInstitute(2);
      console.log('beforeMount-departmentList : ', departmentList);
      departmentOptions.value = departmentList;
      if (departmentList.length > 0) {
        selectDepartment.value = departmentList[0].code;
      }

      // 첫 번째 기관이 이미 선택되어 있다면 시스템 목록 로드
      if (institutions.value[0].id) {
        await onInstitutionChange(0);
      }
    } catch (error) {
      console.error('초기 데이터 로드 중 오류 발생:', error);
      setAlertStatus({
        view: true,
        message: '초기 데이터 로드 중 오류가 발생했습니다.',
        type: 'error',
      });
    }
  });
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
