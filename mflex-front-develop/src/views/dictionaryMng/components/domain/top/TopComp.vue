<template>
  <div class="tab-inner">
    <div class="col col-2">
      <div class="tree-wrap" style="flex: 0 0 20%">
        <div class="tree-box__absolute">
          <AppTree
            ref="appTree"
            v-model="treeData"
            :roots="treeRoots"
            :drag="false"
            @selectNode="onSelectNode"
          />
        </div>
      </div>
      <div class="grid-wrap">
        <div class="grid-top">
          <div class="top-row">
            <GridSearch
              :resultCount="resultCount"
              :columnFcDefs="columnDefs"
              :gridDefs="gridInfoDefs"
              :modelValue="searchInput"
              :gridName="gridName"
              :isDictionayMngGrid="true"
              @search-type="handleChangeSearchType"
              @open-chatbot-window="onOpenChatbotWindow"
              @enter="onGridSearchClicked"
              @save="onSaveGridSettingWindow"
              @setup="onSearchSetup"
              @remove="onDeleteDctnrySrchWrdGridUserStng"
              @column-state-changed="handleColumnStateChanged"
              @filter-window-closed="onFilterWindowClosed"
              @gridApi="handleSetGridApi"
              @excel-download="handleExcelDownload"
            />
          </div>
        </div>
        <div class="grid-list grid-right">
          <AppGrid
            :rowData="rowData"
            :columnDefs="columnDefs"
            :context="context"
            rowSelection="single"
            @rowDoubleClicked="onRowDoubleClicked"
            @rowClicked="onRowClicked"
            @body-scroll="handleScrollChanged"
            @sort-changed="handleSortChanged"
            @column-state-changed="handleColumnStateChanged"
            @gridApi="handleSetGridApi"
            ref="agGrid"
          />
        </div>
        <!-- <div class="grid-bottom"></div> -->
        <AppDialog
          v-model:view="confirmDeleteDctnrySrchTab2State.view"
          :title="confirmDeleteDctnrySrchTab2State.title"
          :message="confirmDeleteDctnrySrchTab2State.message"
          @confirm="onSearchRemove"
        />
        <AppDialog
          v-model:view="saveGridSettingView.view"
          :title="saveGridSettingView.title"
          :message="saveGridSettingView.message"
          @confirm="onSetUserGridSetting"
        />
      </div>
    </div>
  </div>

  <AppWindow
    :view="chatbotWindowView"
    @close="onCloseChatbotWindow"
    :moveState="true"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="domainSearchGridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    reactive,
    ref,
    onMounted,
    nextTick,
    watch,
    watchEffect,
    onBeforeMount,
  } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import TermJobTypeCellrenderer from '@/utils/TermJobTypeCellrenderer.js';
  import AppTree from '@/components/ui/AppTree.vue';
  import { basicWhereQueryCheck } from '@/utils/utils.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';
  import {
    getDomainTreeListV2,
    getConstructDomainTreeV2,
    getDomainListV2,
    getDomainDetailsV2,
    getMngDomainDownload,
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';

  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
      AppTree,
      AppWindow,
      ChatbotWindow,
      TermJobTypeCellrenderer,
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
        //상위로 전다
        //this.$emit('row-double-clicked', value);
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
        this.selectedDomainData = value;

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
        this.$emit('row-selected', value);

        if (value.domainSourceCode === 'MNG') {
          this.setSelectDomainMngData(null);
          this.setSelectDomainMngData(value);
        } else {
          this.setDomainJobData(null);
          this.setDomainJobData(value);
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    mounted() {
      console.log('마운트================================마운트');
      this.selectFirstNode();
      this.selectGridFirstNode();
    },
    emits: [
      'first-row-selected',
      'row-selected',
      'open-filter-window',
      'change-job-type',
      'select-domain-tree',
    ],
    setup(props, { emit }) {
      const uiStore = useUiStore();
      const { gridColumnDefs } = storeToRefs(uiStore);

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      // 사전ID
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const dictionaryMngStore = useDictionaryMngStore();
      const {
        isDomainJobApproval,
        isDomainJobType,
        isDomainJobVisible,
        isDomainJobCancel,
        selectDomainData,
      } = storeToRefs(dictionaryMngStore);

      const {
        setDomainTreeData,
        setDomainJobData,
        setSelectDomainMngData,
        setIsDomainJobType,
        setIsDomainJobApproval,
        setIsDomainJobCancel,
        getSelectDomainMngData,
      } = dictionaryMngStore;

      const appTree = ref(null);

      const focusRootNode = () => {
        appTree.value.focusRoot();
      };

      const rowData = reactive({});

      const gridName = '도메인';

      const domainSearchGridId = ref('MFGRD042');
      const gridInfoDefs = ref({
        scrnGridId: domainSearchGridId,
        scrnId: '',
      });

      const columnDefs = ref([]);

      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          DCTNRY_ID: 'dictionaryId',
          NO: 'no',
          DMN_NM: 'domainName',
          DMN_GRP_NM: 'domainGroupName',
          DMN_CLS_NM: 'domainClassName',
          CD_TYPE_NM: 'codeTypeName',
          DATA_PRM_VL: 'dataPermissionValue',
          REL_CD_NM: 'associatedCodeName',
          REVISION_INFO: 'revisionInfo',
          RVSN_DT: 'revisionDate',
          UPDR_INFO: 'updater',
          UPD_DTM: 'updateDateTime',
        };

        const specialConfig = {
          domainName: {
            cellRenderer: 'TermJobTypeCellRenderer',
            valueFormatter: '(params) => params.value',
          },
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();
          const config = specialConfig[fieldName] || {};

          return {
            cellClass:
              fieldName === 'no' ||
              fieldName === 'codeTypeName' ||
              fieldName === 'updater' ||
              fieldName === 'updateDateTime' ||
              fieldName === 'revisionDate'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            cellRenderer: config.cellRenderer || null,
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: fieldName === 'termEngName' ? true : !item.articleDisplayYn,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            sortable: item.articleDataSortYn,
            suppressSorting: !item.articleDataSortYn,
            valueFormatter:
              config.valueFormatter !== undefined
                ? config.valueFormatter
                : null,
            width: item.articleColumnWidth,
            cellStyle: (params) => {
              // 조건에 따라 취소선 적용
              if (params.data.domainName.jobDivisionCode === 'D') {
                return { textDecoration: 'line-through', color: 'red' };
              } else if (params.data.domainName.jobDivisionCode === 'C') {
                // 작업 신규등록
                return { color: 'blue' };
              } else if (params.data.domainName.jobDivisionCode === 'U') {
                // 작업 변경등록
                return { color: 'green' };
              } else if (
                // 작업 폐기등록
                params.data.domainName.jobDivisionCode === 'X' &&
                !params.data.discardYn
              ) {
                return { color: 'red' };
              } else if (
                // 작업 복구등록
                params.data.domainName.jobDivisionCode === 'V' &&
                params.data.discardYn
              ) {
                return { textDecoration: 'line-through', color: 'green' };
              } else if (
                // 관리 폐기등록
                !params.data.domainName.jobDivisionCode &&
                params.data.discardYn
              ) {
                return { textDecoration: 'line-through', color: 'red' };
              }
              return null;
            },
          };
        });
      };

      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(
            domainSearchGridId.value
          );
          const transformedData = await transformGridData(userGridData);
          console.log('Transformed Grid Data:', transformedData);
          return transformedData; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      onBeforeMount(async () => {
        console.log('termSearch beforeMount  ========================');

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[domainSearchGridId.value]) {
          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD042', columnDefs.value);

            gridStorage[domainSearchGridId.value] = transformedData;
            saveGridInfoToStorage(gridStorage);
            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              columnDefs.value
            );

            // 모든 설정이 완료된 후 용어 조회 실행
            // await updateGridData(termQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[domainSearchGridId.value];
          console.log('columnDefs.value : ', columnDefs.value);
        }
      });

      // 검색조건 저장 변수
      let inputQuery = ref('');
      const searchInput = ref('');
      const sortStateQuery = ref('');

      const resultCount = ref({
        total: 20,
      });

      const treeRoots = ref({ roots: ['1'] });
      const treeData = ref({});

      const currentRowIndex = ref(0);

      // 선택 데이터 temp
      let selectNode = {};

      const selectFirstNode = () => {
        setTimeout(() => {
          const firstNodeWrapper = document.querySelector(
            '.tree-node .node-wrapper'
          );

          console.log('firstNodeWrapper ===============', firstNodeWrapper);
          if (firstNodeWrapper) {
            firstNodeWrapper.setAttribute('data-selected', 1);
          }
        }, 100);
      };

      const selectGridFirstNode = () => {
        setTimeout(() => {
          const nodesWithRowId0 = document.querySelector('[row-id="0"]');

          console.log('nodeWithRowId0 ========', nodesWithRowId0);
          if (nodesWithRowId0) {
            // .ag-row-selected 클래스를 추가합니다.
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          }
        }, 1000);
      };

      // API 트리데이터 조회, 생성
      const updateDomainTree = async () => {
        // 트리 row 데이터 조회

        const domainTreeParams = {
          dictionaryId: useDctnryId,
          instituteId: useMetaMngInstId,
        };

        const treesponse = await getDomainTreeListV2(domainTreeParams);
        console.log('treesponse : ', treesponse);

        const domainTreeData = getConstructDomainTreeV2(treesponse.data);

        const allNodes = document.querySelectorAll('.node-wrapper');
        allNodes.forEach((node) => node.setAttribute('data-selected', 0));

        // 트리 생성
        treeData.value = domainTreeData;

        selectNode = treeData.value[1];

        const sortedColumns = columnDefs.value
          .filter((col) => col.sort && col.sortIndex !== undefined)
          .sort((a, b) => a.sortIndex - b.sortIndex);

        console.log('sortedColumns : ', sortedColumns);

        const sortQuery = getSortQuery();

        console.log('selectNode : ', selectNode);

        const domainResearchQuery = {
          instituteId: selectNode.instituteId,
          dictionaryId: selectNode.dictionaryId,
          domainId: selectNode.domainId,
          includeJobDomain: isDomainJobVisible.value,
          jobTypeCode: 'STD',
          sort: getSortQuery(),
        };

        nextTick(() => {
          fetchData(domainResearchQuery);
        });
        // 트리 첫 선택 효과
        selectFirstNode();
      };

      // 트리 데이터조회 생성
      updateDomainTree();

      // 그리드 데이터 할당
      const fetchData = async (domainResearchQuery) => {
        // 헤더 데이터 삭제 및 초기화 시

        // 도메인 데이터 조회
        const domainData = await getDomainListV2(domainResearchQuery);

        console.log('domainData ====', domainData);

        if (domainData.status != 200) {
          resultCount.value.total = 0;

          rowData.value = [];
          emit('row-selected', null);
          return;
        }

        if (domainData != null) {
          //조회결과 반영
          resultCount.value.total = Number(
            domainData.data.totalCount
          ).toLocaleString();
        }

        const domainTempData = [];

        const domain = domainData.data.items;

        console.log('도메인 조회 =============', domain);
        for (let i = 0; i < domain.length; i++) {
          domainTempData.push({
            id: i,
            no: i + 1,
            dictionaryId: domain[i].dictionaryId,
            domainId: domain[i].domainId,
            domainName: {
              name: domain[i].domainName,
              jobDivisionCode: domain[i].jobDivisionCode,
              discardYn: domain[i].discardYn,
            },
            domainGroupName: domain[i].domainGroupName,
            domainClassName: domain[i].domainClassName,
            dataPermissionValue: domain[i].dataPermissionValue,
            domainSourceCode: domain[i].domainSourceCode,
            instituteId: domain[i].instituteId,
            jobDivisionCode: domain[i].jobDivisionCode,
            jobDivisionName: domain[i].jobDivisionName,
            discardYn: domain[i].discardYn,
            revisionDate: domain[i].revisionDate,
            jobDomainId: domain[i].jobDomainId,
            updateDateTime: domain[i].updateDateTime,
            updater: domain[i].updater,
          });
        }
        rowData.value = domainTempData;

        if (rowData.value.length > 0) {
          // 첫 번째 행의 데이터를 이벤트를 통해 상위 컴포넌트로 전달
          if (rowData.value.length > 0) {
            nextTick(() => {
              const firstRowData =
                agGrid.value.gridApi.getDisplayedRowAtIndex(0);

              const nodesWithRowId0 = document.querySelector('[row-id="0"]');
              console.log('nodeWithRowId0 ========', nodesWithRowId0);

              if (nodesWithRowId0) {
                // .ag-row-selected 클래스를 추가합니다.
                nodesWithRowId0.classList.add('ag-row-selected');
                nodesWithRowId0.classList.add('ag-row-focus');
                nodesWithRowId0.setAttribute('aria-selected', true);
              }

              if (firstRowData) {
                emit('row-selected', firstRowData);

                console.log('firstRowData.domainSourceCode ===', firstRowData);
                selectedDomainData.value = firstRowData.data;

                if (firstRowData.data.domainSourceCode === 'MNG') {
                  setSelectDomainMngData(firstRowData.data);
                } else {
                  setDomainJobData(firstRowData.data);
                }
              }
            });
          }
        }

        return domainTempData;
      };

      const firstRowSelectedEvent = () => {
        if (rowData.value.length > 0) {
          // 첫 번째 행의 데이터를 이벤트를 통해 상위 컴포넌트로 전달
          if (rowData.value.length > 0) {
            nextTick(() => {
              const firstRowData =
                agGrid.value.gridApi.getDisplayedRowAtIndex(0);

              const nodesWithRowId0 = document.querySelector('[row-id="0"]');
              console.log('nodeWithRowId0 ========', nodesWithRowId0);

              if (nodesWithRowId0) {
                // .ag-row-selected 클래스를 추가합니다.
                nodesWithRowId0.classList.add('ag-row-selected');
                nodesWithRowId0.classList.add('ag-row-focus');
                nodesWithRowId0.setAttribute('aria-selected', true);
              }

              console.log('firstRowData =============', firstRowData);

              if (firstRowData) {
                emit('row-selected', firstRowData);
              }
            });
          }
        }
      };

      async function onGridSearchClicked(textValue) {
        rowData.value = [];

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

        if (searchType.value === 'natural-query' && textValue !== '') {
          const searhInfo = {
            gridId: domainSearchGridId.value,
            query: textValue,
          };
          const llmAnswer = await getCreateQuery(searhInfo);

          // 컬럼 업데이트
          await columnDefsUpdate(
            llmAnswer.data.sort,
            columnDefs,
            domainSearchGridId.value,
            gridApi
          );
          inputQuery.value = llmAnswer.data.where;
          searchInput.value = textValue;

          const domainResearchQuery = {
            dictionaryId: useDctnryId,
            treeDomainDictionaryId: selectNode.dictionaryId,
            domainId: selectNode.domainId,
            lastItem: {
              domainId: selectNode.domainId,
              managementInstituteId: useMetaMngInstId,
              userId: userInfo.value.userId,
            },
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
            searchType: isDomainJobType.value.toUpperCase(),
          };

          if (llmAnswer.data.sort == '') {
            await fetchData(domainResearchQuery);
          }
        } else {
          console.log('searchEnter - selectNode  ', selectNode);

          const chgTextValue = textValue.replace(/\n/g, ' ');
          if (textValue != null) {
            //대문자로 변환
            const upperTextValue = transformQuery(chgTextValue).trim();
            // const upperTextValue = chgTextValue.trim().toUpperCase();
            if (basicWhereQueryCheck(upperTextValue) === 'PASS') {
              console.log('PASS WORD');
              //wordSearchQuery.query = upperTextValue;

              const domainResearchQuery = {
                instituteId: useMetaMngInstId,
                dictionaryId: useDctnryId,
                domainId: selectNode.domainId,
                includeJobDomain: isDomainJobVisible.value,
                jobTypeCode: 'STD',
                // lastItem: {
                //   domainId: selectNode.domainId,
                //   managementInstituteId: useMetaMngInstId,
                //   userId: userInfo.value.userId,
                // },
                query: upperTextValue,
                sort: sortStateQuery.value,
              };
              inputQuery.value = upperTextValue;
              searchInput.value = upperTextValue;

              fetchData(domainResearchQuery);

              console.log('upperTextValue ===', upperTextValue);
            } else {
              const alertMsgText = ref('');
              switch (basicWhereQueryCheck(upperTextValue)) {
                case 'ERR_FRBWRD':
                  alertMsgText.value =
                    '<br>(사유 : <strong style="color:red">금칙어가 포함되어 있습니다.</strong> )';
                  break;
                case 'ERR_ANDOR':
                  alertMsgText.value =
                    '<br>(사유 : <strong style="color:red">문자열의 처음이나 끝에 AND와 OR를 포함할 수 없습니다.</strong> )';
                  break;
                case 'ERR_BRCKTCNT':
                  alertMsgText.value =
                    '<br>(사유 : <strong style="color:red">괄호의 개수가 다릅니다.</strong> )';
                  break;
                case 'ERR_QUOTECNT':
                  alertMsgText.value =
                    '<br>(사유 : <strong style="color:red">조회값의 형식이 다릅니다.</strong> )';
                  break;
                case 'ERR_BRCKTORD':
                  alertMsgText.value =
                    '<br>(사유 : <strong style="color:red">괄호의 순서가 다릅니다.</strong> )';
                  break;
                default:
                  alertMsgText.value = '';
                  break;
              }
              return false;
            }
          } else {
            inputQuery.value = '';
            searchInput.value = '';
            fetchData();
          }
        }
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
            if (a.sortIndex === undefined && b.sortIndex === undefined)
              return 0;
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

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            includeJobDomain: isDomainJobVisible.value,
            jobTypeCode: 'STD',
            domainId: selectNode.domainId,
            query: inputQuery.value,
            sort: '',
          };

          const domainSortData = await fetchData(researchQuery);

          rowData.value = domainSortData;
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          console.log('selectNodeData : ', selectNodeData);

          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            domainId: selectNode.domainId,
            includeJobDomain: isDomainJobVisible.value,
            jobTypeCode: 'STD',
            query: inputQuery.value,
            sort: sortQuery.value,
            searchType: '',
          };

          const newDomainGridData = await fetchData(researchQuery);
          rowData.value = newDomainGridData;
        }

        firstRowSelectedEvent();
      };

      const agGrid = ref(null);

      // // 도메인 그리드 헤더 데이터
      // const initializeGridColumnDefs = () => {
      //   const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
      //   if (storedColumnDefs && storedColumnDefs.MFGRD042) {
      //     uiStore.setGridColumnDefs('MFGRD042', storedColumnDefs.MFGRD042);
      //   }
      // };

      // initializeGridColumnDefs();

      // 헤더 이동 추가 코드
      const gridApi = ref(null);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const searchType = ref('query');

      const handleChangeSearchType = (searchTypeData) => {
        console.log('handleChangeSearchType : ', searchTypeData);
        searchType.value = searchTypeData;
      };

      const newColumnDefs = ref([]);

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      function handleColumnStateChanged(newColumnState) {
        console.log('컬럼 이동 핸들러 동작 ====');

        console.log('newColumnState : ', newColumnState);

        console.log('columnDefs.value : ', columnDefs.value);

        // 새 컬럼 헤드 정의
        const newColumnFcDefs = newColumnState
          .map((colState) => {
            const colDef = columnDefs.value.find(
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

            if (colDef.field === 'domainName') {
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
              cellRenderer = 'TermJobTypeCellrenderer'; // 여기서 cellRenderer 설정
            }

            return {
              ...colDef,
              width: colState.width,
              hide: colState.hide,
              pinned: colState.pinned,
              sort: colState.sort,
              minWidth: colState.minWidth,
              sortIndex: colState.sortIndex,
              valueFormatter: valueFormatter,
              comparator: () => 0,
              cellRenderer:
                colDef.field === 'domainName' ||
                colDef.field === 'domainClassName' ||
                colDef.field === 'domainGroupName'
                  ? cellRenderer
                  : null,
            };
          })
          .filter((colDef) => colDef != null);

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
        columnDefs.value = newColumnFcDefs;
        newColumnDefs.value = newColumnFcDefs;

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD042에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD042 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);

        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD042', newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD042) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD042;

        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          let cellStyle = null;

          if (col.field === 'domainName') {
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
            cellRenderer = 'TermJobTypeCellrenderer';
          }

          cellStyle = (params) => {
            // 조건에 따라 취소선 적용
            if (params.data.domainName.jobDivisionCode === 'D') {
              return { textDecoration: 'line-through', color: 'red' };
            } else if (params.data.domainName.jobDivisionCode === 'C') {
              return { color: 'blue' };
            } else if (params.data.domainName.jobDivisionCode === 'U') {
              return { color: 'green' };
            } else if (
              params.data.domainName.jobDivisionCode === 'X' &&
              !params.data.discardYn
            ) {
              // 작업 폐기등록
              return { color: 'red' };
            } else if (
              // 작업 복구등록
              params.data.domainName.jobDivisionCode === 'V'
            ) {
              return { textDecoration: 'line-through', color: 'green' };
            } else if (
              !params.data.domainName.jobDivisionCode &&
              params.data.discardYn
            ) {
              // 관리 폐기등록
              return { textDecoration: 'line-through', color: 'red' };
            }
            return null;
          };

          return {
            headerName: col.headerName,
            field: col.field,
            hide: col.hide,
            pinned: col.pinned,
            sortable: col.sortable,
            cellClass: col.cellClass,
            width: col.width,
            minWidth: col.minWidth,
            sort: col.sort,
            sortIndex: col.sortIndex,
            comparator: () => 0,
            cellStyle: cellStyle,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });
      });

      // 트리 데이터 저장
      const selectNodeData = ref({});

      //선택 트리 노드
      const onSelectNode = async (value) => {
        //   const { id, type } = value;
        console.log('onSelectNode value : ', value);

        selectNodeData.value = value;

        selectNode = value;

        const sortedColumn = columnDefs.value.find((col) => col.sort);

        const sortQuery = sortedColumn
          ? `${sortedColumn.headerName} ${sortedColumn.sort}`
          : '';

        let domainResearchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          domainId: selectNode.domainId,
          includeJobDomain: isDomainJobVisible.value,
          sort: getSortQuery(),
          inputQuery: inputQuery.value,
          jobTypeCode: 'STD',
        };

        await fetchData(domainResearchQuery);
      };

      // 필터 초기화 confirm 팝업
      const confirmDeleteDctnrySrchTab2State = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
      });

      const onDeleteDctnrySrchWrdGridUserStng = () => {
        confirmDeleteDctnrySrchTab2State.view = true;
      };

      // 필터 및 정렬 삭제
      const onSearchRemove = async () => {
        console.log('onSearchRemove');
        console.log('정렬 초기화');

        console.log('treeData.value : ', treeData.value);

        // 필터 검색창 초기화
        inputQuery.value = '';
        searchInput.value = '';

        const gridDefaultData = await getGridDefaultData(
          domainSearchGridId.value
        );

        const transformGrid = transformGridData(gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        columnDefs.value = transformGrid;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[domainSearchGridId.value] = transformGrid;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(domainSearchGridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        const selectNode = treeData.value[1];

        const domainResearchQuery = {
          instituteId: selectNode.instituteId,
          dictionaryId: selectNode.dictionaryId,
          domainId: selectNode.domainId,
          includeJobDomain: isDomainJobVisible.value,
          jobTypeCode: 'STD',
          sort: getSortQuery(),
        };

        nextTick(() => {
          fetchData(domainResearchQuery);
        });
        // focusRootNode();

        selectFirstNode();
      };

      const onFilterWindowClosed = (filterSet) => {
        // 필터 창이 닫힐 때 수행하고 싶은 로직
        console.log('필터 창이 닫혔습니다.');

        // 맞춤형 필터 설정이 있는 경우
        if (filterSet) {
          inputQuery.value = filterSet.searchQuery;
          searchInput.value = filterSet.searchQuery;

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

          const researchQuery = {
            dictionaryId: useDctnryId,
            domainId: selectNode.domainId,
            treeDomainDictionaryId: selectNode.dictionaryId,
            lastItem: {
              domainId: selectNode.domainId,
              managementInstituteId: useMetaMngInstId,
              userId: userInfo.value.userId,
            },
            query: filterSet.searchQuery,
            sort: filterSortQuery,
            searchType: 'GROUP',
          };

          if (selectNode.typeCode === '00') {
            researchQuery.searchType = 'GROUP';
          } else if (selectNode.typeCode === '10') {
            researchQuery.searchType = 'CLASS';
          } else if (selectNode.typeCode === '20') {
            researchQuery.searchType = 'PLAIN';
          }

          console.log('filterClose - selectNode : ', selectNode);

          fetchData(researchQuery);
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());

          console.log('gridStorage : ', gridStorage);
          columnDefs.value = gridStorage.MFGRD042;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD042);
        }
      };

      // 도메인 그리드 클릭 시 신규등록
      const clickDomainArea = (event) => {
        console.log('clickDomainArea');

        // 클릭된 요소에 클래스 추가
        const clickedElement = event.currentTarget;
        clickedElement.classList.add('clicked');

        // 일정 시간 후 클래스 제거
        setTimeout(() => {
          clickedElement.classList.remove('clicked');
        }, 400); // 300ms 후 제거 (시간은 필요에 따라 조정 가능)

        if (rowData.value.length === 0) {
          console.log('selectNode : ', selectNode);
          emit('select-domain-tree', selectNode);
        }
      };

      onMounted(() => {
        const gridRight = document.querySelector('.grid-right');
        gridRight.addEventListener('click', clickDomainArea);
      });

      // 정렬(소팅) 쿼리 반환 함수
      const getSortQuery = () => {
        const sortedColumns = columnDefs.value
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

      // 작업완료(승인신청) 상태 변경 감지
      watch(
        () => isDomainJobApproval.value,
        (newVal) => {
          if (newVal) {
            updateDomainTree();
            // focusRootNode();
          }
          setIsDomainJobApproval(false);
        }
      );

      // 작업 포함 여부 변경 감지
      watch(isDomainJobVisible, async (value) => {
        console.log('domainTopComp-isDomainJobVisible : ', value);

        const domainResearchQuery = {
          instituteId: selectNode.instituteId,
          dictionaryId: selectNode.dictionaryId,
          domainId: selectNode.domainId,
          sort: getSortQuery(),
          query: inputQuery.value,
          includeJobDomain: value,
          jobTypeCode: 'STD',
        };

        await fetchData(domainResearchQuery);
      });

      // 챗봇 팝업창 열기
      const chatbotWindowView = ref(false);
      const onOpenChatbotWindow = () => {
        chatbotWindowView.value = true;
      };
      const onCloseChatbotWindow = () => {
        chatbotWindowView.value = false;
      };

      // 챗봇 팝업창에서 쿼리 바인딩
      const handleBindQuery = async (llmAnswer) => {
        chatbotWindowView.value = false;
        inputQuery.value = llmAnswer.where;
        searchInput.value = llmAnswer.where;

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          domainSearchGridId.value,
          gridApi
        );

        const domainResearchQuery = {
          dictionaryId: useDctnryId,
          domainId: selectNode.domainId,
          treeDomainDictionaryId: selectNode.dictionaryId,
          lastItem: {
            managementInstituteId: useMetaMngInstId,
            userId: userInfo.value.userId,
          },
          query: inputQuery.value,
          sort: getSortQuery(),
          searchType: isDomainJobType.value.toUpperCase(),
        };

        await fetchData(domainResearchQuery);
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[tab1GridId.value] : ',
          gridStorage[domainSearchGridId.value]
        );

        const fieldMapping = {
          dictionaryId: 'DCTNRY_ID',
          no: 'NO',
          domainName: 'DMN_NM',
          domainGroupName: 'DMN_GRP_NM',
          domainClassName: 'DMN_CLS_NM',
          codeTypeName: 'CD_TYPE_NM',
          associatedCodeName: 'REL_CD_NM',
          dataPermissionValue: 'DATA_PRM_VL',
          revisionInfo: 'REVISION_INFO',
          revisionDate: 'RVSN_DT',
          updater: 'UPDR_INFO',
          updateDateTime: 'UPD_DTM',
        };
        const newGridStting = columnDefs.value.map((item, index) => {
          const articleName = fieldMapping[item.field];

          //     "gridArticleName": "UPD_DTM",
          // "gridArticleKoreanName": "최종수정일시",
          // "articlePositionOrder": 1,
          // "articleColumnWidth": 150,
          // "articleDisplayYn": false,
          // "articleFixedCode": null,
          // "articleDataSortYn": true,
          // "articleDataSortOrder": null,
          // "articleDataSortCode": null

          return {
            gridArticleName: articleName,
            gridArticleKoreanName: item.headerName,
            articlePositionOrder: index + 1,
            articleColumnWidth: item.width,
            articleDisplayYn: !item.hide,
            articleFixedCode: item.pinned,
            articleDataSortYn: item.sortable,
            articleDataSortOrder: item.sortIndex,
            articleDataSortCode: item.sort,
          };
        });

        console.log('newGridStting : ', newGridStting);

        await setUserGridSetting(domainSearchGridId.value, newGridStting);
        // updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      const selectedDomainData = ref(null);

      const handleExcelDownload = async (option) => {
        console.log('option : ', option);

        try {
          if (option === 'all') {
            // 🔥 전체 다운로드 - API 응답을 엑셀 파일로 다운로드
            const params = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              dictionarySearchCode: 'INDIVIDUAL',
              includeJobDomain: isDomainJobVisible.value,
              jobTypeCode: 'STD',
              query: inputQuery.value,
              sort: getSortQuery(),
              domainId: selectNode.domainId,
            };

            console.log('params : ', params);

            const response = await getMngDomainDownload(params);
            console.log('response : ', response);

            // 🔥 API 응답 데이터를 Blob으로 변환하여 엑셀 파일 다운로드
            if (response && response.data) {
              const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });

              // 🔥 파일 다운로드 실행
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `도메인목록_전체_${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`;

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);

              console.log('전체 다운로드 완료');
            } else {
              console.error('API 응답 데이터가 없습니다.');
              alert('다운로드할 데이터가 없습니다.');
            }
          } else {
            // 🔥 조회 건 다운로드 (기존 방식 유지)
            console.log('조회건 다운로드 시작');
            // console.log('rowData.value : ', rowData.value);

            if (!rowData.value || rowData.value.length === 0) {
              alert('조회된 데이터가 없습니다.');
              return;
            }

            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(rowData.value);

            // 🔥 엑셀 파일 생성 및 다운로드
            await downloadExcelFromData(excelData, '조회건');
          }
        } catch (error) {
          console.error('엑셀 다운로드 실패:', error);

          // 🔥 에러 상세 정보 표시
          if (error.response && error.response.status) {
            alert(
              `엑셀 다운로드 중 오류가 발생했습니다. (${error.response.status})`
            );
          } else {
            alert('엑셀 다운로드 중 오류가 발생했습니다.');
          }
        }
      };

      // 🔥 rowData를 엑셀 다운로드용 데이터로 변환하는 함수
      const convertRowDataToExcelFormat = (data) => {
        return data.map((row, index) => {
          console.log('row : ', row);
          return {
            도메인명: row.domainName.name || '',
            작업구분명: row.jobDivisionName || '',
            도메인분류명: row.domainClassName || '',
            도메인그룹명: row.domainGroupName || '',
            데이터허용값: row.dataPermissionValue || '',
            폐기여부: row.discardYn === true ? 'Y' : 'N',
            제개정일자: row.revisionDate || '',
            최종수정자: row.updater || '',
            최종수정일시: row.updateDateTime || '',
          };
        });
      };

      // 🔥 셀 값 추출 함수 (복잡한 객체 구조에서 실제 값 추출)
      const extractCellValue = (cellData) => {
        if (!cellData) return '';

        // 배열 형태인 경우 (예: termName: [{label: "값"}])
        if (Array.isArray(cellData) && cellData.length > 0) {
          return cellData[0].label || cellData[0].value || cellData[0];
        }

        // 객체 형태인 경우
        if (typeof cellData === 'object' && cellData.label) {
          return cellData.label;
        }

        // 문자열이나 기본 값인 경우
        return String(cellData);
      };

      // 🔥 ExcelJS를 사용한 스타일 적용 가능한 엑셀 다운로드 함수
      const downloadExcelFromData = async (data, downloadType) => {
        try {
          // 🔥 ExcelJS 라이브러리 import
          const ExcelJS = await import('exceljs');

          // 워크북과 워크시트 생성
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('도메인목록');

          // 🔥 컬럼 정의 및 헤더 설정
          worksheet.columns = [
            { header: '도메인명', key: '도메인명', width: 40 },
            { header: '작업구분명', key: '작업구분명', width: 15 },
            { header: '도메인분류명', key: '도메인분류명', width: 25 },
            { header: '도메인그룹명', key: '도메인그룹명', width: 25 },
            { header: '데이터허용값', key: '데이터허용값', width: 25 },
            { header: '폐기여부', key: '폐기여부', width: 20 },
            { header: '제개정일자', key: '제개정일자', width: 25 },
            { header: '최종수정자', key: '최종수정자', width: 20 },
            { header: '최종수정일시', key: '최종수정일시', width: 20 },
          ];

          // 🔥 헤더 스타일 적용
          const headerRow = worksheet.getRow(1);
          headerRow.height = 20; // 행 높이 설정

          headerRow.eachCell((cell) => {
            cell.font = {
              bold: true,
              name: 'Arial',
              size: 11,
              color: { argb: 'FF000000' }, // 검은색
            };
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle',
            };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFBFBFBF' }, // #BFBFBF 배경색
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } },
            };
          });

          // 🔥 데이터 행 추가 및 스타일 적용
          data.forEach((rowData, index) => {
            const row = worksheet.addRow(rowData);
            row.height = 20; // 행 높이 설정

            // 각 셀에 스타일 적용
            row.eachCell((cell, colNumber) => {
              cell.font = {
                name: 'Arial',
                size: 10,
                color: { argb: 'FF000000' },
              };

              // 순번 컬럼은 중앙 정렬, 나머지는 좌측 정렬
              // if (colNumber === 1) {
              //   cell.alignment = {
              //     horizontal: 'center',
              //     vertical: 'middle',
              //   };
              // } else {
              //   cell.alignment = {
              //     horizontal: 'left',
              //     vertical: 'middle',
              //   };
              // }

              cell.alignment = {
                horizontal: 'left',
                vertical: 'middle',
              };

              // 모든 셀에 테두리 적용
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } },
              };

              // 🔥 데이터 타입별 추가 포맷팅
              if (colNumber === 1) {
                // 순번은 숫자 형식
                cell.numFmt = '0';
              } else if (colNumber >= 10) {
                // 날짜 컬럼들
                if (
                  cell.value &&
                  cell.value.toString().match(/\d{4}-\d{2}-\d{2}/)
                ) {
                  cell.numFmt = 'yyyy-mm-dd';
                }
              }
            });
          });

          // 🔥 워크시트 전체 설정
          worksheet.pageSetup = {
            paperSize: 9, // A4
            orientation: 'landscape', // 가로 방향
            fitToPage: true,
            fitToHeight: 0,
            fitToWidth: 1,
            margins: {
              left: 0.7,
              right: 0.7,
              top: 0.75,
              bottom: 0.75,
              header: 0.3,
              footer: 0.3,
            },
          };

          // 🔥 인쇄 제목 설정 (헤더 행 반복)
          worksheet.pageSetup.printTitlesRow = '1:1';

          // 🔥 자동 필터 설정
          worksheet.autoFilter = {
            from: 'A1',
            to: `I${data.length + 1}`,
          };

          // 🔥 셀 고정 (헤더 행 고정)
          worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

          // 🔥 파일 다운로드
          const fileName = `도메인목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log(`${downloadType} 스타일 적용 다운로드 완료:`, fileName);
        } catch (error) {
          console.error('ExcelJS 파일 생성 실패:', error);

          // 🔥 ExcelJS 실패 시 기본 XLSX 방식으로 폴백
          console.log('기본 XLSX 방식으로 재시도...');
          await downloadExcelFromDataFallback(data, downloadType);
        }
      };

      // 🔥 폴백용 기본 다운로드 함수
      const downloadExcelFromDataFallback = async (data, downloadType) => {
        try {
          const XLSX = await import('xlsx');

          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, '도메인목록');

          const columnWidths = [
            { wch: 8 },
            { wch: 15 },
            { wch: 25 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
          ];
          worksheet['!cols'] = columnWidths;

          const fileName = `도메인목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

          XLSX.writeFile(workbook, fileName);
          console.log(`${downloadType} 기본 다운로드 완료:`, fileName);
        } catch (error) {
          console.error('기본 XLSX 다운로드도 실패:', error);
          downloadCSVFromData(data, downloadType);
        }
      };

      // 🔥 XLSX 라이브러리가 없는 경우 CSV 다운로드 대안
      const downloadCSVFromData = (data, downloadType) => {
        try {
          if (data.length === 0) return;

          // CSV 헤더 생성
          const headers = Object.keys(data[0]);
          const csvContent = [
            headers.join(','), // 헤더 행
            ...data.map((row) =>
              headers
                .map((header) => `"${String(row[header]).replace(/"/g, '""')}"`)
                .join(',')
            ),
          ].join('\n');

          // BOM 추가 (한글 깨짐 방지)
          const BOM = '\uFEFF';
          const blob = new Blob([BOM + csvContent], {
            type: 'text/csv;charset=utf-8;',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `도메인목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log(`${downloadType} CSV 다운로드 완료`);
        } catch (error) {
          console.error('CSV 파일 생성 실패:', error);
        }
      };

      watch(
        () => isDomainJobCancel.value,
        async (value) => {
          console.log('isDomainJobCancel.value : ', value);

          const data = selectedDomainData.value;

          const selectedRow = document.querySelectorAll(
            '[class~="ag-row-selected"]'
          );

          // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
          selectedRow.forEach((node) => {
            node.classList.remove('ag-row-selected');
          });

          // 첫 행 select 효과
          const nodesWithRowId0 = document.querySelector(
            `[row-id="${data.id}"]`
          );

          // .ag-row-selected 클래스를 추가합니다.
          nodesWithRowId0.classList.add('ag-row-selected');
          nodesWithRowId0.classList.add('ag-row-focus');
          nodesWithRowId0.setAttribute('aria-selected', true);

          if (data) {
            if (data.domainSourceCode === 'MNG') {
              setSelectDomainMngData(null);
              setSelectDomainMngData(data);
            } else {
              setDomainJobData(null);
              setDomainJobData(data);
            }
          }

          setIsDomainJobCancel(false);
        }
      );

      // onActivated(() => {
      //   agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
      // });

      return {
        agGrid,
        rowData,
        resultCount,
        treeRoots,
        treeData,
        onSelectNode,
        // handleScrollChanged,
        selectFirstNode,
        selectGridFirstNode,
        onGridSearchClicked, // 필터 리서치 실행 함수
        handleSortChanged,
        handleColumnStateChanged,
        handleSetGridApi,
        columnDefs,
        gridInfoDefs,
        onSearchRemove,
        confirmDeleteDctnrySrchTab2State,
        onDeleteDctnrySrchWrdGridUserStng,
        onFilterWindowClosed,
        inputQuery,
        appTree,
        setDomainJobData,
        setIsDomainJobType,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        chatbotWindowView,
        handleBindQuery,
        domainSearchGridId,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        handleChangeSearchType,
        searchType,
        searchInput,
        gridName,
        setSelectDomainMngData,
        selectedDomainData,
        handleExcelDownload,
      };
    },
  };
</script>
