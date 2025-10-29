import { ref } from 'vue';
import { onBeforeUnmount, onMounted } from 'vue';

export function useZoomWheelEvent(target) {
  let timer = null;

  const scrollState = ref('');

  const zoom = event => {
    event.preventDefault();
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (event.deltaY < 0) {
        console.log('Zoom');
        scrollState.value = 'zoom';
      } else {
        console.log('Out');
        scrollState.value = 'out';
      }
      setTimeout(() => {
        scrollState.value = '';
      }, 100);
    }, 100);
  };
  onMounted(() => {
    target.value.addEventListener('wheel', zoom, { passive: false });
  });
  onBeforeUnmount(() => {
    console.log('onBeforeUnmount');
    target.value.removeEventListener('wheel', zoom, { passive: false });
  });

  return {
    scrollState,
  };
}
