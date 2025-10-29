import { ref, watch } from 'vue';

export default {
  template: `
        <div class="cell-box">
           <input type="text" class="input-text-cell autoComplete" readonly :style="{'text-align':textAlign, 'color':textColor}" :value="inputValue" @click="onInputClick($event)" />
        </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const inputValue = ref('');
    const textAlign = ref('center');
    const textColor = ref('#444');

    inputValue.value = cellValue;
    textAlign.value = props.params.textAlign;
    textColor.value = props.params.textColor;

    const onInputClick = (event) => {
      const rowIndex = props.params.rowIndex;
      const colId = props.params.column.colId;
      props.params.context.componentParent.cellAutocompleteChange(
        rowIndex,
        colId
      );
    };

    return {
      cellValue,
      inputValue,
      textAlign,
      textColor,
      onInputClick,
    };
  },
};
