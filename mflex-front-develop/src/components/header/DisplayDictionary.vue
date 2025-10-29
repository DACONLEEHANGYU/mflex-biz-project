<template>
  <div class="btn-link__pop">
    <button class="btn-link">
      <span style="color: red" v-if="!dictionaryInfo">{{
        `업무에 매핑된 사전이 없습니다.`
      }}</span>
      <span v-else>{{ standardDictionaryName }}</span>
    </button>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';

  const authStore = useAuthStore();
  const { userDctnryList, userStngInfo } = storeToRefs(authStore);

  const standardDictionaryName = ref('');

  // dictionaryInfo를 computed로 정의하여 반응형으로 만들기
  const dictionaryInfo = computed(() => {
    const userStngDctnryId = userStngInfo.value?.useDctnryId;

    if (!userStngDctnryId || !userDctnryList.value?.length) {
      return null;
    }

    return userDctnryList.value.find((item) => {
      return item.id === userStngDctnryId;
    });
  });

  const updateDictionaryList = () => {
    const userStngDctnryId = userStngInfo.value?.useDctnryId;

    console.log('userStngDctnryId : ', userStngDctnryId);
    console.log('userDctnryList.value', userDctnryList.value);
    console.log('dictionaryInfo : ', dictionaryInfo.value);

    if (!dictionaryInfo.value) {
      standardDictionaryName.value = '';
      return;
    }

    standardDictionaryName.value = dictionaryInfo.value.name;
  };

  // userDctnryList와 userStngInfo 모두 감시
  watch([userDctnryList, userStngInfo], updateDictionaryList, {
    immediate: true,
    deep: true,
  });
</script>
