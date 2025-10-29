<template>
  <div class="inputs-row">
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
          <div class="btns" style="display: flex"></div>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s green save-btn"
              title="저장"
              :disabled="isSelectType === 'search'"
              @click="onSaveConfirm"
            >
              저장
            </button>
            <button
              class="btn-s delete-btn"
              title="취소"
              :disabled="isSelectType === 'search'"
              @click="onCancelConfirm"
            >
              취소
            </button>
            <button
              class="btn-s reset-btn"
              title="초기화"
              :disabled="isSelectType === 'search' || isSelectType === 'remove'"
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
            <col width="23%" />
          </colgroup>
          <tbody>
            <tr>
              <th>작업구분</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div
                    class="application-category__icon"
                    :class="domainNameData.selectType.type"
                  >
                    {{ domainNameData.selectType.label }}
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
                      placeholder=""
                      style="width: 100%; margin-right: 10px"
                      v-model="domainNameData.revisionDate"
                      :disabled="
                        isSelectType === 'search' || isSelectType === 'remove'
                      "
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*도메인명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainName"
                    readonly
                  />
                </div>
              </td>
              <th class="required">*도메인분류명</th>
              <td colspan="3" class="manage-input-form-td">
                <div class="td-col">
                  <div class="col-row">
                    <input
                      class="input-text"
                      type="text"
                      placeholder=""
                      style="width: 100%"
                      v-model="domainNameData.domainClassName"
                      readonly
                    />
                    <button
                      class="btn-s search-btn dark-gray ml5"
                      @click="onOpenDomainClassSearchWindow"
                      :disabled="
                        isReadonly ||
                        isSelectType == 'search' ||
                        isSelectType == 'modify' ||
                        isSelectType == 'discard' ||
                        isSelectType == 'restore' ||
                        isSelectType == 'delete'
                      "
                      title="도메인분류명 검색"
                    >
                      검색
                    </button>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*논리데이터타입</th>
              <td class="manage-input-form-td">
                <select
                  class="input-select"
                  v-model="domainNameData.logicalDataTypeCode"
                  style="width: 100%"
                  :disabled="
                    isSelectType === 'search' ||
                    isSelectType === 'restore' ||
                    isSelectType === 'delete' ||
                    isSelectType === 'discard' ||
                    isSelectType === 'modify'
                  "
                >
                  <option
                    v-for="option in logicalDataTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.text }}
                  </option>
                </select>
              </td>
              <th>데이터길이</th>
              <td class="manage-input-form-td">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  v-model="domainNameData.dataLength"
                  style="width: 50%"
                  :readonly="
                    isSelectType === 'search' ||
                    isSelectType === 'restore' ||
                    isSelectType === 'delete' ||
                    isSelectType === 'modify' ||
                    isSelectType === 'discard'
                  "
                />.
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  v-model="domainNameData.dataDecimalPointLength"
                  style="width: 40%"
                  :readonly="
                    isSelectType === 'search' ||
                    isSelectType === 'delete' ||
                    isSelectType === 'restore' ||
                    isSelectType === 'modify' ||
                    isSelectType === 'discard'
                  "
                />
              </td>
            </tr>
            <tr>
              <th>도메인설명</th>
              <td class="manage-input-form-td" colspan="3">
                <div class="td-col">
                  <textarea
                    style="height: 72px"
                    placeholder="설명을 입력하세요"
                    v-model="domainNameData.explain"
                    :readonly="
                      isSelectType === 'search' ||
                      isSelectType === 'delete' ||
                      isSelectType === 'restore' ||
                      isSelectType === 'modify' ||
                      isSelectType === 'discard'
                    "
                  ></textarea>
                </div>
              </td>
            </tr>
            <tr>
              <th>저장형식</th>
              <td class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.storageFormatContent"
                    :readonly="
                      isSelectType === 'search' ||
                      isSelectType === 'discard' ||
                      isSelectType === 'restore' ||
                      isSelectType === 'modify' ||
                      isSelectType === 'delete'
                    "
                  />
                </div>
              </td>
              <th>표현방식</th>
              <td class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.expressionFormatContent"
                    :readonly="
                      isSelectType === 'search' ||
                      isSelectType === 'discard' ||
                      isSelectType === 'delete' ||
                      isSelectType === 'restore' ||
                      isSelectType === 'modify'
                    "
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>데이터단위명</th>
              <td class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.dataUnitName"
                    :readonly="
                      isSelectType === 'search' ||
                      isSelectType === 'discard' ||
                      isSelectType === 'restore' ||
                      isSelectType === 'delete' ||
                      isSelectType === 'modify'
                    "
                  />
                </div>
              </td>
              <th>데이터허용값</th>
              <td class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.dataPermissionValue"
                    :readonly="
                      isSelectType === 'search' ||
                      isSelectType === 'discard' ||
                      isSelectType === 'restore' ||
                      isSelectType === 'delete' ||
                      isSelectType === 'modify'
                    "
                  />
                </div>
              </td>
            </tr>

            <tr>
              <th>최종수정자</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  {{ domainNameData.updater }}
                </div>
              </td>
              <th>최종수정일시</th>
              <td colspan="" class="manage-input-form-td">
                <div class="td-col">
                  {{ domainNameData.updateDateTime }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- 통합코드명 검색팝업 -->
  <AppWindow
    :view="searchUnityCodeWindowView"
    @close="onCloseSearchUnityCodeWindow"
    width="450px"
    height="auto"
  >
    <SearchUnityCodeWindow
      @confirm="onSearchUnityCodeWindowSave"
      @close="onCloseSearchUnityCodeWindow"
    />
  </AppWindow>

  <!-- 저장 알림창 -->
  <AppDialog
    v-model:view="saveConfirmState.view"
    :title="saveConfirmState.title"
    :message="saveConfirmState.message"
    @confirm="onSaveDivide"
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

  <!-- 연관용어 존재 알림창 -->
  <AppDialog
    v-model:view="relatedTermState.view"
    :title="relatedTermState.title"
    :message="relatedTermState.message"
    :type="relatedTermState.type"
    @relationTermList="onRelatedTerm"
  />

  <!-- 연관용어 조회 팝업 -->
  <AppWindow
    :view="relatedTermWindowView"
    @close="onCloseRelatedTermWindow"
    width="630px"
    height="auto"
  >
    <RelatedTermByDomainWindow
      :propsRelatedTermList="propsRelatedTermList"
      :selectDomain="domainQuery"
      @confirm="onCloseRelatedTermWindow"
      @close="onCloseRelatedTermWindow"
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
    :view="domainValidationErrorWindowView"
    @close="onCloseDomainValidationErrorWindow"
    width="700px"
    height="auto"
  >
    <TermValidationErrorWindow
      :errorMessage="domainErrorMessages"
      @confirm="onDomainValidationErrorSave"
      @close="onCloseDomainValidationErrorWindow"
    />
  </AppWindow>
</template>

<script>
  import {
    reactive,
    ref,
    watch,
    watchEffect,
    computed,
    onBeforeMount,
  } from 'vue';
  import { useAlert } from '@/composables/alert';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';

  import {
    getDomainDetailsV2, // 도메인명 상세정보 조회
    getDomainJobDetailsV2, // 도메인작업명 상세정보 조회
    getDomainClassByDomainMng, // 도메인분류명 조회
    manageDomainV2, // 도메인명 등록, 변경, 삭제
    updateDomainV2, // 도메인명 수정
    getSupportedDataTypes, // 지원되는 데이터 타입 조회
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import SearchUnityCodeWindow from '@/components/popWindow/SearchUnityCodeWindow.vue';
  import RelatedTermByDomainWindow from '@/components/popWindow/RelatedTermByDomainWindow.vue';
  import DomainClassSearchWindow from '@/components/popWindow/DomainClassSearchWindow.vue';
  import TermValidationErrorWindow from '@/components/popWindow/TermValidationErrorWindow.vue';

  export default {
    components: {
      AppWindow,
      RelatedTermByDomainWindow,
      SearchUnityCodeWindow,
      DomainClassSearchWindow,
      TermValidationErrorWindow,
      AppTooltip,
    },
    computed: {
      isJobType() {
        if (this.domainNameData.selectType.type === 'search') {
          return true;
        } else {
          return false;
        }
      },
      isSelectType() {
        if (this.domainNameData.selectType.type === 'search') {
          return 'search';
        }
        if (this.domainNameData.selectType.type === 'new') {
          return 'new';
        }
        if (this.domainNameData.selectType.type === 'modify') {
          return 'modify';
        }
        if (this.domainNameData.selectType.type === 'discard') {
          return 'discard';
        }
        if (this.domainNameData.selectType.type === 'restore') {
          return 'restore';
        }
        if (this.domainNameData.selectType.type === 'delete') {
          return 'delete';
        }
        return 'search';
      },
      previewData() {
        if (this.domainNameData.domainDictionaryId != this.useDctnryId) {
          return true;
        } else {
          return false;
        }
      },
    },
    emits: ['domainNameSave', 'exist-related-term'],
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { alertInfos, setAlertStatus } = useAlert();

      const { userInfo, userStngInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId, userNm } = userInfo.value;
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const showAnimate = ref(false);

      const dictionaryMngStore = useDictionaryMngStore();
      const { domainTreeData } = storeToRefs(dictionaryMngStore);
      const {
        setIsDomainJobSave,
        setIsDomainJobApproval,
        setIsDomainJobCancel,
      } = dictionaryMngStore;

      const actualizingStore = useActualizingStore();

      const {
        selectDomainData,
        selectDomainJobData,
        isActualizingDomainJobVisible,
      } = storeToRefs(actualizingStore);

      const updater = `${userNm}(${userId})`;
      const updateDateTime = new Date().toISOString().split('T')[0];

      // 도메인분류 검색팝업 전달 Params
      const domainRequestPrams = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        domainGroupName: '',
      };

      const regType = reactive([
        { id: 0, label: '신규등록', type: 'new' },
        { id: 1, label: '변경등록', type: 'modify' },
        { id: 2, label: '폐기등록', type: 'discard' },
        { id: 3, label: '자료조회', type: 'search' },
        { id: 4, label: '복구등록', type: 'restore' },
        { id: 5, label: '삭제등록', type: 'delete' },
      ]);

      const onSelectReg = (value) => {
        domainNameData.value.selectType = regType[value];

        if (value === 0) {
          resetDomainNameData();
        } else if (value === 1) {
          bindDomainRowData();
        } // 삭제등록일때
        else if (value === 2) {
          // 변경등록일때
          bindDomainRowData(value);
        }
        console.log('onSelectReg value : ', value);
      };

      // 논리데이터 타입 선택 옵션
      const logicalDataTypeOptions = ref([
        { value: '', text: '선택' },
        // { value: 'CHAR', text: 'CHAR' },
        // { value: 'VARCHAR', text: 'VARCHAR' },
        // { value: 'NUMERIC', text: 'NUMERIC' },
      ]);
      // const logicalDataTypeSelected = ref(logicalDataTypeOptions[0].value);
      const logicalDataTypeSelected = ref('');

      // 코드유형 선택 옵션
      const codeTypeOptions = [
        { value: null, text: '선택' },
        { value: 'INDIVIDUAL_CODE', text: '개별코드' },
        { value: 'UNITY_CODE', text: '통합코드' },
      ];
      const selectCodeType = ref(codeTypeOptions[0].value);

      const domainName = computed(() => {
        const domainClassLabel = domainNameData.value.domainClassName;

        let logicalDataTypeCode;
        if (domainNameData.value.logicalDataTypeCode === 'NUMERIC') {
          logicalDataTypeCode = 'N';
        } else if (domainNameData.value.logicalDataTypeCode === 'CHAR') {
          logicalDataTypeCode = 'C';
        } else if (domainNameData.value.logicalDataTypeCode === 'VARCHAR') {
          logicalDataTypeCode = 'V';
        } else if (domainNameData.value.logicalDataTypeCode === 'DATETIME') {
          logicalDataTypeCode = 'D';
        } else {
          logicalDataTypeCode = '';
        }

        let dataLength;

        if (domainNameData.value.dataLength != null) {
          // 소수점이 있는경우
          if (domainNameData.value.dataDecimalPointLength) {
            dataLength = `${domainNameData.value.dataLength},${domainNameData.value.dataDecimalPointLength}`;
          } else {
            dataLength = `${domainNameData.value.dataLength}` || '';
          }
        } else {
          dataLength = '';
        }

        return domainClassLabel + logicalDataTypeCode + dataLength;
      });

      const domainNameRowData = ref({});

      // 최초 선택된 domainRowData 바인딩 함수
      const bindDomainRowData = (type) => {
        const data = domainNameRowData.value;

        console.log('domainNameRowData : ', data);

        domainNameData.value = {
          selectType:
            data.jobDivisionCode === 'C'
              ? { id: 0, label: '신규등록', type: 'new' }
              : { id: 1, label: '변경등록', type: 'modify' },
          domainDictionaryId: data.dictionaryId,
          domainName: data.domainName,
          domainClassName: data.domainClassName,
          explain: data.domainExplain,
          logicalDataTypeCode: data.logicalDataTypeCode,
          dataLength: data.dataLength,
          dataLength_integer: Math.floor(data.dataLength),
          dataUnitName: data.dataUnitName,
          dataDecimalPointLength: data.dataDecimalPointLength,
          dataPermissionValue: data.dataPermissionValue,
          storageFormatContent: data.storageFormatContent,
          jobDomainId: data.jobDomainId,
          expressionFormatContent: data.expressionFormatContent,
          revisionDate: updateDateTime,
          updater: data.updater,
          updateDateTime: data.updateDateTime,
          domainSourceCode: 'JOB',
        };
      };

      const domainNameData = ref({
        selectType: { id: 3, label: '자료조회', type: 'search' },
        domainNameString: '',
        domainDictionaryId: '',
        domainName: '',
        domainClassDictionaryId: '',
        domainClassName: '',
        explain: '',
        logicalDataTypeCode: logicalDataTypeSelected,
        dataLength_integer: '',
        dataLength_decimal: '',
        dataDecimalPointLength: '',
        codeTypeCode: selectCodeType,
        individualCodeName: '',
        dataUnitName: '',
        dataPermissionValue: '',
        storageFormatContent: '',
        expressionFormatContent: '',
        enactContext: '',
        enactDate: '',
        enactCycle: '',
        revisionDate: '',
        revisionCycle: '',
        updater: '',
        updateDateTime: '',
        jobUpdateYn: false,
      });

      // 도메인데이터 바인딩 함수
      const bindDomainNameData = (params) => {
        // 기존 dataLength 값을 가져옵니다.
        const originalDataLength = params.data.dataLength;

        console.log('params', params);

        let domainSourceCode;
        let selectType;

        // 관리 / 작업 영역 구분
        if (params.data.jobDivisionCode === 'R') {
          domainSourceCode = 'MNG';
        } else {
          domainSourceCode = 'JOB';
        }

        if (params.data.jobDivisionCode === 'C') {
          selectType = regType[0];
        } else if (params.data.jobDivisionCode === 'U') {
          selectType = regType[1];
        } else if (params.data.jobDivisionCode === 'X') {
          selectType = regType[2];
        } else if (params.data.jobDivisionCode === 'R') {
          selectType = regType[3];
        } else if (params.data.jobDivisionCode === 'V') {
          selectType = regType[4];
        } else if (params.data.jobDivisionCode === 'D') {
          selectType = regType[5];
        }

        const domainData = params.data;

        // dataLength를 정수 부분과 소수점 부분으로 분리합니다.
        const dataLength_integer = Math.floor(originalDataLength);
        const dataLength_decimal = originalDataLength - dataLength_integer;

        domainNameData.value = {
          selectType: selectType,
          dictionaryId: params.dictionaryId,
          domainName: domainData.domainName,
          domainClassName: domainData.domainClassName,
          explain: domainData.domainExplain,
          logicalDataTypeCode: domainData.logicalDataTypeCode,
          dataLength: domainData.dataLength,
          dataLength_integer: dataLength_integer,
          dataLength_decimal: dataLength_decimal,
          dataDecimalPointLength: domainData.dataDecimalPointLength,
          dataUnitName: domainData.dataUnitName,
          dataPermissionValue: domainData.dataPermissionValue,
          storageFormatContent: domainData.storageFormatContent,
          expressionFormatContent: domainData.expressionFormatContent,
          revisionDate: domainData.revisionDate,
          updater: domainData.updater,
          updateDateTime: domainData.updateDateTime,
          discardYn: domainData.discardYn,
          jobDomainId: domainData.jobDomainId,
          domainSourceCode: domainSourceCode,
        };

        console.log('domainNameData binding ===', domainNameData);
      };

      // domainName이 변경될 때마다 domainNameString 업데이트
      watch(domainName, (newValue) => {
        domainNameData.value.domainNameString = newValue;
      });

      // 코드유형 변경 시 코드명 초기화

      // 도메인명 데이터 초기화 함수
      const resetDomainNameData = () => {
        const updater = `${userNm}(${userId})`;
        const updateDateTime = new Date().toISOString().split('T')[0];

        domainNameData.value.selectType = {
          id: 0,
          label: '신규등록',
          type: 'new',
        };

        domainName.value = '';

        domainNameData.value.domainSourceCode = 'MNG';
        domainNameData.value.domainName = '';
        domainNameData.value.domainClassName = '';
        domainNameData.value.explain = '';
        domainNameData.value.logicalDataTypeCode =
          logicalDataTypeOptions.value[0].value;
        domainNameData.value.dataLength = '';
        domainNameData.value.dataLength_integer = '';
        domainNameData.value.dataLength_decimal = '';
        domainNameData.value.dataDecimalPointLength = '';
        domainNameData.value.dataUnitName = '';
        domainNameData.value.dataPermissionValue = '';
        domainNameData.value.storageFormatContent = '';
        domainNameData.value.expressionFormatContent = '';
        domainNameData.value.revisionDate = updateDateTime;
        domainNameData.value.updater = updater;
        domainNameData.value.updateDateTime = updateDateTime;
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
        const unityCode = [
          {
            type: selectRow.unityCode[0].type,
            label: selectRow.unityCode[0].label,
            bgColor: selectRow.unityCode[0].bgColor,
            color: selectRow.unityCode[0].color,
            dictionaryId: selectRow.unityCode[0].dictionaryId,
          },
        ];

        domainNameData.value.unityCode[0].type = unityCode[0].type;
        domainNameData.value.unityCode[0].label = unityCode[0].label;
        domainNameData.value.unityCode[0].bgColor = unityCode[0].bgColor;
        domainNameData.value.unityCode[0].color = unityCode[0].color;
        domainNameData.value.unityCode[0].dictionaryId =
          unityCode[0].dictionaryId;

        onCloseSearchUnityCodeWindow();
      };

      //저장
      const saveConfirmState = reactive({
        view: false,
        message: '작업 내용을 저장하시겠습니까?',
      });
      const onSaveConfirm = () => {
        console.log('저장 검증 domainNameData : ', domainNameData.value);

        // 논리데이터 타입 검증
        if (domainNameData.value.logicalDataTypeCode === '' || null) {
          alertInfos.value.view = true;
          alertInfos.value.message = '논리데이터타입을 입력하세요.';
          return;
        }
        // 제개정일자 검증
        if (domainNameData.value.revisionDate === '' || null) {
          alertInfos.value.view = true;
          alertInfos.value.message = '제개정일자를 입력하세요.';
          return;
        }

        // 코드유형 검증
        if (
          domainNameData.value.domainClassName[0].label === '코드' &&
          domainNameData.value.codeTypeCode === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message =
            '도메인분류가 코드 인 경우 코드유형을 선택해주세요. ';
          return;
        }

        // 개별코드명 검증
        if (
          (domainNameData.value.codeTypeCode === 'INDIVIDUAL_CODE' &&
            domainNameData.value.individualCodeName === '') ||
          domainNameData.value.individualCodeName === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message =
            '개별코드인 경우 개별코드명을 입력해주세요. ';
          return;
        }

        // 통합코드명 검증
        if (
          (domainNameData.value.codeTypeCode === 'UNITY_CODE' &&
            domainNameData.value.unityCode[0].label === '') ||
          domainNameData.value.unityCode === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message =
            '통합코드인 경우 통합코드명을 입력해주세요. ';
          return;
        }

        saveConfirmState.view = true;
        // domainGroupSaveState.value = true;
      };

      const onSaveDivide = async () => {
        console.log(
          'domainNameData.value.domainSourceCode : ',
          domainNameData.value.domainSourceCode
        );
        // 작업 수정 실행
        onUpdateJob();
      };

      const domainQuery = ref({});

      const onSave = async () => {
        saveConfirmState.view = false;

        console.log('domainNameData.value : ', domainNameData.value);

        const selectType = domainNameData.value.selectType.type;
        let jobDivisionCode;

        if (selectType === 'new') {
          jobDivisionCode = 'NEW';
        } else if (selectType === 'modify') {
          jobDivisionCode = 'MODIFY';
        } else if (selectType === 'discard') {
          jobDivisionCode = 'DISCARD';
        } else if (selectType === 'restore') {
          jobDivisionCode = 'RESTORE';
        } else if (selectType === 'delete') {
          jobDivisionCode = 'DELETE';
        }

        const domainNameQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          jobTypeCode: 'CUR',
          domainName: domainName.value,
          jobDivisionCode: jobDivisionCode,
          domainClassName: domainNameData.value.domainClassName,
          domainExplain: domainNameData.value.explain,
          logicalDataTypeCode: domainNameData.value.logicalDataTypeCode,
          dataLength: domainNameData.value.dataLength,
          dataDecimalPointLength: domainNameData.value.dataDecimalPointLength,
          dataUnitName: domainNameData.value.dataUnitName,
          dataPermissionValue: domainNameData.value.dataPermissionValue,
          storageFormatContent: domainNameData.value.storageFormatContent,
          expressionFormatContent: domainNameData.value.expressionFormatContent,
          revisionDate: domainNameData.value.revisionDate,
        };

        domainQuery.value = domainNameQuery;

        const manageResponse = await manageDomainV2(domainNameQuery);
        console.log('manageResponse : ', manageResponse);

        let errorMessages;
        // 연관용어 존재 시
        if (manageResponse.data.code === 1231) {
          errorMessages = {
            state: 'error',
            stateName: 'relation',
            errorTitle: '연관용어 오류메시지',
            errorMessages: [
              '연관된 용어가 있어 해당 도메인명 폐기가 불가능 합니다. 폐기작업을 원하시면 우선 연관용어명을 변경/삭제 처리해 주시기 바랍니다.',
            ],
          };
          onOpenDomainValidationErrorWindow(errorMessages);
        }

        if (manageResponse.status === 200) {
          // 작업완료(승인완료) 상태변경
          setIsDomainJobApproval(true);
          // 작업저장 상태변경
          setIsDomainJobSave(true);
        }
      };

      // 작업 수정
      const onUpdateJob = async () => {
        console.log('domainNameData.value : ', domainNameData.value);

        const domainUpdateQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          jobTypeCode: 'CUR',
          domainName: domainName.value,
          jobDivisionCode: 'NEW',
          domainClassName: domainNameData.value.domainClassName,
          domainExplain: domainNameData.value.explain,
          logicalDataTypeCode: domainNameData.value.logicalDataTypeCode,
          dataLength: domainNameData.value.dataLength,
          dataDecimalPointLength: domainNameData.value.dataDecimalPointLength,
          dataUnitName: domainNameData.value.dataUnitName,
          dataPermissionValue: domainNameData.value.dataPermissionValue,
          storageFormatContent: domainNameData.value.storageFormatContent,
          expressionFormatContent: domainNameData.value.expressionFormatContent,
          revisionDate: domainNameData.value.revisionDate,
          jobDomainId: domainNameData.value.jobDomainId,
        };

        const updateResponse = await updateDomainV2(domainUpdateQuery);
        console.log('updateResponse : ', updateResponse);

        // 작업완료(승인완료) 상태변경
        setIsDomainJobApproval(true);
        // 작업저장 상태변경
        setIsDomainJobSave(true);
      };

      const cancelConfirmState = reactive({
        view: false,
        message:
          '선택한 항목이 작업목록에서 <span style="color: red;">삭제</span>됩니다. 계속하시겠습니까?',
      });

      const onCancelConfirm = () => {
        console.log('취소 confirm 메시지');
        cancelConfirmState.view = true;
      };

      const onCancel = () => {
        console.log('취소 진행 메시지');
        setIsDomainJobCancel(true);
      };

      // 초기화 confirm 메시지
      const resetConfirmState = reactive({
        view: false,
        message: '선택한 항목이 작업목록에서 삭제됩니다. <br>계속하시겠습니까?',
      });
      const onResetConfirm = () => {
        resetConfirmState.view = true;
      };

      // 초기화 실행
      const onReset = () => {
        console.log('초기화 실행');

        if (domainNameData.value.domainSourceCode === 'JOB') {
          bindDomainRowData();
          return;
        }

        if (domainNameData.value.selectType.type === 'new') {
          resetDomainNameData();
        } else if (domainNameData.value.selectType.type === 'modify') {
          bindDomainRowData();
        }
      };

      const extractNonNumeric = (str) => {
        return str.replace(/^\d+/, '');
      };

      // const extractNonNumeric = (str) => {
      //   return str.replace(/\d+/g, '');
      // };

      const domainErrorMessages = ref('');

      // 무결성 체크 팝업 상태
      const domainValidationErrorWindowView = ref(false);

      const onOpenDomainValidationErrorWindow = (messages) => {
        domainErrorMessages.value = messages;
        domainValidationErrorWindowView.value = true;
      };

      const onCloseDomainValidationErrorWindow = () => {
        domainValidationErrorWindowView.value = false;
      };

      // 코드유형 감시
      watch(
        () => domainNameData.value.codeTypeCode,
        (newVal) => {
          console.log('newVal : ', newVal);
          if (newVal === 'UNITY_CODE') {
            domainNameData.value.individualCodeName = '';
          } else {
            domainNameData.value.unityCode = [
              {
                id: 0,
                label: '',
                type: '',
                color: '',
                bgColor: '',
                size: 60,
              },
            ];
          }
        }
      );

      // 도메인트리 데이터 상태 감시
      watch(
        () => domainTreeData.value,
        (newVal) => {
          console.log('domainTreeData.value - newVal', newVal);
          if (newVal) {
            domainNameData.value.selectType = regType[0];
            const label = extractNonNumeric(newVal.domainId);

            console.log('label : ', label);
            domainNameData.value.domainClassDictionaryId = newVal.dictionaryId;
            domainNameData.value.domainClassName = [
              {
                id: 0,
                label: label,
                type: newVal.type,
                color: newVal.color,
                bgColor: newVal.bgColor,
                size: 60,
              },
            ];
            domainNameData.value.updater = `${userNm}(${userId})`;
            domainNameData.value.updateDateTime = new Date()
              .toISOString()
              .split('T')[0];
            domainNameData.value.dataDecimalPointLength = '';
            domainNameData.value.dataLength = '';
          }
        }
      );

      const selectDomainDataRef = ref({});

      // 도메인 선택 데이터
      watch(
        () => selectDomainData.value,
        async (value) => {
          console.log('selectDomainData.value : ', value);

          const domainNameQuery = {
            instituteId: value.instituteId,
            dictionaryId: value.dictionaryId,
            domainName: value.domainName.name,
          };

          const domainDetails = await getDomainDetailsV2(domainNameQuery);

          domainNameRowData.value = domainDetails.data;
          selectDomainDataRef.value = value;

          bindDomainNameData(domainDetails);
        },
        { deep: true }
      );

      // 도메인데이터 상태값 변경 감시
      watch(
        () => selectDomainJobData.value,

        async (newVal) => {
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);

          if (newVal === null) {
            resetDomainNameData();
            return;
          }

          console.log('selectDomainJobData.value : ', newVal);

          selectDomainDataRef.value = newVal;

          let domainNameQuery = {
            instituteId: newVal.instituteId,
            dictionaryId: newVal.dictionaryId,
            jobTypeCode: 'CUR',
            jobDomainId: newVal.jobDomainId,
          };

          const domainJobDetails = await getDomainJobDetailsV2(domainNameQuery);

          console.log('domainJobDetails : ', domainJobDetails);

          domainNameRowData.value = domainJobDetails.data;

          bindDomainNameData(domainJobDetails);
        },
        { deep: true }
      );

      // 연관용어 관련 데이터
      const propsRelatedTermList = ref([]);
      const relatedTermWindowView = ref(false);
      const relatedTermState = reactive({
        view: false,
        title: '연관용어 오류메세지',
        message:
          '연관용어 자료가 있어 해당 작업은 실행이 불가능 합니다. <br>작업을 취소하고 연관용어 삭제 처리를 먼저 수행해 주시기 바랍니다.',
        type: 'relationColumn',
      });

      const onRelatedTerm = () => {
        relatedTermWindowView.value = true;
      };

      const onDomainValidationErrorSave = () => {
        relatedTermWindowView.value = true;
        domainValidationErrorWindowView.value = false;
      };

      const onCloseRelatedTermWindow = () => {
        relatedTermWindowView.value = false;
      };

      const handleRelatedTerm = (relatedTermList) => {
        console.log('연관용어 존재 : ', relatedTermList);
        propsRelatedTermList.value = relatedTermList;
        relatedTermState.view = true;
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

        domainNameData.value.domainClassName = selectRow.domainClassName;

        onCloseDomainClassSearchWindow();
      };

      onBeforeMount(async () => {
        try {
          const response = await getSupportedDataTypes();
          console.log('getSupportedDataTypes response : ', response);

          // API 응답을 기존 구조에 맞게 변환하여 바인딩
          if (response) {
            const apiOptions = response.map((item) => ({
              value: item.code,
              text: item.code,
            }));

            // 기존 '선택' 옵션과 API 데이터를 합침
            logicalDataTypeOptions.value = [
              { value: '', text: '선택' },
              ...apiOptions,
            ];
          }
        } catch (error) {
          console.error('getSupportedDataTypes 호출 중 오류:', error);
          // 오류 발생 시 기본값 유지
          logicalDataTypeOptions.value = [
            { value: '', text: '선택' },
            { value: 'CHAR', text: 'CHAR' },
            { value: 'VARCHAR', text: 'VARCHAR' },
            { value: 'NUMERIC', text: 'NUMERIC' },
            { value: 'DATETIME', text: 'DATETIME' },
          ];
        }
      });

      return {
        propsRelatedTermList,
        relatedTermWindowView,
        relatedTermState,
        onRelatedTerm,
        onCloseRelatedTermWindow,
        handleRelatedTerm,
        domainNameData,
        logicalDataTypeOptions,
        logicalDataTypeSelected,
        codeTypeOptions,
        selectCodeType,
        domainName,
        searchUnityCodeWindowView,
        onOpenSearchUnityCodeWindow,
        onSearchUnityCodeWindowSave,
        onCloseSearchUnityCodeWindow,
        onSelectReg,
        saveConfirmState,
        onSaveConfirm,
        onSave,
        resetConfirmState,
        onResetConfirm,
        onReset,
        useDctnryId,
        selectDomainDataRef,
        showAnimate,
        domainClassSearchWindowView,
        onOpenDomainClassSearchWindow,
        onCloseDomainClassSearchWindow,
        onDomainClassSearchSave,
        domainRequestPrams,
        onSaveDivide,
        cancelConfirmState,
        onCancelConfirm,
        onCancel,
        domainValidationErrorWindowView,
        onOpenDomainValidationErrorWindow,
        onCloseDomainValidationErrorWindow,
        domainErrorMessages,
        onDomainValidationErrorSave,
        domainQuery,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
