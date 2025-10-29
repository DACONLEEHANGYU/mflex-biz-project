import {
  reactive,
  ref,
  onMounted,
  watchEffect,
  nextTick,
  inject,
  watch,
} from 'vue';
import { useUiStore } from '@/stores/ui';
import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
import GridSearch from '@/components/grid/GridSearch.vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { saveGridInfoToStorage, getGridInfoFromStorage } from '@/utils/cookies';
import { getResaerchTerm } from '@/utils/mflexApi/dictionarySearchApi';

export default {
  components: {
    TypeCellRenderer,
    GridSearch,
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
      const selectedRow = document.querySelectorAll(
        '[class~="ag-row-selected"]'
      );
      // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
      selectedRow.forEach((node) => {
        node.classList.remove('ag-row-selected');
      });

      const clickNode = value.id;
      const clickedNode = document.querySelector(`[row-id="${clickNode}"]`);
      clickedNode.classList.add('ag-row-selected');

      // const focusCell = document.querySelectorAll(
      //   '.term-job-grid [class~="ag-cell-focus"]'
      // );
      // // 선택된 모든 요소에서 ag-row-focus 클래스를 제거합니다.
      // focusCell.forEach((node) => {
      //   node.classList.remove('ag-cell-focus');
      // });

      this.termJobSelected = false;
      this.$emit('row-selected', value);
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

      const researchQuery = {
        dictionaryId: this.useDctnryId,
        query: transformedQuery,
        sort: this.getSortQuery(),
      };

      this.termQuery.query = transformedQuery;

      console.log('termQuery.query ========', this.termQuery.query);
      this.rowData.value = [];

      let termResearchResult = await getResaerchTerm(researchQuery);
      this.serarchDataBinding(termResearchResult);
    },
  },
  beforeMount() {
    this.context = { componentParent: this };
  },

  emits: ['first-row-selected', 'row-selected', 'open-filter-window'],
  setup(props, { emit }) {
    const uiStore = useUiStore();
    const { gridColumnDefs } = storeToRefs(uiStore);
    const authStore = useAuthStore();
    const { userInfo, userStngInfo } = storeToRefs(authStore);
    const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
      userStngInfo.value;

    const agGrid = ref(null);
    const gridApi = ref(null);

    // gridApi 사용 handler
    const handleSetGridApi = (params) => {
      gridApi.value = params;
      console.log('gridApi.value : ', gridApi.value);
    };

    const rowData = reactive({});

    // 현재 인덱스
    const currentRowIndex = ref(0);
    // gridRefresh 상태
    const gridRefreshState = inject('gridRefresh');

    // termJobSelected 상태
    const termJobSelected = inject('term-job-selected');

    //정렬 변경 여부
    const sortStateQuery = ref('');

    // GRID ID
    const tab1GridId = ref('MFGRD040');
    const gridInfoDefs = ref({
      scrnGridId: tab1GridId,
      scrnId: '',
    });

    const initializeGridColumnDefs = () => {
      const termStoredColumnDefs = JSON.parse(getGridInfoFromStorage());
      if (termStoredColumnDefs && termStoredColumnDefs.MFGRD040) {
        uiStore.setGridColumnDefs('MFGRD040', termStoredColumnDefs.MFGRD040);
      }
    };

    initializeGridColumnDefs();

    // MFGRD007 : 용어 그리드 데이터
    const termGridColumnDefs = ref([]);
    // 용어 그리드 데이터 할당
    termGridColumnDefs.value = gridColumnDefs.value.MFGRD040;
    console.log('termGridColumnDefs', termGridColumnDefs.value);

    const resultCount = ref({
      count: 10,
      total: 20,
    });

    // 전역 TermQuery
    const termQuery = reactive({
      dictionaryId: useDctnryId,
      domainName: '',
      termName: '',
      termAbbreviationName: '',
      termDictionaryId: '',
      query: '',
      sort: '',
    });

    // 용어 그리드 데이터 조회 및 바인딩
    const updateGridData = async (termQuery) => {
      console.log('updateGridData  실행');

      // termQuery가 전달되는 경우
      if (termQuery != null) {
        const getTermSearchResult = await getResaerchTerm(termQuery);
        // 데이터 바인딩
        serarchDataBinding(getTermSearchResult);
        return;
      } else {
        const sortQuery = getSortQuery();
        const termResearchQuery = {
          dictionaryId: useDctnryId,
          query: '',
          sort: sortQuery,
        };

        console.log('updateGridData 실행여부 확인 ======================');
        const getTermSearchResult = await getResaerchTerm(termResearchQuery);
        // 데이터 바인딩
        serarchDataBinding(getTermSearchResult);
      }
    };

    //valueFormatter 함수 설정
    // 컬럼이 변경되면 JSON파일에서 읽어온 컬럼 정보에 그리드 설정에 맞게 컬럼 정보 재생성
    /*
      watchEffect >  cellRender 서버에서 가져오는 정보가 아니기 때문에 클라이언트에서 설정해줘야함. 
      추후 전달받은 그리드 정보로 판별하여 cellRender 할당 필요
    */
    watchEffect(async () => {
      console.log('columnDefs 변경 감지');
      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

      // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
      if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD040) {
        return;
      }
      termGridColumnDefs.value = gridColumnDefs.value.MFGRD040;

      console.log(
        'watchEffect - Grid 데이터 설정 전 : ',
        gridColumnDefs.value.MFGRD040
      );

      termGridColumnDefs.value = termGridColumnDefs.value.map((col) => {
        let valueFormatter = null;
        let cellRenderer = null;
        // 필드 값에 따라 조건부로 valueFormatter 설정
        if (
          col.field === 'termName' ||
          col.field === 'domainName' ||
          col.field === 'relatedCodeName'
        ) {
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
          cellRenderer = 'TypeCellRenderer';
        }

        return {
          headerName: col.headerName,
          field: col.field,
          hide: col.hide,
          pinned: col.pinned,
          sortable: col.sortable,
          cellClass: col.cellClass,
          width: col.width,
          sort: col.sort,
          sortIndex: col.sortIndex,
          minWidth: col.minWidth,
          suppressSorting: true,
          comparator: () => 0,
          valueFormatter: valueFormatter,
          cellRenderer: cellRenderer,
        };
      });

      console.log(
        'watchEffect - Grid 데이터 설정 후 : ',
        termGridColumnDefs.value
      );

      // 용어작업 완료 시 그리드 업데이트
      if (gridRefreshState.value == true) {
        console.log('grid refresh =======');
        rowData.value = [];

        // 검색 쿼리 초기화
        termQuery.query = '';
        // 데이터 조회 및 바인딩
        await updateGridData();
        gridRefreshState.value = false;
      }

      console.log('watchEffect 정상동작');
    });

    // 용어 그리드 데이터 추가 함수
    const addGridRowData = async (termResearchQuery) => {
      try {
        // 추가 조회 전 데이터 저장
        let oldGridData = rowData.value;

        const lastRowIndex = oldGridData.length - 1;
        const lastRowNode =
          agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
        console.log('마지막 node ===========', lastRowNode);

        const lastItem =
          rowData.value.length > 0
            ? rowData.value[rowData.value.length - 1]
            : null;

        termQuery.dictionaryId = useDctnryId;
        termQuery.domainName = lastItem.domainName[0].label;
        termQuery.termName = lastItem.termName[0].label;
        termQuery.termAbbreviationName = lastItem.termEngAbbreviationName;
        termQuery.termDictionaryId = lastItem.dctnryId;

        console.log('termResearchQuery ===', termResearchQuery);

        const reLoadTermData = await getResaerchTerm(termResearchQuery);

        const terms = reLoadTermData.data.terms;

        const newGridData = [];

        for (let n = 0; n < terms.length; n++) {
          newGridData.push({
            id: oldGridData.length + n,
            metaMngInstId: userStngInfo.value.useMetaMngInstId,
            dctnryId: terms[n].term.dictionary.id,
            no: oldGridData.length + n + 1,
            termName: [
              {
                id: 0,
                type: terms[n].term.dictionary.type.name,
                label: terms[n].term.name,
                color: terms[n].term.dictionary.type.fontColor,
                bgColor: terms[n].term.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            termEngAbbreviationName: terms[n].term.abbreviationName,
            termEngName: terms[n].term.englishName,
            termType: terms[n].term.typeName,
            domainName: [
              {
                id: 0,
                type: terms[n].domain.dictionary.type.name,
                label: terms[n].domain.name,
                color: terms[n].domain.dictionary.type.fontColor,
                bgColor: terms[n].domain.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            codeTypeName: terms[n].codeTypeName,
            relatedCodeName: [
              {
                id: 0,
                type: terms[n].relationCode.type.name,
                label: terms[n].relationCode.name,
                color: terms[n].relationCode.type.fontColor,
                bgColor: terms[n].relationCode.type.backgroundColor,
                size: 60,
              },
            ],
            revisionInfo:
              terms[n].revisionCycle === ''
                ? terms[n].revisionDate
                : `${terms[n].revisionDate}(${terms[n].revisionCycle})`,
            lastChangeInfo: terms[n].updater,
            lastChangeDate: terms[n].updateDateTime,
          });
        }

        // 재조회 후 rowData에 할당.
        rowData.value = [...oldGridData, ...newGridData];

        resultCount.value.count = Number(rowData.value.length);

        const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
        console.log(
          'lastVisibleRowIndex =================',
          lastVisibleRowIndex
        );
        currentRowIndex.value = lastVisibleRowIndex;
        // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
        agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
      } catch (error) {
        console.error(error);
      }
    };

    // 용어 조회 및 바인딩 ( 필터 리서치 )
    const serarchDataBinding = (termResearchResultData) => {
      console.log(
        '[serarchDataBinding] termResearchResultData : ',
        termResearchResultData
      );

      if (termResearchResultData.status != 200) {
        resultCount.value.count = 0;
        resultCount.value.total = 0;

        rowData.value = [];
        emit('row-selected', null);
        return;
      }

      const termSearchGridData = [];
      const terms = termResearchResultData.data.terms;
      resultCount.value.count = Number(termResearchResultData.data.searchCount);
      resultCount.value.total = Number(termResearchResultData.data.totalCount);

      for (let t = 0; t < terms.length; t++) {
        termSearchGridData.push({
          id: t,
          metaMngInstId: userStngInfo.value.useMetaMngInstId,
          dctnryId: terms[t].term.dictionary.id,
          no: t + 1,
          termName: [
            {
              id: 0,
              type: terms[t].term.dictionary.type.name,
              label: terms[t].term.name,
              color: terms[t].term.dictionary.type.fontColor,
              bgColor: terms[t].term.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          termEngAbbreviationName: terms[t].term.abbreviationName,
          termEngName: terms[t].term.englishName,
          termType: terms[t].term.typeName,
          domainName: [
            {
              id: 0,
              type: terms[t].domain.dictionary.type.name,
              label: terms[t].domain.name,
              color: terms[t].domain.dictionary.type.fontColor,
              bgColor: terms[t].domain.dictionary.type.backgroundColor,
              size: 60,
            },
          ],
          codeTypeName: terms[t].codeTypeName,
          relatedCodeName: [
            {
              id: 0,
              type: terms[t].relationCode.type.name,
              label: terms[t].relationCode.name,
              color: terms[t].relationCode.type.fontColor,
              bgColor: terms[t].relationCode.type.backgroundColor,
              size: 60,
            },
          ],
          revisionInfo:
            terms[t].revisionCycle === ''
              ? terms[t].revisionDate
              : `${terms[t].revisionDate}(${terms[t].revisionCycle})`,
          lastChangeInfo: terms[t].updater,
          lastChangeDate: terms[t].updateDateTime,
        });
      }

      rowData.value = termSearchGridData;

      if (rowData.value.length > 0) {
        nextTick(() => {
          const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

          // 첫 행 select 효과
          const nodesWithRowId0 = document.querySelector('[row-id="0"]');

          // .ag-row-selected 클래스를 추가합니다.
          nodesWithRowId0.classList.add('ag-row-selected');
          nodesWithRowId0.classList.add('ag-row-focus');
          nodesWithRowId0.setAttribute('aria-selected', true);
          if (firstRowData) {
            // 사전등록 최초 신규등록 상태 이므로 emit 주석
            console.log('firstRowData : ', firstRowData);
            emit('row-selected', firstRowData);
          }
        });
      }
    };

    // 필터 종료 시 이벤트
    const onFilterWindowClosed = async (filterSet) => {
      // 필터 창이 닫힐 때 수행하고 싶은 로직
      console.log('필터 창이 닫혔습니다.');
      console.log('filterSet : ', filterSet);

      // 맞춤형 필터 설정이 있을 때
      if (filterSet) {
        // 정렬이 적용된 모든 열을 찾습니다.
        const sortedColumns = termGridColumnDefs.value
          .filter((col) => col.sortIndex !== null && col.sort !== null)
          .sort((a, b) => a.sortIndex - b.sortIndex)
          .map(
            (col) => `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
          );

        const sortQuery = sortedColumns.join(', ');

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

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: filterSet.searchQuery,
          sort: filterSortQuery,
        };

        const termFilterData = await getResaerchTerm(researchQuery);
        serarchDataBinding(termFilterData);

        termQuery.query = filterSet.searchQuery;
      } else {
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage.MFGRD040 : ', gridStorage.MFGRD040);
        termGridColumnDefs.value = gridStorage.MFGRD040;

        gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD040);
      }
    };

    // 필터 초기화 confirm 팝업
    const confirmDeleteDctnrySrchTab2State = reactive({
      view: false,
      message:
        '그리드 설정 정보를 <strong style="color:red">삭제</strong> 하시겠습니까?',
    });

    const onDeleteDctnrySrchWrdGridUserStng = () => {
      confirmDeleteDctnrySrchTab2State.view = true;
    };

    // 필터 및 정렬 삭제
    const onSearchRemove = async () => {
      console.log('정렬 초기화');

      // 초기 그리드 설정 조회
      const gridResponse = await fetch('/sampledata/gridDefaultData.json');

      const gridDefaultData = await gridResponse.json();

      console.log('초기 데이터 gridDefaultData : ', gridDefaultData);
      console.log(
        '초기 데이터 gridDefaultData : ',
        gridDefaultData[tab1GridId.value]
      );
      termGridColumnDefs.value = gridDefaultData[tab1GridId.value];

      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage[tab1GridId.value] = gridDefaultData[tab1GridId.value];
      saveGridInfoToStorage(gridStorage);

      uiStore.setGridColumnDefs('MFGRD040', termGridColumnDefs.value);
      gridApi.value.setGridOption('columnDefs', termGridColumnDefs.value);

      termQuery.query = '';
      updateGridData(termQuery);
    };

    // 상단 row 선택
    const firstRowSelectedEvent = () => {
      if (rowData.value.length > 0) {
        nextTick(() => {
          const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
          console.log('firstRowData =============', firstRowData);

          // 첫 행 select 효과
          const nodesWithRowId0 = document.querySelector('[row-id="0"]');
          console.log('nodeWithRowId0 ========', nodesWithRowId0);

          // .ag-row-selected 클래스를 추가합니다.
          if (nodesWithRowId0) {
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          }
        });
      }
    };

    // 그리드 스크롤 이벤트 함수
    const handleScrollChanged = (endScrollStaus) => {
      try {
        if (endScrollStaus === 'Y' && rowData.value != null) {
          const lastItem =
            rowData.value.length > 0
              ? rowData.value[rowData.value.length - 1]
              : null;
          console.log('lastItem ===', lastItem);

          const termResearchQuery = {
            dictionaryId: useDctnryId,
            lastItem: {
              termName: lastItem.termName[0].label,
              termAbbreviationName: lastItem.termEngAbbreviationName,
              termTypeName: lastItem.termType,
              domainName: lastItem.domainName[0].label,
              codeTypeName: lastItem.codeTypeName,
              relationCodeName: lastItem.relatedCodeName[0].label,
              revisionDate: lastItem.revisionDate,
              updater: lastItem.lastChangeInfo,
              updateDateTime: lastItem.lastChangeDate,
              termDictionaryId: lastItem.dctnryId,
            },
            query: termQuery.query,
            sort: sortStateQuery.value,
          };

          addGridRowData(termResearchQuery);
        }
      } catch (error) {
        console.log('lastItem x 에러 발생 ==');
        console.error(error);
      }
    };

    //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
    function handleColumnStateChanged(newColumnState) {
      console.log('컬럼 이동 핸들러 동작 ====');

      console.log('newColumnState : ', newColumnState);

      // 새 컬럼 헤드 정의
      const newColumnFcDefs = newColumnState
        .map((colState) => {
          const colDef = termGridColumnDefs.value.find(
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
          if (
            colDef.field === 'termName' ||
            colDef.field === 'domainName' ||
            colDef.field === 'relatedCodeName'
          ) {
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
              colDef.field === 'termName' ||
              colDef.field === 'domainName' ||
              colDef.field === 'relatedCodeName'
                ? cellRenderer
                : null,
          };
        })
        .filter((colDef) => colDef != null);

      //columnFcDefs.value = newColumnFcDefs; */

      console.log('newColumnFcDefs : ', newColumnFcDefs);

      gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

      termGridColumnDefs.value = newColumnFcDefs;

      // localStorage에 에서 gridData json 파싱, MFGRD040에 대한 값 변경
      const gridStorage = JSON.parse(getGridInfoFromStorage());
      gridStorage.MFGRD040 = newColumnFcDefs;
      // 로컬스토레지에 저장
      saveGridInfoToStorage(gridStorage);
      // 스토어에 저장
      uiStore.setGridColumnDefs('MFGRD040', newColumnFcDefs);
    }

    // 정렬 핸들러
    const handleSortChanged = async (newSortedState) => {
      console.log('newSortedState : ', newSortedState);
      const sortQuery = ref('');
      const sortState = reactive({});

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
        rowData.value.length > 0
          ? rowData.value[rowData.value.length - 1]
          : null;
      console.log('lastItem ===', lastItem);

      // sort의 결과가 초기화 상태일 때,
      if (sortState.value.length == 0) {
        const researchQuery = {
          dictionaryId: useDctnryId,
          query: termQuery.query,
        };

        const termSortData = await getResaerchTerm(researchQuery);

        serarchDataBinding(termSortData);
      } else {
        const sortParts = sortState.value.map(
          (column) => `${column.headerName} ${column.sort}`
        );
        sortQuery.value = sortParts.join(', ');
        sortStateQuery.value = sortQuery.value;

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: termQuery.query,
          sort: sortQuery.value,
        };

        const termSortData = await getResaerchTerm(researchQuery);
        console.log('termSortData : ', termSortData);

        serarchDataBinding(termSortData);
      }

      firstRowSelectedEvent();
    };

    onMounted(() => {
      console.log('onMounted ========================');
      updateGridData(termQuery);
      //initializeGridColumnDefs();
    });

    // 정렬(소팅) 정보 문자열을 반환하는 함수
    const getSortQuery = () => {
      // 정렬이 적용된 모든 열을 찾습니다.
      const sortedColumns = termGridColumnDefs.value
        .filter((col) => col.sort && col.sortIndex !== undefined)
        .sort((a, b) => a.sortIndex - b.sortIndex);

      console.log('sortedColumns : ', sortedColumns);

      // 정렬 쿼리 문자열을 생성합니다.
      const sortQuery =
        sortedColumns.length > 0
          ? sortedColumns
              .map((col) => `${col.headerName} ${col.sort}`)
              .join(', ')
          : '';

      return sortQuery;
    };

    // 작업 그리드 선택 감시
    watch(termJobSelected, (value) => {
      console.log('termJobSelected : ', value);

      if (value == true) {
        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });
      }
    });

    return {
      agGrid,
      rowData,
      termGridColumnDefs,
      resultCount,
      serarchDataBinding,
      handleScrollChanged, // 그리드 스크롤 핸들러
      handleSortChanged,
      handleColumnStateChanged,
      handleSetGridApi,
      termQuery,
      useDctnryId,
      onFilterWindowClosed,
      onDeleteDctnrySrchWrdGridUserStng,
      confirmDeleteDctnrySrchTab2State,
      onSearchRemove,
      gridInfoDefs,
      getSortQuery,
      termJobSelected,
    };
  },
};
