<template>
  <section class="row-wrap pt10">
    <div class="tab-inner">
      <div class="col col-2">
        <LeftComp></LeftComp>
        <RightComp></RightComp>
      </div>
    </div>
  </section>
</template>

<!-- eslint-disable vue/no-unused-components -->

<script setup>
  import RightComp from '@/views/dictionaryMng/components/domain/bottom/manage/RightComp.vue';
  import LeftComp from '@/views/dictionaryMng/components/domain/bottom/jobBox/LeftComp.vue';
</script>
