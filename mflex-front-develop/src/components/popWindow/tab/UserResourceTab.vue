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
      <button id="add-resource-btn" class="add-btn" @click="onAddResource">
        <span>+</span>
      </button>
    </div>
    <div class="resource-group">
      <div class="resource-scroll-container">
        <!-- <div class="inresource-header label-section">
          기관 설정
           <button v-if="editState" class="add-btn" @click="addInstitution">
            <span>+</span>
          </button> 
           <button class="add-btn" @click="addInstitution">
            <span>+</span>
          </button> 
        </div> -->
        <div
          v-for="(institute, instituteIndex) in userMappedResources"
          :key="institute.institute.instituteId"
          class="institution-box"
        >
          <div class="form-group form-section child-section">
            <div class="label-section">
              <label class="child-label">기관 {{ instituteIndex + 1 }}</label>
            </div>
            <div class="select-container">
              <select
                v-model="institute.institute.selected"
                @change="onInstitutionChange(instituteIndex)"
                :disabled="!editState"
              >
                <option :value="false">기관선택</option>
                <option :value="true">
                  {{ institute.institute.instituteName }}
                </option>
              </select>
            </div>
            <button
              class="resource-edit"
              @click="onOpenEditInst(institute.institute.instituteId)"
            ></button>
            <button
              class="resource-remove"
              @click="onReomoveInstConfirm(institute.institute.instituteId)"
            ></button>
          </div>

          <!-- <div class="system-group">
            <div class="resource-header label-section">
              시스템 설정
              <button
                v-if="editState"
                class="add-btn"
                @click="addSystem(instituteIndex)"
              >
                <span>+</span>
              </button>
            </div>
            <div
              v-for="(system, systemIndex) in institute.systems"
              :key="system.informationSystemId"
              class="form-group form-section child-section"
            >
              <div class="label-section">
                <label class="child-label">시스템{{ systemIndex + 1 }}</label>
              </div>
              <div class="select-container">
                <select v-model="system.selected" :disabled="!editState">
                  <option :value="false">시스템 선택</option>
                  <option :value="true">
                    {{ system.informationSystemName }}
                  </option>
                </select>
              </div>
              <button
                class="resource-edit"
                @click="
                  onOpenEditSystem(
                    system.informationSystemId,
                    institute.institute.instituteId
                  )
                "
              ></button>
              <button
                class="resource-remove"
                @click="
                  onRemoveSystemConfirm(
                    system.informationSystemId,
                    institute.institute.instituteId
                  )
                "
              ></button>
            </div>
          </div> -->

          <!-- <div class="dictionary-group">
            <div class="resource-header label-section">
              사전 설정
              <button
                v-if="editState"
                class="add-btn"
                @click="addDictionary(instituteIndex)"
              >
                <span>+</span>
              </button>
            </div>
            <div
              v-for="(dictionary, dictionaryIndex) in institute.dictionaries"
              :key="dictionary.dictionaryId"
              class="form-group form-section child-section"
            >
              <div class="label-section">
                <label class="child-label">사전{{ dictionaryIndex + 1 }}</label>
              </div>
              <div class="select-container">
                <select v-model="dictionary.selected" :disabled="!editState">
                  <option :value="false">사전선택</option>
                  <option :value="true">{{ dictionary.dictionaryName }}</option>
                </select>
              </div>
              <button
                class="resource-edit"
                @click="
                  onOpenEditDictionary(
                    dictionary.dictionaryId,
                    institute.institute.instituteId
                  )
                "
              ></button>
              <button
                class="resource-remove"
                @click="
                  onRemoveDctnryConfirm(
                    dictionary.dictionaryId,
                    institute.institute.instituteId
                  )
                "
              ></button>
            </div>
          </div> -->
        </div>
      </div>
    </div>
  </div>

  <!-- 기관삭제 확인 다이얼로그 -->
  <AppDialog
    v-model:view="removeInstConfirmState.view"
    :title="removeInstConfirmState.title"
    :message="removeInstConfirmState.message"
    @confirm="removeInstitute"
  />

  <!-- 시스템삭제 확인 다이얼로그 -->
  <AppDialog
    v-model:view="removeSystemConfirmState.view"
    :title="removeSystemConfirmState.title"
    :message="removeSystemConfirmState.message"
    @confirm="removeSystem"
  />

  <!-- 사전삭제 확인 다이얼로그 -->
  <AppDialog
    v-model:view="removeDctnryConfirmState.view"
    :title="removeDctnryConfirmState.title"
    :message="removeDctnryConfirmState.message"
    @confirm="removeDictionary"
  />

  <!-- 리소스 할당 -->
  <AppWindow width="500px" :view="userApproValView" @close="onCloseAddResource">
    <AddResourceWindow
      :userId="userId"
      @confirm="addResource"
      @add-resource="successAddResource"
      @close="onCloseAddResource"
    >
    </AddResourceWindow>
  </AppWindow>

  <!-- 기관 변경 -->
  <AppWindow width="400px" :view="editInstView" @close="onCloseEditInst">
    <EditInstituteWindow
      :userId="userId"
      :instituteId="selectedInstituteId"
      @confirm="confirmEditInstitute"
      @close="onCloseEditInst"
    />
  </AppWindow>

  <!-- 시스템 변경 -->
  <AppWindow width="400px" :view="editSystemView" @close="onCloseEditSystem">
    <EditSystemWindow
      :userId="userId"
      :instituteId="selectedInstituteId"
      :systemId="selectedSystemId"
      @confirm="onConfirmEditSystem"
      @close="onCloseEditSystem"
    />
  </AppWindow>

  <!-- 사전 수정 -->
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
  import { ref, onMounted, inject, reactive } from 'vue';
  import { storeToRefs } from 'pinia';
  import {
    getResourceInstitute, // 기관 정보 조회
    getResourceInfoSystem, // 시스템 정보 조회
    deleteResourceInstitute, // 기관 삭제
    deleteResourceDictionary, // 사전 삭제
    deleteResourceInfoSystem, // 시스템 삭제
  } from '@/utils/mflexApi/userManagementApi';

  import { useAuthStore } from '@/stores/auth';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import AddResourceWindow from '@/components/popWindow/AddResourceWindow.vue';
  import EditInstituteWindow from '@/components/popWindow/EditInstituteWindow.vue';
  import EditDictionaryWindow from '@/components/popWindow/EditDictionaryWindow.vue';
  import EditSystemWindow from '@/components/popWindow/EditSystemWindow.vue';
  import { useAlert } from '@/composables/alert';

  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId } = userStngInfo.value;

  const props = defineProps({
    userDetails: Object,
  });

  const emit = defineEmits(['close']);

  const userMappedResources = ref([]);

  const userId = inject('userId');

  const userDetail = ref({});

  const { setAlertStatus } = useAlert();

  const fetchResources = async () => {
    const institutes = await getResourceInstitute(userId);
    const systems = await getResourceInfoSystem(userId);
    // const dictionaries = await getResourceDictionary(userId);

    const mappedResources = institutes.map((institute) => {
      const relatedSystems = systems.filter(
        (system) => system.instituteId === institute.instituteId
      );
      // const relatedDictionaries = dictionaries.filter(
      //   (dict) => dict.instituteId === institute.instituteId
      // );

      return {
        institute: {
          instituteId: institute.instituteId,
          instituteName: institute.instituteName,
          initSelected: institute.selected,
          selected: true,
        },
        systems: relatedSystems.map((system) => ({
          informationSystemId: system.informationSystemId,
          informationSystemName: system.informationSystemName,
          initSelected: system.selected,
          selected: true,
        })),
        // dictionaries: relatedDictionaries.map((dict) => ({
        //   dictionaryId: dict.dictionaryId,
        //   dictionaryName: dict.dictionaryName,
        //   initSelected: dict.selected,
        //   selected: true,
        // })),
      };
    });

    userMappedResources.value = mappedResources;
  };

  onMounted(async () => {
    userDetail.value = props.userDetails;
    const data = {
      userId: userId,
      instituteId: useMetaMngInstId,
    };
    const institutes = await getResourceInstitute(data);
    // const systems = await getResourceInfoSystem(userId);
    // const dictionaries = await getResourceDictionary(userId);

    // 새로운 매핑된 객체 생성
    const mappedResources = institutes.map((institute) => {
      /* const relatedSystems = systems.filter(
        (system) => system.instituteId === institute.instituteId
      ); */
      // const relatedDictionaries = dictionaries.filter(
      //   (dict) => dict.instituteId === institute.instituteId
      // );

      return {
        institute: {
          instituteId: institute.instituteId,
          instituteName: institute.instituteName,
          initSelected: institute.selected,
          selected: true,
        },
        // systems: relatedSystems.map((system) => ({
        //   informationSystemId: system.informationSystemId,
        //   informationSystemName: system.informationSystemName,
        //   initSelected: system.selected,
        //   selected: true,
        // })),
        // dictionaries: relatedDictionaries.map((dict) => ({
        //   dictionaryId: dict.dictionaryId,
        //   dictionaryName: dict.dictionaryName,
        //   initSelected: dict.selected,
        //   selected: true,
        // })),
      };
    });

    // 예시 데이터로 초기화 (실제로는 API에서 받아올 것입니다)
    userMappedResources.value = mappedResources;

    console.log('userMappedResources:', userMappedResources.value);

    // userMappedResources.value = [
    //   {
    //     institute: {
    //       instituteId: 2,
    //       instituteName: '데이콘인피니티',
    //       selected: false,
    //     },
    //     systems: [
    //       {
    //         informationSystemId: 2,
    //         informationSystemName: '데이콘홈페이지',
    //         selected: true,
    //       },
    //       {
    //         informationSystemId: 3,
    //         informationSystemName: '인사관리시스템',
    //         selected: false,
    //       },
    //     ],
    //     dictionaries: [
    //       {
    //         dictionaryId: 5,
    //         dictionaryName: '영업관리시스템 표준사전',
    //         selected: true,
    //       },
    //       {
    //         dictionaryId: 4,
    //         dictionaryName: '인사급여시스템 표준사전',
    //         selected: false,
    //       },
    //     ],
    //   },
    //   {
    //     institute: {
    //       instituteId: 6,
    //       instituteName: '중소벤처기업진흥공단',
    //       selected: true,
    //     },
    //     systems: [
    //       {
    //         informationSystemId: 7,
    //         informationSystemName: '중진공시스템',
    //         selected: false,
    //       },
    //     ],
    //     dictionaries: [
    //       {
    //         dictionaryId: 8,
    //         dictionaryName: '중진공 표준사전',
    //         selected: false,
    //       },
    //     ],
    //   },
    // ];
  });

  const selectedInstituteId = ref(null);
  const selectedSystemId = ref(null);
  const selectedDictionaryId = ref(null);

  // const addInstitution = () => {
  //   console.log('addInstitution');
  // };

  const addInstitution = () => {
    // 새 기관 추가 로직
    userMappedResources.value.push({
      institute: {
        instituteId: Date.now(),
        instituteName: '새 기관',
        selected: false,
      },
      systems: [],
      dictionaries: [],
    });
  };

  const addSystem = (instituteIndex) => {
    // 새 시스템 추가 로직
    userMappedResources.value[instituteIndex].systems.push({
      informationSystemId: Date.now(),
      informationSystemName: '새 시스템',
      selected: false,
    });
  };

  const addDictionary = (instituteIndex) => {
    // 새 사전 추가 로직
    userMappedResources.value[instituteIndex].dictionaries.push({
      dictionaryId: Date.now(),
      dictionaryName: '새 사전',
      selected: false,
    });
  };

  const onInstitutionChange = (index) => {
    // 기관 변경 시 로직
    console.log('Institution changed:', userMappedResources.value[index]);
  };

  // 기관변경
  const editInstitute = (instituteId) => {
    // 기관 수정 로직
    console.log('Edit institute:', instituteId);
  };

  const onReomoveInstConfirm = (instituteId) => {
    removeInstConfirmState.view = true;
    selectedInstituteId.value = instituteId;
  };

  // 사전삭제 확인
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

  // 기관삭제
  const removeInstitute = async (instituteId) => {
    // 기관 삭제 로직
    console.log('Remove institute:', instituteId);
    const resourceInfo = {
      userId: userId,
      instituteId: selectedInstituteId.value,
    };

    await deleteResourceInstitute(resourceInfo);
    await fetchResources();
  };

  const editSystem = (systemId) => {
    // 시스템 수정 로직
    console.log('Edit system:', systemId);
  };

  const removeSystem = async (systemId) => {
    // 시스템 삭제 로직
    console.log('Remove system:', systemId);

    const resourceInfo = {
      userId: userId,
      instituteId: selectedInstituteId.value,
      informationSystemId: selectedSystemId.value,
    };

    await deleteResourceInfoSystem(resourceInfo);
    await fetchResources();
  };

  // 사전변경
  const editDictionary = (dictionaryId) => {
    // 사전 수정 로직
    console.log('Edit dictionary:', dictionaryId);
  };

  const removeDictionary = async () => {
    // 사전 삭제 로직
    // console.log('Remove dictionary:', dictionaryId);
    const resourceInfo = {
      userId: userId,
      instituteId: selectedInstituteId.value,
      dictionaryId: selectedDictionaryId.value,
    };

    await deleteResourceDictionary(resourceInfo);

    // 재조회 및 렌더링
    await fetchResources();
  };

  const removeInstConfirmState = reactive({
    view: false,
    title: '기관삭제',
    message: '사용자에게 할당된 기관을 삭제하시겠습니까?',
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

  // 리소스 할당 팝업 출력
  const onAddResource = () => {
    userApproValView.value = true;
  };

  const successAddResource = () => {
    userApproValView.value = false;
    setAlertStatus({
      view: true,
      message: '리소스 할당이 완료되었습니다.',
      type: 'success',
    });
  };

  // 리소스 할당 팝업 닫기
  const onCloseAddResource = () => {
    userApproValView.value = false;
  };

  const addResource = async () => {
    console.log('addResource');

    await fetchResources();
  };

  const editInstView = ref(false);
  const onCloseEditInst = () => {
    editInstView.value = false;
  };

  const onOpenEditInst = (instituteId) => {
    selectedInstituteId.value = instituteId;
    editInstView.value = true;
  };

  const confirmEditInstitute = async () => {
    console.log('confirmEditInstitute');

    await fetchResources();
  };

  const editDctnryView = ref(false);

  const onOpenEditDictionary = (dictionaryId, instituteId) => {
    selectedDictionaryId.value = dictionaryId;
    selectedInstituteId.value = instituteId;
    editDctnryView.value = true;
  };

  const onCloseEditDctnry = () => {
    editDctnryView.value = false;
  };

  const onConfirmEditDictionary = async () => {
    console.log('confirmEditDictionary');
    await fetchResources();
  };

  const editSystemView = ref(false);

  const onOpenEditSystem = (systemId, instituteId) => {
    selectedSystemId.value = systemId;
    selectedInstituteId.value = instituteId;
    editSystemView.value = true;
  };

  const onCloseEditSystem = () => {
    editSystemView.value = false;
  };

  const onConfirmEditSystem = async () => {
    console.log('confirmEditSystem');
    await fetchResources();
  };
</script>

<style>
  .window-body {
    max-height: 1000px;
    overflow-y: outo;
    padding-right: 10px;
  }

  .parent-group {
    margin-top: 20px;
    border: 1px solid #b3b2b2;
    padding: 10px;
    border-radius: 5px;
  }

  .resource-group {
    /* border-top: 1px solid #ccc; */
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
