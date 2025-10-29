<template>
  <div class="inputs-row">
    <div class="input-top">
      <div class="title-top">
        <div class="title-s">
          <div class="title-s-left">
            도메인그룹명 상세 정보
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
              class="btn-s change-reg"
              @click="onSelectReg(1)"
              :disabled="isSelectType == 'new' || isNewJob || previewData"
              title="변경등록"
            >
              변경등록
            </button>
            <button
              class="btn-s remove-reg"
              @click="onSelectReg(2)"
              :disabled="isSelectType == 'new' || isNewJob || previewData"
              title="삭제등록"
            >
              삭제등록
            </button>
          </div>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s green"
              :disabled="isSelectType === 'search'"
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
                    :class="domainGroupData.selectType.type"
                  >
                    {{ domainGroupData.selectType.label }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*도메인그룹명</th>
              <td class="manage-input-form-td" colspan="3">
                <div class="td-col">
                  <input
                    v-if="isSelectType == 'new'"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainGroupData.domainGroupName[0].label"
                  />
                  <div
                    v-else
                    class="dictionary_up_name_div"
                    style="
                      padding-top: 6.5px;
                      line-height: 1.5;
                      background: #f5f5f5;
                    "
                  >
                    <AppStateText v-model="domainGroupData.domainGroupName" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th>도메인그룹설명</th>
              <td class="manage-input-form-td" colspan="3">
                <div class="td-col">
                  <textarea
                    style="height: 90px"
                    placeholder="설명을 입력하세요"
                    v-model="domainGroupData.explain"
                    :readonly="
                      isSelectType === 'search' || isSelectType === 'remove'
                    "
                  ></textarea>
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
                    v-model="domainGroupData.updater"
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
                    v-model="domainGroupData.updateDateTime"
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

  <!-- 연관도메인분류 존재 알림창 -->
  <AppDialog
    v-model:view="relatedDomainClassState.view"
    :title="relatedDomainClassState.title"
    :message="relatedDomainClassState.message"
    :type="relatedDomainClassState.type"
    @relationDomainClassList="onRelatedClass"
  />

  <!-- 연관도메인분류 조회 팝업 -->
  <AppWindow
    :view="relatedDomainClassWindowView"
    @close="onCloseRelatedClassWindow"
    width="630px"
    height="auto"
  >
    <RelatedDomainClassWindow
      :propsRelatedClassList="propsRelatedClassList"
      :selectDomainGroup="selectDomainData"
      @confirm="onCloseRelatedClassWindow"
      @close="onCloseRelatedClassWindow"
    />
  </AppWindow>
</template>

<script>
  import { reactive, ref, watch } from 'vue';
  import { useAlert } from '@/composables/alert';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import {
    getDomainGroupDetails,
    createNewDomainGroup, // 도메인 그룹 작업 신규등록
    modifyDomainGroup, // 도메인 그룹 작업 변경등록
    deleteDomainGroup, // 도메인 그룹 작업 삭제등록
    getRelatedDomainClassList, // 연관도메인분류 조회 by 그룹
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import RelatedDomainClassWindow from '@/components/popWindow/RelatedDomainClassWindow.vue';

  export default {
    components: {
      AppTooltip,
      AppWindow,
      RelatedDomainClassWindow,
    },
    computed: {
      isSelectType() {
        if (this.domainGroupData.selectType.type === 'search') {
          return 'search';
        }
        if (this.domainGroupData.selectType.type === 'new') {
          return 'new';
        }
        if (this.domainGroupData.selectType.type === 'modify') {
          return 'modify';
        }
        if (this.domainGroupData.selectType.type === 'remove') {
          return 'remove';
        }
        return 'search';
      },
      isNewJob() {
        if (
          this.domainGroupData.domainGroupName[0].label.includes('[신규등록]')
        ) {
          return true;
        } else {
          return false;
        }
      },
      previewData() {
        if (this.domainGroupData.domainGroupDictionaryId != this.useDctnryId) {
          return true;
        } else {
          return false;
        }
      },
    },
    emits: ['domainGroupSave', 'exist-related-class'],
    setup(props, { emit }) {
      // 선택 도메인그룹 데이터
      const selectDomainData = reactive({});

      const showAnimate = ref(false);

      const authStore = useAuthStore();
      const { alertInfos, setAlertStatus } = useAlert();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId, userNm } = userInfo.value;
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const dictionaryMngStore = useDictionaryMngStore();
      const { domainJobData } = storeToRefs(dictionaryMngStore);
      const { setIsDomainJobSave, setIsDomainJobApproval } = dictionaryMngStore;

      const updater = `${userNm}(${userId})`;
      const updateDateTime = new Date().toISOString().split('T')[0];

      const regType = reactive([
        { id: 0, label: '신규등록', type: 'new' },
        { id: 1, label: '변경등록', type: 'modify' },
        { id: 2, label: '삭제등록', type: 'remove' },
        { id: 3, label: '자료조회', type: 'search' },
      ]);

      const onSelectReg = (value) => {
        domainGroupData.value.selectType = regType[value];

        if (value === 0) {
          resetDomainGroupData();
        } else if (value === 1) {
          domainGroupData.value = {
            selectType: { id: 1, label: '변경등록', type: 'modify' },
            domainGroupDictionaryId:
              domainGroupRowData.value.domainGroup.dictionary.id,
            domainGroupName: [
              {
                id: 0,
                label: domainGroupRowData.value.domainGroup.name,
                type: domainGroupRowData.value.domainGroup.dictionary.type.name,
                color:
                  domainGroupRowData.value.domainGroup.dictionary.type
                    .fontColor,
                bgColor:
                  domainGroupRowData.value.domainGroup.dictionary.type
                    .backgroundColor,
                size: 60,
              },
            ],
            explain: domainGroupRowData.value.domainGroup.explain,
            updater: domainGroupRowData.value.updater,
            updateDateTime: domainGroupRowData.value.updateDateTime,
          };
        } else if (value === 2) {
          domainGroupData.value = {
            selectType: { id: 2, label: '삭제등록', type: 'remove' },
            domainGroupDictionaryId:
              domainGroupRowData.value.domainGroup.dictionary.id,
            domainGroupName: [
              {
                id: 0,
                label: domainGroupRowData.value.domainGroup.name,
                type: domainGroupRowData.value.domainGroup.dictionary.type.name,
                color:
                  domainGroupRowData.value.domainGroup.dictionary.type
                    .fontColor,
                bgColor:
                  domainGroupRowData.value.domainGroup.dictionary.type
                    .backgroundColor,
                size: 60,
              },
            ],
            explain: domainGroupRowData.value.domainGroup.explain,
            updater: domainGroupRowData.value.updater,
            updateDateTime: domainGroupRowData.value.updateDateTime,
          };
        }

        console.log('onSelectReg value : ', value);
      };

      const domainGroupData = ref({
        // selectType: { id: 3, label: '자료조회', type: 'search' },
        selectType: { id: 0, label: '신규등록', type: 'new' },
        domainGroupName: [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: 60,
          },
        ],
        domainGroupDictionaryId: 0,
        explain: '',
        updater: userId,
        updateDateTime: updateDateTime,
        jobUpdateYn: false,
      });

      const domainGroupRowData = ref({});
      // 초기화 함수
      const resetDomainGroupData = () => {
        domainGroupData.value.selectType.id = 0;
        domainGroupData.value.selectType.label = '신규등록';
        domainGroupData.value.selectType.type = 'new';
        domainGroupData.value.domainGroupName = [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: 60,
          },
        ];
        domainGroupData.value.explain = '';
        domainGroupData.value.updater = updater;
        domainGroupData.value.updateDateTime = updateDateTime;
      };

      const jobRemoveYn = ref(false);

      //저장
      const saveConfirmState = reactive({
        view: false,
        message: '작업 내용을 저장하시겠습니까?',
      });

      const onSaveConfirm = () => {
        // 도메인그룹명 검증
        if (domainGroupData.value.domainGroupName[0].label === '' || null) {
          alertInfos.value.view = true;
          alertInfos.value.message = '도메인그룹명을 입력하세요.';
          return;
        }

        saveConfirmState.view = true;

        // domainGroupSaveState.value = true;
      };

      // 도메인 그룹 저장
      const onSave = async () => {
        saveConfirmState.view = false;

        console.log('도메인그룹 저장 데이터 : ', domainGroupData.value);

        const data = domainGroupData.value;

        const domainGroupQuery = {
          managementInstituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          domainGroupName: data.domainGroupName[0].label,
          domainGroupExplain: data.explain,
        };

        // 도메인그룹 신규등록
        if (data.selectType.type === 'new') {
          const response = await createNewDomainGroup(domainGroupQuery);
          console.log('도메인그룹 저장 결과 : ', response);

          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
            return;
          }

          emit('domainGroupSave');
        }

        // 도메인그룹 변경등록
        if (data.selectType.type === 'modify') {
          console.log('변경등록 실행 ');
          domainGroupQuery.dictionaryId = data.domainGroupDictionaryId;
          const response = await modifyDomainGroup(domainGroupQuery);

          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
            return;
          }
          emit('domainGroupSave');
        }
        // 도메인그룹 삭제등록
        if (data.selectType.type === 'remove') {
          console.log('삭제등록 실행 ');
          domainGroupQuery.dictionaryId = data.domainGroupDictionaryId;

          const relatedClassList = await getRelatedDomainClassList(
            domainGroupQuery.domainGroupName
          );
          //propsRelatedClassList.value = relatedClassList.data;

          if (relatedClassList.data.length > 0) {
            console.log('연관도메인분류 존재');
            emit('exist-related-class', relatedClassList.data);
            handleRelatedClass(relatedClassList.data);
            //relatedDomainClassState.view = true;
            return;
          } else {
            const response = await deleteDomainGroup(domainGroupQuery);
            if (response.status === 409) {
              setAlertStatus({
                view: true,
                message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
              });
              return;
            }
            emit('domainGroupSave');
          }
        }

        // 작업완료(승인완료) 상태변경
        setIsDomainJobApproval(true);

        // 작업저장 상태변경
        setIsDomainJobSave(true);

        //resetDomainGroupData();
      };

      //초기화
      const resetConfirmState = reactive({
        view: false,
        message: '선택한 항목이 작업목록에서 삭제됩니다. 계속하시겠습니까?',
      });
      const onResetConfirm = () => {
        resetConfirmState.view = true;
      };
      const onReset = () => {
        console.log('초기화 실행');

        if (domainGroupData.value.selectType.type === 'new') {
          // 신규등록 일때 초기화
          resetDomainGroupData();
        } else if (domainGroupData.value.selectType.type === 'modify') {
          // 변경등록 일때 초기화
          domainGroupData.value = {
            selectType: { id: 1, label: '변경등록', type: 'modify' },
            domainGroupDictionaryId:
              domainGroupRowData.value.domainGroup.dictionary.id,
            domainGroupName: [
              {
                id: 0,
                label: domainGroupRowData.value.domainGroup.name,
                type: domainGroupRowData.value.domainGroup.dictionary.type.name,
                color:
                  domainGroupRowData.value.domainGroup.dictionary.type
                    .fontColor,
                bgColor:
                  domainGroupRowData.value.domainGroup.dictionary.type
                    .backgroundColor,
                size: 60,
              },
            ],
            explain: domainGroupRowData.value.domainGroup.explain,
            updater: domainGroupRowData.value.updater,
            updateDateTime: domainGroupRowData.value.updateDateTime,
          };
        }
      };

      // 도메인데이터 상태 변경 감지
      watch(
        () => domainJobData.value,
        async (newVal) => {
          console.log('newVal', newVal);
          console.log('useDctnryId : ', useDctnryId);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);

          selectDomainData.value = newVal;

          if (newVal === null) {
            resetDomainGroupData();
            return;
          }

          let domainGroupQuery = {};

          if (newVal) {
            domainGroupQuery = {
              domainGroupDictionaryId:
                newVal.domainGroupName[0].domainGroupDictionaryId,
              domainGroupId: newVal.domainGroupName[0].domainGroupId,
              managementInstituteId: useMetaMngInstId,
              userId: userId,
            };
          } else {
            domainGroupQuery = {
              domainGroupDictionaryId:
                newVal.domainGroupName[0].domainGroupDictionaryId,
              domainGroupId: newVal.domainGroupName[0].domainGroupId,
              managementInstituteId: useMetaMngInstId,
              userId: userId,
            };
          }

          const response = await getDomainGroupDetails(domainGroupQuery);

          // 원본 데이터 보존
          domainGroupRowData.value = response.data;

          console.log('domainGroup response : ', response);

          domainGroupData.value = {
            selectType: { id: 3, label: '자료조회', type: 'search' },
            domainGroupDictionaryId: response.data.domainGroup.dictionary.id,
            domainGroupName: [
              {
                id: 0,
                label: response.data.domainGroup.name,
                type: response.data.domainGroup.dictionary.type.name,
                color: response.data.domainGroup.dictionary.type.fontColor,
                bgColor:
                  response.data.domainGroup.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            explain: response.data.domainGroup.explain,
            updater: response.data.updater,
            updateDateTime: response.data.updateDateTime,
            jobUpdateYn: false,
          };
        }
      );

      // 연관도메인 분류 관련 데이터
      const propsRelatedClassList = ref([]);

      const relatedDomainClassState = reactive({
        view: false,
        title: '연관도메인분류 오류메세지',
        message:
          '연관도메인분류 자료가 있어 해당 작업은 실행이 불가능 합니다. <br>작업을 취소하고 연관도메인분류 삭제 처리를 먼저 수행해 주시기 바랍니다.',
        type: 'relationColumn',
      });

      const relatedDomainClassWindowView = ref(false);

      const onRelatedClass = () => {
        relatedDomainClassWindowView.value = true;
      };

      const onCloseRelatedClassWindow = () => {
        relatedDomainClassWindowView.value = false;
      };

      // 연관 도메인분류 존재 핸들러
      const handleRelatedClass = (relatedClassList) => {
        propsRelatedClassList.value = relatedClassList;

        console.log('연관도메인분류 존재');
        relatedDomainClassState.view = true;
      };

      return {
        domainGroupData,
        jobRemoveYn,
        onSelectReg,
        onSaveConfirm,
        saveConfirmState,
        resetConfirmState,
        onResetConfirm,
        useDctnryId,
        onSave,
        onReset,
        relatedDomainClassState,
        relatedDomainClassWindowView,
        onRelatedClass,
        onCloseRelatedClassWindow,
        handleRelatedClass,
        propsRelatedClassList,
        selectDomainData,
        showAnimate,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
