<template>
  <div class="tab-inner pb0">
    <DragCol width="100%" height="100%" :leftPercent="28.5" :sliderWidth="10">
      <template #left>
        <!-- DB 연결정보 목록 -->
        <OrganizationListComp />
      </template>
      <template #right>
        <div class="full-contents pl10 details-wrap">
          <!-- DB 상세정보 -->
          <div class="db-connection-details">
            <OrganizationDetailsComp />
          </div>
        </div>
      </template>
    </DragCol>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script setup>
  import { DragCol } from 'vue-resizer';
  import OrganizationListComp from '@/views/instSystemMng/components/tab6/OrganizationListComp.vue';
  import OrganizationDetailsComp from '@/views/instSystemMng/components/tab6/OrganizationDetailsComp.vue';
</script>
