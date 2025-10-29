export default {
  template: `
        <div class="cell-box tooltip">
          <span class="btn-grid__text" @mouseover="onMouseover">{{cellValue}}</span>
        </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const onMouseover = () => {
      // const field = props.params.colDef.field;
      // const value = props.params.data;
      // const { id } = props.params.data;
      props.params.context.componentParent.callTooltipInfo(cellValue);
    };

    return {
      cellValue,
      onMouseover,
    };
  },
};
