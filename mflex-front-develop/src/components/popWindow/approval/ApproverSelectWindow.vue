<template>
  <div class="pop-window">
    <div class="window-header">결재자 선택</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <!-- <div class="grid-top">
              <div class="top-row">
                <div class="search-wrap">
                  <input
                    type="text"
                    class="input-text"
                    placeholder="이름 또는 부서명으로 검색"
                    v-model="searchKeyword"
                    @input="onSearch"
                  />
                </div>
              </div>
            </div> -->
            <div class="grid-list grid-radius">
              <AppGrid
                :rowData="rowData"
                :columnDefs="columnDefs"
                :context="context"
                rowSelection="single"
                @rowDoubleClicked="onRowDoubleClicked"
                @rowClicked="onRowClicked"
                ref="agGrid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">선택</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref, computed, onBeforeMount } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { getGridInfoFromStorage } from '@/utils/cookies';
  import { getInstUserList } from '@/utils/mflexApi/userManagementApi.js';

  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  import TypeCellRenderer from '@/utils/TypeCellRenderer';

  export default {
    props: {
      excludeUserIds: {
        type: Array,
        default: () => [],
      },
      maxSelection: {
        type: Number,
        default: 5,
      },
    },
    components: { RadioCellRenderer, TypeCellRenderer },

    data() {
      return {
        context: null,
        selectedRow: {},
        searchKeyword: '',
        allApprovers: [], // API에서 받은 전체 사용자 목록
        isLoading: false,
      };
    },

    computed: {
      // 검색 키워드로 필터링
      filteredApprovers() {
        if (!this.searchKeyword) {
          return this.allApprovers;
        }

        const keyword = this.searchKeyword.toLowerCase();
        return this.allApprovers.filter(
          (approver) =>
            (approver.userName &&
              approver.userName.toLowerCase().includes(keyword)) ||
            (approver.departmentName &&
              approver.departmentName.toLowerCase().includes(keyword))
        );
      },

      // 이미 추가된 결재자 제외
      availableApprovers() {
        return this.filteredApprovers.filter(
          (approver) => !this.excludeUserIds.includes(approver.userId)
        );
      },
    },

    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
        this.onConfirm();
      },

      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
      },

      onSearch() {
        this.updateGridData();
      },

      // 그리드 데이터 업데이트 (필터링 적용)
      updateGridData() {
        const gridData = this.availableApprovers.map((approver, index) => ({
          id: index + 1,
          userId: approver.userId,
          userName: approver.userName,
          position: approver.positionName || '',
          department: approver.departmentName || '',
          email: approver.email || '',
        }));

        this.rowData.value = gridData;

        console.log('Updated grid data:', gridData);
        console.log('Excluded user IDs:', this.excludeUserIds);
      },

      // API에서 사용자 목록 로드
      async loadUserList() {
        try {
          this.isLoading = true;
          const authStore = useAuthStore();
          const { userStngInfo } = storeToRefs(authStore);
          const { useMetaMngInstId } = userStngInfo.value;

          console.log('Loading user list for instId:', useMetaMngInstId);

          const instUserList = await getInstUserList(useMetaMngInstId);
          console.log('Fetched Inst User List:', instUserList);

          // API에서 받은 데이터를 allApprovers에 저장
          this.allApprovers = instUserList || [];

          // 그리드 데이터 업데이트 (제외 목록 적용)
          this.updateGridData();
        } catch (error) {
          console.error('사용자 목록 로드 실패:', error);
          alert('사용자 목록을 불러오는 중 오류가 발생했습니다.');
          this.allApprovers = [];
        } finally {
          this.isLoading = false;
        }
      },

      async onConfirm() {
        if (!this.selectedRow || !this.selectedRow.userId) {
          alert('결재자를 선택해주세요.');
          return;
        }

        console.log('onConfirm - selectedRow : ', this.selectedRow);

        // 선택된 결재자 정보를 부모 컴포넌트로 전달
        this.$emit('confirm', {
          id: this.selectedRow.userId, // API의 userId를 id로 사용
          name: this.selectedRow.userName,
          department: this.selectedRow.department,
          position: this.selectedRow.position,
          email: this.selectedRow.email,
          // 추가 필드들
          userId: this.selectedRow.userId,
          empNo: this.selectedRow.userId, // 사번이 필요한 경우
        });

        this.$emit('close');
      },
    },

    watch: {
      // excludeUserIds가 변경될 때마다 그리드 데이터 업데이트
      excludeUserIds: {
        handler() {
          console.log('excludeUserIds changed:', this.excludeUserIds);
          this.updateGridData();
        },
        deep: true,
      },
    },

    beforeMount() {
      this.context = { componentParent: this };
    },

    async mounted() {
      // 컴포넌트 마운트 시 실제 API 데이터 로드
      await this.loadUserList();
    },

    setup(props, { emit }) {
      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

      const initializeGridColumnDefs = () => {
        const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
        if (storedColumnDefs && storedColumnDefs.MFGRD037) {
          uiStore.setGridColumnDefs('MFGRD037', storedColumnDefs.MFGRD037);
        }
      };

      // 그리드 데이터 초기화 함수 (이제 mounted에서 API 호출)
      const initializeGridData = async () => {
        // 초기 빈 배열로 설정 (실제 데이터는 mounted에서 로드)
        rowData.value = [];
      };

      initializeGridColumnDefs();

      const rowData = reactive({ value: [] });

      const storedMfgrd037ColumnDefs = ref([]);
      storedMfgrd037ColumnDefs.value = gridColumnDefs.value.MFGRD037;

      const columnDefs = reactive([
        {
          headerName: '이름',
          field: 'userName',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 185,
        },
        {
          headerName: '부서',
          field: 'department',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 185,
        },
        // {
        //   headerName: '직급',
        //   field: 'position',
        //   cellClass: 'grid-cell-centered',
        //   dragStatus: false,
        //   width: 100,
        // },
        // {
        //   headerName: 'ID',
        //   field: 'userId',
        //   cellClass: 'grid-cell-centered',
        //   dragStatus: false,
        //   width: 100,
        // },
      ]);

      const resultCount = ref({
        count: 0,
        total: 0,
      });

      const agGrid = ref(null);

      const onClose = () => {
        emit('close');
      };

      // 컴포넌트 마운트 시 초기화
      onBeforeMount(() => {
        initializeGridData();
      });

      return {
        agGrid,
        rowData,
        columnDefs,
        storedMfgrd037ColumnDefs,
        resultCount,
        onClose,
      };
    },
  };
</script>

<style scoped>
  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }

  .search-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .search-wrap .input-text {
    width: 250px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
  }

  .search-wrap .input-text:focus {
    outline: none;
    border-color: #379583;
  }

  .grid-wrap {
    height: 100%;
  }

  .grid-list {
    height: calc(100% - 80px); /* 검색 영역 고려한 높이 조정 */
  }

  .top-row {
    padding: 10px 15px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    height: 50px;
    display: flex;
    align-items: center;
  }

  /* 로딩 상태 스타일 */
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #666;
    font-size: 14px;
  }

  /* 빈 상태 스타일 */
  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: #999;
    font-size: 14px;
  }
</style>
