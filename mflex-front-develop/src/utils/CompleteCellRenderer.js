import { computed } from 'vue';

export default {
  template: `
        <span>
              <span class="cell-typeClass" :class="typeClass">{{ cellValue }}</span>             
          </span>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    // console.log('cellValue=', cellValue);
    const typeClass = computed(() => {
      if (cellValue === '완료') {
        return 'complete';
      } else {
        return 'inComplete';
      }
    });

    return {
      cellValue,
      typeClass,
    };
  },
};
