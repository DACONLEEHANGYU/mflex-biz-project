<template>
  <div class="step-row">
    <div class="step-view">
      <div
        class="step-item"
        v-for="(step, index) in modelValue"
        :class="{ active: step.checked }"
        :key="index"
      >
        <div class="step-box">
          <div class="step-circle">
            <span class="num">{{ index + 1 }}</span
            ><i class="icon-check"></i>
          </div>
          <div class="step-text">{{ step.title }}</div>
        </div>
      </div>
    </div>
    <div class="step-btns">
      <button
        class="btn-m btn-next__prev"
        :disabled="disablePrevBtn"
        @click="onPrevStep"
        v-if="prevButtonUse"
      >
        <i class="icon"></i>이전 단계로
      </button>
      <button
        class="btn-m btn-next__step"
        :disabled="disableNextBtn"
        @click="onNextStep"
        v-if="nextButtonUse"
      >
        다음 단계로{{ nextButtonUse }}<i class="icon"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  nextButtonUse: {
    type: Boolean,
    default: true,
  },
  prevButtonUse: {
    type: Boolean,
    default: true,
  },
  disablePrevBtn: {
    type: Boolean,
    default: false,
  },
  disableNextBtn: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['prevStep', 'nextStep']);

const onPrevStep = () => {
  emit('prevStep');
};
const onNextStep = () => {
  emit('nextStep');
};
</script>
