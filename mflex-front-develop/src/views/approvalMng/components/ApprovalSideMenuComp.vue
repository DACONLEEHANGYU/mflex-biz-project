<template>
  <div class="approval-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">결재함</h3>
    </div>

    <div class="sidebar-content">
      <nav class="approval-nav">
        <ul class="nav-list">
          <!-- 대시보드 (기본 선택) -->
          <li class="nav-item">
            <button
              class="nav-button"
              :class="{ active: selectedMenu === 'dashboard' }"
              @click="selectMenu('dashboard')"
            >
              결재 현황
            </button>
          </li>

          <!-- 결재중 섹션 -->
          <li class="nav-item has-submenu">
            <div class="nav-section-title">⏳ 결재중</div>
            <ul class="submenu-list">
              <li class="submenu-item">
                <button
                  class="nav-button submenu-button"
                  :class="{ active: selectedMenu === 'request-documents' }"
                  @click="selectMenu('request-documents')"
                >
                  📤 결재 요청목록
                  <span class="count-badge">{{ requestCount }}</span>
                </button>
              </li>
              <li class="submenu-item">
                <button
                  class="nav-button submenu-button"
                  :class="{ active: selectedMenu === 'pending-documents' }"
                  @click="selectMenu('pending-documents')"
                >
                  📥 결재 할 목록
                  <span class="count-badge">{{ pendingCount }}</span>
                </button>
              </li>
            </ul>
          </li>

          <!-- 완료문서 섹션 -->
          <li class="nav-item">
            <button
              class="nav-button"
              :class="{ active: selectedMenu === 'completed-documents' }"
              @click="selectMenu('completed-documents')"
            >
              ✅ 완료목록
              <span class="count-badge">{{ completeCount }}</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia';
  import { useApprovalStore } from '@/stores/approval';

  const approvalStore = useApprovalStore();

  const { requestCount, pendingCount, completeCount } =
    storeToRefs(approvalStore);

  const props = defineProps({
    selectedMenu: {
      type: String,
      default: 'dashboard',
    },
  });

  const emit = defineEmits(['menu-selected']);

  // 메뉴 선택 함수
  const selectMenu = (menuKey) => {
    emit('menu-selected', menuKey);
  };
</script>

<style lang="scss" scoped>
  .approval-sidebar {
    width: 20%; // 3:7 비율의 3
    background: #f8f9fa;
    border-right: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
  }

  .sidebar-header {
    padding: 20px;
    border-bottom: 1px solid #dee2e6;
    background: white;
  }

  .sidebar-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #495057;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .sidebar-content {
    flex: 1;
    padding: 0;
    overflow-y: auto;
  }

  .approval-nav {
    height: 100%;
  }

  .nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-item {
    border-bottom: 1px solid #e9ecef;
  }

  .nav-section-title {
    padding: 15px 20px 10px;
    font-size: 14px;
    font-weight: 600;
    color: #6c757d;
    background: #f1f3f4;
    border-bottom: 1px solid #e9ecef;
  }

  .nav-button {
    width: 100%;
    padding: 15px 20px;
    border: none;
    background: transparent;
    text-align: left;
    font-size: 14px;
    font-weight: 700;
    color: #495057;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:hover {
      background: #e9ecef;
      color: #379583;
    }

    &.active {
      background: #379583;
      color: white;
      font-weight: 600;

      .count-badge {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }
    }
  }

  .submenu-list {
    list-style: none;
    margin: 0;
    padding: 0;
    background: #f8f9fa;
  }

  .submenu-button {
    padding-left: 40px;
    font-size: 13px;
    background: #f8f9fa;

    &:hover {
      background: #e9ecef;
    }

    &.active {
      background: #379583;
      color: white;
    }
  }

  .count-badge {
    background: #6c757d;
    color: white;
    border-radius: 12px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    min-width: 20px;
    text-align: center;
  }

  .has-submenu {
    .nav-section-title {
      cursor: default;
    }
  }

  /* 반응형 대응 */
  @media (max-width: 768px) {
    .approval-sidebar {
      width: 100%;
      max-width: 300px;
    }

    .nav-button {
      padding: 12px 15px;
      font-size: 13px;
    }

    .submenu-button {
      padding-left: 30px;
    }
  }
</style>
