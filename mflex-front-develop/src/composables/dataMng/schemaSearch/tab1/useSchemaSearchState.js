// composables/dataMng/schemaSearch/useSchemaSearchState.js
import { reactive, ref } from 'vue';

export function useSchemaSearchState() {
  // 그리드 데이터
  const rowData = reactive({});
  const columnDefs = ref([]);
  const newSetColumnDefs = reactive([]);

  // 검색 관련 상태
  const searchInput = ref('');
  const searchType = ref('query');

  // 결과 및 UI 상태
  const resultCount = ref({
    count: '',
    total: '',
  });

  const currentRowIndex = ref(0);

  // 그리드 설정
  const tab1GridId = ref('MFGRD060');

  const gridInfoDefs = ref({
    scrnGridId: tab1GridId,
    scrnId: '',
  });

  // 조회 쿼리
  const researchQuery = reactive({
    instituteId: '',
    informationSystemId: '',
    lastItem: {},
    query: '',
    sort: '',
  });

  // 팝업 상태
  const confirmDeleteHeaderInfo = reactive({
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
    rowData,
    columnDefs,
    newSetColumnDefs,
    tab1GridId,
    gridInfoDefs,
    currentRowIndex,

    // 검색 관련
    searchInput,
    searchType,
    resultCount,
    researchQuery,

    // 팝업 상태
    confirmDeleteHeaderInfo,
    saveGridSettingView,
    chatbotWindowView,
  };
}
