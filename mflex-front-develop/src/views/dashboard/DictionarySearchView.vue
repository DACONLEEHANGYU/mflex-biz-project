<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <DragRow
            width="100%"
            height="100%"
            :topPercent="44.5"
            :sliderWidth="10"
          >
            <template #top>
              <TopRow @changeTab="onChangeTab" />
            </template>
            <template #bottom>
              <BottomRow1 v-if="selectTabIndex === 1" />
              <BottomRow2 v-else-if="selectTabIndex === 2"></BottomRow2>
              <section class="row-wrap" v-else-if="selectTabIndex === 3">
                <div class="bg-box">3</div>
              </section>
              <section class="row-wrap" v-else>
                <div class="bg-box">4</div>
              </section>
            </template>
          </DragRow>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { DragRow } from 'vue-resizer';
  import { ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useDictionarySaerchTabStore } from '@/stores/dictionarySearchTab';

  import TopRow from '@/views/dashboard/components/dictionarySearch/topRow/TopRow.vue';
  import BottomRow1 from '@/views/dashboard/components/dictionarySearch/bottomRow/BottomRow1.vue';
  import BottomRow2 from '@/views/dashboard/components/dictionarySearch/bottomRow/BottomRow2.vue';

  const dictionarySearchTabStore = useDictionarySaerchTabStore();
  const { searchTabState } = storeToRefs(dictionarySearchTabStore);
  console.log('searchTabState : ', searchTabState);

  // 라우트에서 searchType 파라미터를 받아와 탭 선택
  const searchTypeToTabIndex = {
    term: 1,
    word: 2,
    domain: 3,
    code: 4,
  };

  const route = useRoute();

  // watch(
  //   () => route.params.searchType,
  //   (newSearchType) => {
  //     selectTabIndex.value = searchTypeToTabIndex[newSearchType] || 1;
  //   },
  //   { immediate: true }
  // );

  watch(
    () => searchTabState.value,
    (newVal) => {
      console.log('newVal ============================', newVal);
    }
  );

  const stepData = ref([]);
  stepData.value = [
    { title: '용어등록', checked: true },
    { title: '단어등록', checked: false },
    { title: '유사어 관리', checked: false },
    { title: '도메인 관리', checked: false },
  ];

  const selectTabIndex = ref(2);

  const onChangeTab = (index) => {
    selectTabIndex.value = index;
    console.log('selectTabIndex.value=', selectTabIndex.value);
  };
</script>

<style lang="scss" scoped></style>
