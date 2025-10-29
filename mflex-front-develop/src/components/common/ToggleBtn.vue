<template>
  <div class="toggle-container">
    <button
      class="toggle-switch"
      :class="{ active: isNaturalMode }"
      @click="toggleMode"
      role="switch"
      :aria-checked="isNaturalMode"
    >
      <span class="toggle-slider">
        <span class="toggle-icon">
          <svg v-if="isNaturalMode" viewBox="0 0 24 24" width="16" height="16">
            <path
              fill="currentColor"
              d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z"
            />
          </svg>
          <span v-else class="q-icon">Q</span>
        </span>
      </span>
    </button>
  </div>
</template>

<script>
  export default {
    name: 'QueryModeToggle',
    data() {
      return {
        isNaturalMode: false,
      };
    },
    methods: {
      toggleMode() {
        this.isNaturalMode = !this.isNaturalMode;
        this.$emit('change-search-type', this.isNaturalMode);
      },
    },
  };
</script>

<style scoped>
  .toggle-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toggle-switch {
    position: relative;
    width: 60px;
    height: 32px;
    background-color: RGB(172, 172, 172); /* 쿼리 모드일 때 빨간색 */
    border-radius: 16px;
    padding: 4px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .toggle-switch.active {
    background-color: #379583; /* 자연어 모드일 때 터코이즈 색상 */
  }

  .toggle-slider {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 24px;
    height: 24px;
    background-color: rgb(255, 255, 255);
    border-radius: 50%;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-switch.active .toggle-slider {
    transform: translateX(28px);
    /* color: #379583; */
    color: red;
  }

  .toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    height: 16px;
  }

  .q-icon {
    font-family: 'Arial', sans-serif;
    font-weight: bold;
    font-size: 14px;
  }

  .toggle-switch:focus {
    outline: none;
    /* box-shadow: 0 0 0 2px #379583; */
  }

  /* 아이콘 색상 */
  svg {
    fill: #666;
  }
</style>
