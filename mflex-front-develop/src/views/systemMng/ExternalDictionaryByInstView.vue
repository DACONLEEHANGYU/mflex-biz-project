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
                  <DictionaryListByInstComp />
                </template>
                <template #right>
                  <DictionaryListDetailsByInstComp />
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

  import DictionaryListByInstComp from '@/views/systemMng/components/ExternalDictionary/DictionaryListByInstComp.vue';
  import DictionaryListDetailsByInstComp from '@/views/systemMng/components/ExternalDictionary/DictionaryListDetailsByInstComp.vue';
</script>
