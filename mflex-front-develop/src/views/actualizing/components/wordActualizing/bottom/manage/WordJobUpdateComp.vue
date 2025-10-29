<template>
  <div class="input-top">
    <div class="title-top">
      <div class="title-s">
        <div class="title-s-left">
          단어 상세 정보
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
            title="신규등록"
            class="btn-s add-reg"
            @click="onSelectReg(5)"
          >
            신규등록
          </button>
          <button
            class="btn-s change-reg"
            @click="onSelectReg(1)"
            title="변경등록"
            disabled
          >
            변경등록
          </button>
          <button
            class="btn-s remove-reg"
            @click="onSelectReg(2)"
            title="폐기등록"
            disabled
          >
            폐기등록
          </button>
          <button
            class="btn-s restore-reg"
            disabled
            @click="onSelectReg(4)"
            title="복구등록"
          >
            복구등록
          </button>
          <button
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
            :disabled="isSelectType == 'search' || isSelectType == 'remove'"
            class="btn-s green"
            @click="onJobWordSaveConfirm"
          >
            저장
          </button>
          <button
            :disabled="isSelectType == 'search' || isSelectType == 'remove'"
            class="btn-s"
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
            <td class="manage-input-form-td">
              <div class="td-col">
                <div
                  class="application-category__icon"
                  :class="wordDetailsData.selectType.type"
                >
                  {{ wordDetailsData.selectType.label }}
                </div>
              </div>
            </td>
            <th class="required">*제개정일자</th>
            <td class="manage-input-form-td">
              <div class="td-col manage-input-div">
                <div>
                  <input
                    class="input-date"
                    type="date"
                    :readonly="isReadonly"
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
                    isSelectType == 'new'
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
                <select
                  class="input-select wordtype-select"
                  style="width: 150px"
                  v-model="wordDetailsData.typeName"
                  :disabled="isReadonly || isSelectType == 'job-remove'"
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
                    :disabled="isReadonly || isSelectType == 'modify'"
                    @input="onFilterNonAlphabetic"
                  />
                  <button
                    class="btn-s dark-gray ml5"
                    @click="onOpenWordNameSearchWindow"
                    :disabled="isReadonly || isSelectType == 'job-remove'"
                  >
                    타표준&nbsp검색
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th>단어영문명</th>
            <td colspan="3" class="manage-input-form-td">
              <div class="td-col">
                <div class="col-row">
                  <input
                    class="input-text"
                    type="text"
                    :readonly="isReadonly || isSelectType == 'job-remove'"
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
                    style="padding-top: 6.5px; line-height: 1.5; width: 100%"
                  >
                    <AppStateText v-model="wordDetailsData.domainClassName" />
                  </div>
                  <button
                    class="btn-s dark-gray ml5"
                    @click="onOpenDomainNameSearchWindow"
                    :disabled="isReadonly || isSelectType == 'job-remove'"
                  >
                    검색
                  </button>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <th>단어설명</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col">
                <textarea
                  style="height: 90px"
                  :readonly="isReadonly || isSelectType == 'job-remove'"
                  v-model="wordDetailsData.explain"
                  placeholder="설명을 입력하세요"
                ></textarea>
              </div>
            </td>
          </tr>
          <tr>
            <th>제정내용</th>
            <td colspan="4" class="manage-input-form-td">
              <div class="td-col">
                <input
                  class="input-text"
                  type="text"
                  :readonly="isReadonly || isSelectType == 'job-remove'"
                  placeholder=""
                  style="width: 100%"
                  v-model="wordDetailsData.enactContext"
                />
              </div>
            </td>
          </tr>
          <tr>
            <th>최종수정자</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div class="td-col">
                  <input
                    class="input-text"
                    readonly
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="updater"
                  />
                </div>
              </div>
            </td>
            <th>최종수정일시</th>
            <td class="manage-input-form-td">
              <div class="td-col">
                <div class="td-col">
                  <input
                    class="input-text"
                    readonly
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="updateDateTime"
                  />
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
    @confirm="onUserJobWordUpdate"
  />

  <!-- 초기화 알림창 -->
  <AppDialog
    v-model:view="resetConfirmState.view"
    :title="resetConfirmState.title"
    :message="resetConfirmState.message"
    @confirm="onUserJobReset"
  />

  <!-- 도메인 그룹 및 분류 검색창 -->
  <AppWindow
    :view="domainNameSearchWindowView"
    @close="onCloseDomainNameSearchWindow"
    width="600px"
    height="auto"
  >
    <DomainGroupTypeSearchWindow
      @confirm="onDomainNameSearchSave"
      @close="onCloseDomainNameSearchWindow"
    />
  </AppWindow>
</template>

<script setup>
  import { reactive, ref, watch, computed, defineEmits } from 'vue';

  import { useAuthStore } from '@/stores/auth';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { storeToRefs } from 'pinia';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { useAlert } from '@/composables/alert';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import DomainGroupTypeSearchWindow from '@/components/popWindow/DomainGroupTypeSearchWindow.vue';
  import {
    wordManagementDataBinding,
    getUpdateJobWord,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';

  // const props = defineProps(['wordJobUpdateData', 'jobUpdateYn']);
  const emit = defineEmits(['onWordJobUpdate']);

  const authStore = useAuthStore();
  const { setAlertStatus, alertInfos } = useAlert();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId, useDctnryId } = userStngInfo.value;

  const showAnimate = ref(false);

  const updater = userInfo.value.userId;
  const updateDateTime = new Date().toISOString().split('T')[0];

  const dictionaryMngStore = useDictionaryMngStore();
  const { setIsWordJobSave, setIsWordJobApproval } = dictionaryMngStore;
  const { wordJobUpdateData } = storeToRefs(dictionaryMngStore);

  const regType = reactive([
    { id: 0, label: '신규등록', type: 'new' },
    { id: 1, label: '변경등록', type: 'modify' },
    { id: 2, label: '삭제등록', type: 'remove' },
    { id: 3, label: '자료조회', type: 'search' },
    { id: 4, label: '작업수정', type: 'modify' },
    { id: 5, label: '신규등록', type: 'job-new' },
  ]);

  const onSelectReg = (value) => {
    wordDetailsData.selectType = regType[value];

    // 신규등록 시 초기화
    if (wordDetailsData.jobDivisionCode === 'NEW') {
      //resetWordDetailsData();
      apiGetWordBaseInfo(wordJobRowData);
      wordDetailsData.selectType = regType[0];
    } else {
      apiGetWordBaseInfo(wordJobRowData);
      wordDetailsData.selectType = regType[1];
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
    if (wordDetailsData.selectType.type === 'job-new') {
      return 'job-new';
    }
    if (wordDetailsData.selectType.type === 'modify') {
      return 'modify';
    }
    if (wordDetailsData.selectType.type === 'remove') {
      return 'remove';
    }
    return 'search';
  });

  // readonly 여부
  const isReadonly = computed(() => {
    return isSelectType.value === 'search' || isSelectType.value === 'remove';
  });

  const ifSimilarYn = computed(() => {
    return wordDetailsData.similarYn === false;
  });

  // 삭제등록 여부
  const isJobRemove = computed(() => {
    return wordDetailsData.jobDivisionCode === 'DELETE';
  });

  // 단어유형 목록
  const wordTypeOptions = ref([
    { text: '선택', value: '' },
    { text: '일반어', value: 'GENERAL' },
    { text: '분류어', value: 'CLASSIFICATION' },
    { text: '금칙어', value: 'PROHIBITED' },
  ]);

  // 유사어구분 목록
  const similarTypeOptions = ref([
    { text: '선택', value: '' },
    { text: '이음동의어', value: 'SYNONYMS' },
    { text: '금칙어', value: 'FORBIDDEN' },
  ]);

  const selectWordType = ref(wordTypeOptions.value[0].value);

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
    similarDivisionCode: '',
    similarDivisionName: '',
    domainClassName: [
      {
        id: '',
        type: '',
        label: '',
        color: '',
        bgColor: '',
        size: 55,
      },
    ],
    enactContext: '',
    enactCycle: '',
    enactDate: '',
    revisionCycle: '',
    revisionDate: '',
    updater: '',
    updateDateTime: '',
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
    jobWordId: 0,
    jobDivisionCode: '',
  });

  // 선택 데이터 바인딩
  const apiGetWordBaseInfo = (wordDetailsDataInfo) => {
    console.log('apiGetWordBaseInfo : ', wordDetailsDataInfo);

    const wordDetails = wordDetailsDataInfo.value
      ? wordDetailsDataInfo.value
      : wordDetailsDataInfo;

    wordDetailsData.selectType = regType[3];

    if (wordDetails.jobDivisionCode === 'NEW') {
      wordDetailsData.selectType = regType[0];
    } else if (wordDetails.jobDivisionCode === 'MODIFY') {
      wordDetailsData.selectType = regType[1];
    } else {
      wordDetailsData.selectType = regType[2];
    }

    wordDetailsData.wordDictionaryId = wordDetails.word.dictionary.id;
    wordDetailsData.wordName = wordDetails.word.name;
    wordDetailsData.abbreviationName = wordDetails.word.abbreviationName;
    wordDetailsData.englishName = wordDetails.word.englishName;
    wordDetailsData.typeCode = wordDetails.word.typeCode;
    wordDetailsData.typeName = wordDetails.wordTypeCode;
    wordDetailsData.explain = wordDetails.word.explain;
    wordDetailsData.similarYn = wordDetails.word.similarYn;
    wordDetailsData.similarDivisionCode =
      wordDetails.word.similarDivisionCode === null
        ? ''
        : wordDetails.word.similarDivisionCode;
    wordDetailsData.similarDivisionName = wordDetails.word.similarDivisionName;

    wordDetailsData.domainClassName[0].id =
      wordDetails.domainClass.dictionary.id;
    wordDetailsData.domainClassName[0].type =
      wordDetails.domainClass.dictionary.type.name;
    wordDetailsData.domainClassName[0].label = wordDetails.domainClass.name;
    wordDetailsData.domainClassName[0].color =
      wordDetails.domainClass.dictionary.type.fontColor;
    wordDetailsData.domainClassName[0].bgColor =
      wordDetails.domainClass.dictionary.type.backgroundColor;
    wordDetailsData.enactContext = wordDetails.enactContext;
    wordDetailsData.revisionCycle =
      wordDetails.revisionCycle === null
        ? wordDetails.enactCycle
        : wordDetails.revisionCycle;
    wordDetailsData.revisionDate =
      wordDetails.revisionDate === null
        ? wordDetails.enactDate
        : wordDetails.revisionDate;
    wordDetailsData.updater = wordDetails.updater;
    wordDetailsData.updateDateTime = wordDetails.updateDateTime;

    wordDetailsData.wordData[0].id = wordDetails.word.dictionary.id;
    wordDetailsData.wordData[0].type = wordDetails.word.dictionary.type.name;
    wordDetailsData.wordData[0].label = wordDetails.word.name;
    wordDetailsData.wordData[0].color =
      wordDetails.word.dictionary.type.fontColor;
    wordDetailsData.wordData[0].bgColor =
      wordDetails.word.dictionary.type.backgroundColor;
    wordDetailsData.jobWordId = wordDetails.jobWordId;
    wordDetailsData.jobDivisionCode = wordDetails.jobDivisionCode;
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
    saveWordConfirmState.view = true;
  };

  // 단어 작업 저장
  const onUserJobWordUpdate = async () => {
    console.log('단어 작업 업데이트');

    const wordDetailsQuery = await wordManagementDataBinding(wordDetailsData);

    wordDetailsQuery.userId = userInfo.value.userId;
    wordDetailsQuery.userName = userInfo.value.userId;
    const response = await getUpdateJobWord(wordDetailsQuery);

    if (response.status === 409) {
      setAlertStatus({
        view: true,
        message: '작업수정에 실패했습니다. <br>다시 시도해 주세요.',
      });
    }

    emit('onWordJobUpdate', wordDetailsData);
    setIsWordJobSave(true);
    setIsWordJobApproval(true);
  };

  const domainNameSearchWindowView = ref(false);
  const onOpenDomainNameSearchWindow = () => {
    domainNameSearchWindowView.value = true;
  };

  const onCloseDomainNameSearchWindow = () => {
    domainNameSearchWindowView.value = false;
  };

  const onDomainNameSearchSave = (data) => {
    console.log('도메인분류명 검색 data : ', data);

    wordDetailsData.domainClassName[0].id = data.domainClassName[0].id;
    wordDetailsData.domainClassName[0].dictionaryId =
      data.domainClassName.dictionaryId;

    wordDetailsData.domainClassName[0].type = data.domainClassName[0].type;
    wordDetailsData.domainClassName[0].label = data.domainClassName[0].label;
    wordDetailsData.domainClassName[0].color = data.domainClassName[0].color;
    wordDetailsData.domainClassName[0].bgColor =
      data.domainClassName[0].bgColor;

    onCloseDomainNameSearchWindow();
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
    console.log('초기화 실행 - wordDetailsData : ', wordDetailsData);
    // console.log('초기화 실행');

    if (wordDetailsData.selectType.type === 'new') {
      apiGetWordBaseInfo(wordJobRowData);
      onSelectReg(0);
    } else {
      apiGetWordBaseInfo(wordJobRowData);
      onSelectReg(1);
    }
  };

  // 조회 원본 데이터
  const wordJobRowData = reactive({});

  // watch(props.wordJobUpdateData, (newVal, oldVal) => {
  //   console.log('wordData watch:', newVal);

  //   // 원본 데이터 저장
  //   wordJobRowData.value = newVal.value;

  //   if (newVal) {
  //     apiGetWordBaseInfo(newVal);
  //   }
  // });

  watch(wordJobUpdateData, (newVal) => {
    console.log('wordData watch:', newVal);

    showAnimate.value = true;

    setTimeout(() => {
      showAnimate.value = false;
    }, 500);

    // 원본 데이터 저장
    wordJobRowData.value = newVal;

    if (newVal) {
      apiGetWordBaseInfo(newVal);
    }
  });

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
</script>
