<template>
  <div class="inputs-row">
    <div class="input-top">
      <div class="title-top">
        <div class="title-s">
          <div class="title-s-left">
            도메인명 상세 정보
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
              class="btn-s change-reg"
              @click="onSelectReg"
              :disabled="domainNameData.jobDivisionCode === 'DELETE'"
              title="작업수정"
            >
              작업수정
            </button>
          </div>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s green"
              :disabled="
                isSelectType === 'search' || isSelectType === 'job-remove'
              "
              @click="onSaveConfirm"
            >
              저장
            </button>
            <button
              class="btn-s"
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
              <th class="required">*제개정일자/차수</th>
              <td class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <div>
                    <input
                      class="input-date"
                      type="date"
                      placeholder=""
                      style="width: 50%; margin-right: 10px"
                      v-model="domainNameData.revisionDate"
                      :disabled="
                        isSelectType === 'search' || isSelectType === 'remove'
                      "
                    />
                    <input
                      class="input-text"
                      type="text"
                      placeholder=""
                      style="width: 30%"
                      v-model="domainNameData.revisionCycle"
                      :readonly="
                        isSelectType === 'search' || isSelectType === 'remove'
                      "
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">도메인명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <input
                    v-if="isSelectType === 'new'"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.domainNameString"
                    readonly
                  />
                  <div
                    v-else
                    class="dictionary_up_name_div"
                    style="
                      padding-top: 6.5px;
                      line-height: 1.5;
                      background: #f5f5f5;
                      width: 100%;
                    "
                  >
                    <AppStateText v-model="domainNameData.domainName" />
                  </div>
                </div>
              </td>
              <th class="required">도메인분류명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div
                    class="dictionary_up_name_div"
                    style="
                      padding-top: 6.5px;
                      line-height: 1.5;
                      background: #f5f5f5;
                      width: 91.5%;
                    "
                  >
                    <AppStateText v-model="domainNameData.domainClassName" />
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
                    isSelectType === 'remove' ||
                    isSelectType === 'modify' ||
                    isSelectType === 'job'
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
                    isSelectType === 'remove' ||
                    isSelectType === 'modify' ||
                    isSelectType === 'job'
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
                    isSelectType === 'remove' ||
                    isSelectType === 'modify' ||
                    isSelectType === 'job'
                  "
                />
              </td>
            </tr>
            <tr>
              <th>도메인 설명</th>
              <td class="manage-input-form-td" colspan="3">
                <div class="td-col">
                  <textarea
                    style="height: 90px"
                    placeholder="설명을 입력하세요"
                    v-model="domainNameData.explain"
                    :readonly="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  ></textarea>
                </div>
              </td>
            </tr>
            <tr>
              <th>코드유형</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <select
                    class="input-select"
                    v-model="domainNameData.codeTypeCode"
                    style="width: 100%"
                    :disabled="
                      isSelectType === 'search' ||
                      isSelectType === 'remove' ||
                      domainNameData.domainClassName[0].label != '코드'
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
              </td>
            </tr>
            <tr>
              <th>개별코드명</th>
              <td class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.individualCodeName"
                    :readonly="
                      isSelectType === 'search' ||
                      isSelectType === 'remove' ||
                      domainNameData.domainClassName[0].label != '코드'
                    "
                  />
                </div>
              </td>
              <th>통합코드명</th>
              <td colspan="" class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <div
                    class="dictionary_up_name_div"
                    style="padding-top: 6.5px; line-height: 1.5"
                    :style="
                      isSelectType === 'search' || isSelectType === 'remove'
                        ? { background: '#f5f5f5' }
                        : {}
                    "
                  >
                    <AppStateText v-model="domainNameData.unityCode" />
                  </div>
                  <button
                    class="btn-s dark-gray ml5"
                    :disabled="
                      isSelectType === 'search' ||
                      isSelectType === 'remove' ||
                      domainNameData.domainClassName[0].label != '코드'
                    "
                    @click="onOpenSearchUnityCodeWindow"
                  >
                    검색
                  </button>
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
                      isSelectType === 'search' || isSelectType === 'remove'
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
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  />
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
                    v-model="domainNameData.storageFormatContext"
                    :readonly="
                      isSelectType === 'search' || isSelectType === 'remove'
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
                    v-model="domainNameData.expressionFormatContext"
                    :readonly="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>제개정내용</th>
              <td class="manage-input-form-td" colspan="4">
                <div class="td-col manage-input-div">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.enactContext"
                    :readonly="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>최종수정자</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.updater"
                    readonly
                  />
                </div>
              </td>
              <th>최종수정일시</th>
              <td colspan="" class="manage-input-form-td">
                <div class="td-col">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainNameData.updateDateTime"
                    readonly
                  />
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
    @confirm="onDomainNameJobSave"
  />

  <!-- 초기화 알림창 -->
  <AppDialog
    v-model:view="resetConfirmState.view"
    :title="resetConfirmState.title"
    :message="resetConfirmState.message"
    @confirm="onReset"
  />
</template>

<script>
  import { reactive, ref, watch, computed } from 'vue';
  import { getUpdateDomainName } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { useAlert } from '@/composables/alert';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import SearchUnityCodeWindow from '@/components/popWindow/SearchUnityCodeWindow.vue';

  export default {
    components: {
      AppWindow,
      SearchUnityCodeWindow,
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
        if (this.domainNameData.selectType.type === 'remove') {
          return 'remove';
        }
        if (this.domainNameData.selectType.type.includes('job')) {
          if (this.domainNameData.selectType.type === 'job-remove') {
            return 'job-remove';
          }
          return 'job';
        }
        return 'search';
      },
    },
    emits: ['domainNameSave', 'domainNameJobSave'],
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const showAnimate = ref(false);

      const dictionaryMngStore = useDictionaryMngStore();
      const { setIsDomainJobApproval, setIsDomainJobSave } = dictionaryMngStore;
      const { domainJobData } = storeToRefs(dictionaryMngStore);

      const { alertInfos, setAlertStatus } = useAlert();

      const onSelectReg = () => {
        console.log('domainNameData.value ', domainNameData.value);

        if (domainNameData.value.jobDivisionCode === 'NEW') {
          domainNameData.value.selectType = {
            id: 0,
            label: '신규등록',
            type: 'job-new',
          };
          return;
        } else if (domainNameData.value.jobDivisionCode === 'MODIFY') {
          domainNameData.value.selectType = {
            id: 1,
            label: '변경등록',
            type: 'job-modify',
          };
          return;
        } else {
          domainNameData.value.selectType = {
            id: 2,
            label: '삭제등록',
            type: 'job-remove',
          };
        }
        console.log('작업수정');
      };

      // 논리데이터 타입 선택 옵션
      const logicalDataTypeOptions = [
        { value: '', text: '선택' },
        { value: 'CHAR', text: 'CHAR' },
        { value: 'VARCHAR', text: 'VARCHAR' },
        { value: 'NUMERIC', text: 'NUMERIC' },
      ];
      const logicalDataTypeSelected = ref(logicalDataTypeOptions[0].value);

      // 코드유형 선택 옵션
      const codeTypeOptions = [
        { value: null, text: '선택' },
        { value: 'INDIVIDUAL_CODE', text: '개별코드' },
        { value: 'UNITY_CODE', text: '통합코드' },
      ];
      const selectCodeType = ref(codeTypeOptions[0].value);

      const domainName = computed(() => {
        const domainClassLabel =
          domainNameData.value.domainClassName[0]?.label || '';

        let logicalDataTypeCode;
        if (domainNameData.value.logicalDataTypeCode === 'NUMERIC') {
          logicalDataTypeCode = 'N';
        } else if (domainNameData.value.logicalDataTypeCode === 'CHAR') {
          logicalDataTypeCode = 'C';
        } else if (domainNameData.value.logicalDataTypeCode === 'VARCHAR') {
          logicalDataTypeCode = 'V';
        } else {
          logicalDataTypeCode = '';
        }
        const dataLength = `${domainNameData.value.dataLength}` || '';

        return domainClassLabel + logicalDataTypeCode + dataLength;
      });

      const domainNameRowData = ref({});

      // 최초 선택된 domainRowData 바인딩 함수
      const bindDomainRowData = (type) => {
        const data = domainNameRowData.value;

        console.log('domainNameRowData : ', data);

        domainNameData.value = {
          selectType:
            type === 0
              ? { id: 0, label: '신규등록', type: 'job-new' }
              : { id: 1, label: '변경등록', type: 'job-modify' },
          jobDivisionCode: data.jobDivisionCode,
          jobDivisionName: data.jobDivisionName,
          domainDictionaryId: data.domain.dictionary.id,
          domainName: [
            {
              id: 0,
              label: data.domain.name,
              type: data.domain.dictionary.type.name,
              color: data.domain.dictionary.type.fontColor,
              bgColor: data.domain.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          domainClassDictionaryId: data.domainClass.dictionary.id,
          domainClassName: [
            {
              id: 0,
              label: data.domainClass.name,
              type: data.domainClass.dictionary.type.name,
              color: data.domainClass.dictionary.type.fontColor,
              bgColor: data.domainClass.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          explain: data.domain.explain,
          logicalDataTypeCode: data.logicalDataTypeCode,
          dataLength: data.dataLength,
          dataLength_integer: Math.floor(data.dataLength),
          dataDecimalPointLength: data.dataDecimalPointLength,
          codeTypeCode: data.codeTypeCode,
          individualCodeName: data.individualCodeName,
          unityCode: [
            {
              id: 0,
              label: data.unityCode.name,
              type: data.unityCode.dictionary.type.name,
              color: data.unityCode.dictionary.type.fontColor,
              bgColor: data.unityCode.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          dataUnitName: data.dataUnitName,
          dataPermissionValue: data.dataPermissionValue,
          storageFormatContext: data.storageFormatContext,
          expressionFormatContext: data.expressionFormatContext,
          enactContext: data.enactContext,
          enactDate: data.enactDate,
          enactCycle: data.enactCycle,
          revisionDate: data.revisionDate,
          revisionCycle: data.revisionCycle,
          updater: data.updater,
          updateDateTime: data.updateDateTime,
        };
      };

      const domainNameData = ref({
        selectType: { id: 3, label: '자료조회', type: 'search' },
        domainNameString: domainName,
        domainDictionaryId: '',
        domainName: [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: 60,
          },
        ],
        domainClassDictionaryId: '',
        domainClassName: [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: 60,
          },
        ],
        explain: '',
        logicalDataTypeCode: logicalDataTypeSelected,
        dataLength_integer: '',
        dataLength_decimal: '',
        dataDecimalPointLength: '',
        codeTypeCode: selectCodeType,
        individualCodeName: '',
        unityCode: [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: 60,
          },
        ],
        dataUnitName: '',
        dataPermissionValue: '',
        storageFormatContext: '',
        expressionFormatContext: '',
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
        // dataLength를 정수 부분과 소수점 부분으로 분리합니다.
        const dataLength_integer = Math.floor(originalDataLength);
        const dataLength_decimal = originalDataLength - dataLength_integer;

        domainNameData.value = {
          selectType: { id: 3, label: '자료조회', type: 'search' },
          domainDictionaryId: params.data.domain.dictionary.id,
          domainName: [
            {
              id: 0,
              label: params.data.domain.name,
              type: params.data.domain.dictionary.type.name,
              color: params.data.domain.dictionary.type.fontColor,
              bgColor: params.data.domain.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          domainClassDictionaryId: params.data.domainClass.dictionary.id,
          domainClassName: [
            {
              id: 0,
              label: params.data.domainClass.name,
              type: params.data.domainClass.dictionary.type.name,
              color: params.data.domainClass.dictionary.type.fontColor,
              bgColor: params.data.domainClass.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          explain: params.data.domain.explain,
          logicalDataTypeCode: params.data.logicalDataTypeCode,
          dataLength: params.data.dataLength,
          dataLength_integer: dataLength_integer,
          dataLength_decimal: dataLength_decimal,
          dataDecimalPointLength: params.data.dataDecimalPointLength,
          codeTypeCode: params.data.codeTypeCode,
          individualCodeName: params.data.individualCodeName,
          unityCode: [
            {
              id: 0,
              dictionaryId: params.data.unityCode.dictionary.id,
              label: params.data.unityCode.name,
              type: params.data.unityCode.dictionary.type.name,
              color: params.data.unityCode.dictionary.type.fontColor,
              bgColor: params.data.unityCode.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          dataUnitName: params.data.dataUnitName,
          dataPermissionValue: params.data.dataPermissionValue,
          storageFormatContext: params.data.storageFormatContext,
          expressionFormatContext: params.data.expressionFormatContext,
          enactContext: params.data.enactContext,
          enactDate: params.data.enactDate,
          enactCycle: params.data.enactCycle,
          revisionDate: params.data.revisionDate,
          revisionCycle: params.data.revisionCycle,
          updater: params.data.updater,
          updateDateTime: params.data.updateDateTime,
          jobUpdateYn: false,
        };

        console.log('domainNameData binding ===', domainNameData);
      };

      const jobRemoveYn = ref(false);

      // 도메인 작업 데이터 바인딩
      const bindJobDomainNameData = (newVal) => {
        console.log('도메인 작업데이터 newVal : ', newVal);

        if (newVal.jobDivisionCode === 'DELETE') {
          jobRemoveYn.value = true;
        } else {
          jobRemoveYn.value = false;
        }

        domainNameData.value = {
          selectType: { id: 3, label: '자료조회', type: 'search' },
          jobDivisionCode: newVal.jobDivisionCode,
          jobDivisionName: newVal.jobDivisionName,
          domainDictionaryId: newVal.domain.dictionary.id,
          domainName: [
            {
              id: 0,
              label: newVal.domain.name,
              type: newVal.domain.dictionary.type.name,
              color: newVal.domain.dictionary.type.fontColor,
              bgColor: newVal.domain.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          domainClassDictionaryId: newVal.domainClass.dictionary.id,
          domainClassName: [
            {
              id: 0,
              label: newVal.domainClass.name,
              type: newVal.domainClass.dictionary.type.name,
              color: newVal.domainClass.dictionary.type.fontColor,
              bgColor: newVal.domainClass.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          explain: newVal.domain.explain,
          logicalDataTypeCode: newVal.logicalDataTypeCode,
          dataLength: newVal.dataLength,
          dataLength_integer: newVal.dataLength, // 정수 부분 길이 (별도로 제공되지 않아 전체 길이를 사용)
          dataLength_decimal: newVal.dataDecimalPointLength || 0, // 소수점 이하 길이
          dataDecimalPointLength: newVal.dataDecimalPointLength,
          codeTypeCode: newVal.codeTypeCode,
          individualCodeName: newVal.individualCodeName,
          unityCode: [
            {
              id: 0,
              dictionaryId: newVal.unityCode.dictionary.id,
              label: newVal.unityCode.name,
              type: newVal.unityCode.dictionary.type.name,
              color: newVal.unityCode.dictionary.type.fontColor,
              bgColor: newVal.unityCode.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          dataUnitName: newVal.dataUnitName,
          dataPermissionValue: newVal.dataPermissionValue,
          storageFormatContext: newVal.storageFormatContext,
          expressionFormatContext: newVal.expressionFormatContext,
          enactContext: newVal.enactContext,
          enactDate: newVal.enactDate,
          enactCycle: newVal.enactCycle,
          revisionDate: newVal.revisionDate,
          revisionCycle: newVal.revisionCycle,
          updater: newVal.updater,
          updateDateTime: newVal.updateDateTime,
          jobUpdateYn: true,
        };
      };

      watch(
        () => domainJobData.value,
        async (newVal) => {
          console.log('newVal', newVal);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);

          if (newVal.jobDivisionCode) {
            console.log('도메인명 작업 선택');

            bindJobDomainNameData(newVal);
            domainNameRowData.value = newVal;
            return;
          }
        }
      );

      // domainName이 변경될 때마다 domainNameString 업데이트
      watch(domainName, (newValue) => {
        domainNameData.value.domainNameString = newValue;
      });

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

      const onDomainNameJobSave = async () => {
        const domainNameQuery = {
          managementInstituteId: useMetaMngInstId,
          domainDictionaryId: domainNameData.value.domainDictionaryId,
          dictionaryId: useDctnryId,
          domainName: domainNameData.value.domainNameString,
          domainClassDictionaryId: domainNameData.value.domainClassDictionaryId,
          domainClassName: domainNameData.value.domainClassName[0].label,
          domainExplain: domainNameData.value.explain,
          logicalDataTypeCode: domainNameData.value.logicalDataTypeCode,
          dataLength: domainNameData.value.dataLength,
          dataDecimalPointLength: domainNameData.value.dataDecimalPointLength,
          codeTypeCode: domainNameData.value.codeTypeCode,
          individualCodeName: domainNameData.value.individualCodeName,
          unityCodeDictionaryId: domainNameData.value.unityCode[0].dictionaryId,
          unityCodeName: domainNameData.value.unityCode[0].label,
          dataUnitName: domainNameData.value.dataUnitName,
          dataPermissionValue: domainNameData.value.dataPermissionValue,
          storageFormatContext: domainNameData.value.storageFormatContext,
          expressionFormatContext: domainNameData.value.expressionFormatContext,
          enactContext: domainNameData.value.enactContext,
          revisionCycle: domainNameData.value.revisionCycle,
          revisionDate: domainNameData.value.revisionDate,
          jobUpdateYn: domainNameData.value.jobUpdateYn,
        };

        // 코드유형 검증
        if (
          domainNameQuery.domainClassName === '코드' &&
          domainNameQuery.codeTypeCode === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message =
            '도메인분류가 코드 인 경우 코드유형을 선택해주세요. ';
          return;
        }

        // 개별코드명 검증
        if (
          (domainNameQuery.codeTypeCode === 'INDIVIDUAL_CODE' &&
            domainNameQuery.individualCodeName === '') ||
          domainNameQuery.individualCodeName === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message =
            '개별코드인 경우 개별코드명을 입력해주세요. ';
          return;
        }

        // 통합코드명 검증
        if (
          (domainNameQuery.codeTypeCode === 'UNITY_CODE' &&
            domainNameQuery.unityCodeName === '') ||
          domainNameQuery.unityCodeName === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message =
            '통합코드인 경우 통합코드명을 입력해주세요. ';
          return;
        }

        await getUpdateDomainName(domainNameQuery);

        console.log('domainNameQuery : ', domainNameQuery);

        setIsDomainJobSave(true);
        setIsDomainJobApproval(true);

        emit('domainNameJobSave', domainNameQuery);
      };

      //저장
      const saveConfirmState = reactive({
        view: false,
        message: '작업 내용을 저장하시겠습니까?',
      });
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
        // domainGroupSaveState.value = true;
      };

      //초기화
      const resetConfirmState = reactive({
        view: false,
        message: '작업 내용을 초기화합니다.<br>취소하시겠습니까?',
      });
      const onResetConfirm = () => {
        resetConfirmState.view = true;
      };
      const onReset = () => {
        console.log('초기화 실행');

        if (domainNameData.value.selectType.type === 'job-new') {
          bindDomainRowData(0);
          console.log('신규등록 초기화');
        } else if (domainNameData.value.selectType.type === 'job-modify') {
          // 변경등록 일때 초기화
          bindDomainRowData(1);
          console.log('변경등록 초기화');
        }
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

      return {
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
        jobRemoveYn,
        onSaveConfirm,
        saveConfirmState,
        onDomainNameJobSave,
        onResetConfirm,
        resetConfirmState,
        onReset,
        showAnimate,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
