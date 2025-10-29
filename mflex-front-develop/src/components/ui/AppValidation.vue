<!-- components/ui/AppErrorDialog.vue -->
<template>
  <AppWindow
    :view="errorState.isVisible"
    @close="onClose"
    width="700px"
    height="auto"
  >
    <TermValidationErrorWindow
      :errorMessage="{
        state: 'error',
        stateName: errorState.type,
        errorTitle: errorState.title,
        errorMessages: [errorState.message],
      }"
      @confirm="onConfirm"
      @close="onClose"
    />
  </AppWindow>
</template>

<script setup>
  import { useErrorHandler } from '@/composables/useErrorHandler';
  import TermValidationErrorWindow from '@/components/popWindow/TermValidationErrorWindow.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';

  const { errorState, resolveError } = useErrorHandler();

  const onConfirm = () => {
    resolveError('confirm');
  };

  const onClose = () => {
    resolveError('cancel');
  };
</script>
