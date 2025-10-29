export default {
  template: `
        <span>
              <span class="cell-status" :class="status">{{ cellValue }}</span>             
          </span>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const status = cellValue == '완료' ? 'complete' : 'inComplete';

    return {
      cellValue,
      status,
    };
  },
};
