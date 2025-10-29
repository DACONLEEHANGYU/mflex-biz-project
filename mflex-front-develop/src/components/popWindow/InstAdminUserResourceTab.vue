<template>
  <div class="pop-window">
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row"></div>
      </div>
    </div>
  </div>
  <div class="form-group parent-group">
    <div class="resource-header">
      <label id="label-resource" class="label-section">리소스</label>
    </div>
    <div class="resource-group">
      <div class="resource-scroll-container">
        <!-- 업무 설정 div -->
        <div class="institution-box">
          <div class="system-group">
            <div class="resource-header label-section">
              업무 설정
              <button class="add-btn" @click="addSystem()">
                <span>+</span>
              </button>
            </div>
            <div
              v-for="(system, systemIndex) in businessSystemsList"
              :key="system.informationSystemId"
              class="form-group form-section child-section"
            >
              <div class="label-section">
                <label class="child-label">업무{{ systemIndex + 1 }}</label>
              </div>
              <div class="select-container">
                <select disabled>
                  <option selected>{{ system.informationSystemName }}</option>
                </select>
              </div>
              <button
                class="resource-remove"
                @click="
                  onRemoveSystemConfirm(
                    system.informationSystemId,
                    system.instituteId
                  )
                "
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 나머지 다이얼로그와 윈도우들 -->
  <AppDialog
    v-model:view="removeInstConfirmState.view"
    :title="removeInstConfirmState.title"
    :message="removeInstConfirmState.message"
    @confirm="removeInstitute"
  />

  <AppDialog
    v-model:view="removeSystemConfirmState.view"
    :title="removeSystemConfirmState.title"
    :message="removeSystemConfirmState.message"
    @confirm="removeSystem"
  />

  <AppDialog
    v-model:view="removeDctnryConfirmState.view"
    :title="removeDctnryConfirmState.title"
    :message="removeDctnryConfirmState.message"
    @confirm="removeDictionary"
  />

  <AppWindow width="500px" :view="editInstView" @close="onCloseEditInst">
    <AddInstituteWindow
      :userId="userId"
      @confirm="addInstituteResource"
      @add-resource="successAddInstituteResource"
      @close="onCloseEditInst"
    >
    </AddInstituteWindow>
  </AppWindow>

  <AppWindow width="500px" :view="userApproValView" @close="onCloseAddResource">
    <AddSystemWindow
      :userId="userId"
      @confirm="addResource"
      @add-resource="successAddResource"
      @close="onCloseAddResource"
    >
    </AddSystemWindow>
  </AppWindow>

  <AppWindow width="400px" :view="editSystemView" @close="onCloseEditSystem">
    <EditSystemWindow
      :userId="userId"
      :instituteId="selectedInstituteId"
      :systemId="selectedSystemId"
      @confirm="onConfirmEditSystem"
      @close="onCloseEditSystem"
    />
  </AppWindow>

  <AppWindow width="400px" :view="editDctnryView" @close="onCloseEditDctnry">
    <EditDictionaryWindow
      :userId="userId"
      :dictionaryId="selectedDictionaryId"
      :instituteId="selectedInstituteId"
      @confirm="onConfirmEditDictionary"
      @close="onCloseEditDctnry"
  /></AppWindow>
</template>

<script setup>
  import { ref, onMounted, inject, reactive, computed } from 'vue';
  import { storeToRefs } from 'pinia';

  import { useSystemMngStore } from '@/stores/systemMng';

  import AddSystemWindow from '@/components/popWindow/AddSystemWindow.vue';
  import AddInstituteWindow from '@/components/popWindow/AddInstituteWindow.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';

  import EditDictionaryWindow from '@/components/popWindow/EditDictionaryWindow.vue';
  import EditSystemWindow from '@/components/popWindow/EditSystemWindow.vue';
  import { useAuthStore } from '@/stores/auth';
  import { useAlert } from '@/composables/alert';

  import {
    getResourceInstitute, // 기관 정보 조회
    getResourceInfoSystem, // 시스템 정보 조회
    deleteResourceInstitute, // 기관 삭제
    deleteResourceDictionary, // 사전 삭제
    deleteResourceInfoSystem, // 시스템 삭제
  } from '@/utils/mflexApi/userManagementApi';

  const props = defineProps({
    userDetails: Object,
  });

  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId, useGroupId } = userStngInfo.value;

  const emit = defineEmits(['close']);

  const userMappedResources = ref([]);

  const userId = inject('userId');
  const userDetail = ref({});

  // 기존 변수들 아래에 추가
  const businessSystemsList = ref([]); // 업무용 시스템 목록 추가

  const { setAlertStatus } = useAlert();

  const { setUpdateResource } = useSystemMngStore();

  // useMetaMngInstId와 일치하는 기관만 필터링하는 computed 속성
  const filteredUserMappedResources = computed(() => {
    console.log('useMetaMngInstId:', useMetaMngInstId);
    console.log('userMappedResources:', userMappedResources.value);

    return userMappedResources.value.filter((resource) => {
      const match = resource.institute.instituteId === useMetaMngInstId;
      console.log(
        `기관 ${resource.institute.instituteName} (ID: ${resource.institute.instituteId}) 매칭:`,
        match
      );
      return match;
    });
  });

  const fetchResources = async () => {
    try {
      const data = {
        userId: userId,
        instituteId: useMetaMngInstId,
      };
      // const institutes = await getResourceInstitute(data);
      const systems = await getResourceInfoSystem(data);
      console.log('조회된 시스템 목록:', systems);

      // 기관 데이터 분리 - useMetaMngInstId와 다른 기관들 (조직 설정용)
      // const organizationInstitutes = institutes
      //   .filter((institute) => institute.instituteId !== useMetaMngInstId)
      //   .map((institute) => ({
      //     instituteId: institute.instituteId,
      //     instituteName: institute.instituteName,
      //     initSelected: institute.selected,
      //     selected: institute.selected,
      //   }));

      // console.log('조직 설정용 기관 목록:', organizationInstitutes);

      // 시스템 데이터 분리 - useMetaMngInstId 기관의 시스템들 (업무 설정용)
      const businessSystems = systems
        .filter((system) => system.instituteId === useMetaMngInstId)
        .map((system) => ({
          informationSystemId: system.informationSystemId,
          informationSystemName: system.informationSystemName,
          instituteId: system.instituteId,
          initSelected: system.selected,
          selected: system.selected,
        }));

      console.log('업무 설정용 시스템 목록:', businessSystems);

      // // 조직 설정용 데이터를 전역 변수로 할당
      // organizationInstitutesList.value = organizationInstitutes;

      // 업무 설정용 시스템 데이터를 전역 변수로 할당
      businessSystemsList.value = businessSystems;

      // 기존 매핑 구조 유지 (호환성을 위해)
      // const mappedResources = institutes.map((institute) => {
      //   const relatedSystems = systems.filter(
      //     (system) => system.instituteId === institute.instituteId
      //   );

      //   return {
      //     institute: {
      //       instituteId: institute.instituteId,
      //       instituteName: institute.instituteName,
      //       initSelected: institute.selected,
      //       selected: true,
      //     },
      //     systems: relatedSystems.map((system) => ({
      //       informationSystemId: system.informationSystemId,
      //       informationSystemName: system.informationSystemName,
      //       initSelected: system.selected,
      //       selected: true,
      //     })),
      //   };
      // });

      // console.log('분리된 조직용 기관:', organizationInstitutes);
      console.log('분리된 업무용 시스템:', businessSystems);

      // userMappedResources.value = mappedResources;
      console.log('매핑된 리소스:', userMappedResources.value);
      console.log('필터링된 리소스:', filteredUserMappedResources.value);
    } catch (error) {
      console.error('리소스 조회 중 오류 발생:', error);
    }
  };

  onMounted(async () => {
    userDetail.value = props.userDetails;
    await fetchResources();
  });

  const selectedInstituteId = ref(null);
  const selectedSystemId = ref(null);
  const selectedDictionaryId = ref(null);

  const addSystem = (instituteIndex) => {
    userApproValView.value = true;
  };

  const addGroup = () => {
    console.log('addGroup');
    editInstView.value = true;
  };

  const onInstitutionChange = (index) => {
    console.log(
      'Institution changed:',
      filteredUserMappedResources.value[index]
    );
  };

  const onReomoveInstConfirm = (instituteId) => {
    removeInstConfirmState.view = true;
    selectedInstituteId.value = instituteId;
  };

  const onRemoveDctnryConfirm = (dictionaryId, instituteId) => {
    selectedDictionaryId.value = dictionaryId;
    selectedInstituteId.value = instituteId;
    removeDctnryConfirmState.view = true;
  };

  const onRemoveSystemConfirm = (systemId, instituteId) => {
    removeSystemConfirmState.view = true;
    selectedSystemId.value = systemId;
    selectedInstituteId.value = instituteId;
  };

  const removeInstitute = async () => {
    try {
      const resourceInfo = {
        userId: userId,
        instituteId: useMetaMngInstId,
      };

      await deleteResourceInstitute(resourceInfo);
      await fetchResources();

      setAlertStatus({
        view: true,
        message: '기관이 삭제되었습니다.',
        type: 'success',
      });

      setUpdateResource(true);
    } catch (error) {
      console.error('기관 삭제 중 오류 발생:', error);
    }
  };

  const removeSystem = async () => {
    try {
      const resourceInfo = {
        userId: userId,
        instituteId: selectedInstituteId.value,
        informationSystemId: selectedSystemId.value,
      };

      await deleteResourceInfoSystem(resourceInfo);
      await fetchResources();

      setAlertStatus({
        view: true,
        message: '업무가 삭제되었습니다.',
        type: 'success',
      });
    } catch (error) {
      console.error('업무 삭제 중 오류 발생:', error);
    }
  };

  const removeDictionary = async () => {
    try {
      const resourceInfo = {
        userId: userId,
        instituteId: selectedInstituteId.value,
        dictionaryId: selectedDictionaryId.value,
      };

      await deleteResourceDictionary(resourceInfo);
      await fetchResources();

      setAlertStatus({
        view: true,
        message: '사전이 삭제되었습니다.',
        type: 'success',
      });
    } catch (error) {
      console.error('사전 삭제 중 오류 발생:', error);
    }
  };

  const removeInstConfirmState = reactive({
    view: false,
    title: '조직삭제',
    message: '사용자에게 할당된 조직을 삭제하시겠습니까?',
  });

  const removeDctnryConfirmState = reactive({
    view: false,
    title: '사전삭제',
    message: '사용자에게 할당된 사전을 삭제하시겠습니까?',
  });

  const removeSystemConfirmState = reactive({
    view: false,
    title: '시스템삭제',
    message: '사용자에게 할당된 시스템을 삭제하시겠습니까?',
  });

  const userApproValView = ref(false);

  const successAddResource = async () => {
    userApproValView.value = false;
    await fetchResources(); // 새로 추가된 리소스 반영
    setAlertStatus({
      view: true,
      message: '리소스 할당이 완료되었습니다.',
      type: 'success',
    });
  };

  const onCloseAddResource = () => {
    userApproValView.value = false;
  };

  const addResource = async () => {
    console.log('addResource');
    await fetchResources();
  };

  const addInstituteResource = async () => {
    console.log('addInstituteResource');
    await fetchResources();
  };

  const editInstView = ref(false);
  const onCloseEditInst = () => {
    editInstView.value = false;
  };

  const confirmEditInstitute = async () => {
    console.log('confirmEditInstitute');
    await fetchResources();
    editInstView.value = false;
  };

  const editDctnryView = ref(false);

  const onCloseEditDctnry = () => {
    editDctnryView.value = false;
  };

  const onConfirmEditDictionary = async () => {
    console.log('confirmEditDictionary');
    await fetchResources();
    editDctnryView.value = false;
  };

  const editSystemView = ref(false);

  const onCloseEditSystem = () => {
    editSystemView.value = false;
  };

  const onConfirmEditSystem = async () => {
    console.log('confirmEditSystem');
    await fetchResources();
    editSystemView.value = false;
  };
</script>

<style>
  .window-body {
    max-height: 1000px;
    overflow-y: auto;
    padding-right: 10px;
  }

  .parent-group {
    margin-top: 20px;
    border: 1px solid #b3b2b2;
    padding: 10px;
    border-radius: 5px;
  }

  .resource-group {
    padding-top: 5px;
  }

  .resource-scroll-container {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;
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

  .resource-remove {
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-left: 10px;
    background: url(@/assets/images/resource_remove.svg) no-repeat 50%;
    background-size: 20px auto;
  }

  .resource-edit {
    display: inline-block;
    width: 20px;
    height: 20px;
    background: url(@/assets/images/resource_edit.svg) no-repeat 50%;
    background-size: 20px auto;
    margin-left: 15px;
    margin-right: 4px;
  }

  .resource-edit:hover {
    background: url(@/assets/images/resource_edit_hover.svg) no-repeat 50%;
    background-size: 20px auto;
  }

  .resource-remove:hover {
    background: url(@/assets/images/resource_remove_hover.svg) no-repeat 50%;
    background-size: 20px auto;
  }

  #label-resource {
    margin-right: 0px;
  }

  .resource-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  #add-resource-btn {
    top: 1px;
    margin-left: 0;
  }
</style>
