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
        <div>3</div>
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
  const tabList = reactive(['용어', '단어', '도메인', '통합코드']);
  const activeTab = ref(1);
</script>
