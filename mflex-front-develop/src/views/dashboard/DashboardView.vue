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
              <EtymologyAnalyzer />
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  // 수정 후 (올바른 철자)
  import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue';
  import EtymologyAnalyzer from '@/views/devMng/components/etymology/EtymologyAnalyzer.vue';
  import EtymologyDivideComp from '@/views/devMng/components/etymology/EtymologyDivideComp.vue';
  import { storeToRefs } from 'pinia';

  import { useSwipperStore } from '@/stores/swipper';
  const { swipper } = storeToRefs(useSwipperStore());

  // 🔥 JavaScript로 body 스타일 제어
  let originalBodyStyles = {};

  onMounted(() => {
    // 원본 스타일 백업
    originalBodyStyles = {
      overflow: document.body.style.overflow || '',
      minWidth: document.body.style.minWidth || '',
      margin: document.body.style.margin || '',
      padding: document.body.style.padding || '',
    };

    // 대시보드용 스타일 적용
    document.body.style.overflow = 'hidden';
    document.body.style.minWidth = '320px';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    console.log('대시보드 - body 스타일 변경됨');
  });

  onActivated(() => {
    // 대시보드용 스타일 적용
    document.body.style.overflow = 'hidden';
    document.body.style.minWidth = '320px';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    console.log('대시보드 - 활성화됨, body 스타일 변경됨');
  });

  onDeactivated(() => {
    console.log('대시보드 - 비활성화됨');
    // 원본 스타일 복원
    Object.keys(originalBodyStyles).forEach((key) => {
      document.body.style[key] = originalBodyStyles[key];
    });

    console.log('대시보드 - body 스타일 복원됨');
  });

  onUnmounted(() => {
    // 원본 스타일 복원
    Object.keys(originalBodyStyles).forEach((key) => {
      document.body.style[key] = originalBodyStyles[key];
    });

    console.log('대시보드 - body 스타일 복원됨');
  });
</script>
