import { ref } from 'vue';

export default {
  template: `
        <div class="cell-box">
           <input type="text" class="input-text-cell" :disabled="useDisable" :style="{'text-align':textAlign, 'color':textColor}" :value="inputValue" @input="inputText($event)" @blur="onBlur" />
        </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const inputValue = ref('');
    const textAlign = ref('center');
    const textColor = ref('#444');
    const useDisable = ref(false);

    inputValue.value = props.params.value;
    textAlign.value = props.params.textAlign;
    textColor.value = props.params.textColor;
    useDisable.value = props.params.useDisable;

    const inputText = (event) => {
      inputValue.value = event.target.value;
    };

    const onBlur = () => {
      const colId = props.params.column.colId;
      props.params.node.setDataValue(colId, inputValue.value);
      // props.params.context.componentParent.setDataValue(
      //   colId,
      //   inputValue.value,
      // );
    };

    return {
      cellValue,
      inputValue,
      textAlign,
      textColor,
      useDisable,
      inputText,
      onBlur,
    };
  },
};
