<template>
  <div class="full-contents pl10">
    <div class="content-top pt5">
      <div class="title-s">
        데이터베이스 상세 정보
        <AppTooltip :htmlContent="getTooltipById('databaseDetails')">
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
            >
              저장
            </button>
            <button
              class="btn-s delete-btn"
              @click="onResetConfirm"
              :disabled="regType === 0"
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
              <col width="15%" />
              <col width="35%" />
              <col width="15%" />
              <col width="35%" />
            </colgroup>
            <tbody>
              <tr>
                <th>작업구분</th>
                <td colspan="3">
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
                <th class="required">*논리데이터베이스명</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text"
                      v-model="databaseData.logicalDatabaseName"
                      type="text"
                      placeholder="논리데이터베이스명 입력"
                      style="width: 100%"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
                <th class="required">*물리데이터베이스명</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text"
                      v-model="databaseData.physicalDatabaseName"
                      type="text"
                      placeholder="물리데이터베이스명 입력"
                      style="width: 100%"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th class="required">*DBMS종류</th>
                <td>
                  <div class="td-col">
                    <select
                      class="input-select"
                      v-model="databaseData.dbmsKindCode"
                      style="width: 100%"
                      :disabled="regType === 0"
                    >
                      <option value="">선택</option>
                      <option value="POSTGRESQL">PostgreSQL</option>
                      <option value="ORACLE">Oracle</option>
                      <option value="MySql">MySQL</option>
                      <option value="MsSQL">SQL Server</option>
                    </select>
                  </div>
                </td>
                <th>운영체제명</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text"
                      v-model="databaseData.osName"
                      type="text"
                      placeholder="운영체제명 입력"
                      style="width: 100%"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>구축일자</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text date-picker"
                      v-model="databaseData.constructDate"
                      type="date"
                      placeholder=""
                      style="width: auto"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
                <th>구축회사명</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text"
                      v-model="databaseData.constructCompanyName"
                      type="text"
                      placeholder="구축회사명 입력"
                      style="width: 100%"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>구축부서명</th>
                <td colspan="3">
                  <div class="td-col">
                    <input
                      class="input-text"
                      v-model="databaseData.constructDepartmentName"
                      type="text"
                      placeholder="구축부서명 입력"
                      style="width: 50%"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th class="required">*데이터베이스 설명</th>
                <td colspan="3">
                  <div class="td-col">
                    <textarea
                      class="input-textarea"
                      v-model="databaseData.databaseExplain"
                      placeholder="데이터베이스 설명을 입력하세요"
                      style="width: 100%; height: 80px"
                      :disabled="regType === 0"
                    ></textarea>
                  </div>
                </td>
              </tr>
              <tr>
                <th>DBMS정보내용</th>
                <td colspan="3">
                  <div class="td-col">
                    <textarea
                      class="input-textarea"
                      v-model="databaseData.dbmsInformationContent"
                      placeholder="DBMS 정보내용을 입력하세요"
                      style="width: 100%; height: 50px"
                      :disabled="regType === 0"
                    ></textarea>
                  </div>
                </td>
              </tr>
              <tr>
                <th>최종수정자</th>
                <td>
                  <div class="td-col">{{ databaseData.updater }}</div>
                </td>
                <th>최종수정일시</th>
                <td>
                  <div class="td-col">{{ databaseData.updateDateTime }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="regType === 0">
      <!-- <DatabaseSchemaMappingComp /> -->
      <DatabaseSchemaComp
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
  import { getParentDictionaryList } from '@/utils/mflexApi/dictionarySet';
  import {
    getDictionaryByInstitute, // 사전목록 by 기관
  } from '@/utils/mflexApi/userManagementApi';
  import {
    getSystemDetails, // 시스템 상세정보 조회
    addInformationSystem, // 정보시스템 등록
    modifyInfomationSystem, // 정보시스템 수정
    deleteInfomationSystem, // 정보시스템 삭제
    addDb, // DB 등록
    editDb, // DB 수정
    deleteDb, // DB 삭제
    getDbDetails, // DB 상세정보 조회
    getDbListBySystem, // 시스템별 DB 목록 조회
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import DatabaseSchemaMappingComp from '@/views/systemMng/components/systemSet/DatabaseSchemaMappingComp.vue';
  import DatabaseSchemaComp from '@/views/systemMng/components/databaseSet/DatabaseSchemaComp.vue';

  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';

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
    deleteDatabaseState,
  } = storeToRefs(systemStore);

  const { setSaveDatabaseState, setNewDatabaseId, setDeleteDatabaseState } =
    systemStore;

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

  // 적용표준사전리스트
  const userDctnryListInfo = computed(() => {
    return userDctnryList.value;
  });

  const isAddnewSchema = ref(false); // 스키마 추가 여부

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
  const regText = computed(() => {
    return regType.value === 0 ? '조회' : regType.value === 1 ? '추가' : '수정';
  });

  //저장
  const saveConfirmState = reactive({
    view: false,
    message: '작업 내용을 저장하시겠습니까?',
  });
  const onSaveConfirm = () => {
    if (regType.value === 1) {
      saveConfirmState.message = '데이터베이스를 추가하시겠습니까?';
    } else if (regType.value === 2) {
      saveConfirmState.message = '데이터베이스 설정을 수정하시겠습니까?';
    }
    saveConfirmState.view = true;
  };
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

  const bindSystemData = (systemDetails) => {
    // systemData.systemId = systemDetails.informationSystemId;
    // systemData.informationSystemName = systemDetails.informationSystemName;
    // systemData.constructDate = systemDetails.constructDate;
    // systemData.standardApply = systemDetails.standardApplicationYn;
    // // 사전 ID 설정
    // systemData.standardDictionaryId = systemDetails.standardDictionaryId;
    // selectDictionaryId.value = systemDetails.standardDictionaryId;
    // systemData.lastModifier = systemDetails.updater;
    // systemData.lastModifyDate = systemDetails.updateDateTime;
  };

  // DB 상세정보
  const bindDbDetails = (dbDetails) => {
    databaseData.constructCompanyName = dbDetails.constructCompanyName;
    databaseData.constructDate = dbDetails.constructDate;
    databaseData.constructDepartmentName = dbDetails.constructDepartmentName;
    databaseData.databaseExplain = dbDetails.databaseExplain;
    databaseData.databaseId = dbDetails.databaseId;
    databaseData.dbmsInformationContent = dbDetails.dbmsInformationContent;
    databaseData.dbmsKindCode = dbDetails.dbmsKindCode;
    databaseData.dbmsKindName = dbDetails.dbmsKindName;
    databaseData.delYn = dbDetails.delYn;
    databaseData.instituteId = dbDetails.instituteId;
    databaseData.logicalDatabaseName = dbDetails.logicalDatabaseName;
    databaseData.osName = dbDetails.osName;
    databaseData.physicalDatabaseName = dbDetails.physicalDatabaseName;
    databaseData.updateDateTime = dbDetails.updateDateTime;
    databaseData.updater = dbDetails.updater;

    console.log('bindDbDetails : ', databaseData);
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
        // fetchData(value);
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

  watch(selectDatabaseInfo, async (newValue) => {
    console.log('selectDatabaseInfo', newValue);

    regType.value = 0; // 조회 상태로 변경

    const data = {
      databaseId: newValue.databaseId,
      instituteId: newValue.instituteId,
    };

    const dbDetails = await getDbDetails(data);

    bindDbDetails(dbDetails);
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
