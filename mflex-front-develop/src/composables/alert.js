import { useAlertStore } from '@/stores/alert';
import { storeToRefs } from 'pinia';

export function useAlert() {
  const store = useAlertStore();
  const { alertInfos, validationInfos } = storeToRefs(store);
  const { setAlertStatus, setValidationStatus } = store;
  return {
    alertInfos,
    setAlertStatus,
    validationInfos,
    setValidationStatus,
  };
}
