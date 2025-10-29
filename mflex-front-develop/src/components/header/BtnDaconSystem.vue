<template>
  <div class="btn-link__pop">
    <button class="btn-link">
      {{ selectedSystemName
      }}<span class="icon-box" @click="onOpeView" ref="iconBox"
        ><i class="icon"></i
      ></span>
    </button>
    <div class="pop-infos" v-if="openView">
      <div class="pop-title">{{ sysData.info }}</div>
      <div class="pop-selects">
        <ul>
          <li v-for="(item, index) in sysData.radios" :key="index">
            <div class="checks-wrap">
              <label>
                <input
                  type="radio"
                  :value="item.value"
                  v-model="sysData.selected"
                />
                <i class="icon"></i>
                <div class="label-text">{{ item.label }}</div>
              </label>
            </div>
          </li>
        </ul>
      </div>
      <div class="pop-btns">
        <button class="btn-s green" @click="onSysConfirm(true)">확인</button>
        <button class="btn-s red" @click="onSysConfirm(false)">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, computed, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';

  const authStore = useAuthStore();

  const { userInfoSysList, userStngInfo } = storeToRefs(authStore);
  const userStngInfoSystemId = userStngInfo.value.useInfoSysId;
  //const prevSelecedInfoSystemId = ref(userStngInfoSystemId);
  const prevSelecedInfoSystemId = '';

  const sysData = reactive({
    info: '업무를 선택하세요.',
    radios: [], // 초기에는 빈 배열로 시작합니다.
    selected: 0,
  });

  console.log('userInfoSysList =====================', userInfoSysList.value);

  const updateInfoSysList = () => {
    sysData.radios = [];

    userInfoSysList.value.forEach((item) => {
      sysData.radios.push({
        label: item.name,
        value: item.id,
      });

      if (item.selected === true) {
        sysData.selected = item.id;
      }
    });
  };

  const selectedSystemName = computed(() => {
    const selectedSystem = sysData.radios.find(
      (radio) => radio.value === sysData.selected
    );
    return selectedSystem ? selectedSystem.label : '업무를 선택하세요.';
  });

  const openView = ref(false);
  const emit = defineEmits(['btnClick', 'confirmInfoSys']);
  const onOpeView = () => {
    openView.value = !openView.value;
    emit('btnClick');
  };

  const onSysConfirm = (confirmed) => {
    if (confirmed && sysData.selected !== prevSelecedInfoSystemId) {
      let setInfoSysData = {
        orgInfoSysData: prevSelecedInfoSystemId,
        newInfoSysData: sysData.selected,
      };
      emit('confirmInfoSys', setInfoSysData);
    } else {
      sysData.selected = userStngInfoSystemId;
    }
    openView.value = false;
  };

  const onChgInfoSystemId = (newInfoSysId) => {
    console.log('newInfoSysId : ', newInfoSysId);
    //prevSelecedInfoSystemId.value = newInfoSysId;
  };

  const onSysConfirmCancel = (orgInfoSysData) => {
    sysData.selected = userStngInfo.value.useInfoSysId;
  };

  const close = () => {
    openView.value = false;
  };
  // 기관이 변경되었을 때 store 값 감시 후 함수 실행
  watch(userInfoSysList, updateInfoSysList, { immediate: true });
  defineExpose({ close, onSysConfirmCancel, onChgInfoSystemId });

  // const iconBox = ref(null);
  // window.addEventListener('click', e => {
  //   console.log(e.target, e.target.parentNode);

  // });
</script>
