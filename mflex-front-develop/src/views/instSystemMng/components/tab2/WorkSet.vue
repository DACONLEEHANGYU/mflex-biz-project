<template>
  <div class="tab-inner pb0">
    <DragCol width="100%" height="100%" :leftPercent="28.5" :sliderWidth="10">
      <template #left>
        <!-- DB 연결정보 목록 -->
        <SystemGrIdListComp />
      </template>
      <template #right>
        <div class="full-contents pl10 details-wrap">
          <!-- DB 상세정보 -->
          <div class="db-connection-details">
            <SystemDetailsComp />
          </div>
        </div>
      </template>
    </DragCol>
  </div>
</template>
<!-- eslint-disable vue/no-unused-components -->
<script setup>
  import { DragCol } from 'vue-resizer';
  import SystemListComp from '@/views/instSystemMng/components/tab2/SystemListComp.vue';
  import SystemGrIdListComp from '@/views/instSystemMng/components/tab2/SystemGrIdListComp.vue';
  import SystemDetailsComp from '@/views/instSystemMng/components/tab2/SystemDetailsComp.vue';
</script>
