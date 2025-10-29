<template>
  <div class="btn-drop__wrap">
    <button class="btn-s file-down" @click="onOpeView">
      <i class="icon"></i>
      <slot></slot>
    </button>
    <div class="pop-infos" v-if="openView" v-click-outside="onClickOutside">
      <div class="pop-selects">
        <ul>
          <li v-for="item in data" :key="item.id">
            <div class="btn-link" @click="onLink(item.id)">
              {{ item.label }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, toRef, toRefs } from 'vue';

import vClickOutside from 'click-outside-vue3';
export default {
  directives: {
    clickOutside: vClickOutside.directive,
  },
  methods: {
    onClickOutside(event) {
      this.close();
    },
  },

  setup(props, { emit, expose }) {
    const data = ref([
      { label: '그리드 목록 내려받기', id: 0 },
      { label: 'DB 전체 목록 내려받기', id: 1 },
    ]);

    const openView = ref(false);
    const onOpeView = () => {
      openView.value = !openView.value;
    };

    const close = () => {
      openView.value = false;
    };

    const onLink = id => {
      emit('selectMenu', id);
      close();
    };
    return {
      data,
      openView,
      onOpeView,
      close,
      onLink,
    };
  },
};
</script>
