export default {
  template: `
        <div class="cell-box">
          <template v-if="cellValue === '정지'">
          <i class="icon-cell__stop"></i>
          </template>
        </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;

    return {
      cellValue,
    };
  },
};
