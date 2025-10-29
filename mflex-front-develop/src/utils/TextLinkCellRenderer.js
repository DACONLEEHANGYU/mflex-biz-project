export default {
  template: `
        <div class="cell-box">
          <span class="btn-grid__text" @click="buttonClicked">{{cellValue}}</span>
        </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const buttonClicked = () => {
      console.log();
      const field = props.params.colDef.field;
      const value = props.params.data;
      const { id } = props.params.data;
      props.params.context.componentParent.callDetailInfo(id, value, field);
    };

    return {
      cellValue,
      buttonClicked,
    };
  },
};
