<template>
  <div class="bg-box">
    <AppTab :tabList="tabList" v-model="activeTab" mode="if">
      <template v-slot:tabPanel-1>
        <Tab1View />
      </template>
      <template v-slot:tabPanel-2>
        <Tab2View />
      </template>
      <template v-slot:tabPanel-3>
        <Tab3View />
      </template>
      <template v-slot:tabPanel-4>
        <div>4</div>
      </template>
    </AppTab>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import Tab1View from './Tab1View.vue';
import Tab2View from './Tab2View.vue';
import Tab3View from './Tab3View.vue';
const tabList = reactive(['기본정보', '유사어 목록', '연관용어', '변경이력']);
const activeTab = ref(1);
</script>
