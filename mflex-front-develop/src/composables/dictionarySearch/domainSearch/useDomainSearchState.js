import { reactive, ref } from 'vue';

export function useDomainSearchState() {
  // 그리드 데이터
  const rowData = reactive({});
  const columnDefs = ref([]);

  // 검색 관련 상태
  const searchInput = ref('');
  const inputQuery = ref('');
  const searchType = ref('query');

  // 결과 및 UI 상태
  const resultCount = ref({
    count: 10,
    total: 20,
  });

  const currentRowIndex = ref(0);

  // 그리드 설정
  const domainSearchGridId = ref('MFGRD009');

  const gridInfoDefs = ref({
    scrnGridId: domainSearchGridId,
    scrnId: '',
  });

  // 정렬 상태
  const sortStateQuery = ref('');
  const newColumnDefs = ref([]);

  // 트리 관련 상태
  const treeRoots = ref({ roots: ['1'] });
  const treeData = ref({});
  const appTree = ref(null);

  // 선택 데이터 - ref로 변경하여 반응성 확보
  const selectNode = ref({
    domainId: '0도메인사전', // 기본값 설정
    domainGroupName: null,
  });

  // 팝업 상태
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
    rowData,
    columnDefs,
    domainSearchGridId,
    gridInfoDefs,
    currentRowIndex,
    newColumnDefs,

    // 검색 관련
    searchInput,
    inputQuery,
    searchType,
    resultCount,
    sortStateQuery,

    // 트리 관련
    treeRoots,
    treeData,
    appTree,
    selectNode,

    // 팝업 상태
    confirmDeleteDctnrySrchTab2State,
    saveGridSettingView,
    chatbotWindowView,
  };
}
