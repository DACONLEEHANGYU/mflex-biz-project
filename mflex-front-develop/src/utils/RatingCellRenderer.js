export default {
  template: `
        <div class="cell-box">
              <span class="cell-rating" :class="lowerCellValue">{{ cellValue }}</span>             
          </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const lowerCellValue = cellValue.toLowerCase();
    return {
      cellValue,
      lowerCellValue,
    };
  },
};
