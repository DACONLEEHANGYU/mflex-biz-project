<template>
  <div class="pop-window">
    <div class="window-header">
      <span class="header-title">{{ titleName }}</span>
      <button class="close-btn" @click="onHeaderClose" title="닫기">×</button>
    </div>
    <div class="window-body">
      <div class="section-container">
        <div class="left-section">
          <div class="window-content pt15">
            <div class="tab-comtent__row h-450">
              <div class="tab-inner grid-tab-height">
                <div class="upload-container">
                  <div class="top-area">
                    <div class="inputs-wrap" style="width: 1000px">
                      <div class="input-form">
                        <table class="input-table">
                          <colgroup>
                            <col width="15%" />
                          </colgroup>
                          <tbody>
                            <tr>
                              <th>요청구분</th>
                              <td class="manage-input-form-td">
                                <div class="td-col">
                                  {{ approvalDetails.targetType }}
                                  <!-- <input type="text" class="input-text" /> -->
                                </div>
                              </td>
                              <th>요청건수</th>
                              <td class="manage-input-form-td">
                                <div class="td-col">
                                  {{ approvalDetails.totalTargets + `건` }}
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <th>요청자</th>
                              <td class="manage-input-form-td">
                                <div class="td-col">
                                  {{ approvalDetails.issuerName }}
                                </div>
                              </td>
                              <th>요청일시</th>
                              <td class="manage-input-form-td">
                                <div class="td-col">
                                  {{ approvalDetails.createDateTime }}
                                  <!-- <input type="text" class="input-text" /> -->
                                </div>
                              </td>
                            </tr>
                            <tr v-if="approvalType === 'request'">
                              <th>결재상태</th>
                              <td colspan="3" class="manage-input-form-td">
                                <div class="td-col">
                                  {{ approvalDetails.status }}
                                  <!-- <input type="text" class="input-text" /> -->
                                </div>
                              </td>
                            </tr>
                            <tr v-if="approvalType === 'approval'">
                              <th>결재상태</th>
                              <td colspan="3" class="manage-input-form-td">
                                <div class="td-col">
                                  {{ approvalDetails.status }}
                                  <!-- <input type="text" class="input-text" /> -->
                                </div>
                              </td>
                            </tr>
                            <tr v-if="approvalType === 'complete'">
                              <th>결재상태</th>
                              <td class="manage-input-form-td">
                                <div class="td-col">
                                  {{ approvalDetails.status }}
                                  <!-- <input type="text" class="input-text" /> -->
                                </div>
                              </td>
                              <th>완료일시</th>
                              <td class="manage-input-form-td">
                                <div class="td-col">
                                  {{ approvalDetails.updateDateTime }}
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <ApprovalLineComp
                      v-model="approvalLine"
                      :max-approvers="5"
                      :disabled="true"
                    ></ApprovalLineComp>
                  </div>
                  <div class="grid-wrap word-grid-area">
                    <div class="grid-top"></div>
                    <AppGrid
                      :rowData="rowData"
                      :columnDefs="getColumnDefs"
                      :context="context"
                      rowSelection="single"
                      @gridApi="handleSetGridApi"
                      ref="agGrid"
                    />
                    <div class="grid-bottom">
                      <div class="btn-div">
                        <!-- <button
                          id="upload-btn"
                          class="btn-m confirm btn-margin"
                          @click="onConfirm"
                          :disabled="resultState"
                        >
                          등록
                        </button>
                        <button
                          id="upload-btn"
                          class="btn-s"
                          @click="onResetConfrim"
                        >
                          초기화
                        </button> -->
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <div v-if="approvalType === 'request'">
            <button
              :disabled="approvalDetails.status === '결재중'"
              class="btn-m close"
              @click="onCancelRequest"
            >
              요청취소
            </button>
          </div>
          <div v-if="approvalType === 'approval'">
            <button
              style="background-color: #2b9966; color: white"
              class="btn-m"
              @click="onOpenApprovalCommentWindowView('approve')"
            >
              승인
              <i class="approval-icon"></i>
            </button>
            <button
              style="background-color: #d33434; color: white"
              class="btn-m close"
              @click="onOpenApprovalCommentWindowView('reject')"
            >
              반려
              <i class="reject-icon"></i>
            </button>
            <!-- <button class="btn-m close" @click="onSaveConfirm">닫기</button> -->
          </div>
          <div v-if="approvalType === 'complete'">
            <!-- <button class="btn-m close" @click="onSaveConfirm">닫기</button> -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <AppDialog
    v-model:view="saveConfirmState.view"
    :title="saveConfirmState.title"
    :message="saveConfirmState.message"
    @confirm="onClose"
    @close="onClose"
  />
  <AppDialog
    v-model:view="resetConfirmState.view"
    :title="resetConfirmState.title"
    :message="resetConfirmState.message"
    @confirm="onResetData"
    @close="onClose"
  />

  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="480px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onConfirm"
      @close="onCloseConfirmWindow"
    />
  </AppWindow>

  <AppWindow
    :view="approvalCommentWindowView"
    @close="onCloseApprovalCommentWindowView"
    width="600px"
  >
    <ApprovalCommentWindow
      :approvalType="approvalEventState"
      @confirm="onConfirm"
      @close="onCloseApprovalCommentWindowView"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { useAlert } from '@/composables/alert';
  import { ref, reactive, onMounted, computed, onBeforeMount } from 'vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import wordDivisionCellRender from '@/utils/wordDivisionCellRender.js';
  import RadioCellRenderer from '../../utils/RadioCellRenderer';
  import ButtonCellRenderer from '../../utils/ButtonCellRenderer';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
  import { getApprovalLineDetails } from '@/utils/mflexApi/approval/ApprovalApi';
  import ApprovalLineComp from '@/components/ui/ApprovalLineComp.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import ApprovalCommentWindow from '@/components/popWindow/ApprovalCommentWindow.vue';
  import { useApprovalStore } from '@/stores/approval';
  import {
    getApprovalRequestDetails,
    approveRequest,
    rejectRequest,
    cancelApprovalRequest,
  } from '@/utils/mflexApi/approval/ApprovalApi';

  export default {
    props: {
      approvalType: {
        type: String,
        default: `request`,
      },
      selectedApproval: {
        type: Object,
        default: () => ({}),
      },
    },
    components: {
      AppWindow,
      ConfirmWindow,
      ApprovalLineComp,
      AppWarningTooltip,
      RadioCellRenderer,
      StatusCellRenderer,
      ButtonCellRenderer,
      wordDivisionCellRender,
      ApprovalCommentWindow,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
      callDetailInfo(params) {
        // 필요한 로직 구현
      },
      triggerFileInput() {
        this.$refs.termFileInput.click();
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      console.log('props.approvalType : ', props.approvalType);

      const apiUrl = import.meta.env.VITE_APP_API_URL;

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const approvalStore = useApprovalStore();

      const { setIsUpdate } = approvalStore;

      const { isUpdate } = storeToRefs(approvalStore);

      const titleName = computed(() => {
        if (props.approvalType === 'request') {
          return '결재 요청 문서 상세정보';
        } else if (props.approvalType === 'approval') {
          return '결재 할 문서 상세정보';
        } else if (props.approvalType === 'complete') {
          return '완료 문서 상세정보';
        }
        return '결재 요청 문서 상세정보';
      });

      const agGrid = ref(null);
      const rightAgGrid = ref(null);
      const gridApi = ref(null);

      const { setAlertStatus } = useAlert();

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };
      const recommendedEngData = reactive({});
      const resultState = ref(false);

      const rowData = reactive({});
      rowData.value = [];

      const errorData = reactive({});
      errorData.value = [];

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '작업구분',
          field: 'jobType',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '용어영문약어명',
          field: 'termEngAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '표준여부',
          field: 'standardDivision',
          cellClass: 'grid-cell-centered',
          width: 70,
          dragStatus: false,
        },
        {
          headerName: '용어설명',
          field: 'termExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드유형',
          field: 'codeType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '개별코드',
          field: 'individualCodeName',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드',
          field: 'unityCodeName',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '비표준사유기타내용',
          field: 'nonStandardReasonContents',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '관리부서',
          field: 'manageDepartmentName',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '업무분야',
          field: 'taskFieldName',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
      ]);

      const wordColumnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '작업구분',
          field: 'jobType',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어영문약어명',
          field: 'wordAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어영문명',
          field: 'wordEnglishName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어유형',
          field: 'wordType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어설명',
          field: 'wordExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
      ]);

      const domainColumnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '작업구분',
          field: 'jobType',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '논리데이터타입',
          field: 'logicalDataTypeCode',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터길이',
          field: 'dataLength',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터소수점길이',
          field: 'dataDecimalPointLength',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인설명',
          field: 'explain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터단위',
          field: 'dataUnitName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터허용값',
          field: 'dataPermissionValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '저장형식',
          field: 'storageFormatContext',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '표현형식',
          field: 'expressionFormatContext',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
      ]);

      const completeTermColumnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '상태',
          field: 'targetStatus',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '작업구분',
          field: 'jobType',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '용어영문약어명',
          field: 'termEngAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '표준여부',
          field: 'standardDivision',
          cellClass: 'grid-cell-centered',
          width: 70,
          dragStatus: false,
        },
        {
          headerName: '용어설명',
          field: 'termExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드유형',
          field: 'codeType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '개별코드',
          field: 'individualCodeName',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드',
          field: 'unityCodeName',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '비표준사유기타내용',
          field: 'nonStandardReasonContents',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '관리부서',
          field: 'manageDepartmentName',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '업무분야',
          field: 'taskFieldName',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
      ]);

      const completeWordColumnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '상태',
          field: 'targetStatus',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '작업구분',
          field: 'jobType',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어영문약어명',
          field: 'wordAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어영문명',
          field: 'wordEnglishName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어유형',
          field: 'wordType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어설명',
          field: 'wordExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
      ]);

      const completeDomainColumnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '상태',
          field: 'targetStatus',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '작업구분',
          field: 'jobType',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '논리데이터타입',
          field: 'logicalDataTypeCode',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터길이',
          field: 'dataLength',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터소수점길이',
          field: 'dataDecimalPointLength',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인설명',
          field: 'explain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터단위',
          field: 'dataUnitName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터허용값',
          field: 'dataPermissionValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '저장형식',
          field: 'storageFormatContext',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '표현형식',
          field: 'expressionFormatContext',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
      ]);

      const uploadData = ref(null);

      const selectedFile = ref(null);

      const fileName = ref('');

      // 요청 구분 파서
      const targetTypeParser = (type) => {
        switch (type) {
          case 'TRM':
            return '용어';
          case 'WRD':
            return '단어';
          case 'DMN':
            return '도메인';
          default:
            return type;
        }
      };

      // 상태 파서
      const stateParser = (state) => {
        switch (state) {
          case 'PENDING':
            return '결재전';
          case 'IN_PROGRESS':
            return '결재중';
          case 'APPROVED':
            return '승인';
          case 'REJECTED':
            return '반려';
          case 'CANCELED':
            return '요청취소';
          case 'FAILED':
            return '실패';
          default:
            return state;
        }
      };

      const saveConfirmState = reactive({
        view: false,
        message: '작업이 취소됩니다. 정말 취소하시겠습니까?',
      });

      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };

      const resetConfirmState = reactive({
        view: false,
        message: '작업이 초기화 됩니다. 정말 초기화 하시겠습니까?',
      });

      const onResetConfrim = () => {
        resetConfirmState.view = true;
      };

      // const resetConfrimState = () => {
      //   resetConfirmState.view = false;
      // }

      const resultMessage = ref('');

      const resultCount = {
        total: 0,
        success: 0,
        fail: 0,
      };

      // 🔥 동적 컬럼 정의 계산 함수
      const getColumnDefs = computed(() => {
        console.log('컬럼 정의 계산:', {
          approvalType: props.approvalType,
          requestTargetType: requestTargetType.value,
        });

        // 🔥 complete 타입일 때는 완료용 컬럼 사용
        if (props.approvalType === 'complete') {
          switch (requestTargetType.value) {
            case 'TRM':
              return completeTermColumnDefs;
            case 'WRD':
              return completeWordColumnDefs;
            case 'DMN':
              return completeDomainColumnDefs;
            default:
              return completeTermColumnDefs;
          }
        }

        // 🔥 그 외의 경우(request, approval)는 기본 컬럼 사용
        switch (requestTargetType.value) {
          case 'TRM':
            return columnDefs;
          case 'WRD':
            return wordColumnDefs;
          case 'DMN':
            return domainColumnDefs;
          default:
            return columnDefs;
        }
      });

      // 🔥 또는 더 명확한 조건식을 원한다면 이렇게도 가능합니다
      const getColumnDefsAlternative = computed(() => {
        const isComplete = props.approvalType === 'complete';
        const targetType = requestTargetType.value;

        console.log('컬럼 정의 계산:', {
          approvalType: props.approvalType,
          requestTargetType: targetType,
          isComplete,
        });

        // 완료 타입과 일반 타입에 따른 매핑
        const columnMapping = {
          complete: {
            TRM: completeTermColumnDefs,
            WRD: completeWordColumnDefs,
            DMN: completeDomainColumnDefs,
          },
          default: {
            TRM: columnDefs,
            WRD: wordColumnDefs,
            DMN: domainColumnDefs,
          },
        };

        const selectedMapping = isComplete
          ? columnMapping.complete
          : columnMapping.default;
        return selectedMapping[targetType] || selectedMapping.TRM;
      });

      // 업로드 결과를 처리하는 헬퍼 함수
      function processUploadResult(response) {
        const successCount = response.data.filter(
          (item) => item.success
        ).length;
        const failCount = response.data.length - successCount;
        return { successCount, failCount };
      }

      const onClose = () => {
        emit('close');
      };

      const termFileInput = ref(null);

      onMounted(() => {
        console.log('WordFileUploadWindow mounted');
        console.log('onMounted termFileInput : ', termFileInput);
        console.log('onMounted agGrid : ', agGrid);
      });

      const onResetData = () => {
        console.log('초기화');

        // 데이터 초기화
        rowData.value = [];
        errorData.value = [];
        resultState.value = false;

        // 등록결과 초기화
        resultCount.total = 0;
        resultCount.success = 0;
        resultCount.fail = 0;
        // resetConfrimState.view = true;

        fileName.value = '';
      };

      const approvalLine = ref([]);

      const confirmWindowView = ref(false);

      const onCloseConfirmWindow = () => {
        console.log('onCloseConfirmWindow');
        confirmWindowView.value = false;
      };

      const popInfo = ref({
        state: 'confirm',
        popTitle: '결재승인',
        popMessages: `결재요청을 승인하시겠습니까?`,
        confirmBtnText: '승인',
        cancelBtnText: '닫기',
      });

      const onOpenApprovalPopup = () => {
        // Logic to open approval popup
        approvalEventState.value = 'approval';
        console.log('Opening approval popup');
        popInfo.value = {
          state: 'confirm',
          popTitle: '결재승인',
          popMessages: `결재요청을 승인하시겠습니까?`,
          confirmBtnText: '승인',
          cancelBtnText: '닫기',
        };
        confirmWindowView.value = true;
      };

      const onOpenRejectPopup = () => {
        approvalEventState.value = 'reject';
        // Logic to open reject popup
        console.log('Opening reject popup');
        popInfo.value = {
          state: 'confirm',
          popTitle: '결재반려',
          popMessages: `결재요청을 반려하시겠습니까?`,
          confirmBtnText: '반려',
          cancelBtnText: '닫기',
        };
        confirmWindowView.value = true;
      };

      const approvalDetails = {
        issuerName: props.selectedApproval.issuerName,
        createDateTime: props.selectedApproval.createDateTime,
        targetType: targetTypeParser(props.selectedApproval.targetType),
        status: stateParser(props.selectedApproval.status),
        totalTargets: props.selectedApproval.totalTargets,
        updateDateTime: props.selectedApproval.updateDateTime || '-',
      };

      const jobDivisionCodeParser = (jobDivisionCode) => {
        switch (jobDivisionCode) {
          case 'NEW':
            return '신규';
          case 'MODIFY':
            return '수정';
          case 'DISCARD':
            return '폐기';
          case 'RESTORE':
            return '복구';
          case 'DELETE':
            return '삭제';
          default:
            return jobDivisionCode;
        }
      };

      const fetchData = (targets) => {
        console.log('Fetching data for target: ', targets);

        const tempData = [];

        for (let i = 0; i < targets.length; i++) {
          const target = targets[i];

          if (target.targetType === 'TRM') {
            const targetDetails = targets[i].termDetails;
            console.log('Fetching data for target: ', target);
            console.log('targetDetails : ', targetDetails);

            // 🔥 codeType 처리 함수
            const getCodeTypeDisplayName = (codeTypeCode) => {
              switch (codeTypeCode) {
                case 'INDIVIDUAL_CODE':
                  return '개별코드';
                case 'UNITY_CODE':
                  return '통합코드';
                default:
                  return ''; // 그 외의 경우 공백 처리
              }
            };

            tempData.push({
              no: i + 1,
              jobType: jobDivisionCodeParser(targetDetails.jobDivisionCode),
              termName: targetDetails.termName,
              targetStatus: stateParser(target.targetStatus),
              termEngAbbreviationName: targetDetails.termAbbreviationName,
              termEnglishName: targetDetails.termEnglishName,
              domainName: targetDetails.domainName,
              standardDivision:
                targetDetails.termStandardYn === true ? '표준' : '비표준',
              termExplain: targetDetails.termExplain,
              codeType: getCodeTypeDisplayName(targetDetails.codeTypeCode),
              individualCodeName: targetDetails.individualCodeName,
              unityCodeName: targetDetails.unityCodeName,
              dataUnitName: targetDetails.dataUnitName,
              dataPermissionValue: targetDetails.dataPermissionValue,
              storageFormatContext: targetDetails.storageFormatContext,
              expressionFormatContext: targetDetails.expressionFormatContext,
              nonStandardReasonContents:
                targetDetails.nonStandardReasonContent || '',
              manageDepartmentName: targetDetails.departmentName || '',
              taskFieldName: targetDetails.taskFieldName || '',
              revisionDate: targetDetails.revisionDate || '',
            });
          } else if (target.targetType === 'WRD') {
            const wordTypeParse = () => {
              switch (targetDetails.wordTypeCode) {
                case 'GENERAL':
                  return '일반어';
                case 'CLASSIFICATION':
                  return '분류어';
                case 'SYNONYM':
                  return '이음동의어';
                default:
                  return '';
              }
            };

            const targetDetails = targets[i].wordDetails;
            tempData.push({
              no: i + 1,
              jobType: jobDivisionCodeParser(targetDetails.jobDivisionCode),
              targetStatus: stateParser(target.targetStatus),
              wordName: targetDetails.wordName,
              wordAbbreviationName: targetDetails.wordAbbreviationName,
              wordEnglishName: targetDetails.wordEnglishName,
              wordType: wordTypeParse(),
              domainClassName: targetDetails.domainClassName,
              wordExplain: targetDetails.wordExplanation,
              revisionDate: targetDetails.revisionDate,
            });
          } else if (target.targetType === 'DMN') {
            const targetDetails = targets[i].domainDetails;
            tempData.push({
              no: i + 1,
              jobType: jobDivisionCodeParser(targetDetails.jobDivisionCode),
              targetStatus: stateParser(target.targetStatus),
              domainName: targetDetails.domainName,
              domainClassName: targetDetails.domainClassName,
              logicalDataTypeCode: targetDetails.logicalDataTypeCode,
              dataLength: targetDetails.dataLength,
              dataDecimalPointLength: targetDetails.dataDecimalPointLength,
              explain: targetDetails.domainExplanation,
              dataUnitName: targetDetails.dataUnitName,
              dataPermissionValue: targetDetails.dataPermissionValue,
              storageFormatContext: targetDetails.storageFormatContext,
              expressionFormatContext: targetDetails.expressionFormatContext,
              revisionDate: targetDetails.revisionDate,
            });
          }
        }

        rowData.value = tempData;
      };

      const requestTargetType = ref(null);
      const rawApprovalDetails = ref({});

      onBeforeMount(async () => {
        console.log(
          'onBeforeMount props.selectedApproval : ',
          props.selectedApproval
        );

        const requestDetails = await getApprovalRequestDetails(
          props.selectedApproval.id
        );

        rawApprovalDetails.value = requestDetails;

        requestTargetType.value = requestDetails.targetType;
      });

      const parseApproverStatus = (status) => {
        switch (status) {
          case 'APPROVED':
            return '승인';
          case 'IN_PROGRESS':
            return '결재중';
          case 'WAITING':
            return '결재전';
          default:
            return '';
        }
      };

      onMounted(async () => {
        const ApprovalLinedetails = await getApprovalLineDetails(
          props.selectedApproval.approvalLineId
        );

        const requestDetails = await getApprovalRequestDetails(
          props.selectedApproval.id
        );

        requestTargetType.value = requestDetails.targetType;

        // 결재자 데이터 매핑
        const approvers = requestDetails.approverSteps.map(
          (approver, index) => ({
            id: approver.approverId,
            userId: approver.approverId,
            name: approver.approverName,
            department: approver.department || '',
            position: approver.position || '',
            email: approver.email || '',
            approverSeq: approver.approverSeq,
            approvalOrder: approver.approvalOrder,
            status: parseApproverStatus(approver.status),
          })
        );

        fetchData(requestDetails.targets);

        console.log('props.selectedApproval : ', props.selectedApproval);
        console.log('requestDetails : ', requestDetails);

        approvalLine.value = approvers;
      });

      const approvalEventState = ref('approval');

      const onConfirm = async (comment) => {
        if (approvalEventState.value === 'approve') {
          // Logic for approval confirmation
          console.log('Confirming approval');

          console.log('rawApprovalDetails : ', rawApprovalDetails.value);

          const stepId = rawApprovalDetails.value.approverSteps.filter(
            (step) => step.approverId === authStore.userInfo.userId
          );

          const params = {
            approvalRequestId: rawApprovalDetails.value.id,
            stepId: stepId[0].id,
            comment: comment,
          };

          console.log('Approving request with params : ', params);

          await approveRequest(params);

          emit('approve');
          setIsUpdate(true);
        } else if (approvalEventState.value === 'reject') {
          // Logic for rejection confirmation
          console.log('Confirming rejection');

          console.log('rawApprovalDetails : ', rawApprovalDetails.value);

          const stepId = rawApprovalDetails.value.approverSteps.filter(
            (step) => step.approverId === authStore.userInfo.userId
          );

          const params = {
            approvalRequestId: rawApprovalDetails.value.id,
            stepId: stepId[0].id,
            comment: comment,
          };

          console.log('Approving request with params : ', params);

          await rejectRequest(params);

          emit('approve');
          setIsUpdate(true);
        }
        confirmWindowView.value = false;
      };

      const onHeaderClose = () => {
        emit('close');
      };

      const onCancelRequest = async () => {
        await cancelApprovalRequest(props.selectedApproval.id);

        emit('cancel');
      };

      const approvalCommentWindowView = ref(false);

      const onOpenApprovalCommentWindowView = (state) => {
        approvalEventState.value = state;
        approvalCommentWindowView.value = true;
      };
      const onCloseApprovalCommentWindowView = () => {
        approvalCommentWindowView.value = false;
      };

      return {
        agGrid,
        rowData,
        columnDefs,
        recommendedEngData,
        rightAgGrid,
        gridApi,
        handleSetGridApi,
        selectedFile,
        fileName,
        onConfirm,
        onClose,
        uploadData,
        onSaveConfirm,
        onResetConfrim,
        saveConfirmState,
        apiUrl,
        resultMessage,
        resetConfirmState,
        // triggerFileInput,
        onCloseConfirmWindow,
        onOpenApprovalPopup,
        titleName,
        resultState,
        errorData,
        resultCount,
        onResetData,
        approvalLine,
        popInfo,
        onOpenRejectPopup,
        confirmWindowView,
        approvalEventState,
        approvalDetails,
        wordColumnDefs,
        domainColumnDefs,
        requestTargetType,
        onHeaderClose,
        onCancelRequest,
        approvalCommentWindowView,
        onOpenApprovalCommentWindowView,
        onCloseApprovalCommentWindowView,
        getColumnDefs,
      };
    },
  };
</script>

<style scoped>
  .section-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }
  .left-section {
    width: 100%;
    /* height: 100%; */
  }

  .word-grid-area {
    height: 535px;
    position: relative;
    border: 1px solid #ccc;
  }
  .grid-bottom {
    display: flex;
    padding: 7px;
    /* background-color: aquamarine; */
    justify-content: flex-end;
  }

  .grid-tab-height {
    height: 600px;
  }
  .upload-container {
    display: flex;
    height: 100%;
    justify-content: space-between;
    flex-direction: column;
  }
  .upload-area {
    display: flex;
    width: 100%;
    flex-direction: row;
    /* height: 100px; */
    padding: 10px 0px 10px 0px;
    border-bottom: 1px solid #ccc;
  }
  .result-area {
    width: 100%;
    /* height: calc(100% - 220px); */
    /* padding: 20px; */
  }
  .top-area {
    display: flex;
    flex-direction: row;
    /* height: 20%; */
    margin-bottom: 10px;
  }

  .file-area {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }

  .file-name-div {
    width: 250px;
    height: 30px;
    padding: 1px 5px 1px 5px;
    border: 1px solid #ccc;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    font-size: 16px;
    /* margin-right: 10px; */

    /* Text overflow handling */
    white-space: nowrap; /* Prevent the text from wrapping to a new line */
    overflow: hidden; /* Hide any overflowed text */
    text-overflow: ellipsis; /* Show ellipsis (...) when text overflows */
  }

  .btn-margin {
    margin-right: 5px;
  }
  #file-button {
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  .result-text {
    font-size: 15px;
  }

  .approval-icon {
    width: 17px;
    height: 18px;
    background-image: url(/src/assets/images/icon_approval_checkmark.png);
    background-size: cover;
    display: inline-block;
    vertical-align: middle;
    position: relative;
    top: -1px;
    margin-left: 4px;
  }

  .reject-icon {
    width: 17px;
    height: 18px;
    background-image: url(/src/assets/images/icon_reject.png);
    background-size: cover;
    display: inline-block;
    vertical-align: middle;
    position: relative;
    top: -1px;
    margin-left: 4px;
    filter: brightness(0) invert(1);
  }

  /* === 🔥 새로 추가된 헤더 스타일 === */
  .window-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-title {
    font-size: 16px;
    font-weight: 600;
    /* color: #495057; */
    flex: 1;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    /* background: #fff; */
    /* border: 1px solid #dee2e6; */
    /* border-radius: 50%; */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
    transition: all 0.2s ease;
    margin-left: 10px;
    user-select: none;
    margin-right: 10px;
  }

  .close-btn:hover {
    /* background: #dc3545; */
    /* color: white;
    border-color: #dc3545; */
    transform: scale(1.1);
    /* box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3); */
  }

  .close-btn:active {
    transform: scale(0.95);
  }
</style>
