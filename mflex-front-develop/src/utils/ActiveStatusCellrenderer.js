import { computed } from 'vue';

export default {
  template: `
    <div class="cell-box">
      <i :class="iconClass"></i>
    </div>
  `,
  props: {
    params: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const cellValue = computed(
      () => props.params.valueFormatted || props.params.value
    );

    const iconClass = computed(() =>
      cellValue.value === '활성화'
        ? 'icon-cell__active'
        : 'icon-cell__none-active'
    );

    return {
      iconClass,
    };
  },
};
