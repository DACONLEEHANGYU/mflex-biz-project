<template>
  <div class="pop-window">
    <div class="window-header">진단제외 사유등록</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row">
          <section class="row-wrap">
            <div class="inputs-wrap">
              <div class="input-form">
                <table class="input-table">
                  <colgroup>
                    <col width="30%" />
                    <col width="" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th class="required">*진단제외사유</th>
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
                          style="height: 130px"
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
      <div class="inputs-btns-new">
        <div class="btns__r">
          <button class="btn-m btn-new-confirm" @click="onConfirm">저장</button>
          <button class="btn-m btn-new-close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onBeforeMount, reactive, ref, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useDiagnosisStore } from '@/stores/diagnosis.js';
  import { putTableExclude } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';

  import { getDiagnosisExcludeReasonCode } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';

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
    codeSearchInfo: {
      type: Object,
      default: () => {},
    },
    selectData: {
      type: Object,
      default: () => {},
    },
  });

  const authStore = useAuthStore();
  const { userStngInfo } = storeToRefs(authStore);

  const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

  const { selectDataBaseInfo } = storeToRefs(useDiagnosisStore());

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
      const data = {
        instituteId: useMetaMngInstId,
        databaseId: selectDataBaseInfo.value,
      };
      const response = await getDiagnosisExcludeReasonCode(data);

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

    const patchData = props.selectData.map((item) => {
      return {
        instituteId: item.instituteId,
        databaseId: item.databaseId,
        schemaName: item.schemaName,
        tableName: item.tableName,
        tableKoreanName: item.tableKoreanName,
        excludeReasonCode: formData.excludeReasonCode,
        excludeReasonContent: formData.otherReason,
      };
    });

    await putTableExclude(patchData);

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

  .btn-new-confirm {
    border: 1px solid #36c270;
    background: #36c270;
    color: #fff;
    width: 114px;
    height: 54px;
    font-size: 20px;
    border-radius: 10px;
  }
  .btn-new-confirm:hover {
    background: #39aa68;
    color: #fff;
  }

  .btn-new-close {
    border: 1px solid #c1c5c5;
    background: #ffffff;
    color: #8b8989;
    font-size: 20px;
    width: 114px;
    height: 54px;
    border-radius: 10px;
  }
  .btn-new-close:hover {
    background: #f5f5f5;
    color: #8b8989;
  }

  .inputs-btns-new {
    justify-content: center;
    display: flex;
    padding-left: 25px;
    padding-right: 25px;
    border-top: 1px solid rgba(233, 233, 233, 0.2);
    padding-top: 15px;
    padding-bottom: 20px;
  }
</style>
