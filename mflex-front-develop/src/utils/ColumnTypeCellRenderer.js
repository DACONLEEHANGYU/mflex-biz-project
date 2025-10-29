import { ref } from 'vue';

export default {
  template: `
        <div class="cell-state">
              <span class="icon-state blue" :class="resultClass()">{{resultType()}}</span><span class="label">{{ value[1] }}</span>             
          </div>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const value = cellValue.split('/');
    const resultType = () => {
      let typeValue = value[0];
      if (value[0] === 'key') {
        typeValue = '';
      }
      return typeValue;
    };
    const resultClass = () => {
      let classValue = '';
      if (value[0] === 'key') {
        classValue = 'key';
      } else {
        classValue = '';
      }
      return classValue;
    };
    return {
      cellValue,
      value,
      resultClass,
      resultType,
    };
  },
};
