<template>
  <div class="full-contents pl10">
    <div class="content-top pt5">
      <div class="title-s">
        업무 상세 정보
        <AppTooltip :htmlContent="getTooltipById('informationSystemDetails')">
        </AppTooltip>
      </div>
    </div>
    <div class="inputs-row">
      <div class="input-top">
        <div class="title-btns__row_btween">
          <div class="btns">
            <div class=""></div>
            <div style="display: flex">
              <button
                class="btn-s add-reg"
                title="추가"
                @click="onSelectReg(1)"
              >
                추가
              </button>
              <button
                class="btn-s change-reg"
                title="수정"
                @click="onSelectReg(2)"
                :disabled="regType === 1"
              >
                수정
              </button>
              <button
                class="btn-s remove-reg"
                title="삭제"
                @click="onRemoveConfirm"
                :disabled="regType === 1"
              >
                삭제
              </button>
              &nbsp;&nbsp;&nbsp;&nbsp;
            </div>
          </div>
          <div class="btns">
            <button
              class="btn-s save-btn green"
              @click="onSaveConfirm"
              :disabled="regType === 0"
              title="저장"
            >
              저장
            </button>
            <button
              class="btn-s delete-btn"
              @click="onResetConfirm"
              :disabled="regType === 0"
              title="취소"
            >
              취소
            </button>
          </div>
        </div>
      </div>
      <div class="inputs-wrap">
        <div class="input-form">
          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr>
                <th>작업구분</th>
                <td>
                  <div class="td-col">
                    <div
                      :class="[
                        'regbox',
                        {
                          'regbox-select': regType == 0,
                          'regbox-add': regType === 1,
                          'regbox-change': regType === 2,
                        },
                      ]"
                    >
                      <span v-text="regText"></span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th class="required">*업무명</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text"
                      v-model="systemData.informationSystemName"
                      type="text"
                      placeholder="업무명을 입력해주세요."
                      style="width: 300px"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
              <!-- 구축연도를 캘린더 input으로 변경 -->
              <tr>
                <th>구축연도</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text date-picker"
                      v-model="systemData.constructDate"
                      type="date"
                      placeholder=""
                      style="width: 120px"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>표준적용여부</th>
                <td>
                  <div class="td-col" style="width: 3%">
                    <input
                      type="checkbox"
                      v-model="systemData.standardApply"
                      id="standard"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th :class="{ required: systemData.standardApply }">
                  {{ systemData.standardApply ? '*' : '' }}적용표준사전명
                </th>
                <td>
                  <div class="td-col">
                    <select
                      name="userDictionary"
                      id="userDictionary"
                      v-model="systemData.standardDictionaryId"
                      :disabled="
                        regType === 0 || systemData.standardApply === false
                      "
                      style="width: 300px"
                    >
                      <option value="">선택</option>
                      <option
                        v-for="item in userDctnryListInfo"
                        :key="item.id"
                        :value="item.id"
                        :selected="item.selected"
                      >
                        {{ item.name }}
                      </option>
                    </select>
                  </div>
                </td>
              </tr>
              <tr>
                <th>최종수정자</th>
                <td>
                  <div class="td-col">{{ systemData.lastModifier }}</div>
                </td>
              </tr>
              <tr>
                <th>최종수정일시</th>
                <td>
                  <div class="td-col">{{ systemData.lastModifyDate }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="regType === 0">
      <DatabaseSchemaMappingComp
        @update:isAddnewSystem="onResetIsAddNewSystem"
        :isAddnewSystem="isAddnewSystem"
      />
    </div>
  </div>

  <!-- 저장 알림창 -->
  <AppDialog
    v-model:view="saveConfirmState.view"
    :title="saveConfirmState.title"
    :message="saveConfirmState.message"
    @confirm="onSave"
  />
  <!-- 초기화 확인창 -->
  <AppDialog
    v-model:view="resetConfirmState.view"
    :title="resetConfirmState.title"
    :message="resetConfirmState.message"
    @confirm="onReset"
  />
  <!-- 삭제 확인창 -->
  <AppDialog
    v-model:view="removeConfirmState.view"
    :title="removeConfirmState.title"
    :message="removeConfirmState.message"
    @confirm="onRemove"
  />

  <!-- <AppWindow :view="editDatabaseSchemaWindowState" width="1200px" height="auto">
    <EditDatabaseSchemaWindow
      @close="onCloseEditDatabaseSchemaWindow"
      @update:schemas="handleSchemaUpdate"
    />
  </AppWindow> -->

  <!-- 데이터베이스 매핑 알림 -->
  <AppWindow
    :view="databaseMappingWindowView"
    @close="onCloseDatabaseMappingWindow"
    width="700px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onIsAddnewSystem"
      @close="onCloseDatabaseMappingWindow"
    />
  </AppWindow>
</template>

<script setup>
  import { reactive, ref, computed, watch, onBeforeMount } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { getParentDictionaryList } from '@/utils/mflexApi/dictionarySet';
  import {
    getDictionaryByInstitute, // 사전목록 by 기관
  } from '@/utils/mflexApi/userManagementApi';
  import {
    getSystemDetails, // 시스템 상세정보 조회
    addInformationSystem, // 정보시스템 등록
    modifyInfomationSystem, // 정보시스템 수정
    deleteInfomationSystem, // 정보시스템 삭제
    getDbListBySystem, // 시스템에 대한 DB 목록 조회
  } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { dictionaryDetail } from '@/utils/mflexApi/dictionarySet';

  import DatabaseSchemaMappingComp from '@/views/systemMng/components/systemSet/DatabaseSchemaMappingComp.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import EditDatabaseSchemaWindow from '@/components/popWindow/EditDatabaseSchemaWindow.vue';

  const authStore = useAuthStore();
  const {
    userMetaMngInstListInfo,
    userDctnryList,
    userInfo,
    userStngInfo,
    userMetaMngInstList,
  } = storeToRefs(authStore);

  const { useMetaMngInstId } = userStngInfo.value;

  const metaMngInstList = userMetaMngInstList.value;

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const systemStore = useSystemMngStore();
  const { selectSystem, selectSystemInstituteId } = storeToRefs(systemStore);

  const selectInstituted = computed(() => {
    return userMetaMngInstListInfo.value.find((item) => item.selected === true);
  });

  // selectInstitute를 ref 대신 reactive로 초기화
  const selectInstitute = reactive({
    id: useMetaMngInstId, // 초기값으로 현재 사용자의 기관 ID 설정
    name: '',
  });

  const selectedInstName = computed(() => {
    const selectedInst = metaMngInstList.find(
      (items) => items.id === selectInstitute.id
    );
    return selectedInst;
  });

  // 시스템 기존 데이터
  const systemRowData = reactive({});

  // 선택 적용표준사전ID
  const selectDictionaryId = ref();

  const isAddnewSystem = ref(false);

  // selectedDictionaryId 값이 변경될 때마다 systemData.standardDictionaryId 업데이트
  watch(selectDictionaryId, (newValue) => {
    systemData.standardDictionaryId = newValue;
  });

  // 적용표준사전리스트
  const userDctnryListInfo = computed(() => {
    return userDctnryList.value;
  });

  // 시스템 상세정보
  const systemData = reactive({
    systemId: '',
    informationSystemName: '',
    constructDate: '',
    logicalDbName: '',
    physicalDbName: '',
    dbmsKind: '',
    dbmsInfo: '',
    standardApply: false,
    standardDictName: '',
    standardDictionaryId: null,
    lastModifier: '',
    lastModifyDate: '',
  });

  const onSelectReg = (value) => {
    console.log('onSelectReg', value);

    // 추가 시 초기화
    if (value === 1) {
      onResetDetailsInfo();
    }

    regType.value = value;
  };

  // 수정 시 리셋
  const modifyReset = () => {
    console.log('modifyReset');

    console.log('systemRowData : ', systemRowData.value);

    systemData.informationSystemName =
      systemRowData.value.informationSystemName;
    systemData.constructDate = systemRowData.value.constructDate;
    systemData.logicalDbName = systemRowData.value.logicalDbName;
    systemData.physicalDbName = systemRowData.value.physicalDbName;
    systemData.dbmsKind = systemRowData.value.dbmsKind;
    systemData.dbmsInfo = systemRowData.value.dbmsInfo;
    systemData.standardApply = systemRowData.value.standardApply;
    systemData.standardDictName = systemRowData.value.standardDictName;
    systemData.standardDictionaryId = systemRowData.value.standardDictionaryId;
    systemData.lastModifier = systemRowData.value.updater;
    systemData.lastModifyDate = systemRowData.value.updateDateTime;
  };

  const onResetDetailsInfo = () => {
    console.log('onResetDetailsInfo');

    console.log('userInfo : ', userInfo.value);

    const lastModifier = `${userInfo.value.userNm}(${userInfo.value.userId})`;

    const sysdate = new Date();

    // formatDate 함수를 수정하여 시간 정보 포함
    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');

      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };

    // formatDate 함수 사용하여 날짜 포맷팅
    const formattedDateTime = formatDate(sysdate);
    const formattedDateOnly = formattedDateTime.split(' ')[0]; // 날짜만 추출

    systemData.informationSystemName = '';
    systemData.constructDate = formattedDateOnly;
    systemData.logicalDbName = '';
    systemData.physicalDbName = '';
    systemData.dbmsKind = '';
    systemData.dbmsInfo = '';
    systemData.standardApply = false;
    systemData.standardDictName = '';
    systemData.standardDictionaryId = null;
    systemData.lastModifier = lastModifier;
    systemData.lastModifyDate = formattedDateTime; // 최종수정일시에는 시간도 포함
    selectDictionaryId.value = '';
  };

  const regType = ref(0);
  const regText = computed(() => {
    return regType.value === 0 ? '조회' : regType.value === 1 ? '추가' : '수정';
  });

  //저장
  const saveConfirmState = reactive({
    view: false,
    message: '작업 내용을 저장하시겠습니까?',
  });
  const onSaveConfirm = () => {
    saveConfirmState.view = true;
  };
  const onSave = async () => {
    if (regType.value === 1) {
      console.log('저장 실행');

      const systemInfo = {
        instituteId: selectSystemInstituteId.value,
        informationSystemName: systemData.informationSystemName,
        constructDate: systemData.constructDate,
        standardApplicationYn: systemData.standardApply,
        standardDictionaryId:
          systemData.standardApply === false
            ? null
            : systemData.standardDictionaryId,
      };

      const response = await addInformationSystem(systemInfo);

      if (response.status === 201) {
        console.log('add-response : ', response);
        systemStore.setSaveState(1);
        systemStore.setNewSystemId(response.data.informationSystemId);

        const data = {
          systemId: response.data.informationSystemId,
        };

        fetchData(data);
        regType.value = 0;

        // onOpenDatabaseMappingWindow();
        // isAddnewSystem.value = true; // 새 시스템 추가 플래그 설정

        onOpenDatabaseMappingWindow(); // 데이터베이스 매핑 알림창 열기
      }
    } else if (regType.value === 2) {
      const data = {
        systemId: systemData.systemId,
        instituteId: selectInstituted.value.id,
        systemInfo: {
          instituteId: selectInstituted.value.id,
          informationSystemName: systemData.informationSystemName,
          constructDate: systemData.constructDate,
          standardApplicationYn: systemData.standardApply,
          standardDictionaryId:
            systemData.standardApply === false
              ? null
              : systemData.standardDictionaryId,
        },
      };
      const response = await modifyInfomationSystem(data);
      if (response.status === 200) {
        systemStore.setSaveState(2);
        systemStore.setNewSystemId(systemData.systemId);
        regType.value = 0;
      }
    }
  };

  //취소 확인
  const resetConfirmState = reactive({
    view: false,
    message: '작업 내용을 초기화하시겠습니까?',
  });
  const onResetConfirm = () => {
    resetConfirmState.view = true;
  };
  const onReset = () => {
    console.log('초기화 실행');

    if (regType.value === 2) {
      modifyReset();
    } else {
      onResetDetailsInfo();
    }
  };

  //취소 확인
  const removeConfirmState = reactive({
    view: false,
    message: '시스템을 삭제 하시겠습니까?',
  });
  const onRemoveConfirm = () => {
    removeConfirmState.view = true;
  };
  const onRemove = async () => {
    console.log('삭제 실행');

    const data = {
      systemId: systemData.systemId,
      instituteId: selectInstituted.value.id,
    };

    const response = await deleteInfomationSystem(data);

    if (response.status === 200) {
      systemStore.setDeleteState(true);
    }
  };

  const fetchData = async (data) => {
    console.log('fetchData : ', data);

    const params = {
      systemId: data.systemId || data.informationSystemId,
      instituteId: selectInstituted.value.id,
    };

    const systemDetails = await getSystemDetails(params);

    console.log('systemDetails : ', systemDetails);

    // 원본데이터에 저장
    systemRowData.value = systemDetails;

    bindSystemData(systemDetails);
  };

  const bindSystemData = (systemDetails) => {
    systemData.systemId = systemDetails.informationSystemId;
    systemData.informationSystemName = systemDetails.informationSystemName;
    systemData.constructDate = systemDetails.constructDate;
    systemData.standardApply = systemDetails.standardApplicationYn;
    // 사전 ID 설정
    systemData.standardDictionaryId = systemDetails.standardDictionaryId;
    selectDictionaryId.value = systemDetails.standardDictionaryId;
    systemData.lastModifier = systemDetails.updater;
    systemData.lastModifyDate = systemDetails.updateDateTime;
  };

  const popInfo = ref({
    state: 'confirm',
    popTitle: '에러 제목',
    popMessages: '에러 메시지',
  });
  // 데이터베이스 매핑 메시지
  const databaseMappingWindowView = ref(false);
  const onOpenDatabaseMappingWindow = () => {
    popInfo.value.popTitle = '데이터베이스 연동 알림';
    popInfo.value.popMessages =
      '정보시스템에 데이터베이스 매핑을 진행하시겠습니까?';
    databaseMappingWindowView.value = true;
  };
  const onCloseDatabaseMappingWindow = () => {
    databaseMappingWindowView.value = false;
  };

  // 편집 윈도우 상태
  const editDatabaseSchemaWindowState = ref(false);
  // 편집 윈도우 닫기
  const onCloseEditDatabaseSchemaWindow = () => {
    editDatabaseSchemaWindowState.value = false;
  };
  // 편집 윈도우 열기
  const onOpenEditDatabaseSchemaWindow = () => {
    isAddnewSystem.value = true; // 새 시스템 추가 플래그 설정
    onCloseDatabaseMappingWindow(); // 데이터베이스 매핑 알림창 닫기
  };

  const onIsAddnewSystem = () => {
    isAddnewSystem.value = true; // 새 시스템 추가 플래그 설정
    onCloseDatabaseMappingWindow(); // 데이터베이스 매핑 알림창 닫기
  };

  const onResetIsAddNewSystem = () => {
    isAddnewSystem.value = false; // 새 시스템 추가 플래그 초기화
  };

  onBeforeMount(async () => {
    console.log('onBeforeMount');

    const selectedInst = metaMngInstList.find(
      (items) => items.id === selectInstitute.id
    );
    if (selectedInst) {
      selectInstitute.id = selectedInst.id;
      selectInstitute.name = selectedInst.name;
    }

    const dictionaryList = await getParentDictionaryList(
      selectInstituted.value.id,
      0
    );
    console.log('dictionaryList : ', dictionaryList);

    // 사전 홈이 아닌 항목 필터링
    userDctnryList.value = dictionaryList
      .filter((item) => item.dictionaryId !== null)
      .map((item) => {
        return {
          id: item.dictionaryId,
          name: item.dictionaryName,
          selected: false,
        };
      });
  });

  watch(
    selectSystem,
    (value) => {
      console.log('selectSystem', value);

      if (value.id === '0' || value.id === null) {
        // 정보시스템 목록 선택 시 추가
        onSelectReg(1);
      } else {
        console.log('watch 조회 실행 ? ');
        onSelectReg(0);
        // 데이터 바인딩
        fetchData(value);
      }
    }
    // { immediate: true }
  );

  watch(selectSystemInstituteId, async (newValue) => {
    console.log('기관 변경됨', newValue);

    const dictionaryList = await getParentDictionaryList(newValue, 0);
    console.log('dictionaryList : ', dictionaryList);

    // 사전 홈이 아닌 항목 필터링
    userDctnryList.value = dictionaryList
      .filter((item) => item.dictionaryId !== null)
      .map((item) => {
        return {
          id: item.dictionaryId,
          name: item.dictionaryName,
          selected: false,
        };
      });
  });
</script>

<style scoped>
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
</style>
