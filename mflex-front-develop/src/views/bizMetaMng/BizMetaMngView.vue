<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <div class="bg-box">
            <div class="tab-inner pb0">
              <div class="biz-meta-container">
                <!-- 왼쪽 사이드바 -->
                <BizMetaSideBar
                  ref="sidebarRef"
                  @term-deleted="handleTermDeleted"
                />

                <!-- 메인 패널 -->
                <div class="biz-meta-main" :class="{ 'sidebar-collapsed': !sidebarOpen }">
                  <BizMetaPanel ref="bizMetaPanelRef" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script setup>
  import { ref, provide } from 'vue';
  import BizMetaSideBar from '@/views/bizMetaMng/components/bizMetaSideBar/BizMetaSideBar.vue';
  import BizMetaPanel from '@/views/bizMetaMng/components/bizMetaFlow/BizMetaPanel.vue';

  // 🔥 사이드바 상태 (기본값: 열림)
  const sidebarOpen = ref(true);
  const sidebarRef = ref(null);

  // 🔥 사이드바 토글 함수
  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value;
  };

  // 🔥 자식 컴포넌트에서 사용할 수 있도록 provide
  provide('toggleSidebar', toggleSidebar);
  provide('sidebarOpen', sidebarOpen);

  // 🔥 BizMetaPanel ref
  const bizMetaPanelRef = ref(null);

  // 🔥 용어 삭제 이벤트 핸들러
  const handleTermDeleted = (termId) => {
    console.log('🔥 BizMetaMngView - 용어 삭제 이벤트 수신:', termId);
    if (bizMetaPanelRef.value && bizMetaPanelRef.value.removeNodesByTermId) {
      bizMetaPanelRef.value.removeNodesByTermId(termId);
    }
  };
</script>

<style scoped>
  .tab-inner {
    height: 100%;
    box-sizing: border-box;
    padding: 0;
  }

  .biz-meta-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .biz-meta-main {
    position: relative;
    width: 100%;
    height: 100%;
    margin-left: 350px;
    transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .biz-meta-main.sidebar-collapsed {
    margin-left: 0;
  }
</style>
