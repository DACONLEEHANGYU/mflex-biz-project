<template>
  <div class="tab-inner pb0">
    <DragCol width="100%" height="100%" :leftPercent="25" :sliderWidth="10">
      <template #left>
        <!-- 결재선 목록 -->
        <ApprovalListComp />
      </template>
      <template #right>
        <div class="full-contents pl10 details-wrap">
          <!-- 결재선 상세정보 -->
          <div class="db-connection-details">
            <ApprovalDetailsComp />
          </div>
        </div>
      </template>
    </DragCol>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script setup>
  import { DragCol } from 'vue-resizer';
  import ApprovalListComp from '@/views/instSystemMng/components/approvalMng/ApprovalListComp.vue';
  import ApprovalDetailsComp from '@/views/instSystemMng/components/approvalMng/ApprovalDetailsComp.vue';
</script>
