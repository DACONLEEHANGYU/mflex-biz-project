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
                :leftPercent="22"
                :sliderWidth="15"
              >
                <template #left>
                  <!-- <TopInstituteListComp /> -->
                  <BizMetaSideBar @term-deleted="handleTermDeleted" />
                </template>
                <template #right>
                  <!-- <DatabaseSchemaMappingComp /> -->
                  <!-- <InstituteDetailsComp /> -->
                  <BizMetaPanel ref="bizMetaPanelRef" />
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
  import { ref } from 'vue';
  import { DragCol } from 'vue-resizer';
  import BizMetaSideBar from '@/views/bizMetaMng/components/bizMetaSideBar/BizMetaSideBar.vue';
  import BizMetaPanel from '@/views/bizMetaMng/components/bizMetaFlow/BizMetaPanel.vue';

  // 🔥 BizMetaPanel ref
  const bizMetaPanelRef = ref(null);

  // 🔥 용어 삭제 이벤트 핸들러
  const handleTermDeleted = (termId) => {
    console.log('🔥 BizMetaMngView - 용어 삭제 이벤트 수신:', termId);
    if (bizMetaPanelRef.value && bizMetaPanelRef.value.removeNodesByTermId) {
      bizMetaPanelRef.value.removeNodesByTermId(termId);
    }
  };
</script>

<style scoped>
  .tab-inner {
    height: 100%;
    box-sizing: border-box;
    padding: 0;
  }
</style>
