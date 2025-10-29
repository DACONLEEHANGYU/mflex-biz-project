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
              class="btn-s change-reg"
              @click="onSelectReg"
              :disabled="domainClassData.jobDivisionCode === 'DELETE'"
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
    @confirm="onDomainClassJobSave"
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
  import { reactive, ref, watch } from 'vue';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { getUpdateDomainClass } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
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
        if (this.domainClassData.selectType.type.includes('job')) {
          if (this.domainClassData.selectType.type === 'job-remove') {
            return 'job-remove';
          }
          return 'job';
        }
        return 'search';
      },
    },
    components: {
      AppTooltip,
    },
    emits: ['domainClassJobSave'],
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId, userNm } = userInfo.value;
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const dictionaryMngStore = useDictionaryMngStore();
      const { setIsDomainJobApproval, setIsDomainJobSave } = dictionaryMngStore;
      const { isDomainJobSave, domainJobData } =
        storeToRefs(dictionaryMngStore);

      const showAnimate = ref(false);

      const jobRemoveYn = ref(false);

      const onSelectReg = () => {
        console.log('domainClassData.value ', domainClassData.value);

        if (domainClassData.value.jobDivisionCode === 'NEW') {
          domainClassData.value.selectType = {
            id: 0,
            label: '신규등록',
            type: 'job-new',
          };
          return;
        } else if (domainClassData.value.jobDivisionCode === 'MODIFY') {
          domainClassData.value.selectType = {
            id: 1,
            label: '변경등록',
            type: 'job-modify',
          };
          return;
        } else {
          domainClassData.value.selectType = {
            id: 2,
            label: '삭제등록',
            type: 'job-remove',
          };
        }
        console.log('작업수정');
      };

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

      watch(
        () => domainJobData.value,
        async (newVal) => {
          console.log('newVal', newVal);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);

          if (newVal.jobDivisionCode) {
            console.log('도메인분류명 작업 항목 선택');

            if (newVal.jobDivisionCode === 'DELETE') {
              jobRemoveYn.value = true;
            } else {
              jobRemoveYn.value = false;
            }

            domainClassData.value = {
              selectType: { id: 3, label: '자료조회', type: 'search' },
              jobDivisionCode: newVal.jobDivisionCode,
              jobDivisionName: newVal.jobDivisionName,
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
              domainGroupDictionaryId: newVal.domainGroup.dictionary.id,
              domainGroupName: [
                {
                  id: 0,
                  label: newVal.domainGroup.name,
                  type: newVal.domainGroup.dictionary.type.name,
                  color: newVal.domainGroup.dictionary.type.fontColor,
                  bgColor: newVal.domainGroup.dictionary.type.backgroundColor,
                  size: 60,
                },
              ],
              explain: newVal.domainClass.explain,
              updater: newVal.updater,
              updateDateTime: newVal.updateDateTime,
              jobUpdateYn: true,
            };
            domainClassRowData.value = newVal;
            return;
          }
        }
      );

      const onDomainClassJobSave = async () => {
        console.log('domainClassData.value : ', domainClassData.value);

        const domainClassQuery = {
          managementInstituteId: useMetaMngInstId,
          domainClassDictionaryId:
            domainClassData.value.domainClassDictionaryId,
          domainClassName: domainClassData.value.domainClassName[0].label,
          domainClassExplain: domainClassData.value.explain,
        };
        await getUpdateDomainClass(domainClassQuery);

        setIsDomainJobSave(true);
        setIsDomainJobApproval(true);

        emit('domainClassJobSave', domainClassData.value);
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

        if (domainClassData.value.selectType.type === 'job-new') {
          console.log('작업 - 신규등록 초기화');
          resetDomainClassJobData(0);
        } else if (domainClassData.value.selectType.type === 'job-modify') {
          console.log('작업 - 변경등록 초기화');
          resetDomainClassJobData();
        }
      };

      const resetDomainClassJobData = (type) => {
        console.log('domainClassRowData.value', domainClassRowData.value);

        domainClassData.value = {
          selectType:
            type === 0
              ? { id: 0, label: '신규등록', type: 'job-new' }
              : { id: 1, label: '변경등록', type: 'job-modify' },
          jobDivisionCode: domainClassRowData.value.jobDivisionCode,
          jobDivisionName: domainClassRowData.value.jobDivisionName,
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
          explain: domainClassRowData.value.domainClass.explain,
          updater: domainClassRowData.value.updater,
          updateDateTime: domainClassRowData.value.updateDateTime,
          jobUpdateYn: true,
        };
      };

      watch(
        () => domainJobData.value,
        (newVal) => {}
      );

      return {
        domainClassData,
        onSelectReg,
        onDomainClassJobSave,
        onSaveConfirm,
        saveConfirmState,
        jobRemoveYn,
        resetConfirmState,
        onResetConfirm,
        onReset,
        showAnimate,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
