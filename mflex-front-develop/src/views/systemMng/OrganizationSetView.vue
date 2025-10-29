<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <div class="bg-box">
            <div class="tab-inner pb0">
              <div style="height: 100%; width: 31%">
                <OrganizationListComp />
              </div>
              <!-- <DragCol
                width="100%"
                height="100%"
                :leftPercent="35"
                :sliderWidth="10"
              >
                <template #left>
                  
                </template>
                <template #right>
                </template> -->
              <!-- </DragCol> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script setup>
  import OrganizationListComp from '@/views/systemMng/components/organization/OrganizationListComp.vue';
</script>
