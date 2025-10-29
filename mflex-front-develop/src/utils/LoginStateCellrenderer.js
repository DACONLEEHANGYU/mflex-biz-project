export default {
  template: `
        <div class="cell-box lock-cell-box">
          <template v-if="cellValue === false">
          <i v-else class="icon-cell__unlock"></i>
          </template>
          <template v-else><i class="icon-cell__lock"></i></template>
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
