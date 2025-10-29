<template>
  <div class="inner-tab top-btns">
    <!-- <AppLinkDrop @selectMenu="onSelectMenu">코드목록 내려받기</AppLinkDrop> -->
  </div>
  <DragRow width="100%" height="100%" :topPercent="54" :sliderWidth="10">
    <template #top>
      <TopComp
        @selected-codeName="handleRowDoubleClicked"
        @selected-codeValue="handleCodeValueClicked"
        @first-row-codevalue="handleFirstRowCodeValue"
      />
    </template>
    <template #bottom> <BottomComp /> </template>
  </DragRow>
</template>

<script setup>
  import { ref, provide } from 'vue';
  import { DragRow } from 'vue-resizer';
  import TopComp from '@/views/dictionarySearch/components/tab4/top/TopComp.vue';
  import BottomComp from '@/views/dictionarySearch/components/tab4/bottom/BottomComp.vue';
  import AppLinkDrop from '@/components/ui/AppLinkDrop.vue';
  const topCompRef = ref(null);
  const selectedCodeNameData = ref(null);
  const firstRowCodeNameData = ref(null);
  const codeValueFirstData = ref(null);
  const codeValueSelectData = ref(null);

  provide('selectedData', selectedCodeNameData);
  const handleRowDoubleClicked = (data) => {
    selectedCodeNameData.value = data;
    console.log('selectedCodeNameData.value : ', selectedCodeNameData.value);
  };

  provide('first-row-selected', firstRowCodeNameData);
  const handleFirstRowSelected = (data) => {
    firstRowCodeNameData.value = data;
    console.log('firstRowData : ', firstRowCodeNameData.value);
  };

  // 코드값 더블클릭 시 BottomComp에 전달 2,3,6
  provide('codeValueSelectData', codeValueSelectData);
  const handleCodeValueClicked = (data) => {
    codeValueSelectData.value = data;
    console.log('codeValue.value : ', codeValueSelectData.value);
  };

  // 코드값 첫행
  provide('codeValueFirstData', codeValueFirstData);
  const handleFirstRowCodeValue = (data) => {
    codeValueFirstData.value = data;
    console.log('codeValueFirstData : ', codeValueFirstData.value);
  };

  const onSelectMenu = (id) => {
    if (id === 0) {
      alert('그리드 목록 내려받기 실행');
    } else {
      alert('DB 전체 목록 내려받기');
    }
  };
</script>
