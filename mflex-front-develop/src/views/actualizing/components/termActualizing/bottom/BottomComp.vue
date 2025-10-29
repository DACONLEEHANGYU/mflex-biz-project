<template>
  <section class="row-wrap pt10">
    <div class="tab-inner">
      <div class="col col-2">
        <LeftComp></LeftComp>
        <div class="inputs-row termjob-inputarea">
          <RigthComp></RigthComp>
        </div>
      </div>
    </div>
  </section>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, inject, watch, nextTick } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import RigthComp from '@/views/actualizing/components/termActualizing/bottom/manage/RightComp.vue';
  import LeftComp from '@/views/actualizing/components/termActualizing/bottom/jobBox/LeftComp.vue';
  export default {
    components: {
      RigthComp,
      LeftComp,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    emits: ['termwork-complete', 'term-job-select'],
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useDctnryId } = userStngInfo.value;

      const termJobSelectData = reactive({});

      return {
        useDctnryId,
        userInfo,
        useMetaMngInstId,
        termJobSelectData,
      };
    },
  };
</script>
