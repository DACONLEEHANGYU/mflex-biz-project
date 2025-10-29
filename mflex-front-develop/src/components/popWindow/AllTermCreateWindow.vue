<template>
  <div class="pop-window">
    <div class="window-header">일괄 용어명 생성</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="col col-2">
            <div class="grid-wrap" style="flex: 0 0 55%">
              <div class="grid-top">
                <div class="title-s">작업용어 목록</div>
              </div>
              <div class="grid-list">
                <AppGrid
                  :rowData="rowData"
                  :columnDefs="columnDefs"
                  :context="context"
                  rowSelection="single"
                  @rowDoubleClicked="onRowDoubleClicked"
                  @rowClicked="onSelectTerm"
                  @gridApi="handleSetGridApi"
                  ref="agGrid"
                />
              </div>
            </div>
            <div class="grid-wrap">
              <div class="grid-top">
                <div class="title-s between">추천 용어명</div>
              </div>
              <div class="grid-list grid-radius">
                <AppGrid
                  :rowData="recommendedEngData"
                  :columnDefs="recommendedColumnDefs"
                  :context="context"
                  :rowClassRules="recommendedRowClassRules"
                  rowSelection="single"
                  @rowDoubleClicked="onRowDoubleClicked"
                  @rowClicked="onRowClicked"
                  ref="rightAgGrid"
                />
              </div>
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
  import { reactive, ref, nextTick } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import wordActualizingDivisionCellRender from '@/utils/wordActualizingDivisionCellRender.js';
  import TermActualizingRadioCellRenderer from '../../utils/TermActualizingRadioCellRenderer';
  import ButtonCellRenderer from '../../utils/ButtonCellRenderer';

  import {
    termEnglishAbbreviationSplit, // 용어영문약어명 단어분할(단일)
    termEnglishAbbreviationSplitBatch, // 용어영문약어명 단어분할(일괄)
  } from '@/utils/mflexApi/actualizing/actualizingApi.js';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';

  export default {
    props: {
      selectData: {
        type: Object,
        default: () => {},
      },
    },
    components: {
      AppWarningTooltip,
      StatusCellRenderer,
      wordActualizingDivisionCellRender,
      TermActualizingRadioCellRenderer,
      ButtonCellRenderer,
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

        console.log('params: ', value);

        if (!value.termNameErrorYn) {
          const matchedData = this.rowData.value.find(
            (row) =>
              row.englishAbbreviationName === value.englishAbbreviationName
          );

          if (this.gridApi) {
            const rowNode = this.agGrid.gridApi.getRowNode(matchedData.id);
            if (rowNode) {
              console.log('rowNode : ', rowNode);
              rowNode.setDataValue('termName', value.termName);
              rowNode.setDataValue('combinationStatus', '완료');
            }
          }
        }

        const matchedData = this.rowData.value.find(
          (row) => row.termName === value.termName
        );
        console.log('matchedData : ', matchedData);

        if (matchedData) {
          matchedData.englishAbbreviationName =
            value.selectTermAbbreviationName;

          if (this.gridApi) {
            const rowNode = this.agGrid.gridApi.getRowNode(matchedData.id);
            if (rowNode) {
              console.log('rowNode : ', rowNode);
              rowNode.setDataValue(
                'englishAbbreviationName',
                value.englishAbbreviationName
              );
            }
          }
        } else {
          console.log('matchedData : ', matchedData);
        }
      },
      async onSelectTerm(value) {
        console.log('onSelectTerm', value);
        this.selectJobTerm = value;

        const termDivideQuery = {
          instituteId: this.useMetaMngInstId,
          dictionaryId: this.useDctnryId,
          termAbbreviationName: value.englishAbbreviationName,
        };

        const recommendTermList = await termEnglishAbbreviationSplit(
          termDivideQuery
        );
        console.log('recommendTermList : ', recommendTermList);

        this.bindRecommendedEngData(recommendTermList, value.rawTermName);

        const popWindow = document.querySelector('.pop-window');

        const selectedRow = popWindow.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = popWindow.querySelector(`[row-id="${clickNode}"]`);
        clickedNode.classList.add('ag-row-selected');
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
      },
      onClickInput(e) {
        console.log('onClickInput', e);
      },
      onChangeDivideStatus(params) {
        console.log('params: ', params);

        if (!params.termNameErrorYn) {
          const matchedData = this.rowData.value.find(
            (row) =>
              row.englishAbbreviationName === params.englishAbbreviationName
          );

          if (this.gridApi) {
            const rowNode = this.agGrid.gridApi.getRowNode(matchedData.id);
            if (rowNode) {
              console.log('rowNode : ', rowNode);
              rowNode.setDataValue('termName', params.termName);
              rowNode.setDataValue('combinationStatus', '완료');
            }
          }
        }

        const matchedData = this.rowData.value.find(
          (row) => row.termName === params.termName
        );
        console.log('matchedData : ', matchedData);

        if (matchedData) {
          matchedData.englishAbbreviationName =
            params.selectTermAbbreviationName;

          if (this.gridApi) {
            const rowNode = this.agGrid.gridApi.getRowNode(matchedData.id);
            if (rowNode) {
              console.log('rowNode : ', rowNode);
              rowNode.setDataValue(
                'englishAbbreviationName',
                params.englishAbbreviationName
              );
            }
          }
        } else {
          console.log('matchedData : ', matchedData);
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      console.log('props.selectData : ', props.selectData);

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const agGrid = ref(null);
      const rightAgGrid = ref(null);
      const gridApi = ref(null);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      // 추천 용어명 그리드의 rowClassRules 추가
      const recommendedRowClassRules = reactive({
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

      //추천 영문 약어
      const selectRecommendedEng = ref(0);

      const recommendedColumnDefs = reactive([
        {
          headerName: '조합 용어명',
          field: 'termAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'wordActualizingDivisionCellRender',
          valueFormatter: (params) => params.value,
          width: 420,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 90,
          dragStatus: false,
        },
        // {
        //   headerName: '선택',
        //   field: 'radio',
        //   cellClass: 'grid-cell-centered',
        //   cellRenderer: 'TermActualizingRadioCellRenderer',
        //   valueFormatter: (params) => params.value,
        //   width: 70,
        //   dragStatus: false,
        // },
      ]);

      const selectedRowId = ref(null);
      const recommendedEngData = reactive({});

      const selectJobTerm = ref('');
      const selectedRadioValues = ref({});

      //용어 목록
      const rowData = reactive({});
      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '용어영문약어명',
          field: 'englishAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 350,
          dragStatus: false,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '조합상태',
          field: 'combinationStatus',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'StatusCellRenderer',
          width: 160,
          dragStatus: false,
        },
      ]);

      // 작업 용어목록 조회
      const fetchData = async () => {
        console.log('props.selectData : ', props.selectData);
        const termDivideParamsData = props.selectData
          .filter(
            (selectedItem) => selectedItem.data.applicationCategory === '신규'
          )
          .map((selectedItem) => ({
            instituteId: useMetaMngInstId,
            userId: userInfo.value.userId,
            dictionaryId: selectedItem.data.dictionaryId,
            jobTermId: selectedItem.data.id,
            jobDivisionCode:
              selectedItem.data.applicationCategory === '신규'
                ? 'NEW'
                : 'MODIFY',
            termName: selectedItem.data.termName,
            termAbbreviationName: selectedItem.data.termEngAbbreviationName
              ? selectedItem.data.termEngAbbreviationName
              : null,
            termNameErrorYn: selectedItem.data.termNameErrorYn,
            termStandardYn:
              selectedItem.data.termStandardYnName === '표준' ? true : false,
            domainName: selectedItem.data.domainName,
          }));

        const data = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          termAbbreviationNames: termDivideParamsData,
        };

        console.log('termDivideParamsData : ', termDivideParamsData);

        const termDivideList = await termEnglishAbbreviationSplitBatch(data);

        console.log('termDivideList : ', termDivideList);

        const termJob = termDivideList.data;

        let termJobData = [];
        for (let i = 0; i < termJob.length; i++) {
          termJobData.push({
            id: i,
            no: i + 1,
            dictionaryId: termJob[i].dictionaryId,
            instituteId: termJob[i].instituteId,
            termName: termJob[i].termName,
            jobTypeCode: 'CUR',
            rawTermName: termJob[i].termName,
            englishAbbreviationName: termJob[i].termAbbreviationName,
            combinationStatus: termJob[i].termCombinationStateName,
            jobTermId: termJob[i].jobTermId,
          });
        }
        console.log('할당 전 termJobData : ', termJobData);

        rowData.value = termJobData;
        console.log('termJobData : ', termJobData);
        const result = await firstRowSelectedEvent();

        console.log('result : ', result);

        const termDivideQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          termAbbreviationName: termJobData[0].englishAbbreviationName,
        };

        const recommendTermList = await termEnglishAbbreviationSplit(
          termDivideQuery
        );
        console.log('recommendTermList : ', recommendTermList);
        bindRecommendedEngData(recommendTermList, termJobData[0].rawTermName);
      };

      const callDetailInfo = (id) => {
        // 선택된 행에 대한 상세 정보 처리
        console.log('Selected row id:', id);
        // 여기에 필요한 로직을 추가하세요
      };

      const onClickInput = (e) => {
        console.log('onClickInput', e);
      };

      // 선택항목 추천 영문약어 데이터 할당
      const bindRecommendedEngData = (recommendTermList, rawTermName) => {
        console.log('!!! bindRecommendedEngData');
        console.log('!!! recommendTermList', recommendTermList);
        console.log('!!! rawTermName', rawTermName);

        const matchedRawTermName = recommendTermList.data.find(
          (item) => item.termName === rawTermName
        );

        console.log('matchedRawTermName : ', matchedRawTermName);

        let hasMatchingRow = false;
        let divideData = [];

        const list = recommendTermList.data;
        console.log('바인딩 ', list);

        for (let i = 0; i < list.length; i++) {
          const item = list[i];
          let combineName = '';

          // wordCombinationName과 wordErrorCode를 함께 처리
          for (let j = 0; j < item.wordCombinationName.length; j++) {
            const word = item.wordCombinationName[j];
            const errorCode = item.wordErrorCode[j];

            // 툴팁 내용 생성
            let tooltipContent = {
              word: word,
              errorCode: errorCode,
              errorTitle: '',
              errorInfo: '',
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

            let tooltipString = `단어=${word}/에러코드=${errorCode}/에러명=${errorTitle}/에러메세지=${errorInfo}`;
            // 에러 코드에 따른 버튼 스타일 적용
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

          // rawTermName과 item.termName 일치 여부 확인
          const isMatching = rawTermName === item.termName;

          // 매칭되는 항목이 있는 경우 hasMatchingRow를 true로 설정
          if (isMatching) {
            hasMatchingRow = true;
          }

          divideData.push({
            id: i,
            instituteId: item.instituteId,
            dictionaryId: item.dictionaryId,
            termNameErrorYn: item.termNameErrorYn,
            label: item.termAbbreviationName,
            termName: item.termName,
            termAbbreviationName: combineName,
            domainClassName: item.domainClassName,
            value: i,
            status: item.termNameErrorYn ? 0 : 1,
            wordErrorCode: item.wordErrorCode,
            wordTypeName: item.wordTypeName,
            englishAbbreviationName: item.termAbbreviationName,
            selected: isMatching, // 일치하는 항목은 selected: true로 설정
          });
        }

        // 매칭되는 항목이 없고 데이터가 있는 경우, 첫 번째 항목을 selected: true로 설정
        console.log('divideData : ', divideData);

        if (!hasMatchingRow && divideData.length > 0) {
          divideData[0].selected = true;
        }

        recommendedEngData.value = divideData;

        // nextTick을 통해 UI 업데이트 후 선택된 행을 확인
        nextTick(() => {
          // AG Grid 인스턴스가 있는지 확인
          if (rightAgGrid.value && rightAgGrid.value.gridApi) {
            // 선택된 행 확인
            const selectedRow = divideData.find((row) => row.selected);
            if (selectedRow) {
              // 해당 행을 선택 상태로 설정
              rightAgGrid.value.gridApi.forEachNode((node) => {
                if (node.data.id === selectedRow.id) {
                  node.setSelected(true);
                  // 선택된 행이 보이도록 스크롤 조정
                  rightAgGrid.value.gridApi.ensureNodeVisible(node, 'middle');
                }
              });
            }
          }
        });

        console.log('recommendedEngData : ', recommendedEngData.value);
      };

      fetchData();

      // 상단 row
      const firstRowSelectedEvent = () => {
        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            const popWindow = document.querySelector('.pop-window');
            // 첫 행 select 효과
            const nodesWithRowId0 = popWindow.querySelector('[row-id="0"]');
            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            // .ag-row-selected 클래스를 추가합니다.
            if (nodesWithRowId0) {
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }

            if (firstRowData) {
              console.log('firstRowData.data : ', firstRowData.data);
              selectJobTerm.value = firstRowData.data;
              console.log('selectJobTerm : ', selectJobTerm.value.termName);
            }
          });
        }
      };

      const onConfirm = () => {
        emit('confirm', rowData.value);
        emit('close');
      };

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        selectJobTerm,
        rowData,
        columnDefs,
        selectRecommendedEng,
        recommendedColumnDefs,
        recommendedEngData,
        recommendedRowClassRules, // rowClassRules 추가
        rightAgGrid,
        gridApi,
        handleSetGridApi,
        bindRecommendedEngData,
        onConfirm,
        onClose,
        onClickInput,
        useMetaMngInstId,
        useDctnryId,
      };
    },
  };
</script>

<style scoped>
  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }

  /* 에러가 있는 행의 스타일 - 추천 용어명 그리드만 적용 */
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

  /* 기본 행 스타일 (에러도 성공도 아닌 경우) - 추천 용어명 그리드만 */
  :deep(.ag-row:not(.error-row):not(.success-row)) {
    border-left: 4px solid transparent !important; /* 투명한 보더로 정렬 유지 */
  }
</style>
