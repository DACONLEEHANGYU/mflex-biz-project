export default {
  template: `
        <span>
              <span>{{ cellValue }}</span>
              <button @click="buttonClicked()">Push For Total</button>
          </span>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const buttonClicked = () => alert(`${cellValue} medals won!`);

    return {
      cellValue,
      buttonClicked,
    };
  },
};
