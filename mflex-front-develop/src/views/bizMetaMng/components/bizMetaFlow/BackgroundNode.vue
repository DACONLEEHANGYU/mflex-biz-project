<!-- filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaFlow\BackgroundNode.vue -->

<template>
  <div class="background-node" :class="{ 'composite-background': isComposite }">
    <!-- 헤더 배경 -->
    <div class="background-header"></div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  });

  const isComposite = computed(() => props.data.termType === 'COMPOSITE');
</script>

<style lang="scss" scoped>
  .background-node {
    width: 100%;
    height: 100%;
    position: relative;
    pointer-events: none; // 🔥 클릭 불가
    z-index: -10; // 🔥 최하위

    // 헤더 배경 (상단 70px)
    .background-header {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 14px 14px 0 0;
      pointer-events: none;
    }

    // 복합구성용어 배경
    &.composite-background {
      .background-header {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      }
    }
  }
</style>
