<template>
  <transition name="fade-view">
    <div class="dialog-wrapper alert" v-if="alertInfos.view">
      <div class="dialog-box">
        <span
          class="btn-close"
          @click="
            setAlertStatus({
              view: false,
              message: '',
            })
          "
          >닫기</span
        >
        <!-- <div class="dialog-header">
          <slot name="header">알림</slot>
        </div> -->
        <div class="dialog-body">
          <!-- <div>
            <img
              src="/public/images/icon_big_warnig.png"
              style="width: 70px; margin-right: 30px"
            />
          </div> -->

          <span v-html="alertInfos.message"></span>
        </div>
        <div class="dialog-footer">
          <button
            style="font-size: 21px; height: 70px"
            type="button"
            class="ui-button"
            @click="
              setAlertStatus({
                view: false,
                message: '',
              })
            "
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
  import { useAlert } from '@/composables/alert';

  const { alertInfos } = useAlert();

  const { setAlertStatus } = useAlert();
</script>

<style scoped>
  .dialog-body {
    padding: 20px 20px 15px 20px !important;
  }

  .ui-button {
    font-size: 21px;
  }

  .ui-button:hover {
    background-color: #36c270;
    color: white;
  }
</style>
