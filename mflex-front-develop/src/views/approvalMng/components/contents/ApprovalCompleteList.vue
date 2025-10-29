<template>
  <div class="tab-inner">
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <!-- 🔥 검색 필터 박스 추가 -->
          <div class="search-filter-box">
            <div class="filter-row">
              <div class="filter-item">
                <label class="filter-label">검색유형</label>
                <select
                  v-model="searchFilters.searchType"
                  class="filter-select"
                  @change="onFilterChange"
                >
                  <option value="">모든 결재 내역</option>
                  <option value="ISSUER">내가 기안한 것만</option>
                  <option value="APPROVER">내가 결재한 것만</option>
                </select>
              </div>

              <div class="filter-item">
                <label class="filter-label">결재상태</label>
                <select
                  v-model="searchFilters.status"
                  class="filter-select"
                  @change="onFilterChange"
                >
                  <option value="">모두 검색</option>
                  <option value="APPROVED">승인</option>
                  <option value="REJECTED">반려</option>
                  <option value="CANCELED">취소</option>
                  <!-- <option value="FAILED">실패</option> -->
                </select>
              </div>

              <div class="filter-item">
                <label class="filter-label">대상유형</label>
                <select
                  v-model="searchFilters.targetType"
                  class="filter-select"
                  @change="onFilterChange"
                >
                  <option value="">모두 검색</option>
                  <option value="TRM">용어</option>
                  <option value="WRD">단어</option>
                  <option value="DMN">도메인</option>
                </select>
              </div>

              <div class="filter-item">
                <label class="filter-label">시작일</label>
                <input
                  type="date"
                  v-model="searchFilters.startDate"
                  class="filter-date"
                  @change="onDateChange"
                />
              </div>

              <div class="filter-item">
                <label class="filter-label">종료일</label>
                <input
                  type="date"
                  v-model="searchFilters.endDate"
                  class="filter-date"
                  @change="onDateChange"
                />
              </div>

              <div class="filter-actions">
                <button
                  class="btn-search"
                  @click="onSearch"
                  :disabled="isLoading"
                >
                  {{ isLoading ? '검색중...' : '검색' }}
                </button>
                <button
                  class="btn-reset"
                  @click="onResetFilters"
                  :disabled="isLoading"
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 🔥 그리드 영역에 로딩 상태 클래스 추가 -->
      <div class="grid-list" :class="{ loading: isLoading }">
        <!-- 🔥 로딩 오버레이 추가 -->
        <div v-if="isLoading" class="grid-loading-overlay">
          <!-- <div class="loading-spinner"></div> -->
          <span class="loading-text">데이터를 불러오는 중...</span>
        </div>

        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="multiple"
          :rowSelectDisabled="true"
          @rowDoubleClicked="onRowDoubleClicked"
          ref="agGrid"
        />
      </div>

      <!-- 🔥 페이징 UI 수정 -->
      <div class="grid-bottom">
        <div class="pagination-container">
          <div class="pagination-info">
            <span
              >총 {{ paginationInfo.totalElements }}건 ({{
                paginationInfo.currentPage
              }}/{{ paginationInfo.totalPages }} 페이지)</span
            >
          </div>
          <div class="pagination-controls">
            <button
              class="page-btn first"
              @click="goToFirstPage"
              :disabled="paginationInfo.currentPage === 1 || isLoading"
            >
              ⏮
            </button>
            <button
              class="page-btn prev"
              @click="goToPreviousPage"
              :disabled="paginationInfo.currentPage === 1 || isLoading"
            >
              ◀
            </button>

            <!-- 🔥 동적 페이지 번호 생성 -->
            <template v-for="page in visiblePages" :key="page">
              <button
                class="page-number"
                :class="{ active: page === paginationInfo.currentPage }"
                @click="goToPage(page)"
                :disabled="isLoading"
              >
                {{ page }}
              </button>
            </template>

            <span v-if="shouldShowDots" class="page-dots">...</span>

            <button
              v-if="shouldShowLastPage"
              class="page-number"
              :class="{
                active:
                  paginationInfo.totalPages === paginationInfo.currentPage,
              }"
              @click="goToPage(paginationInfo.totalPages)"
              :disabled="isLoading"
            >
              {{ paginationInfo.totalPages }}
            </button>

            <button
              class="page-btn next"
              @click="goToNextPage"
              :disabled="
                paginationInfo.currentPage === paginationInfo.totalPages ||
                isLoading
              "
            >
              ▶
            </button>
            <button
              class="page-btn last"
              @click="goToLastPage"
              :disabled="
                paginationInfo.currentPage === paginationInfo.totalPages ||
                isLoading
              "
            >
              ⏭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <AppWindow width="1300px" height="700px" :view="userApprovalView">
    <ApprovalDetailsWindow
      :approvalType="'complete'"
      :selectedApproval="selectApproval"
      @close="onCloseUserApproval"
    ></ApprovalDetailsWindow>
  </AppWindow>

  <AppDialog
    v-model:view="dialogState.view"
    :title="dialogState.title"
    :message="dialogState.message"
    @confirm="onDialogClose"
    @close="onDialogClose"
  />

  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="480px"
    height="auto"
  >
    <ConfirmWindow :popInfo="popInfo" @close="onCloseConfirmWindow" />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->

<script>
  // filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\approvalMng\components\contents\ApprovalCompleteList.vue
  import { reactive, ref, computed } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { storeToRefs } from 'pinia';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import { useAuthStore } from '@/stores/auth';
  import UserDetailsWindow from '@/components/popWindow/UserDetailsWindow.vue';
  import EmailSendCellRenderer from '@/utils/EmailSendCellRenderer.js';
  import ApprovalStatusCellrenderer from '@/utils/ApprovalStatusCellrenderer';
  import ActiveStatusCellrenderer from '@/utils/ActiveStatusCellrenderer';
  import UserDetailsCellrenderer from '@/utils/UserDetailsCellrenderer';
  import UserStateCellrenderer from '@/utils/UserStateCellrenderer';
  import LoginStateCellrenderer from '@/utils/LoginStateCellrenderer';
  import StopCellRenderer from '@/utils/StopCellRenderer.js';
  import LockCellRenderer from '@/utils/LockCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import UserApprovalWindow from '@/components/popWindow/UserApprovalWindow.vue';
  import CreateUserByAdminWindow from '@/components/popWindow/CreateUserByAdminWindow.vue';
  import CreateUserByInstAdminWindow from '@/components/popWindow/CreateUserByInstAdminWindow.vue';
  import UserUnlockWindow from '@/components/popWindow/UserUnlockWindow.vue';
  import ApprovalDetailsWindow from '@/components/popWindow/ApprovalDetailsWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import { getCompleteApprovalList } from '@/utils/mflexApi/approval/ApprovalApi.js';

  export default {
    components: {
      EmailSendCellRenderer,
      StopCellRenderer,
      LockCellRenderer,
      GridSearch,
      AppTooltip,
      ApprovalStatusCellrenderer,
      ActiveStatusCellrenderer,
      UserDetailsCellrenderer,
      AppWindow,
      UserDetailsWindow,
      UserStateCellrenderer,
      UserApprovalWindow,
      CreateUserByAdminWindow,
      LoginStateCellrenderer,
      UserUnlockWindow,
      CreateUserByInstAdminWindow,
      ApprovalDetailsWindow,
      ConfirmWindow,
    },

    data() {
      return {
        selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
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
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const uiStore = useUiStore();
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      const { setGridApis } = uiStore;

      const { useDctnryId, useMetaMngInstId, useInfoSysId } =
        userStngInfo.value;

      const gridId = ref('MFGRD700');
      const gridInfoDefs = ref({
        scrnGridId: gridId,
        scrnId: '',
      });

      const rowData = reactive({});
      const { getTooltipById } = useHelpToolTipStore();

      const userLockConfirmState = reactive({
        view: false,
        title: '사용자 잠금',
        message: '사용자 계정을 잠금 하시겠습니까?',
      });

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
        },
        {
          headerName: '요청구분',
          field: 'targetTypeName',
          cellClass: 'grid-cell-centered',
          width: 185,
        },
        {
          headerName: '상태',
          field: 'status',
          cellClass: 'grid-cell-centered',
          width: 140,
        },
        {
          headerName: '요청건수/완료건수',
          field: 'totalTargets',
          cellClass: 'grid-cell-centered',
          width: 180,
        },
        {
          headerName: '요청자',
          field: 'issuerName',
          cellClass: 'grid-cell-centered',
          width: 150,
        },
        {
          headerName: '요청일시',
          field: 'requestDateTime',
          cellClass: 'grid-cell-centered',
          width: 160,
        },
        {
          headerName: '완료일시',
          field: 'completionDateTime',
          cellClass: 'grid-cell-centered',
          width: 235,
        },
        {
          headerName: '상세보기',
          field: 'userDetails',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'UserDetailsCellrenderer',
          width: 155,
        },
      ]);

      // 🔥 기본 날짜 계산 함수 추가
      const getDefaultDateRange = () => {
        const today = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        // YYYY-MM-DD 형식으로 변환
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        return {
          startDate: formatDate(threeMonthsAgo),
          endDate: formatDate(today),
        };
      };

      // 🔥 기본 날짜 범위 가져오기
      const defaultDates = getDefaultDateRange();

      // 🔥 검색 필터 상태 수정 - 기본 날짜 설정
      const searchFilters = reactive({
        searchType: '',
        status: '',
        targetType: '',
        startDate: defaultDates.startDate, // 🔥 3개월 전
        endDate: defaultDates.endDate, // 🔥 오늘
        page: 0,
        size: 20,
      });

      const dialogState = ref({
        view: false,
        title: '',
        message: '',
      });

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // 🔥 로딩 상태 및 디바운스 추가
      const isLoading = ref(false);
      let filterChangeTimeout = null;

      // 🔥 페이징 정보 수정
      const paginationInfo = ref({
        currentPage: 1,
        totalPages: 1,
        totalElements: 0,
        size: 20,
      });

      // 🔥 페이지 번호 표시 로직
      const visiblePages = computed(() => {
        const current = paginationInfo.value.currentPage;
        const total = paginationInfo.value.totalPages;
        const delta = 2; // 현재 페이지 앞뒤로 보여줄 페이지 수

        if (total <= 7) {
          // 전체 페이지가 7개 이하면 모두 표시
          const pages = [];
          for (let i = 1; i <= total; i++) {
            pages.push(i);
          }
          return pages;
        }

        let start = Math.max(1, current - delta);
        let end = Math.min(total - 1, current + delta); // 마지막 페이지는 별도 표시

        // 시작 부분 조정
        if (current <= delta + 1) {
          end = Math.min(total - 1, 5);
        }

        // 끝 부분 조정
        if (current >= total - delta) {
          start = Math.max(1, total - 5);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
        return pages;
      });

      const shouldShowDots = computed(() => {
        return (
          paginationInfo.value.totalPages > 7 &&
          !visiblePages.value.includes(paginationInfo.value.totalPages - 1)
        );
      });

      const shouldShowLastPage = computed(() => {
        return (
          paginationInfo.value.totalPages > 1 &&
          !visiblePages.value.includes(paginationInfo.value.totalPages)
        );
      });

      // 상태 변환기
      const parserApprovalStatus = (status) => {
        switch (status) {
          case 'APPROVED':
            return '승인';
          case 'REJECTED':
            return '반려';
          case 'CANCELED':
            return '요청취소';
          default:
            return status;
        }
      };

      // 요청구분 변환기
      const parserTargetType = (targetType) => {
        switch (targetType) {
          case 'TRM':
            return '용어';
          case 'WRD':
            return '단어';
          case 'DMN':
            return '도메인';
          default:
            return targetType;
        }
      };

      // 🔥 API 파라미터 생성 함수
      const buildApiParams = (pageNumber = 0) => {
        const baseParams = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          page: pageNumber,
          size: searchFilters.size,
        };

        // 🔥 필터 조건이 있는 경우에만 추가 (trim으로 공백 제거)
        if (searchFilters.searchType && searchFilters.searchType.trim()) {
          baseParams.searchType = searchFilters.searchType.trim();
        }

        if (searchFilters.status && searchFilters.status.trim()) {
          baseParams.status = searchFilters.status.trim();
        }

        if (searchFilters.targetType && searchFilters.targetType.trim()) {
          baseParams.targetType = searchFilters.targetType.trim();
        }

        if (searchFilters.startDate && searchFilters.startDate.trim()) {
          baseParams.startDate = searchFilters.startDate.trim();
        }

        if (searchFilters.endDate && searchFilters.endDate.trim()) {
          baseParams.endDate = searchFilters.endDate.trim();
        }

        return baseParams;
      };

      // 🔥 데이터 조회 함수 수정
      const fetchData = async (pageNumber = 0, showLoading = true) => {
        try {
          if (showLoading) {
            isLoading.value = true;
          }

          const params = buildApiParams(pageNumber);

          console.log('🔍 API 호출 파라미터:', {
            ...params,
            filterInfo: {
              searchType: searchFilters.searchType || '없음',
              status: searchFilters.status || '없음',
              targetType: searchFilters.targetType || '없음',
              startDate: searchFilters.startDate || '없음',
              endDate: searchFilters.endDate || '없음',
            },
          });

          const completeApprovalList = await getCompleteApprovalList(params);
          console.log('📋 API 응답 결과 :', completeApprovalList);

          // 🔥 페이징 정보 업데이트
          resultCount.value.total = completeApprovalList.totalElements || 0;
          paginationInfo.value.totalElements =
            completeApprovalList.totalElements || 0;
          paginationInfo.value.totalPages =
            completeApprovalList.totalPages || 1;
          paginationInfo.value.currentPage =
            (completeApprovalList.number || 0) + 1;
          paginationInfo.value.size = completeApprovalList.size || 20;

          const sampleData = [];
          const content = completeApprovalList.content || [];

          for (let i = 0; i < content.length; i++) {
            const item = content[i];
            sampleData.push({
              no:
                (completeApprovalList.number || 0) *
                  (completeApprovalList.size || 20) +
                i +
                1,
              id: item.id,
              approvalLineId: item.approvalLineId,
              dictionaryId: item.dictionaryId,
              instituteId: item.instituteId,
              currentOrder: item.currentOrder,
              issuerName: item.issuerName,
              status: parserApprovalStatus(item.status),
              targetType: item.targetType,
              targetTypeName: parserTargetType(item.targetType),
              createDateTime: item.createDateTime,
              requestDateTime: formatDateOnly(item.createDateTime),
              totalApprovers: item.totalApprovers,
              completionDateTime: formatDateOnly(item.updateDateTime),
              updateDateTime: item.updateDateTime,
              totalTargets: item.totalTargets + `/` + item.successTargets,
            });
          }

          rowData.value = sampleData;

          console.log('✅ 데이터 조회 완료:', {
            totalElements: paginationInfo.value.totalElements,
            currentPage: paginationInfo.value.currentPage,
            totalPages: paginationInfo.value.totalPages,
            dataCount: sampleData.length,
          });
        } catch (error) {
          console.error('❌ 데이터 조회 오류:', error);

          // 오류 시 빈 데이터로 초기화
          rowData.value = [];
          paginationInfo.value = {
            currentPage: 1,
            totalPages: 1,
            totalElements: 0,
            size: 20,
          };
          resultCount.value.total = 0;

          // 사용자에게 오류 알림 (옵션)
          alert(
            '데이터를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.'
          );
        } finally {
          if (showLoading) {
            isLoading.value = false;
          }
        }
      };

      // 🔥 필터 변경 이벤트 핸들러 추가
      const onFilterChange = () => {
        console.log('🔄 필터 변경 감지');

        // 기존 타이머 클리어
        if (filterChangeTimeout) {
          clearTimeout(filterChangeTimeout);
        }

        // 디바운스 적용 (500ms 후 실행)
        filterChangeTimeout = setTimeout(() => {
          console.log('🔍 필터 변경으로 인한 자동 검색 실행');
          searchFilters.page = 0; // 첫 페이지로 리셋
          fetchData(0, true);
        }, 500);
      };

      // 🔥 날짜 변경 이벤트 핸들러 추가 (유효성 검증 포함)
      const onDateChange = () => {
        console.log('📅 날짜 변경 감지');

        // 날짜 유효성 검증
        if (searchFilters.startDate && searchFilters.endDate) {
          if (
            new Date(searchFilters.startDate) > new Date(searchFilters.endDate)
          ) {
            alert('시작일은 종료일보다 이후일 수 없습니다.');
            return;
          }
        }

        // 기존 타이머 클리어
        if (filterChangeTimeout) {
          clearTimeout(filterChangeTimeout);
        }

        // 디바운스 적용 (1초 후 실행)
        filterChangeTimeout = setTimeout(() => {
          console.log('🔍 날짜 변경으로 인한 자동 검색 실행');
          searchFilters.page = 0; // 첫 페이지로 리셋
          fetchData(0, true);
        }, 1000);
      };

      // 🔥 검색 함수 수정
      const onSearch = async () => {
        console.log('🔍 수동 검색 시작:', {
          searchType: searchFilters.searchType,
          status: searchFilters.status,
          targetType: searchFilters.targetType,
          startDate: searchFilters.startDate,
          endDate: searchFilters.endDate,
        });

        // 진행 중인 자동 검색 취소
        if (filterChangeTimeout) {
          clearTimeout(filterChangeTimeout);
          filterChangeTimeout = null;
        }

        // 🔥 날짜 유효성 검증
        if (searchFilters.startDate && searchFilters.endDate) {
          if (
            new Date(searchFilters.startDate) > new Date(searchFilters.endDate)
          ) {
            alert('시작일은 종료일보다 이후일 수 없습니다.');
            return;
          }
        }

        // 검색 시 첫 페이지로 이동
        searchFilters.page = 0;
        await fetchData(0, true);
      };

      // 🔥 필터 초기화 함수 수정 - 기본 날짜로 복원
      const onResetFilters = async () => {
        console.log('🔄 필터 초기화');

        // 진행 중인 자동 검색 취소
        if (filterChangeTimeout) {
          clearTimeout(filterChangeTimeout);
          filterChangeTimeout = null;
        }

        // 기본 날짜 범위 다시 계산 (현재 시점 기준)
        const resetDates = getDefaultDateRange();

        // 모든 필터 값 초기화
        searchFilters.searchType = '';
        searchFilters.status = '';
        searchFilters.targetType = '';
        searchFilters.startDate = resetDates.startDate; // 🔥 3개월 전으로 초기화
        searchFilters.endDate = resetDates.endDate; // 🔥 오늘로 초기화
        searchFilters.page = 0;
        searchFilters.size = 20;

        // 초기화 후 데이터 다시 조회
        await fetchData(0, true);
      };

      // 🔥 페이징 함수들 수정
      const goToFirstPage = async () => {
        if (paginationInfo.value.currentPage > 1 && !isLoading.value) {
          searchFilters.page = 0;
          await fetchData(0, false);
        }
      };

      const goToPreviousPage = async () => {
        if (paginationInfo.value.currentPage > 1 && !isLoading.value) {
          const newPage = paginationInfo.value.currentPage - 2; // 0-based
          searchFilters.page = newPage;
          await fetchData(newPage, false);
        }
      };

      const goToNextPage = async () => {
        if (
          paginationInfo.value.currentPage < paginationInfo.value.totalPages &&
          !isLoading.value
        ) {
          const newPage = paginationInfo.value.currentPage; // 0-based
          searchFilters.page = newPage;
          await fetchData(newPage, false);
        }
      };

      const goToLastPage = async () => {
        if (
          paginationInfo.value.currentPage < paginationInfo.value.totalPages &&
          !isLoading.value
        ) {
          const newPage = paginationInfo.value.totalPages - 1; // 0-based
          searchFilters.page = newPage;
          await fetchData(newPage, false);
        }
      };

      const goToPage = async (pageNumber) => {
        if (
          pageNumber >= 1 &&
          pageNumber <= paginationInfo.value.totalPages &&
          pageNumber !== paginationInfo.value.currentPage &&
          !isLoading.value
        ) {
          const newPage = pageNumber - 1; // 0-based
          searchFilters.page = newPage;
          await fetchData(newPage, false);
        }
      };

      // 🔥 Enter 키 이벤트 핸들러 추가 (옵션)
      const handleEnterSearch = (event) => {
        if (event.key === 'Enter') {
          onSearch();
        }
      };

      // 초기 데이터 로드
      fetchData();

      const agGrid = ref(null);
      const showUserDetailsPopup = ref(false);
      const selectedUserDetails = ref(null);

      const selectApproval = ref(null);
      const openUserDetailsPopup = (userData) => {
        selectApproval.value = userData;
        userApprovalView.value = true;
      };

      const closeUserDetailsPopup = () => {
        userApprovalView.value = false;
        selectedUserDetails.value = null;
      };

      const context = reactive({
        componentParent: {
          openUserDetailsPopup,
        },
      });

      const selectUserId = ref(null);
      const userApprovalView = ref(false);

      const openUserApprovalPopup = () => {
        userApprovalView.value = true;
      };

      const onCloseUserApproval = () => {
        userApprovalView.value = false;
      };

      const confirmWindowView = ref(false);

      const onCancelRequest = () => {
        confirmWindowView.value = true;
      };

      const popInfo = ref({
        state: 'confirm',
        popTitle: '결재요청 취소',
        popMessages: `결재요청을 취소하시겠습니까?`,
        confirmBtnText: '결재요청취소',
        cancelBtnText: '닫기',
      });

      const onCloseConfirmWindow = () => {
        console.log('onCloseConfirmWindow');
        confirmWindowView.value = false;
      };

      const formatDateOnly = (dateTimeString) => {
        if (!dateTimeString) return '';

        // 공백을 기준으로 split하여 날짜 부분만 반환
        return dateTimeString.split(' ')[0];
      };

      return {
        // 🔥 검색 및 페이징 관련
        searchFilters,
        isLoading,
        visiblePages,
        shouldShowDots,
        shouldShowLastPage,
        goToFirstPage,
        goToPreviousPage,
        goToNextPage,
        goToLastPage,
        goToPage,
        onSearch,
        onResetFilters,
        onFilterChange,
        onDateChange,
        handleEnterSearch,

        // 기존 반환값들
        showUserDetailsPopup,
        openUserDetailsPopup,
        closeUserDetailsPopup,
        paginationInfo,
        context,
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        selectUserId,
        fetchData,
        selectedUserDetails,
        dialogState,
        selectApproval,
        getTooltipById,
        userLockConfirmState,
        userApprovalView,
        openUserApprovalPopup,
        onCloseUserApproval,
        confirmWindowView,
        onCancelRequest,
        popInfo,
        onCloseConfirmWindow,
        gridInfoDefs,
      };
    },
  };
</script>

<style scoped>
  .tab-inner {
    width: 100%;
    padding: 0;
  }
  .title-btns__row_btween {
    justify-content: flex-end;
  }
  /* 🔥 검색 필터 박스 스타일 */
  .search-filter-box {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    padding: 15px;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .filter-row {
    display: flex;
    align-items: end;
    gap: 15px;
    flex-wrap: wrap;
  }

  .filter-item {
    display: flex;
    flex-direction: column;
    min-width: 120px;
  }

  .filter-label {
    font-size: 12px;
    font-weight: 600;
    color: #495057;
    margin-bottom: 5px;
    white-space: nowrap;
  }

  .filter-select,
  .filter-date {
    padding-left: 8px;
    padding-right: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
    background: white;
    color: #495057;
    min-height: 38px;
    transition: border-color 0.2s ease;
  }

  .filter-select:focus,
  .filter-date:focus {
    outline: none;
    border-color: #379583;
    box-shadow: 0 0 0 2px rgba(55, 149, 131, 0.2);
  }

  .filter-actions {
    display: flex;
    gap: 8px;
    align-items: end;
  }

  .btn-search {
    background: #379583;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
    height: 38px;
    min-width: 80px;
  }

  .btn-search:hover:not(:disabled) {
    background: #2c7a6b;
  }

  .btn-search:disabled {
    background: #6c757d;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-reset {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.2s ease;
    height: 38px;
  }

  .btn-reset:hover:not(:disabled) {
    background: #5a6268;
  }

  .btn-reset:disabled {
    background: #adb5bd;
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* 🔥 그리드 영역 로딩 상태 스타일 */
  .grid-list {
    position: relative;
    min-height: 400px;
    transition: all 2s ease;
  }

  .grid-list.loading {
    border: 1px solid #379583;
    border-radius: 6px;
    background: rgba(55, 149, 131, 0.05);
  }

  .grid-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 10;
    border-radius: 4px;
    border: 1px solid #379583;
  }

  /* .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #379583;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
  }

  .loading-text {
    font-size: 14px;
    color: #495057;
    font-weight: 500;
  } */

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* 🔥 페이징 스타일 */
  .grid-bottom {
    display: flex;
    justify-content: center;
    padding: 15px;
    border-top: 1px solid #dee2e6;
    background: #f8f9fa;
  }

  .pagination-container {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .pagination-info {
    font-size: 13px;
    color: #6c757d;
    font-weight: 500;
  }

  .pagination-controls {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .page-btn {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    background: white;
    color: #495057;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    border-radius: 4px;
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-btn:hover:not(:disabled) {
    background: #379583;
    color: white;
    border-color: #379583;
  }

  .page-btn:disabled {
    background: #f8f9fa;
    color: #adb5bd;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .page-number {
    padding: 8px 12px;
    border: 1px solid #dee2e6;
    background: white;
    color: #495057;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 12px;
    border-radius: 4px;
    min-width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .page-number:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #adb5bd;
  }

  .page-number:disabled {
    background: #f8f9fa;
    color: #adb5bd;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .page-number.active {
    background: #379583;
    color: white;
    border-color: #379583;
    font-weight: 600;
  }

  .page-dots {
    padding: 8px 4px;
    color: #6c757d;
    font-size: 12px;
    display: flex;
    align-items: center;
  }

  /* 반응형 디자인 */
  @media (max-width: 768px) {
    .filter-row {
      flex-direction: column;
      align-items: stretch;
    }

    .filter-item {
      min-width: 100%;
    }

    .filter-actions {
      align-self: stretch;
      justify-content: center;
      margin-top: 10px;
    }

    .pagination-container {
      flex-direction: column;
      gap: 10px;
    }

    .pagination-controls {
      justify-content: center;
    }
  }
</style>
