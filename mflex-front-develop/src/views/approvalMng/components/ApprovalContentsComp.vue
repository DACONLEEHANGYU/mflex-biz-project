<template>
  <div class="approval-contents">
    <!-- 대시보드 화면 -->
    <div v-if="selectedMenu === 'dashboard'" class="content-section">
      <div class="content-header">
        <h2 class="content-title">결재 현황</h2>
        <!-- <p class="content-subtitle">
          전체 결재 문서 현황을 확인하실 수 있습니다.
        </p> -->
      </div>

      <div class="dashboard-grid">
        <!-- 결재중 영역 -->
        <div class="processing-section">
          <div class="section-header">
            <h3 class="section-title">결재중</h3>
            <span class="section-icon">⏳</span>
          </div>

          <div class="processing-cards">
            <!-- 결재요청문서 카드 -->
            <div class="status-card request">
              <div class="card-header">
                <h4 class="card-title">결재 요청목록</h4>
                <span class="card-icon">📤</span>
              </div>
              <div class="card-content">
                <div class="total-count">{{ requestCount }}건</div>
                <div class="count-details">
                  <div class="count-item total">
                    <span class="label">전체</span>
                    <span class="value">{{ requestCount }}건</span>
                  </div>
                  <div class="count-item">
                    <span class="label">용어등록</span>
                    <span class="value">{{ requestDetailsCount.TRM }}건</span>
                  </div>
                  <div class="count-item">
                    <span class="label">단어등록</span>
                    <span class="value">{{ requestDetailsCount.WRD }}건</span>
                  </div>
                  <div class="count-item">
                    <span class="label">도메인등록</span>
                    <span class="value">{{ requestDetailsCount.DMN }}건</span>
                  </div>
                  <div class="count-item">
                    <span class="label">코드등록</span>
                    <span class="value">0건</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 결재 할 문서 카드 -->
            <div class="status-card pending">
              <div class="card-header">
                <h4 class="card-title">결재 할 목록</h4>
                <span class="card-icon">📥</span>
              </div>
              <div class="card-content">
                <div class="total-count">{{ pendingCount }}건</div>
                <div class="count-details">
                  <div class="count-item total">
                    <span class="label">전체</span>
                    <span class="value">{{ pendingCount }}건</span>
                  </div>
                  <div class="count-item">
                    <span class="label">용어등록</span>
                    <span class="value">{{ pendingDetailsCount.TRM }}건</span>
                  </div>
                  <div class="count-item">
                    <span class="label">단어등록</span>
                    <span class="value">{{ pendingDetailsCount.WRD }}건</span>
                  </div>
                  <div class="count-item">
                    <span class="label">도메인등록</span>
                    <span class="value">{{ pendingDetailsCount.DMN }}건</span>
                  </div>
                  <div class="count-item">
                    <span class="label">코드등록</span>
                    <span class="value">0건</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 완료문서 카드 -->
        <div class="status-card completed">
          <div class="card-header">
            <h3 class="card-title">완료목록</h3>
            <span class="card-icon">✅</span>
          </div>
          <div class="card-content">
            <div class="total-count">{{ completeCount }}건</div>
            <div class="count-details">
              <div class="count-item total">
                <span class="label">전체</span>
                <span class="value">{{ completeCount }}건</span>
              </div>
              <div class="count-item">
                <span class="label">용어등록</span>
                <span class="value">{{ completeDetailsCount.TRM }}건</span>
              </div>
              <div class="count-item">
                <span class="label">단어등록</span>
                <span class="value">{{ completeDetailsCount.WRD }}건</span>
              </div>
              <div class="count-item">
                <span class="label">도메인등록</span>
                <span class="value">{{ completeDetailsCount.DMN }}건</span>
              </div>
              <div class="count-item">
                <span class="label">코드등록</span>
                <span class="value">0건</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 결재 요청문서 화면 -->
    <div
      v-else-if="selectedMenu === 'request-documents'"
      class="content-section"
    >
      <div class="content-header">
        <h2 class="content-title">결재 요청목록</h2>
        <!-- <p class="content-subtitle">내가 요청한 결재 문서 목록입니다.</p> -->
      </div>
      <div class="empty-state">
        <!-- <p>결재 요청문서 목록이 여기에 표시됩니다.</p> -->
        <ApprovalRequestList></ApprovalRequestList>
      </div>
    </div>

    <!-- 결재 할 문서 화면 -->
    <div
      v-else-if="selectedMenu === 'pending-documents'"
      class="content-section"
    >
      <div class="content-header">
        <h2 class="content-title">결재 할 목록</h2>
        <!-- <p class="content-subtitle">내가 결재해야 할 문서 목록입니다.</p> -->
      </div>
      <div class="empty-state">
        <ApprovalWaitList></ApprovalWaitList>
        <!-- <p>결재 할 문서 목록이 여기에 표시됩니다.</p> -->
      </div>
    </div>

    <!-- 완료문서 화면 -->
    <div
      v-else-if="selectedMenu === 'completed-documents'"
      class="content-section"
    >
      <div class="content-header">
        <h2 class="content-title">완료목록</h2>
        <!-- <p class="content-subtitle">결재가 완료된 문서 목록입니다.</p> -->
      </div>
      <div class="empty-state">
        <ApprovalCompleteList></ApprovalCompleteList>
        <!-- <p>완료문서 목록이 여기에 표시됩니다.</p> -->
      </div>
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia';
  import ApprovalWaitList from '@/views/approvalMng/components/contents/ApprovalWaitList.vue';
  import ApprovalRequestList from '@/views/approvalMng/components/contents/ApprovalRequestList.vue';
  import ApprovalCompleteList from '@/views/approvalMng/components/contents/ApprovalCompleteList.vue';
  import { useApprovalStore } from '@/stores/approval';

  const approvalStore = useApprovalStore();

  const {
    requestCount,
    pendingCount,
    requestDetailsCount,
    pendingDetailsCount,
    completeCount,
    completeDetailsCount,
  } = storeToRefs(approvalStore);

  const props = defineProps({
    selectedMenu: {
      type: String,
      default: 'dashboard',
    },
  });
</script>

<style lang="scss" scoped>
  .approval-contents {
    width: 80%; // 3:7 비율의 7
    background: white;
    display: flex;
    flex-direction: column;
  }

  .content-section {
    padding: 30px;
    flex: 1;
    overflow-y: auto;
    background: #f8f9fa;
  }

  .content-header {
    // margin-bottom: 30px;
    border-bottom: 2px solid #379583;
    padding-bottom: 20px;
  }

  .content-title {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #212529;
  }

  .content-subtitle {
    margin: 0;
    font-size: 14px;
    color: #6c757d;
  }

  /* 대시보드 스타일 */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-top: 20px;
    margin-bottom: 40px;
    height: 80%;
  }

  /* 결재중 섹션 */
  .processing-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    // border-left: 4px solid #ffc107;
    // transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      // transform: translateY(-2px);
      // box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e9ecef;
  }

  .section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #495057;
  }

  .section-icon {
    font-size: 28px;
  }

  .processing-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    height: 90%;
  }

  .status-card {
    // background: #f8f9fa;
    border-radius: 6px;
    padding: 16px;
    border: 1px solid #e9ecef;
    transition: all 0.2s ease;

    &:hover {
      // transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: white;
    }

    &.request {
      // border-left: 3px solid #17a2b8;
    }

    &.pending {
      // border-left: 3px solid #fd7e14;
    }

    &.completed {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #28a745;
      border: none;

      &:hover {
        // transform: translateY(-2px);
        // box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .card-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #495057;
  }

  .status-card.completed .card-title {
    font-size: 16px;
  }

  .card-icon {
    font-size: 18px;
  }

  .status-card.completed .card-icon {
    font-size: 24px;
  }

  .card-content {
    .total-count {
      font-size: 24px;
      font-weight: 700;
      color: #212529;
      margin-bottom: 12px;
    }
  }

  .status-card.completed .card-content .total-count {
    font-size: 32px;
    margin-bottom: 16px;
  }

  .count-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .status-card.completed .count-details {
    gap: 6px;
  }

  .count-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
    cursor: pointer;

    &:hover {
      background: #e9ecef;
      transform: translateX(2px);
    }

    &.total {
      background: #e7f3ff;
      border: 1px solid #b3d9ff;
      font-weight: 600;

      &:hover {
        background: #d4edff;
      }

      .label {
        color: #0056b3;
        font-weight: 600;
      }

      .value {
        color: #0056b3;
        font-weight: 700;
        background: rgba(0, 86, 179, 0.1);
      }
    }

    .label {
      font-size: 16px;
      color: #495057;
      font-weight: 500;
    }

    .value {
      font-size: 12px;
      font-weight: 600;
      color: #379583;
      background: rgba(55, 149, 131, 0.1);
      padding: 2px 6px;
      border-radius: 8px;
      min-width: 30px;
      text-align: center;
    }
  }

  .status-card.completed .count-item {
    padding: 10px 12px;

    &:hover {
      transform: translateX(4px);
    }

    .label {
      font-size: 16px;
    }

    .value {
      font-size: 14px;
      padding: 4px 8px;
      border-radius: 12px;
      min-width: 40px;
    }
  }

  /* 빈 상태 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 92%;
    text-align: center;
    color: #6c757d;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    p {
      margin: 0;
      font-size: 16px;
    }
  }

  /* 반응형 대응 */
  @media (max-width: 1200px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .processing-cards {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .approval-contents {
      width: 100%;
    }

    .content-section {
      padding: 20px;
    }

    .dashboard-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .processing-cards {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .status-card {
      padding: 12px;
    }

    .processing-section {
      padding: 16px;
    }

    .count-item {
      padding: 6px 8px;

      .label {
        font-size: 11px;
      }

      .value {
        font-size: 11px;
        padding: 2px 4px;
      }
    }
  }

  @media (max-width: 480px) {
    .content-section {
      padding: 16px;
    }

    .content-title {
      font-size: 20px;
    }

    .section-title {
      font-size: 16px;
    }

    .card-content .total-count {
      font-size: 20px;
    }

    .status-card.completed .card-content .total-count {
      font-size: 28px;
    }
  }
</style>
