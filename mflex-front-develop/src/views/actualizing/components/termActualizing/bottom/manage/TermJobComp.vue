<template>
  <div class="input-top">
    <div class="title-top">
      <div class="title-s">
        <div class="title-s-left">
          상세 정보
          <AppTooltip :htmlContent="getTooltipById('dictionaryDetails')">
          </AppTooltip>
        </div>
        <div class="btns" style="display: flex">
          <!-- <button
            class="btn-s add-reg"
            @click="onSelectReg(0)"
            title="신규등록"
          >
            신규등록
          </button> -->
        </div>
      </div>
      <div class="title-btns__row_btween">
        <div class="btns">
          <button
            class="btn-s green save-btn"
            title="저장"
            @click="onSaveConfirm"
            :disabled="
              termDetailsData.termName === '' ||
              termDetailsData.selectType.type === 'search'
            "
          >
            저장
          </button>
          <button
            class="btn-s delete-btn"
            title="취소"
            :disabled="
              termDetailsData.termName === '' ||
              termDetailsData.selectType.type === 'search'
            "
            @click="onCancelConfirm"
          >
            취소
          </button>
          <button
            class="btn-s reset-btn"
            title="초기화"
            :disabled="
              termDetailsData.termName === '' ||
              termDetailsData.selectType.type === 'search'
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
            <td class="manage-input-form-td" style="display: flex">
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
                    v-model="termDetailsData.revisionDate"
                    :disabled="termDetailsData.selectType.type === 'search'"
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*용어영문약어명</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.termAbbreviationName"
                  readonly
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
                    v-model="displayTermType"
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
            <th class="required">*용어명</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="termDetailsData.termName"
                  :readonly="disableState"
                />
                <button
                  class="btn-s dark-gray ml5"
                  @click="onOpenTermDivideWindow"
                  :disabled="disableState"
                >
                  용어명조합
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*도메인분류명</th>
            <td class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <div class="input-vison-div">
                  {{ termDetailsData.domainClassName }}
                </div>
                <button
                  class="btn-s search-btn dark-gray ml5"
                  @click="onOpenDomainClassSearchWindow"
                  :disabled="disableState"
                  title="도메인분류명 검색"
                >
                  검색
                </button>
              </div>
            </td>
            <th class="required">*도메인명</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div class="input-vison-div">
                  {{ termDetailsData.domainName }}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*용어설명</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col">
                <textarea
                  style="height: 90px"
                  :readonly="termDetailsData.selectType.type === 'search'"
                  v-model="termDetailsData.termExplain"
                  placeholder="설명을 입력하세요"
                ></textarea>
              </div>
            </td>
          </tr>
          <tr>
            <th>코드유형</th>
            <td colspan="1" class="manage-input-form-td">
              <div class="td-col">
                <div>
                  <select
                    class="input-select"
                    v-model="selectCodeType"
                    style="width: 100%"
                    :disabled="
                      !isCodeType ||
                      termDetailsData.selectType.type === 'search'
                    "
                    @change="handleCodeTypeChange"
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
                    termDetailsData.selectType.type === 'search'
                  "
                />
                <button
                  class="btn-s search-btn dark-gray ml5"
                  @click="onOpenSearchUnityCodeWindow"
                  :disabled="
                    !isCodeType ||
                    !termDetailsData.codeTypeName ||
                    termDetailsData.codeTypeName === 'INDIVIDUAL_CODE' ||
                    termDetailsData.selectType.type === 'search'
                  "
                  title="통합코드명 검색"
                >
                  검색
                </button>
              </div>
            </td>
          </tr>
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
                  :readonly="termDetailsData.selectType.type === 'search'"
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
                  :readonly="termDetailsData.selectType.type === 'search'"
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
    <!-- 용어명조합 팝업 -->
    <AppWindow
      :view="termDivideWindowView"
      :moveState="true"
      @close="onCloseTermDivideWindow"
      width="1000px"
      height="auto"
    >
      <TermSplitWindow
        :termDivideQuery="termDivideQuery"
        :termAbbreviationName="termDetailsData.termAbbreviationName"
        @confirm="onTermDivideSave"
        @close="onCloseTermDivideWindow"
      />
    </AppWindow>
    <!-- 도메인그룹 검색창 -->
    <AppWindow
      :view="domainClassSearchWindowView"
      :moveState="true"
      @close="onCloseDomainClassSearchWindow"
      width="600px"
      height="auto"
    >
      <DomainClassSearchWindow
        :requestPrams="domainRequestPrams"
        @confirm="onDomainClassSearchSave"
        @close="onCloseDomainClassSearchWindow"
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
    <!-- 연관컬럼 존재 알림창 -->
    <AppDialog
      v-model:view="relationColumnState.view"
      :title="relationColumnState.title"
      :message="relationColumnState.message"
      :type="relationColumnState.type"
      @relationColumnList="onRelationColumn"
    />
    <!-- 연관컬럼 목록 팝업 -->
    <AppWindow
      :view="relationColumnWindowView"
      @close="onCloseRelationColumnWindow"
      width="970px"
      height="auto"
    >
      <RelationColumnWindow
        :termRelationList="termRelationList"
        @confirm="onRelationColumnSave"
        @close="onCloseRelationColumnWindow"
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
        :errorMessage="termErrorMessaages"
        @confirm="onTermValidationErrorSave"
        @close="onCloseTermValidationErrorWindow"
      />
    </AppWindow>

    <!-- 이음동의어, 비표준용어, 용어중복 팝업 -->
  </div>
</template>

<script setup>
  import { reactive, ref, watch, computed, onMounted } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useActualizingStore } from '@/stores/actualizing';
  import { storeToRefs } from 'pinia';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAlert } from '@/composables/alert';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import TermSplitWindow from '@/components/popWindow/TermSplitWindow.vue';
  import DomainClassSearchWindow from '@/components/popWindow/DomainClassSearchWindow.vue';
  import SearchUnityCodeWindow from '@/components/popWindow/SearchUnityCodeWindow.vue';
  import RelationColumnWindow from '@/components/popWindow/RelationColumnWindow.vue';
  import TermValidationErrorWindow from '@/components/popWindow/TermValidationErrorWindow.vue';
  import { termManagementDataBinding } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { getUpdateSynchronizeTerm } from '@/utils/mflexApi/actualizing/actualizingApi.js';
  import {
    getNonStandardReasonCode, // 비표준사유코드 조회
    getTermDetailsV2, // 용어 작업 상세정보 조회
    getTermCheckIntegrityV2, // 용어 무결성 체크
    manageTermV2, // 용어 등록
    getRelatedColumnListV2, // 연관컬럼 조회
    updateTermV2, // 작업용어 수정
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';

  import AdditionalReasonsWindow from '@/components/popWindow/AdditionalReasonsWindow.vue';

  const authStore = useAuthStore();
  const { setAlertStatus, alertInfos } = useAlert();
  const { userInfo, userStngInfo } = storeToRefs(authStore);

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
    userStngInfo.value;

  const dictionaryMngStore = useDictionaryMngStore();

  const { setIsTermJobSave, setIsTermJobApproval, setIsTermJobCancel } =
    dictionaryMngStore;
  const { termJobData, termJobUpdateData } = storeToRefs(dictionaryMngStore);

  const actualizingStore = useActualizingStore();
  const { selectTermData, selectTermJobData } = storeToRefs(actualizingStore);

  const showAnimate = ref(false);

  const updater = userInfo.value.userId;
  const updateDateTime = new Date().toISOString().split('T')[0];

  const CODE_TYPE = '코드';

  // 용어유형
  const termTypeOptions = [
    { value: 'GENERAL', text: '일반어' },
    { value: 'SYNONYM', text: '이음동의어' },
  ];

  const selectTermType = ref(termTypeOptions[0].value);

  // 화면에 표시될 값을 변환
  const displayTermType = computed({
    get() {
      return selectTermType.value === 'GENERAL'
        ? '일반어'
        : selectTermType.value === 'SYNONYM'
        ? '이음동의어'
        : '';
    },
    set(value) {
      if (value === '일반어') {
        selectTermType.value = 'GENERAL';
      } else if (value === '이음동의어') {
        selectTermType.value = 'SYNONYM';
      }
    },
  });

  // 수정불가 상태
  const disableState = computed(() => {
    return (
      termDetailsData.selectType.type === 'search' ||
      termDetailsData.selectType.type === 'modify' ||
      termDetailsData.selectType.type === 'remove' ||
      termDetailsData.selectType.type === 'restore' ||
      termDetailsData.selectType.type === 'delete'
    );
  });

  // 비표준사유
  const nonStandardReasonOptions = reactive([{ value: '0', text: '선택' }]);

  // const searchNonStandardReasonCode = async () => {
  //   // 비표준사유 옵션 초기화
  //   // nonStandardReasonOptions.splice(0, nonStandardReasonOptions.length);

  //   const data = {
  //     instituteId: useMetaMngInstId,
  //     dictionaryId: useDctnryId,
  //     jobTypeCode: 'CUR',
  //   };

  //   if (nonStandardReasonOptions.length > 2) {
  //     return;
  //   }

  //   const nonStandardReasonList = await getNonStandardReasonCode(data);

  //   console.log('nonStandardReasonList : ', nonStandardReasonList);

  //   // value가 같은 경우를 추적하기 위한 맵
  //   const valueCountMap = new Map();

  //   nonStandardReasonList.data.forEach((item) => {
  //     // 현재 value의 카운트를 가져오거나 초기화
  //     const count = valueCountMap.get(item.code) || 0;
  //     // 카운트 증가
  //     valueCountMap.set(item.code, count + 1);

  //     nonStandardReasonOptions.push({
  //       value: count > 0 ? `${item.code}_${count}` : item.code, // 중복되는 경우 suffix 추가
  //       text: item.name,
  //       originalValue: item.code, // 원본 value 값 보존
  //     });
  //   });
  // };

  const searchNonStandardReasonCode = async (forceReload = false) => {
    const data = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      jobTypeCode: 'CUR',
    };

    // forceReload가 true이거나 아직 로드되지 않은 경우에만 조회
    if (!forceReload && nonStandardReasonOptions.length > 2) {
      return;
    }

    // 강제 재로드인 경우 기존 데이터 초기화 (첫 번째 '선택' 옵션 제외)
    if (forceReload) {
      nonStandardReasonOptions.splice(1); // 첫 번째 요소만 남기고 나머지 삭제
    }

    const nonStandardReasonList = await getNonStandardReasonCode(data);

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
  };

  onMounted(async () => {
    // const data = {
    //   instituteId: useMetaMngInstId,
    //   dictionaryId: useDctnryId,
    //   jobTypeCode: 'CUR',
    // };

    // if (nonStandardReasonOptions.length > 2) {
    //   return;
    // }

    // const nonStandardReasonList = await getNonStandardReasonCode(data);

    // console.log('nonStandardReasonList : ', nonStandardReasonList);

    // // value가 같은 경우를 추적하기 위한 맵
    // const valueCountMap = new Map();

    // nonStandardReasonList.data.forEach((item) => {
    //   // 현재 value의 카운트를 가져오거나 초기화
    //   const count = valueCountMap.get(item.code) || 0;
    //   // 카운트 증가
    //   valueCountMap.set(item.code, count + 1);

    //   nonStandardReasonOptions.push({
    //     value: count > 0 ? `${item.code}_${count}` : item.code, // 중복되는 경우 suffix 추가
    //     text: item.name,
    //     originalValue: item.code, // 원본 value 값 보존
    //   });
    // });

    await searchNonStandardReasonCode();

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

  // 코드도메인 여부 확인
  const isCodeType = computed(() => {
    return termDetailsData.domainClassName === CODE_TYPE;
  });

  // 용어 데이터 양식
  const termDetailsData = reactive({
    jobDivisionName: '',
    selectType: { id: 3, label: '자료조회', type: 'search' },
    managementInstituteId: useMetaMngInstId,
    termDictionaryId: useDctnryId,
    termName: '',
    logicalDataTypeName: '',
    termType: selectTermType,
    termEnglishName: '',
    termAbbreviationName: '',
    domainClassName: '',
    domainName: '',
    standardDivision: 'Y',
    selectNonStandardReason: selectNonStandardReason,
    nonStandardReasonContents: '',
    termExplain: '',
    discardYn: false,
    codeTypeName: selectCodeType,
    codeName: '',
    individualCodeName: '',
    unityCodeName: '',
    unityCodeDictionaryId: null,
    logicalDataTypCode: '',
    dataLength: null,
    dataDecimalPointLength: null,
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
    jobTermId: null,
  });

  // 연관컬럼 유무 조회
  const relationColumnYn = ref(false);
  // 작업 가능여부
  const jobState = ref(false);

  // 용어정보 바인딩
  const apiGetTermBaseInfo = async (termDetailsDataInfo) => {
    const waitForOptions = () => {
      if (nonStandardReasonOptions.length > 2) {
        processTermDetails(termDetailsDataInfo);
      } else {
        setTimeout(waitForOptions, 50); // 100ms 후 다시 체크
      }
    };

    const processTermDetails = (termDetailsDataInfo) => {
      console.log('apiGetTermBaseInfo : ', termDetailsDataInfo);
      const resultData = termDetailsDataInfo.data
        ? termDetailsDataInfo.data
        : termDetailsDataInfo;
      console.log('resultData ==============', resultData);
      // 폐기여부
      termDetailsData.discardYn = resultData.discardYn;
      // 작업구분 조회 변경
      // termDetailsData.selectType = {};
      termDetailsData.managementInstituteId = resultData.instituteId;
      termDetailsData.termDictionaryId = resultData.dictionaryId;
      termDetailsData.logicalDataTypeName = resultData.logicalDataTypeName;
      termDetailsData.logicalDataTypeAbbreviationName =
        resultData.logicalDataTypeAbbreviationName;
      // 용어명
      termDetailsData.termName = resultData.termName;
      // 용어유형 바인딩
      if (resultData.termTypeName === '일반어') {
        termDetailsData.termType = 'GENERAL';
        selectTermType.value = 'GENERAL';
      } else if (resultData.termTypeName === '이음동의어') {
        termDetailsData.termType = 'SYNONYM';
        selectTermType.value = 'SYNONYM';
      }

      // 코드타입 유형 바인딩
      if (resultData.codeTypeName === '개별코드') {
        termDetailsData.codeTypeName = 'INDIVIDUAL_CODE';
        selectCodeType.value = 'INDIVIDUAL_CODE';
        termDetailsData.codeName = resultData.individualCodeName;
      } else if (resultData.codeTypeName === '통합코드') {
        termDetailsData.codeTypeName = 'UNITY_CODE';
        selectCodeType.value = 'UNITY_CODE';
        termDetailsData.codeName = resultData.unityCodeName;
      } else {
        // 코드 타입이 없을 경우
        termDetailsData.codeTypeName = null;
        selectCodeType.value = null;
      }

      termDetailsData.domainName = resultData.domainName; // 도메인명
      termDetailsData.domainClassName = resultData.domainClassName; // 도메인분류명

      termDetailsData.unityCodeName = resultData.unityCodeName; // 통합코드명
      termDetailsData.individualCodeName = resultData.individualCodeName; // 개별코드명
      termDetailsData.termAbbreviationName = resultData.termAbbreviationName; // 용어영문약어명

      termDetailsData.standardDivision = resultData.termStandardYn ? 'Y' : 'N'; // 표준구분

      termDetailsData.typeName = resultData.termTypeName; // 용어유형
      termDetailsData.termExplain = resultData.termExplain; // 용어 설명

      termDetailsData.revisionDate = resultData.revisionDate; // 제개정일자
      termDetailsData.managementDepartmentName = resultData.departmentName; // 관리부서명
      termDetailsData.revisionCycle = resultData.revisionCycle;
      termDetailsData.revisionDate = resultData.revisionDate;
      if (
        resultData.revisionCycle === null ||
        resultData.revisionCycle === ''
      ) {
        termDetailsData.revisionInfo = resultData.revisionDate;
      } else {
        termDetailsData.revisionInfo = `${resultData.revisionDate}(${resultData.revisionCycle})`;
      }
      termDetailsData.taskFieldName = resultData.taskFieldName;

      termDetailsData.updateDateTime = resultData.updateDateTime;
      termDetailsData.updater = resultData.updater;
      termDetailsData.relationColumnYn = relationColumnYn.value;
      termDetailsData.jobState = jobState.value;
      termDetailsData.jobTermId = resultData.jobTermId;

      // 비표준일 경우에 실행
      if (!resultData.termStandardYn) {
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

        // if (resultData.nonStandardReasonContents) {
        //   let matchReason = nonStandardReasonOptions.filter((item) => {
        //     return item.text.includes(resultData.nonStandardReasonContents);
        //   });

        //   console.log('nonStandardReasonName match: ', matchReason);

        //   if (!matchReason) {
        //     matchReason = nonStandardReasonOptions.filter((item) => {
        //       return item.text === resultData.nonStandardReasonContents;
        //     });
        //   }

        //   console.log('matchReason :', matchReason);
        //   termDetailsData.selectNonStandardReason = matchReason[0].value;
        //   selectNonStandardReason.value = matchReason[0].value;
        // } else {
        //   termDetailsData.nonStandardReasonCode =
        //     resultData.nonStandardReasonCode;
        //   termDetailsData.nonStandardRessonContents =
        //     resultData.nonStandardRessonContents;
        //   selectNonStandardReason.value = resultData.nonStandardReasonCode;
        // }
      }

      // selectNonStandardReason.value = resultData.nonStandardReasonCode;

      console.log('!!!termDetailsData =======', termDetailsData);
    };

    // 실행 시작
    waitForOptions();
  };

  // 용어 조회 데이터 저장
  const termRowData = reactive({});

  const regType = reactive([
    { id: 0, label: '신규등록', type: 'new' },
    { id: 1, label: '변경등록', type: 'modify' },
    { id: 2, label: '폐기등록', type: 'remove' },
    { id: 3, label: '자료조회', type: 'search' },
    { id: 4, label: '복구등록', type: 'restore' },
    { id: 5, label: '삭제등록', type: 'delete' },
  ]);

  // 작업선택 함수
  const onSelectReg = async (value) => {
    termDetailsData.selectType = regType[value];

    // 신규등록 시
    if (value === 0) {
      emptyTermDetailsData();
    } else {
      if (value === 1) {
        termDetailsData.jobDivisionCode = 'MODIFY';
        termDetailsData.jobDivisionName = '변경등록';
      } else if (value === 2) {
        termDetailsData.jobDivisionCode = 'DISCARD';
        termDetailsData.jobDivisionName = '폐기등록';
      } else if (value === 4) {
        termDetailsData.jobDivisionCode = 'RESTORE';
        termDetailsData.jobDivisionName = '복구등록';
      } else if (value === 5) {
        termDetailsData.jobDivisionCode = 'DELETE';
        termDetailsData.jobDivisionName = '삭제등록';
      }
      console.log('termRowData : ', termRowData);
      const termRowDataInfo = termRowData.value;

      const termBaseQuery = {
        instituteId: termRowDataInfo.instituteId,
        dictionaryId: termRowDataInfo.dictionaryId,
        termName: termRowDataInfo.termName,
        termAbbreviationName: termRowDataInfo.termAbbreviationName,
        domainName: termRowDataInfo.domainName,
      };
      const termDetailsDataInfo = await getTermDetailsV2(termBaseQuery);

      console.log('termDetailsDataInfo!!!! : ', termDetailsDataInfo);

      apiGetTermBaseInfo(termDetailsDataInfo);
      termDetailsData.revisionDate = updateDateTime;
    }
  };

  // Input Data 초기화
  const emptyTermDetailsData = () => {
    termDetailsData.selectType = regType[0];
    termDetailsData.termName = '';
    termDetailsData.termType = 'GENERAL';
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
    termDetailsData.jobDivisionName = '';
    termDetailsData.jobDivisionCode = 'NEW';
  };

  const onSaveConfirm = () => {
    console.log('용어명 데이터 termDetailsData : ', termDetailsData);

    // 용어명 공백 또는 특수문자 체크 정규식
    const invalidTermNameRegex = /[\s]|[^a-zA-Z0-9가-힣]/;

    // 용어영문약어명 공백 체크 정규식
    const emptySpaceRegex = /[\s]/;

    if (termDetailsData.termName === '' || termDetailsData.termName === null) {
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
      (selectNonStandardReason.value === '' ||
        selectNonStandardReason.value === '0' ||
        selectNonStandardReason.value === null)
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message = '비표준 용어 등록 시 비표준사유를 선택하세요.';
      return;
    } else if (invalidTermNameRegex.test(termDetailsData.termName)) {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '용어명에는 공백이나 특수문자를 포함할 수 없습니다.';
      return;
    } else if (termDetailsData.termAbbreviationName === '') {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '<span style="font-weight:600;">용어영문약어명</span>을 입력하세요.';
      return;
    } else if (
      !termDetailsData.domainName ||
      termDetailsData.domainName === ''
    ) {
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
    if (relationColumnYn.value) {
      relationColumnState.view = true;
    } else {
      saveConfirmState.view = true;
    }
  };

  //저장저장 팝업
  const saveConfirmState = reactive({
    view: false,
    message: '작업 내용을 저장하시겠습니까?',
  });

  const relationColumnState = reactive({
    title: '연관컬럼 확인메시지',
    view: false,
    type: 'relationColumn',
    message:
      '해당 용어와 연관된 컬럼이 있어 해당 작업은 실행이 불가능합니다. <br>작업을 취소하고연관컬럼 변경/삭제 처리를 먼저 수행해 주시기 바랍니다.',
  });

  const relationColumnWindowView = ref(false);

  const termRelationList = reactive({});

  const onRelationColumn = () => {
    relationColumnWindowView.value = true;
  };

  const onCloseRelationColumnWindow = () => {
    relationColumnWindowView.value = false;
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
    termDetailsData.termName = selectRow.label;
    termDetailsData.domainClassName = selectRow.domainClassName;
    domainRequestPrams.domainClassName = selectRow.domainClassName;
    onCloseTermDivideWindow();
  };

  // 용어작업 업데이트 수행
  const onTermJobUpdate = async (isTemporary) => {
    console.log('termDetailsData : ', termDetailsData);

    let individualCodeName;
    let unityCodeName;

    const termDetailsQuery = {
      term: {
        instituteId: termDetailsData.managementInstituteId,
        userId: userInfo.value.userId,
        dictionaryId: termDetailsData.termDictionaryId,
        jobTermId: termDetailsData.jobTermId,
        termName: termDetailsData.termName,
        termAbbreviationName: termDetailsData.termAbbreviationName,
        termEnglishName: termDetailsData.termEnglishName,
        jobDivisionCode: 'NEW',
        jobTypeCode: termDetailsData.jobTypeCode,
        termStandardYn: termDetailsData.standardDivision === 'Y' ? true : false,
        termTypeCode:
          termDetailsData.termTypeCode === '10' ? 'GENERAL' : 'SYNONYM',
        termExplain: termDetailsData.termExplain,
        domainClassName: termDetailsData.domainClassName,
        domainName: termDetailsData.domainName,
        // domainClassName: '공통',
        // domainName: '공통N12',
        codeTypeCode: termDetailsData.codeTypeName,
        individualCodeName:
          termDetailsData.codeTypeName === 'INDIVIDUAL_CODE'
            ? termDetailsData.codeName
            : null,
        // 테스트 코드 업로드
        // codeTypeCode: 'INDIVIDUAL_CODE',
        // individualCodeName:
        //   termDetailsData.codeTypeName === 'INDIVIDUAL_CODE'
        //     ? termDetailsData.codeName
        //     : null,
        nonStandardReasonCode: termDetailsData.nonStandardReasonCode,
        nonStandardReasonContents: termDetailsData.nonStandardReasonContents,
        unityCodeName:
          termDetailsData.codeTypeName === 'UNITY_CODE'
            ? termDetailsData.codeName
            : null,
        managementDepartmentName: termDetailsData.managementDepartmentName,
        taskFieldName: termDetailsData.taskFieldName,
        revisionCycle: termDetailsData.revisionCycle,
        revisionDate: termDetailsData.revisionDate,
        isTemporary: isTemporary,
      },
      informationSystemId: useInfoSysId,
    };

    console.log('termDetailsQuery : ', termDetailsQuery);
    // 업데이트 실행
    const response = await getUpdateSynchronizeTerm(termDetailsQuery);
    console.log('용어작업 업데이트 수행 response : ', response);

    if (response.status === 409) {
      await setAlertStatus({
        view: true,
        message: `${response.data.message}`,
      });
      // const errorMessages = {
      //   state: 'error',
      //   stateName: 'error',
      //   errorTitle: '작업 수정 오류',
      //   errorMessages: [response.data.message],
      // };

      // onOpenTermValidationErrorWindow(errorMessages); //

      // setAlertStatus({
      //   view: true,
      //   message: response.data.message,
      // });
      return;
    }

    // 비표준사유 데이터 강제 재조회
    await searchNonStandardReasonCode(true); // ← forceReload = true로 호출

    setIsTermJobSave(true);
    setIsTermJobApproval(true);
  };

  //도메인명 검색
  const domainClassSearchWindowView = ref(false);
  const onOpenDomainClassSearchWindow = () => {
    domainClassSearchWindowView.value = true;
  };
  const onCloseDomainClassSearchWindow = () => {
    domainClassSearchWindowView.value = false;
  };
  const onDomainClassSearchSave = (selectRow) => {
    console.log('도메인 명 저장');
    console.log('selectRow : ', selectRow);

    const domainClassName = selectRow.domainClassName;

    // 도메인 클래스 정보 저장
    termDetailsData.domainClassName = domainClassName;

    if (termDetailsData.domainClassName != CODE_TYPE) {
      termDetailsData.codeTypeName = null;
      termDetailsData.individualCodeName = null;
      termDetailsData.unityCodeName = '';
    }

    // 도메인 명 바인딩
    termDetailsData.domainName = `${termDetailsData.domainClassName}${termDetailsData.logicalDataTypeAbbreviationName}`;

    console.log('termDetailsData : ', termDetailsData);
    onCloseDomainClassSearchWindow();
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

  const ERROR_MESSAGES = {
    10: '용어 구성단어에서 존재하지 않는 단어가 있습니다.',
    20: '용어의 구성단어에서 분류단어가 존재하지 않습니다.',
    30: '용어의 구성단어에서 대체어가 사용되고 있습니다.',
    40: '용어의 구성단어에서 금칙어가 사용되고 있습니다.',
    50: '용어의 구성단어 중 폐기등록된 단어가 존재합니다..',
    60: '용어의 마지막 단어 유형이 분류단어가 아닙니다.',
    70: '용어의 도메인분류명과 입력한 도메인 분류명이 다릅니다.',
  };

  const termErrorMessaages = ref('');

  const getUniqueErrorMessages = (errorList, maxMessages = 2) => {
    // 중복 제거 후, null 또는 undefined 값 제거
    const uniqueErrors = [...new Set(errorList)].filter(Boolean);

    // 에러 메시지 객체 생성
    const result = {
      state: 'validation',
      errorMessages: uniqueErrors
        .slice(0, maxMessages)
        .map(
          (code) => ERROR_MESSAGES[code] || `알 수 없는 에러(코드: ${code})`
        ),
    };

    return result;
  };

  // 용어 무결성 체크
  const onTermIntegrityCheck = async () => {
    console.log('용어무결성체크 실행');
    console.log('termDetailsData : ', termDetailsData);

    // 표준일 경우에만 무결성 체크 진행
    if (termDetailsData.standardDivision === 'Y') {
      const integritData = {
        instituteId: termDetailsData.managementInstituteId,
        dictionaryId: termDetailsData.termDictionaryId,
        termName: termDetailsData.termName,
        termAbbreviationName:
          termDetailsData.termAbbreviationName.toUpperCase(),
        domainName: termDetailsData.domainName,
      };

      const integritResponse = await getTermCheckIntegrityV2(integritData);

      // 성공 시 저장실행
      if (!integritResponse.data.termNameErrorYn) {
        onTermJobUpdate();
        return;
      } else {
        // 실패 시 에러메시지 출력
        const errorList = integritResponse.data.wordErrorCode;

        console.log('errorList : ', errorList);

        const errorMessage = getUniqueErrorMessages(errorList);

        console.log('errorMessage : ', errorMessage);

        onOpenTermValidationErrorWindow(errorMessage);
      }
    } else {
      // 비표준일 경우에 바로 저장 실행
      onTermJobUpdate();
    }
  };

  // 용어작업 저장 수행
  const onTermJobSave = async (isTemporary) => {
    console.log('용어작업 저장 수행');
    const termDetailsQuery = termManagementDataBinding(termDetailsData);

    if (isTemporary) {
      termDetailsQuery.isTemporary = true;
    } else {
      termDetailsQuery.isTemporary = false;
    }

    if (termDetailsData.selectType.type === 'new') {
      termDetailsQuery.termDictionaryId = useDctnryId;
      const response = await manageTermV2(termDetailsQuery);
      console.log('신규등록 결과 : ', response);
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
      termDetailsQuery.jobDivisionCode = 'NEW';
    } else if (termDetailsData.selectType.type === 'modify') {
      termDetailsQuery.jobDivisionCode = 'MODIFY';
      const response = await manageTermV2(termDetailsQuery);
      if (response.status === 409) {
        setAlertStatus({
          view: true,
          message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
        });
        return;
      }
    } else if (termDetailsData.selectType.type === 'remove') {
      // 실제 데이터
      const relatedColumData = {
        instituteId: termDetailsQuery.instituteId,
        termName: termDetailsQuery.termName,
        termAbbreviationName: termDetailsQuery.termAbbreviationName,
        logicalDataTypeName: termDetailsData.logicalDataTypeName,
      };

      // 테스트
      // const relatedColumData = {interceptors-config :
      //   instituteId: 2,
      //   termName: '테스트용어',
      //   termAbbreviationName: 'EVAL_CODE',
      //   logicalDataTypeName: 'VARCHAR2(20)',
      // };

      const relatedColumResponse = await getRelatedColumnListV2(
        relatedColumData
      );

      console.log('relatedColumResponse : ', relatedColumResponse);

      // 연관컬럼이 존재하는 경우
      if (relatedColumResponse.data.length > 0) {
        relationColumnState.view = true;
        termRelationList.value = {
          relatedColumData: relatedColumData,
          termRelationList: relatedColumResponse.data,
        };
        // onRelationColumn();
        return;
      }

      const response = await manageTermV2(termDetailsQuery);

      console.log('폐기등록 결과 : ', response);
      if (response.status === 409 && response.data.code === 1226) {
        const errorMessages = {
          state: 'error',
          stateName: 'duplicate',
          errorTitle: '용어 중복 오류메시지',
          errorMessages: [
            '작업영역에 동일한 용어가 존재하여 해당 용어를 신규등록 할 수 없습니다. 해당 용어의 용어명/용어영문약어명/도메인명을 확인해주세요.',
          ],
        };
        onOpenTermValidationErrorWindow(errorMessages);
        return;
      }
      // termDetailsQuery.jobDivisionCode = 'DELETE';
    } else if (termDetailsData.selectType.type === 'restore') {
      const response = await manageTermV2(termDetailsQuery);
      termDetailsQuery.jobDivisionCode = 'RESTORE';
      console.log('복구등록 결과 : ', response);
      if (response.status === 409) {
        setAlertStatus({
          view: true,
          message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
        });
        return;
      }
    } else if (termDetailsData.selectType.type === 'delete') {
      const response = await manageTermV2(termDetailsQuery);
      termDetailsQuery.jobDivisionCode = 'DELETE';
      console.log('삭제등록 결과 : ', response);
      if (response.status === 409) {
        setAlertStatus({
          view: true,
          message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
        });
        return;
      }
    }

    setIsTermJobSave(true);
    setIsTermJobApproval(true);
  };

  // 작업 용어 상세 할당
  const apiGetTermJobInfo = async (termDetailsDataInfo) => {
    const waitForOptions = () => {
      if (nonStandardReasonOptions.length > 2) {
        // searchNonStandardReasonCode();
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
      selectTermType.value = resultData.termTypeCodeEnum;

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
        resultData.nonStandardReasonContents;
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
      termDetailsData.logicalDataTypeAbbreviationName =
        resultData.logicalDataTypeAbbreviationName;

      if (resultData.nonStandardReasonName) {
        console.log(
          'resultData.nonStandardReasonName : ',
          resultData.nonStandardReasonName
        );
        console.log('nonStandardReasonOptions : ', nonStandardReasonOptions);

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

  //초기화
  const resetConfirmState = reactive({
    view: false,
    message: '초기화 하시겠습니까?',
  });
  const onResetConfirm = () => {
    resetConfirmState.view = true;
  };
  const onReset = async () => {
    // console.log('초기화 실행');
    // // 작업구분 : 신규등록 초기화
    // if (termDetailsData.selectType.type === 'new') {
    //   emptyTermDetailsData();
    // } else {
    //   // 작업구분 : 변경등록 초기화
    //   console.log('변경등록 시 초기화 실행');

    //   console.log('termDetailsData : ', termDetailsData);
    //   console.log('termRowData : ', termRowData);

    //   const termRowDataInfo = termRowData.value;

    //   const termBaseQuery = {
    //     instituteId: termRowDataInfo.instituteId,
    //     dictionaryId: termRowDataInfo.dictionaryId,
    //     termName: termRowDataInfo.termName,
    //     termAbbreviationName: termRowDataInfo.termAbbreviationName,
    //     domainName: termRowDataInfo.domainName,
    //   };
    //   const termDetailsDataInfo = await getTermDetailsV2(termBaseQuery);
    //   apiGetTermBaseInfo(termDetailsDataInfo);
    //   onSelectReg(1);
    // }
    apiGetTermJobInfo(termJobRowData);
    // onSelectReg(1);
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

  // 도메인검색 Params
  const domainRequestPrams = reactive({
    instituteId: useMetaMngInstId,
    dictionaryId: useDctnryId,
    domainGroupName: '',
    jobTypeCode: 'CUR',
  });

  // 무결성 체크 팝업 상태
  const termValidationErrorWindowView = ref(false);
  // 무결성체크 팝업 열기
  const onOpenTermValidationErrorWindow = (messages) => {
    termErrorMessaages.value = messages;

    termValidationErrorWindowView.value = true;
  };
  // 취소
  const onCloseTermValidationErrorWindow = () => {
    termValidationErrorWindowView.value = false;
  };
  // 확인
  const onTermValidationErrorSave = (data) => {
    console.log('data : ', data);

    // 비표준용어로 등록
    if (data.stateName === 'nonStandard') {
      termDetailsData.standardDivision = 'N';
      selectNonStandardReason.value = '30';
    } else if (data.stateName === 'synonym') {
      termDetailsData.termType = 'SYNONYM';
    } else if (data.stateName === 'duplicate' || data.stateName === 'error') {
      termValidationErrorWindowView.value = false;
      return;
    }

    termValidationErrorWindowView.value = false;

    // 임시저장을 위한 true 전달
    onTermJobUpdate(true);
  };

  watch(
    () => selectCodeType.value,
    (newVal) => {
      termDetailsData.codeTypeName = newVal;
    }
  );

  // 셀렉트박스에서 선택이 변경될 때 호출되는 핸들러 함수
  const handleCodeTypeChange = () => {
    // 선택된 코드 유형에 따라 codeName 초기화
    if (selectCodeType.value === 'INDIVIDUAL_CODE') {
      termDetailsData.codeName = '';
    } else if (selectCodeType.value === 'UNITY_CODE') {
      termDetailsData.codeName = '';
    } else {
      termDetailsData.codeName = '';
    }
  };

  // // 코드유형 변경 시 초기화
  // watch(
  //   () => termDetailsData.codeTypeName,
  //   (newVal, oldVal) => {
  //     if (newVal === 'INDIVIDUAL_CODE') {
  //       termDetailsData.codeName = '';
  //     } else if (newVal === 'UNITY_CODE') {
  //       termDetailsData.codeName = '';
  //     } else {
  //       termDetailsData.codeName = '';
  //     }
  //   }
  // );

  // 용어명 store 값 변경 감지
  // watch(
  //   () => termJobData.value,
  //   async (newVal) => {
  //     showAnimate.value = true;

  //     setTimeout(() => {
  //       showAnimate.value = false;
  //     }, 500);

  //     const termDetailsDataInfo = newVal;

  //     termRowData.value = termDetailsDataInfo;

  //     apiGetTermBaseInfo(termDetailsDataInfo);
  //     onSelectReg(3);
  //   }
  // );
  watch(
    () => selectTermData.value,
    async (newVal) => {
      showAnimate.value = true;

      setTimeout(() => {
        showAnimate.value = false;
      }, 500);

      const termDetailsDataInfo = newVal;

      termRowData.value = termDetailsDataInfo;

      apiGetTermBaseInfo(termDetailsDataInfo);
      onSelectReg(3);
    }
  );

  // 용어 작업 기존값 저장
  const termJobRowData = reactive({});
  // // 용어 작업 데이터 감시
  // watch(
  //   () => termJobUpdateData.value,
  //   (newVal) => {
  //     showAnimate.value = true;

  //     setTimeout(() => {
  //       showAnimate.value = false;
  //     }, 500);

  //     console.log('termJobUpdateData : ', termJobUpdateData.value);
  //     if (newVal) {
  //       termJobRowData.value = newVal;
  //       apiGetTermJobInfo(termJobRowData);
  //     }
  //   }
  // );
  watch(
    () => selectTermJobData.value,
    async (newVal) => {
      showAnimate.value = true;

      setTimeout(() => {
        showAnimate.value = false;
      }, 500);

      console.log('termJobUpdateData : ', termJobUpdateData.value);
      if (newVal) {
        // await searchNonStandardReasonCode();

        termJobRowData.value = newVal;
        apiGetTermJobInfo(termJobRowData);
      }
    }
  );

  // 표준구분 변경 시
  watch(
    () => termDetailsData.standardDivision,
    (value) => {
      console.log('표준구분 변경 value : ', value);
      if (value === 'Y') {
        selectNonStandardReason.value = '';
      }
    }
  );

  // 비표준 사유 기타 변경 시
  watch(
    () => selectNonStandardReason.value,
    (value) => {
      console.log('비표준사유 변경 value : ', value);

      // 옵션이 초기화 된 경우에만 실행
      if (nonStandardReasonOptions.length > 2) {
        const foundOption = nonStandardReasonOptions.find(
          (item) => item.value === value
        );

        if (foundOption) {
          console.log('foundOption : ', foundOption);
          const noneStandardReason = foundOption.text;
          console.log('noneStandardReason : ', noneStandardReason);
          termDetailsData.nonStandardReasonCode = foundOption.value;
          // termDetailsData.nonStandardReasonContents = noneStandardReason;

          if (value === '90' && noneStandardReason === '기타') {
            console.log('비표준사유 변경 value : ', value);
            onOpenAdditionalReasonsWindow();
          }
        }
      }
    }
  );

  //
</script>

<style scoped></style>
