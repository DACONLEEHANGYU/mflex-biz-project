<template>
  <section class="row-wrap">
    <div class="bg-box">
      <AppTab :tabList="tabList" v-model="activeTab" mode="if">
        <template v-slot:tabPanel-1>
          <BottomRow1Tab1Comp />
        </template>
        <template v-slot:tabPanel-2>
          <BottomRow1Tab2Comp />
        </template>
        <template v-slot:tabPanel-3> 3 </template>
        <template v-slot:tabPanel-4>
          <div>4</div>
        </template>
        <template v-slot:tabPanel-5>
          <BottomRow1Tab5Comp />
        </template>
        <template v-slot:tabPanel-6>
          <div>6</div>
        </template>
        <template v-slot:tabPanel-7>
          <div>7</div>
        </template>
      </AppTab>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import BottomRow1Tab1Comp from '@/views/dashboard/components/dictionarySearch/bottomRow/BottomRow1Tab1Comp.vue';
import BottomRow1Tab2Comp from '@/views/dashboard/components/dictionarySearch/bottomRow/BottomRow1Tab2Comp.vue';
import BottomRow1Tab5Comp from '@/views/dashboard/components/dictionarySearch/bottomRow/BottomRow1Tab5Comp.vue';
const tabList = reactive([
  '기본정보',
  '구성단어',
  '도메인 정보',
  '유사어',
  '연관통합코드',
  '연관속성',
  '변경이력',
]);
const activeTab = ref(1);
</script>
