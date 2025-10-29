<template>
  <!-- 배열인 경우 -->
  <div v-if="Array.isArray(modelValue)" style="display: flex">
    <div v-for="(item, index) in modelValue" :key="index" class="cell-state">
      <!-- state가 root가 아닌 경우 icon은 표시하지 않음 -->
      <span
        v-if="item.state !== 'root'"
        class="icon-state"
        :style="{
          backgroundColor: item.bgColor,
          color: item.color,
          width: item.size + 'px',
        }"
        >{{ item.type }}</span
      >
      <span class="label">{{ item.label }}</span>
      <span v-if="index !== modelValue.length - 1" class="separator">, </span>
    </div>
  </div>

  <!-- 단일 객체이고 state가 root인 경우 (label만 표시) -->
  <div v-else-if="state === 'root'" class="cell-state">
    <span class="label">{{ label }}</span>
  </div>

  <!-- 단일 객체이고 state가 root가 아닌 경우 (icon과 label 모두 표시) -->
  <div v-else class="cell-state">
    <span
      class="icon-state"
      :style="{ backgroundColor: bgColor, color: color, width: size + 'px' }"
      >{{ type }}</span
    >
    <span class="label">{{ label }}</span>
  </div>
</template>

<script setup>
  import { toRefs } from 'vue';
  const props = defineProps({
    modelValue: {
      type: [Object, Array],
      default: () => {},
    },
  });

  const { modelValue } = toRefs(props);

  const { type, label, color, bgColor, size, state } =
    modelValue.value instanceof Object ? toRefs(modelValue.value) : {};

  console.log('modelValue', modelValue.value);
</script>

<style lang="scss" scoped>
  .cell-state {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 100%;
    margin-top: 4px;
    margin-left: 5px;

    .icon-state {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 20px;
      min-width: 20px;
      padding: 0 4px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 500;
      text-align: center;
      margin-right: 5px;
    }

    .label {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
    }

    .separator {
      margin: 0 4px;
      color: #888;
    }
  }

  div[style='display: flex'] {
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }
</style>
