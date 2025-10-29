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
  import TopComp from '@/views/dataMng/components/schemaSearch/tab3/top/TopComp.vue';
  import BottomComp from '@/views/dataMng/components/schemaSearch/tab3/bottom/BottomComp.vue';
  import AppLinkDrop from '@/components/ui/AppLinkDrop.vue';

  // const onSelectMenu = (id) => {
  //   if (id === 0) {
  //     alert('그리드 목록 내려받기 실행');
  //   } else {
  //     alert('DB 전체 목록 내려받기');
  //   }
  // };
</script>
