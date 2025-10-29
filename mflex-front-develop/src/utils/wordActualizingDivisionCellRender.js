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
            jobTypeCode: 'CUR',
            jobDivisionCode: 'NEW',
            wordName: null,
            wordTypeCode: 'GENERAL',
            wordAbbreviationName: cleanData.trim(),
            wordEnglishName: null,
            wordExplain: '임시등록',
            domainClassName: null,
            revisionDate: updateDateTime,
            isTemporary: true,
          };
        } else if (errorCodeMatch[1] === '60') {
          // 분류어로 변경등록
          const { setAlertStatus } = useAlert();
          setAlertStatus({
            view: true,
            message: '단어[분류어]가 등록되었습니다.',
          });

          console.log('buttonData:', buttonData);

          // 영문약어명과 한글명 분리를 위한 수정된 정규식
          // 'PAY[료[X]]' 형태에서 'PAY'와 '료'만 추출하도록 수정
          const regex = /^([A-Za-z0-9_]+)\[([^\[\]]+)/;
          const matches = buttonData.match(regex);

          // 영문약어명 추출
          const wordAbbreviationName = matches ? matches[1].trim() : '';

          // 한글명 추출 (대괄호 내부의 첫 부분만)
          const wordName = matches ? matches[2].trim() : '';

          console.log('추출된 영문약어명:', wordAbbreviationName);
          console.log('추출된 한글명:', wordName);

          const detailsRequest = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            wordName: wordName,
            wordAbbreviationName: wordAbbreviationName,
            wordTypeCode: '일반어',
          };

          const wordDetails = await getWordDetailsV2(detailsRequest);

          console.log('wordDetails:', wordDetails);

          wordDetailsQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            jobTypeCode: 'CUR',
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
