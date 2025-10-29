<template>
  <DomainActualizingComp />
</template>

<script setup>
  // store
  import { storeToRefs } from 'pinia';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  // components
  import DomainActualizingComp from '@/views/actualizing/components/domainActualizing/bottom/manage/DomainActualizingComp.vue';

  const dictionaryMngStore = useDictionaryMngStore();
  const { isDomainJobType } = storeToRefs(dictionaryMngStore);
</script>
