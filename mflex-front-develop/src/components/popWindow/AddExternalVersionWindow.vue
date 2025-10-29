<template>
  <div class="pop-window">
    <div class="window-header">공식사전버전관리</div>
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
                  <th>작업구분</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ externalVersion.jobState }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*공식사전버전명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <input
                        type="text"
                        class="input-text"
                        v-model="externalVersion.versionName"
                        placeholder="공식사전버전명을 입력해주세요."
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*제정차수</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <input
                        type="text"
                        class="input-text"
                        v-model="externalVersion.enactCycle"
                        placeholder="제정차수를 입력해주세요. ex) 1차, 2차"
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*제정일자</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <input
                        type="date"
                        class="input-text"
                        v-model="externalVersion.enactDate"
                        placeholder="제정일자"
                      />
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
    </div>
  </div>
</template>

<script setup>
  import { ref, onBeforeMount } from 'vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import AdditionalReasonsWindow from '@/components/popWindow/AdditionalReasonsWindow.vue';

  import {
    addCommonDictionaryVersion, // 추가
    editCommonDictionaryVersion, // 수정
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  const emit = defineEmits(['confirm', 'close']);

  const props = defineProps({
    selectedData: {
      type: Object,
      default: () => {},
    },
    selectDictionary: {
      type: Object,
      default: () => {},
    },
    selectVersion: {
      type: Object,
      default: () => {},
    },
    jobState: {
      type: String,
      default: '',
    },
  });

  const externalVersion = ref({
    jobState: '',
    versionName: '',
    enactCycle: '',
    enactDate: '',
  });

  const onConfirm = async () => {
    if (props.jobState === 'edit') {
      console.log('props.selectVersion : ', props.selectVersion);
      externalVersion.value.versionId = props.selectVersion.versionId;

      const data = {
        dictionaryId: props.selectDictionary.id,
        versionId: props.selectVersion.versionId,
        ...externalVersion.value,
      };
      await editCommonDictionaryVersion(data);
    } else {
      const data = {
        dictionaryId: props.selectDictionary.id,
        ...externalVersion.value,
      };

      await addCommonDictionaryVersion(data);
    }

    emit('confirm');
  };

  onBeforeMount(() => {
    // jobState 설정 (edit이면 '수정', 아니면 '추가')
    externalVersion.value.jobState =
      props.jobState === 'edit' ? '수정' : '추가';

    if (props.jobState === 'edit') {
      console.log('selectVersion : ', props.selectVersion);
      // 수정 모드일 때만 버전 정보 바인딩
      externalVersion.value.versionName = props.selectVersion.versionName;
      externalVersion.value.enactCycle = props.selectVersion.enactCycle;
      externalVersion.value.enactDate = props.selectVersion.enactDate;
    } else {
      // 추가 모드일 때는 날짜만 초기화
      externalVersion.value.enactDate = new Date().toISOString().slice(0, 10);
    }
  });

  const onClose = () => {
    console.log('onClose');
    emit('close');
  };
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
