<template>
  <section class="row-wrap pt10">
    <div class="tab-inner">
      <div class="col col-2">
        <LeftComp></LeftComp>
        <div class="inputs-row">
          <RightComp></RightComp>
        </div>
      </div>
    </div>
  </section>
</template>
<!-- eslint-disable vue/no-unused-components -->
<!-- <script
  type="module"
  src="@/utils/js/dictionaryManagement/wordManagementBottomComp.js"
></script> -->
<script setup>
  import LeftComp from '@/views/dictionaryMng/components/word/bottom/jobBox/LeftComp.vue';
  import RightComp from '@/views/dictionaryMng/components/word/bottom/manage/RightComp.vue';
</script>
