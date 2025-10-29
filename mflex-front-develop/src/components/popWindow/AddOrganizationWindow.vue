<template>
  <div class="pop-window">
    <div class="window-header">
      {{ jobState === 'add' ? '신규 조직 추가' : '조직 수정' }}
    </div>
    <div class="signup-body" style="margin-bottom: 15px">
      <div class="window-content pt15">
        <div class="inputs-wrap">
          <div class="input-form">
            <table class="input-table">
              <colgroup>
                <col width="35%" />
              </colgroup>
              <tbody>
                <tr>
                  <th>작업구분</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      {{ group.jobState }}
                    </div>
                  </td>
                </tr>
                <tr>
                  <th class="required">*조직명</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <input
                        type="text"
                        class="input-text"
                        v-model="group.instituteName"
                        placeholder="조직명을 입력해주세요."
                      />
                    </div>
                  </td>
                </tr>
                <!-- <tr>
                  <th class="required">*제정차수</th>
                  <td class="manage-input-form-td">
                    <div class="td-col">
                      <input
                        type="text"
                        class="input-text"
                        v-model="group.enactCycle"
                        placeholder="제정차수를 입력해주세요. ex) 1차, 2차"
                      />
                    </div>
                  </td>
                </tr> -->
                <tr>
                  <th class="required">*메타관리조직여부</th>
                  <td class="manage-input-form-td">
                    <div class="td-col checkbox-container">
                      <input
                        type="checkbox"
                        class="checkbox-input"
                        v-model="group.metaManageYn"
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
                        v-model="group.updateDateTime"
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
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';

  import {
    editGroup, // 기관 조직 수정
    addInstitute, // 기관(조직) 추가,
    getGroupDetails,
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

  const group = ref({
    jobState: '',
    instituteName: '',
    enactCycle: '',
    updateDateTime: '',
    metaManageYn: false,
  });

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);

  const { useMetaMngInstId } = userStngInfo.value;

  const onConfirm = async () => {
    if (props.jobState === 'edit') {
      console.log('props.selectData : ', props.selectData);

      const data = {
        manageInstituteId: useMetaMngInstId,
        instituteId: props.selectedData.instituteId,
        instituteName: group.value.instituteName,
        metaManageYn: group.value.metaManageYn,
      };
      await editGroup(data);
    } else {
      const data = {
        instituteId: useMetaMngInstId,
        instituteName: group.value.instituteName,
        metaManageYn: group.value.metaManageYn,
      };
      console.log('addInstitute data : ', data);
      await addInstitute(data);
    }
    emit('confirm');
  };

  onBeforeMount(async () => {
    // jobState 설정 (edit이면 '수정', 아니면 '추가')
    group.value.jobState = props.jobState === 'edit' ? '수정' : '추가';

    if (props.jobState === 'edit') {
      console.log('props.selectData : ', props.selectedData);

      const data = {
        manageInstituteId: useMetaMngInstId,
        instituteId: props.selectedData.instituteId,
      };

      const details = await getGroupDetails(data);
      console.log('details : ', details);

      // 수정 모드일 때 selectData에서 값을 가져와서 group에 바인딩
      group.value.instituteId = details.instituteId;
      group.value.instituteName = details.instituteName;
      group.value.metaManageYn = details.metaManageYn;
      group.value.updateDateTime = details.updateDateTime.slice(0, 10);
    } else {
      // 추가 모드일 때는 날짜만 초기화
      group.value.updateDateTime = new Date().toISOString().slice(0, 10);
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

  .checkbox-container {
    display: flex;
    justify-content: flex-start; /* 왼쪽 정렬 */
    align-items: center; /* 수직 중앙 정렬 */
  }

  .checkbox-input {
    zoom: 1.4;
    cursor: pointer;
    width: auto;
    flex-shrink: 0;
    position: absolute;
    left: 36%;
  }
</style>
