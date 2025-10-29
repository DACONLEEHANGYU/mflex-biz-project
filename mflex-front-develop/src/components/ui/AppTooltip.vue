<!-- <template>
  <div class="tooltip-wrap">
    <span
      class="icon"
      @mouseenter="infoView = true"
      @mouseleave="infoView = false"
      >?</span
    >
    <Transition name="fade">
      <div class="infos" v-if="infoView">
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const infoView = ref(false);
</script>

<style lang="scss" scoped></style> -->

<template>
  <div class="tooltip-wrap">
    <span
      class="icon"
      @mouseenter="infoView = true"
      @mouseleave="infoView = false"
      >?</span
    >
    <Transition name="fade">
      <div class="infos" v-if="infoView">
        <!-- htmlContent가 있으면 v-html로, 없으면 slot 사용 -->
        <div v-if="htmlContent" v-html="htmlContent"></div>
        <slot v-else></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup>
  import { ref } from 'vue';

  const props = defineProps({
    htmlContent: {
      type: String,
      default: '',
    },
  });

  const infoView = ref(false);
</script>

<!-- <style lang="scss" scoped>
  .tooltip-wrap {
    position: relative;
    display: inline-block;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    background-color: #007bff;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
    margin-left: 5px;
  }

  .infos {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.4;
    white-space: nowrap;
    z-index: 1000;
    margin-top: 5px;
    max-width: 300px;
    white-space: normal;

    &::before {
      content: '';
      position: absolute;
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 5px solid rgba(0, 0, 0, 0.9);
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style> -->
