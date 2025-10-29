<template>
  <transition name="fade-view">
    <div class="dialog-wrapper confirm" v-if="view">
      <div class="dialog-box">
        <!-- <span class="btn-close" @click="closeDialog">닫기</span> -->
        <div class="dialog-header">
          <slot v-if="title" name="header">{{ title }}</slot>
        </div>
        <div v-if="selectCellTypeObject === false" class="dialog-body">
          <div
            v-if="type === 'relationColumn' || type === 'warnCodeValue'"
            style="margin-right: 20px"
          >
            <img src="/public/images/icon_big_warnig.png" style="width: 50px" />
          </div>
          <div style="text-align: left"><span v-html="message"></span></div>
        </div>
        <div v-if="selectCellTypeObject === true" class="dialog-body">
          <ul v-if="Array.isArray(message)">
            <li
              v-for="(item, index) in message"
              :key="index"
              class="cell-state"
              style="padding-top: 10px"
            >
              <span
                class="icon-state"
                :style="{
                  backgroundColor: item.bgColor,
                  color: item.color,
                  width: item.size + 'px',
                }"
                >{{ item.type }}</span
              >
              <span class="label">{{ item.label }}</span>
            </li>
          </ul>
          <div v-else class="cell-state">
            <span
              class="icon-state"
              :style="{
                backgroundColor: bgColor,
                color: color,
                width: size + 'px',
              }"
              >{{ type }}</span
            >
            <span class="label">{{ label }}</span>
          </div>
        </div>
        <div class="dialog-footer" v-if="type == 'confirm'">
          <button
            type="button"
            class="ui-button"
            @click="onConfirm"
            v-if="type == 'alert'"
          >
            {{ confirmText }}
          </button>
          <button
            type="button"
            class="ui-button"
            @click="onConfirm"
            v-if="type == 'confirm'"
          >
            {{ confirmText }}
          </button>
          <button
            type="button"
            class="ui-button"
            @click="onCancel"
            v-if="type == 'confirm'"
          >
            {{ cancelText }}
          </button>
        </div>
        <div class="dialog-footer" v-else-if="type === 'warnCodeValue'">
          <button type="button" class="ui-button" @click="onConfirm">
            확인
          </button>
          <button type="button" class="ui-button" @click="onCancel">
            취소
          </button>
        </div>
        <div class="dialog-footer" v-else>
          <button type="button" class="ui-button" @click="onRelationColumnList">
            목록보기
          </button>
          <button type="button" class="ui-button" @click="onCancel">
            확인
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
  import { object } from 'yup';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';

  defineProps({
    view: {
      type: Boolean,
      default: false,
      required: true,
    },
    title: {
      type: String,
      default: '알림',
      required: false,
    },
    message: {
      type: [String, Object],
      default: '메세지 내용입니다.',
      required: false,
    },
    type: {
      type: String,
      default: 'confirm', //alert, confirm
      required: false,
    },
    confirmText: {
      type: String,
      default: '네',
      required: false,
    },
    cancelText: {
      type: String,
      default: '아니요',
      required: false,
    },
    relationColumnText: {
      type: String,
      default: '목록보기',
      required: false,
    },
    selectCellTypeObject: {
      type: Boolean,
      default: false,
      required: true,
    },
  });

  const emit = defineEmits([
    'update:view',
    'confirm',
    'cancel',
    'relationColumnList',
    'relationTermList',
    'relationDomainClassList',
    'relationDomainList',
  ]);

  const onConfirm = () => {
    closeDialog();
    emit('confirm', '');
  };

  const onRelationColumnList = () => {
    closeDialog();
    emit('relationColumnList', '');
    emit('relationTermList', '');
    emit('relationDomainClassList', '');
    emit('relationDomainList', '');
  };

  const onCancel = () => {
    closeDialog();
    emit('cancel', '');
  };

  const closeDialog = () => {
    emit('update:view', false);
  };
</script>

<style scoped>
  .dialog-header {
    color: #fff;
    background: #379583;
    border-top-right-radius: 5px;
    border-top-left-radius: 5px;
  }
  .title {
    font-size: 16px;
    font-weight: bold;
    padding: 10px;
  }
</style>
