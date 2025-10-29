<template>
  <div class="pop-window">
    <div class="window-header">테이블정제</div>
    <div class="signup-body" style="margin-bottom: 15px">
      <div class="window-content pt15">
        <div class="inputs-wrap">
          <div class="input-form">
            <table class="input-table">
              <colgroup>
                <col width="30%" />
              </colgroup>
              <tbody>
                <tr>
                  <th class="required">*스키마명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ tableRefineData.schemaName }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*테이블명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ tableRefineData.tableName }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*테이블한글명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ tableRefineData.tableKoreanName }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*정제테이블한글명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <input
                        class="input-text"
                        type="text"
                        placeholder=""
                        v-model="tableRefineData.refineTableKoreanName"
                        style="width: 100%"
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*표준화구분</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <div class="flex-radio">
                        <div>
                          <input
                            id="standard"
                            type="radio"
                            value="10"
                            v-model="tableRefineData.actualizationType"
                            placeholder=""
                            checked
                          />
                          <label for="standard">표준</label>
                        </div>
                        <div>
                          <input
                            id="none-standard"
                            type="radio"
                            value="20"
                            v-model="tableRefineData.actualizationType"
                            placeholder=""
                          />
                          <label for="none-standard">비표준</label>
                        </div>
                        <div>
                          <input
                            id="exclude"
                            type="radio"
                            value="30"
                            v-model="tableRefineData.actualizationType"
                            placeholder=""
                          />
                          <label for="exclude">대상제외</label>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="standard">비표준/제외사유</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <select
                        v-model="tableRefineData.reasonCode"
                        :disabled="tableRefineData.actualizationType === '10'"
                      >
                        <option
                          v-for="reason in currentReasonList"
                          :key="reason.code"
                          :value="reason.code"
                        >
                          {{ reason.name }}
                        </option>
                      </select>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="standard">검토내용</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ tableRefineData.reviewContent }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="standard">최종수정자</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ tableRefineData.updater }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="standard">최종수정일시</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ tableRefineData.updateDateTime }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="dialog-footer">
        <button type="button" class="ui-button" @click="onConfirm">저장</button>
        <button type="button" class="ui-button" @click="onClose">취소</button>
      </div>
      <!-- <div class="inputs-btns">
        <div class="btns__r">
          <button @click="onConfirm" class="btn-m confirm">저장</button>
          <button @click="onClose" class="btn-m close">취소</button>
        </div>
      </div> -->
    </div>
  </div>
  <!-- <AppDialog
    v-model:view="dialogState.view"
    :title="dialogState.title"
    :message="dialogState.message"
    @confirm="onDialogClose"
    @close="onDialogClose"
  />

  <AppDialog
    v-model:view="errorState.view"
    :title="errorState.title"
    :message="errorState.message"
    @confirm="onCloseErrorState"
    @close="onCloseErrorState"
  >
  </AppDialog> -->

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

<script setup>
  import { onMounted, ref, computed, watch } from 'vue';
  import {
    getActualizingTableDetail, // 표준화 테이블 상세
    getActualizingNonStandardReason, // 표준화 비표준 사유
    getActualizingExclusionReason, // 표준화 제외 사유
  } from '@/utils/mflexApi/actualizing/actualizingApi';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import AdditionalReasonsWindow from '@/components/popWindow/AdditionalReasonsWindow.vue';

  const emit = defineEmits(['confirm', 'close']);

  const props = defineProps({
    selectedData: {
      type: Object,
      default: () => {},
    },
  });

  console.log('selectedData', props.selectedData);

  const selectdRefineData = props.selectedData;

  console.log('selectdRefineData', selectdRefineData);

  const tableRefineData = ref({
    schemaName: '',
    tableName: '',
    tableKoreanName: '',
    refineTableKoreanName: '',
    reviewContent: '',
    actualizationType: '',
    updater: '',
    updateDateTime: '',
  });

  const onConfirm = () => {
    console.log('onConfirm', tableRefineData);
    const actualTypeMap = {
      10: '표준',
      20: '비표준',
      30: '대상제외',
    };

    const submitData = {
      ...tableRefineData.value,
      currentNonStandardReasonCode: tableRefineData.value.reasonCode,
      currentNonStandardReasonContents:
        tableRefineData.value.reasonCode === '90'
          ? tableRefineData.value.currentNonStandardReasonContents
          : selectedReasonName.value,
      currentExcludeReasonCode: tableRefineData.value.reasonCode,
      currentExcludeReasonContents:
        tableRefineData.value.reasonCode === '90'
          ? tableRefineData.value.currentExcludeReasonContents
          : selectedReasonName.value,
      // reviewContent: .value, // 선택된 사유가 있으면 사유 name을, 없으면 기존 reviewContent 사용
      actualizationType: tableRefineData.value.actualizationType,
      actualizationName: actualTypeMap[tableRefineData.value.actualizationType],
    };

    emit('confirm', submitData);
  };

  const onClose = () => {
    console.log('onClose');
    emit('close');
  };

  // 비표준사유 리스트
  const noneStandardReasonList = ref([]);
  // 제외사유 리스트
  const excludeReasonList = ref([]);

  // 현재 선택된 사유 리스트를 computed로 관리
  const currentReasonList = computed(() => {
    switch (tableRefineData.value.actualizationType) {
      case '20': // 비표준
        return noneStandardReasonList.value;
      case '30': // 대상제외
        return excludeReasonList.value;
      default:
        return [];
    }
  });

  // 선택된 사유의 name을 가져오는 computed
  const selectedReasonName = computed(() => {
    const selectedReason = currentReasonList.value.find(
      (reason) => reason.code === tableRefineData.value.reasonCode
    );
    return selectedReason ? selectedReason.name : '';
  });

  onMounted(async () => {
    console.log('onMounted');

    const noneStandardExcludeListParams = {
      instituteId: selectdRefineData.instituteId,
      databaseId: selectdRefineData.databaseId,
    };

    // 비표준사유 조회
    const noneStandardReasonResult = await getActualizingNonStandardReason(
      noneStandardExcludeListParams
    );
    // 제외 사유 조회
    const excludeReasonListResult = await getActualizingExclusionReason(
      noneStandardExcludeListParams
    );

    let code90Counter = 0;

    noneStandardReasonList.value = noneStandardReasonResult.map((item) => {
      if (item.code === '90') {
        const code = code90Counter === 0 ? '90' : `90_${code90Counter}`;
        code90Counter++;
        return {
          code,
          name: item.name,
          origin_code: item.code,
        };
      }
      return {
        code: item.code,
        name: item.name,
        origin_code: item.code,
      };
    });

    code90Counter = 0; // 카운터 리셋

    excludeReasonList.value = excludeReasonListResult.map((item) => {
      if (item.code === '90') {
        const code = code90Counter === 0 ? '90' : `90_${code90Counter}`;
        code90Counter++;
        return {
          code,
          name: item.name,
          origin_code: item.code,
        };
      }
      return {
        code: item.code,
        name: item.name,
        origin_code: item.code,
      };
    });

    const data = {
      instituteId: selectdRefineData.instituteId,
      databaseId: selectdRefineData.databaseId,
      schemaName: selectdRefineData.schemaName,
      tableName: selectdRefineData.tableName,
    };

    const result = await getActualizingTableDetail(data);

    console.log('getActualizingTableDetail result', result);

    let reasonCode;

    tableRefineData.value = {
      ...result,
      refineTableKoreanName:
        result.refinedTableKoreanName === null
          ? ''
          : result.refinedTableKoreanName,
      actualizationType: result.currentDivisionCode,
      reviewContent: result.refinedTableKoreanNameErrorContents,
      reasonCode: reasonCode || '', // 기존 사유 코드가 있다면 설정
    };

    console.log('currentReasonList.value', currentReasonList.value);

    if (result.currentDivisionCode === '20') {
      let matchdata;
      if (result.currentNonStandardReasonContents) {
        matchdata = currentReasonList.value.find((item) =>
          item.name.includes(result.currentNonStandardReasonContents)
        );

        console.log('matchdata', matchdata);
        reasonCode = matchdata.code;
      } else {
        reasonCode = result.currentNonStandardReasonCode;
      }
    } else if (result.currentDivisionCode === '30') {
      let matchdata;
      if (result.currentExcludeReasonContents) {
        matchdata = currentReasonList.value.find((item) =>
          item.name.includes(result.currentExcludeReasonContents)
        );

        console.log('matchdata', matchdata);
        reasonCode = matchdata.code;
      } else {
        reasonCode = result.currentExcludeReasonCode;
      }
    } else {
      reasonCode = '';
    }

    tableRefineData.value.reasonCode = reasonCode;
    // const hhhhh = (currentReasonList.value.filter((item) =>
    //   item.code.includes('90')
    // )[0].name =
    //   `기타 (${result.currentExcludeReasonContents})` ||
    //   `기타 (${result.currentNonStandardReasonContents})`);

    // console.log('hhhhh', hhhhh);
  });

  // 기타 사유 추가 팝업
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

    currentReasonList.value.filter(
      (item) => item.code === '90'
    )[0].name = `기타(${data})`;

    console.log('currentReasonList.value', currentReasonList.value);

    // console.log(
    //   'matchedData: ',
    //   currentReasonList.value.filter((item) => item.code === '90')[0]
    // );

    tableRefineData.value.currentNonStandardReasonContents = data;
    tableRefineData.value.currentExcludeReasonContents = data;
  };

  // watch(
  //   () => tableRefineData.value.actualizationType,
  //   (newValue, oldValue) => {
  //     if (newValue !== oldValue) {
  //       tableRefineData.value.reasonCode = '10';
  //     }
  //   },
  //   {
  //     immediate: false,
  //     flush: 'post',
  //   }
  // );

  watch(
    () => tableRefineData.value.reasonCode,
    (newValue) => {
      console.log('newValue', newValue);
      if (newValue === '90') {
        onOpenAdditionalReasonsWindow();
      }
    }
  );
</script>

<style scoped>
  .flex-radio {
    display: flex;
    gap: 10px; /* 라디오 버튼 사이의 간격 */
  }

  .flex-radio div {
    display: flex;
    align-items: center; /* 수직 중앙 정렬 */
    gap: 5px; /* 라디오 버튼과 텍스트 사이의 간격 */
  }

  input[type='radio'] {
    margin: 0; /* 기본 마진 제거 */
    zoom: 1.4;
  }

  .flex-radio label {
    display: inline-block;
    vertical-align: middle; /* 텍스트 수직 중앙 정렬 */
  }

  .input-form {
    border-top: 3px solid #379583;
  }
  .input-form .input-table th {
    font-size: 15px;
    background-color: #ecfaf2;
    padding: 10px 20px;
  }
  tr {
    border: 1px solid #bebebe;
  }
  .td-col {
    font-size: 15px;
  }

  .standard {
    color: #379583;
  }

  input[type='radio'] {
    zoom: 1.4;
  }
</style>
