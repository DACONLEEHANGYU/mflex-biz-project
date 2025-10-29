import { ref } from 'vue';

export default {
  template: `
  <div style="display: flex; justify-content: center; margin-top: 2px;">
    <div class="icon-box" 
         :style="iconBoxStyle">
      {{ iconNumber }}
    </div>
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

    // 아이콘 박스 관련 변수
    const showIconBox = ref(false);
    const iconBoxStyle = ref({});
    const iconNumber = ref('');

    console.log('props.params', props.params);

    inputValue.value = props.params.value;
    textAlign.value = props.params.textAlign;
    textColor.value = props.params.textColor;
    useDisable.value = props.params.useDisable;

    // diagnosisMetricCode에 따라 아이콘 박스 스타일 설정
    if (props.params.value) {
      const code = props.params.value;

      console.log('props.params.data.diagnosisMetricCode', code);

      showIconBox.value = true;

      switch (code) {
        case 'STANDARD':
          iconBoxStyle.value = {
            'background-color': '#1a4968', // 진한 파란색
            color: 'white',
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-weight': 'bold',
          };
          iconNumber.value = '1';
          break;
        case 'STANDARD_DOMAIN':
          iconBoxStyle.value = {
            'background-color': '#3d6e5c', // 진한 녹색
            color: 'white',
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-weight': 'bold',
          };
          iconNumber.value = '2';
          break;
        case 'STANDARD_KOREAN_NAME':
          iconBoxStyle.value = {
            'background-color': '#5d9082', // 연한 녹색
            color: 'white',
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-weight': 'bold',
          };
          iconNumber.value = '3';
          break;
        case 'STANDARD_KOREAN_NAME_DOMAIN':
          iconBoxStyle.value = {
            'background-color': '#8eb9a1', // 밝은 민트색
            color: 'white',
            width: '24px',
            height: '24px',
            'border-radius': '4px',
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'center',
            'font-weight': 'bold',
          };
          iconNumber.value = '4';
          break;
        default:
          showIconBox.value = false;
          break;
      }
    }

    return {
      cellValue,
      showIconBox,
      iconBoxStyle,
      iconNumber,
    };
  },
};
