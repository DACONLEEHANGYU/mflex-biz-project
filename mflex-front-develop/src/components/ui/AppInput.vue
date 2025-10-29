<template>
  <input
    class="input-text"
    :type="type === 'price' ? 'tel' : type"
    :value="modelValue"
    placeholder="검색 조건을 입력하세요."
    @input="bindNumber"
    @focus="onFocus"
    @blur="onBlur"
    @dragover.prevent
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  />
</template>

<script setup>
  import { isReactive, isRef, ref, watch } from 'vue';

  const props = defineProps({
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
  });

  const emit = defineEmits(['update:modelValue']);

  // const comma = val => {
  //   return String(val).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
  // };
  // const uncomma = str => {
  //   return String(str).replace(/[^\d]+/g, '');
  // };

  /*  //const searchText = ref('');

  // 드래그 이벤트
  const onDrop = (event) => {
    const data = event.dataTransfer.getData('text/plain');
    searchText.value = data;
  }; */

  const bindNumber = ($event) => {
    var value = $event.target.value;
    if (props.type === 'tel') {
      if (value.length >= 11) {
        value = value.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
      }
    }
    if (props.type === 'price') {
      console.log('run~~');
      var currency = +value.replace(/[^\d]/g, '').toString();
      value = Intl.NumberFormat().format(currency);
    }
    if (props.type === 'number') {
      const reg = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-z]/;
      if (reg.exec(props.modelValue) !== null) {
        let value = props.modelValue;
        emit('update:modelValue', value.replace(/[^0-9]/g, ''));
      }
      if (isNaN(parseFloat(value))) {
        emit('update:modelValue', '');
      }
    }
    if (props.type === 'price') {
      checkPriceComma();
    }

    emit('update:modelValue', value);
    // emit('inputChange');
  };

  const onFocus = () => {
    if (props.type === 'number' || props.type === 'price') {
      if (props.modelValue == 0) {
        emit('update:modelValue', '');
      }
    }
  };
  const onBlur = () => {
    if (props.type === 'number' || props.type === 'price') {
      if (props.modelValue == 0) {
        emit('update:modelValue', 0);
      }
    }
  };
  const checkPriceComma = () => {
    console.log('price~~');
    let priceValue = String(props.modelValue);
    var currency = +priceValue.replace(/[^\d]/g, '').toString();
    priceValue = Intl.NumberFormat().format(currency);
    emit('update:modelValue', priceValue);
  };

  if (props.type === 'price') {
    checkPriceComma();
  }

  const onDragEnter = (event) => {
    event.target.classList.add('drag-over');
  };

  const onDragLeave = (event) => {
    event.target.classList.remove('drag-over');
    console.log('leaveDrag');
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.target.classList.remove('drag-over');
    const headerName = event.dataTransfer.getData('text/plain');
    const inputValue = event.target.value;

    if (inputValue) {
      event.target.value = inputValue + ' ' + headerName;
    } else {
      event.target.value = headerName;
    }
  };
</script>
