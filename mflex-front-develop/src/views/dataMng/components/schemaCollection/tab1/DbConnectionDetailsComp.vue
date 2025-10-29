<template>
  <div class="content-top pt5">
    <div class="title-s">
      <div style="display: flex">
        DB연결 상세 정보
        <AppTooltip :htmlContent="getTooltipById('dbConnectionDetails')">
        </AppTooltip>
      </div>

      <div class="inputs-row">
        <div class="input-top">
          <div class="title-btns__row_btween">
            <div class="btns"></div>
            <div class="btns">
              <div class="title-btns__row_btween">
                <div style="display: flex">
                  <button
                    class="btn-s add-reg"
                    title="등록"
                    @click="onSelectReg(1)"
                  >
                    등록
                  </button>
                  <button
                    v-if="rowDetailsInfo && rowDetailsInfo.delYn === false"
                    class="btn-s change-reg"
                    title="수정"
                    @click="onSelectReg(2)"
                    :disabled="regType === 1"
                  >
                    수정
                  </button>
                  <button
                    v-if="rowDetailsInfo && rowDetailsInfo.delYn === false"
                    class="btn-s remove-reg"
                    title="폐기"
                    @click="onDiscardConfirm"
                    :disabled="regType === 1"
                  >
                    폐기
                  </button>
                  <button
                    v-if="rowDetailsInfo && rowDetailsInfo.delYn === true"
                    class="btn-s restore-reg"
                    title="복구"
                    @click="onRestoreConfirm"
                  >
                    복구
                  </button>
                  <button
                    v-if="rowDetailsInfo && rowDetailsInfo.delYn === true"
                    class="btn-s delete-reg"
                    title="삭제"
                    @click="onDeleteConfirm"
                  >
                    삭제
                  </button>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                </div>
              </div>
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
                @click="onCancelConfirm"
                :disabled="regType === 0"
                title="취소"
              >
                취소
              </button>
            </div>
          </div>
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
              <th class="th-essential">*DB연결정보명</th>
              <td colspan="5">
                <div class="td-col">
                  <input
                    v-model="detailsInfo.databaseLinkName"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    :disabled="regType === 0"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th class="th-essential">*연결DB명</th>
              <td class="" colspan="5">
                <div class="td-col manage-input-div">
                  <input
                    v-model="detailsInfo.logicalDatabaseName"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 94%"
                    :disabled="regType === 0"
                  />
                  <button
                    class="btn-s search-btn"
                    @click="onOpenSearchDBWindow()"
                    :disabled="regType === 0"
                    title="연결 DB명 검색"
                  >
                    검색
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <th class="th-essential">*DBMS종류</th>
              <td colspan="2">
                <div class="td-col">
                  <input
                    v-model="detailsInfo.dbmsKindName"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    :disabled="regType === 0"
                  />
                </div>
              </td>
              <th>DBMS정보</th>
              <td colspan="2">
                <div class="td-col">
                  <input
                    v-model="detailsInfo.dbmsInformationContent"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    :disabled="regType === 0"
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th class="th-essential">*온라인연결가능</th>
              <td colspan="2">
                <div class="td-col">
                  <div class="flex-radio">
                    <input
                      v-model="detailsInfo.onlineYn"
                      type="radio"
                      name="onlineConnect"
                      id="online-yes"
                      value="Y"
                      :disabled="regType === 0"
                    />
                    <label for="online-yes">예</label>
                    <input
                      v-model="detailsInfo.onlineYn"
                      type="radio"
                      name="onlineConnect"
                      id="online-no"
                      value="N"
                      :disabled="regType === 0"
                    />
                    <label for="online-no">아니오</label>
                  </div>
                </div>
              </td>
              <th v-if="detailsInfo.onlineYn === 'Y'" class="th-essential">
                *연결유형
              </th>
              <th v-else>연결유형</th>
              <td>
                <div class="td-col">
                  <div class="flex-radio">
                    <input
                      v-model.number="detailsInfo.linkTypeCode"
                      type="radio"
                      name="connectType"
                      id="connect-host"
                      value="10"
                      :disabled="regType === 0 || detailsInfo.onlineYn === 'N'"
                    />
                    <label for="connect-host">HOST</label>
                    <input
                      v-model.number="detailsInfo.linkTypeCode"
                      type="radio"
                      name="connectType"
                      id="connect-url"
                      value="20"
                      :disabled="regType === 0 || detailsInfo.onlineYn === 'N'"
                    />
                    <label for="connect-url">URL</label>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th v-if="detailsInfo.onlineYn === 'Y'" class="th-essential">
                *연결URL
              </th>
              <th v-else>연결URL</th>
              <td colspan="5">
                <div class="td-col">
                  <input
                    v-model="detailsInfo.linkUrlAddress"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    :disabled="
                      detailsInfo.linkTypeCode === 10 ||
                      detailsInfo.linkTypeCode === '10' ||
                      regType === 0 ||
                      detailsInfo.onlineYn === 'N'
                    "
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>호스트명</th>
              <td colspan="3">
                <div class="td-col">
                  <input
                    v-model="detailsInfo.hostName"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    :disabled="
                      regType === 0 ||
                      detailsInfo.onlineYn === 'N' ||
                      detailsInfo.linkTypeCode === '20'
                    "
                  />
                </div>
              </td>
              <th>포트번호</th>
              <td colspan="1">
                <div class="td-col">
                  <input
                    v-model="detailsInfo.portNumber"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    :disabled="
                      regType === 0 ||
                      detailsInfo.onlineYn === 'N' ||
                      detailsInfo.linkTypeCode === '20'
                    "
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>데이터베이스명</th>
              <td colspan="4">
                <div class="td-col">
                  <input
                    v-model="detailsInfo.databaseName"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    :disabled="
                      regType === 0 ||
                      detailsInfo.onlineYn === 'N' ||
                      detailsInfo.linkTypeCode === '20'
                    "
                  />
                </div>
              </td>
              <td colspan="">
                <div class="td-col">
                  <select
                    :disabled="
                      detailsInfo.dbmsKindName != 'ORACLE' || regType === 0
                    "
                    name=""
                    id=""
                  >
                    <option value="">Service Name</option>
                    <option value="">SID</option>
                  </select>
                </div>
              </td>
            </tr>
            <tr>
              <th v-if="detailsInfo.onlineYn === 'Y'" class="th-essential">
                *사용자ID
              </th>
              <th v-else>사용자ID</th>
              <td colspan="2">
                <div class="td-col">
                  <input
                    v-model="detailsInfo.userId"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    :disabled="regType === 0 || detailsInfo.onlineYn === 'N'"
                  />
                </div>
              </td>
              <th v-if="detailsInfo.onlineYn === 'Y'" class="th-essential">
                *비밀번호
              </th>
              <th v-else>비밀번호</th>
              <td colspan="5">
                <div class="td-col manage-input-div">
                  <input
                    v-model="detailsInfo.password"
                    class="input-text"
                    type="password"
                    placeholder=""
                    style="width: 100%"
                    :disabled="regType === 0 || detailsInfo.onlineYn === 'N'"
                  />
                  <!-- <button class="btn-s" :disabled="regType === 0">
                    연결테스트
                  </button> -->
                </div>
              </td>
            </tr>
            <tr>
              <th>DB연결정보설명</th>
              <td colspan="5">
                <textarea
                  v-model="detailsInfo.databaseLinkExplain"
                  style="height: 80px"
                  placeholder="설명을 입력하세요"
                  :disabled="regType === 0"
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <AppWindow
    v-model:view="searchDBWindowView"
    @close="onCloseSearchDBWindow"
    title="DB연결정보 검색"
    width="1000px"
    height="auto"
  >
    <SearchDBListWindow
      @confirm="onConfirmSelectDBInfo"
      @close="onCloseSearchDBWindow"
    />
  </AppWindow>

  <!-- 저장 알림창 -->
  <AppDialog
    v-model:view="saveConfirmState.view"
    :title="saveConfirmState.title"
    :message="saveConfirmState.message"
    @confirm="onSave()"
  />

  <!-- 취소 확인창 -->
  <AppDialog
    v-model:view="cancelConfirmState.view"
    :title="cancelConfirmState.title"
    :message="cancelConfirmState.message"
    @confirm="onReCancel"
  />

  <!-- 폐기 알림창 -->
  <AppDialog
    v-model:view="discardConfirmState.view"
    :title="discardConfirmState.title"
    :message="discardConfirmState.message"
    @confirm="onDisCard()"
  />

  <!-- 복구 알림창 -->
  <AppDialog
    v-model:view="restoreConfirmState.view"
    :title="restoreConfirmState.title"
    :message="restoreConfirmState.message"
    @confirm="onRestore()"
  />

  <!-- 삭제 알림창-->
  <AppDialog
    v-model:view="deleteConfirmState.view"
    :title="deleteConfirmState.title"
    :message="deleteConfirmState.message"
    @confirm="onDelete()"
  />
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAlert } from '@/composables/alert';
  import {
    getOnlineSchemaCollection,
    getDbConnectionDetails, // DB 연결정보 상세조회
    addDbConnection,
    modifyDbConnection,
    deleteDbConnection, // 폐기등록
    restoreDbConnection, // 복구등록
    discardDbConnection,
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import {
    getSupportDbmsList, // 지원 DBMS 목록
  } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { useSchemaCollectionStore } from '@/stores/schemaCollection';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import SearchDBListWindow from '@/components/popWindow/SearchDBListWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  // 선택 DB 연결정보
  const { selectDbInfo, dbConnectionTestState, regState } = storeToRefs(
    useSchemaCollectionStore()
  );

  const { setAlertStatus, alertInfos } = useAlert();

  const {
    setTabState,
    setSelectDbDetails,
    setDbConnectionTestState,
    setSaveState,
    setSaveDatabaseId,
    setSelectJobState,
    setOnlineYnState,
    setRegState,
  } = useSchemaCollectionStore();

  const authStore = useAuthStore();
  const { userMetaMngInstListInfo, userStngInfo } = storeToRefs(authStore);
  const { useDctnryId, useMetaMngInstId, useInfoSysId } = userStngInfo.value;

  console.log('userMetaMngInstListInfo : ', userMetaMngInstListInfo.value);

  // DB URL 템플릿 정의
  const dbUrlTemplates = {
    POSTGRESQL: {
      host: 'jdbc:postgresql://{host}:{port}/{database}',
      url: 'jdbc:postgresql://localhost:5432/mydatabase',
    },
    ORACLE: {
      host: 'jdbc:oracle:thin:@{host}:{port}:{database}',
      url: 'jdbc:oracle:thin:@localhost:1521:orcl',
    },
    MYSQL: {
      host: 'jdbc:mysql://{host}:{port}/{database}',
      url: 'jdbc:mysql://localhost:3306/mydatabase',
    },
    MSSQL: {
      host: 'jdbc:sqlserver://{host}:{port};databaseName={database}',
      url: 'jdbc:sqlserver://localhost:1433;databaseName=mydatabase',
    },
    CUBRID: {
      host: 'jdbc:cubrid:{host}:{port}:{database}:::',
      url: 'jdbc:cubrid:localhost:33000:mydatabase:::',
    },
  };

  // DB 기본 포트
  const defaultPorts = {
    POSTGRESQL: '5432',
    ORACLE: '1521',
    MYSQL: '3306',
    MSSQL: '1433',
    CUBRID: '33000', // CUBRID의 기본 포트 추가
  };

  // URL 생성 함수
  const generateDbUrl = (dbType, host, port, database) => {
    if (!dbType || !dbUrlTemplates[dbType]) return '';

    const template = dbUrlTemplates[dbType].host;
    return template
      .replace('{host}', host || 'localhost')
      .replace('{port}', port || defaultPorts[dbType])
      .replace('{database}', database || '');
  };

  // 호스트, 포트, DB명이 변경될 때 URL 업데이트
  const updateConnectionUrl = () => {
    console.log('updateConnectionUrl-detailsInfo', detailsInfo);
    console.log('updateConnectionUrl-linkTypeCode', detailsInfo.linkTypeCode);
    console.log('updateConnectionUrl-type', typeof detailsInfo.linkTypeCode);

    if (
      detailsInfo.linkTypeCode === 10 ||
      detailsInfo.linkTypeCode === '10' ||
      detailsInfo.linkTypeCode === 20 ||
      detailsInfo.linkTypeCode === '20'
    ) {
      // HOST 타입일 때

      console.log('updateConnectionUrl-detailsInfo', detailsInfo);
      console.log('여기여', detailsInfo);

      detailsInfo.linkUrlAddress = generateDbUrl(
        detailsInfo.dbmsKindName.toUpperCase(),
        detailsInfo.hostName,
        detailsInfo.portNumber,
        detailsInfo.databaseName
      );
    }
  };

  const selectInstituted = computed(() => {
    return userMetaMngInstListInfo.value.find((item) => item.selected === true);
  });

  // 초기화
  const onResetDetailsInfo = () => {
    detailsInfo.instituteId = useMetaMngInstId;
    detailsInfo.databaseId = '';
    detailsInfo.databaseLinkId = '';

    detailsInfo.databaseLinkName = '';
    detailsInfo.databaseLinkInformationExplain = '';
    detailsInfo.onlineYn = 'Y';
    detailsInfo.delYn = false;

    detailsInfo.linkTypeCode = 10;

    detailsInfo.hostName = '';
    detailsInfo.portNumber = '';

    detailsInfo.databaseName = '';
    detailsInfo.logicalDatabaseName = '';
    detailsInfo.databaseNameTypeCode = '';
    detailsInfo.databaseNameTypeName = '';

    detailsInfo.dbmsKindCode = '';
    detailsInfo.dbmsKindName = '';
    detailsInfo.dbmsInformationContent = '';

    detailsInfo.linkUrlAddress = '';
    detailsInfo.userId = '';
    detailsInfo.password = '';

    detailsInfo.targetSchemaAggregate = '';
  };

  // 지원DB 리스트
  const supportDbList = ref([]);

  const bindSupportDbList = async () => {
    const response = await getSupportDbmsList();

    console.log('response', response);

    supportDbList.value = response;

    console.log('supportDbList.value', supportDbList.value);
  };

  bindSupportDbList();

  const onSelectReg = (value) => {
    console.log('onSelectReg', value);

    // 추가 시 초기화
    if (value === 1) {
      onResetDetailsInfo();
      setSelectJobState(true);
    }
    regType.value = value;
  };

  // DB연결정보 상세
  const detailsInfo = reactive({
    // 기관/DB 기본 정보
    instituteId: '',
    databaseId: '',
    databaseLinkId: '',

    // DB 연결 정보
    databaseLinkName: '',
    databaseLinkInformationExplain: '',
    onlineYn: 'Y',
    delYn: false,

    // 연결 타입
    linkTypeCode: 10,

    // 서버 정보
    hostName: '',
    portNumber: '',

    // DB 정보
    databaseName: '',
    logicalDatabaseName: '',
    databaseNameTypeCode: '',
    databaseNameTypeName: '',

    // DBMS 정보
    dbmsKindCode: '',
    dbmsKindName: '',
    dbmsInformationContent: '',

    // 접속 정보
    linkUrlAddress: '',
    userId: '',
    password: '',

    // 스키마 정보
    targetSchemaAggregate: '',
  });

  const rowDetailsInfo = ref({
    databaseLinkId: '',
    databaseLinkName: '',
    dbmsKindName: '',
    delYn: false,
    id: '',
    instituteId: '',
  });

  const onSchemaSave = async () => {
    console.log('스키마 저장 실행');

    const data = {
      instituteId: useMetaMngInstId,
      // databaseLinkId: detailsInfo.databaseLinkId,
      databaseLinkName: detailsInfo.databaseLinkName,
      databaseId: detailsInfo.databaseId,
      onlineYn: detailsInfo.onlineYn == 'Y' ? true : false,
      linkTypeCode: detailsInfo.linkTypeCode,
      hostName: detailsInfo.hostName,
      portNumber: detailsInfo.portNumber,
      databaseName: detailsInfo.databaseName,
      databaseNameTypeCode: detailsInfo.databaseNameTypeCode,
      linkUrlAddress: detailsInfo.linkUrlAddress,
      userId: detailsInfo.userId,
      password: detailsInfo.password,
      databaseLinkExplain: detailsInfo.databaseLinkExplain,
    };

    console.log('saveData : ', data);

    const response = await addDbConnection(data);
    console.log('addDb - response', response);

    console.log('detailsInfo', detailsInfo);

    setSaveState(1);
    setSaveDatabaseId(response.databaseLinkId);
  };

  const onSaveValidation = () => {
    if (detailsInfo.databaseLinkName === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = 'DB연결정보명을 입력해 주십시오.';
      return;
    }
    if (detailsInfo.logicalDatabaseName === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = '연결DB명을 입력해 주십시오.';
      return;
    }
    if (detailsInfo.dbmsKindName === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = 'DBMS종류를 입력해 주십시오.';
      return;
    }
    if (detailsInfo.onlineYn === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = '온라인연결 가능 여부를 선택해 주십시오.';
      return;
    }
    if (
      detailsInfo.onlineYn === 'Y' &&
      detailsInfo.linkTypeCode === 20 &&
      detailsInfo.linkUrlAddress === ''
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message = '연결ULR을 입력해 주십시오';
      return;
    }
    if (detailsInfo.onlineYn === 'Y' && detailsInfo.userId === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = '사용자ID를 입력해 주십시오.';
      return;
    }
    if (detailsInfo.onlineYn === 'Y' && detailsInfo.password === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = '비밀번호를 입력해 주십시오.';
      return;
    }

    return true;
  };

  const onModify = async () => {
    const data = {
      instituteId: useMetaMngInstId,
      databaseLinkName: detailsInfo.databaseLinkName,
      databaseLinkId: detailsInfo.databaseLinkId,
      databaseId: detailsInfo.databaseId,
      onlineYn: detailsInfo.onlineYn == 'Y' ? true : false,
      linkTypeCode: detailsInfo.linkTypeCode,
      hostName: detailsInfo.hostName,
      portNumber: detailsInfo.portNumber,
      databaseName: detailsInfo.databaseName,
      databaseNameTypeCode: detailsInfo.databaseNameTypeCode,
      linkUrlAddress: detailsInfo.linkUrlAddress,
      userId: detailsInfo.userId,
      password: detailsInfo.password,
      databaseLinkExplain: detailsInfo.databaseLinkExplain,
    };

    await modifyDbConnection(data);

    setSaveState(2);
    setSaveDatabaseId(detailsInfo.databaseLinkId);
  };

  const regType = ref(0);
  const regText = computed(() => {
    return regType.value === 0 ? '조회' : regType.value === 1 ? '추가' : '수정';
  });

  // 연결 DB명 검색
  const searchDBWindowView = ref(false);
  const onOpenSearchDBWindow = () => {
    searchDBWindowView.value = true;
  };

  const onCloseSearchDBWindow = () => {
    searchDBWindowView.value = false;
  };

  // 기존 함수들 수정
  const onConfirmSelectDBInfo = (value) => {
    console.log('onConfirmSelectDBInfo', value);

    detailsInfo.logicalDatabaseName = value.logicalDbName;
    detailsInfo.databaseId = value.databaseId;
    detailsInfo.dbmsKindName = value.dbmsKindCode;
    // detailsInfo.databaseName = value.physicalDbName;

    // DBMS 선택 시 기본 포트 설정
    if (defaultPorts[value.dbmsKindCode]) {
      detailsInfo.portNumber = defaultPorts[value.dbmsKindCode];
    }

    updateConnectionUrl();
    searchDBWindowView.value = false;
  };

  //저장
  const saveConfirmState = reactive({
    view: false,
    message: '작업 내용을 저장하시겠습니까?',
  });
  const onSaveConfirm = () => {
    const response = onSaveValidation();

    if (response) {
      saveConfirmState.view = true;
    }
  };
  const onSave = () => {
    console.log('저장 실행');

    if (regType.value === 1) {
      onSchemaSave();
    } else if (regType.value === 2) {
      onModify();
    }
  };

  //초기화 확인
  const cancelConfirmState = reactive({
    view: false,
    message: '작업 내용을 취소 하시겠습니까?',
  });
  const onCancelConfirm = () => {
    cancelConfirmState.view = true;
  };
  const onReCancel = () => {
    if (regType.value === 1) {
      onResetDetailsInfo();
    } else if (regType.value === 2) {
      console.log('rowDetailsInfo', rowDetailsInfo.value);

      bindCollectionData(rowDetailsInfo.value);
    }

    console.log('취소 실행');
  };

  // 삭제 버튼 클릭시 알림창
  const discardConfirmState = reactive({
    view: false,
    message:
      '정말 연결정보를 폐기 하시겠습니까?<br><span style="color:red">(삭제 후 초기 화면으로 돌아갑니다.)</span>',
  });
  const onDiscardConfirm = () => {
    discardConfirmState.view = true;
  };
  const onDisCard = async () => {
    // API 호출
    console.log('delete-detailsInfo : ', detailsInfo);
    const data = {
      databaseLinkId: detailsInfo.databaseLinkId,
      instituteId: detailsInfo.instituteId,
    };
    await discardDbConnection(data);

    setSaveState(3);
  };

  const restoreConfirmState = reactive({
    view: false,
    message: '정말 연결정보를 복구 하시겠습니까?',
  });
  const onRestoreConfirm = () => {
    restoreConfirmState.view = true;
  };
  const onRestore = async () => {
    // API 호출
    console.log('restore-detailsInfo : ', detailsInfo);
    const data = {
      databaseLinkId: detailsInfo.databaseLinkId,
      instituteId: detailsInfo.instituteId,
    };
    await restoreDbConnection(data);
    setSaveState(3);
  };

  const deleteConfirmState = reactive({
    view: false,
    message: '정말 연결정보를 삭제 하시겠습니까?',
  });
  const onDeleteConfirm = () => {
    deleteConfirmState.view = true;
  };
  const onDelete = async () => {
    // API 호출
    console.log('delete-detailsInfo : ', detailsInfo);
    const data = {
      databaseLinkId: detailsInfo.databaseLinkId,
      instituteId: detailsInfo.instituteId,
    };
    await deleteDbConnection(data);
    setSaveState(3);
  };

  const bindCollectionData = (data) => {
    console.log('bindCollectionData');

    // 기관/DB 기본 정보
    detailsInfo.instituteId = oldDetailsInfo.value.instituteId;
    detailsInfo.databaseId = oldDetailsInfo.value.databaseId;
    detailsInfo.databaseLinkId = oldDetailsInfo.value.databaseLinkId;

    detailsInfo.databaseLinkInformationExplain =
      oldDetailsInfo.value.databaseLinkInformationExplain;

    // DB 연결 정보
    detailsInfo.databaseLinkName = oldDetailsInfo.value.databaseLinkName;

    detailsInfo.onlineYn = oldDetailsInfo.value.onlineYn ? 'Y' : 'N';
    detailsInfo.delYn = oldDetailsInfo.value.delYn;

    // 연결 타입
    detailsInfo.linkTypeCode = oldDetailsInfo.value.linkTypeCode;

    // 서버 정보
    detailsInfo.hostName = oldDetailsInfo.value.hostName;
    detailsInfo.portNumber = oldDetailsInfo.value.portNumber;

    // DB 정보
    detailsInfo.databaseName = oldDetailsInfo.value.databaseName;
    detailsInfo.logicalDatabaseName = oldDetailsInfo.value.logicalDatabaseName;
    detailsInfo.databaseNameTypeCode =
      oldDetailsInfo.value.databaseNameTypeCode;
    detailsInfo.databaseNameTypeName =
      oldDetailsInfo.value.databaseNameTypeName;

    // DBMS 정보
    detailsInfo.dbmsKindCode = oldDetailsInfo.value.dbmsKindCode;
    detailsInfo.dbmsKindName = oldDetailsInfo.value.dbmsKindName;
    detailsInfo.dbmsInformationContent =
      oldDetailsInfo.value.dbmsInformationContent;

    // 접속 정보
    detailsInfo.linkUrlAddress = oldDetailsInfo.value.linkUrlAddress;
    detailsInfo.userId = oldDetailsInfo.value.userId;
    detailsInfo.password = oldDetailsInfo.value.password;

    // 스키마 정보
    detailsInfo.targetSchemaAggregate =
      oldDetailsInfo.value.targetSchemaAggregate;
  };

  const oldDetailsInfo = reactive({});

  // DB연결정보 상세조회
  watch(
    selectDbInfo,
    async (value) => {
      console.log('setSaveState(0);', value);

      if (!value.databaseLinkId) {
        return;
      }

      // 삭제 시 초기화
      if (value === null) {
        onSelectReg(1);
        return;
      } else {
        rowDetailsInfo.value.databaseLinkId = value.databaseLinkId;
        rowDetailsInfo.value.databaseLinkName = value.databaseLinkName;
        rowDetailsInfo.value.dbmsKindName = value.dbmsKindName;
        rowDetailsInfo.value.delYn = value.delYn;
        rowDetailsInfo.value.id = value.id;
        rowDetailsInfo.value.instituteId = value.instituteId;

        const data = {
          databaseLinkId: value.databaseLinkId,
          instituteId: value.instituteId,
        };

        const dbDetails = await getDbConnectionDetails(data);

        oldDetailsInfo.value = dbDetails;
        console.log('dbDetails', dbDetails);

        // Details stores 저장
        setSelectDbDetails(dbDetails);

        // DB연결 테스트 상태 초기화
        setDbConnectionTestState(false);

        bindCollectionData(dbDetails);
        regType.value = 0;
      }
    }
    // { immediate: true }
  );

  // DBMS 종류가 변경될 때 기본 포트 설정
  watch(
    () => detailsInfo.dbmsKindName,
    (newDbms) => {
      console.log('newDbms', newDbms);
      if (regType.value === 0) {
        return;
      } else {
        if (newDbms) {
          detailsInfo.dbmsKindName = newDbms.toUpperCase();
        }

        if (newDbms && defaultPorts[newDbms.toUpperCase()]) {
          detailsInfo.portNumber = defaultPorts[newDbms.toUpperCase()];
          updateConnectionUrl();
        }
      }
    }
  );

  // 호스트 정보 변경 감지
  watch(
    [
      () => detailsInfo.hostName,
      () => detailsInfo.portNumber,
      () => detailsInfo.databaseName,
    ],
    () => {
      console.log('watch- 호스트 정보 변경 감지');

      if (regType.value === 0) {
        return;
      } else {
        updateConnectionUrl();
      }
    }
  );

  // 연결 타입 변경 감지
  watch(
    () => detailsInfo.linkTypeCode,
    (newType) => {
      if (regType.value === 0) {
        return;
      } else {
        console.log('newType', newType);
        console.log('newType', typeof newType);

        console.log('detailsInfo.dbmsKindName', detailsInfo.dbmsKindName);
        if (newType === 10 || newType === '10') {
          // HOST 타입으로 변경 시
          updateConnectionUrl();
        } else if (newType === 20 || newType === '20') {
          // URL 타입으로 변경 시
          if (
            detailsInfo.dbmsKindName &&
            dbUrlTemplates[detailsInfo.dbmsKindName]
          ) {
            console.log('detailsInfo.dbmsKindName', detailsInfo.dbmsKindName);
            detailsInfo.linkUrlAddress =
              dbUrlTemplates[detailsInfo.dbmsKindName].url;
          }
        }
      }
    }
  );

  // 작업구분 변경시 저장
  watch(
    () => regType.value,
    (newState) => {
      console.log('작업구분 변경시', newState);
      setRegState(newState);
    },
    {
      immediate: true,
    }
  );

  // 온라인연결 가능 상태 감지
  watch(
    () => detailsInfo.onlineYn,
    (newState) => {
      console.log('newState', newState);
      setOnlineYnState(newState === 'Y' ? true : false);
    },
    { immediate: true }
  );

  watch(
    () => regState.value,
    (newState) => {
      console.log('regState', newState);
      if (newState === 1) {
        onSelectReg(1);
      }
    }
  );
</script>

<style scoped>
  .inputs-wrap {
    height: 80%;
  }
  .input-form .input-table td {
    padding: 2px 2px 2px 10px;
  }
  .th-essential {
    color: crimson;
  }
  .right-blue {
    background-color: #99b9d8;
    color: #fff;
  }
  .title-s {
    justify-content: space-between;
    height: 35px !important;
  }
</style>
