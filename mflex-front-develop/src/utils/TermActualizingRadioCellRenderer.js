import { ref, onMounted, watch } from 'vue';
import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
export default {
  template: `
        <div class="cell-box">
          <div class="cell-radio">
            <AppWarningTooltip v-if="params.data.status === 0">
                    <div>
                      <div class="tooltip-title">미등록 단어조합</div>
                         작성한 용어의 분할 단어가 사전에 등럭되어
                         있지않습니다.<br />
                         단어를 클릭하여 먼저 단어를 등록해주세요.
                    </div>
            </AppWarningTooltip>
            <label v-else>
            <input type="radio" :name="field" :value="id" v-model="cellValue" @change="onChange" :checked="isSelected" />
            <span class="radio-icon"></span>
            </label>
             </div>
        </div>
        
        
    `,
  components: {
    AppWarningTooltip,
  },
  setup(props) {
    const isSelected = ref(false);
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    console.log('cellValue : ', cellValue);
    const { id } = props.params.data;
    const field = props.params.colDef.field;
    const onChange = () => {
      console.log('props.params.data : ', props.params.data);
      const value = props.params.data;

      console.log('value.id : ', value.id);
      props.params.context.componentParent.callDetailInfo(value.id);

      console.log(
        'props.params.context.componentParent : ',
        props.params.context.componentParent
      );
      if (
        typeof props.params.context.componentParent.onChangeDivideStatus ===
        'function'
      ) {
        console.log('함수 있음 =====================');
        console.log('props.params.data : ', props.params.data);
        props.params.context.componentParent.onChangeDivideStatus(
          props.params.data
        );
      } else {
        console.log('함수 없음 =====================');
      }
    };

    onMounted(() => {
      console.log('radio onMounted ====', props.params.data);
      isSelected.value = props.params.data.selected || false;
      console.log('isSelected.value : ', isSelected.value);
      if (isSelected.value) {
        onChange();
      }
    });

    watch(
      () => props.params.data.selected,
      (newValue) => {
        console.log('rops.params.data.selected : ', newValue);
        isSelected.value = newValue;
        if (newValue) {
          onChange();
        }
      }
    );

    return {
      id,
      cellValue,
      field,
      onChange,
      AppWarningTooltip,
      isSelected,
    };
  },
};

/* export default {
  template: `
    <div class="cell-box">
      <div class="cell-radio">
        <label>
          <input type="radio" :name="field" :value="id" v-model="cellValue" @change="onRadioChange($event, params.data)" />
          <span class="radio-icon"></span>
        </label>
      </div>
    </div>
  `,
  setup(props) {
    const cellValue = props.params.valueFormatted
      ? props.params.valueFormatted
      : props.params.value;
    const { id } = props.params.data;
    const field = props.params.colDef.field;

    const onRadioChange = (event, rowData) => {
      if (event.target.checked) {
        props.params.context.componentParent.selectedRow = rowData;
      }
    };

    return {
      id,
      cellValue,
      field,
      onRadioChange,
    };
  },
}; */
