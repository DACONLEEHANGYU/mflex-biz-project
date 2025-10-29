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
                <th>표준사전적용여부</th>
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
            </tbody>
          </table>

          <!-- 결재선 설정 섹션 -->
          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr>
                <th>결재선 선택</th>
                <td>
                  <div
                    class="td-col"
                    style="
                      gap: 10px;
                      display: flex;
                      align-items: center;
                      flex-direction: row;
                      justify-content: flex-start;
                    "
                  >
                    <select
                      v-model="selectedApprovalLineId"
                      :disabled="regType === 0"
                      style="width: 300px"
                      @change="onApprovalLineSelected"
                    >
                      <option value="">선택</option>
                      <option
                        v-for="approvalLine in approvalLineOptions"
                        :key="approvalLine.approvalLineId"
                        :value="approvalLine.approvalLineId"
                      >
                        {{ approvalLine.approvalLineName }} ({{
                          approvalLine.approvers?.length || 0
                        }}명)
                      </option>
                    </select>
                    <button
                      v-if="selectedApprovalLineId && regType !== 0"
                      class="btn-s reset-approval-line"
                      title="결재선 선택 취소"
                      @click="onResetApprovalLine"
                    >
                      취소
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <th>결재선 구성</th>
                <td>
                  <div class="td-col">
                    <ApprovalLineComp
                      v-model="approvalLine"
                      :disabled="true"
                      :show-selector="false"
                      :max-approvers="5"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tr>
              <th>최종수정자</th>
              <td>
                <div class="td-col">{{ systemData.lastModifier }}</div>
              </td>
              <th>최종수정일시</th>
              <td>
                <div class="td-col">{{ systemData.lastModifyDate }}</div>
              </td>
            </tr>
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
  import { reactive, ref, computed, watch, onBeforeMount, nextTick } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useSystemMngStore } from '@/stores/systemMng';
  import { useAuthStore } from '@/stores/auth';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { getDictionaryTree } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { getParentDictionaryList } from '@/utils/mflexApi/dictionarySet';
  import ApprovalLineComp from '@/components/ui/ApprovalLineComp.vue';

  import {
    getSystemDetails,
    addInformationSystem,
    modifyInfomationSystem,
    deleteInfomationSystem,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import {
    addApprovalLineForSystem,
    removeApprovalLineForSystem,
    getApprovalLineList,
  } from '@/utils/mflexApi/approval/ApprovalApi';

  import DatabaseSchemaMappingComp from '@/views/instSystemMng/components/tab2/DatabaseSchemaMappingComp.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppDialog from '@/components/ui/AppDialog.vue';

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

  const selectInstitute = reactive({
    id: useMetaMngInstId,
    name: '',
  });

  const systemRowData = reactive({});

  const selectDictionaryId = ref();

  const isAddnewSystem = ref(false);

  watch(selectDictionaryId, (newValue) => {
    systemData.standardDictionaryId = newValue;
  });

  const userDctnryListInfo = ref([]);

  // 결재선 관련 변수들
  const approvalLineOptions = ref([]);
  const selectedApprovalLineId = ref('');
  const approvalLine = ref([]);
  const originalApprovalLineId = ref(''); // 원본 결재선 ID 추적
  const isApprovalLineRemoved = ref(false); // 결재선 삭제 여부 플래그

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

  // 결재선 초기화 함수 (원본 ID 추적 포함)
  const onResetApprovalLine = () => {
    console.log('결재선 선택 취소');
    console.log('기존 결재선 ID:', originalApprovalLineId.value);

    // 수정 모드에서 기존에 결재선이 있었던 경우 삭제 플래그 설정
    if (regType.value === 2 && originalApprovalLineId.value) {
      isApprovalLineRemoved.value = true;
      console.log('결재선 삭제 플래그 설정됨');
    }

    // 결재선 선택 초기화
    selectedApprovalLineId.value = '';

    // 결재선 구성 초기화
    approvalLine.value = [];

    console.log('결재선이 초기화되었습니다.');
  };

  // 🔥 결재선 선택 함수도 안전성 개선
  const onApprovalLineSelected = () => {
    console.log('선택된 결재선 ID:', selectedApprovalLineId.value);

    if (!selectedApprovalLineId.value) {
      approvalLine.value = [];
      return;
    }

    // 🔥 결재선 옵션이 로드되지 않은 경우 처리
    if (!approvalLineOptions.value || approvalLineOptions.value.length === 0) {
      console.warn('결재선 옵션이 아직 로드되지 않았습니다.');
      return;
    }

    const selectedLine = approvalLineOptions.value.find(
      (line) => line.approvalLineId === selectedApprovalLineId.value
    );

    if (selectedLine && selectedLine.approvers) {
      console.log('선택된 결재선:', selectedLine);

      const mappedApprovers = selectedLine.approvers
        .sort((a, b) => a.approvalOrder - b.approvalOrder)
        .map((approver, index) => ({
          id: approver.approverId,
          userId: approver.approverId,
          name: approver.approverName,
          department: approver.department || '',
          position: approver.position || '',
          email: approver.email || '',
          approverSeq: approver.approverSeq,
          approvalOrder: approver.approvalOrder,
        }));

      console.log('변환된 결재자 목록:', mappedApprovers);

      // 🔥 안전한 업데이트
      approvalLine.value = mappedApprovers;
    } else {
      console.warn(
        '선택된 결재선을 찾을 수 없습니다:',
        selectedApprovalLineId.value
      );
      approvalLine.value = [];
    }
  };

  // 결재선 목록 데이터 로드
  const loadApprovalLineOptions = (approvalLineList) => {
    console.log('결재선 목록 로드:', approvalLineList);

    approvalLineOptions.value = approvalLineList.filter(
      (line) => line.useYn === true
    );

    console.log('필터링된 결재선 목록:', approvalLineOptions.value);
  };

  const onSelectReg = (value) => {
    console.log('onSelectReg', value);

    if (value === 1) {
      onResetDetailsInfo();
    }

    regType.value = value;
  };

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

    // 결재선 관련 초기화 - 원본 데이터로 복원
    isApprovalLineRemoved.value = false; // 삭제 플래그 리셋

    if (
      systemRowData.value.approvalLines &&
      systemRowData.value.approvalLines.length > 0
    ) {
      originalApprovalLineId.value = systemRowData.value.approvalLines[0];
      selectedApprovalLineId.value = systemRowData.value.approvalLines[0];
      onApprovalLineSelected();
    } else {
      originalApprovalLineId.value = '';
      selectedApprovalLineId.value = '';
      approvalLine.value = [];
    }

    console.log('원본 결재선 ID:', originalApprovalLineId.value);
  };

  const onResetDetailsInfo = () => {
    console.log('onResetDetailsInfo');

    console.log('userInfo : ', userInfo.value);

    const lastModifier = `${userInfo.value.userNm}(${userInfo.value.userId})`;

    const sysdate = new Date();

    const formatDate = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      const ss = String(date.getSeconds()).padStart(2, '0');

      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    };

    const formattedDateTime = formatDate(sysdate);
    const formattedDateOnly = formattedDateTime.split(' ')[0];

    systemData.instituteId = selectSystemInstituteId;
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
    systemData.lastModifyDate = formattedDateTime;
    selectDictionaryId.value = '';

    // 결재선 관련 초기화
    originalApprovalLineId.value = '';
    selectedApprovalLineId.value = '';
    approvalLine.value = [];
    isApprovalLineRemoved.value = false;
  };

  const regType = ref(0);
  const regText = computed(() => {
    return regType.value === 0 ? '조회' : regType.value === 1 ? '추가' : '수정';
  });

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

      console.log('systemData : ', systemData);

      const systemInfo = {
        instituteId: systemData.instituteId,
        informationSystemName: systemData.informationSystemName,
        constructDate: systemData.constructDate,
        standardApplicationYn: systemData.standardApply,
        standardDictionaryId:
          systemData.standardApply === false
            ? null
            : systemData.standardDictionaryId,
        approvalLineId: selectedApprovalLineId.value || null,
      };

      console.log('업무 저장 systemInfo (결재선 포함):', systemInfo);

      const response = await addInformationSystem(systemInfo);

      if (response.status === 201) {
        console.log('add-response : ', response);
        systemStore.setSaveState(1);
        systemStore.setNewSystemId(response.data.informationSystemId);

        const data = {
          systemId: response.data.informationSystemId,
          instituteId: systemData.instituteId,
        };

        if (selectedApprovalLineId.value) {
          console.log('결재선이 선택되었습니다:', selectedApprovalLineId.value);

          // 결재선 추가 처리
          const addData = {
            instituteId: systemData.instituteId,
            informationSystemId: response.data.informationSystemId,
            approvalLineId: selectedApprovalLineId.value,
          };
          await addApprovalLineForSystem(addData);
        }
        fetchData(data);
        regType.value = 0;

        onOpenDatabaseMappingWindow();
      }
    } else if (regType.value === 2) {
      // 수정 모드 - 결재선 변경 처리 로직 추가
      console.log('수정 저장 실행');
      console.log('원본 결재선 ID:', originalApprovalLineId.value);
      console.log('현재 결재선 ID:', selectedApprovalLineId.value);
      console.log('결재선 삭제 플래그:', isApprovalLineRemoved.value);

      // 시스템 정보 업데이트
      const data = {
        systemId: systemData.systemId,
        instituteId: systemData.instituteId,
        systemInfo: {
          instituteId: systemData.instituteId,
          informationSystemName: systemData.informationSystemName,
          constructDate: systemData.constructDate,
          standardApplicationYn: systemData.standardApply,
          standardDictionaryId:
            systemData.standardApply === false
              ? null
              : systemData.standardDictionaryId,
          approvalLineId: selectedApprovalLineId.value || null,
        },
      };

      // 결재선 변경 처리
      try {
        // 1. 기존 결재선이 있었는데 삭제된 경우
        if (originalApprovalLineId.value && isApprovalLineRemoved.value) {
          console.log('결재선 삭제 처리');
          const removeData = {
            instituteId: systemData.instituteId,
            informationSystemId: systemData.systemId,
            approvalLineId: originalApprovalLineId.value, // 기존 결재선 ID 사용
          };
          await removeApprovalLineForSystem(removeData);
        }
        // 2. 새로운 결재선이 선택된 경우
        else if (selectedApprovalLineId.value) {
          // 기존 결재선과 다른 결재선으로 변경된 경우
          if (
            originalApprovalLineId.value &&
            originalApprovalLineId.value !== selectedApprovalLineId.value
          ) {
            console.log('결재선 변경 처리: 기존 삭제 후 새로 추가');

            // 기존 결재선 삭제
            const removeData = {
              instituteId: systemData.instituteId,
              informationSystemId: systemData.systemId,
              approvalLineId: originalApprovalLineId.value,
            };
            await removeApprovalLineForSystem(removeData);
          }

          // 새로운 결재선 추가 (기존에 없었거나 변경된 경우)
          if (
            !originalApprovalLineId.value ||
            originalApprovalLineId.value !== selectedApprovalLineId.value
          ) {
            console.log('새로운 결재선 추가');
            const addData = {
              instituteId: systemData.instituteId,
              informationSystemId: systemData.systemId,
              approvalLineId: selectedApprovalLineId.value,
            };
            await addApprovalLineForSystem(addData);
          }
        }

        // 시스템 정보 업데이트
        const response = await modifyInfomationSystem(data);

        if (response.status === 200) {
          console.log('시스템 정보 수정 완료');
          systemStore.setSaveState(2);
          systemStore.setNewSystemId(systemData.systemId);

          // 상태 초기화
          originalApprovalLineId.value = selectedApprovalLineId.value;
          isApprovalLineRemoved.value = false;

          regType.value = 0;

          // 데이터 다시 조회하여 최신 상태 반영
          const refreshData = {
            systemId: systemData.systemId,
            instituteId: systemData.instituteId,
          };
          fetchData(refreshData);
        }
      } catch (error) {
        console.error('결재선 처리 중 오류 발생:', error);
        alert(
          '결재선 처리 중 오류가 발생했습니다: ' + (error.message || error)
        );
      }
    }
  };

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
      instituteId: systemData.instituteId,
    };

    const response = await deleteInfomationSystem(data);

    if (response.status === 200) {
      systemStore.setDeleteState(true);
    }
  };

  // 🔥 fetchData에서도 안전성 개선
  const fetchData = async (data) => {
    console.log('fetchData : ', data);

    const params = {
      systemId: data.systemId || data.informationSystemId,
      instituteId: data.instituteId,
    };

    try {
      const systemDetails = await getSystemDetails(params);
      console.log('systemDetails : ', systemDetails);

      systemRowData.value = systemDetails;

      // 🔥 결재선 옵션이 로드된 후에 바인딩
      if (approvalLineOptions.value.length > 0) {
        bindSystemData(systemDetails);
      } else {
        // 결재선 옵션이 아직 로드되지 않은 경우 잠시 후 재시도
        console.log('결재선 옵션 로딩 대기 중...');
        setTimeout(() => {
          bindSystemData(systemDetails);
        }, 100);
      }
    } catch (error) {
      console.error('시스템 상세 정보 조회 중 오류 발생:', error);
    }
  };

  const bindSystemData = (systemDetails) => {
    // 🔥 결재선 관련 초기화 - 조건부로 변경
    isApprovalLineRemoved.value = false;

    systemData.instituteId = selectSystemInstituteId;
    systemData.systemId = systemDetails.informationSystemId;
    systemData.informationSystemName = systemDetails.informationSystemName;
    systemData.constructDate = systemDetails.constructDate;
    systemData.standardApply = systemDetails.standardApplicationYn;
    systemData.standardDictionaryId = systemDetails.standardDictionaryId;
    selectDictionaryId.value = systemDetails.standardDictionaryId;
    systemData.lastModifier = systemDetails.updater;
    systemData.lastModifyDate = systemDetails.updateDateTime;

    console.log('systemData : ', systemData);

    // 🔥 수정된 결재선 데이터 바인딩
    if (systemDetails.approvalLines && systemDetails.approvalLines.length > 0) {
      const approvalLineId = systemDetails.approvalLines[0];
      originalApprovalLineId.value = approvalLineId;
      selectedApprovalLineId.value = approvalLineId;

      console.log('결재선이 바인딩되었습니다:', {
        original: originalApprovalLineId.value,
        selected: selectedApprovalLineId.value,
      });

      // 🔥 즉시 결재선 데이터 로드 (nextTick 제거)
      onApprovalLineSelected();
    } else {
      // 🔥 결재선이 없는 경우에만 초기화
      originalApprovalLineId.value = '';
      selectedApprovalLineId.value = '';
      approvalLine.value = [];

      console.log('결재선이 없습니다.');
    }
  };

  const popInfo = ref({
    state: 'confirm',
    popTitle: '에러 제목',
    popMessages: '에러 메시지',
  });

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

  const editDatabaseSchemaWindowState = ref(false);
  const onCloseEditDatabaseSchemaWindow = () => {
    editDatabaseSchemaWindowState.value = false;
  };
  const onOpenEditDatabaseSchemaWindow = () => {
    isAddnewSystem.value = true;
    onCloseDatabaseMappingWindow();
  };

  const onIsAddnewSystem = () => {
    isAddnewSystem.value = true;
    onCloseDatabaseMappingWindow();
  };

  const onResetIsAddNewSystem = () => {
    isAddnewSystem.value = false;
  };

  // 🔥 onBeforeMount에서 데이터 로드 순서 개선
  onBeforeMount(async () => {
    console.log('onBeforeMount');

    try {
      // 🔥 먼저 결재선 목록을 로드
      const approvalLineList = await getApprovalLineList(useMetaMngInstId);
      console.log('approvalLineList : ', approvalLineList);
      loadApprovalLineOptions(approvalLineList);

      // 그 다음 사전 데이터 로드
      const dictionaryTree = await getDictionaryTree(useMetaMngInstId);
      console.log('dictionaryTree : ', dictionaryTree);

      userDctnryListInfo.value = dictionaryTree
        .filter(
          (item) =>
            item.dictionaryId !== null && item.dictionaryId !== undefined
        )
        .map((item) => {
          return {
            id: item.dictionaryId,
            name: item.dictionaryName,
            selected: false,
          };
        });

      const selectedInst = metaMngInstList.find(
        (items) => items.id === selectInstitute.id
      );
      if (selectedInst) {
        selectInstitute.id = selectedInst.id;
        selectInstitute.name = selectedInst.name;
      }
    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
    }
  });

  watch(selectSystem, (value) => {
    console.log('selectSystem', value);

    if (value.id === '0' || value.id === null) {
      onSelectReg(1);
    } else {
      console.log('watch 조회 실행 ? ');
      onSelectReg(0);
      fetchData(value);
    }
  });

  watch(selectSystemInstituteId, async (newValue) => {
    console.log('기관 변경됨', newValue);

    const dictionaryList = await getParentDictionaryList(useMetaMngInstId, 0);

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

  /* .td-col select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: white;
    color: #333;
    appearance: auto;
    -webkit-appearance: menulist;
    -moz-appearance: menulist;
    cursor: pointer;
  } */

  .td-col select:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }

  .td-col select:focus {
    outline: none;
    border-color: #379583;
    box-shadow: 0 0 0 2px rgba(55, 149, 131, 0.2);
  }

  .reset-approval-line {
    /* padding: 6px 12px; */
    background: #9c8587;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-width: 50px;
  }

  .reset-approval-line:hover {
    background: #a7878a;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
  }

  .reset-approval-line:active {
    transform: translateY(0);
  }
</style>
