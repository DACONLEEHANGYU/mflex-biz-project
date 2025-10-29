<template>
  <div class="filebox">
    <input
      class="upload-name"
      placeholder="파일선택"
      disabled="disabled"
      v-model="fileName"
    />
    <label :for="`file-input${id}`" class="mr5">{{ label }}</label>
    <label
      class="btn-cancel"
      v-if="fileName != '' && useCancel"
      @click="resetFile()"
      >취소</label
    >
    <input
      type="file"
      :id="`file-input${id}`"
      class="upload-hidden"
      :accept="accept"
      @change="onSelectFile"
      ref="fileInput"
    />
  </div>
</template>

<script setup>
import { ref, onActivated } from 'vue';
import { useAlert } from '@/composables/alert';
const { setAlertStatus } = useAlert();

const props = defineProps({
  id: {
    type: [String, Number],
    default: 1,
  },
  accept: {
    type: String,
    default: '.jpg, .png, .jpeg',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '첨부파일',
  },
  useCancel: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(['update:modelValue']);

const fileName = ref('');

const fileInput = ref(null);

const resetFile = () => {
  emit('update:modelValue', {});
  fileName.value = '';
};

const getInputFile = () => {
  let files = fileInput.value.files;
  console.log({ files });
  return files.length > 0 ? files[0] : null;
};

const onSelectFile = event => {
  if (window.FileReader) {
    fileName.value = event.target.files[0].name;
    console.log(window.FileReader, fileName.value);
  }
  if (!('url' in window) && 'webkitURL' in window) {
    console.log('실행?');
    window.URL = window.webkitURL;
  }
  // let ext = event.target.files[0].name.match(/\..*/);
  const extArray = event.target.files[0].name.split('.');
  console.log({ extArray });
  const ext = extArray[extArray.length - 1];
  console.log({ ext });
  if (props.accept.indexOf(ext) === -1) {
    setAlertStatus({
      view: true,
      message: `확장자가 ${props.accept} 인 파일을 선택하세요.`,
    });
    resetFile();
    return;
  }
  emit('update:modelValue', {
    fileName: fileName,
    imageUrl: URL.createObjectURL(event.target.files[0]),
    inputFile: getInputFile(),
  });
};

// onActivated(() => {
//   fileName.value = '';
// });
</script>

<style></style>
