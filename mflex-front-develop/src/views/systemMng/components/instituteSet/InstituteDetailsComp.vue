<template>
  <div class="full-contents pl10">
    <div class="content-top pt5">
      <div class="title-s">
        기관 상세 정보
        <AppTooltip :htmlContent="getTooltipById('instituteDetails')">
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
              class="btn-s save-btn"
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
                <th class="required">*기관명</th>
                <td>
                  <div class="td-col">
                    <input
                      class="input-text"
                      v-model="instituteData.instituteName"
                      type="text"
                      placeholder=""
                      style="width: 300px"
                      :disabled="regType === 0"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th class="required">*메타관리기관여부</th>
                <td>
                  <div class="td-col">
                    <div class="display: flex;">
                      <input
                        class="checkbox-input"
                        v-model="instituteData.metaManageYn"
                        type="checkbox"
                        placeholder=""
                        style="width: 2%"
                        :disabled="regType === 0"
                      />
                      <span style="margin-left: 10px">메타관리기관</span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th>최종수정자</th>
                <td>
                  <div class="td-col">{{ instituteData.updater }}</div>
                </td>
              </tr>
              <tr>
                <th>최종수정일시</th>
                <td>
                  <div class="td-col">{{ instituteData.updateDateTime }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <button class="btn-s" @click="onOpenApprovalPopup()">
          해당기관으로 이동
        </button>
      </div>
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

  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="500px"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @close="onCloseConfirmWindow"
      @confirm="onChangeInstitute"
    />
  </AppWindow>
</template>

<script setup>
  import { reactive, ref, computed, watch, onBeforeMount } from 'vue';
  import { useAlert } from '@/composables/alert';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import { storeToRefs } from 'pinia';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useAuthStore } from '@/stores/auth';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import {
    getDictionaryByInstitute, // 사전목록 by 기관
  } from '@/utils/mflexApi/userManagementApi';
  import {
    getInfoSystemList, // 정보시스템 조회 by 기관
  } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import {
    getInstituteDetails, // 기관 상세정보 조회
    getSystemDetails, // 시스템 상세정보 조회
    modifyInfomationSystem, // 정보시스템 수정
    // getOtherInstituteList, // 타 기관명 조회
    addInstitute, // 기관 등록
    modifyInstitute, // 기관 수정
    deleteInstitute, // 기관 삭제
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import { getUserInfoSysList } from '@/utils/mflexApi/loginApi';

  import {
    saveUserMetaMngInstListToStorage,
    saveUserDctnryListToStorage,
    saveUserInfoSysListToStorage,
    saveUserMetaMngInstIdToStorage,
    saveUserStngToStorage,
    saveUserToStorage,
  } from '@/utils/cookies';

  import { dictionaryDetail } from '@/utils/mflexApi/dictionarySet';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import router from '../../../../router';

  const authStore = useAuthStore();

  const {
    setUserMetaMngInstList,
    setUserDctnryList,
    setUserInfoSysList,
    setUserMetaMngInstId,
    setUser,
    setUserStngInfo,
  } = authStore;

  const { alertInfos, setAlertStatus } = useAlert();

  const tabNaviStore = useTabNaviStore();
  const { resetTabNavi, setTabNaviData } = tabNaviStore;

  const { userMetaMngInstListInfo, userDctnryList, userInfo, userStngInfo } =
    storeToRefs(authStore);

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const systemStore = useSystemMngStore();
  const { selectInstitute } = storeToRefs(systemStore);
  const { setSaveInstState, setNewInstituteId } = systemStore;

  const selectInstituted = computed(() => {
    return userMetaMngInstListInfo.value.find((item) => item.selected === true);
  });

  // 시스템 기존 데이터
  const systemRowData = reactive({});

  const instituteRowData = reactive({});

  // 선택 적용표준사전ID
  const selectDictionaryId = ref();

  // selectedDictionaryId 값이 변경될 때마다 systemData.standardDictionaryId 업데이트
  watch(selectDictionaryId, (newValue) => {
    systemData.standardDictionaryId = newValue;
  });

  // 적용표준사전리스트
  const userDctnryListInfo = computed(() => {
    return userDctnryList.value;
  });

  const instituteData = reactive({
    instituteId: '',
    instituteName: '',
    metaManageYn: true,
    parentInstituteId: '',
    parentInstituteName: '',
    updater: '',
    updateDateTime: '',
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
    standardDictionaryId: '',
    lastModifier: '',
    lastModifyDate: '',
  });

  const onSelectReg = (value) => {
    console.log('onSelectReg', value);

    // 추가 시 초기화
    if (value === 1) {
      console.log('instituteData : ', instituteData);
      onResetDetailsInfo();
    }

    regType.value = value;
  };

  // 수정 시 리셋
  const modifyReset = () => {
    instituteData.instituteId = instituteRowData.value.instituteId;
    instituteData.instituteName = instituteRowData.value.instituteName;
    instituteData.metaManageYn = instituteRowData.value.metaManageYn;
    instituteData.parentInstituteId =
      instituteRowData.value.parentInstituteId === 0
        ? null
        : instituteRowData.value.parentInstituteId;
    instituteData.parentInstituteName =
      instituteRowData.value.parentInstituteName;
    instituteData.updater = instituteRowData.value.updater;
    instituteData.updateDateTime = instituteRowData.value.updateDateTime;
  };

  const onResetDetailsInfo = () => {
    console.log('onResetDetailsInfo');

    console.log('userInfo : ', userInfo.value);

    const lastModifier = `${userInfo.value.userNm}(${userInfo.value.userId})`;

    const sysdate = new Date();

    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');

      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };

    let parentInstituteId;

    if (selectInstitute) {
      parentInstituteId = selectInstitute.value.id;
    } else {
      parentInstituteId = null;
    }

    instituteData.instituteId = '';
    instituteData.instituteName = '';
    instituteData.metaManageYn = true;
    instituteData.parentInstituteId = parentInstituteId;
    instituteData.parentInstituteName = '';
    instituteData.updater = lastModifier;
    instituteData.updateDateTime = formatDate(sysdate);
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
      console.log('기관 등록');

      const instituteInfo = {
        instituteName: instituteData.instituteName,
        instituteId: 0, // 신규 등록 시 ID는 0으로 설정
        metaManageYn: instituteData.metaManageYn,
      };

      const response = await addInstitute(instituteInfo);

      setNewInstituteId(response.instituteId);
      setSaveInstState(true);
    } else if (regType.value === 2) {
      const instituteInfo = {
        instituteId: instituteData.instituteId,
        instituteName: instituteData.instituteName,
        metaManageYn: instituteData.metaManageYn,
      };
      const response = await modifyInstitute(instituteInfo);

      setNewInstituteId(instituteData.instituteId);
      setSaveInstState(true);
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
    message: '기관을 삭제 하시겠습니까?',
  });
  const onRemoveConfirm = () => {
    removeConfirmState.view = true;
  };
  const onRemove = async () => {
    console.log('삭제 실행');

    console.log('selectInstitute : ', selectInstitute.value);

    await deleteInstitute(instituteData.instituteId);
    setSaveInstState(true);
  };

  const onChangeInstitute = async () => {
    console.log('onChangeInstitute');
    confirmWindowView.value = false;
    console.log('selectInstitute : ', selectInstitute.value);

    // 기관 정보 세팅
    saveUserMetaMngInstIdToStorage(selectInstitute.value.instituteId);
    setUserMetaMngInstId(selectInstitute.value.instituteId);

    console.log('userInfo : ', userInfo.value);
    // 기관명 세팅
    userInfo.value.ogdpInstNm = selectInstitute.value.instituteName;

    setUser(userInfo.value);
    saveUserToStorage(userInfo.value);

    // 업무 정보 세팅

    const data = {
      userId: userInfo.userId,
      instituteId: selectInstitute.value.instituteId,
    };

    // const userInfoSysList = await getUserInfoSysList(userInfo.ogdpInstId);
    const userInfoSysList = await getUserInfoSysList(data.instituteId);
    // const userInfoSysList = await getInfoSystemList(
    //   selectInstitute.value.instituteId
    // );
    console.log('userInfoSysList =====================', userInfoSysList);

    const userInfoSystemList = userInfoSysList.map((item) => {
      return {
        id: item.systemId,
        name: item.systemName,
        selected: item.selected,
      };
    });

    setUserInfoSysList(userInfoSystemList);
    saveUserInfoSysListToStorage(userInfoSystemList);

    const userDctnryList = userInfoSysList.map((item) => {
      return {
        id: item.dictionaryId,
        name: item.dictionaryName,
        dictionaryTypeName: item.dictionaryTypeName,
        dictionaryTypeForegroundColorName:
          item.dictionaryTypeForegroundColorName,
        dictionaryTypeBackgroundColorName:
          item.dictionaryTypeBackgroundColorName,
        selected: item.selected,
      };
    });

    setUserDctnryList(userDctnryList);
    saveUserDctnryListToStorage(userDctnryList);

    let initInfoSystem = userInfoSystemList.find(
      (item) => item.selected === true
    );

    let initInfoSystemId = initInfoSystem.id;

    // 사용자별 사전 조회 API
    let initDictionaryId;

    if (userDctnryList.length > 0) {
      let initDictionary =
        userDctnryList.find((item) => item.selected === true) ||
        userDctnryList[0];
      initDictionaryId = initDictionary.id;
    }

    // 사용자별 설정 영역 저장
    const userStngInfo = {
      useMetaMngInstId: selectInstitute.value.instituteId,
      useInfoSysId: initInfoSystemId,
      useDctnryId: initDictionaryId,
      useSbjarId: '',
    };

    setUserStngInfo(userStngInfo);
    saveUserStngToStorage(userStngInfo);

    await router.replace('/dashboard');
    await setTabNaviData({ title: '대시보드', path: '/dashboard' });
    await window.location.reload();
  };

  const fetchData = async (data) => {
    console.log('fetchData : ', data);

    const params = {
      systemId: data.systemId,
      instituteId: selectInstituted.value.id,
    };

    const systemDetails = await getSystemDetails(params);

    // 원본데이터에 저장
    systemRowData.value = systemDetails;

    // 사전 상세조회
    const dictionaryDetails = await dictionaryDetail(
      systemDetails.standardDictionaryId
    );
    console.log('dictionaryDetails : ', dictionaryDetails);

    if (dictionaryDetails === null) {
      systemDetails.standardDictionaryId = '';
      systemDetails.standardDictionaryName = '';
    }

    systemData.systemId = data.systemId;
    systemData.informationSystemName = systemDetails.informationSystemName;
    systemData.constructDate = systemDetails.constructDate;

    systemData.logicalDbName =
      '논리데이터베이스명' + Math.floor(Math.random() * 100);
    systemData.physicalDbName =
      '물리데이터베이스명' + Math.floor(Math.random() * 100);
    systemData.dbmsKind = 'DBMS종류명' + Math.floor(Math.random() * 100);
    systemData.dbmsInfo = 'DBMS정보' + Math.floor(Math.random() * 100);

    systemData.standardApply = systemDetails.standardApplicationYn;
    systemData.standardDictName = dictionaryDetails.name;
    // 사전 ID 설정
    systemData.standardDictionaryId = systemDetails.standardDictionaryId;
    selectDictionaryId.value = systemDetails.standardDictionaryId;

    systemData.lastModifier = systemDetails.updater;
    systemData.lastModifyDate = systemDetails.updateDateTime;

    console.log('userDctnryListInfo : ', userDctnryListInfo);

    const dictionaryList = await getDictionaryByInstitute(
      selectInstituted.value.id
    );

    console.log('dictionaryList : ', dictionaryList);

    console.log('userDctnryList : ', userDctnryList.value);
  };

  // 선택 기관 변경
  watch(selectInstitute, async (value) => {
    console.log('selectInstitute', selectInstitute);

    // 기관 홈 선택 시
    if (value.instituteId === 0) {
      onSelectReg(1);
      return;
    }

    console.log('value', value);

    const instituteDetails = await getInstituteDetails(value.instituteId);

    instituteRowData.value = instituteDetails;

    console.log('instituteDetails : ', instituteDetails);
    instituteData.instituteId = instituteDetails.instituteId;
    instituteData.instituteName = instituteDetails.instituteName;
    instituteData.metaManageYn = instituteDetails.metaManageYn;
    instituteData.parentInstituteId =
      instituteDetails.parentInstituteId === 0
        ? null
        : instituteDetails.parentInstituteId;
    instituteData.parentInstituteName = instituteDetails.parentInstituteName;
    instituteData.updater = instituteDetails.updater;
    instituteData.updateDateTime = instituteDetails.updateDateTime;

    onSelectReg(0);
  });

  const confirmWindowView = ref(false);

  const onCloseConfirmWindow = () => {
    console.log('onCloseConfirmWindow');
    confirmWindowView.value = false;
  };

  const popInfo = ref({
    state: 'confirm',
    popTitle: '기관이동알림',
    popMessages: `해당 기관으로 이동 하시겠습니까?`,
    confirmBtnText: '이동',
    cancelBtnText: '닫기',
  });

  const onOpenApprovalPopup = () => {
    // Logic to open approval popup
    // approvalEventState.value = 'approval';
    console.log('Opening approval popup');
    confirmWindowView.value = true;
  };
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

  .checkbox-input {
    zoom: 1.5;
    margin: 0;
    cursor: pointer;
  }
</style>
