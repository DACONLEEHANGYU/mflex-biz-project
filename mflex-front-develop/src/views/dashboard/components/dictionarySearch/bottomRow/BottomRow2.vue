<template>
  <section class="row-wrap">
    <div class="bg-box">
      <AppTab :tabList="tabList" v-model="activeTab" mode="if">
        <template v-slot:tabPanel-1>
          <BottomRow2Tab1Comp />
        </template>
        <template v-slot:tabPanel-2> 2 </template>
        <template v-slot:tabPanel-3> 3 </template>
        <template v-slot:tabPanel-4>
          <BottomRow2Tab4Comp />
        </template>
      </AppTab>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import BottomRow2Tab1Comp from '@/views/dashboard/components/dictionarySearch/bottomRow/BottomRow2Tab1Comp.vue';
import BottomRow2Tab4Comp from '@/views/dashboard/components/dictionarySearch/bottomRow/BottomRow2Tab4Comp.vue';

const tabList = reactive(['기본정보', '유사어', '연관용어', '변경이력']);
const activeTab = ref(1);
</script>
