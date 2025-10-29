<template>
  <div class="pop-window">
    <div class="window-header">수집제외사유</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row">
          <section class="row-wrap">
            <div class="title-header">
              <div class="title-s">수집제외사유</div>
              <AppTooltip :htmlContent="getTooltipById('excludeReason')">
              </AppTooltip>
            </div>

            <div class="inputs-wrap">
              <div class="input-form">
                <table class="input-table">
                  <colgroup>
                    <col width="15%" />
                    <col width="" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th class="required">*수집제외여부</th>
                      <td>
                        <div class="td-col">
                          <div class="flex-radio">
                            <div>
                              <input
                                type="radio"
                                name="standardDivision"
                                id="standard"
                                value="Y"
                                v-model="formData.isExcluded"
                              />
                              <label for="standard">수집제외</label>
                            </div>
                            <div>
                              <input
                                type="radio"
                                name="standardDivision"
                                id="none-standard"
                                value="N"
                                v-model="formData.isExcluded"
                              />
                              <label for="none-standard">수집포함</label>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th class="required">*제외사유</th>
                      <td>
                        <div class="td-col">
                          <select
                            v-model="formData.excludeReasonCode"
                            :disabled="formData.isExcluded === 'N'"
                          >
                            <option
                              v-for="reason in excludeReasonList"
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
                      <th>기타제외사유</th>
                      <td>
                        <textarea
                          v-model="formData.otherReason"
                          style="height: 80px"
                          placeholder="기타 제외사유를 입력하세요."
                          :disabled="
                            formData.isExcluded === 'N' ||
                            formData.excludeReasonCode !== '90'
                          "
                        ></textarea>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">저장</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { storeToRefs } from 'pinia';
  import { onBeforeMount, reactive, ref, watch } from 'vue';
  import {
    getSchemaExcludeCode,
    patchTableExclude,
    patchFunctionExclude,
    patchProcedureExclude,
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import AppTooltip from '@/components/ui/AppTooltip.vue';

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const emit = defineEmits(['confirm', 'close']);

  // Props to receive initial data if needed
  const props = defineProps({
    initialData: {
      type: Object,
      default: () => ({
        isExcluded: 'Y',
        excludeReasonCode: '',
        otherReason: '',
      }),
    },
    selectData: {
      type: Object,
      default: () => {},
    },
  });

  console.log('props.selectData:', props.selectData);

  // List of exclusion reasons
  const excludeReasonList = ref([]);

  // Form data with reactive state
  const formData = reactive({
    isExcluded: props.initialData.isExcluded || 'N',
    excludeReasonCode: props.initialData.excludeReasonCode || '',
    otherReason: props.initialData.otherReason || '',
  });

  onBeforeMount(async () => {
    try {
      const response = await getSchemaExcludeCode();
      console.log('excludeReasonList:', response);
      excludeReasonList.value = response || [];
      console.log('excludeReasonList loaded:', excludeReasonList.value);
    } catch (error) {
      console.error('Failed to load exclude reason codes:', error);
      excludeReasonList.value = [];
    }
  });

  const onConfirm = async () => {
    console.log('props.selectData:', props.selectData);

    // 테이블의 경우
    if (props.selectData[0].tableName) {
      const excludeTableList = props.selectData.map((item) => {
        return {
          instituteId: item.instituteId,
          collectionId: item.collectionId,
          databaseId: item.databaseId,
          schemaName: item.schemaName,
          tableName: item.tableName,
          collectionExcludeYn: formData.isExcluded === 'Y' ? true : false,
          collectionExcludeReasonCode:
            formData.excludeReasonCode === '10' ? 'BACKUP' : 'ETC',
          collectionExcludeReasonContent:
            formData.excludeReasonCode === '10'
              ? '백업 테이블'
              : formData.otherReason,
        };
      });
      console.log('excludeTableList:', excludeTableList);
      await patchTableExclude(excludeTableList);
    } else if (props.selectData[0].functionName) {
      // 함수의 경우

      const excludeFunctionList = props.selectData.map((item) => {
        return {
          instituteId: item.instituteId,
          collectionId: item.collectionId,
          databaseId: item.databaseId,
          schemaName: item.schemaName,
          functionName: item.functionName,
          collectionExcludeYn: formData.isExcluded === 'Y' ? true : false,
          collectionExcludeReasonCode:
            formData.excludeReasonCode === '10' ? 'BACKUP' : 'ETC',
          collectionExcludeReasonContent:
            formData.excludeReasonCode === '10'
              ? '백업 테이블'
              : formData.otherReason,
        };
      });

      console.log('excludeFunctionList:', excludeFunctionList);
      await patchFunctionExclude(excludeFunctionList);
    } else if (props.selectData[0].procedureName) {
      // 프로시저의 경우

      const excludeProcedureList = props.selectData.map((item) => {
        return {
          instituteId: item.instituteId,
          collectionId: item.collectionId,
          databaseId: item.databaseId,
          schemaName: item.schemaName,
          procedureName: item.procedureName,
          collectionExcludeYn: formData.isExcluded === 'Y' ? true : false,
          collectionExcludeReasonCode:
            formData.excludeReasonCode === '10' ? 'BACKUP' : 'ETC',
          collectionExcludeReasonContent:
            formData.excludeReasonCode === '10'
              ? '백업 테이블'
              : formData.otherReason,
        };
      });

      console.log('excludeProcedureList:', excludeProcedureList);
      await patchProcedureExclude(excludeProcedureList);
    }

    // Validate before submitting
    if (formData.isExcluded === 'Y' && !formData.excludeReasonCode) {
      alert('제외사유를 선택해주세요.');
      return;
    }

    // If OTHER is selected, other reason is required
    if (
      formData.excludeReasonCode === 'OTHER' &&
      !formData.otherReason.trim()
    ) {
      alert('기타 제외사유를 입력해주세요.');
      return;
    }

    console.log('Submitting form data:', formData);
    emit('confirm', formData);
  };

  const onClose = () => {
    console.log('Closing modal');
    emit('close');
  };

  // Watch for changes in isExcluded to reset other fields when needed
  watch(
    () => formData.isExcluded,
    (newValue) => {
      if (newValue === 'N') {
        formData.excludeReasonCode = '';
        formData.otherReason = '';
      } else {
        formData.excludeReasonCode = excludeReasonList.value[0]?.code || '';
        formData.otherReason = '';
      }
    }
  );

  // Watch for changes in excludeReasonCode to reset otherReason when needed
  watch(
    () => formData.excludeReasonCode,
    (newValue) => {
      console.log('excludeReasonCode changed:', newValue);

      if (newValue !== 'OTHER') {
        formData.otherReason = '';
      }
    }
  );

  // excludeReasonList가 로드되면 formData.excludeReasonCode 설정
  watch(
    excludeReasonList,
    (newList) => {
      if (
        newList.length > 0 &&
        !formData.excludeReasonCode &&
        formData.isExcluded === 'Y'
      ) {
        formData.excludeReasonCode = newList[0].code;
      }
    },
    { immediate: true } // 즉시 실행
  );
</script>

<style scoped>
  .title-header {
    display: flex;
    align-items: baseline;
    margin-bottom: 20px;
    font-weight: 700;
  }

  .input-table th {
    padding: 10px;
  }

  select:disabled,
  textarea:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }

  .flex-radio {
    display: flex;
    gap: 20px;
  }
</style>
