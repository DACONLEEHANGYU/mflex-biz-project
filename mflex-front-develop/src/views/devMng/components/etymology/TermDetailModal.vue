<!-- TermDetailModal.vue -->
<template>
  <!-- 모달 오버레이 -->
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 16px">
          <div class="detail-item">
            <!-- <label class="detail-label">사전 분류</label> -->
            <div class="detail-value">
              <span
                class="dictionary-badge"
                :class="getDictionaryClass(termData.dictionaryType)"
              >
                {{
                  termData.dictionaryType === 'my'
                    ? '내 사전'
                    : termData.dictionaryType === 'official'
                    ? '공식 사전'
                    : '타 사전'
                }}
              </span>
            </div>
          </div>

          <h3 class="modal-title">
            {{
              termData.englishAbbr + `(` + termData.termName + `)` ||
              '용어 상세정보'
            }}
          </h3>
          <!-- <div style="color: #aba7a7">
            {{ formatDate(termData.establishedDate) || '-' }}
          </div> -->
        </div>

        <button class="modal-close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <div class="term-detail-grid">
          <!-- 사전 유형 -->
          <div class="detail-item">
            <label class="detail-label">사전명</label>
            <div class="detail-value">
              {{ termData.dictionaryName || '기타 사전' }}
            </div>
          </div>

          <!-- 용어 유형 -->
          <div class="detail-item">
            <label class="detail-label">{{
              termData.searchType === 'term' ? '용어 유형' : '단어 유형'
            }}</label>
            <div class="detail-value">
              <span
                class="term-type-badge"
                :class="getTermTypeClass(termData.termType)"
              >
                {{ termData.termType || '일반어' }}
              </span>
            </div>
          </div>

          <!-- 용어 영문약어명 -->
          <div class="detail-item">
            <label class="detail-label">{{
              termData.searchType === 'term'
                ? '용어 영문약어명'
                : '단어 영문약어명'
            }}</label>
            <div class="detail-value">{{ termData.englishAbbr || '-' }}</div>
          </div>

          <!-- 용어명 -->
          <div class="detail-item">
            <label class="detail-label">{{
              termData.searchType === 'term' ? '용어명' : '단어명'
            }}</label>
            <div class="detail-value term-name">
              {{ termData.termName || '-' }}
            </div>
          </div>

          <!-- 도메인명 -->
          <div class="detail-item">
            <label class="detail-label">{{
              termData.searchType === 'term' ? '도메인명' : '도메인분류명'
            }}</label>
            <div class="detail-value domain-path">
              <!-- <span class="domain-breadcrumb">{{
                termData.domainPath || '-'
              }}</span> -->
              {{
                termData.searchType === 'term'
                  ? termData.domainPath || '-'
                  : termData.domainClassName || '-'
              }}
            </div>
          </div>

          <!-- 제정일자 -->
          <div class="detail-item">
            <label class="detail-label">개정일자</label>
            <div class="detail-value">
              {{ formatDate(termData.establishedDate) || '-' }}
            </div>
          </div>

          <!-- 용어 설명 -->
          <div class="detail-item full-width">
            <label class="detail-label">{{
              termData.searchType === 'term' ? '용어 설명' : '단어 설명'
            }}</label>
            <div class="detail-value description">
              {{ termData.description || '-' }}
            </div>
          </div>

          <!-- 사전 분류 -->
          <!-- <div class="detail-item">
            <label class="detail-label">사전 분류</label>
            <div class="detail-value">
              <span
                class="dictionary-badge"
                :class="getDictionaryClass(termData.dictionaryType)"
              >
                {{ termData.dictionaryName || '기타 사전' }}
              </span>
            </div>
          </div> -->
        </div>
      </div>

      <!-- <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">닫기</button>
      </div> -->
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    isVisible: {
      type: Boolean,
      default: false,
    },
    termData: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['close']);

  const closeModal = () => {
    emit('close');
  };

  // 용어 유형별 CSS 클래스
  const getTermTypeClass = (type) => {
    const typeClasses = {
      약어: 'type-abbreviation',
      전문용어: 'type-technical',
      표준용어: 'type-standard',
      일반어: 'type-general',
    };
    return typeClasses[type] || 'type-general';
  };

  // 사전 분류별 CSS 클래스
  const getDictionaryClass = (type) => {
    console.log('props.termData : ', props.termData);

    const dictClasses = {
      my: 'dict-my',
      official: 'dict-official',
      other: 'dict-other',
    };
    return dictClasses[type] || 'dict-other';
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };
</script>

<style lang="scss" scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.2s ease-out;
  }

  .modal-container {
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.98),
      rgba(15, 23, 42, 0.98)
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.6);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    animation: slideInUp 0.3s ease-out;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 30px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(96, 184, 131, 0.1);

    .modal-title {
      margin: 0;
      color: white;
      font-size: 20px;
      font-weight: 600;
    }

    .modal-close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 28px;
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;

      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.1);
      }
    }
  }

  .modal-body {
    padding: 30px;
    max-height: 60vh;
    overflow-y: auto;
  }

  .term-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    .detail-item {
      &.full-width {
        grid-column: 1 / -1;
      }

      .detail-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #60b883;
        margin-bottom: 8px;
      }

      .detail-value {
        color: rgba(255, 255, 255, 0.9);
        font-size: 15px;
        line-height: 1.5;

        &.term-name {
          font-size: 18px;
          // font-weight: 600;
          color: white;
        }

        &.domain-path {
          .domain-breadcrumb {
            color: rgba(255, 255, 255, 0.8);
            font-family: 'Consolas', 'Monaco', monospace;
            background: rgba(255, 255, 255, 0.05);
            padding: 8px 12px;
            border-radius: 6px;
            border-left: 3px solid #8b5cf6;
          }
        }

        &.description {
          background: rgba(255, 255, 255, 0.03);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          line-height: 1.6;
        }
      }
    }
  }

  /* 배지 스타일 */
  .term-type-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.type-abbreviation {
      background: rgba(59, 130, 246, 0.2);
      color: #93c5fd;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    &.type-technical {
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }

    &.type-standard {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    &.type-general {
      background: rgba(156, 163, 175, 0.2);
      color: #d1d5db;
      border: 1px solid rgba(156, 163, 175, 0.3);
    }
  }

  .dictionary-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;

    &.dict-my {
      background: rgba(96, 184, 131, 0.2);
      color: #60b883;
      border: 1px solid rgba(96, 184, 131, 0.3);
    }

    &.dict-official {
      background: rgba(245, 158, 11, 0.2);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    &.dict-other {
      background: rgba(6, 182, 212, 0.2);
      color: #06b6d4;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }
  }

  .modal-footer {
    padding: 20px 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: flex-end;
    background: rgba(0, 0, 0, 0.1);

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
      }
    }
  }

  /* 스크롤바 */
  .modal-body::-webkit-scrollbar {
    width: 6px;
  }

  .modal-body::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .modal-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }

  /* 애니메이션 */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* 반응형 */
  @media (max-width: 768px) {
    .modal-container {
      width: 95%;
      margin: 20px;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
      padding: 20px;
    }

    .term-detail-grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }
</style>
