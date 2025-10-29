<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="btns-row">
          <div class="row-l"></div>
          <div class="row-r">
            <button class="btn-m excel-down" @click="onOpenWindow">
              <i class="icon"></i> 자료 일괄등록
            </button>
            <button class="btn-m btn-next__step" @click="onNextStep">
              다음 단계로<i class="icon"></i>
            </button>
          </div>
        </div>
        <div class="content-row">
          <DragRow
            width="100%"
            height="100%"
            :topPercent="72"
            :sliderWidth="10"
          >
            <template #top>
              <TopRow />
            </template>
            <template #bottom>
              <BottomRow />
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
// import Step from '@/components/common/Step.vue';
import { reactive, ref } from 'vue';
import TopRow from '@/views/totalSearch/components/totalSearch2/topRow/TopRow.vue';
import BottomRow from '@/views/totalSearch/components/totalSearch2/bottomRow/BottomRow.vue';
import { provide } from 'vue';
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
