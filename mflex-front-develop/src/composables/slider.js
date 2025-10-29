import { useSliderStore } from '@/stores/slider';
import { storeToRefs } from 'pinia';

export function useSlider() {
  const store = useSliderStore();
  const { sliderInfos } = storeToRefs(store);
  const { setSliderStatus } = store;
  return {
    sliderInfos,
    setSliderStatus,
  };
}
