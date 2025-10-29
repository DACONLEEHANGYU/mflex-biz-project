<template>
  <div class="inner-tab top-btns">
    <!-- <AppLinkDrop @selectMenu="onSelectMenu">단어목록 내려받기</AppLinkDrop> -->
  </div>
  <DragRow width="100%" height="100%" :topPercent="52" :sliderWidth="10">
    <template #top>
      <TopComp
        ref="topCompRef"
        @row-selected="handleRowDoubleClicked"
        @first-row-selected="handleFirstRowSelected"
      />
    </template>
    <template #bottom>
      <BottomComp />
    </template>
  </DragRow>
</template>

<script setup>
  import { ref, provide, watch } from 'vue';
  import { DragRow } from 'vue-resizer';
  import TopComp from '@/views/dictionarySearch/components/tab2/top/TopComp.vue';
  import BottomComp from '@/views/dictionarySearch/components/tab2/bottom/BottomComp.vue';
  const topCompRef = ref(null);
  const selectedData = ref(null);
  const firstRowData = ref(null);

  provide('selectedData', selectedData);
  const handleRowDoubleClicked = (data) => {
    selectedData.value = data;
  };

  provide('first-row-selected', firstRowData);
  const handleFirstRowSelected = (data) => {
    firstRowData.value = data;
    console.log('firstRowData : ', firstRowData.value);
  };

  const onSelectMenu = (id) => {
    if (id === 0) {
      if (topCompRef.value && topCompRef.value.DownloadGridDataToCsv) {
        topCompRef.value.DownloadGridDataToCsv();
      } else {
        alert('그리드 데이터를 다운로드 할 수 없습니다. 관리자에 문의 하세요.');
      }
    } else {
      console.log('excel down');
      topCompRef.value.DownloadExcel();
    }
  };

  watch(
    () => selectedData.value,
    (newVal) => {
      const inputsWrap = document.querySelector('.inputs-wrap');

      if (inputsWrap) {
        // transition 추가
        inputsWrap.style.transition = 'border 0.5s ease-in-out';

        // 한 번만 깜빡이도록 처리
        inputsWrap.style.border = '2px solid #60B883';

        setTimeout(() => {
          inputsWrap.style.border = '2px solid transparent';
        }, 500);
      }
    }
  );
</script>
