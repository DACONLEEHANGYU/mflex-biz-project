<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-s">
        컬럼한글명 목록
        <AppTooltip :htmlContent="getTooltipById('columnKoreanNameList')">
        </AppTooltip>
      </div>
    </div>
    <div class="grid-wrap column-grid">
      <div class="grid-top">컬럼명 : {{ columnDetails.columnName }}</div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="single"
          @rowClicked="onRowClicked"
          ref="agGrid"
        />
      </div>
    </div>

    <div>
      <div class="content-top pt5">
        <div class="title-s">
          컬럼한글명 정제
          <AppTooltip :htmlContent="getTooltipById('columnKoreanNameRefine')">
          </AppTooltip>
        </div>

        <div class="input-top">
          <div class="title-top">
            <div class="title-s">
              <div class="title-s-left"></div>
            </div>
            <div class="title-btns__row_btween">
              <div class="btns">
                <button class="btn-s green" @click="onSaveConfirm">저장</button>
                <!-- <button class="btn-s" @click="onCancelConfirm">취소</button> -->
                <button class="btn-s" @click="onResetConfirm">초기화</button>
              </div>
            </div>
          </div>
        </div>

        <div class="inputs-wrap" :class="{ 'highlight-effect': showAnimate }">
          <div class="input-form">
            <table class="input-table">
              <colgroup>
                <col width="15%" />
                <col width="30%" />
              </colgroup>
              <tbody>
                <tr>
                  <th class="required">*컬럼명</th>
                  <td class="manage-input-form-td" style="display: flex">
                    <div class="td-col">
                      {{ columnDetails.columnName }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*컬럼한글명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ columnDetails.columnKoreanName }}
                    </div>
                  </td>
                  <th>정제전 검토</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ columnDetails.columnKoreanNameErrorContents }}
                    </div>
                  </td>
                </tr>

                <tr>
                  <th class="required">*정제컬럼한글명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <input
                        class="input-text"
                        type="text"
                        style="width: 100%"
                        v-model="columnDetails.refinedColumnKoreanName"
                        placeholder=""
                      />
                    </div>
                  </td>
                  <th>정제후 검토</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ columnDetails.refinedColumnKoreanNameErrorContents }}
                    </div>
                  </td>
                </tr>

                <!-- <tr>
                  <th class="required">*표준구분</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <div class="flex-radio">
                        <div>
                          <input
                            type="radio"
                            name="standardDivision"
                            id="standard"
                            value="Y"
                            v-model="columnDetails.columnStandardYn"
                          />
                          <label for="standard">표준</label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            name="standardDivision"
                            id="none-standard"
                            value="N"
                            v-model="columnDetails.columnStandardYn"
                          />
                          <label for="none-standard">비표준</label>
                        </div>
                      </div>
                    </div>
                  </td>

                  <th>비표준사유</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <div>
                        <select
                          class="input-select"
                          style="width: 100%"
                          v-model="selectNonStandardReason"
                          :disabled="columnDetails.columnStandardYn === 'Y'"
                        >
                          <option
                            v-for="option in noneStandardReasonList"
                            :value="option"
                            :key="option.code"
                          >
                            {{ option.name }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr> -->
                <tr>
                  <th>연관테이블수</th>
                  <td class="manage-input-form-td">
                    <div class="td-col manage-input-div">
                      <input
                        class="input-text"
                        type="text"
                        placeholder=""
                        style="width: 100%"
                        v-model="columnDetails.tableCount"
                        readonly
                      />
                      <button
                        @click="onRelatedTable"
                        class="btn-s dark-gray ml5"
                      >
                        연관테이블조회
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>최종수정자</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ columnDetails.updater }}
                    </div>
                  </td>
                  <th>최종수정일시</th>
                  <td colspan="" class="manage-input-form-td">
                    <div class="td-col">
                      {{ columnDetails.updateDateTime }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <AppWindow
      :view="relatedTableListWindowView"
      @close="onCloseRelatedTableListWindow"
      width="1000px"
      height="auto"
    >
      <RelatedTableListWindow
        :columnDetails="columnDetails"
        @close="onCloseRelatedTableListWindow"
      />
    </AppWindow>

    <AppWindow>
      <RefineRuleWindow
        :view="refineRuleWindowView"
        @close="onCloseRefineRuleWindow"
        width="700px"
        height="auto"
      />
    </AppWindow>
  </div>

  <!-- 저장 알림창 -->
  <AppDialog
    v-model:view="saveConfirmState.view"
    :title="saveConfirmState.title"
    :message="saveConfirmState.message"
    @confirm="onRefine"
  />

  <!-- 초기화 알림창 -->
  <AppDialog
    v-model:view="resetConfirmState.view"
    :title="resetConfirmState.title"
    :message="resetConfirmState.message"
    @confirm="onReset"
  />

  <!-- 기타 사유 입력 팝업-->
  <AppWindow
    :view="additionalReasonsWindowView"
    @close="onCloseAdditionalReasonsWindow"
    width="550px"
    height="auto"
  >
    <AdditionalReasonsWindow
      @confirm="onAdditionalReasonsSave"
      @close="onCloseAdditionalReasonsWindow"
    />
  </AppWindow>
</template>

<script>
  import { ref, reactive, computed, watch, nextTick, onBeforeMount } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import {
    getActualizingColumnDistribution, // 컬럼한글명 분포도 조회
    updateActualizingColumnRefine, // 컬럼 한글명 단일 정제
    getActualizingNonStandardReason, // 비표준사유 조회
  } from '@/utils/mflexApi/actualizing/actualizingApi';

  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useActualizingStore } from '@/stores/actualizing';

  import RelatedTableListWindow from '@/components/popWindow/RelatedTableListWindow.vue';
  import AdditionalReasonsWindow from '@/components/popWindow/AdditionalReasonsWindow.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { storeToRefs } from 'pinia';

  export default {
    components: {
      AppTooltip,
      AppWindow,
      RelatedTableListWindow,
      AdditionalReasonsWindow,
    },
    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onRowClicked(value) {
        console.log('onRowClicked ', value);
        this.selectedRow = value;

        const selectedRow = document.querySelectorAll(
          '.column-grid [class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.column-grid [row-id="${clickNode}"]`
        );
        clickedNode.classList.add('ag-row-selected');

        // this.setDbInfo(value);
        this.bindingColumnKoreanName(value);
        this.rawColumnDetails = this.bindingColumnKoreanName(value);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props) {
      const actualizingStore = useActualizingStore();
      const { setIsSaveColumnRefine } = actualizingStore;
      const { selectColumnData } = storeToRefs(actualizingStore);

      const authStore = useAuthStore();
      const { userMetaMngInstListInfo, userStngInfo } = storeToRefs(authStore);

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const agGrid = ref(null);
      const rowData = reactive({});

      // const columnDefs = reactive([
      //   {
      //     headerName: '번호',
      //     field: 'no',
      //     cellClass: 'grid-cell-centered',
      //     width: 60,
      //   },
      //   {
      //     headerName: '컬럼한글명',
      //     field: 'columnKoreanName',
      //     cellClass: 'ag-left-aligned-cell',
      //     width: 250,
      //   },
      //   {
      //     headerName: '테이블수',
      //     field: 'tableCount',
      //     cellClass: 'grid-cell-centered',
      //     width: 140,
      //   },
      //   {
      //     headerName: '표준구분',
      //     field: 'columnStandardYnName',
      //     cellClass: 'grid-cell-centered',
      //     width: 120,
      //   },
      //   {
      //     headerName: '정제컬럼한글명',
      //     field: 'refinedColumnKoreanName',
      //     cellClass: 'ag-left-aligned-cell',
      //     width: 120,
      //   },
      //   {
      //     headerName: '정제전 검토',
      //     field: 'columnKoreanNameErrorContents',
      //     cellClass: 'ag-left-aligned-cell',
      //     width: 120,
      //     cellStyle: { color: 'red' },
      //   },
      //   {
      //     headerName: '정제후 검토',
      //     field: 'refinedColumnKoreanNameErrorContents',
      //     cellClass: 'ag-left-aligned-cell',
      //     width: 120,
      //     cellStyle: { color: 'red' },
      //   },
      // ]);

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
        },
        {
          headerName: '컬럼한글명',
          field: 'columnKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          cellStyle: (params) => {
            if (
              params.data.columnKoreanName !==
              params.data.refinedColumnKoreanName
            ) {
              return { color: 'red' };
            }
            return null;
          },
        },
        {
          headerName: '테이블수',
          field: 'tableCount',
          cellClass: 'grid-cell-centered',
          width: 140,
        },
        // {
        //   headerName: '표준구분',
        //   field: 'columnStandardYnName',
        //   cellClass: 'grid-cell-centered',
        //   width: 120,
        // },
        {
          headerName: '정제컬럼한글명',
          field: 'refinedColumnKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 120,
          cellStyle: (params) => {
            if (
              params.data.columnKoreanName !==
              params.data.refinedColumnKoreanName
            ) {
              return { backgroundColor: 'rgb(245 187 151)' };
            }
            return null;
          },
        },
        {
          headerName: '정제전 검토',
          field: 'columnKoreanNameErrorContents',
          cellClass: 'ag-left-aligned-cell',
          width: 120,
          cellStyle: { color: 'red' },
        },
        {
          headerName: '정제후 검토',
          field: 'refinedColumnKoreanNameErrorContents',
          cellClass: 'ag-left-aligned-cell',
          width: 120,
          cellStyle: { color: 'red' },
        },
      ]);

      const columnDetails = ref({
        instituteId: '',
        informationSystemId: '',
        databaseId: '',
        columnName: '',
        columnKoreanName: '',
        columnKoreanNameErrorContents: '',
        columnStandardYn: '',
        columnStandardYnName: '',
        currentNonStandardReasonCode: '',
        currentNonStandardReasonContents: '',
        refinedColumnKoreanName: '',
        refinedColumnKoreanNameErrorContents: '',
        schemaNameAggregate: '',
        tableCount: '',
        tableNameAggregate: '',
        updater: '',
        updateDateTime: '',
      });

      const rawColumnDetails = ref({});

      const noneStandardReasonList = ref([{ code: '0', name: '선택' }]);

      const selectNonStandardReason = ref(noneStandardReasonList.value[0]);

      const fetchData = async (researchData) => {
        // const testData = {
        //   instituteId: 2,
        //   informationSystemId: 15,
        //   databaseId: 15,
        //   columnName: 'SBSC_NO',
        //   columnKoreanName: '청약번호',
        // };

        const columnList = await getActualizingColumnDistribution(researchData);

        console.log('columnKoreanList : ', columnList);

        const sampleData = [];

        for (let i = 0; i < columnList.length; i++) {
          sampleData.push({
            id: i,
            databaseId: columnList[i].databaseId,
            informationSystemId: columnList[i].informationSystemId,
            instituteId: columnList[i].instituteId,
            no: i + 1,
            columnKoreanName: columnList[i].columnKoreanName,
            columnKoreanNameErrorContents:
              columnList[i].columnKoreanNameErrorContents,
            columnName: columnList[i].columnName,
            columnStandardYn:
              columnList[i].columnStandardYn === true ? 'Y' : 'N',
            columnStandardYnName: columnList[i].columnStandardYnName,
            currentNonStandardReasonCode:
              columnList[i].currentNonStandardReasonCode,
            currentNonStandardReasonContents:
              columnList[i].currentNonStandardReasonContents,
            refinedColumnKoreanName: columnList[i].refinedColumnKoreanName,
            refinedColumnKoreanNameErrorContents:
              columnList[i].refinedColumnKoreanNameErrorContents,
            schemaNameAggregate: columnList[i].schemaNameAggregate,
            tableCount: columnList[i].tableCount,
            tableNameAggregate: columnList[i].tableNameAggregate,
            updater: columnList[i].updater,
            updateDateTime: columnList[i].updateDateTime,
          });
        }

        rowData.value = sampleData;

        if (!researchData.refineState) {
          if (rowData.value.length > 0) {
            nextTick(async () => {
              const firstRowData =
                agGrid.value.gridApi.getDisplayedRowAtIndex(0);
              // 첫 행 select 효과
              const nodesWithRowId0 = document.querySelector(
                '.column-grid [row-id="0"]'
              );
              // .ag-row-selected 클래스를 추가합니다.
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
              bindingColumnKoreanName(firstRowData.data);
              rawColumnDetails.value = bindingColumnKoreanName(
                firstRowData.data
              ); // 초기값 저장
            });
          }
        }
      };

      // 정제 실행
      const onRefine = async () => {
        let reasonContents = '';

        if (selectNonStandardReason.value.originalCode === '90') {
          // 괄호 안의 내용만 추출하는 정규식
          const match = selectNonStandardReason.value.name.match(/\((.*?)\)/);
          reasonContents = match
            ? match[1]
            : selectNonStandardReason.value.name;
        } else {
          reasonContents = selectNonStandardReason.value.name;
        }

        const data = {
          instituteId: columnDetails.value.instituteId,
          informationSystemId: columnDetails.value.informationSystemId,
          databaseId: columnDetails.value.databaseId,
          schemaNameAgg: columnDetails.value.schemaNameAggregate,
          tableNameAgg: columnDetails.value.tableNameAggregate,
          columnName: columnDetails.value.columnName,
          // columnStandardYn:
          //   columnDetails.value.columnStandardYn === 'Y' ? true : false,
          refinedColumnKoreanName: columnDetails.value.refinedColumnKoreanName,
          // currentNonStandardReasonCode:
          //   selectNonStandardReason.value.originalCode,
          // currentNonStandardReasonContents: reasonContents,
        };

        console.log(
          'selectNonStandardReason : ',
          selectNonStandardReason.value
        );

        const response = await updateActualizingColumnRefine(data);
        console.log('단일 정제 결과 : ', response);

        // 저장 성공
        if (response.status === 200) {
          // 저장 성공 메세지
          const researchData = {
            instituteId: columnDetails.value.instituteId,
            informationSystemId: columnDetails.value.informationSystemId,
            databaseId: columnDetails.value.databaseId,
            columnName: columnDetails.value.columnName,
            columnKoreanName: columnDetails.value.columnKoreanName,
            refineState: true,
          };

          await fetchData(researchData);

          nextTick(async () => {
            const targetData = agGrid.value.gridApi.getDisplayedRowAtIndex(
              columnDetails.value.id
            );

            // 첫 행 select 효과
            const nodesWithRowId0 = document.querySelector(
              `.column-grid [row-id="${columnDetails.value.id}"]`
            );

            // .ag-row-selected 클래스를 추가합니다.
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);

            bindingColumnKoreanName(targetData.data);
            rawColumnDetails.value = bindingColumnKoreanName(targetData.data); // 초기값 저장
          });

          setIsSaveColumnRefine(true);
        } else {
          // 저장 실패 메세지
          alert('컬럼정제 오류');
        }
      };
      // 저장
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };
      const saveConfirmState = reactive({
        view: false,
        title: '컬럼한글명정제 실행 알림',
        message: '컬럼한글명 정제를 실행하시겠습니까?',
      });

      // 초기화
      const resetConfirmState = reactive({
        view: false,
        title: '알림',
        message: '초기화 하시겠습니까?',
      });
      const onResetConfirm = () => {
        resetConfirmState.title = '알림';
        resetConfirmState.message = '초기화 하시겠습니까?';
        resetConfirmState.view = true;
      };
      const onReset = () => {
        columnDetails.value = { ...rawColumnDetails.value };
      };

      // 연관테이블 조회 팝업
      const relatedTableListWindowView = ref(false);
      const onRelatedTable = () => {
        relatedTableListWindowView.value = true;
      };
      const onCloseRelatedTableListWindow = () => {
        relatedTableListWindowView.value = false;
      };

      const bindingColumnKoreanName = (data) => {
        console.log('bindingColumnKoreanName : ', data);

        columnDetails.value = {
          id: data.id,
          instituteId: data.instituteId,
          informationSystemId: data.informationSystemId,
          databaseId: data.databaseId,
          columnName: data.columnName,
          columnKoreanName: data.columnKoreanName,
          columnKoreanNameErrorContents: data.columnKoreanNameErrorContents,
          columnStandardYn: data.columnStandardYn,
          columnStandardYnName: data.columnStandardYnName,
          currentNonStandardReasonCode: data.currentNonStandardReasonCode,
          currentNonStandardReasonContents:
            data.currentNonStandardReasonContents,
          refinedColumnKoreanName: data.refinedColumnKoreanName,
          refinedColumnKoreanNameErrorContents:
            data.refinedColumnKoreanNameErrorContents,
          schemaNameAggregate: data.schemaNameAggregate,
          tableCount: data.tableCount,
          tableNameAggregate: data.tableNameAggregate,
          updater: data.updater,
          updateDateTime: data.updateDateTime,
        };

        console.log('noneStandardReasonList :', noneStandardReasonList.value);

        const matchData = noneStandardReasonList.value.find((item) =>
          item.name.includes(data.currentNonStandardReasonContents)
        );

        console.log('matchData : ', matchData);

        if (matchData) {
          selectNonStandardReason.value = matchData;
        }

        // console.log('MatchData : ', matchData);

        return { ...columnDetails.value };

        // 데이터 바인딩
        // rawColumnDetails.value = columnDetails.value;
      };

      const additionalReasonsWindowView = ref(false);

      const onOpenAdditionalReasonsWindow = () => {
        additionalReasonsWindowView.value = true;
      };

      const onCloseAdditionalReasonsWindow = () => {
        additionalReasonsWindowView.value = false;
      };

      const onAdditionalReasonsSave = (data) => {
        additionalReasonsWindowView.value = false;
        console.log('비표준사유 기타 저장 data : ', data);

        console.log(
          'noneStandardReasonList.value: ',
          noneStandardReasonList.value
        );

        noneStandardReasonList.value.filter(
          (item) => item.code === '90'
        )[0].name = `기타(${data})`;

        columnDetails.value.nonStandardReasonContents = data;
      };

      watch(selectColumnData, async (value) => {
        console.log('selectColumnData : ', value);
        console.log('selectColumnData.columnKoreanName : ', value);

        const researchData = {
          instituteId: value.instituteId,
          informationSystemId: value.informationSystemId,
          databaseId: value.databaseId,
          columnName: value.columnName,
          columnKoreanName: value.columnKoreanName,
        };

        if (value && Object.keys(value).length > 0) {
          // 비표준사유 조회

          if (noneStandardReasonList.value.length < 2) {
            const data = {
              instituteId: useMetaMngInstId,
              databaseId: value.databaseId,
            };
            const nonStandardList = await getActualizingNonStandardReason(data);

            console.log(
              'noneStandardReasonList.value : ',
              noneStandardReasonList.value
            );

            // value가 같은 경우를 추적하기 위한 맵
            const valueCountMap = new Map();

            // 새로운 형식으로 변환된 리스트를 저장할 배열
            const formattedList = [];

            nonStandardList.forEach((item) => {
              // 현재 value의 카운트를 가져오거나 초기화
              const count = valueCountMap.get(item.code) || 0;
              // 카운트 증가
              valueCountMap.set(item.code, count + 1);

              formattedList.push({
                code: count > 0 ? `${item.code}_${count}` : item.code, // 중복되는 경우 suffix 추가
                name: item.name,
                originalCode: item.code, // 원본 value 값 보존
              });
            });

            noneStandardReasonList.value = [
              ...noneStandardReasonList.value,
              ...formattedList,
            ];
            console.log('nonStandardList : ', nonStandardList);
          }
          await fetchData(researchData);
        }
      });

      const columnStandardYn = computed(
        () => columnDetails.value.columnStandardYn
      );

      watch(columnStandardYn, (value) => {
        console.log('columnStandardYn : ', value);
        if (value === 'Y') {
          selectNonStandardReason.value = noneStandardReasonList.value[0];
        }
      });

      watch(selectNonStandardReason, (value) => {
        console.log('selectNonStandardReason : ', value);

        if (value.code === '90') {
          onOpenAdditionalReasonsWindow();
        }
      });

      // onBeforeMount(async () => {
      //   const data = {
      //     instituteId: useMetaMngInstId,
      //     databaseId: columnDetails.value.databaseId,
      //   };
      //   const nonStandardList = getActualizingNonStandardReason(data);
      //   console.log('nonStandardList : ', nonStandardList);
      // });

      return {
        rowData,
        columnDefs,
        agGrid,
        relatedTableListWindowView,
        onRelatedTable,
        onCloseRelatedTableListWindow,
        bindingColumnKoreanName,
        rawColumnDetails,
        columnDetails,
        onSaveConfirm,
        saveConfirmState,
        onRefine,
        noneStandardReasonList,
        selectNonStandardReason,
        onResetConfirm,
        resetConfirmState,
        onReset,
        onOpenAdditionalReasonsWindow,
        onCloseAdditionalReasonsWindow,
        onAdditionalReasonsSave,
        additionalReasonsWindowView,
        getTooltipById,
      };
    },
  };
</script>

<style scoped>
  .title-s {
    font-size: 16px;
  }
  .grid-top {
    font-size: 16px;
    margin-top: 47px;
    margin-bottom: 10px;
  }
</style>
