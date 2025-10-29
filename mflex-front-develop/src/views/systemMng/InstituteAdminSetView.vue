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
                :leftPercent="30"
                :sliderWidth="15"
              >
                <template #left>
                  <TopInstituteListComp />
                </template>
                <template #right>
                  <!-- <DatabaseSchemaMappingComp /> -->
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

  import TopInstituteListComp from '@/views/systemMng/components/instituteAdminSet/TopInstituteListComp.vue';
  import InstituteDetailsComp from '@/views/systemMng/components/instituteAdminSet/InstituteDetailsComp.vue';

  defineOptions({ name: 'InstituteAdminSetView' });
</script>
