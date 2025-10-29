<template>
  <transition name="slider-view">
    <div class="slider-wrap" v-if="sliderInfos.view">
      <div class="slider-box">
        <div class="msg">{{ sliderInfos.message }}</div>
        <span
          class="btn-close"
          @click="
            setSliderStatus({
              view: false,
              message: '',
            })
          "
          ><i class="icon"></i
        ></span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useSlider } from '@/composables/slider';
import { watch } from 'vue';

const { sliderInfos } = useSlider();

const { setSliderStatus } = useSlider();

let timer = null;

watch(sliderInfos, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    setSliderStatus({
      view: false,
      message: '',
    });
  }, 3000);
});
</script>

<style lang="scss" scoped></style>
