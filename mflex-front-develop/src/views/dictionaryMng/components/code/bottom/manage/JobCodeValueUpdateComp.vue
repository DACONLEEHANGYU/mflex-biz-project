<template>
  <div class="inputs-row">
    <div class="input-top">
      <div class="title-top">
        <div class="title-s">
          <div class="title-s-left">
            코드값 상세 정보
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
              @click="onSelectReg(4)"
              title="작업수정"
              :disabled="isRemoveJob"
            >
              작업수정
            </button>
          </div>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s green"
              @click="onSaveConfirm"
              :disabled="isSelectType == 'search'"
            >
              저장
            </button>
            <button
              class="btn-s"
              @click="onResetConfirm"
              :disabled="isSelectType == 'search' || isSelectType == 'remove'"
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
                    :class="codeValueData.selectType.type"
                  >
                    {{ codeValueData.selectType.label }}
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
                      v-model="codeValueData.revisionDate"
                      :disabled="
                        isSelectType === 'search' || isSelectType === 'remove'
                      "
                    />
                    <input
                      class="input-text"
                      type="text"
                      placeholder=""
                      style="width: 30%"
                      v-model="codeValueData.revisionCycle"
                      :disabled="
                        isSelectType === 'search' || isSelectType === 'remove'
                      "
                    />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*통합코드한글명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div
                    class="dictionary_up_name_div"
                    style="
                      padding-top: 6.5px;
                      line-height: 1.5;
                      background: #f5f5f5;
                      width: 100%;
                    "
                  >
                    <AppStateText v-model="codeValueData.unityCodeKoreanName" />
                  </div>
                </div>
              </td>
              <th class="required">*코드유형</th>
              <td class="manage-input-form-td">
                <input
                  class="input-text"
                  type="text"
                  placeholder=""
                  style="width: 100%"
                  v-model="codeValueData.codeType"
                  readonly
                />
              </td>
            </tr>
            <tr>
              <th class="required">*코드값</th>
              <td colspan="4" class="manage-input-form-td">
                <div class="td-col">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="codeValueData.codeValue"
                    :disabled="
                      isSelectType === 'search' ||
                      isSelectType === 'remove' ||
                      isSelectType === 'modify' ||
                      isSelectType === 'job'
                    "
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*코드값명</th>
              <td colspan="4" class="manage-input-form-td">
                <div class="td-col">
                  <input
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="codeValueData.codeValueName"
                    :disabled="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  />
                </div>
              </td>
            </tr>
            <tr>
              <th>코드값설명</th>
              <td colspan="4" class="manage-input-form-td">
                <div class="td-col">
                  <textarea
                    style="height: 90px"
                    placeholder="설명을 입력하세요"
                    v-model="codeValueData.explain"
                    :disabled="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  ></textarea>
                </div>
              </td>
            </tr>
            <tr>
              <th>상위코드값</th>
              <td colspan="4" class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <div
                    class="dictionary_up_name_div"
                    style="padding-top: 6.5px; line-height: 1.5; width: 100%"
                    :style="
                      isSelectType === 'search' || isSelectType === 'remove'
                        ? 'background: #f5f5f5'
                        : ''
                    "
                  >
                    <AppStateText v-model="codeValueData.parentCodeValue" />
                  </div>
                  <button
                    class="btn-s dark-gray ml5"
                    @click="onOpenParentCodeValueSearchWindow"
                    :disabled="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  >
                    검색
                  </button>
                </div>
              </td>
            </tr>
            <tr>
              <th>참조코드값</th>
              <td colspan="4" class="manage-input-form-td">
                <div class="td-col manage-input-div">
                  <div
                    class="dictionary_up_name_div"
                    style="padding-top: 6.5px; line-height: 1.5; width: 100%"
                    :style="
                      isSelectType === 'search' || isSelectType === 'remove'
                        ? 'background: #f5f5f5'
                        : ''
                    "
                  >
                    <AppStateText v-model="codeValueData.referenceCodeValue" />
                  </div>
                  <button
                    class="btn-s dark-gray ml5"
                    @click="onOpenReferenceCodeValueSearchWindow"
                    :disabled="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  >
                    검색
                  </button>
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
                    v-model="codeValueData.updater"
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
                    v-model="codeValueData.updateDateTime"
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

  <!-- 상위코드값 검색 팝업 -->
  <AppWindow
    :view="parentCodeValueSearchWindowView"
    @close="onCloseParentCodeValueSearchWindow"
    width="720px"
    height="auto"
  >
    <ParentCodeValueSearchWindow
      @confirm="onParentCodeValueSearchSave"
      @close="onCloseParentCodeValueSearchWindow"
    />
  </AppWindow>

  <!-- 참조코드값 검색 팝업 -->
  <AppWindow
    :view="referenceCodeValueSearchWindowView"
    @close="onCloseReferenceCodeValueSearchWindow"
    width="720px"
    height="auto"
  >
    <ReferenceCodeValueSearchWindow
      @confirm="onReferenceCodeValueSearchSave"
      @close="onCloseReferenceCodeValueSearchWindow"
    />
  </AppWindow>
</template>

<script>
  import { reactive, ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import {
    getUpdateCodeValue, // 코드값 수정
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import ParentCodeValueSearchWindow from '@/components/popWindow/ParentCodeValueSearchWindow.vue';
  import ReferenceCodeValueSearchWindow from '@/components/popWindow/ReferenceCodeValueSearchWindow.vue';
  export default {
    props: {
      codeValueDetails: {
        type: Object,
        default: () => ({}),
      },
      codeJobType: {
        type: String,
        default: 'onData',
      },
    },
    components: {
      AppTooltip,
      AppWindow,
      ParentCodeValueSearchWindow,
      ReferenceCodeValueSearchWindow,
    },
    computed: {
      // 타입 구분
      isSelectType() {
        if (this.codeValueData.selectType.type === 'search') {
          return 'search';
        }
        if (this.codeValueData.selectType.type === 'new') {
          return 'new';
        }
        if (this.codeValueData.selectType.type === 'modify') {
          return 'modify';
        }
        if (this.codeValueData.selectType.type === 'remove') {
          return 'remove';
        }
        if (this.codeValueData.selectType.type.includes('job')) {
          if (this.codeValueData.selectType.type === 'job-remove') {
            return 'job-remove';
          }
          return 'job';
        }
        return 'search';
      },
      isRemoveJob() {
        if (this.codeValueData.jobDivisionCode === 'DELETE') {
          return true;
        } else {
          return false;
        }
      },
    },
    emits: ['job-code-value-save'],
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId, userNm } = userInfo.value;
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const dictionaryMngStore = useDictionaryMngStore();
      const { setIsCodeJobSave, setIsCodeJobApproval } = dictionaryMngStore;
      const { codeValueJobUpdateData, codeJobSelectData } =
        storeToRefs(dictionaryMngStore);

      const showAnimate = ref(false);

      const codeValueRowData = ref({});

      const regType = reactive([
        { id: 0, label: '신규등록', type: 'new' },
        { id: 1, label: '변경등록', type: 'modify' },
        { id: 2, label: '삭제등록', type: 'remove' },
        { id: 3, label: '자료조회', type: 'search' },
        { id: 4, label: '신규등록', type: 'job-new' },
        { id: 5, label: '변경등록', type: 'job-modify' },
        { id: 6, label: '삭제등록', type: 'job-remove' },
      ]);

      // 코드 타입 선택옵션
      const codeTypeOptions = [
        { value: 'select', text: '선택' },
        { value: 'GENERAL_CODE', text: '일반코드' },
        { value: 'CLASS_CODE', text: '계층코드' },
        { value: 'REFERENCE_CODE', text: '참조코드' },
      ];
      const codeTypeSelected = ref(codeTypeOptions[0].value);

      const updateDateTime = new Date().toISOString().split('T')[0];
      const revisionDate = new Date().toISOString().split('T')[0];

      const codeValueData = ref({
        jobDivisionCode: null,
        jobDivisionName: null,
        selectType: { id: 3, label: '자료조회', type: 'search' },
        revisionDate: revisionDate,
        revisionCycle: null,
        unityCodeName: null,
        unityCodeValue: null,
        unityCodeValueName: null,
        unityCodeDictionaryId: null,
        unityCodeKoreanName: [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: '60',
          },
        ],
        codeType: null,
        codeValue: null,
        codeValueName: null,
        parentCodeValue: [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: '60',
          },
        ],
        referenceCodeValue: [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: '60',
            value: '',
          },
        ],
        explain: null,
        updater: userId,
        updateDateTime: updateDateTime,
        isJobDetails: false,
      });

      // 코드값 상세정보 초기화
      const resetCodeValueData = () => {
        console.log('resetCodeValueData!!!');
        codeValueData.value = {
          selectType: { id: 0, label: '신규등록', type: 'new' },
          revisionDate: revisionDate,
          revisionCycle: null,
          unityCodeName: codeValueRowData.value.unityCode.name,
          unityCodeValue: codeValueData.value.unityCodeValue,
          unityCodeValueName: codeValueData.value.unityCodeValueName,
          unityCodeDictionaryId: codeValueRowData.value.unityCode.dictionary.id,
          unityCodeKoreanName: [
            {
              id: 0,
              label: codeValueRowData.value.unityCode.koreanName,
              type: codeValueRowData.value.unityCode.dictionary.type.name,
              color: codeValueRowData.value.unityCode.dictionary.type.fontColor,
              bgColor:
                codeValueRowData.value.unityCode.dictionary.type
                  .backgroundColor,
              size: '60',
            },
          ],
          codeType: codeValueRowData.value.unityCodeTypeName,
          codeValue: null,
          codeValueName: null,
          parentCodeValue: [
            {
              id: 0,
              label: '',
              type: '',
              color: '',
              bgColor: '',
              codeValue: '',
              codeName: '',
              dictionaryId: '',
              size: '60',
            },
          ],
          referenceCodeValue: [
            {
              id: 0,
              label: '',
              type: '',
              color: '',
              bgColor: '',
              codeValue: '',
              codeName: '',
              dictionaryId: '',
              size: '60',
            },
          ],
          explain: null,
          updater: userId,
          updateDateTime: updateDateTime,
        };

        console.log('resetCodeValueData - codeValueData : ', codeValueData);
      };

      // 코드값 상세정보 바인딩
      const bindCodeValueDetail = (response) => {
        console.log('bindCodeValueDetails - response : ', response);

        const codeValues = response.data ? response.data : response;

        codeValueData.value.jobDivisionCode = codeValues.jobDivisionCode;
        codeValueData.value.jobDivisionName = codeValues.jobDivisionName;
        codeValueData.value.selectType = regType[3];
        codeValueData.value.revisionDate = codeValues.revisionDate;
        codeValueData.value.revisionCycle = codeValues.revisionCycle;
        codeValueData.value.explain = codeValues.unityCode.valueExplain;
        codeValueData.value.updater = codeValues.updater;
        codeValueData.value.updateDateTime = codeValues.updateDateTime;
        codeValueData.value.codeValue = codeValues.unityCode.value;
        codeValueData.value.codeValueName = codeValues.unityCode.valueName;
        codeValueData.value.codeType = codeValues.unityCodeTypeName;

        // 통합코드 한글명
        codeValueData.value.unityCodeKoreanName[0].label =
          codeValues.unityCode.koreanName;
        codeValueData.value.unityCodeKoreanName[0].type =
          codeValues.unityCode.dictionary.type.name;
        codeValueData.value.unityCodeKoreanName[0].color =
          codeValues.unityCode.dictionary.type.fontColor;
        codeValueData.value.unityCodeKoreanName[0].bgColor =
          codeValues.unityCode.dictionary.type.backgroundColor;
        codeValueData.value.unityCodeDictionaryId =
          codeValues.unityCode.dictionary.id;

        // 상위코드
        codeValueData.value.parentCodeValue[0].label =
          codeValues.parentUnityCode.name;
        codeValueData.value.parentCodeValue[0].type =
          codeValues.parentUnityCode.dictionary.type.name;
        codeValueData.value.parentCodeValue[0].color =
          codeValues.parentUnityCode.dictionary.type.fontColor;
        codeValueData.value.parentCodeValue[0].bgColor =
          codeValues.parentUnityCode.dictionary.type.backgroundColor;
        codeValueData.value.parentCodeValue[0].codeValue =
          codeValues.parentUnityCode.value;
        codeValueData.value.parentCodeValue[0].dictionaryId =
          codeValues.parentUnityCode.dictionary.id;
        codeValueData.value.parentCodeValue[0].codeName =
          codeValues.parentUnityCode.name;

        // 참조코드
        codeValueData.value.referenceCodeValue[0].label =
          codeValues.referenceUnityCode.name;
        codeValueData.value.referenceCodeValue[0].type =
          codeValues.referenceUnityCode.dictionary.type.name;
        codeValueData.value.referenceCodeValue[0].color =
          codeValues.referenceUnityCode.dictionary.type.fontColor;
        codeValueData.value.referenceCodeValue[0].bgColor =
          codeValues.referenceUnityCode.dictionary.type.backgroundColor;
        codeValueData.value.referenceCodeValue[0].codeValue =
          codeValues.referenceUnityCode.value;
        codeValueData.value.referenceCodeValue[0].dictionaryId =
          codeValues.referenceUnityCode.dictionary.id;
        codeValueData.value.referenceCodeValue[0].codeName =
          codeValues.referenceUnityCode.name;

        codeValueData.value.unityCodeName = codeValues.unityCode.name;
        codeValueData.value.unityCodeValue = codeValues.unityCode.value;
        codeValueData.value.unityCodeValueName = codeValues.unityCode.valueName;
        codeValueData.value.unityCodeDictionaryId =
          codeValues.unityCode.dictionary.id;
      };

      const onSelectReg = (value) => {
        console.log('onSelectReg - value : ', value);

        if (value === 0) {
          resetCodeValueData();
          //bindCodeValueRowData();
        } else if (value === 2) {
          bindCodeValueRowData();
        } else if (value === 4) {
          console.log('codeValueRowData.value : ', codeValueRowData.value);
          console.log('작업수정');

          if (codeValueRowData.value.jobDivisionName === '신규등록') {
            codeValueData.value.selectType = regType[4];
          } else if (codeValueRowData.value.jobDivisionName === '변경등록') {
            codeValueData.value.selectType = regType[5];
          } else if (codeValueRowData.value.jobDivisionName === '삭제등록') {
            codeValueData.value.selectType = regType[6];
          }
          return;
        }
        codeValueData.value.selectType = regType[value];
      };

      //저장
      const saveConfirmState = reactive({
        view: false,
        message: '작업 내용을 저장하시겠습니까?',
      });
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };

      // 저장 emit 상위 컴포넌트로 전달
      const onSave = async () => {
        emit('job-code-value-save', codeValueData.value);

        const codeValueQuery = {
          managementInstituteId: useMetaMngInstId,
          unityCodeDictionaryId: codeValueData.value.unityCodeDictionaryId,
          unityCodeName: codeValueData.value.unityCodeName,
          unityCodeValue: codeValueData.value.codeValue,
          unityCodeValueName: codeValueData.value.codeValueName,
          unityCodeValueExplain: codeValueData.value.explain,
          parentDictionaryId:
            codeValueData.value.parentCodeValue[0].dictionaryId,
          parentUnityCodeName: codeValueData.value.parentCodeValue[0].codeName,
          parentUnityCodeValue:
            codeValueData.value.parentCodeValue[0].codeValue,
          referenceDictionaryId:
            codeValueData.value.referenceCodeValue[0].dictionaryId,
          referenceCodeName: codeValueData.value.referenceCodeValue[0].codeName,
          referenceCodeValue:
            codeValueData.value.referenceCodeValue[0].codeValue,
          revisionCycle: codeValueData.value.revisionCycle,
          revisionDate: codeValueData.value.revisionDate,
        };

        const response = await getUpdateCodeValue(codeValueQuery);

        // 작업완료(승인신청) 상태 변경
        setIsCodeJobApproval(true);

        // 작업저장 상태 변경
        setIsCodeJobSave(true);
        saveConfirmState.view = false;
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
          codeValueData.value.selectType
        );

        bindCodeValueRowData();

        // 변경등록 시 초기화 추가
        resetConfirmState.view = false;
      };

      // watch(
      //   () => props.codeValueDetails,
      //   async (newVal) => {
      //     if (newVal) {
      //       console.log('newVal!!! ', newVal);

      //       // 작업목록에서 선택한 경우
      //       if (newVal.jobDivisionCode) {
      //         bindCodeValueDetail(newVal);
      //         codeValueData.value.isJobDetails = true;
      //         codeValueRowData.value = newVal;
      //         return; // 여기서 함수 전체 종료
      //       }

      //       // unityCodeDictionaryId가 있고 unityCode가 없는 경우
      //       if (newVal.unityCodeDictionaryId && !newVal.unityCode) {
      //         return; // 여기서 함수 전체 종료
      //       }
      //     }
      //   },
      //   { immediate: true }
      // );

      const bindCodeValueRowData = () => {
        console.log('bindCodeValueRowData!!!');
        console.log('codeValueRowData : ', codeValueRowData.value);

        //codeValueData.value.selectType = regType[3];
        codeValueData.value.revisionDate = codeValueRowData.value.revisionDate;
        codeValueData.value.revisionCycle =
          codeValueRowData.value.revisionCycle;
        codeValueData.value.explain =
          codeValueRowData.value.unityCode.valueExplain;
        codeValueData.value.updater = codeValueRowData.value.updater;
        codeValueData.value.updateDateTime =
          codeValueRowData.value.updateDateTime;
        codeValueData.value.codeValue = codeValueRowData.value.unityCode.value;
        codeValueData.value.codeValueName =
          codeValueRowData.value.unityCode.valueName;
        codeValueData.value.codeType = codeValueRowData.value.unityCodeTypeName;

        // 통합코드 한글명
        codeValueData.value.unityCodeKoreanName[0].label =
          codeValueRowData.value.unityCode.koreanName;
        codeValueData.value.unityCodeKoreanName[0].type =
          codeValueRowData.value.unityCode.dictionary.type.name;
        codeValueData.value.unityCodeKoreanName[0].color =
          codeValueRowData.value.unityCode.dictionary.type.fontColor;
        codeValueData.value.unityCodeKoreanName[0].bgColor =
          codeValueRowData.value.unityCode.dictionary.type.backgroundColor;

        // 상위코드
        codeValueData.value.parentCodeValue[0].label =
          codeValueRowData.value.parentUnityCode.name;
        codeValueData.value.parentCodeValue[0].type =
          codeValueRowData.value.parentUnityCode.dictionary.type.name;
        codeValueData.value.parentCodeValue[0].color =
          codeValueRowData.value.parentUnityCode.dictionary.type.fontColor;
        codeValueData.value.parentCodeValue[0].bgColor =
          codeValueRowData.value.parentUnityCode.dictionary.type.backgroundColor;

        // 참조코드
        codeValueData.value.referenceCodeValue[0].label =
          codeValueRowData.value.referenceUnityCode.name;
        codeValueData.value.referenceCodeValue[0].type =
          codeValueRowData.value.referenceUnityCode.dictionary.type.name;
        codeValueData.value.referenceCodeValue[0].color =
          codeValueRowData.value.referenceUnityCode.dictionary.type.fontColor;

        codeValueData.value.unityCodeName =
          codeValueRowData.value.unityCode.name;
        codeValueData.value.unityCodeValue =
          codeValueRowData.value.unityCode.value;
        codeValueData.value.unityCodeValueName =
          codeValueRowData.value.unityCode.valueName;
      };

      // 상위코드값 검색
      const parentCodeValueSearchWindowView = ref(false);
      const onOpenParentCodeValueSearchWindow = () => {
        parentCodeValueSearchWindowView.value = true;
      };
      const onCloseParentCodeValueSearchWindow = () => {
        parentCodeValueSearchWindowView.value = false;
      };

      // 상위코드값 검색 저장 시
      const onParentCodeValueSearchSave = (data) => {
        console.log('상위코드검색 data : ', data);

        const parentCodeLabel = `[${data.unityCode.koreanName}].${data.codeValue.codeValueName}`;

        console.log('parentCodeLabel : ', parentCodeLabel);

        codeValueData.value.parentCodeValue[0].label = parentCodeLabel;
        codeValueData.value.parentCodeValue[0].type =
          data.unityCode.dictionary.type.name;
        codeValueData.value.parentCodeValue[0].color =
          data.unityCode.dictionary.type.color;
        codeValueData.value.parentCodeValue[0].bgColor =
          data.unityCode.dictionary.type.bgColor;
        codeValueData.value.parentCodeValue[0].codeValue =
          data.codeValue.codeValue;
        codeValueData.value.parentCodeValue[0].codeName = data.unityCode.name;
        codeValueData.value.parentCodeValue[0].dictionaryId =
          data.unityCode.dictionary.id;

        onCloseParentCodeValueSearchWindow();
      };

      // 참조코드값 검색
      const referenceCodeValueSearchWindowView = ref(false);
      const onOpenReferenceCodeValueSearchWindow = () => {
        referenceCodeValueSearchWindowView.value = true;
      };
      const onCloseReferenceCodeValueSearchWindow = () => {
        referenceCodeValueSearchWindowView.value = false;
      };

      // 참조코드값 검색 저장 시
      const onReferenceCodeValueSearchSave = (data) => {
        console.log('참조코드검색 data : ', data);

        const referenceCodeLabel = `[${data.unityCode.koreanName}].${data.codeValue.codeValueName}`;

        console.log('referenceCodeLabel : ', referenceCodeLabel);

        codeValueData.value.referenceCodeValue[0].label = referenceCodeLabel;
        codeValueData.value.referenceCodeValue[0].type =
          data.unityCode.dictionary.type.name;
        codeValueData.value.referenceCodeValue[0].color =
          data.unityCode.dictionary.type.color;
        codeValueData.value.referenceCodeValue[0].bgColor =
          data.unityCode.dictionary.type.bgColor;
        codeValueData.value.referenceCodeValue[0].codeValue =
          data.codeValue.codeValue;
        codeValueData.value.referenceCodeValue[0].codeName =
          data.unityCode.name;
        codeValueData.value.referenceCodeValue[0].dictionaryId =
          data.unityCode.dictionary.id;

        onCloseReferenceCodeValueSearchWindow();
      };

      // 데이터가 없을 경우 코드유형 초기화
      // watch(
      //   () => props.codeJobType,
      //   (newVal) => {
      //     console.log('codeJobType newVal!!!!! : ', newVal);
      //     if (newVal === 'noData') {
      //       resetCodeValueData();
      //     }
      //   }
      // );

      // 코드값 업데이트 데이터 상태 변경 감지
      watch(
        () => codeJobSelectData.value,
        async (newVal) => {
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);

          if (newVal) {
            console.log('newVal!!! ', newVal);

            // 작업목록에서 선택한 경우
            if (newVal.jobDivisionCode) {
              bindCodeValueDetail(newVal);
              codeValueData.value.isJobDetails = true;
              codeValueRowData.value = newVal;
              return; // 여기서 함수 전체 종료
            }

            // unityCodeDictionaryId가 있고 unityCode가 없는 경우
            if (newVal.unityCodeDictionaryId && !newVal.unityCode) {
              return; // 여기서 함수 전체 종료
            }

            // 위의 모든 조건에 해당하지 않는 경우에만 실행
            // const codeValueParams = {
            //   managementInstituteId: useMetaMngInstId,
            //   userId: userInfo.value.userId,
            //   unityCodeDictionaryId: newVal.unityDictionaryId,
            //   unityCodeName: newVal.unityCodeName,
            //   unityCodeValue: newVal.unityCodeValue,
            // };
            // console.log(
            //   'JobCodeValueComp - codeValueParams : ',
            //   codeValueParams
            // );
            // const response = await getCodeValueDetails(codeValueParams);
            // codeValueRowData.value = response.data;
            // bindCodeValueDetail(response);
          }
        }
      );

      return {
        codeValueData,
        codeTypeOptions,
        onSelectReg,
        saveConfirmState,
        onSaveConfirm,
        onSave,
        resetConfirmState,
        onResetConfirm,
        onReset,
        parentCodeValueSearchWindowView,
        onOpenParentCodeValueSearchWindow,
        onCloseParentCodeValueSearchWindow,
        referenceCodeValueSearchWindowView,
        onOpenReferenceCodeValueSearchWindow,
        onCloseReferenceCodeValueSearchWindow,
        onParentCodeValueSearchSave,
        onReferenceCodeValueSearchSave,
        showAnimate,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
