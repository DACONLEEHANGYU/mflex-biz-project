<template>
  <div class="tab-inner pb5">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
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
    @close="onCloseChatbotWindow"
    :moveState="true"
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
    onMounted,
    watchEffect,
    onBeforeMount,
  } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { basicWhereQueryCheck } from '@/utils/utils.js';
  import { columnDefsUpdate, getSortQuery } from '@/utils/js/searchModule';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import {
    getUnityCodeVauleList,
    getResaerchCode,
  } from '@/utils/mflexApi/dictionarySearchApi';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import AppTree from '@/components/ui/AppTree.vue';
  import { DragCol } from 'vue-resizer';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
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
      ChatbotBtn,
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
          const selectedRow = document.querySelectorAll(
            '.grid-left [class~="ag-row-selected"]'
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
          console.log('코드값 그리드 선택');
          let unityCodeValueQuery = {
            unityCodeDictionaryId: value.unityCodeDictionaryId,
            unityCodeName: value.unityCodeName,
          };
          this.codeValueFetchData(unityCodeValueQuery, value);
          //상위로 전다
          this.$emit('selected-codeName', value);
        } else {
          this.$emit('selected-codeValue', value);
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
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
        this.selectedRow = null;
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
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
      const { gridColumnDefs } = storeToRefs(uiStore);

      // 사전ID
      const useDctnryId = userStngInfo.value.useDctnryId;

      const sortStateQuery = ref('');

      const codeNameSearchGridId = ref('MFGRD029');
      const codeValueSearchGridId = ref('MFGRD030');

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
              fieldName === 'dataTypeName' ||
              fieldName === 'updater' ||
              fieldName === 'updateDateTime'
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

      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(
            codeNameSearchGridId.value
          );

          const codeValueGridSets = await getUserGridSetting('MFGRD030');

          console.log('codeValueGridSets ==== ', codeValueGridSets);

          const transformedData = transformGridData(userGridData);
          const transfromCodeValue = transfromCodeValueGrid(codeValueGridSets);
          console.log('Transformed Grid Data:', transformedData);
          return { transformedData, transfromCodeValue }; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      onBeforeMount(async () => {
        console.log('termSearch beforeMount  ========================');

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[codeNameSearchGridId.value] : ',
          gridStorage[codeNameSearchGridId.value]
        );

        if (!gridStorage[codeNameSearchGridId.value]) {
          try {
            const gridData = await getGridInfo();

            console.log(
              'gridData.transfromCodeValue : ',
              gridData.transfromCodeValue
            );

            // transformedData를 직접 받아서 처리
            const transformedData = gridData.transformedData;
            const transfromCodeValue = gridData.transfromCodeValue;

            // columnDefs 설정
            columnDefs.value = transformedData;
            codeValueColumnDefs.value = transfromCodeValue;

            const gridStorage = JSON.parse(getGridInfoFromStorage());
            console.log(
              'gridStorage[gridId] :',
              gridStorage[codeNameSearchGridId.value]
            );
            gridStorage[codeNameSearchGridId.value] = transformedData;

            gridStorage[codeValueSearchGridId.value] = transfromCodeValue;

            console.log('gridStorage: ', gridStorage);

            saveGridInfoToStorage(gridStorage);
            // 로컬스토레지에 저장

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD029', columnDefs.value);
            uiStore.setGridColumnDefs('MFGRD030', codeValueColumnDefs.value);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
              gridApi.value.setGridOption(
                'columnDefs',
                codeValueColumnDefs.value
              );
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
          columnDefs.value = gridStorage[codeNameSearchGridId.value];
          codeValueColumnDefs.value = gridStorage[codeValueSearchGridId.value];
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

      // 통합코드명 그리드 할당
      const codeNamefetchData = async (researchQuery) => {
        let unityCodeNameList;
        if (researchQuery != null) {
          unityCodeNameList = await getResaerchCode(researchQuery);
        } else {
          unityCodeNameList = await getResaerchCode(researchQuery);
        }

        if (unityCodeNameList.status === 200) {
          console.log('if unityCodeNameList ============', unityCodeNameList);

          //조회결과 반영
          resultCount.value.count = Number(
            unityCodeNameList.data.searchCount
          ).toLocaleString();
          resultCount.value.total = Number(
            unityCodeNameList.data.totalCount
          ).toLocaleString();
        } else {
          resultCount.value.count = 0;
          resultCount.value.total = 0;
          rowDataLeft.value = [];
          rowDataRight.value = [];
          selectedNameRow.value = {};

          emit('selected-codeName', null);
          emit('selected-codeValue', null);

          return;
        }

        console.log('unityCodeNameList ============', unityCodeNameList);
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
                label: codeNames[i].unityCode.koreanName,
                color: codeNames[i].unityCode.dictionary.type.fontColor,
                bgColor: codeNames[i].unityCode.dictionary.type.backgroundColor,
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
        rowDataLeft.value = codeNameTemp;

        console.log(' rowDataLeft ', rowDataLeft.value);

        if (rowDataLeft.value.length === 0) {
          let unityCodeValueQuery = {
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
              // .ag-row-selected 클래스를 추가합니다.

              if (firstRowData) {
                //emit('first-row-selected', firstRowData);
                emit('selected-codeName', firstRowData);
                console.log('firstRowData =============', firstRowData);

                selectedNameRow.value = firstRowData.data;

                console.log('최초 선택 데이터 ===', selectedNameRow);

                let unityCodeValueQuery = {
                  unityCodeDictionaryId:
                    firstRowData.data.unityCodeDictionaryId,
                  unityCodeName: firstRowData.data.unityCodeName,
                };
                codeValueFetchData(unityCodeValueQuery, firstRowData.data);
              }
            });
          }
        }

        return await codeNameTemp;
      };

      // 통합코드값 그리드 할당
      const codeValueFetchData = async (unityCodeValueQuery, selectCodeRow) => {
        console.log('selectCodeRow ===========', selectCodeRow);
        const unityCodeValueList = await getUnityCodeVauleList(
          unityCodeValueQuery
        );
        console.log('unityCodeValueList ================', unityCodeValueList);

        if (unityCodeValueList.data.length === 0) {
          rowDataRight.value = [];
          emit('selected-codeValue', null);
          return;
        }

        const codeValueTemp = [];
        const codeValues = unityCodeValueList.data;

        for (let i = 0; i < codeValues.length; i++) {
          codeValueTemp.push({
            id: i,
            no: i + 1,
            unityCodeValue: codeValues[i].unityCode.value,
            unityCodeValueName: codeValues[i].unityCode.valueName,
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
        /*  console.log(
            'selectedCodeValue.value ==============',
            selectedCodeValue
          ); */
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
              const nodesWithRowId0 = document.querySelector(
                '.grid-right [row-id="0"]'
              );
              console.log('nodeWithRowId0 ========', nodesWithRowId0);

              if (nodesWithRowId0) {
                // .ag-row-selected 클래스를 추가합니다.
                nodesWithRowId0.classList.add('ag-row-selected');
                nodesWithRowId0.classList.add('ag-row-focus');
                nodesWithRowId0.setAttribute('aria-selected', true);
              }

              if (firstCodeValueRowData) {
                //emit('first-row-codevalue', firstCodeValueRowData);
                emit('selected-codeValue', firstCodeValueRowData);
                console.log(
                  'firstRowData =============',
                  firstCodeValueRowData
                );
              }
            });
          }
        }
      };

      let inputQuery = ref('');

      async function onGridSearchClicked(textValue) {
        rowDataLeft.value = [];

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
            query: llmAnswer.data.where,
          };

          // 정렬조건이 있는 경우
          if (llmAnswer.data.sort == '') {
            await codeNamefetchData(researchQuery);
          }
        } else {
          const chgTextValue = textValue.replace(/\n/g, ' ');
          if (textValue != null) {
            //대문자로 변환
            // const upperTextValue = chgTextValue.trim().toUpperCase();
            const upperTextValue = transformQuery(chgTextValue).trim();
            if (basicWhereQueryCheck(upperTextValue) === 'PASS') {
              console.log('PASS WORD');

              const researchQuery = {
                dictionaryId: useDctnryId,
                query: upperTextValue,
              };

              codeNamefetchData(researchQuery);

              inputQuery.value = upperTextValue;
              searchInput.value = textValue;

              console.log('upperTextValue ===', upperTextValue);
              /* defaultParamData.paramWhereQuery = upperTextValue;
            defaultParamData.paramLastDataInfo = ''; */
              //fetchData();
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
              /* const { setAlertStatus } = useAlert();
            setAlertStatus({
              view: true,
              message:
                '입력한 문자열이 유효한 유형이 아닙니다.' + alertMsgText.value,
            }); */
              return false;
            }
          } else {
            //defaultParamData.paramWhereQuery = '';
            codeNamefetchData();
          }
        }
      }

      const agGridLeft = ref(null);
      const agGridRight = ref(null);

      // // 코드 그리드 헤더 데이터
      // const initializeGridColumnDefs = () => {
      //   const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
      //   if (storedColumnDefs && storedColumnDefs.MFGRD029) {
      //     uiStore.setGridColumnDefs('MFGRD029', storedColumnDefs.MFGRD029);
      //     uiStore.setGridColumnDefs('MFGRD030', storedColumnDefs.MFGRD030);
      //   }
      // };

      // initializeGridColumnDefs();

      // 통합코드명 그리드 헤더 데이터
      // const columnDefs = ref([]);
      // columnDefs.value = gridColumnDefs.value.MFGRD029;

      // 통합코드값 그리드 헤더 데이터

      // 헤더 이동 추가 코드
      const gridApi = ref(null);

      const codeNameGridApi = ref(null);
      const codeValueGridApi = ref(null);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        codeNameGridApi.value = params;
        codeValueGridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
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

        // 통합코드값 소팅의 경우 실행 중지
        if (newSortedState.length != 0) {
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
            query: inputQuery.value,
          };

          const codeSortData = await codeNamefetchData(researchQuery);
          console.log('codeSortData : ', codeSortData);

          rowDataLeft.value = codeSortData;
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          const researchQuery = {
            dictionaryId: useDctnryId,
            query: inputQuery.value,
            sort: sortQuery.value,
          };

          const codeSortData = await codeNamefetchData(researchQuery);
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

        //columnFcDefs.value = newColumnFcDefs; */

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        //gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
        changedColumnDefault.value = newColumnFcDefs;
        newColumnDefs.value = newColumnFcDefs;

        changedColumnDefault.value = newColumnFcDefs;

        let gridId = '';
        if (changedColumnDefault.value.length === 5) {
          gridId = 'MFGRD029';
        } else {
          gridId = 'MFGRD030';
        }

        // localStorage에 에서 gridData json 파싱, mfgrd009에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage[gridId] :', gridStorage[gridId]);
        gridStorage[gridId] = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);

        // 스토어에 저장
        uiStore.setGridColumnDefs(gridId, newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        console.log('gridColumnDefs : ', gridColumnDefs.value);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD030) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD029;
        codeValueColumnDefs.value = gridColumnDefs.value.MFGRD030;

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
          } else if (col.field === 'rvsnDt') {
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
          } else if (col.field === 'rvsnDt') {
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
      });

      onMounted(() => {
        console.log('onMounted ========================');

        const sortedColumns = columnDefs.value
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

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: inputQuery.value,
          sort: sortQuery,
        };

        codeNamefetchData(researchQuery);
        //initializeGridColumnDefs();
      });

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
        // 그리드 기본값 호출
        const gridDefaultData = await getGridDefaultData(
          codeNameSearchGridId.value
        );
        const codeValueGridDefaultData = await getGridDefaultData(
          codeValueSearchGridId.value
        );

        console.log('gridDefaultData : ', gridDefaultData);
        console.log('codeValueGridDefaultData : ', codeValueGridDefaultData);

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

        console.log('transformedData : ', transformedData);

        codeValueColumnDefs.value = transfromCodeValue;
        columnDefs.value = transformedData;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        // gridStorage[codeNameSearchGridId.value] = transformedData;
        gridStorage[codeValueSearchGridId.value] = transfromCodeValue;

        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(codeNameSearchGridId.value, columnDefs.value);
        codeNameGridApi.value.setGridOption('columnDefs', columnDefs.value);

        uiStore.setGridColumnDefs(
          codeValueSearchGridId.value,
          transfromCodeValue
        );
        codeValueGridApi.value.setGridOption('columnDefs', transfromCodeValue);

        const researchQuery = {
          dictionaryId: useDctnryId,
          query: inputQuery.value,
        };
        codeNamefetchData(researchQuery);
      };

      const onFilterWindowClosed = async (filterSet) => {
        // 필터 창이 닫힐 때 수행하고 싶은 로직
        console.log('필터 창이 닫혔습니다.');

        if (filterSet) {
          inputQuery.value = filterSet.searchQuery;
          searchInput.value = filterSet.searchQuery;

          // 정렬이 적용된 모든 열을 찾습니다.
          const sortedColumns = columnDefs.value
            .filter((col) => col.sortIndex !== null && col.sort !== null)
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .map(
              (col) =>
                `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
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

          codeNamefetchData(researchQuery);
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD029 : ', gridStorage.MFGRD029);
          columnDefs.value = gridStorage.MFGRD029;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD029);
        }
      };

      // 코드명 그리드 데이터 추가 함수
      const addGridRowData = async (researchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowDataLeft.value;

          const unityCodeNameList = await getResaerchCode(researchQuery);

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

          const sortedColumns = columnDefs.value
            .filter((col) => col.sortIndex !== null && col.sort !== null)
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .map(
              (col) =>
                `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
            );

          console.log('lastItem : ', lastItem);
          const sortQuery = sortedColumns.join(', ');

          let codeNameResearchQuery = {
            dictionaryId: useDctnryId,
            lastItem: {
              unityCodeKoreanName: lastItem.unityCodeKoreanName[0].label,
              unityCodeName: lastItem.unityCodeName,
              unityCodeTypeName: lastItem.codeTypeName,
              dataTypeName: lastItem.dataTypeName,
              unityCodeDictionaryId: lastItem.unityCodeDictionaryId,
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
          query: inputQuery.value,
          sort: llmAnswer.sort,
        };

        codeNamefetchData(researchQuery);
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
        message: '그리드 설정 정보를 저장하시겠습니까?',
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
        handleScrollChanged,
        gridInfoDefs,
        columnDefs, // 통합코드명 그리드 헤더 데이터
        codeValueColumnDefs, // 통합코드값 그리드 헤더 데이터
        confirmDeleteDctnrySrchTab2State,
        onSearchRemove,
        onDeleteDctnrySrchWrdGridUserStng,
        onFilterWindowClosed,
        inputQuery,
        codeNameSearchGridId,
        onOpenChatbotWindow,
        chatbotWindowView,
        onCloseChatbotWindow,
        handleBindQuery,
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
