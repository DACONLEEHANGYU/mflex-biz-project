<template>
  <div class="diagram">
    <VueFlow
      v-model:nodes="vueFlowNodes"
      v-model:edges="vueFlowEdges"
      :default-viewport="{ zoom: 1.5, x: 0, y: 0 }"
      :min-zoom="0.3"
      :max-zoom="3"
      :zoom-on-scroll="true"
      :pan-on-scroll="false"
      :zoom-on-double-click="false"
      @node-click="handleNodeClick"
      @node-double-click="handleNodeDoubleClick"
      @pane-click="handlePaneClick"
      class="vue-flow-container"
    >
      <Background pattern-color="#aaa" :gap="16" />
      <MiniMap />

      <!-- 줌 컨트롤 (좌측 상단) -->
      <div class="zoom-controls">
        <button @click="handleZoomIn" class="control-btn" title="줌 인">+</button>
        <button @click="handleZoomOut" class="control-btn" title="줌 아웃">−</button>
        <button @click="handleFitView" class="control-btn" title="전체 보기">⊡</button>
      </div>

      <!-- 엣지 타입 필터 (우측 상단) -->
      <div class="edge-filter">
        <label class="filter-checkbox">
          <input type="checkbox" v-model="showIdentifying" />
          <span>식별</span>
        </label>
        <label class="filter-checkbox">
          <input type="checkbox" v-model="showNonIdentifying" />
          <span>비식별</span>
        </label>
        <div class="filter-divider"></div>
        <label class="filter-checkbox">
          <input type="checkbox" v-model="showDetailedColumns" />
          <span>컬럼별 연결</span>
        </label>
      </div>

      <template #node-table="{ data }">
        <TableNode :data="data" :is-focused="focusedNodeId === data.id" :is-connected="highlightedNodes.has(data.id)" :is-dimmed="isDimmed(data.id)" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, watchEffect, nextTick } from 'vue'
import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import TableNode from './TableNode.vue'
import { getErrorMessage } from '../utils/errorHandler'

// Vue Flow 스타일 임포트
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1/schema/manage/relation'

const props = defineProps({
  panelOpen: {
    type: Boolean,
    default: false
  },
  instituteId: {
    type: Number,
    required: true
  },
  databaseId: {
    type: Number,
    required: true
  },
  currentSchema: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['node-click'])

// 상태
const nodes = ref([])
const edges = ref([])
const focusedNodeId = ref(null)
const highlightedNodes = ref(new Set())
const clickedNodeId = ref(null) // 싱글 클릭된 노드 (엣지 z-index 상승용)

// 엣지 타입 필터 (디폴트: 둘다 선택)
const showIdentifying = ref(true)
const showNonIdentifying = ref(true)
const showDetailedColumns = ref(false) // 컬럼별 연결 표시 여부

// Vue Flow 노드/엣지
const vueFlowNodes = ref([])
const allEdges = ref([]) // 모든 엣지 저장
const vueFlowEdges = ref([]) // 필터링된 엣지 (ref로 변경)

// 엣지 필터링 및 업데이트 (watchEffect 사용)
watchEffect(() => {
  vueFlowEdges.value = allEdges.value
    .filter(edge => {
      const edgeType = edge.data?.edgeType || 'non-identifying'

      // 타입 필터
      if (edgeType === 'identifying' && !showIdentifying.value) {
        return false
      }
      if (edgeType === 'non-identifying' && !showNonIdentifying.value) {
        return false
      }

      // 컬럼별 연결 필터
      const isDetailEdge = edge.id.includes('_detail')
      if (showDetailedColumns.value) {
        // 컬럼별 연결 모드: detail 엣지만 표시
        return isDetailEdge
      } else {
        // 기본 모드: detail이 아닌 엣지만 표시
        return !isDetailEdge
      }
    })
    .map(edge => {
      // 클릭된 노드와 연결된 엣지는 z-index를 높여서 상위로 올림
      const isConnectedToClickedNode = clickedNodeId.value &&
        (edge.source === clickedNodeId.value || edge.target === clickedNodeId.value)

      return {
        ...edge,
        type: edge.type || 'bezier', // type 명시적 보존
        zIndex: isConnectedToClickedNode ? 1000 : (edge.zIndex || 0)
      }
    })
})

// Vue Flow instance
const { fitView, setCenter, zoomTo, zoomIn, zoomOut } = useVueFlow()

// 테이블 개수에 따른 줌 레벨 계산
const calculateZoomLevels = () => {
  const tableCount = nodes.value.length
  let maxZoom = 2.0
  let minZoom = 0.5

  // 기본 줌 레벨 계산 (테이블 개수 기준만)
  if (tableCount <= 5) {
    maxZoom = 2.5  // 적은 테이블: 크게 확대
    minZoom = 1.5
  } else if (tableCount <= 10) {
    maxZoom = 2.0
    minZoom = 1.0
  } else if (tableCount <= 20) {
    maxZoom = 1.5
    minZoom = 0.8
  } else if (tableCount <= 50) {
    maxZoom = 1.2
    minZoom = 0.5
  } else {
    maxZoom = 1.0  // 많은 테이블: 작게 축소
    minZoom = 0.3
  }

  return { maxZoom, minZoom }
}

// 데이터 로드
const loadDiagram = async () => {
  try {
    const params = {
      instituteId: props.instituteId,
      databaseId: props.databaseId,
      schema: props.currentSchema
    }

    const res = await axios.get(`${API_BASE}/diagrams/er`, { params })
    nodes.value = res.data.nodes
    edges.value = res.data.edges

    // Vue Flow 형식으로 변환
    vueFlowNodes.value = nodes.value.map(node => ({
      id: node.id,
      type: 'table',
      position: { x: node.x, y: node.y },
      data: {
        id: node.id,
        label: node.label,
        columns: node.columns,
        edges: edges.value
      }
    }))

    // 엣지 생성: 기본 + 상세(컬럼별)
    const generatedEdges = []
    edges.value.forEach((edge, idx) => {
      const sourceColumns = edge.sourceColumn.split(',').map(c => c.trim())
      const targetColumns = edge.targetColumn.split(',').map(c => c.trim())

      // 경고가 있는 엣지는 빨간색으로 표시
      const hasWarnings = edge.hasWarnings || false
      let strokeColor = '#666' // 기본 (비식별)
      if (hasWarnings) {
        strokeColor = '#e74c3c' // 빨간색 (경고)
      } else if (edge.type === 'identifying') {
        strokeColor = '#9b59b6' // 보라색 (식별)
      }

      // 기본 엣지 (constraint 단위로 묶음 - 복합키의 중간 지점에 연결)
      // 홀수: 정확한 중간, 짝수: 중간의 위쪽 (Math.floor((length-1)/2))
      const midSourceIndex = Math.floor((sourceColumns.length - 1) / 2)
      const midTargetIndex = Math.floor((targetColumns.length - 1) / 2)
      const midSourceColumn = sourceColumns[midSourceIndex]
      const midTargetColumn = targetColumns[midTargetIndex]

      // 마커 크기: 식별 관계는 작게, 비식별 관계는 보통 크기
      const markerSize = edge.type === 'identifying' ? 8 : 12

      generatedEdges.push({
        id: edge.id || `edge-${idx}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: `${edge.source}-${midSourceColumn}-source`,
        targetHandle: `${edge.target}-${midTargetColumn}-target`,
        type: 'bezier',
        animated: hasWarnings,
        style: {
          stroke: strokeColor,
          strokeWidth: hasWarnings ? 3 : (edge.type === 'identifying' ? 2.5 : 1.5),
          strokeDasharray: edge.type === 'identifying' ? 'none' : '5,5'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: markerSize,
          height: markerSize
        },
        data: {
          sourceColumn: edge.sourceColumn,
          targetColumn: edge.targetColumn,
          isPhysical: edge.isPhysical,
          edgeType: edge.type,
          hasWarnings: hasWarnings
        }
      })

      // 상세 엣지 (컬럼별 개별 연결) - _detail 엣지만 처리
      if (edge.id && edge.id.includes('_detail')) {
        // 마커 크기: 식별 관계는 작게, 비식별 관계는 보통 크기
        const detailMarkerSize = edge.type === 'identifying' ? 6 : 10

        // 단일 컬럼 매핑 (이미 백엔드에서 분리됨)
        generatedEdges.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: `${edge.source}-${sourceColumns[0]}-source`,
          targetHandle: `${edge.target}-${targetColumns[0]}-target`,
          type: 'bezier',
          animated: hasWarnings,
          style: {
            stroke: strokeColor,
            strokeWidth: hasWarnings ? 3 : (edge.type === 'identifying' ? 2 : 1.2),
            strokeDasharray: edge.type === 'identifying' ? 'none' : '5,5'
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: detailMarkerSize,
            height: detailMarkerSize
          },
          data: {
            sourceColumn: edge.sourceColumn,
            targetColumn: edge.targetColumn,
            isPhysical: edge.isPhysical,
            edgeType: edge.type,
            hasWarnings: hasWarnings
          }
        })
      }
    })

    allEdges.value = generatedEdges

    // 초기 뷰 설정 - 테이블 개수에 따라 줌 레벨 동적 조정
    setTimeout(() => {
      const padding = { top: 50, right: 100, bottom: 50, left: 100 }
      const { maxZoom, minZoom } = calculateZoomLevels()
      fitView({ padding, duration: 300, maxZoom, minZoom })
    }, 100)
  } catch (err) {
    console.error('Load diagram error:', err)
    ElMessage.error({
      message: getErrorMessage(err, '다이어그램을 불러오는 중 오류가 발생했습니다.'),
      offset: window.innerHeight - 100
    })
  }
}

// 클릭 타이머 (클릭/더블클릭 구분용)
let clickTimer = null

// 노드 클릭 핸들러 (싱글 클릭: 사이드바만 열기 + 엣지 z-index 상승)
const handleNodeClick = (event) => {
  const nodeId = event.node.id

  // 더블클릭 대기
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
    return // 더블클릭으로 처리됨
  }

  // 싱글 클릭: 300ms 후 실행
  clickTimer = setTimeout(() => {
    clickedNodeId.value = nodeId
    emit('node-click', nodeId)
    clickTimer = null
  }, 300)
}

// 노드 더블클릭 핸들러 (포커싱 + 사이드바)
const handleNodeDoubleClick = (event) => {
  const nodeId = event.node.id

  // 싱글 클릭 타이머 취소
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }

  // 더블클릭: 포커싱 + 사이드바
  emit('node-click', nodeId)
  focusOn(nodeId)
}

// 다이어그램 배경 클릭 핸들러 (클릭 상태 초기화)
const handlePaneClick = () => {
  clickedNodeId.value = null
}

// 포커스 기능
const focusOn = (nodeId) => {
  focusedNodeId.value = nodeId

  // 연결된 노드 찾기
  const connected = new Set()
  edges.value.forEach(edge => {
    if (edge.source === nodeId) {
      connected.add(edge.target)
    }
    if (edge.target === nodeId) {
      connected.add(edge.source)
    }
  })
  highlightedNodes.value = connected

  // 포커스된 노드로 이동
  const node = vueFlowNodes.value.find(n => n.id === nodeId)
  if (node) {
    setCenter(node.position.x + 100, node.position.y + 150, { zoom: 1.2, duration: 300 })
  }

  // 엣지 스타일 업데이트
  updateEdgeStyles()
}

// 포커스 해제
const clearFocus = () => {
  focusedNodeId.value = null
  highlightedNodes.value = new Set()
  clickedNodeId.value = null // 클릭된 노드도 초기화
  updateEdgeStyles()
  const padding = { top: 50, right: 100, bottom: 50, left: 100 }
  const { maxZoom, minZoom } = calculateZoomLevels()
  fitView({ padding, duration: 300, maxZoom, minZoom })
}

// 엣지 스타일 업데이트
const updateEdgeStyles = () => {
  allEdges.value = allEdges.value.map(edge => {
    const isHighlighted = focusedNodeId.value &&
      (edge.source === focusedNodeId.value || edge.target === focusedNodeId.value)

    const isDimmed = focusedNodeId.value && !isHighlighted

    return {
      ...edge,
      type: edge.type || 'bezier', // type 명시적 보존
      style: {
        ...edge.style,
        opacity: isDimmed ? 0.2 : 1
      }
    }
  })
}

// dimmed 여부 확인
const isDimmed = (nodeId) => {
  if (!focusedNodeId.value) return false
  return nodeId !== focusedNodeId.value && !highlightedNodes.value.has(nodeId)
}

// 다이어그램 리로드
const reloadDiagram = () => {
  loadDiagram()
}

// 선택된 테이블만 로드
const reloadDiagramWithTables = async (selectedTableNames) => {
  try {
    const params = {
      instituteId: props.instituteId,
      databaseId: props.databaseId,
      schema: props.currentSchema,
      tables: selectedTableNames.join(',')
    }

    const res = await axios.get(`${API_BASE}/diagrams/er`, { params })
    console.log('API Response:', {
      nodeCount: res.data.nodes.length,
      edgeCount: res.data.edges.length,
      tables: selectedTableNames,
      edges: res.data.edges
    })
    nodes.value = res.data.nodes
    edges.value = res.data.edges

    // Vue Flow 형식으로 변환
    vueFlowNodes.value = nodes.value.map(node => ({
      id: node.id,
      type: 'table',
      position: { x: node.x, y: node.y },
      data: {
        id: node.id,
        label: node.label,
        columns: node.columns,
        edges: edges.value
      }
    }))

    // 엣지 변환
    const generatedEdges = []
    const nodeIds = new Set(nodes.value.map(n => n.id))
    console.log('Available node IDs:', Array.from(nodeIds))

    edges.value.forEach((edge, idx) => {
      const sourceNode = nodes.value.find(n => n.id === edge.source)
      const targetNode = nodes.value.find(n => n.id === edge.target)

      if (!sourceNode || !targetNode) {
        console.warn('Skipping edge - missing node:', {
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          sourceExists: !!sourceNode,
          targetExists: !!targetNode
        })
        return // 노드가 없으면 엣지 생성 안 함
      }

      const isDetailEdge = edge.id.includes('_detail')

      if (isDetailEdge) {
        // 상세 엣지 (컬럼별)
        const sourceColName = edge.sourceColumn
        const targetColName = edge.targetColumn

        const sourceCol = sourceNode.columns.find(c => c.name === sourceColName)
        const targetCol = targetNode.columns.find(c => c.name === targetColName)

        if (sourceCol && targetCol) {
          generatedEdges.push({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: `${edge.source}-${sourceColName}-source`,
            targetHandle: `${edge.target}-${targetColName}-target`,
            type: 'bezier',
            animated: edge.hasWarnings || false,
            style: {
              stroke: edge.hasWarnings ? '#e74c3c' : (edge.type === 'identifying' ? '#9b59b6' : '#666'),
              strokeWidth: edge.hasWarnings ? 3 : (edge.type === 'identifying' ? 2.5 : 1.5),
              strokeDasharray: edge.type === 'identifying' ? 'none' : '5,5'
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: edge.type === 'identifying' ? 6 : 10,
              height: edge.type === 'identifying' ? 6 : 10,
              color: edge.hasWarnings ? '#e74c3c' : (edge.type === 'identifying' ? '#9b59b6' : '#666')
            },
            data: {
              edgeType: edge.type,
              hasWarnings: edge.hasWarnings || false
            }
          })
        }
      } else {
        // 기본 엣지 (복합키 통합)
        const sourceColumns = edge.sourceColumn.split(', ')
        const targetColumns = edge.targetColumn.split(', ')

        const midSourceIndex = Math.floor((sourceColumns.length - 1) / 2)
        const midTargetIndex = Math.floor((targetColumns.length - 1) / 2)

        const midSourceCol = sourceNode.columns.find(c => c.name === sourceColumns[midSourceIndex])
        const midTargetCol = targetNode.columns.find(c => c.name === targetColumns[midTargetIndex])

        if (midSourceCol && midTargetCol) {
          generatedEdges.push({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: `${edge.source}-${sourceColumns[midSourceIndex]}-source`,
            targetHandle: `${edge.target}-${targetColumns[midTargetIndex]}-target`,
            type: 'bezier',
            animated: edge.hasWarnings || false,
            style: {
              stroke: edge.hasWarnings ? '#e74c3c' : (edge.type === 'identifying' ? '#9b59b6' : '#666'),
              strokeWidth: edge.hasWarnings ? 3 : (edge.type === 'identifying' ? 2.5 : 1.5),
              strokeDasharray: edge.type === 'identifying' ? 'none' : '5,5'
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: edge.type === 'identifying' ? 8 : 12,
              height: edge.type === 'identifying' ? 8 : 12,
              color: edge.hasWarnings ? '#e74c3c' : (edge.type === 'identifying' ? '#9b59b6' : '#666')
            },
            data: {
              edgeType: edge.type,
              hasWarnings: edge.hasWarnings || false
            }
          })
        }
      }
    })

    allEdges.value = generatedEdges
    console.log('Generated edges:', {
      totalEdges: generatedEdges.length,
      allEdgesValue: allEdges.value.length,
      vueFlowEdgesComputed: vueFlowEdges.value.length
    })

    // Vue의 다음 렌더링 사이클을 기다린 후 뷰 설정
    await nextTick()

    // 강제로 Vue Flow 업데이트
    const padding = { top: 50, right: 100, bottom: 50, left: 100 }
    const { maxZoom, minZoom } = calculateZoomLevels()
    fitView({ padding, duration: 300, maxZoom, minZoom })
  } catch (err) {
    console.error('Load diagram with tables error:', err)
    ElMessage.error({
      message: getErrorMessage(err, '다이어그램을 불러오는 중 오류가 발생했습니다.'),
      offset: window.innerHeight - 100
    })
  }
}

// 외부에서 접근 가능한 메서드
const focusOnNode = (nodeId) => {
  focusOn(nodeId)
}

// 줌 컨트롤 핸들러
const handleZoomIn = () => {
  zoomIn()
}

const handleZoomOut = () => {
  zoomOut()
}

const handleFitView = () => {
  const padding = { top: 50, right: 100, bottom: 50, left: 100 }
  const { maxZoom, minZoom } = calculateZoomLevels()
  fitView({ padding, duration: 300, maxZoom, minZoom })
}

// ESC 키로 포커스 해제
const handleKeyDown = (event) => {
  if (event.key === 'Escape') {
    clearFocus()
  }
}

// Mount 시 로드
onMounted(() => {
  loadDiagram()
  window.addEventListener('keydown', handleKeyDown)
})

// Unmount 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// 현재 표시된 테이블 목록 가져오기
const getCurrentTableNames = () => {
  return nodes.value.map(node => node.id)
}

// 현재 표시된 테이블 상세 정보 가져오기 (검색용)
const getCurrentTablesInfo = () => {
  return nodes.value.map(node => {
    // 해당 테이블의 부모/자식 개수 계산
    const parentCount = edges.value.filter(e => e.target === node.id && !e.id.includes('_detail')).length
    const childCount = edges.value.filter(e => e.source === node.id && !e.id.includes('_detail')).length

    return {
      tableName: node.id,
      logicalName: node.label,
      parentCount,
      childCount
    }
  })
}

// 외부 노출
defineExpose({
  focusOnNode,
  clearFocus,
  reloadDiagram,
  reloadDiagramWithTables,
  getCurrentTableNames,
  getCurrentTablesInfo
})
</script>

<style scoped>
.diagram {
  width: 100%;
  height: 100%;
  position: relative;
  background: #f5f5f5;
}

.vue-flow-container {
  width: 100%;
  height: 100%;
}

/* Vue Flow 커스텀 스타일 */
:deep(.vue-flow__node) {
  border-radius: 5px;
}

:deep(.vue-flow__edge-path) {
  transition: opacity 0.3s;
}

:deep(.vue-flow__minimap) {
  background: white;
  border: 1px solid #ddd;
}

/* 엣지 타입 필터 */
.edge-filter {
  position: absolute;
  top: 10px;
  left: 60px;
  z-index: 10;
  display: flex;
  gap: 15px;
  background: white;
  padding: 8px 12px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 13px;
  user-select: none;
}

.filter-checkbox input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.filter-divider {
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 5px;
}

.filter-checkbox span {
  color: #555;
}

/* 줌 컨트롤 */
.zoom-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: white;
  padding: 5px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.control-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #555;
}

.control-btn:hover {
  background: #f5f5f5;
  border-color: #4caf50;
  color: #4caf50;
}

.control-btn:active {
  background: #e0e0e0;
}

.control-btn.fit-btn {
  font-size: 20px;
  border-top: 2px solid #ddd;
  margin-top: 3px;
  padding-top: 3px;
}
</style>
