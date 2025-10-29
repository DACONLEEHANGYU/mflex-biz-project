export default {
  template: `
        <div class="grid-zoomOut__controls">
              <button class="btn-zoom" @click="buttonClicked('zoom')"><i class="icon"></i></button>
              <button class="btn-out" @click="buttonClicked('out')"><i class="icon"></i></button>
          </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const buttonClicked = state => {
      props.params.context.componentParent.callZoomOut(
        state,
        props.params.data,
      );
    };

    return {
      buttonClicked,
    };
  },
};
