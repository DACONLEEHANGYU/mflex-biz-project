<template>
  <!-- 코드명 컴포넌트 -->
  <JobCodeNameComp v-if="codeJobType === 'codeName'" />
  <!-- 코드값 컴포넌트 -->
  <JobCodeValueComp
    v-if="codeJobType === 'codeValue' || codeJobType === 'noData'"
  />
  <!-- 코드명 업데이트 컴포넌트 -->
  <JobCodeNameUpdateComp v-if="codeJobType === 'jobCodeName'" />
  <!-- 코드값 업데이트 컴포넌트 -->
  <JobCodeValueUpdateComp v-if="codeJobType === 'jobCodeValue'" />
</template>

<script setup>
  import { nextTick, ref, watch } from 'vue';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import JobCodeNameComp from '@/views/dictionaryMng/components/code/bottom/manage/JobCodeNameComp.vue';
  import JobCodeValueUpdateComp from '@/views/dictionaryMng/components/code/bottom/manage/JobCodeValueUpdateComp.vue';
  import JobCodeNameUpdateComp from '@/views/dictionaryMng/components/code/bottom/manage/JobCodeNameUpdateComp.vue';
  import JobCodeValueComp from '@/views/dictionaryMng/components/code/bottom/manage/JobCodeValueComp.vue';
  import { storeToRefs } from 'pinia';

  const dictionaryMngStore = useDictionaryMngStore();
  const { isCodeJobType } = storeToRefs(dictionaryMngStore);

  const codeJobType = ref('codeName');

  // 컴포넌트 렌더링 수행을 위한 상태 감지
  watch(
    () => isCodeJobType.value,
    (newVal) => {
      console.log('isCodeJobType', newVal);
      codeJobType.value = newVal;
    },
    { deep: true }
  );
</script>
