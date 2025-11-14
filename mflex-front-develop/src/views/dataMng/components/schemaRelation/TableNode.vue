<template>
  <div :class="['table-node', { focused: isFocused, connected: isConnected, dimmed: isDimmed }]">
    <div class="node-header">
      <div class="node-title">{{ data.label }}</div>
      <div class="node-subtitle">{{ data.id }}</div>
    </div>
    <div class="node-body">
      <div
        v-for="(col, i) in displayColumns"
        :key="i"
        :class="[
          'column-row',
          {
            'pk-fk-column': col.isPK && isFKColumn(col.name),
            'pk-column': col.isPK && !isFKColumn(col.name),
            'fk-column': !col.isPK && isFKColumn(col.name)
          }
        ]"
      >
        <!-- 왼쪽 핸들 (target - 모든 컬럼) -->
        <Handle
          :id="`${data.id}-${col.name}-target`"
          type="target"
          :position="Position.Left"
          :style="{ top: `${getColumnHandlePosition(i)}px` }"
          :class="['column-handle', 'target-handle', { 'fk-handle': isFKColumn(col.name) }]"
        />

        <span class="col-icon">{{ getColumnIcon(col) }}</span>
        <span class="col-name">{{ col.name }}</span>
        <span class="col-type">{{ col.type }}</span>

        <!-- 오른쪽 핸들 (source - 모든 컬럼) -->
        <Handle
          :id="`${data.id}-${col.name}-source`"
          type="source"
          :position="Position.Right"
          :style="{ top: `${getColumnHandlePosition(i)}px` }"
          :class="['column-handle', 'source-handle', { 'pk-handle': col.isPK }]"
        />
      </div>
      <div v-if="data.columns.length > 10" class="more-indicator">
        ... {{ data.columns.length - 10 }} more
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  isFocused: {
    type: Boolean,
    default: false
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  isDimmed: {
    type: Boolean,
    default: false
  }
})

// 표시할 컬럼 (최대 10개)
const displayColumns = computed(() => {
  return props.data.columns.slice(0, 10)
})

// FK 컬럼 여부 확인
const isFKColumn = (columnName) => {
  if (!props.data.edges) return false
  return props.data.edges.some(edge => {
    if (edge.target !== props.data.id) return false
    const targetColumns = edge.targetColumn.split(',').map(c => c.trim())
    return targetColumns.includes(columnName)
  })
}

// 컬럼 아이콘
const getColumnIcon = (col) => {
  if (col.isPK && isFKColumn(col.name)) return '🔑🔗'
  if (col.isPK) return '🔑'
  if (isFKColumn(col.name)) return '🔗'
  return ''
}

// 컬럼별 핸들 위치 계산
const getColumnHandlePosition = (index) => {
  // 헤더: padding-top(8) + title(13) + margin(2) + subtitle(11) + padding-bottom(8) = 약 42px
  // 하지만 line-height 고려하면 실제로는 약 40px
  const headerHeight = 40
  // 컬럼 행: padding-top(6) + font(11) + padding-bottom(6) = 약 23px
  const rowHeight = 23
  // 각 행의 중앙
  return headerHeight + (index * rowHeight) + (rowHeight / 2)
}
</script>

<style scoped>
.table-node {
  background: white;
  border: 2px solid #ddd;
  border-radius: 5px;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.table-node.focused {
  border-color: #ff9800;
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
  background: #fff7e6;
}

.table-node.connected {
  border-color: #2196f3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  background: #e3f2fd;
}

.table-node.dimmed {
  opacity: 0.4;
}

.node-header {
  background: #2e7d32;  /* 진녹색 (Material Design Green 800) */
  color: white;
  padding: 8px 12px;
  border-radius: 3px 3px 0 0;
  cursor: move;
  height: 40px; /* 명시적 높이 지정 (padding 포함) */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.table-node.focused .node-header {
  background: #ff9800;
}

.table-node.connected .node-header {
  background: #2196f3;
}

.node-title {
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 2px;
}

.node-subtitle {
  font-size: 11px;
  opacity: 0.9;
  font-family: monospace;
}

.node-body {
  padding: 0;
}

.column-row {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 11px;
  font-family: monospace;
  height: 23px; /* 명시적 높이 지정 (padding 포함) */
  box-sizing: border-box;
}

.column-row:last-child {
  border-bottom: none;
}

.column-row.pk-column {
  background: #fff3cd;
  border-left: 3px solid #ffc107;
}

.column-row.fk-column {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

/* PK + FK 동시 (식별 관계의 FK) */
.column-row.pk-fk-column {
  background: linear-gradient(135deg, #fff3cd 0%, #fff3cd 50%, #e3f2fd 50%, #e3f2fd 100%);
  border-left: 3px solid;
  border-image: linear-gradient(to bottom, #ffc107 0%, #ffc107 50%, #2196f3 50%, #2196f3 100%) 1;
}

.col-icon {
  width: 28px;
  flex-shrink: 0;
  font-size: 10px; /* 이모지 크기 조정 */
  display: flex;
  align-items: center;
  overflow: hidden;
}

.col-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 8px;
}

.col-type {
  color: #999;
  font-size: 9px;
  flex-shrink: 0;
}

.more-indicator {
  padding: 6px 8px;
  text-align: center;
  color: #999;
  font-size: 11px;
  font-style: italic;
  background: #f9f9f9;
  border-radius: 0 0 3px 3px;
}

/* Handle 스타일 */
:deep(.column-handle) {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid #555;
  background: white;
  position: absolute;
  opacity: 0.3; /* 기본적으로 반투명 */
  transition: opacity 0.2s, width 0.2s, height 0.2s;
}

:deep(.target-handle) {
  left: -4px;
  border-color: #999;
  background: #f5f5f5;
}

:deep(.source-handle) {
  right: -4px;
  border-color: #999;
  background: #f5f5f5;
}

/* FK/PK 핸들은 항상 보이고 강조 */
:deep(.fk-handle) {
  opacity: 1;
  border-color: #2196f3;
  background: #e3f2fd;
}

:deep(.pk-handle) {
  opacity: 1;
  border-color: #ffc107;
  background: #fff3cd;
}

/* 호버 시 모든 핸들 표시 */
.column-row:hover :deep(.column-handle) {
  opacity: 1;
}

:deep(.column-handle:hover) {
  width: 10px;
  height: 10px;
  border-width: 3px;
  opacity: 1 !important;
}
</style>
