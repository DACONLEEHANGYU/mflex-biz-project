// composables/dictionarySearch/wordSearch/useWordSearchState.js
import { reactive, ref } from 'vue';

export function useWordSearchState() {
  // 그리드 데이터
  const rowFcData = reactive([]);
  const columnDefs = ref([]);

  // 검색 관련 상태
  const searchInput = ref('');
  const searchType = ref('query');

  // 결과 및 UI 상태
  const resultCount = ref({
    count: '0',
    total: '0',
  });

  const currentRowIndex = ref(0);

  // 그리드 설정
  const tab2GridId = ref('MFGRD005');
  const bscFetchCnt = ref('50');

  const gridInfoDefs = ref({
    scrnGridId: tab2GridId,
    scrnId: '',
  });

  // 검색 옵션
  const optionSelected = ref(10);
  const searchOptions = reactive([
    { label: '10개', value: 10 },
    { label: '20개', value: 20 },
    { label: '30개', value: 30 },
  ]);

  // 정렬 상태
  const sortStateQuery = ref('');

  // 팝업 상태
  const confirmSaveDctnrySrchTab2State = reactive({
    view: false,
    message:
      '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
  });

  const confirmDeleteDctnrySrchTab2State = reactive({
    view: false,
    message:
      '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
  });

  const saveGridSettingView = reactive({
    view: false,
    message: '그리드 설정 정보를 저장하시겠습니까?',
  });

  const chatbotWindowView = ref(false);

  return {
    // 그리드 관련
    rowFcData,
    columnDefs,
    tab2GridId,
    gridInfoDefs,
    currentRowIndex,

    // 검색 관련
    searchInput,
    searchType,
    resultCount,

    // 설정 관련
    bscFetchCnt,
    optionSelected,
    searchOptions,
    sortStateQuery,

    // 팝업 상태
    confirmSaveDctnrySrchTab2State,
    confirmDeleteDctnrySrchTab2State,
    saveGridSettingView,
    chatbotWindowView,
  };
}
