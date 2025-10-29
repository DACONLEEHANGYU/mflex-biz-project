<template>
  <div class="inner-tab top-btns">
    <!-- <AppLinkDrop @selectMenu="onSelectMenu">용어목록 내려받기</AppLinkDrop> -->
  </div>
  <DragRow width="100%" height="100%" :topPercent="52" :sliderWidth="10">
    <template #top>
      <TopComp />
    </template>
    <template #bottom>
      <BottomComp />
    </template>
  </DragRow>
</template>

<script setup>
  import { DragRow } from 'vue-resizer';
  import TopComp from '@/views/dataMng/components/schemaSearch/tab1/top/TopComp.vue';
  import BottomComp from '@/views/dataMng/components/schemaSearch/tab1/bottom/BottomComp.vue';
</script>
