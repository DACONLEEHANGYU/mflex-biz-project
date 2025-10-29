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
                  <DatabaseListComp />
                </template>
                <template #right>
                  <!-- <DatabaseSchemaMappingComp /> -->
                  <DatabaseDetailsComp />
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

  import DatabaseListComp from '@/views/systemMng/components/databaseSet/DatabaseListComp.vue';
  import DatabaseDetailsComp from '@/views/systemMng/components/databaseSet/DatabaseDetailsComp.vue';
</script>
