export default {
  template: `
        <div class="cell-box">
          <a :href="'mailto:' + cellValue" class="btn-grid__email">
           {{cellValue}}
          </a>
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
