<template>
  <div v-if="node">
    <!-- 노드 클릭 팝업 - VueFlow 내부에서 우측 상단에 표시 -->
    <div class="node-detail-popup" @click.stop>
      <div class="popup-content">
        <div class="popup-header">
          <h4>{{ node.label }}</h4>
          <button class="close-btn" @click="closePopup">×</button>
        </div>
        <div class="popup-body">
          <!-- 기본 정보 섹션 -->
          <div class="basic-info-section">
            <div v-if="node.english" class="popup-item">
              <strong>영어:</strong> {{ node.english }}
            </div>
            <div v-if="node.definition" class="popup-item">
              <strong>정의:</strong> {{ node.definition }}
            </div>
            <div v-if="node.meaning" class="popup-item">
              <strong>의미:</strong> {{ node.meaning }}
            </div>
            <div v-if="node.origin" class="popup-item">
              <strong>어원:</strong> {{ node.origin }}
            </div>
            <div v-if="node.domainClass" class="popup-item">
              <strong>도메인:</strong> {{ node.domainGroup }} /
              {{ node.domainClass }}
            </div>
          </div>

          <!-- 사전 등록 정보 섹션 -->
          <div
            v-if="
              groupedDictionaryData &&
              Object.keys(groupedDictionaryData).length > 0
            "
            class="dictionary-section"
          >
            <div class="section-divider"></div>
            <div class="section-title">
              <span class="title-icon">📚</span>
              사전 등록 정보
            </div>

            <!-- 사전 타입별 그룹 -->
            <div
              v-for="(group, groupType) in groupedDictionaryData"
              :key="groupType"
              class="dictionary-group"
            >
              <button
                @click="toggleDictionaryGroup(groupType)"
                class="dictionary-group-header"
                :class="getDictionaryClass(groupType)"
              >
                <div class="group-header-content">
                  <div class="group-info">
                    <span class="dict-icon">{{
                      getDictionaryIcon(groupType)
                    }}</span>
                    <span class="group-name">{{
                      getDictionaryGroupName(groupType)
                    }}</span>
                    <span class="group-count">{{ group.length }}개</span>
                  </div>
                  <span
                    class="expand-icon"
                    :class="{ expanded: expandedGroups[groupType] }"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </button>

              <!-- 사전 항목들 -->
              <div v-if="expandedGroups[groupType]" class="dictionary-items">
                <div
                  v-for="(dictInfo, index) in group"
                  :key="index"
                  class="dictionary-item"
                  :class="getDictionaryClass(groupType)"
                >
                  <div class="dictionary-term">
                    {{ dictInfo.prefix }}({{ node.label }})
                  </div>
                  <div v-if="dictInfo.description" class="dictionary-desc">
                    {{ dictInfo.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 사전에 없는 경우 -->
          <div v-else class="not-found-section">
            <div class="section-divider"></div>
            <div class="not-found-info">
              <span class="warning-icon">⚠️</span>
              <span class="warning-text">이 용어는 등록된 사전이 없습니다</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, reactive } from 'vue';

  const props = defineProps({
    node: {
      type: Object,
      default: null,
    },
  });

  const emit = defineEmits(['close']);

  // 펼침/접힘 상태 관리
  const expandedGroups = reactive({
    my: true,
    official: true,
    upper: true,
    other: true,
  });

  const closePopup = () => {
    emit('close');
  };

  // 더미 사전 정보 데이터
  const getDummyDictionaryInfo = (termLabel) => {
    const dictionaryData = {
      횟수: [
        {
          type: 'my',
          name: '내 사전',
          prefix: 'COUNT',
          description: '개인 정의된 횟수 개념',
        },
        {
          type: 'official',
          name: '공식 사전',
          prefix: 'FREQUENCY',
          description: '공식적으로 정의된 빈도수',
        },
        {
          type: 'official',
          name: '공식 사전',
          prefix: 'FREQUENCY_ALT',
          description: '대안적 빈도수 정의',
        },
        {
          type: 'upper',
          name: '상위 사전',
          prefix: 'OCCURRENCE',
          description: '상위 기관에서 정의한 발생 횟수',
        },
        {
          type: 'other',
          name: '타 기관 사전',
          prefix: 'COUNT_OTHER',
          description: '타 기관에서 정의한 횟수',
        },
      ],
      선풍기: [
        {
          type: 'official',
          name: '공식 사전',
          prefix: 'ELECTRIC_FAN',
          description: '전기를 이용한 바람 발생 장치',
        },
        {
          type: 'other',
          name: '타 기관 사전',
          prefix: 'VENTILATOR',
          description: '다른 기관에서 정의한 환풍 장치',
        },
      ],
      양날개: [
        {
          type: 'my',
          name: '내 사전',
          prefix: 'DUAL_WING',
          description: '개인 정의된 양쪽 날개 구조',
        },
        {
          type: 'official',
          name: '공식 사전',
          prefix: 'BILATERAL_WING',
          description: '공식적으로 정의된 양측 날개',
        },
        {
          type: 'upper',
          name: '상위 사전',
          prefix: 'TWIN_BLADE',
          description: '상위 기관에서 정의한 쌍날개',
        },
        {
          type: 'other',
          name: '타 기관 사전',
          prefix: 'DOUBLE_WING',
          description: '다른 기관에서 정의한 이중 날개',
        },
      ],
      회전: [
        {
          type: 'official',
          name: '공식 사전',
          prefix: 'ROTATION',
          description: '축을 중심으로 하는 원운동',
        },
      ],
    };

    return dictionaryData[termLabel] || [];
  };

  // 계산된 사전 정보 (노드의 label에 따라 결정)
  const dictionaryInfo = computed(() => {
    if (!props.node) return [];
    return (
      props.node.dictionaryInfo || getDummyDictionaryInfo(props.node.label)
    );
  });

  // 사전 정보를 타입별로 그룹핑
  const groupedDictionaryData = computed(() => {
    const grouped = {};
    dictionaryInfo.value.forEach((item) => {
      if (!grouped[item.type]) {
        grouped[item.type] = [];
      }
      grouped[item.type].push(item);
    });
    return grouped;
  });

  // 사전 그룹 펼침/접힘 토글
  const toggleDictionaryGroup = (groupType) => {
    expandedGroups[groupType] = !expandedGroups[groupType];
  };

  // 사전 타입별 아이콘 반환
  const getDictionaryIcon = (type) => {
    const icons = {
      my: '👤', // 내 사전
      official: '🏛️', // 공식 사전
      upper: '⬆️', // 상위 사전
      other: '🔄', // 타 사전
    };
    return icons[type] || '📖';
  };

  // 사전 타입별 그룹명 반환
  const getDictionaryGroupName = (type) => {
    const names = {
      my: '내 사전',
      official: '공식 사전',
      upper: '상위 사전',
      other: '타 기관 사전',
    };
    return names[type] || '기타 사전';
  };

  // 사전 타입별 CSS 클래스 반환
  const getDictionaryClass = (type) => {
    return `dict-${type}`;
  };
</script>

<style lang="scss" scoped>
  .node-detail-popup {
    width: 450px;
    max-width: 90vw;
    max-height: calc(100vh - 40px);
    animation: slideInFromRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)
      forwards;
    pointer-events: auto;
    position: relative;
  }

  .popup-content {
    background: linear-gradient(
      135deg,
      rgba(30, 41, 59, 0.95),
      rgba(15, 23, 42, 0.95)
    );
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 15px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    overflow: hidden;

    /* VueFlow 내에서 화면을 벗어나지 않도록 최대 높이 설정 */
    max-height: 750px; /* 최대 높이 */
    min-height: 200px; /* 최소 높이 */

    display: flex;
    flex-direction: column;

    /* 상단에서의 거리 계산 - 팝업이 상단 근처에 있을 때 */
    &.popup-near-top {
      max-height: calc(100vh - 120px);
    }

    /* 하단에서의 거리 계산 - 팝업이 하단 근처에 있을 때 */
    &.popup-near-bottom {
      max-height: calc(100vh - 40px);
    }
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(96, 184, 131, 0.1);
    flex-shrink: 0; /* 헤더는 축소되지 않음 */

    h4 {
      margin: 0;
      color: white;
      font-size: 18px;
      font-weight: 600;
      word-break: keep-all;
      line-height: 1.3;
    }

    .close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border-radius: 50%;
      flex-shrink: 0;

      &:hover {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.1);
      }
    }
  }

  .popup-body {
    padding: 24px;
    color: rgba(255, 255, 255, 0.9);
    overflow-y: auto; /* 세로 스크롤 활성화 */
    overflow-x: hidden; /* 가로 스크롤 숨김 */
    flex: 1; /* 남은 공간을 모두 차지 */

    /* 스크롤 영역의 최소/최대 높이 설정 */
    min-height: 150px;
    max-height: calc(100vh - 200px); /* 헤더와 여백을 제외한 최대 높이 */

    .popup-item {
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.5;
      word-break: keep-all;

      strong {
        color: #60b883;
        margin-right: 8px;
        font-weight: 600;
        display: inline-block;
        min-width: 60px;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  /* 섹션 구분선 */
  .section-divider {
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    margin: 20px 0;
  }

  /* 사전 섹션 */
  .dictionary-section {
    .section-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: white;
      margin-bottom: 16px;

      .title-icon {
        margin-right: 8px;
        font-size: 18px;
      }
    }
  }

  /* 사전 그룹 헤더 */
  .dictionary-group {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .dictionary-group-header {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 8px;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .group-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .group-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .dict-icon {
          font-size: 16px;
        }

        .group-name {
          font-size: 14px;
          font-weight: 600;
          color: white;
        }

        .group-count {
          background: rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.8);
          font-size: 11px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      .expand-icon {
        color: rgba(255, 255, 255, 0.6);
        transition: transform 0.2s ease;

        &.expanded {
          transform: rotate(180deg);
        }
      }
    }
  }

  /* 사전 항목들 컨테이너 */
  .dictionary-items {
    margin-left: 12px;
    padding-left: 12px;
    border-left: 2px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* 개별 사전 항목 */
  .dictionary-item {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: 10px 12px;
    transition: all 0.2s ease;
    flex-shrink: 0; /* 아이템이 축소되지 않음 */

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .dictionary-term {
      font-size: 13px;
      font-weight: 600;
      color: white;
      font-family: 'Consolas', 'Monaco', monospace;
      background: rgba(0, 0, 0, 0.2);
      padding: 3px 6px;
      border-radius: 3px;
      display: inline-block;
      margin-bottom: 6px;
      word-break: break-all; /* 긴 텍스트 줄바꿈 */
    }

    .dictionary-desc {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.4;
      word-break: keep-all;
    }
  }

  /* 사전 타입별 색상 - 그룹 헤더와 항목에 적용 */
  .dict-my {
    .dictionary-group-header {
      border-left: 4px solid #60b883;
    }
    .group-name {
      color: #60b883 !important;
    }
  }

  .dict-official {
    .dictionary-group-header {
      border-left: 4px solid #f59e0b;
    }
    .group-name {
      color: #f59e0b !important;
    }
  }

  .dict-upper {
    .dictionary-group-header {
      border-left: 4px solid #8b5cf6;
    }
    .group-name {
      color: #8b5cf6 !important;
    }
  }

  .dict-other {
    .dictionary-group-header {
      border-left: 4px solid #06b6d4;
    }
    .group-name {
      color: #06b6d4 !important;
    }
  }

  /* 사전에 없는 경우 */
  .not-found-section {
    .not-found-info {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: rgba(252, 165, 165, 0.9);

      .warning-icon {
        margin-right: 8px;
        font-size: 16px;
      }

      .warning-text {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  /* 스크롤바 스타일링 - 더 보기 쉽게 수정 */
  .popup-body::-webkit-scrollbar {
    width: 8px;
  }

  .popup-body::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    margin: 4px 0;
  }

  .popup-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    &:active {
      background: rgba(255, 255, 255, 0.4);
    }
  }

  /* 우측에서 슬라이드인 애니메이션 */
  @keyframes slideInFromRight {
    0% {
      transform: translateX(100%);
      opacity: 0;
    }
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* 반응형 디자인 개선 */
  @media (max-width: 768px) {
    .node-detail-popup {
      width: calc(100vw - 40px);
      max-width: none;
    }

    .popup-content {
      max-height: calc(100vh - 60px);
    }

    .popup-header {
      padding: 16px 20px;

      h4 {
        font-size: 16px;
      }
    }

    .popup-body {
      padding: 20px;
      max-height: calc(100vh - 160px);

      .popup-item {
        font-size: 13px;

        strong {
          min-width: 50px;
        }
      }

      .dictionary-section {
        .section-title {
          font-size: 14px;
        }

        .dictionary-item {
          padding: 10px 12px;

          .dictionary-term {
            font-size: 13px;
          }

          .dictionary-desc {
            font-size: 11px;
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .node-detail-popup {
      width: calc(100vw - 20px);
    }

    .popup-content {
      max-height: calc(100vh - 40px);
    }

    .popup-header {
      padding: 12px 16px;
    }

    .popup-body {
      padding: 16px;
      max-height: calc(100vh - 120px);
    }
  }

  /* 매우 작은 화면에 대한 추가 최적화 */
  @media (max-height: 600px) {
    .popup-content {
      max-height: calc(100vh - 20px);
    }

    .popup-body {
      max-height: calc(100vh - 100px);
      padding: 16px;
    }

    .popup-header {
      padding: 12px 16px;
    }
  }
</style>
