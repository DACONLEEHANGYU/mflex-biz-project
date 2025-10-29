<template>
  <div class="btn-link__pop organization">
    <button class="btn-link">
      {{ ogdpInstNm }}
      <!-- <span class="icon-box" @click="onOpeView" ref="iconBox"
        ><i class="icon"></i
      ></span> -->
    </button>
    <div class="pop-infos" v-if="openView">
      <div class="pop-title">{{ instData.info }}</div>
      <div class="pop-selects">
        <ul>
          <li v-for="(item, index) in instData.radios" :key="index">
            <div class="checks-wrap">
              <label>
                <input
                  type="radio"
                  :value="item.value"
                  v-model="instData.selected"
                />
                <i class="icon"></i>
                <div class="label-text">{{ item.label }}</div>
              </label>
            </div>
          </li>
        </ul>
      </div>
      <div class="pop-btns">
        <button class="btn-s green" @click="onOrgConfirm(true)">확인</button>
        <button class="btn-s red" @click="onOrgConfirm(false)">취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, ref, computed } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useAlert } from '@/composables/alert';

  const authStore = useAuthStore();
  const { userMetaMngInstList, userStngInfo, userGroupList, userInfo } =
    storeToRefs(authStore);
  const { userId, userNm, ogdpInstNm, jbgdNm } = userInfo.value;
  const metaMngInstList = userGroupList.value;
  const userStngMetatMngInstId = userStngInfo.value.useMetaMngInstId;
  const userStngGroupId = userStngInfo.value.useGroupId;
  const prevSelecedMetaMngInstId = '';

  console.log('userGroupList =====================', userGroupList.value);

  const instData = reactive({
    info: '조직을 선택하세요.',
    radios: [],
    selected: 0,
  });

  metaMngInstList.forEach((item) => {
    instData.radios.push({
      label: item.name,
      value: item.id,
      lwrExistYn: '',
    });

    if (item.selected === true) {
      instData.selected = item.id;
    }
  });

  const selectedInstName = computed(() => {
    const selectedInst = instData.radios.find(
      (radio) => radio.value === instData.selected
    );
    return selectedInst ? selectedInst.label : '조직을 선택하세요.';
  });

  const openView = ref(false);

  const emit = defineEmits(['btnClick', 'confirmInst']);
  const onOpeView = () => {
    openView.value = !openView.value;
    emit('btnClick');
  };

  const onOrgConfirm = (confirmed) => {
    console.log(
      'prevSelecedMetaMngInstId =====================',
      prevSelecedMetaMngInstId
    );

    if (confirmed && instData.selected !== prevSelecedMetaMngInstId) {
      const selectedInst = instData.radios.find(
        (item) => item.value === instData.selected
      );
      if (selectedInst.lwrExistYn === 'N') {
        const { setAlertStatus } = useAlert();
        setAlertStatus({
          view: true,
          message: '매핑된 시스템 및 사전이 없어 변경이 불가능 합니다.',
        });
        instData.selected = userStngGroupId;
      } else {
        let setInstData = {
          orgInstData: prevSelecedMetaMngInstId,
          newInstData: instData.selected,
        };

        emit('confirmInst', setInstData);
      }
    } else {
      console.log(
        'userStngMetatMngInstId =====================',
        userStngMetatMngInstId
      );
      instData.selected = userStngGroupId;
    }

    openView.value = false;
  };

  const onOrgChgPrevMetaMngInstId = (newMetaMngInstId) => {
    prevSelecedMetaMngInstId.value = newMetaMngInstId;
  };

  const onOrgConfirmCancel = (orgInstData) => {
    console.log(
      'onOrgConfirmCancel called with orgInstData:',
      userStngMetatMngInstId
    );
    instData.selected = userStngGroupId;
  };

  const close = () => {
    openView.value = false;
  };

  defineExpose({ close, onOrgChgPrevMetaMngInstId, onOrgConfirmCancel });

  // const iconBox = ref(null);
  // window.addEventListener('click', e => {
  //   console.log(e.target, e.target.parentNode);

  // });
</script>
