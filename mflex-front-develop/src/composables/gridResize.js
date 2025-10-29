import { useUiStore } from '@/stores/ui';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

export function useGridResize() {
  const uiStore = useUiStore();
  const { getGridApis, getGridApis2 } = storeToRefs(uiStore);
  const { setSideState } = uiStore;

  const gridInterval = ref(null);
  const gridResizeCheck = () => {
    // console.log('getGridApis.value=', getGridApis.value);

    gridInterval.value = setInterval(() => {
      if (getGridApis.value) {
        for (let i = 0; i < getGridApis.value.length; i++) {
          getGridApis.value[i].sizeColumnsToFit();
        }
      }
      if (getGridApis2.value) {
        for (let i = 0; i < getGridApis2.value.length; i++) {
          getGridApis2.value[i].sizeColumnsToFit();
        }
      }
    });
    setTimeout(() => {
      clearInterval(gridInterval.value);
    }, 500);
  };
  return {
    getGridApis,
    getGridApis2,
    setSideState,
    gridResizeCheck,
  };
}
