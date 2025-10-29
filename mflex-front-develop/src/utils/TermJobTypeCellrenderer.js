import { computed } from 'vue';

export default {
  template: `
    <span class="cell-container">              
      <span class="cell-jobTypeClass" :class="jobTypeClass" :style="jobTypeStyle">
        {{ cellValue.name }} 
        <sup class="job-type-sup" :class="jobTypeClass"> {{ jobTypeText }}</sup>
      </span>     
    </span> 
  `,
  setup(props) {
    const cellValue = props.params.value;

    // console.log('cellValue=', cellValue);

    const jobTypeText = computed(() => {
      if (cellValue.jobDivisionCode === 'C') {
        return '(신규)';
      } else if (cellValue.jobDivisionCode === 'U') {
        return '(변경)';
      } else if (cellValue.jobDivisionCode === 'X') {
        return '(폐기)';
      } else if (cellValue.jobDivisionCode === 'V') {
        return '(복구)';
      } else if (cellValue.jobDivisionCode === 'D') {
        return '(삭제)';
      }
      return null;
    });

    const jobTypeClass = computed(() => {
      if (cellValue.jobDivisionCode === 'C') {
        return 'new';
      } else if (cellValue.jobDivisionCode === 'U') {
        return 'modify';
      } else if (cellValue.jobDivisionCode === 'X') {
        return 'discard';
      } else if (cellValue.jobDivisionCode === 'V') {
        return 'restore';
      } else if (!cellValue.jobDivisionCode) {
        return 'delete';
      }
      return null;
    });

    const jobTypeStyle = computed(() => {
      if (cellValue.discardYn && !cellValue.jobDivisionCode) {
        return {
          textDecoration: 'line-through',
          color: 'red',
        };
      } else if (cellValue.jobDivisionCode === 'D') {
        return {
          textDecoration: 'line-through',
          color: 'red',
        };
      } else if (cellValue.jobDivisionCode === 'V') {
        return {
          textDecoration: 'line-through',
          color: 'green',
        };
      }
      return null;
    });

    return {
      cellValue,
      jobTypeClass,
      jobTypeText,
      jobTypeStyle,
    };
  },
};
