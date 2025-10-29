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
                :leftPercent="29"
                :sliderWidth="10"
              >
                <template #left>
                  <DictionaryListComp />
                </template>
                <template #right>
                  <DictionaryListDetailsComp />
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
  import DictionaryListComp from '@/views/systemMng/components/ExternalDictionary/DictionaryListComp.vue';
  import DictionaryListDetailsComp from '@/views/systemMng/components/ExternalDictionary/DictionaryListDetailsComp.vue';

  defineOptions({ name: 'ExternalDictionaryListView' });
</script>
