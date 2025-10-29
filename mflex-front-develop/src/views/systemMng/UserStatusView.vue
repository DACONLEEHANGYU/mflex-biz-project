<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <section class="row-wrap">
            <div class="bg-box">
              <!-- <DragRow
                width="100%"
                height="100%"
                :topPercent="50"
                :sliderWidth="10"
              >
                <template #top>
                  <TopComp />
                </template>
                <template #bottom>
                  <BottomComp />
                </template>
              </DragRow> -->
              <TopComp />
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { DragRow } from 'vue-resizer';
  import TopComp from '@/views/systemMng/components/userStatus/top/TopComp.vue';
  import BottomComp from '@/views/systemMng/components/userStatus/bottom/BottomComp.vue';

  defineOptions({ name: 'UserStatusView' });
</script>

<style lang="scss" scoped></style>
