<template>
  <div class="tab-inner pb5">
    <DragCol width="100%" height="100%" :leftPercent="50" :sliderWidth="10">
      <template #left>
        <div class="grid-wrap">
          <div class="grid-top">
            <div class="top-row">
              <GridSearch
                :columnFcDefs="columnDefs"
                :resultCount="resultCount"
                :gridDefs="gridInfoDefs"
                :modelValue="searchInput"
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
              />
            </div>
          </div>
          <div class="grid-list grid-left">
            <AppGrid
              :rowData="rowDataLeft"
              :columnDefs="columnDefs"
              :context="context"
              rowSelection="single"
              @rowDoubleClicked="onRowDoubleClicked"
              @sort-changed="handleSortChanged"
              @rowClicked="onRowClicked"
              @body-scroll="handleScrollChanged"
              @column-state-changed="handleColumnStateChanged"
              @gridApi="handleSetGridApi"
              ref="agGridLeft"
            />
          </div>
        </div>
      </template>
      <template #right>
        <div class="grid-wrap">
          <div class="grid-top">
            <div
              v-if="selectedNameRow.unityCodeKoreanName"
              class="unityCodeNameDiv"
            >
              <span>통합코드명 :</span>
              &nbsp;&nbsp;
              <AppStateText v-model="selectedNameRow.unityCodeKoreanName" />
              <span>&nbsp;[{{ selectedNameRow.unityCodeName }}]</span>
            </div>
          </div>
          <div class="grid-list grid-right">
            <AppGrid
              :rowData="rowDataRight"
              :columnDefs="codeValueColumnDefs"
              :context="context"
              rowSelection="single"
              @rowClicked="onRowClicked"
              @rowDoubleClicked="onRowDoubleClicked"
              @column-state-changed="handleColumnStateChanged"
              @sort-changed="handleSortChanged"
              ref="agGridRight"
            />
          </div>
        </div>
      </template>
    </DragCol>
  </div>
  <div>
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

  <AppWindow
    :view="chatbotWindowView"
    :moveState="true"
    @close="onCloseChatbotWindow"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="codeNameSearchGridId"
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
    nextTick,
    inject,
    watchEffect,
    watch,
    onBeforeMount,
  } from 'vue';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useTabNaviStore } from '@/stores/tabNavi';

  import { useUiStore } from '@/stores/ui';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { basicWhereQueryCheck } from '@/utils/utils.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import {
    getCodeNameSearchJob,
    getCodeValueSearchJob, // 통합코드값 job 조회
  } from '@/utils/mflexApi/dictionaryManagementApi';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
    saveStepStateStorage,
  } from '@/utils/cookies';
  import AppTree from '@/components/ui/AppTree.vue';
  import { DragCol } from 'vue-resizer';

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
      DragCol,
      AppWindow,
      ChatbotWindow,
    },

    data() {
      return {
        context: null,
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
        if (this.selectedRow.unityCodeKoreanName) {
          this.selectedNameRow = this.selectedRow;
        }
        this.firstSelectRowData = null;

        if (value.unityCodeKoreanName != null) {
          console.log('코드명 그리드 선택');
          // this.$emit('change-job-type', 'codeName');
          // this.setIsCodeJobType('codeName');
          const selectedRow = document.querySelectorAll(
            '[class~="ag-row-selected"]'
          );
          // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
          selectedRow.forEach((node) => {
            node.classList.remove('ag-row-selected');
          });

          const clickNode = value.id;
          const clickedNode = document.querySelector(
            `.grid-left [row-id="${clickNode}"]`
          );
          clickedNode.classList.add('ag-row-selected');
        } else {
          console.log('코드값 그리드 선택');
          // this.$emit('change-job-type', 'codeValue');
          // this.setIsCodeJobType('codeValue');

          console.log('IsCodeJobType store  : ', this.getIsCodeJobType);
          const selectedRow = document.querySelectorAll(
            '.grid-right [class~="ag-row-selected"]'
          );
          // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
          selectedRow.forEach((node) => {
            node.classList.remove('ag-row-selected');
          });

          const clickNode = value.id;
          const clickedNode = document.querySelector(
            `.grid-right [row-id="${clickNode}"]`
          );
          clickedNode.classList.add('ag-row-selected');
        }

        // 통합코드명 그리드에 있는 값으로 좌, 우 그리드 체크
        if (value.unityCodeKoreanName != null) {
          let codeValueParams = {
            managementInstituteId: this.useMetaMngInstId,
            userId: this.userInfo.userId,
            unityCodeDictionaryId: value.unityCodeDictionaryId,
            unityCodeName: value.unityCodeName,
          };
          console.log('emit selectedCodeName.value ============== ', value);
          value.counter = !value.counter;
          this.codeValueFetchData(codeValueParams, value);
          //상위로 전다
          // this.$emit('selected-codeName', value);

          this.setIsCodeJobType('codeName');
          nextTick(() => {
            // 그리드 데이터 상태값 저장 => JobCodeNameComp 에서 API 호출
            console.log('codeNameJobData rowClicked: ', value);
            this.setCodeNameJobData(value);
            this.setCodeJobSelectData(value);
          });
          console.log('IsCodeJobType store  : ', this.getIsCodeJobType);
        } else {
          console.log('코드값 그리드 선택');
          this.$emit('selected-codeValue', value);

          this.setIsCodeJobType('codeValue');

          const selectedRow = document.querySelectorAll(
            '.grid-right [class~="ag-row-selected"]'
          );
          // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
          selectedRow.forEach((node) => {
            node.classList.remove('ag-row-selected');
          });

          const clickNode = value.id;
          const clickedNode = document.querySelector(
            `.grid-right [row-id="${clickNode}"]`
          );
          clickedNode.classList.add('ag-row-selected');

          nextTick(() => {
            this.setCodeValueJobData(value);
            // this.setCodeNameJobData(null); // 코드명 데이터 변동사항 감지를 위한 초기화
            this.setCodeJobSelectData(value);
          });
        }
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
        this.selectedRow = null;
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    emits: [
      'selected-codeName',
      'selected-codeValue',
      'first-row-selected',
      'row-clicked',
      'open-filter-window',
      'codevalue-row-selected',
      'first-row-codevalue',
      'change-job-type',
    ],
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

      // 사전 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const tabNaviStore = useTabNaviStore();
      const { setDictionaryMngState } = tabNaviStore;

      // 사전등록 스토어
      // 데이터 상태값 변경 및 컴포넌트 렌더링 상태 변경
      const dictionaryMngStore = useDictionaryMngStore();
      const {
        setCodeNameJobData,
        setCodeValueJobData,
        setIsCodeJobType,
        setIsCodeJobApproval,
        getIsCodeJobType,
        setCodeJobSelectData,
      } = dictionaryMngStore;

      const { isCodeJobApproval } = storeToRefs(dictionaryMngStore);

      const sortStateQuery = ref('');

      const codeNameSearchGridId = ref('MFGRD043');
      const codeValueSearchGridId = ref('MFGRD044');

      const gridInfoDefs = ref({
        scrnGridId: codeNameSearchGridId,
        scrnId: '',
      });

      const columnDefs = ref([]);
      const codeValueColumnDefs = ref([]);

      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          UNTY_CD_NM: 'unityCodeName',
          UNTY_CD_KORN_NM: 'unityCodeKoreanName',
          UNTY_CD_TYPE_NM: 'codeTypeName',
          DATA_TYP_NM: 'dataTypeName',
        };

        const specialConfig = {
          unityCodeKoreanName: {
            cellRenderer: 'TypeCellRenderer',
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
              fieldName === 'dataTypeName'
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
          };
        });
      };

      const getGridInfo = async () => {
        try {
          // 코드명 그리드
          const userGridData = await getUserGridSetting(
            codeNameSearchGridId.value
          );

          // 코드값 그리드
          const codeValueGridSets = await getUserGridSetting('MFGRD044');
          const transfromCodeValue = await transfromCodeValueGrid(
            codeValueGridSets
          );
          console.log('codeValueGridSets ==== ', codeValueGridSets);

          const transformedData = await transformGridData(userGridData);
          console.log('Transformed Grid Data:', transformedData);

          return { transformedData, transfromCodeValue }; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      // 코드값 그리드 변환 함수
      const transfromCodeValueGrid = (data) => {
        console.log('transfromCodeValueGrid - codeValueGridSets : ', data);

        const fieldMapping = {
          NO: 'no',
          UNTY_CD_VL: 'unityCodeValue',
          UNTY_CD_VL_NM: 'unityCodeValueName',
          UP_CD_INFO: 'parentCode',
          RFRNC_CD_INFO: 'referenceCode',
          UPDR_INFO: 'updater',
          UPD_DTM: 'updateDateTime',
        };

        const specialConfig = {
          parentCode: {
            cellRenderer: 'TypeCellRenderer',
            valueFormatter: '(params) => params.value',
          },
          referenceCode: {
            cellRenderer: 'TypeCellRenderer',
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
              fieldName === 'dataTypeName'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            cellRenderer: config.cellRenderer || null,
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: false,
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
          };
        });
      };

      onBeforeMount(async () => {
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        console.log(
          'gridStorage[codeNameSearchGridId.value]: ',
          gridStorage[codeNameSearchGridId.value]
        );
        console.log(
          'gridStorage[codeValueSearchGridId.value]: ',
          gridStorage[codeValueSearchGridId.value]
        );

        if (!gridStorage[codeNameSearchGridId.value]) {
          try {
            // transformedData를 직접 받아서 처리
            const gridData = await getGridInfo();
            const transformedData = gridData.transformedData;
            const transfromCodeValue = gridData.transfromCodeValue;

            // columnDefs 설정
            columnDefs.value = transformedData;
            codeValueColumnDefs.value = transfromCodeValue;

            gridStorage[codeNameSearchGridId.value] = transformedData;

            gridStorage[codeValueSearchGridId.value] = transfromCodeValue;

            console.log('gridStorage: ', gridStorage);

            saveGridInfoToStorage(gridStorage);
            // 로컬스토레지에 저장

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD043', columnDefs.value);
            uiStore.setGridColumnDefs('MFGRD044', codeValueColumnDefs.value);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
              gridApi.value.setGridOption(
                'columnDefs',
                codeValueColumnDefs.value
              );
            }

            const gridRight = document.querySelector('.grid-right');
            gridRight.addEventListener('click', codeValueInsert);
            const sortQuery = getSortQuery();
            const resaerhJobQuery = {
              dictionaryId: useDctnryId,
              lastItem: {
                // userId: userInfo.value.userId,
                // managementInstituteId: useMetaMngInstId,
                // unityCodeKoreanName: '',
                // unityCodeName: '',
                // unityCodeDictionaryId: useDctnryId,
              },
              query: '',
              sort: sortQuery,
            };
            codeNameSearchJob(resaerhJobQuery);

            // 모든 설정이 완료된 후 용어 조회 실행
            // await updateGridData(termQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[codeNameSearchGridId.value];
          codeValueColumnDefs.value = gridStorage[codeValueSearchGridId.value];

          const sortQuery = getSortQuery();
          const resaerhJobQuery = {
            dictionaryId: useDctnryId,
            lastItem: {},
            query: '',
            sort: sortQuery,
          };
          codeNameSearchJob(resaerhJobQuery);
        }
      });

      const rowDataLeft = reactive({});
      const rowDataRight = reactive({});

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      let selectedRow = ref({});
      let selectedNameRow = ref({});
      //const selectedCodeValue = reactive({});

      const gridRefreshState = inject('gridRefresh');

      // 통합코드값 그리드 할당
      const codeValueFetchData = async (codeValueParams, selectCodeRow) => {
        console.log('selectCodeRow ===========', selectCodeRow);

        if (selectCodeRow === null) {
          selectedNameRow.value.unityCodeKoreanName = '';
          selectedNameRow.value.unityCodeName = '';
          rowDataRight.value = [];
          return;
        }

        const unityCodeValueList = await getCodeValueSearchJob(codeValueParams);
        console.log('unityCodeValueList ================', unityCodeValueList);

        if (unityCodeValueList.status === 409) {
          console.log(
            'unityCodeValueList ================',
            unityCodeValueList
          );
          rowDataRight.value = [];
          emit('selected-codeName', null);
          return;
        }

        const codeValueTemp = [];
        const codeValues = unityCodeValueList.data;

        console.log('codeValues : ', codeValues);

        for (let i = 0; i < codeValues.length; i++) {
          codeValueTemp.push({
            id: i,
            no: i + 1,
            unityCodeValue: codeValues[i].unityCode.valueInfo,
            unityCodeValueName: codeValues[i].unityCode.valueName,
            unityCodeValueInof: codeValues[i].unityCode.valueInfo,
            parentCode: [
              {
                id: 0,
                type: codeValues[i].parentCode.dictionary.type.name,
                label: codeValues[i].parentCode.info,
                color: codeValues[i].parentCode.dictionary.type.fontColor,
                bgColor:
                  codeValues[i].parentCode.dictionary.type.backgroundColor,
                dictionaryNmae: codeValues[i].parentCode.dictionary.name,
                size: 60,
              },
            ],

            referenceCode: [
              {
                id: 0,
                type: codeValues[i].referenceCode.dictionary.type.name,
                label: codeValues[i].referenceCode.info,
                color: codeValues[i].referenceCode.dictionary.type.fontColor,
                bgColor:
                  codeValues[i].referenceCode.dictionary.type.backgroundColor,
                dictionaryNmae: codeValues[i].parentCode.dictionary.name,
                name: codeValues[i].referenceCode.name,
                value: codeValues[i].referenceCode.value,
                size: 60,
              },
            ],

            updater: codeValues[i].updater,
            updateDateTime: codeValues[i].updateDateTime,
            unityDictionaryId: codeValues[i].unityCode.dictionaryId,
            unityCodeName: selectCodeRow.unityCodeName,
            codeTypeName: selectCodeRow.codeTypeName,
          });
        }
        rowDataRight.value = codeValueTemp;

        if (rowDataRight.value.length > 0) {
          // 첫 번째 행의 데이터를 이벤트를 통해 상위 컴포넌트로 전달
          if (rowDataRight.value.length > 0) {
            nextTick(() => {
              const selectedRow = document.querySelectorAll(
                '.grid-right [class~="ag-row-selected"]'
              );
              // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
              selectedRow.forEach((node) => {
                node.classList.remove('ag-row-selected');
              });

              const firstCodeValueRowData =
                agGridRight.value.gridApi.getDisplayedRowAtIndex(0);
              console.log('Right Grid ========', firstCodeValueRowData);

              if (firstCodeValueRowData) {
                console.log(
                  'firstRowData =============',
                  firstCodeValueRowData
                );
              }
            });
          }
        }
      };

      // 코드등록 - 코드명 목록 조회
      const codeNameSearchJob = async (researchJobQuery) => {
        const response = await getCodeNameSearchJob(researchJobQuery);
        console.log('codeNameSearchJobData : ', response);

        if (response.status === 409) {
          console.log('codeNameSearchJobData : ', response);
          rowDataLeft.value = [];
          rowDataRight.value = [];
          resultCount.value.count = 0;
          resultCount.value.total = 0;
          codeValueFetchData(null, null);
          emit('selected-codeName', null);
          return;
        }

        const unityCodeNameList = await getCodeNameSearchJob(researchJobQuery);

        //조회결과 반영
        resultCount.value.count = Number(
          unityCodeNameList.data.searchCount
        ).toLocaleString();
        resultCount.value.total = Number(
          unityCodeNameList.data.totalCount
        ).toLocaleString();

        const codeNames = unityCodeNameList.data.codeNames;

        const codeNameTemp = [];
        for (let i = 0; i < codeNames.length; i++) {
          codeNameTemp.push({
            id: i,
            no: i + 1,
            unityCodeKoreanName: [
              {
                id: 0,
                type: codeNames[i].unityCode.dictionary.type.name,
                label: codeNames[i].unityCode.koreanNameInfo,
                color: codeNames[i].unityCode.dictionary.type.fontColor,
                bgColor: codeNames[i].unityCode.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            unityCodeName: codeNames[i].unityCode.name,
            unityCodeDictionaryId: codeNames[i].unityCode.dictionary.id,
            codeTypeName: codeNames[i].unityCode.typeName,
            dataTypeName: codeNames[i].dataTypeName,
            counter: true,
            updater: codeNames[i].updater,
            updateDateTime: codeNames[i].updateDateTime,
          });
        }
        rowDataLeft.value = codeNameTemp;

        console.log(' rowDataLeft ', rowDataLeft.value);

        if (rowDataLeft.value.length === 0) {
          let unityCodeValueQuery = {
            managementInstituteId: useMetaMngInstId,
            userId: userInfo.value.userId,
            unityCodeDictionaryId: 0,
            unityCodeName: '',
          };
          codeValueFetchData(unityCodeValueQuery);
        }

        if (rowDataLeft.value.length > 0) {
          // 첫 번째 행의 데이터를 이벤트를 통해 상위 컴포넌트로 전달
          if (rowDataLeft.value.length > 0) {
            nextTick(() => {
              const firstRowData =
                agGridLeft.value.gridApi.getDisplayedRowAtIndex(0);

              const nodesWithRowId0 = document.querySelector('[row-id="0"]');
              console.log('nodeWithRowId0 ========', nodesWithRowId0);

              if (nodesWithRowId0) {
                nodesWithRowId0.classList.add('ag-row-selected');
                nodesWithRowId0.classList.add('ag-row-focus');
                nodesWithRowId0.setAttribute('aria-selected', true);
              }

              if (firstRowData) {
                emit('selected-codeName', firstRowData);
                console.log('firstRowData =============', firstRowData);

                selectedNameRow.value = firstRowData.data;

                console.log('최초 선택 데이터 ===', selectedNameRow);

                const codeValueParams = {
                  managementInstituteId: useMetaMngInstId,
                  userId: userInfo.value.userId,
                  unityCodeDictionaryId:
                    firstRowData.data.unityCodeDictionaryId,
                  unityCodeName: firstRowData.data.unityCodeName,
                };

                let unityCodeValueQuery = {
                  unityCodeDictionaryId:
                    firstRowData.data.unityCodeDictionaryId,
                  unityCodeName: firstRowData.data.unityCodeName,
                };
                codeValueFetchData(codeValueParams, firstRowData.data);

                setCodeJobSelectData(firstRowData.data);
              }
            });
          }
        }

        return await codeNameTemp;
      };

      let inputQuery = ref('');

      async function onGridSearchClicked(textValue) {
        rowDataLeft.value = [];

        const sortedColumn = columnDefs.value.find((col) => col.sort);

        const sortQuery = sortedColumn
          ? `${sortedColumn.headerName} ${sortedColumn.sort}`
          : '';

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

        const transformedQuery = transformQuery(textValue);

        if (searchType.value === 'natural-query' && textValue !== '') {
          const searchInfo = {
            gridId: codeNameSearchGridId.value,
            query: textValue,
          };
          const llmAnswer = await getCreateQuery(searchInfo);

          // 컬럼 업데이트
          await columnDefsUpdate(
            llmAnswer.data.sort,
            columnDefs,
            codeNameSearchGridId.value,
            gridApi
          );

          inputQuery.value = llmAnswer.data.where;
          searchInput.value = textValue;

          const researchQuery = {
            dictionaryId: useDctnryId,
            lastItem: {
              managementInstituteId: useMetaMngInstId,
              userId: userInfo.value.userId,
            },
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
          };

          // 정렬조건이 있는 경우
          await codeNameSearchJob(researchQuery);
        } else {
          const chgTextValue = textValue.replace(/\n/g, ' ');
          if (textValue != null) {
            //대문자로 변환
            const upperTextValue = chgTextValue.trim();
            if (basicWhereQueryCheck(transformedQuery) === 'PASS') {
              console.log('PASS WORD');

              const researchQuery = {
                dictionaryId: useDctnryId,
                lastItem: {
                  managementInstituteId: useMetaMngInstId,
                  userId: userInfo.value.userId,
                },
                query: transformedQuery,
                sort: sortQuery,
              };

              // 코드명 조회
              codeNameSearchJob(researchQuery);

              //codeNamefetchData(researchQuery);

              inputQuery.value = transformedQuery;
              searchInput.value = upperTextValue;

              console.log('upperTextValue ===', transformedQuery);
            } else {
              const alertMsgText = ref('');
              switch (basicWhereQueryCheck(transformedQuery)) {
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
            codeNameSearchJob();
          }
        }
      }

      const agGridLeft = ref(null);
      const agGridRight = ref(null);

      // codeValueColumnDefs.value = gridColumnDefs.value.MFGRD044;
      // console.log(
      //   'codeValueColumnDefs.value : ',
      //   codeValueColumnDefs.value
      // );

      // 헤더 이동 추가 코드
      const gridApi = ref(null);

      const codeNameGridApi = ref(null);
      const codeValueGridApi = ref(null);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);

        codeNameGridApi.value = params;
        codeValueGridApi.value = params;
      };

      const searchType = ref('query');
      const searchInput = ref('');

      const handleChangeSearchType = (searchTypeData) => {
        console.log('handleChangeSearchType : ', searchTypeData);
        searchType.value = searchTypeData;
      };

      const newColumnDefs = ref([]);

      // 헤더 클릭 정렬 이벤트
      const handleSortChanged = async (newSortedState) => {
        console.log('newSortedState : ', newSortedState);

        if (newSortedState.length != 0) {
          // 통합코드값 소팅의 경우 실행 중지
          if (newSortedState[0].colId === 'unityCodeValueName') {
            return;
          } else if (newSortedState[0].colId === 'unityCodeValue') {
            return;
          } else if (newSortedState[0].colId === 'referenceCode') {
            return;
          } else if (newSortedState[0].colId === 'updater') {
            return;
          } else if (newSortedState[0].colId === 'updateDateTime') {
            return;
          } else if (newSortedState[0].colId === 'parentCode') {
            return;
          }
        }

        const sortQuery = ref('');
        const sortState = reactive({});

        //sortState.value = newSortedState;

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
          rowDataLeft.value.length > 0
            ? rowDataLeft.value[rowDataLeft.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            dictionaryId: useDctnryId,
            lastItem: {
              managementInstituteId: useMetaMngInstId,
              userId: userInfo.value.userId,
            },
            query: inputQuery.value,
          };

          //const codeSortData = await codeNamefetchData(researchQuery);
          const codeSortData = await codeNameSearchJob(researchQuery);
          console.log('codeSortData : ', codeSortData);

          //const sortTermGridData = bindingWordRowData(wordSortData);
          rowDataLeft.value = codeSortData;
        } else {
          // 단일 정렬 조건 및 순서 설정 (기존 코드)
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          const researchQuery = {
            dictionaryId: useDctnryId,
            lastItem: {
              managementInstituteId: useMetaMngInstId,
              userId: userInfo.value.userId,
            },
            query: inputQuery.value,
            sort: sortQuery.value,
          };

          const codeSortData = await codeNameSearchJob(researchQuery);
          console.log('codeSortData : ', codeSortData);

          rowDataLeft.value = codeSortData;
        }
      };

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      function handleColumnStateChanged(newColumnState) {
        console.log('컬럼 이동 핸들러 동작 ====');

        console.log('newColumnState : ', newColumnState);

        // newColumnState 배열에 unityCodeValue가 포함되어 있는지 확인
        const changedColumnDefault = newColumnState.some(
          (colState) => colState.colId === 'unityCodeValue'
        )
          ? codeValueColumnDefs
          : columnDefs;

        console.log('changedColumnDefault : ', changedColumnDefault);

        // 새 컬럼 헤드 정의
        const newColumnFcDefs = newColumnState
          .map((colState) => {
            const colDef = changedColumnDefault.value.find(
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
              colDef.field === 'wordName' ||
              colDef.field === 'domainClassName'
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
              valueFormatter: valueFormatter,
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

        changedColumnDefault.value = newColumnFcDefs;
        newColumnDefs.value = newColumnFcDefs;

        changedColumnDefault.value = newColumnFcDefs;

        let gridId = '';
        if (changedColumnDefault.value.length === 5) {
          gridId = 'MFGRD043';
        } else {
          gridId = 'MFGRD044';
        }

        // localStorage에 에서 gridData json 파싱, mfgrd009에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridId : ', gridId);
        console.log('gridStorage[gridId] :', gridStorage[gridId]);
        gridStorage[gridId] = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);

        // 스토어에 저장
        uiStore.setGridColumnDefs(gridId, newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(async () => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD044) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD043;
        codeValueColumnDefs.value = gridColumnDefs.value.MFGRD044;

        // 통합코드명 할당
        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          // 필드 값에 따라 조건부로 valueFormatter 설정
          if (
            col.field === 'unityCodeKoreanName' ||
            col.field === 'parentCode' ||
            col.field === 'referenceCode'
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
            minWidth: col.minWidth,
            sort: col.sort,
            sortIndex: col.sortIndex,
            comparator: () => 0,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });

        // 통합코드값 할당
        codeValueColumnDefs.value = codeValueColumnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          // 필드 값에 따라 조건부로 valueFormatter 설정
          if (
            col.field === 'unityCodeKoreanName' ||
            col.field === 'parentCode' ||
            col.field === 'referenceCode'
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
            minWidth: col.minWidth,
            sort: col.sort,
            sortIndex: col.sortIndex,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });

        if (gridRefreshState.value == true) {
          const sortedColumn = columnDefs.value.find((col) => col.sort);

          const sortQuery = sortedColumn
            ? `${sortedColumn.headerName} ${sortedColumn.sort}`
            : '';

          const resaerhJobQuery = {
            dictionaryId: useDctnryId,
            lastItem: {
              managementInstituteId: useMetaMngInstId,
              userId: userInfo.value.userId,
            },
            query: inputQuery.value,
            sort: sortQuery,
          };
          console.log('gridRefreshState.value == true');
          const response = await codeNameSearchJob(resaerhJobQuery);

          gridRefreshState.value = false;
        }
      });

      const codeValueInsert = (event) => {
        console.log('codeValueInsert');

        // 클릭된 요소에 클래스 추가
        const clickedElement = event.currentTarget;
        clickedElement.classList.add('clicked');

        // 일정 시간 후 클래스 제거
        setTimeout(() => {
          clickedElement.classList.remove('clicked');
        }, 400); // 300ms 후 제거 (시간은 필요에 따라 조정 가능)

        if (rowDataRight.value.length === 0) {
          setIsCodeJobType('noData');
          nextTick(() => {
            setCodeJobSelectData(null);
          });
        }
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

      const onSearchRemove = async () => {
        console.log('onSearchRemove 함수 실행 ===');

        // 그리드 기본값 호출
        const gridDefaultData = await getGridDefaultData(
          codeNameSearchGridId.value
        );
        const codeValueGridDefaultData = await getGridDefaultData(
          codeValueSearchGridId.value
        );

        console.log('gridDefaultData : ', gridDefaultData);

        // 기본값 설정
        await setUserGridSetting(codeNameSearchGridId.value, gridDefaultData);
        await setUserGridSetting(
          codeValueSearchGridId.value,
          codeValueGridDefaultData
        );

        const transformedData = transformGridData(gridDefaultData);
        const transfromCodeValue = transfromCodeValueGrid(
          codeValueGridDefaultData
        );

        // 2. 스토어 상태 업데이트
        uiStore.setGridColumnDefs(codeNameSearchGridId.value, columnDefs.value);

        uiStore.setGridColumnDefs(
          codeValueSearchGridId.value,
          transfromCodeValue
        );

        // 3. 로컬상태 업데이트
        columnDefs.value = transformedData;
        codeValueColumnDefs.value = transfromCodeValue;

        // 4. 그리드 업데이트
        codeValueGridApi.value.setGridOption(
          'columnDefs',
          codeValueColumnDefs.value
        );
        codeNameGridApi.value.setGridOption('columnDefs', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[codeNameSearchGridId.value] = transformedData;
        gridStorage[codeValueSearchGridId.value] = transfromCodeValue;

        saveGridInfoToStorage(gridStorage);

        // await updateGridData(termQuery);

        console.log('inputQuery.value : ', inputQuery.value);
        inputQuery.value = '';
        searchInput.value = '';
        const researchQuery = {
          dictionaryId: useDctnryId,
          lastItem: {
            managementInstituteId: useMetaMngInstId,
            userId: userInfo.value.userId,
          },

          query: inputQuery.value,
        };
        codeNameSearchJob(researchQuery);
      };

      const onFilterWindowClosed = async (filterSet) => {
        // 필터 창이 닫힐 때 수행하고 싶은 로직
        console.log('필터 창이 닫혔습니다.');

        if (filterSet) {
          // 정렬이 적용된 모든 열을 찾습니다.
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
            lastItem: {
              managementInstituteId: useMetaMngInstId,
              userId: userInfo.value.userId,
            },
            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          // const codeFilterData = await getCodeNameSearchJob(researchQuery);
          codeNameSearchJob(researchQuery);

          inputQuery.value = filterSet.searchQuery;
          searchInput.value = filterSet.searchQuery;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD043 : ', gridStorage.MFGRD043);
          columnDefs.value = gridStorage.MFGRD043;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD043);
        }
      };

      // 코드명 그리드 데이터 추가 함수
      const addGridRowData = async (researchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowDataLeft.value;

          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGridLeft.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);

          const lastItem =
            rowDataLeft.value.length > 0
              ? rowDataLeft.value[rowDataLeft.value.length - 1]
              : null;

          const unityCodeNameList = await getCodeNameSearchJob(researchQuery);

          console.log('unityCodeNameList =============', unityCodeNameList);

          const codeNames = unityCodeNameList.data.codeNames;

          console.log('codeNames =============', codeNames);

          const newGridData = [];

          for (let i = 0; i < codeNames.length; i++) {
            newGridData.push({
              id: oldGridData.length + i,
              no: oldGridData.length + i + 1,
              unityCodeKoreanName: [
                {
                  id: 0,
                  type: codeNames[i].unityCode.dictionary.type.name,
                  label: codeNames[i].unityCode.koreanName,
                  color: codeNames[i].unityCode.dictionary.type.fontColor,
                  bgColor:
                    codeNames[i].unityCode.dictionary.type.backgroundColor,
                  size: 60,
                },
              ],
              unityCodeName: codeNames[i].unityCode.name,
              unityCodeDictionaryId: codeNames[i].unityCode.dictionary.id,
              codeTypeName: codeNames[i].unityCode.typeName,
              dataTypeName: codeNames[i].dataTypeName,
              updater: codeNames[i].updater,
              updateDateTime: codeNames[i].updateDateTime,
            });
          }

          // 재조회 후 rowData에 할당.
          rowDataLeft.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(rowDataLeft.value.length);

          const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
          console.log(
            'lastVisibleRowIndex =================',
            lastVisibleRowIndex
          );
          // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
          agGridLeft.value.gridApi.ensureIndexVisible(
            currentRowIndex.value,
            'top'
          );
        } catch (error) {
          console.error(error);
        }
      };

      const currentRowIndex = ref(0);

      // 그리드 스크롤 이벤트 함수
      const handleScrollChanged = (endScrollStaus) => {
        if (endScrollStaus === 'Y' && rowDataLeft.value != null) {
          const lastRowNode =
            agGridLeft.value.gridApi.getRenderedNodes()[
              agGridLeft.value.gridApi.getRenderedNodes().length - 1
            ];

          currentRowIndex.value = lastRowNode.rowIndex;
          console.log(
            'currentRowIndex.value ================',
            currentRowIndex.value
          );

          const lastItem =
            rowDataLeft.value.length > 0
              ? rowDataLeft.value[rowDataLeft.value.length - 1]
              : null;

          const sortQuery = getSortQuery();

          let codeNameResearchQuery = {
            dictionaryId: useDctnryId,
            lastItem: {
              managementInstituteId: useMetaMngInstId,
              userId: userInfo.value.userId,
              unityCodeKoreanName: lastItem.unityCodeKoreanName[0].label,
              unityCodeName: lastItem.unityCodeName,
              unityCodeDictionaryId: lastItem.unityCodeDictionaryId,
              dataTypeName: lastItem.dataTypeName,
              unityCodeTypeName: lastItem.codeTypeName,
            },
            query: inputQuery.value,
            sort: sortQuery,
          };

          console.log(
            'codeNameResearchQuery =============',
            codeNameResearchQuery
          );

          addGridRowData(codeNameResearchQuery);
        }
      };

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

      // 작업완료 여부
      watch(
        () => isCodeJobApproval.value,
        (newVal) => {
          console.log('isCodeJobApproval.value newVal : ', newVal);
          if (newVal) {
            console.log('isCodeJobApproval.value newVal : ', newVal);
            const sortQuery = getSortQuery();

            const resaerhJobQuery = {
              dictionaryId: useDctnryId,
              lastItem: {
                managementInstituteId: useMetaMngInstId,
                userId: userInfo.value.userId,
              },
              query: inputQuery.value,
              sort: sortQuery,
            };

            codeNameSearchJob(resaerhJobQuery);
            setIsCodeJobApproval(false);
          }
        }
      );

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
          codeNameSearchGridId.value,
          gridApi
        );

        const researchQuery = {
          dictionaryId: useDctnryId,
          lastItem: {
            managementInstituteId: useMetaMngInstId,
            userId: userInfo.value.userId,
          },
          query: inputQuery.value,
          sort: llmAnswer.sort,
        };

        await codeNameSearchJob(researchQuery);
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        const fieldMapping = {
          no: 'NO',
          unityCodeName: 'UNTY_CD_NM',
          unityCodeKoreanName: 'UNTY_CD_KORN_NM',
          codeTypeName: 'UNTY_CD_TYPE_NM',
          dataTypeName: 'DATA_TYP_NM',
        };
        const newGridStting = columnDefs.value.map((item, index) => {
          const articleName = fieldMapping[item.field];

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

        const codeValueFieldMapping = {
          no: 'NO',
          unityCodeValue: 'UNTY_CD_VL',
          unityCodeValueName: 'UNTY_CD_VL_NM',
          parentCode: 'UP_CD_INFO',
          referenceCode: 'RFRNC_CD_INFO',
          updater: 'UPDR_INFO',
          updateDateTime: 'UPD_DTM',
        };

        const newCodeValueGridSet = codeValueColumnDefs.value.map(
          (item, index) => {
            const articleName = codeValueFieldMapping[item.field];

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
          }
        );

        console.log('newGridStting : ', newGridStting);

        await setUserGridSetting(codeNameSearchGridId.value, newGridStting);
        await setUserGridSetting(
          codeValueSearchGridId.value,
          newCodeValueGridSet
        );
        // updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장 하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      return {
        agGridLeft,
        agGridRight,
        rowDataLeft,
        rowDataRight,
        codeValueFetchData,
        resultCount,
        onGridSearchClicked,
        selectedRow,
        selectedNameRow,
        handleColumnStateChanged,
        handleSetGridApi,
        handleSortChanged,
        gridInfoDefs,
        columnDefs, // 통합코드명 그리드 헤더 데이터
        codeValueColumnDefs, // 통합코드값 그리드 헤더 데이터
        confirmDeleteDctnrySrchTab2State,
        onSearchRemove,
        onDeleteDctnrySrchWrdGridUserStng,
        onFilterWindowClosed,
        inputQuery,
        userInfo,
        useMetaMngInstId,
        codeValueInsert,
        handleScrollChanged,
        setCodeNameJobData,
        setCodeValueJobData,
        setIsCodeJobType,
        setCodeJobSelectData,
        getIsCodeJobType,
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        handleBindQuery,
        codeNameSearchGridId,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        codeNameGridApi,
        codeValueGridApi,
        handleChangeSearchType,
        searchInput,
      };
    },
  };
</script>
