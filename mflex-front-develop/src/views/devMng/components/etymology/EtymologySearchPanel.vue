<template>
  <div
    :class="
      showSearchResults || etymologyState === true
        ? 'fixed-header-top'
        : 'fixed-header'
    "
  >
    <div class="search-container">
      <!-- 검색 입력 -->
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clip-rule="evenodd"
          />
        </svg>
        <input
          v-model="localSearchTerm"
          type="text"
          class="search-input"
          placeholder="사전에서 조회할 메타 입력"
          @keyup.enter="handleDictionarySearch('term')"
        />
      </div>

      <!-- 메타조회 버튼 -->
      <button
        class="search-btn dictionary"
        @click="handleDictionarySearch('term')"
        :disabled="isSearchLoding"
      >
        {{ isSearchLoding ? '메타 조회 중...' : '메타조회' }}
      </button>

      <!-- 어원분할 버튼 -->
      <button
        class="search-btn etymology"
        @click="handleEtymologySearch"
        :disabled="isLoading"
      >
        {{ isLoading ? '어원 톺아보기 중...' : '어원 톺아보기' }}
      </button>
    </div>
  </div>
</template>

<script setup>
  import { ref, watch } from 'vue';

  const props = defineProps({
    searchTerm: {
      type: String,
      default: '',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    isSearchLoding: {
      type: Boolean,
      default: false,
    },
    showSearchResults: {
      type: Boolean,
      default: false,
    },
    etymologyState: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits([
    'update:searchTerm',
    'etymology',
    'dictionary-search',
  ]);

  const localSearchTerm = ref(props.searchTerm);
  const currentSearchType = ref('');

  watch(
    () => props.searchTerm,
    (newValue) => {
      localSearchTerm.value = newValue;
    }
  );

  watch(localSearchTerm, (newValue) => {
    emit('update:searchTerm', newValue);
  });

  const handleEtymologySearch = () => {
    if (localSearchTerm.value.trim()) {
      emit('etymology', localSearchTerm.value.trim());
    }
  };

  const handleDictionarySearch = (type) => {
    if (localSearchTerm.value.trim()) {
      currentSearchType.value = type;
      emit('dictionary-search', {
        term: localSearchTerm.value.trim(),
        type: type,
      });
    }
  };
</script>

<style lang="scss" scoped>
  .fixed-header {
    display: flex;
    // position: fixed;
    // min-width: 620px;
    // min-height: 65px;
    // top: 50px;
    left: 80%;
    // margin-left: 505px;
    // transform: translateX(-50%);
    margin-bottom: 15px;
    z-index: 1000;
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    padding: 9px;
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    // box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideIn 1s ease-out forwards;
  }

  .fixed-header-top {
    // display: flex;
    position: fixed;
    // min-width: 620px;
    // min-height: 65px;
    top: 100px;
    // margin-top: 20px;
    // left: 40%;
    justify-content: center;
    align-items: center;
    // margin-left: 505px;
    // transform: translateX(-50%);
    margin-bottom: 15px;
    z-index: 1000;
    pointer-events: auto;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(15px);
    padding: 9px;
    border-radius: 15px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    // box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    animation: slideIn 1s ease-out forwards;
  }

  .search-container {
    display: flex;
    align-items: center;
    gap: 12px;
    // min-width: 600px;
  }

  .search-input-wrapper {
    // flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    width: 18px;
    height: 18px;
    color: rgba(255, 255, 255, 0.5);
    z-index: 1;
    pointer-events: none;
  }

  .search-input {
    flex: 1;
    padding: 12px 16px 12px 48px; /* 왼쪽 패딩을 늘려서 아이콘 공간 확보 */
    border: none;
    border-radius: 25px;
    background: rgba(255, 255, 255, 0.08);
    color: white;
    font-size: 14px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    min-width: 200px;
    width: 330px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(96, 184, 131, 0.4);
      border-color: rgba(96, 184, 131, 0.5);
      background: rgba(255, 255, 255, 0.12);
    }

    &:focus + .search-icon {
      color: rgba(96, 184, 131, 0.7);
    }
  }

  .search-input:focus ~ .search-icon,
  .search-input-wrapper:focus-within .search-icon {
    color: rgba(96, 184, 131, 0.7);
  }

  .search-btn {
    padding: 12px 20px;
    border: none;
    border-radius: 25px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    font-size: 13px;
    flex-shrink: 0;

    &.etymology {
      background: linear-gradient(45deg, #60b883, #4caf50);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        background: linear-gradient(45deg, #66c389, #52b556);
      }
    }

    &.dictionary {
      background: #00a79d;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        background: #00a79d;
      }

      &.loading {
        background: #00a79d;
      }
    }

    &:disabled {
      background: linear-gradient(45deg, #64748b, #94a3b8);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  .dictionary-search-group {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;

    .search-btn.dictionary {
      border-radius: 22px;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);

      &:hover:not(:disabled) {
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      }
    }
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .search-container {
      flex-direction: column;
      align-items: stretch;
      min-width: 300px;
      gap: 12px;
    }

    .dictionary-search-group {
      flex-direction: row;
      justify-content: center;
    }

    .search-btn {
      padding: 10px 16px;
      font-size: 12px;

      &.dictionary {
        flex: 1;
      }
    }
  }

  @media (max-width: 480px) {
    .fixed-header {
      left: 50%;
      transform: translateX(-50%);
      right: auto;
      padding: 15px;
      width: calc(100% - 20px);
      max-width: 400px;
    }

    .search-container {
      min-width: auto;
    }

    .dictionary-search-group {
      flex-direction: column;
      gap: 8px;
    }
  }

  @keyframes slideIn {
    0% {
      transform: translateY(30px);
      opacity: 0;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
