<template>
  <transition name="fade-view">
    <div
      :class="
        !props.moveState
          ? dialogBacgroundClass(position.left, position.top)
          : 'move-dialog'
      "
      v-if="view"
      :style="{ left: `${position.left}px`, top: `${position.top}px` }"
      @mousedown="props.moveState ? startDragging($event) : null"
    >
      <div class="dialog-box" :style="{ width: width }" ref="dialogRef">
        <!-- <span class="btn-close" @click="onClose" v-if="closeBtn">닫기</span> -->
        <!-- <div class="dialog-header" ref="headerRef" style="cursor: move">
          드래그할 수 있는 대화상자
        </div> -->
        <div
          :class="props.moveState ? 'move-dialog-body' : 'dialog-body'"
          :style="{ height: height }"
        >
          <slot></slot>
        </div>
        <div class="dialog-footer" v-if="useFooter">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
  import { ref, reactive, onUnmounted, nextTick, onMounted, watch } from 'vue';

  const props = defineProps({
    view: {
      type: Boolean,
      default: false,
      required: true,
    },
    closeBtn: {
      type: Boolean,
      default: true,
    },
    height: {
      type: String,
      default: 'auto',
    },
    width: {
      type: String,
      default: '400px',
    },
    useFooter: {
      type: Boolean,
      default: false,
    },
    initialLeft: {
      type: Number,
      default: 0,
    },
    initialTop: {
      type: Number,
      default: 0,
    },
    moveState: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['close']);

  const position = reactive({
    left: props.initialLeft,
    top: props.initialTop,
  });

  const headerRef = ref(null);
  const dialogRef = ref(null);
  const isDragging = ref(false);
  const offset = reactive({ x: 0, y: 0 });

  const startDragging = (e) => {
    // moveState가 false면 드래그 시작하지 않음
    if (!props.moveState) return;

    // AppWindow 내부에서 .window-header 찾기
    const header = dialogRef.value.querySelector('.window-header');

    if (header && header.contains(e.target)) {
      isDragging.value = true;
      offset.x = e.clientX - position.left;
      offset.y = e.clientY - position.top;
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', stopDragging);
    }
  };

  const drag = (e) => {
    // moveState가 false면 드래그 중단
    if (!props.moveState || !isDragging.value) return;

    if (isDragging.value) {
      position.left = e.clientX - offset.x;
      position.top = e.clientY - offset.y;
    }
  };

  const stopDragging = () => {
    isDragging.value = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
  };

  const onClose = () => {
    emit('close', false);
  };

  const dialogBacgroundClass = (left, top) => {
    if (props.moveState) {
      return 'move-dialog';
    }

    return top > 0 ? 'dialog-wrapperNew' : 'dialog-wrapper';
  };

  // 컴포넌트 언마운트 시 이벤트 리스너 제거
  onUnmounted(() => {
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);

    position.left = props.initialLeft;
    position.top = props.initialTop;
  });

  const centerDialog = async () => {
    await nextTick(() => {
      if (props.moveState && dialogRef.value) {
        const dialogWidth = dialogRef.value.offsetWidth;
        const dialogHeight = dialogRef.value.offsetHeight;

        console.log('dialog-Width : ', dialogWidth);
        console.log('dialog-Height : ', dialogHeight);

        position.left = Math.max(0, (window.innerWidth - dialogWidth) / 2);
        position.top = Math.max(0, (window.innerHeight - dialogHeight) / 2 / 2);
      }
    });
  };

  // 대화 상자가 열릴 때 호출
  onMounted(() => {
    centerDialog();
  });

  // props나 dialog 상태가 변경될 때 호출
  watch([() => props.moveState, dialogRef], () => {
    centerDialog();
  });
</script>

<style scoped>
  .dialog-header {
    padding: 10px;
    background-color: #f0f0f0;
    user-select: none;
  }

  .move-dialog {
    position: fixed;
    /* width: 100%; */
    /* height: 100%; */
    z-index: 9999;
    left: 0;
    top: 0;
    /* background-color: rgba(0, 0, 0, 0.5); */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dialog-box .move-dialog-body {
    height: auto;
    border: 2px solid;
    border-radius: 10px;

    font-size: 17px;
    color: #1d1d1d;
    min-height: 100px !important;
    text-align: center;
    flex-direction: column;
    word-break: keep-all;
    line-height: 24px;
    max-height: calc(100vh - 100px);
    padding: 0;
    display: block;
    text-align: left;
  }
</style>
