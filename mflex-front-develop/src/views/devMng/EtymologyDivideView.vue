<template>
  <section
    :class="{
      'contents-wrap': swipper === true,
      'contents-wrap-none-history': swipper === false,
    }"
  >
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <section class="row-wrap">
            <div class="bg-box" style="border: none">
              <div class="etymology-fullscreen-wrapper">
                <EtymologyAnalyzer />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  // 수정 후 (올바른 철자)
  import EtymologyAnalyzer from '@/views/devMng/components/etymology/EtymologyAnalyzer.vue';
  import EtymologyDivideComp from '@/views/devMng/components/etymology/EtymologyDivideComp.vue';
  import { storeToRefs } from 'pinia';

  import { useSwipperStore } from '@/stores/swipper';
  const { swipper } = storeToRefs(useSwipperStore());
</script>

<style scoped>
  /* body {
    overflow-x: auto;
    overflow-y: hidden;
    min-width: 320px;
  } */
  .etymology-fullscreen-wrapper {
    /* 🔥 뷰포트 전체를 차지하도록 설정 */
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10000; /* 다른 모든 요소보다 위에 */
    background: #111217; /* 배경색 설정 */
  }

  :deep(body) {
    overflow-x: auto;
    overflow-y: hidden;
    min-width: 320px;
  }
</style>
