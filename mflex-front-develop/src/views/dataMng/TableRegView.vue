<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="search-row">
          <div class="btns-row">
            <div class="row-l"></div>
            <div class="row-r">
              <button class="btn-m excel-down" @click="onOpenWindow">
                <i class="icon"></i> 자료 일괄등록
              </button>
              <button class="btn-m btn-next__step">
                다음 단계로<i class="icon"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="content-row">
          <DragRow
            width="100%"
            height="100%"
            :topPercent="74"
            :sliderWidth="10"
          >
            <template #top>
              <div class="bg-box">
                <TopComp />
              </div>
            </template>
            <template #bottom>
              <BottomComp />
            </template>
          </DragRow>
        </div>
      </div>
    </div>
    <AppWindow
      :view="windowView"
      @close="onCloseWindow"
      width="1400px"
      height="auto"
    >
      <DatabaseRegWindow @close="onCloseWindow" />
    </AppWindow>
  </section>
</template>

<script setup>
import { DragRow } from 'vue-resizer';
import { reactive, ref } from 'vue';
import TopComp from '@/views/dataMng/components/tableReg/top/TopComp.vue';
import BottomComp from '@/views/dataMng/components/tableReg/bottom/BottomComp.vue';
import AppWindow from '@/components/ui/AppWindow.vue';
import DatabaseRegWindow from '@/components/popWindow/databaseReg/DatabaseRegWindow.vue';

const windowView = ref(false);

const onOpenWindow = () => {
  windowView.value = true;
};

const onCloseWindow = () => {
  windowView.value = false;
};
</script>

<style lang="scss" scoped></style>
