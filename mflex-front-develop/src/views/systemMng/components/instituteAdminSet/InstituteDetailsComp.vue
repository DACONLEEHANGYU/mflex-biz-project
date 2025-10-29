<template>
  <div class="full-contents pl10">
    <div class="content-top pt5">
      <div class="title-s">
        기관 상세정보
        <AppTooltip :htmlContent="getTooltipById('instituteAdminDetails')">
        </AppTooltip>
      </div>
    </div>
    <div class="inputs-row">
      <div class="input-top"></div>
      <div class="inputs-wrap">
        <div class="input-form">
          <table class="input-table">
            <colgroup>
              <col width="15%" />
              <col width="35%" />
              <col width="15%" />
              <col width="35%" />
            </colgroup>
            <tbody>
              <tr>
                <th>기관명</th>
                <td colspan="3">
                  <div class="td-col">
                    <input
                      class="input-text"
                      v-model="instituteData.instituteName"
                      type="text"
                      placeholder="구축부서명 입력"
                      style="width: 50%"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="regType === 0">
      <!-- <DatabaseSchemaMappingComp /> -->
      <InstituteAdminListComp
        :isAddnewSchema="isAddnewSchema"
        @update:isAddnewSchema="isAddnewSchema = $event"
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

  <!-- 데이터베이스 매핑 알림 -->
  <AppWindow
    :view="schemaAddWindowView"
    @close="onCloseSchemaAddWindow"
    width="700px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onAddSchema"
      @close="onCloseSchemaAddWindow"
    />
  </AppWindow>
</template>

<script setup>
  import { reactive, ref, computed, watch, onBeforeMount } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useInstituteAdminStore } from '@/stores/InstituteAdmin';

  import { getParentDictionaryList } from '@/utils/mflexApi/dictionarySet';
  import {
    addDb, // DB 등록
    editDb, // DB 수정
    deleteDb, // DB 삭제
    getDbDetails, // DB 상세정보 조회
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import InstituteAdminListComp from './InstituteAdminListComp.vue';

  const authStore = useAuthStore();
  const {
    userMetaMngInstListInfo,
    userDctnryList,
    userInfo,
    userStngInfo,
    userMetaMngInstList,
  } = storeToRefs(authStore);

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const { useMetaMngInstId } = userStngInfo.value;

  const metaMngInstList = userMetaMngInstList.value;

  const systemStore = useSystemMngStore();
  const {
    selectSystem,
    selectSystemInstituteId,
    selectDatabaseInfo,
    selectDatabaseInstituteId,
  } = storeToRefs(systemStore);

  const { setSaveDatabaseState, setNewDatabaseId, setDeleteDatabaseState } =
    systemStore;

  const { selectTopInstitute } = storeToRefs(useInstituteAdminStore());

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

  const isAddnewSchema = ref(false); // 스키마 추가 여부

  const instituteData = reactive({
    instituteId: '',
    instituteName: '',
    hasAdmin: false,
  });

  // databaseData 객체를 올바르게 초기화
  const databaseData = reactive({
    constructCompanyName: '',
    constructDate: '',
    constructDepartmentName: '',
    databaseExplain: '',
    databaseId: '',
    dbmsInformationContent: '',
    dbmsKindCode: '',
    dbmsKindName: '',
    delYn: false,
    instituteId: selectDatabaseInstituteId,
    logicalDatabaseName: '',
    osName: '',
    physicalDatabaseName: '',
    updateDateTime: '',
    updater: '',
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

    databaseData.constructCompanyName = '';
    databaseData.constructDate = formattedDateOnly;
    databaseData.constructDepartmentName = '';
    databaseData.databaseExplain = '';
    databaseData.databaseId = '';
    databaseData.dbmsInformationContent = '';
    databaseData.dbmsKindCode = '';
    databaseData.dbmsKindName = '';
    databaseData.delYn = false;
    databaseData.instituteId = selectDatabaseInstituteId;
    databaseData.logicalDatabaseName = '';
    databaseData.osName = '';
    databaseData.physicalDatabaseName = '';
    databaseData.updateDateTime = formattedDateTime;
    databaseData.updater = lastModifier;
    selectDictionaryId.value = '';
  };

  const regType = ref(0);

  //저장
  const saveConfirmState = reactive({
    view: false,
    message: '작업 내용을 저장하시겠습니까?',
  });

  const onSave = async () => {
    if (regType.value === 1) {
      const newDatabase = await addDb(databaseData);
      console.log('신규 DB 등록 : ', newDatabase);
      setSaveDatabaseState(true);
      setNewDatabaseId(newDatabase.databaseId); // 신규 DB ID 설정

      onOpenSchemaAddWindow(); // 스키마 추가 알림창 열기
    } else if (regType.value === 2) {
      const data = {
        // databaseId: databaseData.databaseId,
        // instituteId: databaseData.instituteId,
        ...databaseData,
      };
      console.log('수정 데이터 : ', data);
      await editDb(data);
      setSaveDatabaseState(true);
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
    const data = {
      databaseId: databaseData.databaseId,
      instituteId: databaseData.instituteId,
    };

    await deleteDb(data);
    // setSaveDatabaseState(true);
    setDeleteDatabaseState(true);
  };

  const popInfo = ref({
    state: 'confirm',
    popTitle: '에러 제목',
    popMessages: '에러 메시지',
  });

  // 스키마 추가 알림 메시지
  const schemaAddWindowView = ref(false);
  const onOpenSchemaAddWindow = () => {
    console.log('onOpenSchemaAddWindow');
    popInfo.value.popTitle = '스키마 추가 알림';
    popInfo.value.popMessages = '데이터베이스에 스키마를 추가하시겠습니까?';
    schemaAddWindowView.value = true;
  };
  const onCloseSchemaAddWindow = () => {
    console.log('onCloseSchemaAddWindow');
    schemaAddWindowView.value = false;
  };

  const onAddSchema = async () => {
    console.log('onAddSchema');
    isAddnewSchema.value = true;
    schemaAddWindowView.value = false;
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

  // DBMS 종류 조회 API 호출
  watch(selectSystem, (value) => {
    console.log('selectSystem', value);

    if (value.id === '0' || value.id === null) {
      // 정보시스템 목록 선택 시 추가
      onSelectReg(1);
    } else {
      console.log('watch 조회 실행 ? ');
      onSelectReg(0);
    }
  });

  watch(selectTopInstitute, async (newValue) => {
    console.log('selectTopInstitute', newValue);

    instituteData.instituteId = newValue.instituteId;
    instituteData.instituteName = newValue.instituteName;
    instituteData.hasAdmin = newValue.hasAdmin;
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
