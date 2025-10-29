<template>
  <div class="tab-inner pb0">
    <DragCol width="100%" height="100%" :leftPercent="28.5" :sliderWidth="10">
      <template #left>
        <!-- DB 연결정보 목록 -->
        <DatabaseListComp />
      </template>
      <template #right>
        <div class="full-contents pl10 details-wrap">
          <!-- DB 상세정보 -->
          <div class="db-connection-details">
            <DatabaseDetailsComp />
          </div>
        </div>
      </template>
    </DragCol>
  </div>
</template>
<script setup>
  import { DragCol } from 'vue-resizer';

  import DatabaseListComp from '@/views/instSystemMng/components/tab3/DatabaseListComp.vue';
  import DatabaseDetailsComp from '@/views/instSystemMng/components/tab3/DatabaseDetailsComp.vue';
</script>
