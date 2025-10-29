<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <div class="bg-box">
            <div class="tab-inner pb0">
              <DragCol
                width="100%"
                height="100%"
                :leftPercent="35"
                :sliderWidth="10"
              >
                <template #left>
                  <InstituteListGridComp />
                </template>
                <template #right>
                  <InstituteDetailsComp />
                </template>
              </DragCol>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script setup>
  import { DragCol } from 'vue-resizer';

  import InstituteListGridComp from '@/views/systemMng/components/instituteSet/InstituteListGridComp.vue';
  import InstituteDetailsComp from '@/views/systemMng/components/instituteSet/InstituteDetailsComp.vue';

  defineOptions({ name: 'InstituteSetView' });
</script>
