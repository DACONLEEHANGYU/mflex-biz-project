<template>
  <div class="input-top">
    <div class="title-top">
      <div class="title-s">
        <div class="title-s-left">
          상세 정보
          <AppTooltip>
            <div>
              Mflex에서 관리하고 있는 표준사전에 변경이 <br />
              필요한 경우, 표준데이터의 신규, 변경, 삭제 <br />
              작업을 하는 기능입니다.
            </div>
          </AppTooltip>
        </div>
        <div class="btns" style="display: flex">
          <button
            class="btn-s add-reg"
            @click="onSelectReg(0)"
            title="신규등록"
          >
            신규등록
          </button>
          <button
            v-if="
              termDetailsData.selectType.type === 'job-new' ||
              termDetailsData.selectType.type === 'new' ||
              termDetailsData.selectType.type === 'modify' ||
              termDetailsData.selectType.type === 'remove'
            "
            class="btn-s change-reg"
            @click="onSelectReg(4)"
            title="변경등록"
            disabled
          >
            작업수정
          </button>
          <button
            v-if="
              termDetailsData.selectType.type === 'job-new' ||
              termDetailsData.selectType.type === 'new' ||
              termDetailsData.selectType.type === 'modify' ||
              termDetailsData.selectType.type === 'remove'
            "
            class="btn-s remove-reg"
            @click="onSelectReg(2)"
            title="삭제등록"
            disabled
          >
            삭제등록
          </button>
          <button
            v-if="
              termDetailsData.selectType.type === 'restore' ||
              termDetailsData.selectType.type === 'delete'
            "
            class="btn-s restore-reg"
            disabled
            @click="onSelectReg(4)"
            title="복구등록"
          >
            복구등록
          </button>
          <button
            v-if="
              termDetailsData.selectType.type === 'restore' ||
              termDetailsData.selectType.type === 'delete'
            "
            class="btn-s delete-reg"
            disabled
            @click="onSelectReg(5)"
            title="삭제등록"
          >
            삭제등록
          </button>
        </div>
      </div>
      <div class="title-btns__row_btween">
        <div class="btns">
          <button
            class="btn-s green save-btn"
            title="저장"
            :disabled="
              termDetailsData.termName.label === '' ||
              termDetailsData.selectType.type === 'search' ||
              termDetailsData.selectType.type === 'remove' ||
              termDetailsData.selectType.type === 'restore' ||
              termDetailsData.selectType.type === 'delete' ||
              termDetailsData.jobState
            "
            @click="onSaveConfirm"
          >
            저장
          </button>
          <button
            class="btn-s delete-btn"
            title="취소"
            :disabled="
              termDetailsData.termName.label === '' ||
              termDetailsData.selectType.type === 'search' ||
              termDetailsData.selectType.type === 'remove' ||
              termDetailsData.selectType.type === 'restore' ||
              termDetailsData.selectType.type === 'delete'
            "
            @click="onCancelConfirm"
          >
            취소
          </button>
          <button
            class="btn-s reset-btn"
            title="초기화"
            :disabled="
              termDetailsData.termName.label === '' ||
              termDetailsData.selectType.type === 'search' ||
              termDetailsData.selectType.type === 'remove' ||
              termDetailsData.selectType.type === 'restore' ||
              termDetailsData.selectType.type === 'delete'
            "
            @click="onResetConfirm"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="inputs-wrap" :class="{ 'highlight-effect': showAnimate }">
    <div class="input-form">
      <table class="input-table">
        <colgroup>
          <col width="15%" />
          <col width="" />
        </colgroup>
        <tbody>
          <tr>
            <th class="required">*작업구분</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div
                  class="application-category__icon"
                  :class="termDetailsData.selectType.type"
                >
                  {{ termDetailsData.selectType.label }}
                </div>
              </div>
            </td>
            <th class="required">*제개정일자</th>
            <td>
              <div class="td-col manage-input-div">
                <div>
                  <input
                    class="input-date"
                    type="date"
                    placeholder=""
                    style="width: 100%; margin-right: 10px"
                    v-model="termDetailsData.revisionDate"
                    :disabled="
                      termDetailsData.selectType.type === 'search' ||
                      termDetailsData.selectType.type === 'remove'
                    "
                  />
                  <!-- <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 30%"
                    v-model="termDetailsData.revisionCycle"
                    :disabled="
                      termDetailsData.selectType.type === 'search' ||
                      termDetailsData.selectType.type === 'remove'
                    "
                  /> -->
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*용어명</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.termName"
                  :readonly="disableState"
                />
              </div>
            </td>
            <th class="required">*용어유형</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div>
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="termDetailsData.termType"
                    readonly
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*표준구분</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div class="flex-radio">
                  <div>
                    <input
                      v-model="termDetailsData.standardDivision"
                      type="radio"
                      name="standardDivision"
                      id="standard"
                      value="Y"
                      :disabled="disableState"
                    />
                    <label for="standard">표준</label>
                  </div>
                  <div>
                    <input
                      v-model="termDetailsData.standardDivision"
                      type="radio"
                      name="standardDivision"
                      id="none-standard"
                      value="N"
                      :disabled="disableState"
                    />
                    <label for="none-standard">비표준</label>
                  </div>
                </div>
              </div>
            </td>
            <th
              class="required"
              v-if="termDetailsData.standardDivision === 'N'"
            >
              *비표준사유
            </th>
            <th v-else-if="termDetailsData.standardDivision === 'Y'">
              비표준사유
            </th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div>
                  <select
                    class="input-select"
                    v-model="selectNonStandardReason"
                    style="width: 100%"
                    :disabled="
                      disableState || termDetailsData.standardDivision === 'Y'
                    "
                  >
                    <option
                      v-for="option in nonStandardReasonOptions"
                      :value="option.value"
                      :key="option.value"
                    >
                      {{ option.text }}
                    </option>
                  </select>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*용어영문약어명</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.termAbbreviationName"
                  :readonly="disableState"
                />
                <button
                  class="btn-s dark-gray ml5"
                  @click="onOpenTermDivideWindow"
                  :disabled="disableState"
                >
                  자동단어분할
                </button>
              </div>
            </td>
          </tr>
          <!-- <tr>
            <th>용어영문명</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col">
                <div class="col-row">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="termDetailsData.termEnglishName"
                    :readonly="
                      termDetailsData.selectType.type === 'search' ||
                      termDetailsData.selectType.type === 'remove'
                    "
                  />
                </div>
              </div>
            </td>
          </tr> -->
          <tr>
            <th class="required">*도메인분류명</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <!-- <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.domainClassName"
                  :readonly="disableState"
                /> -->
                <div class="input-vison-div">
                  {{ termDetailsData.domainClassName }}
                </div>
              </div>
            </td>
            <th class="required">*도메인명</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <!-- <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.domainName"
                  :readonly="disableState"
                /> -->
                <div class="input-vison-div">
                  {{ termDetailsData.domainName }}
                </div>
                <button
                  class="btn-s search-btn dark-gray ml5"
                  @click="onOpenDomainNameSearchWindow"
                  :disabled="disableState"
                  title="도메인명 검색"
                >
                  검색
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*용어설명</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col">
                <textarea
                  style="height: 90px"
                  :readonly="
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove' ||
                    termDetailsData.selectType.type === 'restore' ||
                    termDetailsData.selectType.type === 'delete'
                  "
                  v-model="termDetailsData.termExplain"
                  placeholder="설명을 입력하세요"
                ></textarea>
              </div>
            </td>
          </tr>
          <tr>
            <th>코드유형</th>
            <td colspan="" class="manage-input-form-td">
              <div class="td-col">
                <div>
                  <select
                    class="input-select"
                    v-model="selectCodeType"
                    style="width: 100%"
                    :disabled="
                      !isCodeType ||
                      termDetailsData.selectType.type === 'search' ||
                      termDetailsData.selectType.type === 'remove'
                    "
                  >
                    <option
                      v-for="option in codeTypeOptions"
                      :value="option.value"
                      :key="option.value"
                    >
                      {{ option.text }}
                    </option>
                  </select>
                </div>
              </div>
            </td>
            <th>코드명</th>
            <td colspan="" class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <div
                  class="input-vison-div"
                  v-if="termDetailsData.codeTypeName === 'UNITY_CODE'"
                >
                  {{ termDetailsData.codeName }}
                </div>
                <input
                  v-else
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.codeName"
                  :readonly="
                    !isCodeType ||
                    !termDetailsData.codeTypeName ||
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove'
                  "
                />
                <button
                  class="btn-s search-btn dark-gray ml5"
                  @click="onOpenSearchUnityCodeWindow"
                  :disabled="
                    !isCodeType ||
                    !termDetailsData.codeTypeName ||
                    termDetailsData.codeTypeName === 'INDIVIDUAL_CODE' ||
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove'
                  "
                  title="통합코드명 검색"
                >
                  검색
                </button>
              </div>
            </td>
          </tr>

          <!-- <tr>
            <th>개별코드명</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.individualCodeName"
                  :disabled="
                    !isCodeType ||
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove'
                  "
                />
              </div>
            </td>
            <th>통합코드명</th>
            <td colspan="" class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.unityCodeName"
                  :readonly="
                    !isCodeType ||
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove'
                  "
                />
                <button
                  class="btn-s dark-gray ml5"
                  @click="onOpenSearchUnityCodeWindow"
                  :disabled="
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove' ||
                    !isCodeType
                  "
                >
                  검색
                </button>
              </div>
            </td>
          </tr> -->
          <!-- <tr>
            <th>데이터단위명</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.dataUnitName"
                  :readonly="
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove'
                  "
                />
              </div>
            </td>
            <th>데이터허용값</th>
            <td colspan="" class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.dataPermissionValue"
                  :readonly="
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove'
                  "
                />
              </div>
            </td>
          </tr> -->
          <tr>
            <th>관리부서명</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.managementDepartmentName"
                  :readonly="
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove' ||
                    termDetailsData.selectType.type === 'restore' ||
                    termDetailsData.selectType.type === 'delete'
                  "
                />
              </div>
            </td>
            <th>업무분야명</th>
            <td colspan="" class="manage-input-form-td">
              <div class="td-col">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.taskFieldName"
                  :readonly="
                    termDetailsData.selectType.type === 'search' ||
                    termDetailsData.selectType.type === 'remove' ||
                    termDetailsData.selectType.type === 'restore' ||
                    termDetailsData.selectType.type === 'delete'
                  "
                />
              </div>
            </td>
          </tr>

          <tr>
            <th>최종수정자</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                {{ userInfo.userId }}
              </div>
            </td>
            <th>최종수정일시</th>
            <td colspan="" class="manage-input-form-td">
              <div class="td-col">
                {{ updateDateTime }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 저장 알림창 -->
    <AppDialog
      v-model:view="saveConfirmState.view"
      :title="saveConfirmState.title"
      :message="saveConfirmState.message"
      @confirm="onTermIntegrityCheck"
    />

    <!-- 취소 알림창 -->
    <AppDialog
      v-model:view="cancelConfirmState.view"
      :title="cancelConfirmState.title"
      :message="cancelConfirmState.message"
      @confirm="onCancel"
    />

    <!-- 초기화 알림창 -->
    <AppDialog
      v-model:view="resetConfirmState.view"
      :title="resetConfirmState.title"
      :message="resetConfirmState.message"
      @confirm="onReset"
    />
    <!-- 자동단어분할 팝업 -->
    <AppWindow
      :view="termDivideWindowView"
      :moveState="true"
      @close="onCloseTermDivideWindow"
      width="1000px"
      height="auto"
    >
      <TermDivideWindow
        :termDivideQuery="termDivideQuery"
        :termName="termDetailsData.termName"
        @confirm="onTermDivideSave"
        @close="onCloseTermDivideWindow"
      />
    </AppWindow>
    <!-- 도메인명 검색창 -->
    <AppWindow
      :view="domainNameSearchWindowView"
      :moveState="true"
      @close="onCloseDomainNameSearchWindow"
      width="600px"
      height="auto"
    >
      <DomainNameSearchWindow
        :requestPrams="domainRequestPrams"
        @confirm="onDomainNameSearchSave"
        @close="onCloseDomainNameSearchWindow"
      />
    </AppWindow>

    <!-- 통합코드명 검색팝업 -->
    <AppWindow
      :view="searchUnityCodeWindowView"
      :moveState="true"
      @close="onCloseSearchUnityCodeWindow"
      width="700px"
      height="auto"
    >
      <SearchUnityCodeWindow
        @confirm="onSearchUnityCodeWindowSave"
        @close="onCloseSearchUnityCodeWindow"
      />
    </AppWindow>

    <!-- 기타 사유 입력 팝업-->
    <AppWindow
      :view="additionalReasonsWindowView"
      @close="onCloseAdditionalReasonsWindow"
      width="550px"
      height="auto"
    >
      <AdditionalReasonsWindow
        @confirm="onAdditionalReasonsSave"
        @close="onCloseAdditionalReasonsWindow"
      />
    </AppWindow>

    <!-- 무결성 체크 팝업-->
    <AppWindow
      :view="termValidationErrorWindowView"
      @close="onCloseTermValidationErrorWindow"
      width="700px"
      height="auto"
    >
      <TermValidationErrorWindow
        :errorMessage="termValidationErrorMessaages"
        @confirm="onTermValidationErrorSave"
        @close="onCloseTermValidationErrorWindow"
      />
    </AppWindow>
  </div>
</template>

<script setup>
  import {
    reactive,
    ref,
    watch,
    computed,
    onMounted,
    onBeforeMount,
  } from 'vue';

  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { useAlert } from '@/composables/alert';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import TermDivideWindow from '@/components/popWindow/TermDivideWindow.vue';
  import DomainNameSearchWindow from '@/components/popWindow/DomainNameSearchWindow.vue';
  import SearchUnityCodeWindow from '@/components/popWindow/SearchUnityCodeWindow.vue';
  import AdditionalReasonsWindow from '@/components/popWindow/AdditionalReasonsWindow.vue';
  import TermValidationErrorWindow from '@/components/popWindow/TermValidationErrorWindow.vue';

  import {
    getUpdateJobTerm,
    getTermDivide, // 자동단어분할
    createNewTerm, // 신규등록
    termManagementDataBinding,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import {
    getNonStandardReasonCode, // 비표준사유코드 조회
    getTermCheckIntegrityV2, // 용어 무결성 체크
    manageTermV2, // 용어 등록
    updateTermV2, // 작업용어 수정
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';

  const dictionaryMngStore = useDictionaryMngStore();
  const { setIsTermJobSave, setIsTermJobApproval, setIsTermJobCancel } =
    dictionaryMngStore;
  const { termJobUpdateData } = storeToRefs(dictionaryMngStore);

  const actualizingStore = useActualizingStore();
  const { selectTermData, selectTermJobData } = storeToRefs(actualizingStore);

  const authStore = useAuthStore();
  const { setAlertStatus, alertInfos } = useAlert();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
    userStngInfo.value;

  const showAnimate = ref(false);

  const updater = userInfo.value.userId;
  const updateDateTime = new Date().toISOString().split('T')[0];

  const CODE_TYPE = '코드';

  // 비표준사유
  const nonStandardReasonOptions = reactive([{ value: '0', text: '선택' }]);

  onBeforeMount(async () => {
    if (nonStandardReasonOptions.length > 2) {
      return;
    }

    const data = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      jobTypeCode: 'STD',
    };

    const nonStandardReasonList = await getNonStandardReasonCode(data);

    console.log('nonStandardReasonList : ', nonStandardReasonList);

    // value가 같은 경우를 추적하기 위한 맵
    const valueCountMap = new Map();

    nonStandardReasonList.data.forEach((item) => {
      // 현재 value의 카운트를 가져오거나 초기화
      const count = valueCountMap.get(item.code) || 0;
      // 카운트 증가
      valueCountMap.set(item.code, count + 1);

      nonStandardReasonOptions.push({
        value: count > 0 ? `${item.code}_${count}` : item.code, // 중복되는 경우 suffix 추가
        text: item.name,
        originalValue: item.code, // 원본 value 값 보존
      });
    });

    console.log('nonStandardReasonOptions : ', nonStandardReasonOptions);
  });

  const selectNonStandardReason = ref(nonStandardReasonOptions[0].value);

  // 코드유형
  const codeTypeOptions = [
    { value: null, text: '선택' },
    { value: 'INDIVIDUAL_CODE', text: '개별코드' },
    { value: 'UNITY_CODE', text: '통합코드' },
  ];

  const selectCodeType = ref(codeTypeOptions[0].value);

  // 수정불가 상태
  const disableState = computed(() => {
    return (
      // termDetailsData.standardDivision === 'Y' ||
      termDetailsData.selectType.type === 'search' ||
      termDetailsData.selectType.type === 'modify' ||
      termDetailsData.selectType.type === 'remove' ||
      termDetailsData.selectType.type === 'restore' ||
      termDetailsData.selectType.type === 'delete'
    );
  });

  // 코드도메인 여부 확인
  const isCodeType = computed(() => {
    return termDetailsData.domainClassName === CODE_TYPE;
  });

  // 용어 데이터 양식
  const termDetailsData = reactive({
    jobDivisionName: '',
    jobTermId: '',
    selectType: { id: 3, label: '자료조회', type: 'search' },
    managementInstituteId: useMetaMngInstId,
    termDictionaryId: useDctnryId,
    termName: '',
    standardDivision: 'Y',
    domainClassName: '',
    selectNonStandardReason: selectNonStandardReason,
    discardYn: false,
    termType: '',
    termTypeCode: '',
    termEnglishName: '',
    termAbbreviationName: '',
    domainClassInfo: {},
    domainName: '',
    termExplain: '',
    codeTypeName: selectCodeType,
    individualCodeName: '',
    unityCodeName: '',
    unityCodeDictionaryId: null,
    logicalDataTypCode: '',
    dataLength: null,
    dataDecimalPointLength: null,
    nonStandardReasonContents: '',
    dataUnitName: '',
    dataPermissionValue: '',
    managementDepartmentName: '',
    taskFieldName: '',
    storageFormatContext: '',
    expressionFormatContext: '',
    revisionDate: '',
    revisionCycle: '',
    enactContext: '',
    updater: '',
    updateDateTime: '',
    revisionInfo: '',
    relationColumnYn: false,
    jobState: false,
  });

  //저장 팝업
  const saveConfirmState = reactive({
    view: false,
    message: '작업 내용을 저장하시겠습니까?',
  });

  const relationColumnState = reactive({
    title: '연관컬럼 오류메세지',
    view: false,
    type: 'relationColumn',
    message:
      '연관컬럼이 있어 해당 작업은 실행이 불가능 합니다. <br>작업을 취소하고연관컬럼 변경/삭제 처리를 먼저 수행해 주시기 바랍니다.',
  });

  const regType = reactive([
    { id: 0, label: '신규등록', type: 'new' },
    { id: 1, label: '변경등록', type: 'modify' },
    { id: 2, label: '폐기등록', type: 'remove' },
    { id: 3, label: '자료조회', type: 'search' },
    { id: 4, label: '복구등록', type: 'restore' },
    { id: 5, label: '삭제등록', type: 'delete' },
  ]);

  // 작업선택 함수
  const onSelectReg = (value) => {
    console.log('termDetailsData : ', termDetailsData);

    termDetailsData.selectType = {
      id: 0,
      label: '신규등록',
      type: 'job-new',
    };

    emptyTermDetailsData();
  };

  // 기타 사유 추가 팝업
  const additionalReasonsWindowView = ref(false);

  const onOpenAdditionalReasonsWindow = () => {
    additionalReasonsWindowView.value = true;
  };

  const onCloseAdditionalReasonsWindow = () => {
    additionalReasonsWindowView.value = false;
  };

  const onAdditionalReasonsSave = (data) => {
    additionalReasonsWindowView.value = false;

    console.log('비표준사유 기타 저장 data : ', data);

    nonStandardReasonOptions.filter(
      (item) => item.value === '90'
    )[0].text = `기타(${data})`;

    termDetailsData.nonStandardReasonContents = data;
  };

  // Input Data 초기화
  const emptyTermDetailsData = () => {
    termDetailsData.selectType = {
      id: 0,
      label: '신규등록',
      type: 'job-new',
    };
    termDetailsData.termName = '';
    termDetailsData.termType = '일반어';
    termDetailsData.termTypeCode = '10';
    termDetailsData.standardDivision = 'Y';
    termDetailsData.termAbbreviationName = '';
    termDetailsData.domainName = '';
    termDetailsData.termExplain = '';
    termDetailsData.codeTypeName = null;
    termDetailsData.codeName = '';
    termDetailsData.domainClassName = '';
    termDetailsData.managementDepartmentName = '';
    termDetailsData.taskFieldName = '';
    termDetailsData.revisionDate = updateDateTime;
    termDetailsData.revisionCycle = '';
    termDetailsData.updater = updater;
    termDetailsData.updateDateTime = updateDateTime;
    termDetailsData.revisionInfo = '';
    termDetailsData.relationColumnYn = false;
    termDetailsData.jobState = false;
  };

  const onSaveConfirm = () => {
    console.log('용어명 데이터 termDetailsData : ', termDetailsData);

    // 용어명 공백 또는 특수문자 체크 정규식
    const invalidTermNameRegex = /[\s]|[^a-zA-Z0-9가-힣]/;

    // 용어영문약어명 공백 체크 정규식
    const emptySpaceRegex = /[\s]/;

    if (termDetailsData.termName === '') {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '<span style="font-weight:600;">용어명</span>을 입력하세요.';
      return;
    } else if (
      (termDetailsData.revisionDate === '' &&
        termDetailsData.revisionCycle === '' &&
        termDetailsData.selectType.type === 'new') ||
      (termDetailsData.revisionDate === '' &&
        termDetailsData.revisionCycle === '' &&
        termDetailsData.selectType.type === 'modify')
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message = '제개정일자를 입력하세요.';
      return;
    } else if (
      termDetailsData.standardDivision === 'N' &&
      (selectNonStandardReason.value === 0 ||
        selectNonStandardReason.value === '' ||
        selectNonStandardReason.value === null ||
        selectNonStandardReason.value === '0')
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message = '비표준 용어 등록 시 비표준사유를 선택하세요.';
      return;
    } else if (invalidTermNameRegex.test(termDetailsData.termName)) {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '용어명에는 공백이나 특수문자를 포함할 수 없습니다.';
      return;
    }
    // else if (termDetailsData.termAbbreviationName === '') {
    //   alertInfos.value.view = true;
    //   alertInfos.value.message =
    //     '<span style="font-weight:600;">용어영문약어명</span>을 입력하세요.';
    //   return;
    // }
    else if (!termDetailsData.domainName || termDetailsData.domainName === '') {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '<span style="font-weight:600;">도메인명</span>을 선택하세요.';
      return;
    } else if (
      termDetailsData.termExplain === '' ||
      termDetailsData.termExplain === null
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message = '용어설명을 입력하세요.';
      return;
    } else if (
      termDetailsData.domainClassName === CODE_TYPE &&
      termDetailsData.codeTypeName === null
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '코드 도메인의 경우에는 코드유형을 선택하세요.';
      return;
    } else if (
      termDetailsData.codeTypeName === 'INDIVIDUAL_CODE' &&
      (termDetailsData.codeName === null || termDetailsData.codeName === '')
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '개별코드의 경우에는 개별코드명을 입력해주세요.';
      return;
    } else if (
      termDetailsData.codeTypeName === 'UNITY_CODE' &&
      (termDetailsData.codeName === null || termDetailsData.codeName === '')
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '통합코드의 경우에는 통합코드명을 입력해주세요.';
      return;
    } else if (termDetailsData.termName.length > 30) {
      alertInfos.value.view = true;
      alertInfos.value.message = '용어명은 30자 이하로 입력해주세요.';
      return;
    } else if (emptySpaceRegex.test(termDetailsData.termAbbreviationName)) {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '용어영문약어명에는 공백을 포함할 수 없습니다.';
      return;
    } else if (emptySpaceRegex.test(termDetailsData.domainName)) {
      alertInfos.value.view = true;
      alertInfos.value.message = '도메인명에는 공백을 포함할 수 없습니다.';
      return;
    } else if (termDetailsData.termExplain.length > 160) {
      alertInfos.value.view = true;
      alertInfos.value.message = '용어설명은 160자 이하로 입력해주세요.';
      return;
    } else if (termDetailsData.codeName > 20) {
      alertInfos.value.view = true;
      alertInfos.value.message = '코드명은 20자 이하로 입력해주세요.';
      return;
    } else if (termDetailsData.managementDepartmentName > 20) {
      alertInfos.value.view = true;
      alertInfos.value.message = '관리부서명은 20자 이하로 입력해주세요.';
      return;
    } else if (termDetailsData.taskFieldName > 20) {
      alertInfos.value.view = true;
      alertInfos.value.message = '업무분야명은 20자 이하로 입력해주세요.';
      return;
    }

    // 연관컬럼이 있는 경우
    if (termDetailsData.relationColumnYn) {
      relationColumnState.view = true;
    } else {
      saveConfirmState.view = true;
    }
  };

  const termDivideWindowView = ref(false);

  const onOpenTermDivideWindow = async () => {
    termDivideWindowView.value = true;
  };
  const onCloseTermDivideWindow = () => {
    termDivideWindowView.value = false;
  };
  const onTermDivideSave = (selectRow) => {
    console.log('selectRow : ', selectRow);
    termDetailsData.termAbbreviationName = selectRow.label;
    termDetailsData.domainClassName = selectRow.domainClassName;
    domainRequestPrams.domainClassName = selectRow.domainClassName;
    onCloseTermDivideWindow();
  };

  //도메인명 검색
  const domainNameSearchWindowView = ref(false);
  const onOpenDomainNameSearchWindow = () => {
    domainNameSearchWindowView.value = true;
  };
  const onCloseDomainNameSearchWindow = () => {
    domainNameSearchWindowView.value = false;
  };
  const onDomainNameSearchSave = (selectRow) => {
    console.log('도메인 명 저장');
    console.log('selectRow : ', selectRow);

    const domainName = selectRow.domainName;

    termDetailsData.domainName = domainName;

    // 도메인 클래스 정보 저장
    termDetailsData.domainClassName = selectRow.domainClassName;

    if (termDetailsData.domainClassName != CODE_TYPE) {
      termDetailsData.codeTypeName = null;
      termDetailsData.individualCodeName = null;
      termDetailsData.unityCodeName = '';
    }

    console.log('termDetailsData : ', termDetailsData);
    onCloseDomainNameSearchWindow();
  };

  //통합코드명 검색
  const searchUnityCodeWindowView = ref(false);
  const onOpenSearchUnityCodeWindow = () => {
    searchUnityCodeWindowView.value = true;
  };
  const onCloseSearchUnityCodeWindow = () => {
    searchUnityCodeWindowView.value = false;
  };
  const onSearchUnityCodeWindowSave = (selectRow) => {
    console.log('통합코드명 검색 selectRow : ', selectRow);

    // 연관 코드 정보
    const unityCode = selectRow.unityCodeKoreanName;
    termDetailsData.codeName = unityCode;
    onCloseSearchUnityCodeWindow();
  };

  // 작업 용어 상세 할당
  const apiGetTermJobInfo = async (termDetailsDataInfo) => {
    const waitForOptions = () => {
      if (nonStandardReasonOptions.length > 2) {
        processTermDetails(termDetailsDataInfo);
      } else {
        setTimeout(waitForOptions, 50); // 100ms 후 다시 체크
      }
    };

    const processTermDetails = (termDetailsDataInfo) => {
      console.log('작업용어 apiGetTermJobInfo !!! : ', termDetailsDataInfo);
      const resultData = termDetailsDataInfo.value;
      console.log('resultData ==============', resultData);

      termDetailsData.discardYn = resultData.discardYn;

      termDetailsData.jobTermId = resultData.jobTermId;
      termDetailsData.dictionaryId = resultData.dictionaryId;
      termDetailsData.discardYn = resultData.discardYn;
      termDetailsData.instituteId = resultData.instituteId;

      termDetailsData.selectType = regType[3];

      if (resultData.jobDivisionCode === 'C') {
        termDetailsData.selectType = regType[0];
      } else if (resultData.jobDivisionCode === 'U') {
        termDetailsData.selectType = regType[1];
      } else if (resultData.jobDivisionCode === 'X') {
        termDetailsData.selectType = regType[2];
      } else if (resultData.jobDivisionCode === 'V') {
        termDetailsData.selectType = regType[4];
      } else if (resultData.jobDivisionCode === 'D') {
        termDetailsData.selectType = regType[5];
      }

      termDetailsData.managementInstituteId = useMetaMngInstId;
      termDetailsData.termDictionaryId = resultData.dictionaryId;
      // 용어 정보
      termDetailsData.termName = resultData.termName;

      console.log('termDetailsData.termName : ', termDetailsData.termName);
      termDetailsData.termType = resultData.termTypeName;
      termDetailsData.termTypeCode = resultData.termTypeCode;

      // 도메인 정보
      termDetailsData.domainName = resultData.domainName;
      termDetailsData.domainClassName = resultData.domainClassName;

      termDetailsData.termExplain = resultData.termExplain;
      termDetailsData.termAbbreviationName = resultData.termAbbreviationName; // 용어영문약어명

      termDetailsData.revisionCycle = resultData.revisionCycle;
      termDetailsData.revisionDate = resultData.revisionDate;
      termDetailsData.managementDepartmentName =
        resultData.managementDepartmentName;

      if (
        resultData.revisionCycle === null ||
        resultData.revisionCycle === ''
      ) {
        termDetailsData.revisionInfo = resultData.revisionDate;
      } else {
        termDetailsData.revisionInfo = `${resultData.revisionDate}(${resultData.revisionCycle})`;
      }
      //termDetailsData.revisionInfo = `${resultData.revisionDate}(${resultData.revisionCycle})`;
      termDetailsData.taskFieldName = resultData.taskFieldName;

      // 코드타입 설정
      if (resultData.codeTypeCode === '10') {
        selectCodeType.value = 'INDIVIDUAL_CODE';
      } else if (resultData.codeTypeCode === '20') {
        selectCodeType.value = 'UNITY_CODE';
      } else {
        selectCodeType.value = null;
      }
      termDetailsData.individualCodeName = resultData.individualCodeName;

      termDetailsData.unityCodeName = resultData.unityCodeName;

      termDetailsData.standardDivision =
        resultData.termStandardYn === true ? 'Y' : 'N'; // 표준여부부
      termDetailsData.nonStandardReasonContents =
        resultData.nonStandardRessonContents;
      termDetailsData.nonStandardReasonCode = resultData.nonStandardReasonCode;

      // 통합코드인 경우
      if (resultData.codeTypeCode === '20') {
        termDetailsData.codeName = resultData.unityCodeName;
      } else {
        termDetailsData.codeName = resultData.individualCodeName;
      }

      termDetailsData.updateDateTime = resultData.updateDateTime;
      termDetailsData.updater = resultData.updater;
      // termDetailsData.relationColumnYn = relationColumnYn.value;
      termDetailsData.jobDivisionName = resultData.jobDivisionName;
      termDetailsData.jobDivisionCode = resultData.jobDivisionCode;
      termDetailsData.jobTermId = resultData.jobTermId;

      // 없는경우 초기화
      // const matchReason = nonStandardReasonOptions.filter((item) => {
      //   return item.text === resultData.nonStandardReasonName;
      // });

      // console.log('matchReason :', matchReason);
      // termDetailsData.selectNonStandardReason = matchReason[0].value;
      // selectNonStandardReason.value = matchReason[0].value;

      if (resultData.nonStandardReasonName) {
        let matchReason = nonStandardReasonOptions.filter((item) => {
          return item.text === resultData.nonStandardReasonName;
        });

        console.log('nonStandardReasonName match: ', matchReason);

        if (!matchReason) {
          matchReason = nonStandardReasonOptions.filter((item) => {
            return item.text === resultData.nonStandardReasonContents;
          });
        }

        console.log('matchReason :', matchReason);
        termDetailsData.selectNonStandardReason = matchReason[0].value;
        selectNonStandardReason.value = matchReason[0].value;
      } else {
        termDetailsData.nonStandardReasonCode =
          resultData.nonStandardReasonCode;
        termDetailsData.nonStandardRessonContents =
          resultData.nonStandardRessonContents;
        selectNonStandardReason.value = resultData.nonStandardReasonCode;
      }

      termDetailsData.jobTypeCode = resultData.jobTypeCode;

      console.log('!!!termDetailsData =======', termDetailsData);
    };

    // 실행 시작
    waitForOptions();
  };

  const ERROR_MESSAGES = {
    10: '용어 구성단어에서 존재하지 않는 단어가 있습니다.',
    20: '용어의 구성단어에서 분류단어가 존재하지 않습니다.',
    30: '용어의 구성단어에서 대체어가 사용되고 있습니다.',
    40: '용어의 구성단어에서 금칙어가 사용되고 있습니다.',
    50: '용어의 구성단어 중 폐기등록된 단어가 존재합니다..',
    60: '용어의 마지막 단어 유형이 분류단어가 아닙니다.',
    70: '용어의 도메인분류명과 입력한 도메인 분류명이 다릅니다.',
  };

  const termValidationErrorMessaages = ref('');

  const getUniqueErrorMessages = (errorList, maxMessages = 2) => {
    // 중복 제거 후, null 또는 undefined 값 제외
    const uniqueErrors = [...new Set(errorList)].filter(Boolean);

    // maxMessages 개수만큼 에러 메시지 배열 반환
    return uniqueErrors
      .slice(0, maxMessages)
      .map((code) => ERROR_MESSAGES[code] || `알 수 없는 에러(코드: ${code})`);
  };

  // 용어 무결성 체크
  const onTermIntegrityCheck = async () => {
    console.log('용어무결성체크 실행');
    console.log('termDetailsData : ', termDetailsData);

    if (termDetailsData.standardDivision === 'Y') {
      const integritData = {
        instituteId: termDetailsData.managementInstituteId,
        dictionaryId: termDetailsData.termDictionaryId,
        termName: termDetailsData.termName,
        termAbbreviationName: termDetailsData.termAbbreviationName,
        domainName: termDetailsData.domainName,
      };

      const integritResponse = await getTermCheckIntegrityV2(integritData);

      // Validation 통과 후 용어영문약어명이 미입력 상태인 경우
      if (integritData.termAbbreviationName === '') {
        const errorMessages = {
          state: 'error',
          stateName: 'emptyAbbreviation',
          errorTitle: '용어영문약어명 미입력',
          errorMessages: [
            '용어영문약어명이 미입력 상태입니다. 용어를 임시저장 하시겠습니까?',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages);
        return;
      }

      // 성공 시 저장실행
      if (!integritResponse.data.termNameErrorYn) {
        onTermJobUpdate();
        return;
      } else {
        // 실패 시 에러메시지 출력
        const errorList = integritResponse.data.wordErrorCode;

        console.log('errorList : ', errorList);

        const errorMessage = {
          state: 'validation',
          stateName: 'validation',
          errorTitle: '용어 무결성 체크 오류',
          errorMessages: [...getUniqueErrorMessages(errorList)],
        };

        onOpenTermValidationErrorWindow(errorMessage);
      }
    } else {
      // 비표준일 경우에 바로 저장 실행

      if (termDetailsData.termAbbreviationName === '') {
        const errorMessages = {
          state: 'validation',
          stateName: 'emptyAbbreviation',
          errorTitle: '용어영문약어명 미입력',
          errorMessages: [
            '용어영문약어명이 미입력 상태입니다. 용어를 임시저장 하시겠습니까?',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages);
        return;
      }

      onTermJobUpdate();
    }
  };

  // 용어작업 업데이트 수행
  const onTermJobUpdate = async (isTemporary) => {
    console.log('termDetailsData : ', termDetailsData);

    // 코드명 데이터 바인딩
    let codeTypeCode = '';
    let individualCodeName = '';
    let unityCodeName = '';
    if (termDetailsData.codeTypeName === 'INDIVIDUAL_CODE') {
      codeTypeCode = 'INDIVIDUAL_CODE';
      individualCodeName = termDetailsData.codeName;
    } else if (termDetailsData.codeTypeName === 'UNITY_CODE') {
      codeTypeCode = 'UNITY_CODE';
      unityCodeName = termDetailsData.codeName;
    } else {
      codeTypeCode = null;
      individualCodeName = null;
      unityCodeName = null;
    }

    console.log('termJobRowData : ', termJobRowData);

    let termName;

    // 이음동의어일때 termName 변경시
    if (
      termDetailsData.termType === '이음동의어' &&
      termDetailsData.termAbbreviationName !=
        termJobRowData.value.termAbbreviationName
    ) {
      termName = termDetailsData.termName;
      termDetailsData.termType = '일반어';
    }

    const termDetailsQuery = {
      instituteId: termDetailsData.managementInstituteId,
      userId: userInfo.value.userId,
      dictionaryId: termDetailsData.termDictionaryId,
      jobTermId: termDetailsData.jobTermId,
      termName: termDetailsData.termName,
      termAbbreviationName: termDetailsData.termAbbreviationName,
      termEnglishName: termDetailsData.termEnglishName,
      jobDivisionCode:
        termDetailsData.jobDivisionCode === 'C' ? 'NEW' : 'MODIFY',
      jobTypeCode: termDetailsData.jobTypeCode,
      termStandardYn: termDetailsData.standardDivision === 'Y' ? true : false,
      termTypeCode:
        termDetailsData.termTypeCode === '10' ? 'GENERAL' : 'SYNONYM',
      termExplain: termDetailsData.termExplain,
      domainClassName: termDetailsData.domainClassName,
      domainName: termDetailsData.domainName,
      codeTypeCode: codeTypeCode,
      individualCodeName: individualCodeName,
      unityCodeName: unityCodeName,
      departmentName: termDetailsData.managementDepartmentName,
      nonStandardReasonCode: termDetailsData.nonStandardReasonCode,
      nonStandardReasonContents: termDetailsData.nonStandardReasonContents,
      taskFieldName: termDetailsData.taskFieldName,
      revisionCycle: termDetailsData.revisionCycle,
      revisionDate: termDetailsData.revisionDate,
      isTemporary: isTemporary,
    };

    // 신규등록 실행
    if (termDetailsData.selectType.type === 'job-new') {
      termDetailsData.jobDivisionCode = 'NEW';
      const termQuery = termManagementDataBinding(termDetailsData);

      console.log('!!!!termQuery : ', termQuery);
      termQuery.isTemporary = isTemporary;

      const response = await manageTermV2(termQuery);

      console.log('용어작업 신규등록 수행 response : ', response);

      if (response.status === 409 && response.data.code === 1226) {
        const errorMessages = {
          state: 'error',
          stateName: 'duplicate',
          errorTitle: '용어 중복 오류메시지',
          errorMessages: [
            '작업 box에 동일한 용어가 존재하여 해당 용어를 신규등록 할 수 없습니다. 해당 용어의 용어명/용어영문약어명/도메인명을 확인해주세요.',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages);
        return;
      } else if (response.status === 409 && response.data.code === 1225) {
        const errorMessages = {
          state: 'error',
          stateName: 'nonStandard',
          errorTitle: '용어명 중복 확인 메시지',
          errorMessages: [
            '동일한 용어명/용어영문약어명에 다른 도메인명이 존재합니다. 해당 용어를 비표준용어로 등록 하시겠습니까?',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages);
        return;
      } else if (response.status === 409 && response.data.code === 1224) {
        const errorMessages = {
          state: 'error',
          stateName: 'synonym',
          errorTitle: '용어영문약어명 중복 확인 메시지',
          errorMessages: [
            '동일한 용어영문약어명/도메인명에 다른 용어명이 존재합니다. 해당 용어를 이음동의어로 등록하시겠습니까?',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages); //
        return;
      } else if (response.status === 409 && response.data.code === 1250) {
        const errorMessages = {
          state: 'error',
          stateName: 'duplicate',
          errorTitle: '용어 중복 오류메시지',
          errorMessages: [
            '동일한 용어가 존재하여 해당 용어를 신규등록 할 수 없습니다. 해당 용어의 용어명/용어영문약어명/도메인명을 확인해주세요.',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages); //
        return;
      } else if (response.status === 409) {
        setAlertStatus({
          view: true,
          message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
        });
        return;
      }
    } else {
      console.log('termDetailsQuery : ', termDetailsQuery);
      // 업데이트 실행
      const response = await updateTermV2(termDetailsQuery);
      console.log('용어작업 업데이트 수행 response : ', response);

      if (response.status === 409 && response.data.code === 1226) {
        const errorMessages = {
          state: 'error',
          stateName: 'duplicate',
          errorTitle: '용어 중복 오류메시지',
          errorMessages: [
            '동일한 용어가 존재하여 해당 용어를 신규등록 할 수 없습니다. 해당 용어의 용어명/용어영문약어명/도메인명을 확인해주세요.',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages);
        return;
      } else if (response.status === 409 && response.data.code === 1225) {
        const errorMessages = {
          state: 'error',
          stateName: 'nonStandard',
          errorTitle: '용어명 중복 확인 메시지',
          errorMessages: [
            '동일한 용어명/용어영문약어명에 다른 도메인명이 존재합니다. 해당 용어를 비표준용어로 등록 하시겠습니까?',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages);
        return;
      } else if (response.status === 409 && response.data.code === 1239) {
        const errorMessages = {
          state: 'error',
          stateName: 'error',
          errorTitle: '미등록 용어',
          errorMessages: ['사전에 등록되지 않은 용어 입니다.'],
        };
        onOpenTermValidationErrorWindow(errorMessages);
        return;
      } else if (response.status === 409 && response.data.code === 1224) {
        const errorMessages = {
          state: 'error',
          stateName: 'synonym',
          errorTitle: '용어영문약어명 중복 확인 메시지',
          errorMessages: [
            '동일한 용어영문약어명/도메인명에 다른 용어명이 존재합니다. 해당 용어를 이음동의어로 등록하시겠습니까?',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages); //
        return;
      } else if (response.status === 409) {
        setAlertStatus({
          view: true,
          message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
        });
        return;
      }

      if (response.status === 409) {
        const errorMessages = {
          state: 'error',
          stateName: 'error',
          errorTitle: '작업 수정 오류',
          errorMessages: [response.data.message],
        };

        onOpenTermValidationErrorWindow(errorMessages); //

        // setAlertStatus({
        //   view: true,
        //   message: response.data.message,
        // });
        return;
      }
    }

    setIsTermJobSave(true);
    setIsTermJobApproval(true);
  };

  //초기화
  const resetConfirmState = reactive({
    view: false,
    message: '선택한 항목이 작업목록에서 삭제됩니다. <br>계속하시겠습니까?',
  });
  const onResetConfirm = () => {
    resetConfirmState.view = true;
  };
  const onReset = () => {
    // 작업 전 데이터 전달
    const termJobRowDataInfo = termJobRowData;
    resetTermJobData(termJobRowDataInfo);
  };

  //초기화
  const cancelConfirmState = reactive({
    view: false,
    message: '작업을 취소하고 초기화면으로 돌아갑니다.<br>취소 하시겠습니까?',
  });
  const onCancelConfirm = () => {
    cancelConfirmState.view = true;
  };

  const onCancel = () => {
    setIsTermJobCancel(true);
  };

  // 용어 작업 기존값 저장
  const termJobRowData = reactive({});

  // 용어 작업 데이터 초기화
  const resetTermJobData = (termDetailsDataInfo) => {
    console.log('작업용어 apiGetTermJobInfo !!! : ', termDetailsDataInfo);
    const resultData = termDetailsDataInfo.value;
    console.log('resultData ==============', resultData);

    termDetailsData.selectType =
      resultData.jobDivisionCode === 'C' ? regType[0] : regType[1];

    termDetailsData.managementInstituteId = useMetaMngInstId;
    termDetailsData.dictionaryId = resultData.dictionaryId;
    // 용어 정보
    termDetailsData.jobTermId = resultData.jobTermId;
    termDetailsData.termName = resultData.termName;
    termDetailsData.termType = resultData.termTypeName;
    termDetailsData.domainName = resultData.domainName;

    termDetailsData.termExplain = resultData.termExplain;
    termDetailsData.termAbbreviationName = resultData.termAbbreviationName; // 용어영문약어명

    // 표준여부 및 비표준 사유 바인딩
    termDetailsData.standardDivision =
      resultData.termStandardYn === true ? 'Y' : 'N';
    termDetailsData.nonStandardReasonCode = resultData.nonStandardReasonCode;
    termDetailsData.nonStandardReasonContents =
      resultData.nonStandardReasonContents;
    selectNonStandardReason.value = resultData.nonStandardReasonCode;

    termDetailsData.revisionCycle = resultData.revisionCycle;
    termDetailsData.revisionDate = resultData.revisionDate;
    termDetailsData.managementDepartmentName =
      resultData.managementDepartmentName;
    termDetailsData.revisionCycle = resultData.revisionCycle;
    termDetailsData.revisionDate = resultData.revisionDate;
    if (resultData.revisionCycle === null || resultData.revisionCycle === '') {
      termDetailsData.revisionInfo = resultData.revisionDate;
    } else {
      termDetailsData.revisionInfo = `${resultData.revisionDate}(${resultData.revisionCycle})`;
    }

    // 코드타입 설정
    if (resultData.codeTypeCode === '10') {
      selectCodeType.value = 'INDIVIDUAL_CODE';
    } else if (resultData.codeTypeCode === '20') {
      selectCodeType.value = 'UNITY_CODE';
    } else {
      selectCodeType.value = null;
    }
    termDetailsData.individualCodeName = resultData.individualCodeName;
    termDetailsData.unityCodeName = resultData.unityCodeName;

    termDetailsData.taskFieldName = resultData.taskFieldName;

    termDetailsData.updateDateTime = resultData.updateDateTime;
    termDetailsData.updater = resultData.updater;
    termDetailsData.jobDivisionName = resultData.jobDivisionName;
    termDetailsData.jobDivisionCode = resultData.jobDivisionCode;
    termDetailsData.jobTermId = resultData.jobTermId;

    console.log('!!!termDetailsData =======', termDetailsData);
  };

  // 도메인검색 Params
  const domainRequestPrams = reactive({
    instituteId: useMetaMngInstId,
    dictionaryId: useDctnryId,
    domainClassName: termDetailsData.domainClassName,
    jobTypeCode: 'STD',
  });

  // 무결성 체크 팝업 상태
  const termValidationErrorWindowView = ref(false);
  // 무결성체크 팝업 열기
  const onOpenTermValidationErrorWindow = (messages) => {
    termValidationErrorMessaages.value = messages;
    termValidationErrorWindowView.value = true;
  };
  // 취소
  const onCloseTermValidationErrorWindow = () => {
    termValidationErrorWindowView.value = false;
  };
  // 확인
  const onTermValidationErrorSave = (data) => {
    termValidationErrorWindowView.value = false;

    console.log('무결성체크 확인 data : ', data);

    // 비표준용어로 등록
    if (data.stateName === 'nonStandard') {
      termDetailsData.standardDivision = 'N';
      selectNonStandardReason.value = '30';
    } else if (data.stateName === 'synonym') {
      // 이음동의어로 저장
      termDetailsData.termType = 'SYNONYM';
    } else if (data.stateName === 'duplicate' || data.stateName === 'error') {
      // 오류로 인한 확인
      termValidationErrorWindowView.value = false;
      return;
    }

    onTermJobUpdate(true);
  };

  // // 용어 작업 데이터 감시
  watch(
    () => termJobUpdateData.value,
    (newVal) => {
      showAnimate.value = true;

      setTimeout(() => {
        showAnimate.value = false;
      }, 500);

      console.log('termJobUpdateData : ', termJobUpdateData.value);
      if (newVal) {
        termJobRowData.value = newVal;
        apiGetTermJobInfo(termJobRowData);
      }
    }
  );
  // watch(
  //   () => selectTermJobData.value,
  //   (newVal) => {
  //     showAnimate.value = true;

  //     setTimeout(() => {
  //       showAnimate.value = false;
  //     }, 500);

  //     // console.log('termJobUpdateData : ', termJobUpdateData.value);
  //     if (newVal) {
  //       termJobRowData.value = newVal;
  //       apiGetTermJobInfo(termJobRowData);
  //     }
  //   }
  // );

  // 코드유형 변경 시 초기화
  watch(
    () => termDetailsData.codeTypeName,
    (newVal, oldVal) => {
      if (newVal === 'INDIVIDUAL_CODE') {
        termDetailsData.unityCodeName = '';
      } else if (newVal === 'UNITY_CODE') {
        termDetailsData.individualCodeName = '';
      } else {
        termDetailsData.individualCodeName = '';
        termDetailsData.unityCodeName = '';
      }
    }
  );

  // 표준구분 변경 시
  watch(
    () => termDetailsData.standardDivision,
    (value) => {
      console.log('표준구분 변경 value : ', value);
      if (value === 'Y') {
        selectNonStandardReason.value = '0';
      }
    }
  );

  // 비표준 사유 기타 변경 시
  watch(
    () => selectNonStandardReason.value,
    (value) => {
      console.log('비표준사유 변경 value : ', value);
      console.log(
        'termDetailsData.nonStandardReasonContents : ',
        termDetailsData.nonStandardReasonContents
      );

      // 옵션이 초기화 된 경우에만 실행
      if (nonStandardReasonOptions.length > 2) {
        const foundOption = nonStandardReasonOptions.find(
          (item) => item.value === value
        );

        if (foundOption) {
          const noneStandardReason = foundOption.text;
          console.log('noneStandardReason : ', noneStandardReason);

          // 괄호 안의 내용 추출
          if (noneStandardReason.includes('(')) {
            const matches = noneStandardReason.match(/\((.*?)\)/);

            console.log('matches : ', matches);

            if (matches && matches[1]) {
              termDetailsData.nonStandardReasonContents = matches[1];
            }
          }

          termDetailsData.nonStandardReasonCode = value;
          termDetailsData.nonStandardReasonContents = noneStandardReason;

          if (value === '90' && noneStandardReason === '기타') {
            console.log('비표준사유 변경 value : ', value);
            onOpenAdditionalReasonsWindow();
          }
        }
      }
    }
  );
</script>

<style scoped>
  .flex-radio {
    display: flex;
    /* justify-content: space-between; */
  }
</style>
