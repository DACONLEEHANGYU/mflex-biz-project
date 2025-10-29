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
              class="btn-s change-reg"
              @click="onSelectReg"
              :disabled="domainGroupData.jobDivisionCode === 'DELETE'"
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
    @confirm="onDomainGroupJobSave"
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
  import { reactive, ref, watch, watchEffect } from 'vue';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import {
    getDomainGroupDetails,
    getUpdateDomainGroup,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';

  export default {
    computed: {
      isJobType() {
        if (this.domainGroupData.selectType.type === 'search') {
          return true;
        } else {
          return false;
        }
      },
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
        if (this.domainGroupData.selectType.type.includes('job')) {
          if (this.domainGroupData.selectType.type === 'job-remove') {
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
    emits: ['domainGroupJobSave'],
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId, userNm } = userInfo.value;
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const showAnimate = ref(false);

      const dictionaryMngStore = useDictionaryMngStore();
      const { setIsDomainJobApproval, setIsDomainJobSave } = dictionaryMngStore;
      const { isDomainJobSave, domainJobData } =
        storeToRefs(dictionaryMngStore);

      const onSelectReg = () => {
        console.log('domainGroupData.value ', domainGroupData.value);

        if (domainGroupData.value.jobDivisionCode === 'NEW') {
          domainGroupData.value.selectType = {
            id: 0,
            label: '신규등록',
            type: 'job-new',
          };
          return;
        } else if (domainGroupData.value.jobDivisionCode === 'MODIFY') {
          domainGroupData.value.selectType = {
            id: 1,
            label: '변경등록',
            type: 'job-modify',
          };
          return;
        } else {
          domainGroupData.value.selectType = {
            id: 2,
            label: '삭제등록',
            type: 'job-remove',
          };
        }
        console.log('작업수정');
      };
      const domainGroupData = ref({
        selectType: { id: 0, label: '자료조회', type: 'search' },
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
        updater: '',
        updateDateTime: '',
        jobUpdateYn: false,
      });

      const domainGroupRowData = ref({});

      const jobRemoveYn = ref(false);

      const onDomainGroupJobSave = async () => {
        console.log('domainGroupData.value : ', domainGroupData.value);

        const domainGroupQuery = {
          managementInstituteId: useMetaMngInstId,
          domainGroupDictionaryId:
            domainGroupData.value.domainGroupDictionaryId,
          domainGroupName: domainGroupData.value.domainGroupName[0].label,
          domainGroupExplain: domainGroupData.value.explain,
        };

        // 도메인그룹 작업수정 실행
        await getUpdateDomainGroup(domainGroupQuery);
        console.log('도메인그룹 작업수정 실행');

        setIsDomainJobSave(true);
        setIsDomainJobApproval(true);

        emit('domainGroupJobSave', domainGroupData.value);
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

        if (domainGroupData.value.selectType.type === 'job-new') {
          // 신규등록 일때 초기화
          resetDomainGroupJobData(0);
        } else if (domainGroupData.value.selectType.type === 'job-modify') {
          // 변경등록 일때 초기화

          resetDomainGroupJobData(1);
        }
      };

      const resetDomainGroupJobData = (type) => {
        domainGroupData.value = {
          selectType:
            type === 0
              ? { id: 0, label: '신규등록', type: 'job-new' }
              : { id: 1, label: '변경등록', type: 'job-modify' },
          domainGroupDictionaryId:
            domainGroupRowData.value.domainGroup.dictionary.id,
          domainGroupName: [
            {
              id: 0,
              label: domainGroupRowData.value.domainGroup.name,
              type: domainGroupRowData.value.domainGroup.dictionary.type.name,
              color:
                domainGroupRowData.value.domainGroup.dictionary.type.fontColor,
              bgColor:
                domainGroupRowData.value.domainGroup.dictionary.type
                  .backgroundColor,
              size: 60,
            },
          ],
          explain: domainGroupRowData.value.domainGroup.explain,
          updater: domainGroupRowData.value.updater,
          updateDateTime: domainGroupRowData.value.updateDateTime,
          jobDivisionCode: domainGroupRowData.value.jobDivisionCode,
          jobDivisionName: domainGroupRowData.value.jobDivisionName,
        };
      };

      // 데이터 변경 상태 감지
      watch(
        () => domainJobData.value,
        async (newVal) => {
          console.log('newVal', newVal);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);

          let domainGroupQuery = {};

          if (newVal.jobDivisionCode) {
            console.log('작업데이터');

            if (newVal.jobRemoveYn) {
              jobRemoveYn.value = newVal.jobRemoveYn;
            }

            domainGroupData.value = {
              selectType: { id: 3, label: '자료조회', type: 'search' },
              jobDivisionCode: newVal.jobDivisionCode,
              jobDivisionName: newVal.jobDivisionName,
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
              explain: newVal.domainGroup.explain,
              updater: newVal.updater,
              updateDateTime: newVal.updateDateTime,
              jobUpdateYn: true,
            };

            domainGroupRowData.value = newVal;

            return;
          }
        }
      );

      return {
        domainGroupData,
        jobRemoveYn,
        onSelectReg,
        onDomainGroupJobSave,
        onSaveConfirm,
        saveConfirmState,
        resetConfirmState,
        onResetConfirm,
        onReset,
        showAnimate,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
