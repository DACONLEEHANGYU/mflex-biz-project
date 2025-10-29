<template>
  <div class="inner-tab top-btns">
    <!-- <AppLinkDrop @selectMenu="onSelectMenu">용어목록 내려받기</AppLinkDrop> -->
  </div>
  <Tab2Comp
    @row-selected="handleRowDoubleClicked"
    @first-row-selected="handleFirstRowSelected"
  />
</template>

<script setup>
  import { ref, provide, watch } from 'vue';
  import { DragRow } from 'vue-resizer';
  import Tab2Comp from '@/views/systemMng/components/ExternalDictionary/versionDetailsTab/Tab2Comp.vue';

  const firstRowData = ref(null);
  const selectedData = ref(null);

  provide('first-row-selected', firstRowData);
  const handleFirstRowSelected = (data) => {
    firstRowData.value = data;
    console.log('topComp firstRowData : ', firstRowData.value);
  };

  provide('selectedData', selectedData);
  const handleRowDoubleClicked = (data) => {
    selectedData.value = data;
  };

  const onSelectMenu = (id) => {
    if (id === 0) {
      alert('그리드 목록 내려받기 실행');
    } else {
      alert('DB 전체 목록 내려받기');
    }
  };

  // watch(
  //   () => selectedData.value,
  //   (newVal) => {
  //     const inputsWrap = document.querySelector('.inputs-wrap');

  //     if (inputsWrap) {
  //       inputsWrap.style.transition = 'box-shadow 0.5s ease-in-out';
  //       inputsWrap.style.boxShadow = '0 0 0 2px #60B883';

  //       setTimeout(() => {
  //         inputsWrap.style.boxShadow = 'none';
  //       }, 500);
  //     }
  //   }
  // );
</script>
