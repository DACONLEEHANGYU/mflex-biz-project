<template>
  <div class="inputs-row">
    <div class="input-top">
      <div class="title-top">
        <div class="title-s">
          <div class="title-s-left">
            도메인분류명 상세 정보
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
              :disabled="isSelectType === 'search' || isNewJob"
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
                    :class="domainClassData.selectType.type"
                  >
                    {{ domainClassData.selectType.label }}
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*도메인그룹명</th>
              <td class="manage-input-form-td" colspan="3">
                <div class="td-col">
                  <div
                    class="dictionary_up_name_div"
                    style="
                      padding-top: 6.5px;
                      line-height: 1.5;
                      background: #f5f5f5;
                    "
                  >
                    <AppStateText v-model="domainClassData.domainGroupName" />
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="required">*도메인분류명</th>
              <td class="manage-input-form-td" colspan="3">
                <div class="td-col">
                  <input
                    v-if="isSelectType == 'new'"
                    class="input-text"
                    type="text"
                    placeholder=""
                    style="width: 100%"
                    v-model="domainClassData.domainClassName[0].label"
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
                    <AppStateText v-model="domainClassData.domainClassName" />
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
                    v-model="domainClassData.explain"
                    :readonly="
                      isSelectType == 'search' || isSelectType == 'remove'
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
                    v-model="domainClassData.updater"
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
                    v-model="domainClassData.updateDateTime"
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

  <!-- 연관도메인명 존재 알림창 -->
  <AppDialog
    v-model:view="relatedDomainState.view"
    :title="relatedDomainState.title"
    :message="relatedDomainState.message"
    :type="relatedDomainState.type"
    @relationDomainList="onRelatedDomain"
  />

  <!-- 연관도메인명 조회 팝업 -->
  <AppWindow
    :view="relatedDomainWindowView"
    @close="onCloseRelatedDomainWindow"
    width="630px"
    height="auto"
  >
    <RelatedDomainWindow
      :propsRelatedDomainList="propsRelatedDomainList"
      :selectDomainClass="selectDomainData"
      @confirm="onCloseRelatedDomainWindow"
      @close="onCloseRelatedDomainWindow"
    />
  </AppWindow>
</template>

<script>
  import { reactive, ref, watch } from 'vue';
  import { useAlert } from '@/composables/alert';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import {
    getDomainClassDetails,
    createNewDomainClass, // 도메인분류 신규등록
    modifyDomainClass, // 도메인분류 변경등록
    deleteDomainClass, // 도메인분류 삭제등록
    getRelatedDomainNameList, // 연관도메인명 리스트 조회
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import RelatedDomainWindow from '@/components/popWindow/RelatedDomainWindow.vue';
  export default {
    computed: {
      isJobType() {
        if (this.domaiClassData.selectType.type === 'search') {
          return true;
        } else {
          return false;
        }
      },
      isSelectType() {
        if (this.domainClassData.selectType.type === 'search') {
          return 'search';
        }
        if (this.domainClassData.selectType.type === 'new') {
          return 'new';
        }
        if (this.domainClassData.selectType.type === 'modify') {
          return 'modify';
        }
        if (this.domainClassData.selectType.type === 'remove') {
          return 'remove';
        }
        return 'search';
      },
      isNewJob() {
        if (
          this.domainClassData.domainClassName[0].label.includes('[신규등록]')
        ) {
          return true;
        } else {
          return false;
        }
      },
      previewData() {
        if (this.domainClassData.domainClassDictionaryId != this.useDctnryId) {
          return true;
        } else {
          return false;
        }
      },
    },

    components: {
      AppTooltip,
      AppWindow,
      RelatedDomainWindow,
    },
    emits: ['domainClassSave', 'exist-related-domain'],
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId, userNm } = userInfo.value;
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useDctnryId } = userStngInfo.value;

      const showAnimate = ref(false);

      const { alertInfos, setAlertStatus } = useAlert();

      const updater = `${userNm}(${userId})`;
      const updateDateTime = new Date().toISOString().split('T')[0];

      const dictionaryMngStore = useDictionaryMngStore();
      const { domainJobData, domainTreeData } = storeToRefs(dictionaryMngStore);
      const { setIsDomainJobSave, setIsDomainJobApproval } = dictionaryMngStore;

      const regType = reactive([
        { id: 0, label: '신규등록', type: 'new' },
        { id: 1, label: '변경등록', type: 'modify' },
        { id: 2, label: '삭제등록', type: 'remove' },
        { id: 3, label: '자료조회', type: 'search' },
      ]);

      const onSelectReg = (value) => {
        domainClassData.value.selectType = regType[value];

        if (value === 0) {
          resetDomainClassData();
        } else if (value === 1) {
          resetDomainClassRowData('modify');
        } else if (value === 2) {
          resetDomainClassRowData('remove');
        }

        console.log('onSelectReg value : ', value);
      };

      const selectDomainData = reactive({});

      const domainClassRowData = ref({});
      const domainClassData = ref({
        selectType: { id: 3, label: '자료조회', type: 'search' },
        domainGroupDictionaryId: 0,
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
        domainClassDictionaryId: 0,
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
        updater: '',
        updateDateTime: '',
        jobUpdateYn: false,
      });

      // 초기화 함수
      const resetDomainClassData = () => {
        domainClassData.value.selectType.id = 0;
        domainClassData.value.selectType.label = '신규등록';
        domainClassData.value.selectType.type = 'new';
        domainClassData.value.domainClassName = [
          {
            id: 0,
            label: '',
            type: '',
            color: '',
            bgColor: '',
            size: 60,
          },
        ];
        domainClassData.value.explain = '';
        domainClassData.value.updater = updater;
        domainClassData.value.updateDateTime = updateDateTime;
      };

      const extractNonNumeric = (str) => {
        return str.replace(/^\d+/, '');
      };

      //저장
      const saveConfirmState = reactive({
        view: false,
        message: '작업 내용을 저장하시겠습니까?',
      });
      const onSaveConfirm = () => {
        if (domainClassData.value.domainClassName[0].label === '' || null) {
          alertInfos.value.view = true;
          alertInfos.value.message = '도메인분류명을 입력하세요.';
          return;
        }

        saveConfirmState.view = true;
        // domainGroupSaveState.value = true;
      };

      const onSave = async () => {
        saveConfirmState.view = false;

        const data = domainClassData.value;

        const domainClassQuery = {
          managementInstituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          domainGroupName: data.domainGroupName[0].label,
          domainGroupDictionaryId: data.domainGroupDictionaryId,
          domainClassName: data.domainClassName[0].label,
          domainClassExplain: data.explain,
        };

        // 도메인분류 신규등록
        if (data.selectType.type === 'new') {
          const response = await createNewDomainClass(domainClassQuery);

          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
            return;
          }

          emit('domainClassSave');
        }

        // 도메인분류 변경등록
        if (data.selectType.type === 'modify') {
          console.log('변경등록 실행 ');
          domainClassQuery.dictionaryId = data.domainClassDictionaryId;
          const response = await modifyDomainClass(domainClassQuery);

          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
            return;
          }
          emit('domainClassSave');
        }

        // 도메인분류 삭제등록
        if (data.selectType.type === 'remove') {
          console.log('삭제등록 실행 ');
          domainClassQuery.dictionaryId = data.domainClassDictionaryId;

          const relatedDomainList = await getRelatedDomainNameList(
            domainClassQuery.domainClassName
          );
          console.log('relatedDomainList : ', relatedDomainList);

          // propsRelatedDomainList.value = relatedDomainList.data;

          if (relatedDomainList.data.length > 0) {
            console.log('연관도메인 존재');
            emit('exist-related-domain', relatedDomainList.data);
            // relatedDomainState.view = true;
            handleRelatedDomain(relatedDomainList.data);
            return;
          } else {
            const response = await deleteDomainClass(domainClassQuery);
            if (response.status === 409) {
              setAlertStatus({
                view: true,
                message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
              });
              return;
            }
            emit('domainClassSave');
          }
        }

        // 작업완료(승인완료) 상태변경
        setIsDomainJobApproval(true);

        // 작업저장 상태변경
        setIsDomainJobSave(true);
        // emit('domainClassSave', domainClassData.value);

        // resetDomainClassData();
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
        if (domainClassData.value.selectType.type === 'new') {
          // 신규등록 일때 초기화
          resetDomainClassData();
        } else if (domainClassData.value.selectType.type === 'modify') {
          // 변경등록 일때 초기화
          resetDomainClassRowData('modify');
        }
      };

      // 도메인 분류명 원본 데이터 초기화
      const resetDomainClassRowData = (selectType) => {
        console.log('resetDomainClassRowData 실행 === ');
        domainClassData.value = {
          selectType:
            selectType === 'modify'
              ? { id: 1, label: '변경등록', type: 'modify' }
              : { id: 2, label: '삭제등록', type: 'remove' },
          domainGroupDictionaryId:
            domainClassRowData.value.domainGroup.dictionary.id,
          domainGroupName: [
            {
              id: 0,
              label: domainClassRowData.value.domainGroup.name,
              type: domainClassRowData.value.domainGroup.dictionary.type.name,
              color:
                domainClassRowData.value.domainGroup.dictionary.type.fontColor,
              bgColor:
                domainClassRowData.value.domainGroup.dictionary.type
                  .backgroundColor,
              size: 60,
            },
          ],
          domainClassDictionaryId:
            domainClassRowData.value.domainClass.dictionary.id,
          domainClassName: [
            {
              id: 0,
              label: domainClassRowData.value.domainClass.name,
              type: domainClassRowData.value.domainClass.dictionary.type.name,
              color:
                domainClassRowData.value.domainClass.dictionary.type.fontColor,
              bgColor:
                domainClassRowData.value.domainClass.dictionary.type
                  .backgroundColor,
              size: 60,
            },
          ],
          explain: domainClassRowData.value.domainClass.explain,
          updater: domainClassRowData.value.updater,
          updateDateTime: domainClassRowData.value.updateDateTime,
        };
      };

      // 연관도메인명 관련 데이터
      const propsRelatedDomainList = ref([]);

      //  삭제등록 시 연관도메인 핸들러
      const handleRelatedDomain = (relatedDomainList) => {
        propsRelatedDomainList.value = relatedDomainList;
        relatedDomainState.view = true;
      };

      const relatedDomainWindowView = ref(false);
      const relatedDomainState = reactive({
        view: false,
        title: '연관도메인 오류메세지',
        message:
          '연관도메인 자료가 있어 해당 작업은 실행이 불가능 합니다. <br>작업을 취소하고 연관도메인 삭제 처리를 먼저 수행해 주시기 바랍니다.',
        type: 'relationColumn',
      });

      const onRelatedDomain = () => {
        relatedDomainWindowView.value = true;
      };

      const onCloseRelatedDomainWindow = () => {
        relatedDomainWindowView.value = false;
      };

      // 도메인트리 데이터 상태 감시
      watch(
        () => domainTreeData.value,
        (newVal) => {
          console.log('domainTreeData.value', newVal);
          if (newVal) {
            domainClassData.value.selectType = regType[0];
            const label = extractNonNumeric(newVal.domainId);
            domainClassData.value.domainGroupDictionaryId = newVal.dictionaryId;
            domainClassData.value.domainGroupName = [
              {
                id: 0,
                label: label,
                type: newVal.type,
                color: newVal.color,
                bgColor: newVal.bgColor,
                size: 60,
              },
            ];
            resetDomainClassData();
          }
        }
      );

      // 도메인데이터 상태값 변경 감시
      watch(
        () => domainJobData.value,
        async (newVal) => {
          console.log('도메인데이터 상태값 변경 감시 - newVal', newVal);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);

          if (newVal === null) {
            resetDomainClassData();
            return;
          }

          selectDomainData.value = newVal;

          let domainClassQuery = {};

          if (newVal) {
            domainClassQuery = {
              domainClassDictionaryId:
                newVal.domainClassName[0].domainClassDictionaryId,
              domainClassId: newVal.domainClassName[0].domainClassId,
              managementInstituteId: useMetaMngInstId,
              userId: userId,
            };
          } else {
            domainClassQuery = {
              domainClassDictionaryId:
                newVal.domainClassName[0].domainClassDictionaryId,
              domainClassId: newVal.domainClassName[0].domainClassId,
              managementInstituteId: useMetaMngInstId,
              userId: userId,
            };
          }

          const response = await getDomainClassDetails(domainClassQuery);

          domainClassRowData.value = response.data;
          console.log('domainClass response : ', response);

          domainClassData.value = {
            selectType: { id: 3, label: '자료조회', type: 'search' },
            domainClassDictionaryId: response.data.domainClass.dictionary.id,
            domainClassName: [
              {
                id: 0,
                label: response.data.domainClass.name,
                type: response.data.domainClass.dictionary.type.name,
                color: response.data.domainClass.dictionary.type.fontColor,
                bgColor:
                  response.data.domainClass.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
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
            explain: response.data.domainClass.explain,
            updater: response.data.updater,
            updateDateTime: response.data.updateDateTime,
            jobUpdateYn: false,
          };
        }
      );

      return {
        domainClassData,
        onSelectReg,
        onSaveConfirm,
        saveConfirmState,
        onSave,
        onResetConfirm,
        resetConfirmState,
        onReset,
        useDctnryId,
        propsRelatedDomainList,
        handleRelatedDomain,
        relatedDomainWindowView,
        relatedDomainState,
        onRelatedDomain,
        onCloseRelatedDomainWindow,
        selectDomainData,
        showAnimate,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
