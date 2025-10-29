<template>
  <div class="pop-window">
    <div class="window-header">용어명 조합</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top">
              <div class="top-row">
                <div class="title-s">
                  추천 용어명
                  <AppTooltip
                    :htmlContent="getTooltipById('termRecommendation')"
                  >
                  </AppTooltip>
                </div>
              </div>
            </div>
            <div class="grid-list grid-radius">
              <AppGrid
                :rowData="rowData"
                :columnDefs="columnDefs"
                :context="context"
                :rowClassRules="rowClassRules"
                rowSelection="single"
                enableBrowserTooltips="true"
                tooltipShowDelay="0"
                @rowDoubleClicked="onRowDoubleClicked"
                @rowClicked="onRowClicked"
                ref="agGrid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">저장</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import wordActualizingDivisionCellRender from '@/utils/wordActualizingDivisionCellRender.js';
  import RadioCellRenderer from '../../utils/RadioCellRenderer';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { termEnglishAbbreviationSplit } from '@/utils/mflexApi/actualizing/actualizingApi.js';

  export default {
    props: {
      termDivideQuery: {
        type: Object,
        default: {},
        required: true,
      },
      termAbbreviationName: {
        type: String,
        default: '',
        required: true,
      },
    },
    components: {
      AppTooltip,
      wordActualizingDivisionCellRender,
      RadioCellRenderer,
    },
    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
      },
      onConfirm() {
        console.log('onConfirm!!!');
        console.log('this.selectedRow : ', this.selectedRow);
        this.$emit('confirm', this.selectedRow);
        this.$emit('close');
      },
      onSelectDictionary(value) {
        console.log('onSelectDictionary', value);
        this.selectedRow = value;
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
      callDetailInfo(params) {
        // 필요한 로직 구현
        console.log('callDetailInfo called with params:', params);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      const rowData = reactive({});
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      // rowClassRules 추가 - 에러와 성공 상태에 따른 스타일 적용
      const rowClassRules = reactive({
        'error-row': (params) => {
          // status가 0이거나 wordErrorCode에 에러가 있는 경우
          if (params.data.status === 0) {
            return true;
          }

          // wordErrorCode 배열에 에러 코드가 있는지 확인
          if (
            params.data.wordErrorCode &&
            Array.isArray(params.data.wordErrorCode)
          ) {
            return params.data.wordErrorCode.some(
              (code) =>
                code === '10' ||
                code === '20' ||
                code === '30' ||
                code === '40' ||
                code === '60'
            );
          }

          return false;
        },
        'success-row': (params) => {
          // status가 1이고 에러 코드가 없는 경우
          if (params.data.status === 1) {
            // wordErrorCode가 없거나 빈 배열이거나 모든 에러 코드가 정상인 경우
            if (
              !params.data.wordErrorCode ||
              params.data.wordErrorCode.length === 0
            ) {
              return true;
            }

            // 모든 에러 코드가 정상('00' 또는 undefined/null)인 경우
            if (Array.isArray(params.data.wordErrorCode)) {
              return params.data.wordErrorCode.every(
                (code) =>
                  !code ||
                  code === '00' ||
                  code === '' ||
                  (code !== '10' &&
                    code !== '20' &&
                    code !== '30' &&
                    code !== '40' &&
                    code !== '60')
              );
            }
          }

          return false;
        },
      });

      const columnDefs = reactive([
        {
          headerName: '조합 용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'wordActualizingDivisionCellRender',
          valueFormatter: (params) => params.value,
          width: 740,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          tooltipValueGetter: (p) =>
            'Create any fixed message, e.g. This is the Athlete s Age',
          width: 195,
          dragStatus: false,
        },
        // {
        //   headerName: '선택',
        //   field: 'radio',
        //   cellClass: 'grid-cell-centered',
        //   cellRenderer: 'RadioCellRenderer',
        //   valueFormatter: (params) => params.value,
        //   width: 100,
        //   dragStatus: false,
        // },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async () => {
        console.log(
          'props.termAbbreviationName : ',
          props.termAbbreviationName
        );

        const termDivideQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          termAbbreviationName: props.termAbbreviationName,
        };

        try {
          const response = await termEnglishAbbreviationSplit(termDivideQuery);
          console.log('termDivideQuery:', termDivideQuery);
          console.log('API Response:', response);

          const termDivideList = response.data;
          let divideData = [];

          for (let i = 0; i < termDivideList.length; i++) {
            const item = termDivideList[i];
            let combineName = '';

            // wordCombinationName과 wordErrorCode를 함께 처리
            for (let j = 0; j < item.wordCombinationName.length; j++) {
              const word = item.wordCombinationName[j];
              const errorCode = item.wordErrorCode[j];
              // const wordType = item.wordTypeName[j]; // 툴팁에 표시할 단어 유형

              // 툴팁 내용 생성
              let tooltipContent = {
                word: word,
                errorCode: errorCode,
                errorTitle: '',
                errorInfo: '',
                // wordType: wordType,
              };

              // 에러 코드에 따른 추가 정보
              let errorInfo = '';
              let errorTitle = '';
              if (errorCode === '10') {
                errorTitle = '미등록 단어';
                errorInfo =
                  '단어사전에 등록된 단어가 없습니다. <br> 단어를 클릭하여 먼저 단어를 등록해주세요.';
              } else if (errorCode === '20') {
                errorTitle = '미등록 분류어';
                errorInfo = '용어의 마지막 단어는 분류어로 등록되어야 합니다.';
              } else if (errorCode === '30') {
                errorTitle = '대체어';
                errorInfo =
                  '대체어를 사용할 수 없습니다. <br> 추천단어로 변경하여 등록해주세요.';
              } else if (errorCode === '40') {
                errorTitle = '금칙어';
                errorInfo =
                  '용어에 금칙어가 포함되어 있습니다. <br> 금칙어를 제거하고 등록해주세요.';
              } else if (errorCode === '60') {
                errorTitle = '분류어 미등록';
                errorInfo =
                  '단어사전에 등록된 단어가 분류어가 아닙니다. <br> 단어를 클릭하여 먼저 분류어로 변경 해주세요.';
              }

              // console.log('tooltipContent:', tooltipContent);
              // JSON 문자열로 변환

              // if (errorInfo) tooltipContent += `<br>상태: ${errorInfo}`;
              let tooltipString = `단어=${word}/에러코드=${errorCode}/에러명=${errorTitle}/에러메세지=${errorInfo}`;
              // 에러 코드가 있거나 termAbbreviationErrorYn이 true인 경우 버튼으로 표시
              if (errorCode === '10') {
                combineName += `<button class="none-divide-word" data="${word}" data-tooltip="${tooltipString}">${word}</button>_`;
              } else if (errorCode === '20') {
                combineName += `<button class="none-divide-word" data="${word}" data-tooltip="${tooltipString}">${word}</button>_`;
              } else if (errorCode === '30') {
                combineName += `<button class="none-divide-word" data="${word}" data-tooltip="${tooltipString}"><span class="icon-error-alternative">대체어</span>${word}</button>_`;
              } else if (errorCode === '40') {
                combineName += `<button class="none-divide-word" data="${word}" data-tooltip="${tooltipString}"><span class="icon-error-forbidden">금칙어</span>${word}</button>_`;
              } else if (errorCode === '60') {
                combineName += `<button class="none-divide-word" data="${word}" data-tooltip="${tooltipString}">${word}</button>_`;
              } else {
                combineName += `${word}_`;
              }
            }

            // 마지막 언더스코어 제거
            combineName = combineName.slice(0, -1);

            divideData.push({
              id: i,
              instituteId: item.instituteId,
              dictionaryId: item.dictionaryId,
              label: item.termName,
              termName: combineName,
              domainClassName: item.domainClassName,
              value: i,
              status: item.termAbbreviationErrorYn ? 0 : 1,
              wordErrorCode: item.wordErrorCode,
              wordTypeName: item.wordTypeName,
            });
          }

          console.log('Processed divideData:', divideData);
          rowData.value = divideData;
        } catch (error) {
          console.error('Error fetching term divide data:', error);
          rowData.value = [];
        }
      };

      const onClickInput = () => {
        console.log('onClickInput ===');
      };

      fetchData();

      const selectRecommendedEng = ref(0);
      const recommendedEngData = ref([
        {
          id: 0,
          label: '사용자(USER)_전화(TEL)_번호(NUMBER)',
          value: 0,
          status: 1,
        },
        {
          id: 1,
          label: '사용자(USER)_전화(TEL)_번호(NUMBER)',
          value: 1,
          status: 1,
        },
        {
          id: 2,
          label: `사용자(USER)_<input type="text" value="자전()">_<input type="text" value="화()">_번호(NUMBER)`,
          value: 2,
          status: 0,
        },
      ]);

      const attachRecommendedEng = () => {
        let sampleData = [];
        for (let i = 0; i < 20; i++) {
          if (i === 8) {
            sampleData.push({
              id: i,
              label: `사용자(USER)_<input type="text" value="자전()">_<input type="text" value="화()">_번호(NUMBER)`,
              value: i,
              status: 0,
            });
          } else {
            sampleData.push({
              id: i,
              label: '사용자(USER)_전화(TEL)_번호(NUMBER)',
              value: i,
              status: 1,
            });
          }
        }
        recommendedEngData.value = sampleData;
      };
      attachRecommendedEng();

      const agGrid = ref(null);

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        rowData,
        columnDefs,
        rowClassRules, // rowClassRules 추가
        resultCount,
        onClose,
        props,
        recommendedEngData,
        selectRecommendedEng,
        onClickInput,
        getTooltipById,
      };
    },
  };
</script>

<style scoped>
  .icon-error {
    display: inline-flex;
    height: 27px;
    background: #e24721;
    color: #fff;
    align-items: center;
    justify-content: center;
    width: 68px;
    border-radius: 3px;
  }

  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }

  /* 에러가 있는 행의 스타일 */
  :deep(.error-row) {
    background-color: #ffebee !important; /* 연한 빨간색 배경 */
    border-left: 4px solid #f44336 !important; /* 왼쪽에 빨간색 보더 */
  }

  /* 에러가 있는 행이 선택되었을 때의 스타일 */
  :deep(.error-row.ag-row-selected) {
    background-color: #ffcdd2 !important; /* 선택 시 조금 더 진한 빨간색 */
  }

  /* 에러가 있는 행에 마우스 호버 시 스타일 */
  :deep(.error-row:hover) {
    background-color: #ffcdd2 !important; /* 호버 시 조금 더 진한 빨간색 */
  }

  /* 성공한 행의 스타일 */
  :deep(.success-row) {
    /* background-color: #f1f8e9 !important;  */
    border-left: 4px solid #4caf50 !important; /* 왼쪽에 초록색 보더 */
  }

  /* 성공한 행이 선택되었을 때의 스타일 */
  :deep(.success-row.ag-row-selected) {
    background-color: #c8e6c9 !important; /* 선택 시 조금 더 진한 초록색 */
  }

  /* 성공한 행에 마우스 호버 시 스타일 */
  :deep(.success-row:hover) {
    background-color: #c8e6c9 !important; /* 호버 시 조금 더 진한 초록색 */
  }

  /* 기본 행 스타일 (에러도 성공도 아닌 경우) */
  :deep(.ag-row:not(.error-row):not(.success-row)) {
    border-left: 4px solid transparent !important; /* 투명한 보더로 정렬 유지 */
  }
</style>
