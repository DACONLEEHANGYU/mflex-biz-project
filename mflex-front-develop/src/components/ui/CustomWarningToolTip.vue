// CustomTooltip.vue
<template>
  <Transition name="tooltip-fade">
    <div v-if="show" class="custom-tooltip" :style="positionStyle">
      <div class="tooltip-content">
        {{ content }}
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  </Transition>
</template>

<script>
  import { computed } from 'vue';

  export default {
    name: 'CustomTooltip',
    props: {
      show: {
        type: Boolean,
        default: false,
      },
      content: {
        type: String,
        required: true,
      },
      position: {
        type: Object,
        default: () => ({
          top: 0,
          left: 0,
        }),
      },
    },
    setup(props) {
      const positionStyle = computed(() => ({
        top: `${props.position.top}px`,
        left: `${props.position.left}px`,
      }));

      return {
        positionStyle,
      };
    },
  };
</script>

<style scoped>
  .custom-tooltip {
    position: fixed;
    z-index: 1000;
    padding: 8px 12px;
    background-color: #333;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    max-width: 250px;
    word-wrap: break-word;
  }

  .tooltip-arrow {
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #333;
  }

  .tooltip-fade-enter-active,
  .tooltip-fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .tooltip-fade-enter-from,
  .tooltip-fade-leave-to {
    opacity: 0;
  }
</style>
