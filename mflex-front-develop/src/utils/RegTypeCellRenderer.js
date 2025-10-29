import { computed } from 'vue';

export default {
  template: `
        <span>
              <span style="width:45px;" class="cell-typeClass" :class="typeClass">{{ cellValue }}</span>             
          </span>
    `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    // console.log('cellValue=', cellValue);
    const typeClass = computed(() => {
      if (cellValue === '신규') {
        return 'new';
      } else if (cellValue === '변경' || cellValue === '수정등록') {
        return 'modify';
      } else if (cellValue === '폐기') {
        return 'remove';
      } else if (cellValue === '복구') {
        return 'restore';
      } else if (cellValue === '삭제') {
        return 'delete';
      }
    });

    return {
      cellValue,
      typeClass,
    };
  },
};
