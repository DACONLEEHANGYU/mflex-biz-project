<template>
  <div class="inputs-row">
    <div class="input-top">
      <div class="title-top">
        <div class="title-s">
          <div class="title-s-left">
            코드명 상세 정보
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
              v-if="!codeNameData.isJobState"
              class="btn-s add-reg"
              @click="onSelectReg(0)"
              title="신규등록"
            >
              신규등록
            </button>
            <button
              v-if="!codeNameData.isJobState"
              class="btn-s change-reg"
              @click="onSelectReg(1)"
              title="변경등록"
              :disabled="isSelectType == 'new' || previewData || isNewJob"
            >
              변경등록
            </button>
            <button
              v-if="!codeNameData.isJobState"
              class="btn-s remove-reg"
              @click="onSelectReg(2)"
              title="삭제등록"
              :disabled="isSelectType == 'new' || previewData || isNewJob"
            >
              삭제등록
            </button>
          </div>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s green"
              :disabled="isSelectType == 'search'"
              @click="onSaveConfirm"
            >
              저장
            </button>
            <button
              class="btn-s"
              :disabled="isSelectType == 'search' || isSelectType == 'remove'"
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
            <col width="20%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>작업구분</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div
                    class="application-category__icon"
                    :class="codeNameData.selectType.type"
                  >
                    {{ codeNameData.selectType.label }}
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
                      v-model="codeNameData.revisionDate"
                      :disabled="
                        isSelectType === 'search' || isSelectType === 'remove'
                      "
                    />
                    <input
                      class="input-text"
                      type="text"
                      placeholder=""
                      style="width: 30%"
                      v-model="codeNameData.revisionCycle"
                      :disabled="
                        isSelectType === 'search' || isSelectType === 'remove'
                      "
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*통합코드명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="codeNameData.unityCodeName"
                    :disabled="
                      isSelectType === 'search' ||
                      isSelectType === 'remove' ||
                      isSelectType === 'modify' ||
                      isSelectType === 'job'
                    "
                  />
                </div>
              </td>
              <th class="required">*코드유형</th>
              <td class="manage-input-form-td">
                <select
                  class="input-select"
                  style="width: 100%"
                  v-model="codeNameData.codeType"
                  :disabled="
                    isSelectType === 'search' || isSelectType === 'remove'
                  "
                >
                  <option
                    v-for="option in codeTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.text }}
                  </option>
                </select>
              </td>
            </tr>
            <tr>
              <th class="required">*통합코드한글명</th>
              <td colspan="4" class="manage-input-form-td">
                <div class="td-col">
                  <input
                    v-if="
                      isSelectType === 'new' ||
                      isSelectType === 'modify' ||
                      isSelectType === 'job'
                    "
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="codeNameData.unityCodeKoreanName[0].label"
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
                    <AppStateText v-model="codeNameData.unityCodeKoreanName" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*데이터타입</th>
              <td class="manage-input-form-td">
                <select
                  class="input-select"
                  v-model="codeNameData.dataType"
                  style="width: 100%"
                  :disabled="
                    isSelectType === 'search' || isSelectType === 'remove'
                  "
                >
                  <option
                    v-for="option in dataTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.text }}
                  </option>
                </select>
              </td>
              <th class="required">*데이터길이</th>
              <td class="manage-input-form-td">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 50%"
                  v-model="codeNameData.dataLength"
                  :disabled="
                    isSelectType === 'search' || isSelectType === 'remove'
                  "
                />
              </td>
            </tr>
            <tr>
              <th>통합코드설명</th>
              <td class="manage-input-form-td" colspan="3">
                <div class="td-col">
                  <textarea
                    style="height: 90px"
                    placeholder="설명을 입력하세요"
                    v-model="codeNameData.explain"
                    :disabled="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  ></textarea>
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
                    v-model="codeNameData.managementDepartmentName"
                    :disabled="
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
                    v-model="codeNameData.updater"
                    :disabled="
                      isSelectType === 'new' ||
                      isSelectType === 'search' ||
                      isSelectType === 'remove'
                    "
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
                    v-model="codeNameData.updateDateTime"
                    :disabled="
                      isSelectType === 'new' ||
                      isSelectType === 'search' ||
                      isSelectType === 'remove'
                    "
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
  <!-- 초기화 알림창 -->
  <AppDialog
    v-model:view="resetConfirmState.view"
    :title="resetConfirmState.title"
    :message="resetConfirmState.message"
    @confirm="onReset"
  />

  <!-- 연관용어 조회 팝업 -->
  <AppWindow
    :view="relatedTermWindowView"
    @close="onCloseRelatedTermWindow"
    width="630px"
    height="auto"
  >
    <RelatedTermByCodeWindow
      :propsRelatedTermList="propsRelatedTermList"
      :selectCode="selectCodeNameData"
      @confirm="onCloseRelatedTermWindow"
      @close="onCloseRelatedTermWindow"
    />
  </AppWindow>

  <!-- 연관용어 존재 알림창 -->
  <AppDialog
    v-model:view="relatedTermState.view"
    :title="relatedTermState.title"
    :message="relatedTermState.message"
    :type="relatedTermState.type"
    @relationTermList="onRelatedTerm"
  />
</template>

<script>
  import { nextTick, reactive, ref, watch } from 'vue';
  import {
    getCodeNameDetails,
    createNewCodeName, // 코드명 신규등록
    modifyCodeName, // 코드명 변경등록
    deleteCodeName, // 코드명 삭제등록
    getRelatedTermListByCode, // 코드명 관련용어 조회
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useAlert } from '@/composables/alert';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import RelatedTermByCodeWindow from '@/components/popWindow/RelatedTermByCodeWindow.vue';
  export default {
    props: {
      codeNameDetails: {
        type: Object,
        default: () => ({}),
      },
    },
    components: {
      AppTooltip,
      AppWindow,
      RelatedTermByCodeWindow,
    },
    computed: {
      // 타입 구분
      isSelectType() {
        if (this.codeNameData.selectType.type === 'search') {
          return 'search';
        }
        if (this.codeNameData.selectType.type === 'new') {
          return 'new';
        }
        if (this.codeNameData.selectType.type === 'modify') {
          return 'modify';
        }
        if (this.codeNameData.selectType.type === 'remove') {
          return 'remove';
        }
        if (this.codeNameData.selectType.type.includes('job')) {
          if (this.codeNameData.selectType.type === 'job-remove') {
            return 'job-remove';
          }
          return 'job';
        }
        return 'search';
      },
      previewData() {
        if (this.codeNameData.unityCodeDictionaryId != this.useDctnryId) {
          return true;
        } else {
          return false;
        }
      },
      isNewJob() {
        if (this.codeNameData.isNewJob) {
          return true;
        } else {
          return false;
        }
      },
    },
    emits: ['job-code-name-save'],
    setup(props, { emit }) {
      const authStore = useAuthStore();

      const { alertInfos, setAlertStatus } = useAlert();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const updateDateTime = new Date().toISOString().split('T')[0];
      const revisionDate = new Date().toISOString().split('T')[0];

      const showAnimate = ref(false);

      const codeNameRowData = ref({});

      const dictionaryMngStore = useDictionaryMngStore();
      const { setIsCodeJobSave, setIsCodeJobApproval } = dictionaryMngStore;
      const { codeNameJobData, codeJobSelectData, isCodeJobType } =
        storeToRefs(dictionaryMngStore);

      const regType = reactive([
        { id: 0, label: '신규등록', type: 'new' },
        { id: 1, label: '변경등록', type: 'modify' },
        { id: 2, label: '삭제등록', type: 'remove' },
        { id: 3, label: '자료조회', type: 'search' },
        { id: 4, label: '신규등록', type: 'job-new' },
        { id: 5, label: '변경등록', type: 'job-modify' },
        { id: 6, label: '삭제등록', type: 'job-remove' },
      ]);

      const onSelectReg = (value) => {
        if (value === 0) {
          resetCodeNameData();
        } else if (value === 2) {
          bindCodeNameRowData();
        } else if (value === 4) {
          if (codeNameRowData.value.jobDivisionName === '신규등록') {
            codeNameData.value.selectType = regType[4];
          } else if (codeNameRowData.value.jobDivisionName === '변경등록') {
            codeNameData.value.selectType = regType[5];
          } else if (codeNameRowData.value.jobDivisionName === '삭제등록') {
            codeNameData.value.selectType = regType[6];
          }
          return;
        }
        codeNameData.value.selectType = regType[value];
      };

      // 데이터 타입 선택 옵션
      const dataTypeOptions = [
        { value: 'select', text: '선택' },
        { value: 'CHAR', text: 'CHAR' },
        { value: 'VARCHAR', text: 'VARCHAR' },
        { value: 'NUMERIC', text: 'NUMERIC' },
      ];
      const dataTypeSelected = ref(dataTypeOptions[0].value);

      // 코드 타입 선택옵션
      const codeTypeOptions = [
        { value: 'select', text: '선택' },
        { value: 'GENERAL_CODE', text: '일반코드' },
        { value: 'CLASS_CODE', text: '계층코드' },
        { value: 'REFERENCE_CODE', text: '참조코드' },
      ];
      const codeTypeSelected = ref(codeTypeOptions[0].value);

      const codeNameData = ref({
        selectType: { id: 3, label: '자료조회', type: 'search' },
        revisionDate: revisionDate,
        revisionCycle: null,
        unityCodeDictionaryId: null,
        unityCodeKoreanName: [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: 60,
          },
        ],
        unityCodeKName: null,
        codeType: codeTypeSelected,
        dataType: dataTypeSelected,
        dataLength: null,
        explain: null,
        managementDepartmentName: null,
        updater: null,
        updateDateTime: null,
        isJobState: false,
        isNewJob: false,
      });

      const resetCodeNameData = () => {
        codeNameData.value = {
          selectType: { id: 0, label: '신규등록', type: 'new' },
          revisionDate: revisionDate,
          revisionCycle: null,
          unityCodeKoreanName: [
            {
              id: 0,
              label: '',
              type: '',
              color: '',
              bgColor: '',
            },
          ],
          unityCodeName: null,
          codeType: 'select',
          dataType: 'select',
          dataLength: null,
          explain: null,
          managementDepartmentName: null,
          updater: userInfo.value.userId,
          updateDateTime: updateDateTime,
          isJobState: false,
        };
      };

      //저장
      const saveConfirmState = reactive({
        view: false,
        message: '작업 내용을 저장하시겠습니까?',
      });
      const onSaveConfirm = () => {
        console.log('codeNameData.value : ', codeNameData.value);
        if (
          codeNameData.value.unityCodeName === '' ||
          codeNameData.value.unityCodeName === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message = '통합코드명을 입력해주세요.';
          return;
        }
        if (
          codeNameData.value.unityCodeKoreanName[0].label === '' ||
          codeNameData.value.unityCodeKoreanName[0].label === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message = '통합코드한글명을 입력해주세요.';
          return;
        }
        if (codeNameData.value.codeType === 'select') {
          alertInfos.value.view = true;
          alertInfos.value.message = '코드유형을 선택해주세요.';
          return;
        }
        if (codeNameData.value.dataType === 'select') {
          alertInfos.value.view = true;
          alertInfos.value.message = '데이터타입을 선택해주세요.';
          return;
        }
        if (codeNameData.value.revisionDate === '' || null) {
          alertInfos.value.view = true;
          alertInfos.value.message = '제개정일자를 입력해주세요.';
          return;
        }
        if (
          codeNameData.value.dataLength === '' ||
          codeNameData.value.dataLength === null
        ) {
          alertInfos.value.view = true;
          alertInfos.value.message = '데이터길이를 입력해주세요.';
          return;
        }

        saveConfirmState.view = true;
      };

      // 저장 emit 상위 컴포넌트로 전달
      const onSave = async () => {
        // emit('job-code-name-save', codeNameData.value);

        const data = codeNameData.value;

        const codeNameQuery = {
          managementInstituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          unityCodeDictionaryId: data.unityCodeDictionaryId,
          unityCodeName: data.unityCodeName,
          unityCodeKoreanName: data.unityCodeKoreanName[0].label,
          unityCodeTypeCode: data.codeType,
          unityCodeExplain: data.explain,
          dataTypeCode: data.dataType,
          dataLength: data.dataLength,
          managementDepartmentName: data.managementDepartmentName,
          revisionCycle: data.revisionCycle,
          revisionDate: data.revisionDate,
        };

        if (data.selectType.type === 'new') {
          console.log('신규등록');
          // 코드명 신규등록 API 실행
          //codeNameQuery.dictionaryId = value.unityCodeDictionaryId;
          const response = await createNewCodeName(codeNameQuery);
          console.log('response : ', response);

          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
            return;
          }
          emit('job-code-name-save');

          // 코드작업목록 재조회
        } else if (data.selectType.type === 'modify') {
          codeNameQuery.dictionaryId = data.unityCodeDictionaryId;
          const response = await modifyCodeName(codeNameQuery);

          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
            return;
          }
          emit('job-code-name-save');
        } else if (data.selectType.type === 'remove') {
          const relationTermParas = {
            unityCodeName: data.unityCodeName,
            dictionaryId: data.unityCodeDictionaryId,
            // dictionaryId: useDctnryId,
          };

          const relationTermList = await getRelatedTermListByCode(
            relationTermParas
          );

          if (relationTermList.data.length > 0) {
            relatedTermState.view = true;
            propsRelatedTermList.value = relationTermList.data;
            // emit('exist-related-term', relationTermList.data);
            return;
          }

          codeNameQuery.dictionaryId = data.unityCodeDictionaryId;
          const response = await deleteCodeName(codeNameQuery);

          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
            return;
          }
          emit('job-code-name-save');
        }

        saveConfirmState.view = false;

        // 작업완료(승인신청) 상태변경
        setIsCodeJobApproval(true);

        // 작업저장 상태변경
        setIsCodeJobSave(true);
      };

      // 초기화 팝업 상태
      const resetConfirmState = reactive({
        view: false,
        message: '초기화 하시겠습니까?',
      });

      // 초기화 팝업 출력
      const onResetConfirm = () => {
        console.log('onResetConfirm');
        resetConfirmState.view = true;
      };

      // 초기화
      const onReset = () => {
        console.log('onReset');
        // 신규등록 시 초기화

        console.log(
          'codeNameData.value.selectType : ',
          codeNameData.value.selectType
        );

        if (codeNameData.value.selectType.type === 'modify') {
          console.log('변경등록 초기화 추가');
          console.log('codeNameRowData.value : ', codeNameRowData.value);

          //codeNameData.value.selectType = regType[1];
          bindCodeNameRowData();
        } else {
          resetCodeNameData();
        }

        // 변경등록 시 초기화 추가
        resetConfirmState.view = false;
      };

      // 코드명 데이터 바인딩
      const bindCodeNameData = async (codeNameParams) => {
        const codeNameDetails = await getCodeNameDetails(codeNameParams);

        console.log('bindCodeNameData - codeNameDetails :', codeNameDetails);

        // 원본 데이터 보관
        codeNameRowData.value = codeNameDetails.data;

        const codeName = codeNameDetails.data
          ? codeNameDetails.data
          : codeNameDetails;

        codeNameData.value.selectType = regType[3];
        codeNameData.value.revisionDate = codeName.revisionDate;
        codeNameData.value.revisionCycle = codeName.revisionCycle;
        codeNameData.value.dataType = codeName.dataTypeCode;
        codeNameData.value.unityCodeName = codeName.unityCode.name;
        codeNameData.value.unityCodeKoreanName[0].label =
          codeName.unityCode.koreanName;
        codeNameData.value.unityCodeKoreanName[0].type =
          codeName.unityCode.dictionary.type.name;
        codeNameData.value.unityCodeKoreanName[0].color =
          codeName.unityCode.dictionary.type.fontColor;
        codeNameData.value.unityCodeKoreanName[0].bgColor =
          codeName.unityCode.dictionary.type.backgroundColor;
        codeNameData.value.dataLength = codeName.dataLength;
        codeNameData.value.explain = codeName.unityCode.explain;
        codeNameData.value.managementDepartmentName =
          codeName.managementDepartmentName;
        codeNameData.value.updater = codeName.updater;
        codeNameData.value.updateDateTime = codeName.updateDateTime;
        codeNameData.value.codeType = codeName.unityCodeTypeCode;
        codeNameData.value.unityCodeDictionaryId =
          codeName.unityCode.dictionary.id;
        codeNameData.value.isJobState = false;

        selectCodeNameData.value = codeNameData.value;

        //console.log('codeNamePrams : ', codeNamePrams);
        //const codeNameData = await getCodeNameDetails(codeNameDetails.value);
      };

      // 삭제등록 작업을 클릭한 경우
      const jobRemoveYn = ref(false);

      // 작업선택 시
      const bindJobDetailsByCodeName = (codeName) => {
        console.log('bindJobDetailsByCodeName - codeName : ', codeName);

        if (codeName.jobDivisionName === '삭제등록') {
          jobRemoveYn.value = true;
        } else {
          jobRemoveYn.value = false;
        }

        codeNameData.value.selectType = regType[3];
        codeNameData.value.revisionDate = codeName.revisionDate;
        codeNameData.value.revisionCycle = codeName.revisionCycle;
        codeNameData.value.dataType = codeName.dataTypeCode;
        codeNameData.value.unityCodeName = codeName.unityCode.name;
        codeNameData.value.unityCodeKoreanName[0].label =
          codeName.unityCode.koreanName;
        codeNameData.value.unityCodeKoreanName[0].type =
          codeName.unityCode.dictionary.type.name;
        codeNameData.value.unityCodeKoreanName[0].color =
          codeName.unityCode.dictionary.type.fontColor;
        codeNameData.value.unityCodeKoreanName[0].bgColor =
          codeName.unityCode.dictionary.type.backgroundColor;
        codeNameData.value.dataLength = codeName.dataLength;
        codeNameData.value.explain = codeName.unityCode.explain;
        codeNameData.value.managementDepartmentName =
          codeName.managementDepartmentName;
        codeNameData.value.updater = codeName.updater;
        codeNameData.value.updateDateTime = codeName.updateDateTime;
        codeNameData.value.codeType = codeName.unityCodeTypeCode;
        codeNameData.value.unityCodeDictionaryId =
          codeName.unityCode.dictionary.id;
        codeNameData.value.isJobState = true;
      };

      // 코드명 변동사항 감지
      // watch(
      //   () => props.codeNameDetails,
      //   async (newVal) => {
      //     console.log('jobCodeNameComp - newVal  : ', newVal);

      //     if (newVal === null) {
      //       resetCodeNameData();
      //       return;
      //     }

      //     if (newVal) {
      //       console.log('jobCodeNameComp - codeNameDetails : ', newVal);
      //       //bindCodeNameData(value);

      //       // 작업목록을 선택 한경우
      //       if (newVal.jobDivisionCode) {
      //         console.log('작업클릭 jobCodeNameComp - codeName : ', newVal);
      //         codeNameRowData.value = newVal;
      //         bindJobDetailsByCodeName(newVal);
      //       } else {
      //         //bindCodeNameData(newVal.value);
      //         const codeName = newVal.data ? newVal.data : newVal;

      //         // [신규등록] 항목일 경우
      //         if (newVal.unityCodeKoreanName[0].label.includes('[신규등록]')) {
      //           const codeNameParams = {
      //             managementInstituteId: useMetaMngInstId,
      //             userId: userInfo.value.userId,
      //             unityCodeDictionaryId: codeName.unityCodeDictionaryId,
      //             unityCodeName: codeName.unityCodeName,
      //           };
      //           await bindCodeNameData(codeNameParams);
      //           codeNameData.value.isNewJob = true;
      //           return;
      //         }

      //         console.log('일반 클릭 jobCodeNameComp - codeName : ', codeName);

      //         const codeNameParams = {
      //           managementInstituteId: useMetaMngInstId,
      //           userId: userInfo.value.userId,
      //           unityCodeDictionaryId: codeName.unityCodeDictionaryId,
      //           unityCodeName: codeName.unityCodeName,
      //         };

      //         await bindCodeNameData(codeNameParams);
      //         codeNameData.value.isNewJob = false;
      //       }
      //       // const response = await getCodeNameDetails(codeNameParams);

      //       // console.log('response : ', response);

      //       // console.log('codeNameParams : ', codeNameParams);
      //     }
      //   },
      //   { deep: true },
      //   { immediate: true }
      // );

      const bindCodeNameRowData = () => {
        console.log(
          'bindCodeNameRowData - codeNameRowData : ',
          codeNameRowData
        );
        codeNameData.value.revisionDate = codeNameRowData.value.revisionDate;
        codeNameData.value.revisionCycle = codeNameRowData.value.revisionCycle;
        codeNameData.value.dataType = codeNameRowData.value.dataTypeCode;
        codeNameData.value.unityCodeName = codeNameRowData.value.unityCode.name;
        codeNameData.value.unityCodeKoreanName[0].label =
          codeNameRowData.value.unityCode.koreanName;
        codeNameData.value.unityCodeKoreanName[0].type =
          codeNameRowData.value.unityCode.dictionary.type.name;
        codeNameData.value.unityCodeKoreanName[0].color =
          codeNameRowData.value.unityCode.dictionary.type.fontColor;
        codeNameData.value.unityCodeKoreanName[0].bgColor =
          codeNameRowData.value.unityCode.dictionary.type.backgroundColor;
        codeNameData.value.dataLength = codeNameRowData.value.dataLength;
        codeNameData.value.explain = codeNameRowData.value.unityCode.explain;
        codeNameData.value.managementDepartmentName =
          codeNameRowData.value.managementDepartmentName;
        codeNameData.value.updater = codeNameRowData.value.updater;
        codeNameData.value.updateDateTime =
          codeNameRowData.value.updateDateTime;
        codeNameData.value.codeType = codeNameRowData.value.unityCodeTypeCode;
      };

      // 코드명 데이터 상태 변경 감지
      watch(
        () => codeJobSelectData.value,
        async (newVal) => {
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);

          if (newVal === null) {
            resetCodeNameData();
            return;
          }

          if (newVal) {
            console.log('jobCodeNameComp - codeNameDetails : ', newVal);
            //bindCodeNameData(value);

            // 작업목록을 선택 한경우
            if (newVal.jobDivisionCode) {
              console.log('작업클릭 jobCodeNameComp - codeName : ', newVal);
              codeNameRowData.value = newVal;
              bindJobDetailsByCodeName(newVal);
            } else {
              //bindCodeNameData(newVal.value);
              const codeName = newVal.data ? newVal.data : newVal;

              // [신규등록] 항목일 경우
              if (newVal.unityCodeKoreanName[0].label.includes('[신규등록]')) {
                const codeNameParams = {
                  managementInstituteId: useMetaMngInstId,
                  userId: userInfo.value.userId,
                  unityCodeDictionaryId: codeName.unityCodeDictionaryId,
                  unityCodeName: codeName.unityCodeName,
                };
                await bindCodeNameData(codeNameParams);
                codeNameData.value.isNewJob = true;
                return;
              }

              console.log('일반 클릭 jobCodeNameComp - codeName : ', codeName);

              const codeNameParams = {
                managementInstituteId: useMetaMngInstId,
                userId: userInfo.value.userId,
                unityCodeDictionaryId: codeName.unityCodeDictionaryId,
                unityCodeName: codeName.unityCodeName,
              };

              await bindCodeNameData(codeNameParams);
              codeNameData.value.isNewJob = false;
            }
            // const response = await getCodeNameDetails(codeNameParams);

            // console.log('response : ', response);

            // console.log('codeNameParams : ', codeNameParams);
          }
        },
        { deep: true },
        { immediate: true }
      );

      // 코드 작업타입 변경 감지
      // watch(
      //   () => isCodeJobType.value,
      //   async (newVal) => {
      //     console.log('isCodeJobType : ', newVal);
      //     console.log(
      //       'codeNameData.value.unityCodeKName : ',
      //       codeNameData.value.unityCodeKName
      //     );
      //     if (
      //       codeNameData.value.unityCodeKName === null &&
      //       newVal === 'codeName'
      //     ) {
      //       nextTick(() => {
      //         console.log('안녕하세요');
      //         console.log(
      //           'codeJobSelectData.value : ',
      //           codeJobSelectData.value
      //         );

      //         if (newVal === null) {
      //           resetCodeNameData();
      //           return;
      //         }

      //         //bindCodeNameData(newVal.value);
      //         const codeName = codeJobSelectData.value;

      //         // [신규등록] 항목일 경우
      //         if (
      //           codeName.unityCodeKoreanName[0].label.includes('[신규등록]')
      //         ) {
      //           const codeNameParams = {
      //             managementInstituteId: useMetaMngInstId,
      //             userId: userInfo.value.userId,
      //             unityCodeDictionaryId: codeName.unityCodeDictionaryId,
      //             unityCodeName: codeName.unityCodeName,
      //           };
      //           bindCodeNameData(codeNameParams);
      //           codeNameData.value.isNewJob = true;
      //           return;
      //         }

      //         console.log('일반 클릭 jobCodeNameComp - codeName : ', codeName);

      //         const codeNameParams = {
      //           managementInstituteId: useMetaMngInstId,
      //           userId: userInfo.value.userId,
      //           unityCodeDictionaryId: codeName.unityCodeDictionaryId,
      //           unityCodeName: codeName.unityCodeName,
      //         };
      //         bindCodeNameData(codeNameParams);
      //         codeNameData.value.isNewJob = false;

      //         // const response = await getCodeNameDetails(codeNameParams);

      //         // console.log('response : ', response);

      //         // console.log('codeNameParams : ', codeNameParams);
      //       });
      //     }
      //   },
      //   { immediate: true }
      // );

      // 선택 코드네임 데이터
      const selectCodeNameData = ref({});

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

      const onCloseRelatedTermWindow = () => {
        relatedTermWindowView.value = false;
      };

      // 연관용어 존재 핸들러
      const handleRelatedTerm = (relationTermList) => {
        propsRelatedTermList.value = relationTermList;
        relatedTermState.view = true;
      };

      return {
        onSelectReg,
        regType,
        codeNameData, // 코드명 데이터
        dataTypeOptions, // 데이터타입 옵션
        codeTypeOptions, // 코드타입 옵션
        onSaveConfirm, // 저장 팝업 출력
        saveConfirmState, // 저장 팝업 상태
        onSave, // 작업저장
        onResetConfirm, // 초기화
        resetConfirmState, // 초기화 팝업 상태
        onReset, // 초기화
        jobRemoveYn,
        useDctnryId,
        handleRelatedTerm,
        onRelatedTerm,
        onCloseRelatedTermWindow,
        relatedTermState,
        relatedTermWindowView,
        propsRelatedTermList,
        selectCodeNameData,
        showAnimate,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
