export default {
  template: `
        <div class="cell-box">
          <span class="icon-log__status" :class={login:result}>{{cellValue}}</span>
        </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const result = cellValue === '로그인';
    return {
      cellValue,
      result,
    };
  },
};
