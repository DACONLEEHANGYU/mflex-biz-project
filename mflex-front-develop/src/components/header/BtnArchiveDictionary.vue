<template>
  <div class="btn-link__pop">
    <button class="btn-link">
      {{ selectedDctnryName }}
      <span class="icon-box" @click="onOpeView"><i class="icon"></i></span>
    </button>
    <div class="pop-infos" v-if="openView">
      <div class="pop-title">{{ dctnryData.info }}</div>
      <div class="pop-selects">
        <ul>
          <li v-for="(item, index) in dctnryData.radios" :key="index">
            <div class="checks-wrap">
              <label>
                <input
                  type="radio"
                  :value="item.value"
                  v-model="dctnryData.selected"
                />
                <i class="icon"></i>
                <div class="label-text">{{ item.label }}</div>
              </label>
            </div>
          </li>
        </ul>
      </div>
      <div class="pop-btns">
        <button class="btn-s green" @click="onDctnryConfirm(true)">확인</button>
        <button class="btn-s red" @click="onDctnryConfirm(false)">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, computed, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';

  const authStore = useAuthStore();
  const { userDctnryList, userStngInfo } = storeToRefs(authStore);
  const userStngDctnryId = userStngInfo.value.useDctnryId;
  //const prevSelecedDctnryId = ref(userStngDctnryId);
  const prevSelecedDctnryId = '';

  const dctnryData = reactive({
    info: '표준사전을 선택하세요.',
    radios: [], // 초기에는 빈 배열로 시작합니다.
    selected: 0,
  });

  const updateDictionaryList = () => {
    dctnryData.radios = [];
    userDctnryList.value.forEach((item) => {
      dctnryData.radios.push({
        label: item.name,
        value: item.id,
      });

      if (item.selected === true) {
        dctnryData.selected = item.id;
      }
    });
  };

  const selectedDctnryName = computed(() => {
    const selectedDctnry = dctnryData.radios.find(
      (radio) => radio.value === dctnryData.selected
    );
    return selectedDctnry ? selectedDctnry.label : '표준사전 선택';
  });

  const openView = ref(false);

  const emit = defineEmits(['btnClick', 'confirmDctnry']);
  const onOpeView = () => {
    openView.value = !openView.value;
    emit('btnClick');
  };

  const onDctnryConfirm = (confirmed) => {
    if (confirmed && dctnryData.selected !== prevSelecedDctnryId) {
      let setDctnryData = {
        orgDctnryData: prevSelecedDctnryId,
        newDctnryData: dctnryData.selected,
      };
      emit('confirmDctnry', setDctnryData);
    } else {
      dctnryData.selected = userStngDctnryId;
    }
    openView.value = false;
  };

  const onChgPrevDctnryId = (newValueData) => {
    //prevSelecedDctnryId.value = newValueData;
  };

  const onDctnryConfirmCancel = (orgDctnryData) => {
    dctnryData.selected = orgDctnryData;
  };

  const close = () => {
    openView.value = false;
  };
  // 기관이 변경되었을 때 store 값 감시 후 함수 실행
  watch(userDctnryList, updateDictionaryList, { immediate: true });
  defineExpose({ close, onChgPrevDctnryId, onDctnryConfirmCancel });
</script>
