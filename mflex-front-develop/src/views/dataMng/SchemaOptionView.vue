<template>
  <section
    :class="{
      'contents-wrap': swipper === true,
      'contents-wrap-none-history': swipper === false,
    }"
  >
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <section class="row-wrap">
            <div class="bg-box">
              <div class="non-tab__comtent">
                <div class="tab-inner pb0">
                  <DragCol
                    width="100%"
                    height="100%"
                    :leftPercent="37"
                    :sliderWidth="10"
                  >
                    <template #left>
                      <!-- 컬럼명 Comp -->
                      <SchemaTableListComp />
                    </template>
                    <template #right>
                      <div class="full-contents pl10">
                        <!-- 컬럼한글명 Comp-->
                        <SchemaColumnListComp />
                        <!-- <div class="db-connection-details"></div> -->
                      </div>
                    </template>
                  </DragCol>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref } from 'vue';
  import { DragCol } from 'vue-resizer';
  import SchemaTableListComp from '@/views/dataMng/components/schemaOption/SchemaTableListComp.vue';
  import SchemaColumnListComp from '@/views/dataMng/components/schemaOption/SchemaColumnListComp.vue';

  import { useSwipperStore } from '@/stores/swipper';
  import { storeToRefs } from 'pinia';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';

  defineOptions({ name: 'SchemaOptionView' });

  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData, setDictionaryMngState } = tabNaviStore;

  const { swipper } = storeToRefs(useSwipperStore());
</script>

<style lang="scss" scoped></style>
