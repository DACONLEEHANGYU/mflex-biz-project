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
          <button
            v-if="!jobUpdateYn"
            title="신규등록"
            class="btn-s add-reg"
            @click="onSelectReg(0)"
          >
            신규등록
          </button>
          <button
            v-if="wordDetailsData.discardYn === false"
            class="btn-s change-reg"
            @click="onSelectReg(1)"
            :disabled="
              isSelectType == 'new' ||
              wordDetailsData.jobDivisionCode != 'R' ||
              wordDetailsData.typeCode === '40' ||
              wordDetailsData.typeCode === '50'
            "
            title="변경등록"
          >
            변경등록
          </button>
          <button
            class="btn-s remove-reg"
            v-if="wordDetailsData.discardYn === false"
            @click="onSelectReg(2)"
            :disabled="
              isSelectType == 'new' ||
              isSelectType == 'delete' ||
              isSelectType == 'modify' ||
              isSelectType == 'restore' ||
              wordDetailsData.jobDivisionCode != 'R' ||
              wordDetailsData.typeCode === '40' ||
              wordDetailsData.typeCode === '50'
            "
            title="폐기등록"
          >
            폐기등록
          </button>
          <button
            v-if="wordDetailsData.discardYn === true"
            class="btn-s restore-reg"
            :disabled="
              wordDetailsData.jobDivisionCode != 'R' ||
              wordDetailsData.typeCode === '40' ||
              wordDetailsData.typeCode === '50'
            "
            @click="onSelectReg(4)"
            title="복구등록"
          >
            복구등록
          </button>
          <button
            v-if="wordDetailsData.discardYn === true"
            class="btn-s delete-reg"
            :disabled="
              wordDetailsData.jobDivisionCode != 'R' ||
              wordDetailsData.typeCode === '40' ||
              wordDetailsData.typeCode === '50'
            "
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
            :disabled="
              isSelectType == 'search' ||
              (wordDetailsData.wordSourceCode == 'JOB' &&
                (isSelectType == 'delete' ||
                  isSelectType == 'discard' ||
                  isSelectType == 'restore')) ||
              wordDetailsData.wordName == ''
            "
            class="btn-s green save-btn"
            title="저장"
            @click="onJobWordSaveConfirm"
          >
            저장
          </button>
          <button
            class="btn-s delete-btn"
            :disabled="isSelectType == 'search'"
            @click="onCancelConfirm"
            title="취소"
          >
            취소
          </button>
          <button
            :disabled="
              isSelectType == 'search' ||
              isSelectType == 'delete' ||
              isSelectType == 'discard' ||
              isSelectType == 'restore' ||
              wordDetailsData.wordName == ''
            "
            class="btn-s reset-btn"
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
          <col width="16%" />
          <col width="" />
        </colgroup>
        <tbody class="tbody-class">
          <tr>
            <th>작업구분</th>
            <td class="manage-input-form-td" style="display: flex">
              <div class="td-col">
                <div
                  class="application-category__icon"
                  :class="wordDetailsData.selectType.type"
                >
                  {{ wordDetailsData.selectType.label }}
                </div>
              </div>
              <div
                v-if="
                  wordDetailsData.wordTypeName != '분류어' &&
                  wordDetailsData.wordTypeName != '일반어'
                "
                style="padding-top: 8px; margin-left: 15px"
              >
                {{ wordDetailsData.wordTypeName }}
              </div>
            </td>
            <th class="required">*제개정일자</th>
            <td class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <div>
                  <input
                    class="input-date"
                    type="date"
                    :readonly="isReadonly || isSelectType == 'job-remove'"
                    placeholder=""
                    v-model="wordDetailsData.revisionDate"
                    style="width: 100%; margin-right: 10px"
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*단어명</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <input
                  class="input-text"
                  type="text"
                  :readonly="
                    isReadonly ||
                    isSelectType == 'modify' ||
                    isSelectType == 'discard' ||
                    isSelectType == 'restore' ||
                    isSelectType == 'delete'
                  "
                  placeholder=""
                  style="width: 100%"
                  v-model="wordDetailsData.wordName"
                />
              </div>
            </td>
            <th class="required">*단어유형</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div
                  v-if="
                    wordDetailsData.typeCode === '30' ||
                    wordDetailsData.typeCode === '40' ||
                    wordDetailsData.typeCode === '50'
                  "
                >
                  {{ wordDetailsData.wordTypeName }}
                </div>
                <select
                  v-else
                  class="input-select wordtype-select"
                  style="width: 150px"
                  v-model="wordDetailsData.typeName"
                  :disabled="
                    isReadonly ||
                    // isSelectType == 'modify' ||
                    isSelectType == 'discard' ||
                    isSelectType == 'restore' ||
                    isSelectType == 'delete'
                  "
                >
                  <option
                    v-for="option in wordTypeOptions"
                    :value="option.value"
                    :key="option.value"
                  >
                    {{ option.text }}
                  </option>
                </select>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*단어영문약어명</th>
            <td colspan="3" class="manage-input-form-td">
              <div class="td-col">
                <div class="col-row">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="wordDetailsData.abbreviationName"
                    :disabled="
                      isReadonly ||
                      isSelectType == 'modify' ||
                      isSelectType == 'discard' ||
                      isSelectType == 'restore' ||
                      isSelectType == 'delete'
                    "
                    @input="onFilterNonAlphabetic"
                  />
                  <button
                    class="btn-s dark-gray ml5"
                    @click="onOpenWordNameSearchWindow"
                    :disabled="
                      isReadonly ||
                      isSelectType == 'modify' ||
                      isSelectType == 'discard' ||
                      isSelectType == 'restore' ||
                      isSelectType == 'delete'
                    "
                  >
                    타표준&nbsp검색
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*단어영문명</th>
            <td colspan="3" class="manage-input-form-td">
              <div class="td-col">
                <div class="col-row">
                  <input
                    class="input-text"
                    type="text"
                    :readonly="
                      isReadonly ||
                      isSelectType == 'discard' ||
                      isSelectType == 'restore' ||
                      isSelectType == 'delete'
                    "
                    placeholder=""
                    style="width: 100%"
                    v-model="wordDetailsData.englishName"
                  />
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th>도메인분류명</th>
            <td colspan="3" class="manage-input-form-td">
              <div class="td-col">
                <div class="col-row">
                  <div
                    class="dictionary_up_name_div"
                    style="padding-top: 4px; line-height: 1.5; width: 100%"
                    :style="
                      wordDetailsData.selectType.type === 'search' ||
                      wordDetailsData.typeName != 'CLASSIFICATION'
                        ? { 'background-color': '#f5f5f5', color: '#999999' }
                        : {}
                    "
                  >
                    {{ wordDetailsData.domainClassName }}
                  </div>
                  <button
                    class="btn-s search-btn dark-gray ml5"
                    @click="onOpenDomainClassSearchWindow"
                    :disabled="
                      isReadonly ||
                      // isSelectType == 'modify' ||
                      isSelectType == 'discard' ||
                      isSelectType == 'restore' ||
                      isSelectType == 'delete' ||
                      wordDetailsData.typeName != 'CLASSIFICATION'
                    "
                    title="도메인분류 검색"
                  >
                    검색
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th class="required">*단어설명</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col">
                <textarea
                  style="height: 90px"
                  :readonly="
                    isReadonly ||
                    isSelectType == 'discard' ||
                    isSelectType == 'restore' ||
                    isSelectType == 'delete'
                  "
                  v-model="wordDetailsData.explain"
                  placeholder="설명을 입력하세요"
                ></textarea>
              </div>
            </td>
          </tr>
          <tr>
            <th>최종수정자</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div class="td-col">
                  {{ wordDetailsData.updater }}
                </div>
              </div>
            </td>
            <th>최종수정일시</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div class="td-col">
                  {{ wordDetailsData.updateDateTime }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <!-- 저장 알림창 -->
  <AppDialog
    v-model:view="saveWordConfirmState.view"
    :title="saveWordConfirmState.title"
    :message="saveWordConfirmState.message"
    @confirm="onWordIntegrityCheck"
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
    @confirm="onUserJobReset"
  />

  <!-- 타표준 검색 -->
  <AppWindow
    :view="wordNameSearchWindowView"
    :moveState="true"
    @close="onCloseWordNameSearchWindow"
    width="930px"
    height="auto"
  >
    <WordNameSearchWindow
      :wordName="wordDetailsData.wordName"
      @confirm="onWordNameSearchConfirm"
      @close="onCloseWordNameSearchWindow"
    />
  </AppWindow>

  <!-- 연관용어 -->
  <AppWindow
    :view="relatedTermsWindowView"
    @close="onCloseRelatedTermsWindow"
    width="840px"
    height="auto"
  >
    <RelatedTermsWindow
      :relationTermList="relationTermList"
      :selectWord="wordDetailsData"
      @confirm="onRelatedTermsConfirm"
      @close="onCloseRelatedTermsWindow"
    />
  </AppWindow>

  <!-- 도메인분류 검색팝업 -->
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

  <!-- 무결성 체크 팝업-->
  <AppWindow
    :view="wordValidationErrorWindowView"
    @close="onCloseWordValidationErrorWindow"
    width="700px"
    height="auto"
  >
    <TermValidationErrorWindow
      :errorMessage="wordErrorMessages"
      @confirm="onWordValidationErrorSave"
      @close="onCloseWordValidationErrorWindow"
    />
  </AppWindow>

  <AppDialog
    v-model:view="relationTermState.view"
    :title="relationTermState.title"
    :message="relationTermState.message"
    :type="relationTermState.type"
    @relationTermList="onOpenRelatedTermsWindow"
  />
</template>

<script setup>
  import {
    reactive,
    ref,
    watch,
    computed,
    defineProps,
    defineEmits,
  } from 'vue';

  import { useAuthStore } from '@/stores/auth';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { storeToRefs } from 'pinia';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAlert } from '@/composables/alert';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import RelatedTermsWindow from '@/components/popWindow/RelatedTermsWindow.vue';
  import DomainClassSearchWindow from '@/components/popWindow/DomainClassSearchWindow.vue';
  import WordNameSearchWindow from '@/components/popWindow/WordNameSearchWindow.vue';
  import TermValidationErrorWindow from '@/components/popWindow/TermValidationErrorWindow.vue';
  import {
    getWordCheckIntegrityV2, // 단어관리 - 무결성 체크
    manageWordV2, // 작업 등록
    getRelatedWordListV2, // 연관용어 목록
    getRelatedWordClassificationListV2, // 분류어로 사용된 용어 조회회
    getUpdateWordV2, // 단어관리 - 단어 수정
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api';

  const props = defineProps(['wordData', 'jobUpdateYn']);
  const emit = defineEmits(['onWordSave']);

  const authStore = useAuthStore();
  const dictionaryMngStore = useDictionaryMngStore();
  const { setIsWordJobSave, setIsWordJobApproval, setIsWordJobCancel } =
    dictionaryMngStore;
  const { wordJobData, wordJobUpdateData } = storeToRefs(dictionaryMngStore);
  const { setAlertStatus, alertInfos } = useAlert();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId, useDctnryId } = userStngInfo.value;

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  console.log('userInfo : ', userInfo);
  const updater = `${userInfo.value.userNm}(${userInfo.value.userId})`;
  const updateDateTime = new Date();
  const formattedDateTime = updateDateTime.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // 24시간 형식
  });

  const formatted = formattedDateTime.replace(/. /g, '-').replace('. ', ' '); // 형식 변환

  const showAnimate = ref(false);

  const regType = reactive([
    { id: 0, label: '신규등록', type: 'new' },
    { id: 1, label: '변경등록', type: 'modify' },
    { id: 2, label: '폐기등록', type: 'discard' },
    { id: 3, label: '자료조회', type: 'search' },
    { id: 4, label: '복구등록', type: 'restore' },
    { id: 5, label: '삭제등록', type: 'delete' },
  ]);

  const onSelectReg = (value) => {
    wordDetailsData.selectType = regType[value];

    // 신규등록 버튼 클릭 시 초기화
    if (wordDetailsData.selectType.id == 0) {
      wordDetailsData.selectType.type = 'new';
      console.log('단어등록 input 초기화 ===');
      jobState.value = false;
      resetWordDetailsData();
    } else if (value == 1) {
      apiGetWordBaseInfo(wordJobRowData);
      wordDetailsData.selectType = regType[value];
    } else if (value == 2) {
      apiGetWordBaseInfo(wordJobRowData);
      wordDetailsData.selectType = regType[value];
    }
  };

  // 선택 타입에 따른 렌더링 여부
  const isSelectType = computed(() => {
    if (wordDetailsData.selectType.type === 'search') {
      return 'search';
    }
    if (wordDetailsData.selectType.type === 'new') {
      return 'new';
    }
    if (wordDetailsData.selectType.type === 'modify') {
      return 'modify';
    }
    if (wordDetailsData.selectType.type === 'discard') {
      return 'discard';
    }
    if (wordDetailsData.selectType.type === 'restore') {
      return 'restore';
    }
    if (wordDetailsData.selectType.type === 'delete') {
      return 'delete';
    }
    return 'search';
  });

  // readonly 여부
  const isReadonly = computed(() => {
    return isSelectType.value === 'search' || isSelectType.value === 'remove';
  });

  const wordErrorMessages = ref('');

  // 단어유형 목록
  const wordTypeOptions = ref([
    { text: '선택', value: '' },
    { text: '일반어', value: 'GENERAL' },
    { text: '분류어', value: 'CLASSIFICATION' },
  ]);

  const selectWordType = ref(wordTypeOptions.value[0].value);

  // 작업 가능 상태
  const jobState = ref(false);

  const wordDetailsData = reactive({
    selectType: { id: 3, label: '자료조회', type: 'search' },
    managementInstituteId: useMetaMngInstId,
    wordDictionaryId: useDctnryId,
    wordName: '',
    abbreviationName: '',
    englishName: '',
    typeCode: '',
    typeName: selectWordType.value,
    explain: '',
    similarYn: false,
    discardYn: false,
    similarDivisionCode: '',
    similarDivisionName: '',
    domainClassName: '',
    enactContext: '',
    enactCycle: '',
    enactDate: '',
    revisionCycle: '',
    revisionDate: '',
    updater: updater,
    updateDateTime: formatted,
    wordData: [
      {
        id: '',
        type: '',
        label: '',
        color: '',
        bgColor: '',
        size: 55,
      },
    ],
  });

  // 단어등록 input 초기화
  const resetWordDetailsData = () => {
    if (wordDetailsData.selectType.type === 'new') {
      emptyWordDetailsData();
    } else if (wordDetailsData.selectType.type === 'modify') {
      // 변경등록 초기화
    }
  };

  // 선택 데이터 바인딩
  const apiGetWordBaseInfo = (wordDetailsDataInfo) => {
    console.log('apiGetWordBaseInfo : ', wordDetailsDataInfo);

    // const wordDetails = wordDetailsDataInfo.value.data;
    const wordDetails = wordDetailsDataInfo.value
      ? wordDetailsDataInfo.value
      : wordDetailsDataInfo;

    wordDetailsData.selectType = regType[3];
    wordDetailsData.instituteId = wordDetails.instituteId;
    wordDetailsData.dictionaryId = wordDetails.dictionaryId;
    wordDetailsData.jobDivisionCode = wordDetails.jobDivisionCode;
    wordDetailsData.jobDivisionName = wordDetails.jobDivisionName;
    wordDetailsData.discardYn = wordDetails.discardYn;
    wordDetailsData.wordDictionaryId = wordDetails.dictionaryId;
    wordDetailsData.wordName = wordDetails.wordName;
    wordDetailsData.abbreviationName = wordDetails.wordAbbreviationName;
    wordDetailsData.englishName = wordDetails.wordEnglishName;
    wordDetailsData.typeCode = wordDetails.wordTypeCode;
    // wordDetailsData.typeName =
    //   wordDetails.wordTypeName == '일반어' ? 'GENERAL' : 'CLASSIFICATION';
    wordDetailsData.typeName = wordDetails.wordTypeCodeEnum;
    wordDetailsData.wordTypeName = wordDetails.wordTypeName;
    wordDetailsData.wordSourceCode = wordDetails.wordSourceCode;
    wordDetailsData.explain = wordDetails.wordExplain;
    wordDetailsData.domainClassName = wordDetails.domainClassName;
    wordDetailsData.revisionDate = wordDetails.revisionDate;
    wordDetailsData.updater = wordDetails.updater;
    wordDetailsData.updateDateTime = wordDetails.updateDateTime;
    wordDetailsData.jobState = jobState.value;
  };

  // 작업 단어 데이터 바인딩
  const apiGetJobWordBaseInfo = (wordDetailsDataInfo) => {
    console.log('apiGetWordBaseInfo : ', wordDetailsDataInfo);

    // const wordDetails = wordDetailsDataInfo.value.data;
    const wordDetails = wordDetailsDataInfo.value
      ? wordDetailsDataInfo.value
      : wordDetailsDataInfo;

    let type;

    switch (wordDetails.jobDivisionCode) {
      case 'C':
        type = 0;
        break;
      case 'U':
        type = 1;
        break;
      case 'X':
        type = 2;
        break;
      case 'V':
        type = 4;
        break;
      case 'D':
        type = 5;
        break;
      default:
        type = 'search';
        break;
    }

    wordDetailsData.selectType = regType[type];
    wordDetailsData.instituteId = wordDetails.instituteId;
    wordDetailsData.dictionaryId = wordDetails.dictionaryId;
    wordDetailsData.jobDivisionCode = wordDetails.jobDivisionCode;
    wordDetailsData.jobDivisionName = wordDetails.jobDivisionName;
    wordDetailsData.discardYn = wordDetails.discardYn;
    wordDetailsData.wordDictionaryId = wordDetails.dictionaryId;
    wordDetailsData.wordName = wordDetails.wordName;
    wordDetailsData.abbreviationName = wordDetails.wordAbbreviationName;
    wordDetailsData.englishName = wordDetails.wordEnglishName;
    wordDetailsData.typeCode = wordDetails.wordTypeCode;
    // wordDetailsData.typeName =
    //   wordDetails.wordTypeName == '일반어' ? 'GENERAL' : 'CLASSIFICATION';
    wordDetailsData.typeName = wordDetails.wordTypeCodeEnum;
    wordDetailsData.wordTypeName = wordDetails.wordTypeName;
    wordDetailsData.explain = wordDetails.wordExplain;
    wordDetailsData.domainClassName = wordDetails.domainClassName;
    wordDetailsData.revisionDate = wordDetails.revisionDate;
    wordDetailsData.updater = wordDetails.updater;
    wordDetailsData.updateDateTime = wordDetails.updateDateTime;
    wordDetailsData.jobWordId = wordDetails.jobWordId;
    wordDetailsData.wordSourceCode = wordDetails.wordSourceCode;
    wordDetailsData.jobState = jobState.value;
  };

  //저장
  const saveWordConfirmState = reactive({
    view: false,
    message: '작업 내용을 저장하시겠습니까?',
  });

  const onJobWordSaveConfirm = () => {
    if (wordDetailsData.wordName === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = '단어명을 입력해 주십시오.';
      return;
    }

    if (wordDetailsData.abbreviationName === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = '단어영문약어명을 입력해 주십시오.';
      return;
    }
    // 전체 길이 체크 (영문+한글 혼합)
    if (wordDetailsData.abbreviationName.length > 10) {
      alertInfos.value = {
        view: true,
        message: '영문약어명은 총 10자 이내로 입력해 주십시오.',
      };
      return false;
    }
    if (
      wordDetailsData.typeName === '' ||
      wordDetailsData.typeName === '선택'
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message = '단어유형을 선택해 주십시오.';
      return;
    }
    if (wordDetailsData.revisionDate === '') {
      alertInfos.value.view = true;
      alertInfos.value.message = '제개정일자를 입력해주세요.';
      return;
    }
    if (
      wordDetailsData.typeName === 'CLASSIFICATION' &&
      (wordDetailsData.domainClassName === '' ||
        wordDetailsData.domainClassName === null)
    ) {
      alertInfos.value.view = true;
      alertInfos.value.message =
        '단어유형이 분류어인 경우 도메인분류명을 입력해주세요.';
      return;
    }
    // if (wordDetailsData.explain === '') {
    //   alertInfos.value.view = true;
    //   alertInfos.value.message = '단어설명을 입력해주세요.';
    //   return;
    // }
    saveWordConfirmState.view = true;
  };

  const onWordIntegrityCheck = async () => {
    console.log('wordDetailsData : ', wordDetailsData);

    const wordCheckData = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      wordName: wordDetailsData.wordName,
      wordAbbreviationName: wordDetailsData.abbreviationName,
      wordTypeCode: wordDetailsData.typeName,
      domainClassName: wordDetailsData.domainClassName,
    };

    const wordCheckIntegrityResult = await getWordCheckIntegrityV2(
      wordCheckData
    );

    if (
      wordCheckIntegrityResult.status === 400 &&
      wordCheckIntegrityResult.data.code === 1000
    ) {
      const errorMessages = {
        state: 'validation',
        stateName: 'noneDomainClassName',
        errorTitle: '도메인분류명 미입력',
        errorMessages: [`${wordCheckIntegrityResult.data.message}`],
      };
      onOpenWordValidationErrorWindow(errorMessages);
      return;
    }

    console.log('wordCheckIntegrityResult : ', wordCheckIntegrityResult);

    console.log(
      'wordDetailsData.wordSourceCode : ',
      wordDetailsData.wordSourceCode
    );

    if (
      wordDetailsData.wordSourceCode === 'MNG' ||
      wordDetailsData.wordSourceCode === undefined
    ) {
      await onUserJobWordSave();
    } else {
      await onUserJobWordUpdate();
    }
  };

  // 단어 작업 저장
  const onUserJobWordSave = async (isTemporary) => {
    console.log('wordDetailsData : ', wordDetailsData);

    let jobDivisionCode; // 변수를 미리 선언

    switch (wordDetailsData.selectType.type) {
      case 'new':
        jobDivisionCode = 'NEW';
        break;
      case 'modify':
        jobDivisionCode = 'MODIFY';
        break;
      case 'discard':
        jobDivisionCode = 'DISCARD';
        break;
      case 'restore':
        jobDivisionCode = 'RESTORE';
        break;
      case 'delete':
        jobDivisionCode = 'DELETE';
        break;
      default:
        jobDivisionCode = 'NEW'; // 기본값
    }

    const wordManageData = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      jobTypeCode: 'STD',
      jobDivisionCode: jobDivisionCode,
      wordName: wordDetailsData.wordName,
      wordAbbreviationName: wordDetailsData.abbreviationName,
      wordEnglishName: wordDetailsData.englishName,
      wordExplain: wordDetailsData.explain,
      wordTypeCode: wordDetailsData.typeName,
      domainClassName: wordDetailsData.domainClassName,
      revisionDate: wordDetailsData.revisionDate,
    };

    // // 연관용어 체크
    // const relationWordList = await getRelationWordList(wordRelationColumnQuery);
    const response = await manageWordV2(wordManageData);
    console.log('response : ', response);

    let errorMessages = {};

    if (response.status === 409) {
      if (response.status === 409 && response.data.code === 1227) {
        errorMessages = {
          state: 'error',
          stateName: 'duplicate',
          errorTitle: '단어명 중복 확인 메시지',
          errorMessages: ['동일한 단어명이 이미 존재합니다.'],
        };
      } else if (response.status === 409 && response.data.code === 1251) {
        errorMessages = {
          state: 'error',
          stateName: 'error',
          errorTitle: '중복 단어 존재',
          errorMessages: [
            '중복된 단어가 존재합니다. 단어명과 단어영문약어명을 확인해 주세요.',
          ],
        };
      } else if (response.status === 409 && response.data.code === 1223) {
        errorMessages = {
          state: 'error',
          stateName: 'error',
          errorTitle: '동일 단어명 확인 메시지',
          errorMessages: [
            '동일한 단어명에 동음이의어가 존재합니다. 기존 단어 삭제 후 등록해주시기 바랍니다.',
          ],
        };
      } else if (response.status === 409 && response.data.code === 1224) {
        errorMessages = {
          state: 'error',
          stateName: 'synonym',
          errorTitle: '동일 단어영문약어명 확인 메시지',
          errorMessages: [
            '동일한 단어영문약어명이 이미 존재합니다. 해당 작업단어를 이음동의어로 등록하시겠습니까?',
          ],
        };
      } else if (response.status === 409 && response.data.code === 1225) {
        errorMessages = {
          state: 'error',
          stateName: 'duplicate',
          errorTitle: '상이한 도메인',
          errorMessages: ['도메인명이 다른 단어가 존재합니다.'],
        };
      } else if (response.status === 409 && response.data.code === 1228) {
        errorMessages = {
          state: 'error',
          stateName: 'relation',
          errorTitle: '연관용어 확인메시지',
          errorMessages: [
            '분류어를 사용한 연관용어가 있어 단어유형과 도메인분류명 변경이 불가능 합니다. 변경 작업을 원하시면 우선 연관용어를 변경/삭제 처리해 주시기 바랍니다.',
          ],
        };
      } else if (response.status === 409 && response.data.code === 1231) {
        errorMessages = {
          state: 'error',
          stateName: 'relation',
          errorTitle: '연관용어 확인메시지',
          errorMessages: [
            '연관용어가 있어 해당 작업은 실행이 불가능 합니다. 작업을 취소하고 연관용어 변경/삭제 처리를 먼저 수행해 주시기 바랍니다.',
          ],
        };
      } else {
        errorMessages = {
          state: 'error',
          stateName: 'error',
          errorTitle: '작업등록 실패',
          errorMessages: [
            '등록하는 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. 문제가 지속되면 관리자에게 문의해 주세요.',
          ],
        };
      }
      onOpenWordValidationErrorWindow(errorMessages);
      return;
    }

    setIsWordJobApproval(true);
    setIsWordJobSave(true);
  };

  // 작업 수정
  const onUserJobWordUpdate = async () => {
    console.log('작업수정 - wordDetailsData : ', wordDetailsData);

    let jobDivisionCode; // 변수를 미리 선언

    switch (wordDetailsData.jobDivsionCode) {
      case 'C':
        jobDivisionCode = 'NEW';
        break;
      case 'U':
        jobDivisionCode = 'MODIFY';
        break;
      case 'X':
        jobDivisionCode = 'DISCARD';
        break;
      case 'V':
        jobDivisionCode = 'RESTORE';
        break;
      case 'D':
        jobDivisionCode = 'DELETE';
        break;
      default:
        jobDivisionCode = 'NEW'; // 기본값
    }

    const updateData = {
      instituteId: wordDetailsData.managementInstituteId,
      dictionaryId: wordDetailsData.dictionaryId,
      jobTypeCode: 'STD',
      jobWordId: wordDetailsData.jobWordId,
      jobDivisionCode: jobDivisionCode,
      wordName: wordDetailsData.wordName,
      wordAbbreviationName: wordDetailsData.abbreviationName,
      wordEnglishName: wordDetailsData.englishName,
      wordExplain: wordDetailsData.explain,
      wordTypeCode: wordDetailsData.typeName,
      domainClassName: wordDetailsData.domainClassName,
      revisionDate: wordDetailsData.revisionDate,
    };

    const response = await getUpdateWordV2(updateData);
    console.log('response : ', response);

    let errorMessages;

    if (response.status === 409) {
      if (response.status === 409 && response.data.code === 1227) {
        errorMessages = {
          state: 'error',
          stateName: 'duplicate',
          errorTitle: '단어명 중복 확인 메시지',
          errorMessages: ['동일한 단어명이 이미 존재합니다.'],
        };
      } else if (response.status === 409 && response.data.code === 1223) {
        errorMessages = {
          state: 'error',
          stateName: 'error',
          errorTitle: '동일 단어명 확인 메시지',
          errorMessages: [
            '동일한 단어명에 동음이의어가 존재합니다. 기존 단어 삭제 후 등록해주시기 바랍니다.',
          ],
        };
      } else if (response.status === 409 && response.data.code === 1224) {
        errorMessages = {
          state: 'error',
          stateName: 'synonym',
          errorTitle: '동일 단어영문약어명 확인 메시지',
          errorMessages: [
            '동일한 단어영문약어명이 이미 존재합니다. 해당 작업단어를 이음동의어로 등록하시겠습니까?',
          ],
        };
      } else if (response.status === 409 && response.data.code === 1225) {
        errorMessages = {
          state: 'error',
          stateName: 'duplicate',
          errorTitle: '상이한 도메인',
          errorMessages: ['도메인명이 다른 단어가 존재합니다.'],
        };
      } else if (response.status === 409 && response.data.code === 1228) {
        errorMessages = {
          state: 'error',
          stateName: 'relation',
          errorTitle: '연관용어 확인메시지',
          errorMessages: [
            '분류어를 사용한 연관용어가 있어 단어유형과 도메인분류명 변경이 불가능 합니다. 변경 작업을 원하시면 우선 연관용어를 변경/삭제 처리해 주시기 바랍니다.',
          ],
        };
      } else if (response.status === 409 && response.data.code === 1231) {
        errorMessages = {
          state: 'error',
          stateName: 'relation',
          errorTitle: '연관용어 확인메시지',
          errorMessages: [
            '연관용어가 있어 해당 작업은 실행이 불가능 합니다. 작업을 취소하고 연관용어 변경/삭제 처리를 먼저 수행해 주시기 바랍니다.',
          ],
        };
      } else {
        errorMessages = {
          state: 'error',
          stateName: 'error',
          errorTitle: '작업등록 실패',
          errorMessages: [
            '등록하는 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. 문제가 지속되면 관리자에게 문의해 주세요.',
          ],
        };
      }
      onOpenWordValidationErrorWindow(errorMessages);
      return;
    }

    setIsWordJobApproval(true);
    setIsWordJobSave(true);
  };

  const relationTermState = reactive({
    title: '연관용어 오류메세지',
    view: false,
    type: 'relationColumn',
    message:
      '연관용어가 있어 해당 작업은 실행이 불가능 합니다. <br>작업을 취소하고 연관용어 변경/삭제 처리를 먼저 수행해 주시기 바랍니다.',
  });

  const relationTermList = reactive([]);

  //연관용어
  const relatedTermsWindowView = ref(false);
  const onOpenRelatedTermsWindow = () => {
    relatedTermsWindowView.value = true;
  };
  const onCloseRelatedTermsWindow = () => {
    relatedTermsWindowView.value = false;
  };
  const onRelatedTermsConfirm = () => {
    console.log('연과용어 확인');
    // onCloseDomainNameSearchWindow();
  };

  // 도메인검색 Params
  const domainRequestPrams = reactive({
    instituteId: useMetaMngInstId,
    dictionaryId: useDctnryId,
    domainGroupName: '',
    jobTypeCode: 'STD',
  });

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

    wordDetailsData.domainClassName = selectRow.domainClassName;

    onCloseDomainClassSearchWindow();
  };

  const onWordNameSearchConfirm = (selectRow) => {
    console.log('타표준 검색 확인');
    console.log('selectRow : ', selectRow);

    wordDetailsData.abbreviationName = selectRow.wordAbbreviationName;
    wordDetailsData.typeName =
      selectRow.wordTypeName === '일반어' ? 'GENERAL' : 'CLASSIFICATION';
    wordDetailsData.englishName = selectRow.wordEnglishName;
    wordDetailsData.explain = selectRow.wordExplain;
    wordDetailsData.domainClassName = selectRow.domainClassName;
  };

  // 작업 취소
  const cancelConfirmState = reactive({
    view: false,
    message: '작업을 취소하고 초기화면으로 돌아갑니다.<br>취소 하시겠습니까?',
  });
  const onCancelConfirm = () => {
    cancelConfirmState.view = true;
  };

  const onCancel = () => {
    setIsWordJobCancel(true);
  };

  //초기화
  const resetConfirmState = reactive({
    view: false,
    message: '작업을 초기화합니다.<br>초기화 하시겠습니까?',
  });
  const onResetConfirm = () => {
    resetConfirmState.view = true;
  };
  const onUserJobReset = () => {
    console.log('초기화 실행');

    if (wordDetailsData.selectType.type === 'new') {
      emptyWordDetailsData();
    } else {
      apiGetWordBaseInfo(wordJobRowData);
      onSelectReg(1);
    }
  };

  const wordNameSearchWindowView = ref(false);

  const onOpenWordNameSearchWindow = () => {
    console.log('단어명 검색창 열기');
    wordNameSearchWindowView.value = true;
  };

  const onCloseWordNameSearchWindow = () => {
    console.log('단어명 검색창 닫기');
    wordNameSearchWindowView.value = false;
  };

  // 무결성 체크 팝업 상태
  const wordValidationErrorWindowView = ref(false);
  // 무결성체크 팝업 열기
  const onOpenWordValidationErrorWindow = (messages) => {
    wordErrorMessages.value = messages;
    wordValidationErrorWindowView.value = true;
  };
  // 취소
  const onCloseWordValidationErrorWindow = () => {
    wordValidationErrorWindowView.value = false;
  };
  // 확인
  const onWordValidationErrorSave = async (data) => {
    if (data.stateName === 'synonym') {
      wordDetailsData.wordTypeCode = 'SYNONYM';
      wordDetailsData.typeName = 'SYNONYM';
    } else if (data.stateName === 'duplicate' || data.stateName === 'error') {
      wordValidationErrorWindowView.value = false;
      return;
    } else if (data.stateName === 'relation') {
      const relationParams = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        wordAbbreviationName: wordDetailsData.abbreviationName,
        wordName: wordDetailsData.wordName,
      };

      const relationList = await getRelatedWordListV2(relationParams);

      console.log('relationList : ', relationList);

      relationTermList.value = relationList.data;

      relatedTermsWindowView.value = true;
      wordValidationErrorWindowView.value = false;
      return;
    }

    if (wordDetailsData.wordSourceCode === 'MNG') {
      onUserJobWordSave();
    } else {
      onUserJobWordUpdate();
    }

    wordValidationErrorWindowView.value = false;
    // onUserJobWordSave();
  };

  const emptyWordDetailsData = () => {
    wordDetailsData.selectType = { id: 0, label: '신규등록', type: 'new' };
    wordDetailsData.managementInstituteId = useMetaMngInstId;
    wordDetailsData.wordDictionaryId = useDctnryId;
    wordDetailsData.wordName = '';
    wordDetailsData.abbreviationName = '';
    wordDetailsData.englishName = '';
    wordDetailsData.typeName = 'GENERAL';
    wordDetailsData.explain = '';
    wordDetailsData.similarYn = false;
    wordDetailsData.similarDivisionCode = '';
    wordDetailsData.similarDivisionName = '';
    wordDetailsData.domainClassName = '';
    wordDetailsData.enactContext = '';
    wordDetailsData.revisionCycle = '';
    wordDetailsData.typeCode = '';
    wordDetailsData.wordTypeName = '';
    wordDetailsData.revisionDate = new Date().toISOString().slice(0, 10);
    wordDetailsData.wordSourceCode = 'MNG';
    wordDetailsData.updater = updater;
    wordDetailsData.updateDateTime = formatted;
    wordDetailsData.jobDivisionCode = 'C';
  };

  // 조회 원본 데이터
  const wordJobRowData = reactive({});

  // // similarYn 변경 감시
  watch(
    () => wordDetailsData.similarYn,
    (newVal, oldVal) => {
      console.log('similarYn watch:', newVal);

      if (newVal === false) {
        wordDetailsData.similarDivisionCode = '';
      }
    }
  );

  // 단어데이터 store 변경 사항 감지
  watch(wordJobData, (newVal) => {
    console.log('wordData watch:', newVal);

    showAnimate.value = true;

    setTimeout(() => {
      showAnimate.value = false;
    }, 500);

    wordJobRowData.value = newVal;

    const wordDictionaryId = newVal.dictionaryId;

    if (wordDictionaryId === useDctnryId) {
      jobState.value = false;
    } else {
      jobState.value = true;
    }
    apiGetWordBaseInfo(newVal);
  });

  // 작업항목 바인딩
  watch(wordJobUpdateData, (newVal) => {
    console.log('wordJobData watch:', newVal);

    showAnimate.value = true;

    setTimeout(() => {
      showAnimate.value = false;
    }, 500);

    // 원본 데이터 저장
    wordJobRowData.value = newVal;

    if (newVal) {
      apiGetJobWordBaseInfo(newVal);
    }
  });

  watch(
    () => wordDetailsData.typeName,
    (newVal) => {
      console.log('wordDetailsData.typeName watch:', newVal);

      // typeName이 'GENERAL'(일반어)로 변경되었을 때 domainClassName 초기화
      if (newVal === 'GENERAL') {
        wordDetailsData.domainClassName = '';
      }
    }
  );
</script>

<style scoped>
  /*
    도메인분류명 스타일
  */
  .dictionary_up_name_div {
    height: 31px;
    padding-left: 11px;
  }
</style>
