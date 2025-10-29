<template>
  <div class="tabs">
    <div class="tabs-list">
      <div class="tab-item" v-for="(tab, index) in tabList" :key="index">
        <label>
          <input
            type="radio"
            :name="`tab-${tabName}`"
            :value="index + 1"
            :checked="index + 1 === modelValue ? true : false"
            @input="updateModelValue(Number($event.target.value), tab)"
          />
          <div class="tab-label">{{ tab }}</div>
        </label>
      </div>
    </div>

    <template v-for="(tab, index) in tabList">
      <template v-if="mode === 'if'">
        <div
          class="tab-content"
          :key="index"
          v-if="index + 1 === modelValue ? true : false"
        >
          <slot :name="`tabPanel-${index + 1}`" />
        </div>
      </template>
      <template v-else>
        <div
          class="tab-content"
          :key="index"
          v-show="index + 1 === modelValue ? true : false"
        >
          <slot :name="`tabPanel-${index + 1}`" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { randomKey } from '@/utils/utils.js';

  const router = useRouter();

  // @input="$emit('update:modelValue', Number($event.target.value))"

  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData } = tabNaviStore;

  defineProps({
    tabList: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Number,
      default: 1,
    },
    mode: {
      type: String,
      default: 'if',
    },
    // tabName: {
    //   type: String,
    //   default: '',
    // },
  });

  const tabName = ref(randomKey());

  const emits = defineEmits(['update:modelValue']);

  const updateModelValue = (value, tab) => {
    let targetPath = '';

    // if (tab === '용어') {
    //   // targetPath = '/dictionarySearch/term/list';
    //   router.push('/dictionarySearch/term/list');
    //   setTabNaviData({ title: '용어조회', path: targetPath });
    // } else if (tab === '단어') {
    //   // targetPath = '/dictionarySearch/word/list';
    //   router.push('/dictionarySearch/word/list');
    //   setTabNaviData({ title: '단어조회', path: targetPath });
    // } else if (tab === '도메인') {
    //   // targetPath = '/dictionarySearch/domain/list';
    //   router.push('/dictionarySearch/domain/list');
    //   setTabNaviData({ title: '도메인조회', path: targetPath });
    // } else if (tab === '코드') {
    //   // targetPath = '/dictionarySearch/code/list';
    //   router.push('/dictionarySearch/code/list');
    //   setTabNaviData({ title: '코드조회', path: targetPath });
    // }

    // 현재 경로와 이동하려는 경로를 비교
    // if (router.currentRoute.value.path !== targetPath) {
    //   router.push(targetPath);
    // }

    console.log('updateModelValue', event);
    console.log('updateModelValue', value);
    emits('update:modelValue', value);
  };

  // const updateModelValue = (value, tab) => {
  //   // 사전조회 히스토리 생성
  //   if (tab === '용어') {
  //     setTabNaviData({
  //       title: '용어조회',
  //       path: '/dictionarySearch/term/list',
  //     });
  //     router.push('/dictionarySearch/term/list');
  //   } else if (tab === '단어') {
  //     setTabNaviData({
  //       title: '단어조회',
  //       path: '/dictionarySearch/word/list',
  //     });
  //     router.push('/dictionarySearch/word/list');
  //   } else if (tab === '도메인') {
  //     setTabNaviData({
  //       title: '도메인조회',
  //       path: '/dictionarySearch/domain/list',
  //     });
  //     router.push('/dictionarySearch/domain/list');
  //   } else if (tab === '코드') {
  //     setTabNaviData({
  //       title: '코드조회',
  //       path: '/dictionarySearch/code/list',
  //     });
  //     router.push('/dictionarySearch/code/list');
  //   }

  //   console.log('updateModelValue', event);
  //   console.log('updateModelValue', value);
  //   emits('update:modelValue', value);
  // };
</script>
