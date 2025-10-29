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
                :sliderWidth="10"
              >
                <template #left>
                  <VersionListComp />
                </template>
                <template #right>
                  <VersionDetailsComp />
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

  import VersionListComp from '@/views/systemMng/components/ExternalDictionary/VersionListComp.vue';
  import VersionDetailsComp from '@/views/systemMng/components/ExternalDictionary/VersionDetailsComp.vue';

  defineOptions({ name: 'ExternalDictionaryVersionView' });
</script>
