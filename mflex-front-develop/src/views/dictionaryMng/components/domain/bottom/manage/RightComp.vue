<template>
  <!-- <DomainGroupComp v-if="domainJobType === 'group'" />
  <DomainClassComp v-else-if="domainJobType === 'class'" /> -->
  <DomainNameComp />
  <!-- <JobDomainGroupUpdateComp v-if="domainJobType === 'job-group'" />
  <JobDomainClassUpdateComp v-if="domainJobType === 'job-class'" />
  <JobDomainNameUpdateComp v-if="domainJobType === 'job-name'" /> -->
</template>

<script setup>
  import { ref, watch } from 'vue';

  // store
  import { storeToRefs } from 'pinia';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';

  // components
  import DomainGroupComp from '@/views/dictionaryMng/components/domain/bottom/manage/DomainGroupComp.vue';
  import DomainClassComp from '@/views/dictionaryMng/components/domain/bottom/manage/DomainClassComp.vue';
  import DomainNameComp from '@/views/dictionaryMng/components/domain/bottom/manage/DomainNameComp.vue';
  import JobDomainGroupUpdateComp from '@/views/dictionaryMng/components/domain/bottom/manage/JobDomainGroupUpdateComp.vue';
  import JobDomainClassUpdateComp from '@/views/dictionaryMng/components/domain/bottom/manage/JobDomainClassUpdateComp.vue';
  import JobDomainNameUpdateComp from '@/views/dictionaryMng/components/domain/bottom/manage/JobDomainNameUpdateComp.vue';

  const dictionaryMngStore = useDictionaryMngStore();
  const { isDomainJobType } = storeToRefs(dictionaryMngStore);

  const domainJobType = ref('group');

  // 렌더링 변경 감지
  watch(
    () => isDomainJobType.value,
    (value) => {
      domainJobType.value = value;
    }
  );

  watch;
</script>
