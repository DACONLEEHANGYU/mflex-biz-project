// import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
// import { useRoute, useRouter } from 'vue-router';
// import { useTabNaviStore } from '@/stores/tabNavi';
// import { useAlert } from '@/composables/alert';
// import { storeToRefs } from 'pinia';
// import { useAuthStore } from '@/stores/auth';

// import { useNoneDivideWordStore } from '@/stores/noneDivideWord';
// import { createNewWord } from '@/utils/mflexApi/dictionaryManagementApi.js';

// export default {
//   template: `
//     <div class="custom-cell" ref="cellContainer">
//       <div class="label-text" v-html="params.value"></div>
//     </div>
//   `,
//   setup(props) {
//     console.log('wordDivisionCellRender:', props.params.value);

//     const router = useRouter();

//     const noneDivideStore = useNoneDivideWordStore();
//     const { setNoneDivideWord } = noneDivideStore;

//     const authStore = useAuthStore();
//     const { userInfo, userStngInfo } = storeToRefs(authStore);

//     //사용자 아이디
//     const { userId, userNm } = userInfo.value;
//     //사용자 사용 시스템 정보
//     const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
//       userStngInfo.value;

//     const onClickInput = async (event) => {
//       const buttonData = event.target.getAttribute('data');
//       if (buttonData) {
//         const cleanedData = buttonData.replace(/[()]/g, '');
//         console.log('Cleaned button data:', cleanedData);

//         const updateDateTime = new Date().toISOString().split('T')[0];

//         const wordDetailsQuery = {
//           managementInstituteId: useMetaMngInstId,
//           wordDictionaryId: useDctnryId,
//           wordName: cleanedData,
//           wordAbbreviationName: null,
//           wordEnglishName: null,
//           wordTypeCode: 'GENERAL',
//           wordExplain: null,
//           domainClassDictionaryId: null,
//           domainClassName: null,
//           wordSimilarYn: false,
//           wordSimilarDivisionCode: null,
//           enactContext: null,
//           revisionCycle: null,
//           revisionDate: updateDateTime,
//         };

//         await createNewWord(wordDetailsQuery);

//         const { setAlertStatus } = useAlert();
//         setAlertStatus({
//           view: true,
//           message: '단어가 등록되었습니다.',
//         });

//         //setNoneDivideWord(cleanedData);
//         //router.replace('/dictionaryMng/word');
//         // router.push({
//         //   name: 'MFMN0402',
//         //   params: { data: cleanedData },
//         // });
//         //alert('Cleaned button data: ' + cleanedData);
//       }
//     };

//     return {
//       onClickInput,
//     };
//   },
//   mounted() {
//     // 동적으로 생성된 버튼에 이벤트 리스너 추가
//     this.$nextTick(() => {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.addEventListener('click', this.onClickInput);
//       });
//     });
//   },
//   beforeUnmount() {
//     // 컴포넌트 제거 시 이벤트 리스너 제거
//     const buttons = this.$refs.cellContainer.querySelectorAll('button');
//     buttons.forEach((button) => {
//       button.removeEventListener('click', this.onClickInput);
//     });
//   },
// };

/////

// wordDivisionCellRender.js
// 원본
// export default {
//   template: `
//     <div class="word-division-cell">
//       <span ref="cellContent"></span>
//       <div ref="tooltip" class="custom-tooltip" :style="tooltipStyle">
//         <div class="tooltip-content">
//           <div class="tooltip-info"></div>
//         </div>
//       </div>
//     </div>
//   `,

//   data() {
//     return {
//       tooltipStyle: {
//         display: 'none',
//         position: 'fixed',
//         left: '0px',
//         top: '0px',
//       },
//     };
//   },

//   mounted() {
//     this.initializeCell();
//   },

//   methods: {
//     initializeCell() {
//       const cellContent = this.params.value;
//       this.$refs.cellContent.innerHTML = cellContent;

//       // 모든 버튼에 이벤트 리스너 추가
//       const buttons = this.$refs.cellContent.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.addEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.addEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     showTooltip(event, button) {
//       const tooltip = this.$refs.tooltip;
//       const tooltipContent = button.getAttribute('data-tooltip');

//       if (tooltipContent) {
//         const rect = button.getBoundingClientRect();
//         const gridBody = document.querySelector('.ag-center-cols-container');
//         const gridRect = gridBody.getBoundingClientRect();

//         // 툴팁 내용 설정
//         tooltip.querySelector('.tooltip-info').innerHTML = tooltipContent;

//         // 툴팁 위치 계산
//         let top = rect.top - tooltip.offsetHeight - 10;
//         let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;

//         // 그리드 경계를 벗어나지 않도록 조정
//         if (top < gridRect.top) {
//           top = rect.bottom + 10; // 버튼 아래에 표시
//         }
//         if (left < gridRect.left) {
//           left = gridRect.left + 5;
//         } else if (left + tooltip.offsetWidth > gridRect.right) {
//           left = gridRect.right - tooltip.offsetWidth - 5;
//         }

//         // 스타일 적용
//         this.tooltipStyle = {
//           display: 'block',
//           position: 'fixed',
//           left: `${left}px`,
//           top: `${top}px`,
//           zIndex: 9999,
//         };
//       }
//     },

//     hideTooltip() {
//       this.tooltipStyle.display = 'none';
//     },
//   },
// };

///

// export default {
//   template: `
//     <div class="word-division-cell" ref="cellContainer">
//       <div class="cell-content" v-html="params.value"></div>
//       <div ref="tooltip" class="custom-tooltip" :style="tooltipStyle">
//         <div class="tooltip-content"></div>
//       </div>
//     </div>
//   `,

//   data() {
//     return {
//       tooltipStyle: {
//         display: 'none',
//         position: 'absolute',
//         backgroundColor: 'white',
//         border: '1px solid #ccc',
//         padding: '8px',
//         borderRadius: '4px',
//         boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
//         zIndex: 9999,
//         maxWidth: '300px',
//         pointerEvents: 'none',
//       },
//     };
//   },

//   mounted() {
//     this.$nextTick(() => {
//       this.initializeTooltips();
//     });
//   },

//   beforeUnmount() {
//     this.removeEventListeners();
//   },

//   methods: {
//     initializeTooltips() {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.addEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.addEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     removeEventListeners() {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.removeEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.removeEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     showTooltip(event, button) {
//       const tooltipContent = button.getAttribute('data-tooltip');
//       if (!tooltipContent) return;

//       const tooltip = this.$refs.tooltip;
//       const tooltipContentDiv = tooltip.querySelector('.tooltip-content');
//       tooltipContentDiv.innerHTML = tooltipContent;

//       const buttonRect = button.getBoundingClientRect();
//       const gridContainer = document.querySelector('.ag-root-wrapper');
//       const gridRect = gridContainer.getBoundingClientRect();

//       // 툴팁을 일단 보이게 만들어서 크기를 측정할 수 있도록 함
//       this.tooltipStyle = {
//         ...this.tooltipStyle,
//         display: 'block',
//         visibility: 'hidden',
//       };

//       this.$nextTick(() => {
//         const tooltipRect = tooltip.getBoundingClientRect();

//         // 위치 계산
//         let top = buttonRect.top - tooltipRect.height - 10;
//         let left =
//           buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;

//         // 그리드 경계 체크 및 위치 조정
//         if (top < gridRect.top) {
//           top = buttonRect.bottom + 10;
//         }
//         if (left + tooltipRect.width > gridRect.right) {
//           left = gridRect.right - tooltipRect.width - 10;
//         }
//         if (left < gridRect.left) {
//           left = gridRect.left + 10;
//         }

//         // 최종 위치 적용
//         this.tooltipStyle = {
//           ...this.tooltipStyle,
//           display: 'block',
//           visibility: 'visible',
//           left: `${left}px`,
//           top: `${top}px`,
//         };
//       });
//     },

//     hideTooltip() {
//       this.tooltipStyle = {
//         ...this.tooltipStyle,
//         display: 'none',
//       };
//     },
//   },
// };

/// 수정중중

// export default {
//   template: `
//     <div class="word-division-cell" ref="cellContainer">
//       <div class="cell-content" v-html="params.value"></div>
//     </div>
//   `,

//   data() {
//     return {
//       tooltipElement: null, // 동적으로 생성된 툴팁 엘리먼트
//     };
//   },

//   mounted() {
//     this.$nextTick(() => {
//       this.initializeTooltips();
//     });
//   },

//   beforeUnmount() {
//     this.removeEventListeners();
//     this.removeTooltip();
//   },

//   methods: {
//     initializeTooltips() {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.addEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.addEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     removeEventListeners() {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.removeEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.removeEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     createTooltip() {
//       if (!this.tooltipElement) {
//         // body에 툴팁을 동적으로 추가
//         this.tooltipElement = document.createElement('div');
//         this.tooltipElement.classList.add('custom-tooltip');
//         document.body.appendChild(this.tooltipElement);
//       }
//     },

//     removeTooltip() {
//       if (this.tooltipElement) {
//         document.body.removeChild(this.tooltipElement);
//         this.tooltipElement = null;
//       }
//     },

//     showTooltip(event, button) {
//       this.createTooltip();

//       const tooltipContent = button.getAttribute('data-tooltip');
//       if (!tooltipContent) return;

//       this.tooltipElement.innerHTML = tooltipContent;
//       this.tooltipElement.style.display = 'block';

//       // 버튼의 화면 상 위치 계산
//       const buttonRect = button.getBoundingClientRect();

//       // 툴팁 위치 설정 (position: fixed 사용)
//       let top = buttonRect.top - this.tooltipElement.offsetHeight - 10;
//       let left =
//         buttonRect.left +
//         buttonRect.width / 2 -
//         this.tooltipElement.offsetWidth / 2;

//       // 화면 경계 체크
//       if (top < 0) {
//         top = buttonRect.bottom + 10; // 위쪽 공간 부족 시 아래로 표시
//       }
//       // if (left + this.tooltipElement.offsetWidth > window.innerWidth) {
//       //   left = window.innerWidth - this.tooltipElement.offsetWidth - 10;
//       // }
//       if (left < 0) {
//         left = 10;
//       }

//       // 위치 설정
//       this.tooltipElement.style.position = 'fixed';
//       this.tooltipElement.style.top = `${top}px`;
//       this.tooltipElement.style.left = `${left}px`;
//     },

//     hideTooltip() {
//       if (this.tooltipElement) {
//         this.tooltipElement.style.display = 'none';
//       }
//     },
//   },
// };

///////// 수수정정정정정

// export default {
//   template: `
//     <div class="word-division-cell" ref="cellContainer">
//       <div class="cell-content" v-html="params.value"></div>
//     </div>
//   `,

//   data() {
//     return {
//       tooltipElement: null,
//     };
//   },

//   mounted() {
//     this.$nextTick(() => {
//       this.initializeTooltips();
//     });
//   },

//   beforeUnmount() {
//     this.removeEventListeners();
//     this.removeTooltip();
//   },

//   methods: {
//     initializeTooltips() {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.addEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.addEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     removeEventListeners() {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.removeEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.removeEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     createTooltip() {
//       if (!this.tooltipElement) {
//         this.tooltipElement = document.createElement('div');
//         this.tooltipElement.classList.add('custom-tooltip');
//         this.tooltipElement.style.cssText = `
//           position: fixed;
//           display: none;
//           background: white;
//           border: 1px solid #ccc;
//           padding: 8px;
//           border-radius: 4px;
//           box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//           z-index: 9999;
//           pointer-events: none;
//         `;
//         document.body.appendChild(this.tooltipElement);
//       }
//     },

//     removeTooltip() {
//       if (this.tooltipElement) {
//         document.body.removeChild(this.tooltipElement);
//         this.tooltipElement = null;
//       }
//     },

//     showTooltip(event, button) {
//       this.createTooltip();

//       const tooltipContent = button.getAttribute('data-tooltip');
//       if (!tooltipContent) return;

//       // 먼저 툴팁 내용을 설정하고 display: block으로 변경
//       this.tooltipElement.innerHTML = tooltipContent;
//       this.tooltipElement.style.display = 'block';
//       this.tooltipElement.style.visibility = 'hidden'; // 크기 계산을 위해 임시로 숨김

//       // 버튼의 위치 계산
//       const buttonRect = button.getBoundingClientRect();

//       // 툴팁의 크기 계산 (내용이 설정된 후에 계산)
//       const tooltipHeight = this.tooltipElement.offsetHeight;
//       const tooltipWidth = this.tooltipElement.offsetWidth;

//       // 버튼 바로 위에 툴팁 위치 계산
//       const top = buttonRect.top - tooltipHeight - 5; // 버튼 위 5px 간격
//       const left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;

//       // 위치 설정 및 표시
//       this.tooltipElement.style.top = `${top}px`;
//       this.tooltipElement.style.left = `${left}px`;
//       this.tooltipElement.style.visibility = 'visible'; // 툴팁 표시
//     },

//     hideTooltip() {
//       if (this.tooltipElement) {
//         this.tooltipElement.style.display = 'none';
//       }
//     },
//   },
// };

/// 수정의 수정중

// export default {
//   props: {
//     customTooltipClass: {
//       type: String,
//       default: 'custom-tooltip',
//     },
//     customTooltipStyle: {
//       type: Object,
//       default: () => ({}),
//     },
//   },

//   template: `
//     <div class="word-division-cell" ref="cellContainer">
//       <div class="cell-content" v-html="params.value"></div>
//     </div>
//   `,

//   data() {
//     return {
//       tooltipElement: null,
//     };
//   },

//   mounted() {
//     this.$nextTick(() => {
//       this.initializeTooltips();
//     });
//   },

//   beforeUnmount() {
//     this.removeEventListeners();
//     this.removeTooltip();
//   },

//   methods: {
//     initializeTooltips() {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.addEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.addEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     removeEventListeners() {
//       const buttons = this.$refs.cellContainer.querySelectorAll('button');
//       buttons.forEach((button) => {
//         button.removeEventListener('mouseenter', (e) =>
//           this.showTooltip(e, button)
//         );
//         button.removeEventListener('mouseleave', this.hideTooltip);
//       });
//     },

//     createTooltip() {
//       if (!this.tooltipElement) {
//         this.tooltipElement = document.createElement('div');
//         this.tooltipElement.classList.add(this.customTooltipClass);
//         Object.assign(this.tooltipElement.style, {
//           position: 'fixed',
//           display: 'none',
//           pointerEvents: 'none',
//           zIndex: 9999,
//         });
//         document.body.appendChild(this.tooltipElement);
//       }
//     },

//     removeTooltip() {
//       if (this.tooltipElement) {
//         document.body.removeChild(this.tooltipElement);
//         this.tooltipElement = null;
//       }
//     },

//     showTooltip(event, button) {
//       this.createTooltip();

//       const tooltipContent = button.getAttribute('data-tooltip');
//       if (!tooltipContent) return;

//       // 툴팁 설정
//       this.tooltipElement.innerHTML = tooltipContent;
//       this.tooltipElement.style.display = 'block';
//       this.tooltipElement.style.visibility = 'hidden'; // 크기 계산을 위해 숨김

//       // 사용자 정의 스타일 적용
//       Object.assign(this.tooltipElement.style, this.customTooltipStyle);

//       // 버튼 위치 계산
//       const buttonRect = button.getBoundingClientRect();
//       const tooltipHeight = this.tooltipElement.offsetHeight;
//       const tooltipWidth = this.tooltipElement.offsetWidth;

//       let top = buttonRect.top - tooltipHeight - 5;
//       let left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;

//       // 화면 경계 처리
//       if (top < 0) top = buttonRect.bottom + 5;
//       if (left < 0) left = 10;
//       if (left + tooltipWidth > window.innerWidth)
//         left = window.innerWidth - tooltipWidth - 10;

//       // 위치 설정
//       this.tooltipElement.style.top = `${top}px`;
//       this.tooltipElement.style.left = `${left}px`;
//       this.tooltipElement.style.visibility = 'visible';
//     },

//     hideTooltip() {
//       if (this.tooltipElement) {
//         this.tooltipElement.style.display = 'none';
//       }
//     },
//   },
// };

//// !!!!!!!
import { useAlert } from '@/composables/alert';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useDictionaryMngStore } from '@/stores/dictionaryMng';
import {
  manageWordV2,
  getWordDetailsV2,
} from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';

export default {
  props: {
    customTooltipClass: {
      type: String,
      default: 'custom-tooltip',
    },
    customTooltipStyle: {
      type: Object,
      default: () => ({}),
    },
  },

  template: `
    <div class="word-division-cell" ref="cellContainer">
      <div class="cell-content" v-html="params.value"></div>
    </div>
  `,

  data() {
    return {
      tooltipElement: null,
    };
  },

  setup() {
    const authStore = useAuthStore();
    const { userInfo, userStngInfo } = storeToRefs(authStore);

    //사용자 아이디
    const { userId, userNm } = userInfo.value;
    //사용자 사용 시스템 정보
    const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
      userStngInfo.value;

    const dictionaryMngStore = useDictionaryMngStore();
    const { setIsWordJobSave, setIsWordJobApproval, setIsWordJobCancel } =
      dictionaryMngStore;

    return {
      setIsWordJobSave,
      useMetaMngInstId,
      useDctnryId,
      useSbjarId,
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.initializeTooltips();

      //     // 동적으로 생성된 버튼에 이벤트 리스너 추가
      const buttons = this.$refs.cellContainer.querySelectorAll('button');
      buttons.forEach((button) => {
        button.addEventListener('click', this.onClickInput);
      });
    });
  },

  beforeUnmount() {
    this.removeEventListeners();
    this.removeTooltip();

    // 컴포넌트 제거 시 이벤트 리스너 제거
    const buttons = this.$refs.cellContainer.querySelectorAll('button');
    buttons.forEach((button) => {
      button.removeEventListener('click', this.onClickInput);
    });
  },

  methods: {
    initializeTooltips() {
      const buttons = this.$refs.cellContainer.querySelectorAll('button');
      buttons.forEach((button) => {
        button.addEventListener('mouseenter', (e) =>
          this.showTooltip(e, button)
        );
        button.addEventListener('mouseleave', this.hideTooltip);
      });
    },

    removeEventListeners() {
      const buttons = this.$refs.cellContainer.querySelectorAll('button');
      buttons.forEach((button) => {
        button.removeEventListener('mouseenter', (e) =>
          this.showTooltip(e, button)
        );
        button.removeEventListener('mouseleave', this.hideTooltip);
      });
    },

    createTooltip() {
      if (!this.tooltipElement) {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.classList.add(this.customTooltipClass);
        this.tooltipElement.style.cssText = `
          position: fixed;
          display: none;
          pointer-events: none;
          z-index: 9999;
        `;
        document.body.appendChild(this.tooltipElement);
      }
    },

    removeTooltip() {
      if (this.tooltipElement) {
        document.body.removeChild(this.tooltipElement);
        this.tooltipElement = null;
      }
    },

    showTooltip(event, button) {
      this.createTooltip();

      const tooltipContent = button.getAttribute('data-tooltip');
      if (!tooltipContent) return;

      // 문자열을 객체로 변환
      const tooltipData = {};
      tooltipContent.split('/').forEach((pair) => {
        const [key, value] = pair.split('=');
        tooltipData[key.trim()] = value.trim();
      });

      console.log('tooltipData:', tooltipData);

      // 툴팁 내용을 각 항목별로 표시
      this.tooltipElement.innerHTML = `
        <div class="tooltip-header" style="margin-bottom: 5px;">
          <strong style="color:red; font-size: 20px;">⚠</strong> <span style="font-size:16px; font-weight:600;">${tooltipData['에러명']}</span>
        </div>
        <div class="tooltip-content" style="font-size:14px;"> ${tooltipData['에러메세지']}
        </div>
        <div class="tooltip-arrow"></div>
      `;

      this.tooltipElement.style.display = 'block';
      this.tooltipElement.style.visibility = 'hidden';

      Object.assign(this.tooltipElement.style, this.customTooltipStyle);

      const buttonRect = button.getBoundingClientRect();
      const tooltipHeight = this.tooltipElement.offsetHeight;
      const tooltipWidth = this.tooltipElement.offsetWidth;

      let top = buttonRect.top - tooltipHeight - 10;
      let left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;

      if (top < 0) top = buttonRect.bottom + 10;
      if (left < 0) left = 10;
      if (left + tooltipWidth > window.innerWidth)
        left = window.innerWidth - tooltipWidth - 10;

      this.tooltipElement.style.top = `${top}px`;
      this.tooltipElement.style.left = `${left}px`;
      this.tooltipElement.style.visibility = 'visible';
    },

    hideTooltip() {
      if (this.tooltipElement) {
        this.tooltipElement.style.display = 'none';
      }
    },

    async onClickInput(event) {
      console.log('onClickInput:', event.target);
      const buttonData = event.target.getAttribute('data');
      const tooltipStirng = event.target.getAttribute('data-tooltip');
      if (buttonData) {
        console.log('tooltipStirng data:', tooltipStirng);

        const errorCodeMatch = tooltipStirng.match(/에러코드=(\d+)/);

        console.log('errorCodeMatch:', errorCodeMatch);

        let cleanData;
        let wordTypeCode;
        let wordDetailsQuery;

        const updateDateTime = new Date().toISOString().split('T')[0];

        if (errorCodeMatch[1] === '10') {
          // 일반어 등록
          const { setAlertStatus } = useAlert();
          setAlertStatus({
            view: true,
            message: '단어가 등록되었습니다.',
          });
          cleanData = buttonData.replace(/[()]/g, '');

          wordDetailsQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            jobTypeCode: 'STD',
            jobDivisionCode: 'NEW',
            wordName: cleanData.trim(),
            wordTypeCode: 'GENERAL',
            wordAbbreviationName: null,
            wordEnglishName: null,
            wordExplain: '임시등록',
            domainClassName: null,
            revisionDate: updateDateTime,
            isTemporary: true,
          };
        } else if (errorCodeMatch[1] === '60') {
          // 분류어로 변경등록록
          const { setAlertStatus } = useAlert();
          setAlertStatus({
            view: true,
            message: '단어[분류어]가 등록되었습니다.',
          });
          // 정규식을 사용하여 텍스트와 코드 분리
          const regex = /(.+)\[(.+)\]/;
          const matches = buttonData.match(regex);
          // 분리된 값 저장
          const wordName = matches ? matches[1] : ''; // '호'
          const wordAbbreviationName = matches ? matches[2] : ''; // 'HHO'

          const detailsRequest = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            wordName: wordName.trim(),
            wordAbbreviationName: wordAbbreviationName,
            wordTypeCode: '일반어',
          };

          const wordDetails = await getWordDetailsV2(detailsRequest);

          console.log('wordDetails:', wordDetails);

          wordDetailsQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            jobTypeCode: 'STD',
            jobDivisionCode: 'MODIFY',
            wordName: wordName.trim(),
            wordTypeCode: 'CLASSIFICATION',
            wordAbbreviationName: wordDetails.data.wordAbbreviationName,
            wordEnglishName: wordDetails.data.wordEnglishName,
            wordExplain: wordDetails.data.wordExplain,
            domainClassName: null,
            revisionDate: updateDateTime,
            isTemporary: true,
          };

          console.log('wordDetailsQuery:', wordDetailsQuery);
        }

        const response = await manageWordV2(wordDetailsQuery);

        this.setIsWordJobSave(true);

        console.log('wordDetailsQuery:', wordDetailsQuery);

        // console.log('manageWordV2-response :', response);

        // const wordDetailsQuery = {
        //   managementInstituteId: useMetaMngInstId,
        //   wordDictionaryId: useDctnryId,
        //   wordName: cleanedData,
        //   wordAbbreviationName: null,
        //   wordEnglishName: null,
        //   wordTypeCode: 'GENERAL',
        //   wordExplain: null,
        //   domainClassDictionaryId: null,
        //   domainClassName: null,
        //   wordSimilarYn: false,
        //   wordSimilarDivisionCode: null,
        //   enactContext: null,
        //   revisionCycle: null,
        //   revisionDate: updateDateTime,
        // };

        // await createNewWord(wordDetailsQuery);

        //setNoneDivideWord(cleanedData);
        //router.replace('/dictionaryMng/word');
        // router.push({
        //   name: 'MFMN0402',
        //   params: { data: cleanedData },
        // });
        //alert('Cleaned button data: ' + cleanedData);
      }
    },
  },
};
