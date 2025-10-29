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
                  <SystemListComp />
                </template>
                <template #right>
                  <SystemDetailsComp />
                  <!-- <DatabaseSchemaMappingComp /> -->
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

  import SystemListComp from '@/views/systemMng/components/systemSet/SystemListComp.vue';
  import SystemDetailsComp from '@/views/systemMng/components/systemSet/SystemDetailsComp.vue';
  import DatabaseSchemaMappingComp from '@/views/systemMng/components/systemSet/DatabaseSchemaMappingComp.vue';
</script>
