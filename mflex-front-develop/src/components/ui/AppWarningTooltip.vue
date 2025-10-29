<template>
  <div class="tooltip-wrap warning">
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

<style lang="scss" scoped></style>
