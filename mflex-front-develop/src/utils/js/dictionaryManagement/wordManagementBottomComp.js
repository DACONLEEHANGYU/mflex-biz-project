import { reactive, ref, inject, watch, watchEffect, onActivated } from 'vue';
import { useRoute } from 'vue-router';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';
import { useUiStore } from '@/stores/ui';
import { useNoneDivideWordStore } from '@/stores/noneDivideWord';
import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
import GridSearch from '@/components/grid/GridSearch.vue';
import AppTree from '@/components/ui/AppTree.vue';
import AppTooltip from '@/components/ui/AppTooltip.vue';
import RegTypeCellRenderer from '@/utils/RegTypeCellRenderer.js';
import AppWindow from '@/components/ui/AppWindow.vue';
import AllEngCreateWindow from '@/components/popWindow/AllEngCreateWindow.vue';
import WordSearchWindow from '@/components/popWindow/WordSearchWindow.vue';
import WordUploadWindow from '@/components/popWindow/WordUploadWindow.vue';
import DomainGroupTypeSearchWindow from '@/components/popWindow/DomainGroupTypeSearchWindow.vue';
import {
  getWordDetailInfo,
  getResaerchWordJob,
  wordManagementDataBinding,
  createNewWord,
  modifyWord,
  removeWord,
  getCancelWordJob,
  getCompleteWordJob,
  getRelationWordList,
  getJobWordDetailInfo,
  getUpdateJobWord,
  bindJobWordDetails,
} from '@/utils/mflexApi/dictionaryManagementApi.js';
import RelatedTermsWindow from '@/components/popWindow/RelatedTermsWindow.vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useAlert } from '@/composables/alert';

export default {
  props: ['data'],
  created() {
    console.log('this.$route.params.data : ', this.$route.params);
  },
  components: {
    TypeCellRenderer,
    GridSearch,
    AppTree,
    AppTooltip,
    RegTypeCellRenderer,
    AppWindow,
    WordSearchWindow,
    AllEngCreateWindow,
    DomainGroupTypeSearchWindow,
    RelatedTermsWindow,
    WordUploadWindow,
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
    async onRowClicked(value) {
      console.log('onRowClicked ', value);

      const wordJobDetailsQuery = {
        managementInstituteId: value.managementInstituteId,
        userId: value.userId,
        wordDictionaryId: value.wordDictionaryId,
        jobWordId: value.jobWordId,
      };

      const wordJobawait = await getJobWordDetailInfo(wordJobDetailsQuery);
      console.log('wordJobawait :', wordJobawait);

      // 작업목록을 수정하는 경우
      this.jobUpdateYn = true;

      this.wordDetailsData.selectType = {
        id: 3,
        label: '자료조회',
        type: 'search',
      };
      this.wordDetailsData.jobDivisionName = wordJobawait.data.jobDivisionName;
      this.wordDetailsData.jobWordId = wordJobawait.data.jobWordId;
      this.wordDetailsData.wordName = wordJobawait.data.word.name;
      this.wordDetailsData.wordDictionaryId =
        wordJobawait.data.word.dictionary.id;
      this.wordDetailsData.abbreviationName =
        wordJobawait.data.word.abbreviationName;
      this.wordDetailsData.englishName = wordJobawait.data.word.englishName;
      this.wordDetailsData.typeName = wordJobawait.data.wordTypeCode;
      this.wordDetailsData.explain = wordJobawait.data.word.explain;
      this.wordDetailsData.similarYn = wordJobawait.data.word.similarYn;
      this.wordDetailsData.similarDivisionCode =
        wordJobawait.data.word.similarDivisionCode;
      this.wordDetailsData.similarDivisionName =
        wordJobawait.data.word.similarDivisionName;
      this.wordDetailsData.domainClassName[0].id =
        wordJobawait.data.domainClass.dictionary.id;
      this.wordDetailsData.domainClassName[0].type =
        wordJobawait.data.domainClass.dictionary.type.name;
      this.wordDetailsData.domainClassName[0].label =
        wordJobawait.data.domainClass.name;
      this.wordDetailsData.domainClassName[0].color =
        wordJobawait.data.domainClass.dictionary.type.fontColor;
      this.wordDetailsData.domainClassName[0].bgColor =
        wordJobawait.data.domainClass.dictionary.type.backgroundColor;
      this.wordDetailsData.enactContext = wordJobawait.data.enactContext;
      this.wordDetailsData.revisionCycle = wordJobawait.data.revisionCycle;
      this.wordDetailsData.revisionDate = wordJobawait.data.revisionDate;
      this.wordDetailsData.updater = wordJobawait.data.updater;
      this.wordDetailsData.updateDateTime = wordJobawait.data.updateDateTime;

      this.jobWordDetailsData = await bindJobWordDetails(wordJobawait.data);

      if (this.wordDetailsData.jobDivisionName === '삭제등록') {
        this.wordDetailsData.selectType.type = 'job-remove';
      }

      console.log('this.jobWordDetailsData = ', this.jobWordDetailsData);
    },
    async onSearchEnter(value) {
      console.log('onSearchEnter', value);

      // 쿼리 변환 함수
      function transformQuery(query) {
        // 정규표현식을 사용하여 컬럼명, 연산자, 검색 조건을 분리
        const regex =
          /(\S+)\s+((?:like|=|<|>|<=|>=))\s+'([^']+)'(\s+(?:and|or)\s+)?/gi;
        return query.replace(
          regex,
          (match, column, operator, searchTerm, logicalOperator) => {
            if (column === '최종수정자') {
              // 최종수정자는 검색어 유지, 연산자만 대문자로 변환
              return `${column} ${operator.toUpperCase()} '${searchTerm}'${
                logicalOperator ? logicalOperator.toUpperCase() : ''
              }`;
            }
            // 다른 컬럼들의 경우 영문 검색어와 연산자를 대문자로 변환
            const transformedTerm = searchTerm.replace(/[a-zA-Z]+/g, (word) =>
              word.toUpperCase()
            );
            return `${column} ${operator.toUpperCase()} '${transformedTerm}'${
              logicalOperator ? logicalOperator.toUpperCase() : ''
            }`;
          }
        );
      }

      const transformedQuery = transformQuery(value);

      let sortQuery;
      if (this.sortStateQuery != null) {
        sortQuery = this.sortStateQuery;
      } else {
        sortQuery = this.sortQuery;
      }

      const wordJobQuery = {
        managementInstituteId: this.useMetaMngInstId,
        userId: this.userId,
        query: transformedQuery,
        sort: sortQuery,
      };
      this.wordJobQuery.query = transformedQuery;
      const researchWordJobData = await this.getWordJobData(wordJobQuery);
      console.log('researchWordJobData : ', researchWordJobData);
    },
  },
  beforeMount() {
    this.context = { componentParent: this };
  },
  computed: {
    isReadonly() {
      return (
        this.wordDetailsData.selectType.type === 'search' ||
        this.wordDetailsData.selectType.type === 'remove'
      );
    },
    isSelectType() {
      if (this.wordDetailsData.selectType.type === 'search') {
        return 'search';
      }
      if (this.wordDetailsData.selectType.type === 'new') {
        return 'new';
      }
      if (this.wordDetailsData.selectType.type === 'modify') {
        return 'modify';
      }
      if (this.wordDetailsData.selectType.type === 'remove') {
        return 'remove';
      }
      if (this.wordDetailsData.selectType.type.includes('job')) {
        if (this.wordDetailsData.selectType.type === 'job-remove') {
          return 'job-remove';
        }
        return 'job';
      }
    },
    ifSimilarYn() {
      return this.wordDetailsData.similarYn === false;
    },
    isJobCheckd() {
      return this.wordJobSelected.length === 0;
    },
  },

  emits: ['wordwork-complete'],
  setup(props, { emit }) {
    const route = useRoute();
    const data = route.params;

    // 작업목록의 항목을 수정하는 경우
    const jobUpdateYn = ref(false);

    // 단어등록 작업 데이터
    const jobWordDetailsData = reactive({});

    console.log('wordRouteParmas : ', data);

    const noneDivideStore = useNoneDivideWordStore();
    const { noneDivideWord } = storeToRefs(noneDivideStore);

    const authStore = useAuthStore();
    const { userInfo, userStngInfo } = storeToRefs(authStore);
    //사용자 아이디
    const { userId, userNm } = userInfo.value;
    //사용자 사용 시스템 정보
    const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
      userStngInfo.value;

    //Alert
    const { setAlertStatus } = useAlert();

    const agGrid = ref(null);
    const gridApi = ref(null);

    const onGridReady = (params) => {
      console.log('params: ', params);
      gridApi.value = params;
      console.log('gridApi.value : ', gridApi.value);

      console.log('선택 노드 : ', gridApi.value.getSelectedNodes());
    };

    //Grid 아이디
    const wordMngGridId = ref('');

    const wordJobGridId = ref('MFGRD032');
    const gridInfoDefs = ref({
      scrnGridId: wordJobGridId,
      scrnId: '',
    });

    const jobState = ref(false);

    const uiStore = useUiStore();
    const { alertInfos } = useAlert();
    const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

    const initializeGridColumnDefs = () => {
      const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
      if (storedColumnDefs && storedColumnDefs.MFGRD032) {
        uiStore.setGridColumnDefs('MFGRD032', storedColumnDefs.MFGRD032);
      }
      console.log('storedColumnDefs : ', storedColumnDefs);
    };

    initializeGridColumnDefs();

    //Grid Header 설정
    const storedMfgrd032ColumnDefs = ref([]);
    storedMfgrd032ColumnDefs.value = gridColumnDefs.value.MFGRD032;

    const columnUserJobWordMngFcDefs = ref([]);
    const columnUserJobWordMngHeadData = ref([]);

    const gridUserJobWordDefs = ref({
      scrnGridId: wordMngGridId,
      scrnId: '',
    });

    const sortedColumns = storedMfgrd032ColumnDefs.value
      .filter((col) => col.sort && col.sortIndex !== undefined)
      .sort((a, b) => a.sortIndex - b.sortIndex);

    const sortQuery =
      sortedColumns.length > 0
        ? sortedColumns.map((col) => `${col.headerName} ${col.sort}`).join(', ')
        : '';

    const wordJobQuery = reactive({
      userId: userId,
      managementInstituteId: useMetaMngInstId,
      query: '', // 있으면 추가
      sort: sortQuery, // 있으면 추가
    });

    const updateDateTime = new Date().toISOString().split('T')[0];

    // 선택 데이터 바인딩
    const apiGetWordBaseInfo = (wordDetailsDataInfo) => {
      console.log('apiGetWordBaseInfo : ', wordDetailsDataInfo);

      const wordDetails = wordDetailsDataInfo.data;
      jobUpdateYn.value = false;

      wordDetailsData.wordDictionaryId = wordDetails.word.dictionary.id;
      wordDetailsData.wordName = wordDetails.word.name;
      wordDetailsData.abbreviationName = wordDetails.word.abbreviationName;
      wordDetailsData.englishName = wordDetails.word.englishName;
      wordDetailsData.typeCode = wordDetails.word.typeCode;
      wordDetailsData.typeName =
        wordDetails.word.typeName == '일반어' ? 'GENERAL' : 'CLASSIFICATION';
      wordDetailsData.explain = wordDetails.word.explain;
      wordDetailsData.similarYn = wordDetails.word.similarYn;
      wordDetailsData.similarDivisionCode =
        wordDetails.word.similarDivisionCode === null
          ? ''
          : wordDetails.word.similarDivisionCode;
      wordDetailsData.similarDivisionName =
        wordDetails.word.similarDivisionName;

      wordDetailsData.domainClassName[0].id =
        wordDetails.domainClass.dictionary.id;
      wordDetailsData.domainClassName[0].type =
        wordDetails.domainClass.dictionary.type.name;
      wordDetailsData.domainClassName[0].label = wordDetails.domainClass.name;
      wordDetailsData.domainClassName[0].color =
        wordDetails.domainClass.dictionary.type.fontColor;
      wordDetailsData.domainClassName[0].bgColor =
        wordDetails.domainClass.dictionary.type.backgroundColor;
      wordDetailsData.enactContext = wordDetails.enactContext;
      wordDetailsData.revisionCycle =
        wordDetails.revisionCycle === null
          ? wordDetails.enactCycle
          : wordDetails.revisionCycle;
      wordDetailsData.revisionDate =
        wordDetails.revisionDate === null
          ? wordDetails.enactDate
          : wordDetails.revisionDate;
      wordDetailsData.updater = wordDetails.updater;
      wordDetailsData.updateDateTime = wordDetails.updateDateTime;
      wordDetailsData.jobState = jobState.value;

      wordDetailsData.wordData[0].id = wordDetails.word.dictionary.id;
      wordDetailsData.wordData[0].type = wordDetails.word.dictionary.type.name;
      wordDetailsData.wordData[0].label = wordDetails.word.name;
      wordDetailsData.wordData[0].color =
        wordDetails.word.dictionary.type.fontColor;
      wordDetailsData.wordData[0].bgColor =
        wordDetails.word.dictionary.type.backgroundColor;
    };

    // 단어등록 input 초기화
    const resetWordDetailsData = () => {
      wordDetailsData.selectType = { id: 0, label: '신규등록', type: 'new' };
      wordDetailsData.wordDictionaryId = useDctnryId;
      wordDetailsData.wordName = '';
      wordDetailsData.abbreviationName = '';
      wordDetailsData.englishName = '';
      wordDetailsData.typeCode = '';
      wordDetailsData.typeName = '';
      wordDetailsData.explain = '';
      wordDetailsData.similarYn = false;
      wordDetailsData.similarDivisionCode = '';
      wordDetailsData.similarDivisionName = '';
      wordDetailsData.domainClassName[0].type = '';
      wordDetailsData.domainClassName[0].label = '';
      wordDetailsData.domainClassName[0].color = '';
      wordDetailsData.domainClassName[0].bgColor = '';
      wordDetailsData.enactContext = '';
      wordDetailsData.revisionCycle = '';
      wordDetailsData.revisionDate = '';
      wordDetailsData.updater = '';
      wordDetailsData.updateDateTime = '';
    };

    // //사용자 설정 정보 가져오기
    // const getUserJobWordGridHeadrData = async () => {
    //   const gridHeadrData = await $vxHttp.post(
    //     `${apiUrl}/grid/user/grdHeadr`,
    //     bscGridHeadrParamData
    //   );

    //   console.log('gridHeadrData', gridHeadrData.data);

    //   if (
    //     gridHeadrData.rsltCd === '200' &&
    //     gridHeadrData.data.gridHeadrList !== null
    //   ) {
    //     const userJobWordGridHearData = [];
    //     userJobWordGridHearData.push({
    //       headerName: '',
    //       field: 'id',
    //       hide: false,
    //       pinned: 'left',
    //       sortable: false,
    //       sort: '',
    //       sortIndex: '',
    //       cellClass: 'grid-cell-centered',
    //       width: 30,
    //       cellRenderer: null,
    //       valueFormatter: null,
    //       headerCheckboxSelection: true,
    //       checkboxSelection: true,
    //     });
    //     for (let h = 0; h < gridHeadrData.data.gridHeadrList.length; h++) {
    //       userJobWordGridHearData.push({
    //         headerName:
    //           gridHeadrData.data.gridHeadrList[h].gridColumnHeaderNm,
    //         field: gridHeadrData.data.gridHeadrList[h].gridColumnField,
    //         hide:
    //           gridHeadrData.data.gridHeadrList[h].gridColumnIndct === 'Y'
    //             ? false
    //             : true,
    //         pinned:
    //           gridHeadrData.data.gridHeadrList[h].gridColumnPinned !== null
    //             ? gridHeadrData.data.gridHeadrList[h].gridColumnPinned
    //             : '',
    //         sortable:
    //           gridHeadrData.data.gridHeadrList[h].gridColumnSortable === 'Y'
    //             ? true
    //             : false,
    //         sort:
    //           typeof gridHeadrData.data.gridHeadrList[h].gridColumnSort ===
    //           'string'
    //             ? gridHeadrData.data.gridHeadrList[
    //                 h
    //               ].gridColumnSort.toLowerCase()
    //             : '',
    //         sortIndex:
    //           gridHeadrData.data.gridHeadrList[h].gridColumnSortindex === 0
    //             ? ''
    //             : '' +
    //               gridHeadrData.data.gridHeadrList[h].gridColumnSortindex,
    //         cellClass:
    //           gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //             'wrdNm' ||
    //           gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //             'wrdEabbrNm' ||
    //           gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //             'wrdEngNm' ||
    //           gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //             'dmnClsNm'
    //             ? 'ag-left-aligned-cell'
    //             : 'grid-cell-centered',
    //         width: gridHeadrData.data.gridHeadrList[h].gridColumnWidth,
    //         cellRenderer:
    //           gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //             'wrdNm' ||
    //           gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //             'dmnClsNm'
    //             ? 'TypeCellRenderer'
    //             : null,
    //         valueFormatter:
    //           gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //             'wrdNm' ||
    //           gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //             'dmnClsNm'
    //             ? (params) => {
    //                 if (
    //                   params.value &&
    //                   Array.isArray(params.value) &&
    //                   params.value.length > 0
    //                 ) {
    //                   return params.value[0].excVal;
    //                 }
    //                 return '';
    //               }
    //             : gridHeadrData.data.gridHeadrList[h].gridColumnField ===
    //               'rvsnDt'
    //             ? (params) => {
    //                 const value = params.value;
    //                 if (value && value.length === 8) {
    //                   return `${value.substring(0, 4)}-${value.substring(
    //                     4,
    //                     6
    //                   )}-${value.substring(6)}`;
    //                 }
    //                 return value;
    //               }
    //             : null,
    //       });
    //     }
    //     columnUserJobWordMngHeadData.value = userJobWordGridHearData;
    //     columnUserJobWordMngFcDefs.value = userJobWordGridHearData;
    //   } else {
    //     columnUserJobWordMngFcDefs.value = columnBscUserJobWordMngFcDefs;
    //   }
    // };

    //getUserJobWordGridHeadrData();

    //사용자 작업 데이터
    const userWorkWordData = reactive([]);

    // 단어 작업목록 조회
    const getWordJobData = async (query) => {
      let wordJobList;

      const wordJobQuery = {
        userId: userId,
        managementInstituteId: useMetaMngInstId,
        query: '', // 있으면 추가
        sort: '', // 있으면 추가
      };

      if (query != null) {
        wordJobList = await getResaerchWordJob(query);
      } else {
        wordJobList = await getResaerchWordJob(wordJobQuery);
      }

      console.log('wordJobList ========================== : ', wordJobList);

      if (wordJobList.status === 409) {
        resultCount.value.total = 0;
        userWorkWordData.value = [];
      }
      //const wordJobList = await getResaerchWordJob(wordJobQuery);

      const jobList = wordJobList.data.cores;
      console.log('wordJobList.data : ', wordJobList.data);
      console.log('jobList : ', jobList);

      const wordJobdData = [];

      for (let i = 0; i < jobList.length; i++) {
        console.log('jobList[i] : ', jobList[i]);
        wordJobdData.push({
          id: i,
          jobWordId: jobList[i].jobWordId,
          userId: jobList[i].userId,
          wordDictionaryId: jobList[i].word.dictionary.id,
          managementInstituteId: jobList[i].managementInstituteId,
          applicationCategory: jobList[i].jobDivisionName,
          wordName: jobList[i].word.name,
          wordEngAbbreviationName: jobList[i].word.abbreviationName,
          domainClassName: [
            {
              id: jobList[i].domainClass.id,
              type: jobList[i].domainClass.dictionary.type.name,
              label: jobList[i].domainClass.name,
              color: jobList[i].domainClass.dictionary.type.fontColor,
              bgColor: jobList[i].domainClass.dictionary.type.backgroundColor,
              size: 55,
            },
          ],
        });
      }
      resultCount.value.total = wordJobList.data.totalCount;

      console.log('wordJobdData : ', wordJobdData);

      userWorkWordData.value = wordJobdData;
    };

    getWordJobData();

    // 체크된 작업 항목
    const wordJobSelected = ref([]);

    // 체크 변경 시 이벤트
    const onSelectionChanged = () => {
      const selectedNodes = gridApi.value.getSelectedNodes();
      wordJobSelected.value = selectedNodes;

      console.log('termJobSelected.value:', wordJobSelected.value);
      console.log('선택된 행:', selectedNodes);
      // 선택된 행에 대한 추가 작업 수행
    };

    const userWorkCodeData = reactive([]);

    const resultCount = ref({
      total: 10,
    });

    const bscUserJobWrkType = reactive([
      { id: 0, label: '신규등록', type: 'C' },
      { id: 1, label: '변경등록', type: 'U' },
      { id: 2, label: '삭제등록', type: 'D' },
    ]);

    const regType = reactive([
      { id: 0, label: '신규등록', type: 'new' },
      { id: 1, label: '변경등록', type: 'modify' },
      { id: 2, label: '삭제등록', type: 'remove' },
      { id: 3, label: '자료조회', type: 'search' },
      { id: 4, label: '작업수정', type: 'modify' },
    ]);

    const onSelectReg = (value) => {
      wordDetailsData.selectType = regType[value];

      // 신규등록 버튼 클릭 시 초기화
      if (wordDetailsData.selectType.id == 0) {
        //resetWordDetailsData();
        wordDetailsData.selectType.type = 'new';
        console.log('단어등록 input 초기화 ===');
        jobState.value = false;
        resetWordDetailsData();
      }

      // 변경등록 시 용어유형, 코드타입 설정
      if (wordDetailsData.selectType.id === 1) {
        jobState.value = false;
        if (wordDetailsData.typeCode === '일반어') {
          wordDetailsData.termType = 'GENERAL';
        } else if (wordDetailsData.typeCode === '분류어') {
          wordDetailsData.typeCode = 'CLASSIFICATION';
        }

        if (wordDetailsData.typeCode === '개별코드') {
          wordDetailsData.typeCode = 'INDIVIDUAL_CODE';
        } else if (wordDetailsData.typeCode === '통합코드') {
          wordDetailsData.typeCode = 'UNITY_CODE';
        }
      }

      // 작업목록 항목 클릭 시
      if (value === 4) {
        jobState.value = false;
        console.log('작업수정');
        wordDetailsData.selectType = { id: 4, label: '', type: 'job' };
        if (wordDetailsData.jobDivisionName === '신규등록') {
          wordDetailsData.selectType.label = wordDetailsData.jobDivisionName;
          wordDetailsData.selectType.type = 'job-new';
          wordDetailsData.jobState = false;
        } else if (wordDetailsData.jobDivisionName === '변경등록') {
          wordDetailsData.selectType.label = wordDetailsData.jobDivisionName;
          wordDetailsData.selectType.type = 'job-modify';
          wordDetailsData.jobState = false;
        } else if (wordDetailsData.jobDivisionName === '삭제등록') {
          wordDetailsData.selectType.label = wordDetailsData.jobDivisionName;
          wordDetailsData.selectType.type = 'job-remove';
          wordDetailsData.jobState = true;
        }
        console.log('wordDetailsData !! : ', wordDetailsData);
      }
    };

    // 단어유형 목록
    const wordTypeOptions = ref([
      { text: '선택', value: '' },
      { text: '일반어', value: 'GENERAL' },
      { text: '분류어', value: 'CLASSIFICATION' },
    ]);

    // 유사어구분 목록
    const similarTypeOptions = ref([
      { text: '선택', value: '' },
      { text: '이음동의어', value: 'SYNONYMS' },
      { text: '금칙어', value: 'FORBIDDEN' },
    ]);

    const selectWordType = ref(wordTypeOptions.value[0].value);

    const wordDetailsData = reactive({
      selectType: { id: 0, label: '신규등록', type: 'new' },
      managementInstituteId: useMetaMngInstId,
      wordDictionaryId: useDctnryId,
      wordName: '',
      abbreviationName: '',
      englishName: '',
      typeCode: '',
      typeName: selectWordType.value,
      explain: '',
      similarYn: false,
      similarDivisionCode: '',
      similarDivisionName: '',
      domainClassName: [
        {
          id: '',
          type: '',
          label: '',
          color: '',
          bgColor: '',
          size: 55,
        },
      ],
      enactContext: '',
      enactCycle: '',
      enactDate: '',
      revisionCycle: '',
      revisionDate: '',
      updater: '',
      updateDateTime: '',
      wordData: [
        {
          id: '',
          type: '',
          label: '',
          color: '',
          bgColor: '',
          size: 55,
        },
      ],
    });

    const emptyWordDetailsData = () => {
      wordDetailsData.selectType = { id: 0, label: '신규등록', type: 'new' };
      wordDetailsData.managementInstituteId = useMetaMngInstId;
      wordDetailsData.wordDictionaryId = useDctnryId;
      wordDetailsData.wordName = '';
      wordDetailsData.abbreviationName = '';
      wordDetailsData.englishName = '';
      wordDetailsData.typeName = '';
      wordDetailsData.explain = '';
      wordDetailsData.similarYn = false;
      wordDetailsData.similarDivisionCode = '';
      wordDetailsData.similarDivisionName = '';
      wordDetailsData.domainClassName[0].id = '';
      wordDetailsData.domainClassName[0].type = '';
      wordDetailsData.domainClassName[0].label = '';
      wordDetailsData.domainClassName[0].color = '';
      wordDetailsData.domainClassName[0].bgColor = '';
      wordDetailsData.enactContext = '';
      wordDetailsData.revisionCycle = '';
      wordDetailsData.revisionDate = '';
      wordDetailsData.updater = '';
      wordDetailsData.updateDateTime = '';
    };

    watch(
      noneDivideWord,
      (newVal) => {
        console.log('noneDivideWord 변경 : ', newVal);

        if (newVal != null || newVal != '') {
          wordDetailsData.wordName = newVal;
        }
      },
      { immediate: true }
    );

    //단어 더블클릭 시 선택한 데이터
    const selectedWordData = inject('selectedWordData');

    console.log('selectedWordData : ', selectedWordData);
    watch(selectedWordData, async (newWordValue, oldWordValue) => {
      // selectedTab1Data의 변화가 있을 경우

      console.log('newWordValue : ', newWordValue);

      // 상단그리드의 조회된 데이터가 없는 경우
      if (newWordValue === null) {
        // 초기ㅎ
        emptyWordDetailsData();
        jobState.value = false;
        return;
      }

      const wordData = newWordValue.data ? newWordValue.data : newWordValue;

      if (newWordValue !== oldWordValue) {
        console.log('selectedTab1Data changed:', newWordValue);
        let wordDetailsQuery = {
          wordDictionaryId: wordData.wordDictionaryId,
          wordName: wordData.wordName[0].label,
          wordAbbreviationName: wordData.wordAbbreviationName,
        };
        const wordDetailsDataInfo = await getWordDetailInfo(wordDetailsQuery);
        apiGetWordBaseInfo(wordDetailsDataInfo);
        onSelectReg(3);
      }

      if (wordData.wordDictionaryId != useDctnryId) {
        jobState.value = true;
      } else {
        jobState.value = false;
      }
    });

    //valueFormatter 함수 설정
    watchEffect(() => {
      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

      // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
      if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD032) {
        return;
      }
      storedMfgrd032ColumnDefs.value = gridColumnDefs.value.MFGRD032;

      storedMfgrd032ColumnDefs.value = storedMfgrd032ColumnDefs.value.map(
        (col) => {
          if (col.field === 'domainClassName') {
            return {
              ...col,
              valueFormatter: (params) => {
                if (
                  params.value &&
                  Array.isArray(params.value) &&
                  params.value.length > 0
                ) {
                  return params.value[0].excVal;
                }
                return '';
              },
              cellRenderer: 'TypeCellRenderer',
              suppressSorting: true,
              comparator: () => 0,
            };
          } else {
            return col;
          }
        }
      );
    });

    //저장
    const saveWordConfirmState = reactive({
      view: false,
      message: '작업 내용을 저장하시겠습니까?',
    });

    const onJobWordSaveConfirm = () => {
      if (wordDetailsData.wordName === '') {
        alertInfos.value.view = true;
        alertInfos.value.message = '단어명을 입력해 주십시오.';
        return;
      }
      if (wordDetailsData.abbreviationName === '') {
        alertInfos.value.view = true;
        alertInfos.value.message = '단어영문약어명을 입력해 주십시오.';
        return;
      }
      if (
        wordDetailsData.typeName === '' ||
        wordDetailsData.typeName === '선택'
      ) {
        alertInfos.value.view = true;
        alertInfos.value.message = '단어유형을 선택해 주십시오.';
        return;
      }
      if (wordDetailsData.revisionDate === '') {
        alertInfos.value.view = true;
        alertInfos.value.message = '제개정일자를 입력해주세요.';
        return;
      }
      saveWordConfirmState.view = true;
    };

    const relationTermState = reactive({
      title: '연관용어 오류메세지',
      view: false,
      type: 'relationColumn',
      message:
        '연관용어가 있어 해당 작업은 실행이 불가능 합니다. <br>작업을 취소하고 연관용어 변경/삭제 처리를 먼저 수행해 주시기 바랍니다.',
    });

    const relationTermList = reactive([]);

    //연관용어
    const relatedTermsWindowView = ref(false);
    const onOpenRelatedTermsWindow = () => {
      relatedTermsWindowView.value = true;
    };
    const onCloseRelatedTermsWindow = () => {
      relatedTermsWindowView.value = false;
    };
    const onRelatedTermsConfirm = () => {
      console.log('연과용어 확인');
      onCloseDomainNameSearchWindow();
    };

    const onUserJobWordSave = async () => {
      const wordDetailsQuery = await wordManagementDataBinding(wordDetailsData);

      const wordRelationColumnQuery = {
        dictionaryId: wordDetailsData.wordDictionaryId,
        wordAbbreviationName: wordDetailsData.abbreviationName,
      };

      // 연관용어 체크
      const relationWordList = await getRelationWordList(
        wordRelationColumnQuery
      );
      relationTermList.value = relationWordList.data;

      console.log('relationWordList : ', relationWordList);

      // 작업목록 항목을 수정하는 경우
      if (jobUpdateYn.value) {
        console.log('작업목록 항목 수정');
        console.log('jobWordDetailsData : ', jobWordDetailsData.value);

        console.log('wordDetailsQuery : ', wordDetailsQuery);

        wordDetailsQuery.userId = userId;
        wordDetailsQuery.userName = userId;
        await getUpdateJobWord(wordDetailsQuery);

        await getWordJobData();
        resetWordDetailsData();
        return;
      }

      if (relationWordList.data.length === 0) {
        // 신규등록
        if (wordDetailsData.selectType.type === 'new') {
          const response = await createNewWord(wordDetailsQuery);
          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
          }
        } else if (wordDetailsData.selectType.type === 'modify') {
          console.log('변경등록 실행 ==');
          const response = await modifyWord(wordDetailsQuery);
          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
          }
        } else if (wordDetailsData.selectType.type === 'remove') {
          console.log('삭제등록 실행 ==');
          const response = await removeWord(wordDetailsQuery);
          if (response.status === 409) {
            setAlertStatus({
              view: true,
              message: '작업등록에 실패했습니다. <br>다시 시도해 주세요.',
            });
          }
        }
        await getWordJobData();
        resetWordDetailsData();
      } else {
        relationTermState.view = true;
        console.log('relationWordList : ', relationWordList);
      }
    };

    //초기화
    const resetConfirmState = reactive({
      view: false,
      message: '작업을 초기화합니다.<br>초기화 하시겠습니까?',
    });
    const onResetConfirm = () => {
      resetConfirmState.view = true;
    };
    const onUserJobReset = () => {
      console.log('초기화 실행');
      resetWordDetailsData();
    };

    //작업 취소
    const cancelConfirmState = reactive({
      view: false,
      message: '작업 내용을 취소합니다.<br>취소하시겠습니까?',
    });
    const onWorkJobCancelConfirm = () => {
      cancelConfirmState.view = true;
    };

    const onWorkJobCancel = async () => {
      const selectedData = agGrid.value.gridApi.getSelectedNodes();

      console.log('취소목록 selectedData : ', selectedData);

      const wordCancelParamData = selectedData.map((selectedItem) => ({
        managementInstituteId: selectedItem.data.managementInstituteId,
        userId: userInfo.value.userId,
        wordDictionaryId: selectedItem.data.wordDictionaryId,
        jobWordId: selectedItem.data.jobWordId,
      }));

      await getCancelWordJob(wordCancelParamData);
      await getWordJobData();
      console.log('selectedData : ', selectedData);
    };

    //작업완료
    const approvalConfirmState = reactive({
      view: false,
      message: '승인신청이 완료되었습니다.',
    });

    const onApprovalConfirm = () => {
      approvalConfirmState.view = true;
    };

    const onWorkJobWordApproval = async () => {
      const selectedData = agGrid.value.gridApi.getSelectedNodes();

      const wordCompleteParamData = selectedData.map((selectedItem) => ({
        managementInstituteId: selectedItem.data.managementInstituteId,
        userId: userInfo.value.userId,
        wordDictionaryId: selectedItem.data.wordDictionaryId,
        jobWordId: selectedItem.data.jobWordId,
      }));
      const response = await getCompleteWordJob(wordCompleteParamData);

      const wordApplyResult = {
        managementType: '단어',
        successCount: response.data.successJob.length,
        failCount: response.data.failedJob.length,
      };

      onApplyResultAlert(wordApplyResult);

      // 실패결과 개수
      emit('wordwork-complete');
      resetWordDetailsData();
      await getWordJobData();
    };

    // 작업완료 결과 값 출력 함수
    const onApplyResultAlert = (result) => {
      const { managementType, successCount, failCount } = result;

      // let applyResultMessage = `<span style="color : #379583;">[ ${managementType} 작업완료 결과 ]</span> <br><br>성공 : ${successCount} 건 <br>실패 : ${failCount} 건`;

      let applyResultMessage = `
          <div style="text-align: center;">
            <p style="font-size: 17px; margin-bottom: 10px;">작업저장이 완료되었습니다.</p>
            <p style="color: #379583; font-weight: bold; margin-bottom: 10px;">[ ${managementType} 작업완료 결과 ]</p>
            <div style="display: flex; justify-content: space-around; margin-top: 10px;">
              <span>성공: <strong style="color: #28a745;">${successCount} 건</strong></span>
              <span>실패: <strong style="color: #dc3545;">${failCount} 건</strong></span>
            </div>
          </div>
          `;

      setAlertStatus({
        view: true,
        message: applyResultMessage,
      });
    };

    // 용어 일괄 업로드(엑셀)
    const wordUploadWindowView = ref(false);
    const wordUploadWindow = () => {
      wordUploadWindowView.value = true;
    };

    const onCloseWordUploadWindow = () => {
      wordUploadWindowView.value = false;
    };
    const onWordUploadSave = async () => {
      await getWordJobData();
      //  emptyTermDetailsData();
    };

    //일괄 영문 약어생성
    const allEngCreateWindowView = ref(false);
    const onOpenAllEngCreateWindow = () => {
      allEngCreateWindowView.value = true;
    };
    const onCloseAllEngCreateWindow = () => {
      allEngCreateWindowView.value = false;
    };
    const onAllEngCreateSave = () => {
      onCloseAllEngCreateWindow();
    };

    //도메인명 검색
    const domainNameSearchWindowView = ref(false);
    const onOpenDomainNameSearchWindow = () => {
      domainNameSearchWindowView.value = true;
    };
    const onCloseDomainNameSearchWindow = () => {
      domainNameSearchWindowView.value = false;
    };
    const onDomainNameSearchSave = (data) => {
      console.log('도메인분류명 검색 data : ', data);

      wordDetailsData.domainClassName[0].id = data.domainClassName[0].id;
      wordDetailsData.domainClassName[0].dictionaryId =
        data.domainClassName.dictionaryId;

      wordDetailsData.domainClassName[0].type = data.domainClassName[0].type;
      wordDetailsData.domainClassName[0].label = data.domainClassName[0].label;
      wordDetailsData.domainClassName[0].color = data.domainClassName[0].color;
      wordDetailsData.domainClassName[0].bgColor =
        data.domainClassName[0].bgColor;

      onCloseDomainNameSearchWindow();
    };

    //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
    function handleColumnStateChanged(newColumnState) {
      console.log('컬럼 이동 핸들러 동작 ====');

      console.log('newColumnState : ', newColumnState);

      //gridApi.value.setGridOption('columnDefs', newColumnState);

      // 새 컬럼 헤드 정의
      const newColumnFcDefs = newColumnState
        .map((colState) => {
          const colDef = storedMfgrd032ColumnDefs.value.find(
            (col) => col.field === colState.colId
          );
          if (!colDef) {
            console.error(
              `No column definition found for colId: ${colState.colId}`
            );
            return null;
          }

          // valueFormatter 및 cellRenderer 초기화
          let valueFormatter = null;
          let cellRenderer = null;

          // 필드 값에 따라 조건부로 valueFormatter 및 cellRenderer 설정
          if (colDef.field === 'domainClassName') {
            valueFormatter = (params) => {
              if (
                params.value &&
                Array.isArray(params.value) &&
                params.value.length > 0
              ) {
                return params.value[0].excVal;
              }
              return '';
            };
            cellRenderer = 'TypeCellRenderer'; // 여기서 cellRenderer 설정
          } else if (colDef.field === 'applicationCategory') {
            valueFormatter = (params) => {
              const value = params.value;
              if (value && value.length === 8) {
                return `${value.substring(0, 4)}-${value.substring(
                  4,
                  6
                )}-${value.substring(6)}`;
              }
              return value;
            };
            cellRenderer = 'RegTypeCellRenderer';
          }

          return {
            ...colDef,
            width: colState.width,
            minWidth: colState.minWidth,
            hide: colState.hide,
            pinned: colState.pinned,
            sort: colState.sort,
            sortIndex: colState.sortIndex,
            suppressSorting: true,
            comparator: () => 0,
            valueFormatter: valueFormatter,
            cellRenderer:
              colDef.field === 'domainClassName' ||
              colDef.field === 'applicationCategory'
                ? cellRenderer
                : null,
            headerCheckboxSelection: colDef.field === 'checkbox' ? true : false,
            checkboxSelection: colDef.field === 'checkbox' ? true : false,
          };
        })
        .filter((colDef) => colDef != null);

      //columnFcDefs.value = newColumnFcDefs; */

      console.log('newColumnFcDefs : ', newColumnFcDefs);

      gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

      //newColumnDefs.value = newColumnFcDefs;

      storedMfgrd032ColumnDefs.value = newColumnFcDefs;

      // localStorage에 에서 gridData json 파싱, MFGRD017에 대한 값 변경
      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage.MFGRD032 = newColumnFcDefs;
      // 로컬스토레지에 저장
      saveGridInfoToStorage(gridStorage);
      // 스토어에 저장
      uiStore.setGridColumnDefs('MFGRD032', newColumnFcDefs);
    }

    const sortStateQuery = ref('');

    // 정렬 핸들러
    const handleSortChanged = async (newSortedState) => {
      console.log('newSortedState : ', newSortedState);
      const sortQuery = ref('');
      const sortState = reactive({});

      //sortState.value = newSortedState;

      // newSortedState를 sortIndex를 기준으로 오름차순 정렬
      sortState.value = newSortedState
        .filter((state) => state.sort !== null) // sort가 null이 아닌 항목만 선택
        .sort((a, b) => {
          // sortIndex가 없는 경우 맨 뒤로 보냄
          if (a.sortIndex === undefined && b.sortIndex === undefined) return 0;
          if (a.sortIndex === undefined) return 1;
          if (b.sortIndex === undefined) return -1;
          // sortIndex를 기준으로 오름차순 정렬
          return a.sortIndex - b.sortIndex;
        });

      const lastItem =
        userWorkWordData.value.length > 0
          ? userWorkWordData.value[userWorkWordData.value.length - 1]
          : null;
      console.log('lastItem ===', lastItem);

      console.log('sortState :', sortState);

      // sort의 결과가 초기화 상태일 때,
      if (sortState.value.length == 0) {
        const researchQuery = {
          userId: userInfo.value.userId,
          managementInstituteId: useMetaMngInstId,
          termDictionaryId: useDctnryId,
          query: wordJobQuery.query,
        };
        sortStateQuery.value = '';

        await getWordJobData(researchQuery);
        //userWorkWordData.value = termJobData;
      } else {
        const sortParts = sortState.value.map(
          (column) => `${column.headerName} ${column.sort}`
        );
        sortQuery.value = sortParts.join(', ');
        sortStateQuery.value = sortQuery.value;

        console.log('sortQuery.value: ', sortQuery.value);
        console.log('sortStateQuery.value: ', sortStateQuery.value);

        const researchQuery = {
          userId: userInfo.value.userId,
          managementInstituteId: useMetaMngInstId,
          query: wordJobQuery.query,
          termDictionaryId: useDctnryId,
          sort: sortQuery.value,
        };

        await getWordJobData(researchQuery);
      }
    };

    const onFilterWindowClosed = async (filterSet) => {
      // 필터 창이 닫힐 때 수행하고 싶은 로직
      console.log('필터 창이 닫혔습니다.');
      console.log('filterSet : ', filterSet);

      // 맞춤형 필터 설정이 있을 때
      if (filterSet) {
        console.log(
          'storedMfgrd032ColumnDefs.value : ',
          storedMfgrd032ColumnDefs.value
        );

        // 필터 설정에 따른 정렬 및 필터 쿼리 설정
        const sortQuery = getSortQuery();

        // sortQuery 유무에 따른 정렬 및 필터 쿼리 설정
        let filterSortQuery;
        if (sortQuery != '') {
          filterSortQuery =
            filterSet.orderQuery != ''
              ? `${sortQuery}, ${filterSet.orderQuery}`
              : sortQuery;
        } else {
          filterSortQuery = filterSet.orderQuery;
        }

        const termJobFilterQuery = {
          userId: userInfo.value.userId,
          managementInstituteId: useMetaMngInstId,
          termDictionaryId: useDctnryId,
          query: filterSet.searchQuery,
          sort: filterSortQuery,
        };

        wordJobQuery.query = filterSet.searchQuery;
        const termJobFilterData = await getWordJobData(termJobFilterQuery);
        // const filterSearchData = getTermRowData(termFilterData);
        // const filterSearchData = jobTermSearchResultBinding(
        //   termJobFilterData.data
        // );
        console.log('filterSet.searchQuery : ', filterSet.searchQuery);

        // workSearchData.value = filterSearchData;
      } else {
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage.MFGRD032 : ', gridStorage.MFGRD032);
        storedMfgrd032ColumnDefs.value = gridStorage.MFGRD032;

        gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD032);
      }
    };

    // 필터 초기화 confirm 팝업
    const resetFilterState = reactive({
      view: false,
      message:
        '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
    });

    const onResetFilter = () => {
      resetFilterState.view = true;
    };

    // 필터 및 정렬 삭제
    const onSearchRemove = async () => {
      console.log('onSearchRemove');
      console.log('정렬 초기화');

      const gridResponse = await fetch('/sampledata/gridDefaultData.json');

      const gridDefaultData = await gridResponse.json();

      console.log('초기 데이터 gridDefaultData : ', gridDefaultData);
      console.log(
        '초기 데이터 gridDefaultData : ',
        gridDefaultData[wordJobGridId.value]
      );
      storedMfgrd032ColumnDefs.value = gridDefaultData[wordJobGridId.value];

      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage[wordJobGridId.value] = gridDefaultData[wordJobGridId.value];
      saveGridInfoToStorage(gridStorage);

      console.log(
        'storedMfgrd032ColumnDefs.value : ',
        storedMfgrd032ColumnDefs.value
      );
      uiStore.setGridColumnDefs('MFGRD032', storedMfgrd032ColumnDefs.value);
      gridApi.value.setGridOption('columnDefs', storedMfgrd032ColumnDefs.value);

      wordJobQuery.query = '';

      await getWordJobData();
    };

    onActivated(async () => {
      console.log('단어등록 - onActivated');
      await getWordJobData();
    });

    // 정렬(소팅) 정보 반환 함수
    const getSortQuery = () => {
      const sortedColumns = storedMfgrd032ColumnDefs.value
        .filter((col) => col.sort && col.sortIndex !== undefined)
        .sort((a, b) => a.sortIndex - b.sortIndex);

      const sortQuery =
        sortedColumns.length > 0
          ? sortedColumns
              .map((col) => `${col.headerName} ${col.sort}`)
              .join(', ')
          : '';

      return sortQuery;
    };

    return {
      agGrid,
      gridApi,
      onGridReady,
      userWorkWordData,
      userWorkCodeData,
      resultCount,
      saveWordConfirmState,
      onJobWordSaveConfirm,
      onUserJobWordSave,
      resetConfirmState,
      onResetConfirm,
      onUserJobReset,
      cancelConfirmState,
      onWorkJobCancelConfirm,
      onWorkJobCancel,
      approvalConfirmState,
      onApprovalConfirm,
      onWorkJobWordApproval,
      allEngCreateWindowView,
      onOpenAllEngCreateWindow,
      onCloseAllEngCreateWindow,
      onAllEngCreateSave,
      domainNameSearchWindowView,
      onOpenDomainNameSearchWindow,
      onCloseDomainNameSearchWindow,
      onDomainNameSearchSave,
      relatedTermsWindowView,
      onCloseRelatedTermsWindow,
      onRelatedTermsConfirm,
      wordTypeOptions,
      wordMngGridId,
      columnUserJobWordMngFcDefs,
      columnUserJobWordMngHeadData,
      gridUserJobWordDefs,
      storedMfgrd032ColumnDefs, // 단어 그리드 헤더
      wordDetailsData, // 단어작업 기본 포맷
      regType, // 작업구분
      similarTypeOptions, // 유사어구분 목록
      selectWordType, // 선택 단어유형
      resetWordDetailsData, // 단어등록 초기화
      getWordJobData, // 작업목록 조회
      handleColumnStateChanged, // 그리드 컬럼 이동 및 사이즈 변경
      wordJobQuery,
      gridInfoDefs,
      wordUploadWindowView,
      useMetaMngInstId,
      userId,
      wordUploadWindow,
      onCloseWordUploadWindow,
      onWordUploadSave,
      onSelectReg,
      handleSortChanged,
      sortStateQuery,
      sortQuery,
      onFilterWindowClosed,
      onResetFilter,
      onSearchRemove,
      relationTermState, // 연관용어 팝업 상태
      onOpenRelatedTermsWindow, // 연관용어 목록 열기
      relationTermList, //연관용어목록
      resetFilterState,
      updateDateTime,
      onSelectionChanged, // 체크박스 선택 시 이벤트
      wordJobSelected,
      jobUpdateYn,
      jobWordDetailsData,
      jobState,
    };
  },
};
