<template>
  <!-- filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaSideBar\BizMetaSideBar.vue -->
  <div class="sidebar-wrapper">
    <div class="biz-meta-sidebar" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <!-- 헤더 -->
    <div class="sidebar-header">
      <!-- 제목과 추가 버튼 -->
      <div class="header-top">
        <h2 class="sidebar-title">비즈니스용어 목록</h2>
        <!-- <button
          class="add-term-button"
          @click="showAddTermModal"
          title="새 용어 추가"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
            />
          </svg>
        </button> -->
      </div>

      <!-- 검색바 -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clip-rule="evenodd"
            />
          </svg>
          <input
            v-model="searchTerm"
            type="text"
            class="search-input"
            placeholder="용어명을 입력하세요..."
            @input="handleSearch"
            @keyup.enter="performSearch"
          />
          <button v-if="searchTerm" class="clear-button" @click="clearSearch">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>
        <!-- 리프레시 버튼 -->
        <button class="refresh-button" @click="loadTerms" title="새로고침">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="refresh-icon"
          >
            <path
              d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"
            />
          </svg>
        </button>
      </div>

      <!-- 🔥 필터 버튼 그룹 -->
      <div class="filter-container">
        <button
          class="filter-button"
          :class="{ active: termTypeFilter === 'ALL' }"
          @click="termTypeFilter = 'ALL'"
        >
          전체
        </button>
        <button
          class="filter-button"
          :class="{ active: termTypeFilter === 'GENERAL' }"
          @click="termTypeFilter = 'GENERAL'"
        >
          일반
        </button>
        <button
          class="filter-button"
          :class="{ active: termTypeFilter === 'COMPOSITE' }"
          @click="termTypeFilter = 'COMPOSITE'"
        >
          복합구성
        </button>
      </div>
    </div>

    <!-- 카드 목록 -->
    <div class="cards-container">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>용어 목록을 불러오는 중...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button class="retry-button" @click="loadTerms">다시 시도</button>
      </div>

      <div v-else-if="filteredTerms.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>
          {{ searchTerm ? '검색 결과가 없습니다.' : '등록된 용어가 없습니다.' }}
        </p>
      </div>

      <div v-else class="cards-list">
        <div
          v-for="term in paginatedTerms"
          :key="term.id"
          class="term-card"
          :class="{
            active: selectedTermId === term.id,
          }"
          :draggable="true"
          @click="selectTerm(term)"
          @dragstart="handleDragStart($event, term)"
          @dragend="handleDragEnd"
          @dragover.prevent
          @mouseenter="showTooltip($event, term)"
          @mouseleave="hideTooltip"
          @mousemove="updateTooltipPosition"
        >
          <!-- 드래그 인디케이터 -->
          <div class="drag-indicator">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 15.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"
              />
            </svg>
          </div>

          <!-- 카드 콘텐츠 -->
          <div class="card-content">
            <!-- 카드 헤더 -->
            <div class="card-header">
              <div class="card-title-section">
                <h3 class="term-name">{{ term.termName }}</h3>
                <div class="card-meta">
                  <span
                    class="term-type-label"
                    :class="getTermTypeClass(term.termType)"
                  >
                    {{ getTermTypeText(term.termType) }}
                  </span>
                  <span class="registration-date">{{
                    formatDate(term.registrationDate)
                  }}</span>
                </div>
              </div>

              <div class="card-actions">
                <button
                  class="relation-button"
                  @click.stop="showTermRelations(term)"
                  title="관계 조회"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z"
                    />
                  </svg>
                </button>
                <button
                  class="delete-button"
                  @click.stop="deleteTerm(term.termId)"
                  :disabled="isDeleting"
                  title="삭제"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 용어 설명 -->
            <p class="term-description">
              {{ term.termExplain || '설명이 없습니다.' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 페이징 -->
    <div v-if="!isLoading && totalPages > 0" class="pagination-container">
      <div class="pagination-info">
        <span
          >전체 {{ totalCount }}개 | 페이지 {{ currentPage }} /
          {{ totalPages }}</span
        >
      </div>
      <div class="pagination">
        <!-- 이전 그룹 버튼 -->
        <button
          class="page-button prev-group"
          @click="goToPrevGroup"
          :disabled="!hasPrevGroup"
          title="이전 5개 페이지"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- 페이지 번호 버튼들 -->
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-button"
          :class="{ active: page === currentPage }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <!-- 다음 그룹 버튼 -->
        <button
          class="page-button next-group"
          @click="goToNextGroup"
          :disabled="!hasNextGroup"
          title="다음 5개 페이지"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L14.168 10l-3.938-3.71a.75.75 0 01-.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 숨겨진 드래그 이미지 생성용 요소 -->
    <div ref="dragImageContainer" class="drag-image-container">
      <div v-if="dragState.draggedTerm" class="drag-image-card">
        <div class="drag-image-content">
          <h4 class="drag-term-name">{{ dragState.draggedTerm.termName }}</h4>
          <span
            class="drag-term-type"
            :class="getTermTypeClass(dragState.draggedTerm.termType)"
          >
            {{ getTermTypeText(dragState.draggedTerm.termType) }}
          </span>
        </div>
      </div>
    </div>
  </div>

    <!-- 🔥 툴팁 팝업 -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible"
        class="term-tooltip"
        :style="{
          left: tooltip.x + 'px',
          top: tooltip.y + 'px',
        }"
      >
        <div class="tooltip-header">
          <h4 class="tooltip-title">{{ tooltip.term?.termName }}</h4>
          <span
            class="tooltip-type-badge"
            :class="getTermTypeClass(tooltip.term?.termType)"
          >
            {{ getTermTypeText(tooltip.term?.termType) }}
          </span>
        </div>

        <div class="tooltip-body">
          <!-- 기본 정보 -->
          <div class="tooltip-section">
            <div class="tooltip-row">
              <span class="tooltip-label">도메인</span>
              <span class="tooltip-value">{{
                tooltip.term?.domain || '-'
              }}</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">상태</span>
              <span
                class="tooltip-value status"
                :class="tooltip.term?.status?.toLowerCase()"
              >
                {{ tooltip.term?.status === 'ACTIVE' ? '활성' : '비활성' }}
              </span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">등록자</span>
              <span class="tooltip-value">{{
                tooltip.term?.registeredBy || '-'
              }}</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">등록일</span>
              <span class="tooltip-value">{{
                formatDate(tooltip.term?.registrationDate)
              }}</span>
            </div>
          </div>

          <!-- 설명 -->
          <div class="tooltip-section" v-if="tooltip.term?.description">
            <div class="tooltip-description-label">설명</div>
            <p class="tooltip-description">{{ tooltip.term.description }}</p>
          </div>

          <!-- 동의어 -->
          <div
            class="tooltip-section"
            v-if="tooltip.term?.synonyms && tooltip.term.synonyms.length > 0"
          >
            <div class="tooltip-description-label">동의어</div>
            <div class="tooltip-synonyms">
              <span
                v-for="(synonym, idx) in tooltip.term.synonyms"
                :key="idx"
                class="synonym-tag"
              >
                {{ synonym }}
              </span>
            </div>
          </div>

          <!-- 통계 정보 -->
          <div class="tooltip-section tooltip-stats">
            <div class="stat-item">
              <svg viewBox="0 0 20 20" fill="currentColor" class="stat-icon">
                <path
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326a.78.78 0 01-.358-.442 3 3 0 014.308-3.516 6.484 6.484 0 00-1.905 3.959c-.023.222-.014.442.025.654a4.97 4.97 0 01-2.07-.655zM16.44 15.98a4.97 4.97 0 002.07-.654.78.78 0 00.357-.442 3 3 0 00-4.308-3.517 6.484 6.484 0 011.907 3.96 2.32 2.32 0 01-.026.654zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5.304 16.19a.844.844 0 01-.277-.71 5 5 0 019.947 0 .843.843 0 01-.277.71A6.975 6.975 0 0110 18a6.974 6.974 0 01-4.696-1.81z"
                />
              </svg>
              <div class="stat-content">
                <div class="stat-label">사용 횟수</div>
                <div class="stat-value">
                  {{ tooltip.term?.usageCount || 0 }}
                </div>
              </div>
            </div>
            <div class="stat-item">
              <svg viewBox="0 0 20 20" fill="currentColor" class="stat-icon">
                <path
                  fill-rule="evenodd"
                  d="M4.25 2A2.25 2.25 0 002 4.25v11.5A2.25 2.25 0 004.25 18h11.5A2.25 2.25 0 0018 15.75V4.25A2.25 2.25 0 0015.75 2H4.25zm4.03 6.28a.75.75 0 00-1.06-1.06L4.97 9.47a.75.75 0 000 1.06l2.25 2.25a.75.75 0 001.06-1.06L7.06 10.5h4.19l-1.22 1.22a.75.75 0 101.06 1.06l2.25-2.25a.75.75 0 000-1.06l-2.25-2.25a.75.75 0 10-1.06 1.06l1.22 1.22H7.06l1.22-1.22z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="stat-content">
                <div class="stat-label">버전</div>
                <div class="stat-value">v{{ tooltip.term?.version || 1 }}</div>
              </div>
            </div>
          </div>

          <!-- 마지막 수정 정보 -->
          <div class="tooltip-footer">
            <svg viewBox="0 0 20 20" fill="currentColor" class="footer-icon">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="footer-text"
              >최종 수정: {{ formatDateTime(tooltip.term?.lastModified) }}</span
            >
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 🔥 관계 조회 모달 (VueFlow 기반) -->
    <Teleport to="body">
      <div
        v-if="relationModal.visible"
        class="relation-modal-overlay"
        @click.self="closeRelationModal"
      >
        <div class="relation-modal-flow">
          <!-- 모달 헤더 -->
          <div class="relation-modal-header">
            <div class="modal-title-section">
              <h3 class="modal-title">{{ relationModal.term?.termName }}</h3>
              <span
                class="modal-type-badge"
                :class="getTermTypeClass(relationModal.term?.termType)"
              >
                {{ getTermTypeText(relationModal.term?.termType) }}
              </span>
            </div>
            <button class="modal-close-button" @click="closeRelationModal">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
          </div>

          <!-- VueFlow 영역 -->
          <div class="relation-modal-body-flow">
            <VueFlow
              ref="vueFlowRef"
              v-if="relationModal.visible && relationGraphNodes.length > 0"
              :nodes="relationGraphNodes"
              :edges="relationGraphEdges"
              :fit-view-on-init="true"
              :default-viewport="{ zoom: 1, x: 0, y: 0 }"
              :nodes-draggable="true"
              :nodes-connectable="false"
              :elements-selectable="false"
              :min-zoom="0.3"
              :max-zoom="2.0"
              @pane-ready="onPaneReady"
              @node-double-click="handleNodeDoubleClick"
              @node-click="handleRelationNodeClick"
              @edge-click="handleRelationEdgeClick"
            >
              <!-- 노드 타입 정의 -->
              <template #node-termNode="{ data, id }">
                <TermNode
                  :data="data"
                  :id="id"
                  @delete="() => {}"
                  @connect-start="() => {}"
                  @connect-end="() => {}"
                />
              </template>

              <!-- 커스텀 엣지 타입 정의 -->
              <template #edge-relationshipEdge="edgeProps">
                <RelationshipEdge
                  v-bind="edgeProps"
                  @edge-click="() => {}"
                  @relation-changed="() => {}"
                />
              </template>
            </VueFlow>

            <!-- 🔥 노드/엣지 정보 팝업 -->
            <div
              v-if="infoPopup.visible"
              class="info-popup"
              :style="{
                left: infoPopup.x + 'px',
                top: infoPopup.y + 'px',
              }"
            >
              <div class="info-popup-header">
                <h4>{{ infoPopup.title }}</h4>
                <button @click="closeInfoPopup" class="info-popup-close">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                    />
                  </svg>
                </button>
              </div>
              <div class="info-popup-body">
                <div
                  v-for="(value, key) in infoPopup.data"
                  :key="key"
                  class="info-popup-row"
                >
                  <span class="info-popup-label">{{ key }}:</span>
                  <span class="info-popup-value">{{ value }}</span>
                </div>
              </div>
            </div>

            <!-- 관계가 없는 경우 -->
            <div v-if="relationGraphNodes.length === 0" class="relation-empty">
              <div class="empty-icon">🔗</div>
              <p>관계가 있는 용어가 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 🔥 토글 버튼 -->
    <button
      class="sidebar-toggle-button"
      :class="{ 'button-collapsed': !sidebarOpen }"
      @click="handleToggleSidebar"
      :title="'사이드바 ' + (sidebarOpen ? '닫기' : '열기')"
    >
      <svg v-if="sidebarOpen" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
          clip-rule="evenodd"
        />
      </svg>
      <svg v-else viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
  // filepath: c:\Users\dacon008\workspace\mflex-project\mflex-front\src\views\bizMetaMng\components\bizMetaSideBar\BizMetaSideBar.vue
  // 기존 import에 nextTick, inject 추가
  import {
    ref,
    computed,
    watch,
    onMounted,
    onUnmounted,
    provide,
    nextTick,
    inject,
  } from 'vue';

  // 🔥 부모로부터 사이드바 토글 함수와 상태 받기
  const toggleSidebar = inject('toggleSidebar', null);
  const sidebarOpen = inject('sidebarOpen', ref(true));

  // 🔥 토글 버튼 클릭 핸들러
  const handleToggleSidebar = () => {
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  import {
    getBizTerms, // 비즈니스 용어 조회
    getBizTermWithRelated, // 특정 용어와 관계된 용어들의 상세 정보 조회
    deleteBizTerm, // 비즈니스 용어 삭제
  } from '@/utils/mflexApi/bizMeta/bizMetaApi';

  import { useBizMetaStore } from '@/stores/bizMeta';
  import { storeToRefs } from 'pinia';

  // 🔥 VueFlow 관련 import
  // useVueFlow import 추가
  import { VueFlow, useVueFlow } from '@vue-flow/core';
  import { Position } from '@vue-flow/core';
  import TermNode from '@/views/bizMetaMng/components/bizMetaFlow/TermNode.vue';
  import RelationshipEdge from '@/views/bizMetaMng/components/bizMetaFlow/RelationshipEdge.vue';

  // VueFlow 인스턴스 ref 추가
  const vueFlowRef = ref(null);

  const bizMetaStore = useBizMetaStore();

  const { setIsUpdate } = bizMetaStore;
  const { isUpdate } = storeToRefs(bizMetaStore);

  // Emits - 선택된 용어와 드래그 이벤트를 외부로 전달
  const emit = defineEmits(['term-selected', 'term-dragged', 'term-deleted']);

  // 🔥 내부 상태 관리
  const terms = ref([]);
  const searchTerm = ref('');
  const currentPage = ref(1);
  const itemsPerPage = ref(15);
  const selectedTermId = ref(null);
  const isLoading = ref(false);
  const isDeleting = ref(false);
  const error = ref(null);

  // 🔥 페이지 캐시 (검색어별로 관리)
  const pageCache = ref(new Map()); // key: "search:page", value: { data, timestamp }

  // 🔥 서버 사이드 페이징을 위한 상태
  const totalCount = ref(0);
  const pageSize = ref(50); // 한 페이지당 항목 수

  // 🔥 드래그 상태 관리
  const dragState = ref({
    isDragging: false,
    draggedTermId: null,
    draggedTerm: null,
  });

  // 🔥 필터 상태 추가
  const termTypeFilter = ref('ALL');

  // 드래그 이미지 컨테이너 참조
  const dragImageContainer = ref(null);

  // 🔥 툴팁 상태 관리
  const tooltip = ref({
    visible: false,
    x: 0,
    y: 0,
    term: null,
  });

  let tooltipTimeout = null;
  let hideTooltipTimeout = null;

  // 🔥 관계 조회 모달 상태 관리
  const relationModal = ref({
    visible: false,
    term: null,
    relatedTerms: [], // 관계된 용어들의 상세 정보
  });

  // 🔥 정보 팝업 상태 관리
  const infoPopup = ref({
    visible: false,
    title: '',
    data: {},
    x: 0,
    y: 0,
  });

  // 🔥 툴팁 표시 함수 (수정)
  const showTooltip = (event, term) => {
    // console.log('🔍 showTooltip 호출됨:', term.termName);

    // 이전 타이머들 클리어
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }
    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
      hideTooltipTimeout = null;
    }

    // 약간의 딜레이 후 툴팁 표시
    tooltipTimeout = setTimeout(() => {
      try {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();

        console.log('📍 카드 위치:', rect);

        // 툴팁 위치 계산
        const tooltipWidth = 320;
        const tooltipHeight = 500;
        const margin = 10;

        // 기본 위치: 카드 우측
        let x = rect.right + margin;
        let y = rect.top;

        console.log('📍 초기 툴팁 위치:', { x, y });

        // 우측 공간 확인
        if (x + tooltipWidth > window.innerWidth) {
          // 우측 공간 부족 시 좌측에 표시
          x = rect.left - tooltipWidth - margin;
          console.log('📍 좌측으로 이동:', x);
        }

        // 좌측도 공간 부족하면 화면 내로 조정
        if (x < margin) {
          x = margin;
          console.log('📍 화면 내로 조정:', x);
        }

        // 하단 공간 확인
        if (y + tooltipHeight > window.innerHeight) {
          y = Math.max(margin, window.innerHeight - tooltipHeight - margin);
          console.log('📍 상단으로 조정:', y);
        }

        // 툴팁 데이터 설정
        tooltip.value = {
          visible: true,
          x,
          y,
          term: { ...term },
        };

        // console.log('✅ 툴팁 표시됨:', tooltip.value);
      } catch (error) {
        console.error('❌ 툴팁 표시 에러:', error);
      }
    }, 300);
  };

  // 🔥 툴팁 숨김 함수 (수정)
  const hideTooltip = () => {
    // console.log('🔍 hideTooltip 호출됨');

    // 표시 타이머 클리어
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }

    // 약간의 딜레이 후 숨김 (마우스가 빠르게 이동할 때 깜빡임 방지)
    hideTooltipTimeout = setTimeout(() => {
      tooltip.value.visible = false;
      // console.log('✅ 툴팁 숨김');
    }, 100);
  };

  // 🔥 컴포넌트 언마운트 시 타이머 정리
  onUnmounted(() => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    if (hideTooltipTimeout) {
      clearTimeout(hideTooltipTimeout);
    }
  });

  // 🔥 툴팁 위치 업데이트 (제거 - 고정 위치 사용)
  const updateTooltipPosition = (event) => {
    // 툴팁 위치는 고정
  };
  // 🔥 날짜/시간 포맷 함수
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('날짜 포맷 에러:', error);
      return '-';
    }
  };

  // 🔥 더미 데이터 생성 함수
  const generateDummyTerms = () => {
    const domains = [
      '고객관리',
      '주문관리',
      '재고관리',
      '인사관리',
      '회계관리',
      '마케팅',
      '시스템관리',
    ];
    const termTypes = ['GENERAL', 'COMPOSITE', 'STANDARD', 'NON_STANDARD'];
    const statuses = ['ACTIVE', 'INACTIVE'];
    const users = [
      '김철수',
      '이영희',
      '박민수',
      '최지영',
      '정현우',
      '한미영',
      '오세훈',
    ];

    const dummyTerms = [];

    for (let i = 1; i <= 127; i++) {
      const termType = termTypes[Math.floor(Math.random() * termTypes.length)];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      let termName;
      if (termType === 'COMPOSITE') {
        termName = `${domain}`;
      } else {
        const baseTerms = [
          '고객정보',
          '주문번호',
          '상품코드',
          '재고수량',
          '사용자ID',
          '결제금액',
          '배송주소',
          '할인율',
          '세금',
          '수수료',
          '포인트',
          '쿠폰',
          '카테고리',
          '브랜드',
          '모델명',
          '가격',
          '중량',
          '크기',
          '색상',
          '옵션',
          '등급',
          '상태',
          '날짜',
          '시간',
          '연락처',
          '이메일',
          '주소',
          '우편번호',
          '지역코드',
          '국가코드',
        ];
        termName = baseTerms[Math.floor(Math.random() * baseTerms.length)];
      }

      const descriptions = [
        `${termName}에 대한 상세한 설명입니다. 이 용어는 ${domain} 도메인에서 사용되며, 비즈니스 프로세스의 핵심 요소입니다.`,
        `${domain} 영역에서 중요하게 다뤄지는 ${termName} 항목으로, 데이터 품질 관리의 기준이 되는 용어입니다.`,
        `시스템 전반에서 공통적으로 사용되는 ${termName}로, 표준화된 정의에 따라 관리됩니다.`,
        `업무 프로세스 효율화를 위해 정의된 ${termName}으로, 관련 시스템 간 데이터 연계에 활용됩니다.`,
        `${domain} 업무 영역의 핵심 개념인 ${termName}으로, 정확한 이해와 적용이 필요합니다.`,
      ];

      const description =
        descriptions[Math.floor(Math.random() * descriptions.length)];

      let synonyms = [];
      if (Math.random() > 0.6) {
        const synonymCount = Math.floor(Math.random() * 3) + 1;
        synonyms = Array.from(
          { length: synonymCount },
          (_, idx) => `${termName}_동의어${idx + 1}`
        );
      }

      const registrationDate = new Date();
      registrationDate.setDate(
        registrationDate.getDate() - Math.floor(Math.random() * 365)
      );

      dummyTerms.push({
        id: i,
        termName,
        description,
        termType,
        domain,
        status,
        registrationDate: registrationDate.toISOString(),
        registeredBy: user,
        synonyms,
        lastModified: new Date().toISOString(),
        version: Math.floor(Math.random() * 10) + 1,
        usageCount: Math.floor(Math.random() * 1000),
        relatedTerms: [],
      });
    }

    return dummyTerms;
  };

  const bindingTermData = function (bizTerms) {
    const terms = bizTerms.items;
    let tempData = [];

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      tempData.push({
        id: i,
        termId: term.termId,
        termName: term.termName,
        termType: term.termType,
        termExplain: term.termExplain,
        compositeChildren: term.compositeChildren,
        compositeRelations: term.compositeRelations,
        compositeRelationsCount: term.compositeRelationsCount,
        compositeChildrenCount: term.compositeChildrenCount,
        relations: term.relations,
        owner: term.owner,
        createDateTime: term.createDateTime,
      });
    }
    return tempData;
  };

  const loadTerms = async (page = 1) => {
    const search = searchTerm.value.trim();
    const cacheKey = `${search}:${page}`;

    // 🔥 캐시 확인
    if (pageCache.value.has(cacheKey)) {
      const cached = pageCache.value.get(cacheKey);
      console.log(`캐시에서 페이지 ${page} 로드 (검색어: "${search}")`);
      terms.value = cached.data;
      totalCount.value = cached.totalCount;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const limit = pageSize.value;
      const offset = (page - 1) * limit;

      const bizTerms = await getBizTerms(limit, offset, search);
      console.log('API 응답:', bizTerms);

      const termData = bindingTermData(bizTerms);

      // 🔥 캐시에 저장
      pageCache.value.set(cacheKey, {
        data: termData,
        totalCount: bizTerms.totalCount,
        timestamp: Date.now(),
      });

      terms.value = termData; // 페이지별로 데이터 교체
      totalCount.value = bizTerms.totalCount;

      console.log(
        `페이지 ${page} 로딩 완료: ${termData.length}개 (전체: ${totalCount.value}개)`
      );
    } catch (err) {
      error.value = '용어 목록을 불러오는데 실패했습니다.';
      console.error('용어 목록 로딩 실패:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const saveNewTerm = async (termData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newTerm = {
        ...termData,
        id: Date.now(),
        registrationDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: 1,
        usageCount: 0,
        synonyms: [],
        relatedTerms: [],
      };

      terms.value.unshift(newTerm);
      console.log('새 용어 추가 완료:', newTerm);
      return newTerm;
    } catch (err) {
      console.error('용어 추가 실패:', err);
      throw new Error('용어 추가에 실패했습니다.');
    }
  };

  const updateTerm = async (termId, updateData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const termIndex = terms.value.findIndex((term) => term.id === termId);
      if (termIndex !== -1) {
        terms.value[termIndex] = {
          ...terms.value[termIndex],
          ...updateData,
          lastModified: new Date().toISOString(),
          version: terms.value[termIndex].version + 1,
        };
        console.log('용어 수정 완료:', terms.value[termIndex]);
        return terms.value[termIndex];
      }
      throw new Error('용어를 찾을 수 없습니다.');
    } catch (err) {
      console.error('용어 수정 실패:', err);
      throw new Error('용어 수정에 실패했습니다.');
    }
  };

  const deleteTermById = async (termId) => {
    try {
      console.log('용어 삭제 요청:', termId);

      // const deletedTerm = terms.value.splice(termIndex, 1)[0];
      await deleteBizTerm(termId);

      // console.log('용어 삭제 완료:', deletedTerm);
      return true;
    } catch (err) {
      console.error('용어 삭제 실패:', err);
      throw new Error('용어 삭제에 실패했습니다.');
    }
  };

  const createDragImage = (term) => {
    dragState.value.draggedTerm = { ...term };

    return new Promise((resolve) => {
      setTimeout(() => {
        const dragImageEl =
          dragImageContainer.value?.querySelector('.drag-image-card');
        if (dragImageEl) {
          resolve(dragImageEl);
        } else {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 200;
          canvas.height = 60;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

          ctx.fillStyle = '#111827';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(term.termName, canvas.width / 2, 25);

          ctx.fillStyle = '#6b7280';
          ctx.font = '12px sans-serif';
          ctx.fillText(getTermTypeText(term.termType), canvas.width / 2, 45);

          resolve(canvas);
        }
      }, 10);
    });
  };

  const handleDragStart = async (event, term) => {
    console.log('드래그 시작:', term);

    dragState.value = {
      isDragging: true,
      draggedTermId: term.id,
      draggedTerm: { ...term },
    };

    const dragData = {
      type: 'business-term',
      termId: term.id,
      termData: term,
    };

    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.setData('text/plain', term.termName);
    event.dataTransfer.effectAllowed = 'copy';

    try {
      const dragImage = await createDragImage(term);
      if (dragImage) {
        event.dataTransfer.setDragImage(dragImage, 100, 30);
      }
    } catch (error) {
      console.warn('드래그 이미지 설정 실패:', error);
    }

    emit('term-dragged', {
      action: 'dragstart',
      term: term,
      event: event,
    });
  };

  const handleDragEnd = (event) => {
    console.log('드래그 종료');

    const draggedTerm = dragState.value.draggedTerm;

    dragState.value = {
      isDragging: false,
      draggedTermId: null,
      draggedTerm: null,
    };

    emit('term-dragged', {
      action: 'dragend',
      term: draggedTerm,
      event: event,
    });
  };

  // 🔥 필터링 로직 수정 (클라이언트 사이드 필터링은 용어 타입만)
  const filteredTerms = computed(() => {
    let result = terms.value;

    // 용어 타입 필터링 (클라이언트 사이드)
    if (termTypeFilter.value !== 'ALL') {
      result = result.filter((term) => term.termType === termTypeFilter.value);
    }

    return result;
  });

  // 🔥 서버 페이징 관련 computed
  const paginatedTerms = computed(() => {
    // 서버에서 이미 페이징된 데이터를 받아오므로 filteredTerms를 그대로 반환
    return filteredTerms.value;
  });

  const totalPages = computed(() => {
    // 전체 페이지 수 = 전체 항목 수 / 한 페이지당 항목 수
    return Math.ceil(totalCount.value / pageSize.value);
  });

  // 🔥 현재 표시할 페이지 버튼들 (1~5개)
  const visiblePages = computed(() => {
    const total = totalPages.value;
    const current = currentPage.value;
    const maxVisible = 5;

    if (total === 0) return [];

    // 현재 페이지 그룹의 시작 페이지 계산
    const startPage = Math.floor((current - 1) / maxVisible) * maxVisible + 1;
    const endPage = Math.min(startPage + maxVisible - 1, total);

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  });

  // 🔥 이전/다음 페이지 그룹 존재 여부
  const hasPrevGroup = computed(() => {
    return visiblePages.value.length > 0 && visiblePages.value[0] > 1;
  });

  const hasNextGroup = computed(() => {
    return (
      visiblePages.value.length > 0 &&
      visiblePages.value[visiblePages.value.length - 1] < totalPages.value
    );
  });

  // 🔥 이벤트 핸들러
  let searchTimeout = null;

  const handleSearch = () => {
    // 디바운스 처리 (300ms)
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
      performSearch();
    }, 300);
  };

  const performSearch = () => {
    console.log('검색 실행:', searchTerm.value);
    pageCache.value.clear(); // 🔥 검색 시 캐시 초기화
    currentPage.value = 1;
    loadTerms(1); // 검색 시 1페이지로 이동
  };

  const clearSearch = () => {
    searchTerm.value = '';
    pageCache.value.clear(); // 🔥 검색 초기화 시 캐시 초기화
    currentPage.value = 1;
    loadTerms(1); // 검색 초기화 시 1페이지로 이동
  };

  const selectTerm = (term) => {
    selectedTermId.value = term.id;
    emit('term-selected', term);
    console.log('용어 선택됨:', term);
  };

  const showAddTermModal = () => {
    console.log('새 용어 추가 모달 표시');
  };

  const editTerm = (term) => {
    console.log('용어 수정:', term);
  };

  const deleteTerm = async (termId) => {
    if (isDeleting.value) return;

    console.log('용어 삭제 요청:', termId);

    const term = terms.value.find((t) => t.id === termId);
    if (!confirm(`'${term?.termName}' 용어를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    try {
      isDeleting.value = true;
      await deleteTermById(termId);

      // 🔥 용어 삭제 후 캐시 초기화
      pageCache.value.clear();

      // 🔥 BizMetaPanel에 용어 삭제 이벤트 전달
      emit('term-deleted', termId);
      console.log('✅ term-deleted 이벤트 발생:', termId);

      await loadTerms(currentPage.value);

      if (selectedTermId.value === termId) {
        selectedTermId.value = null;
      }

      // 현재 페이지가 전체 페이지 수를 초과하면 마지막 페이지로 이동
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
        await loadTerms(currentPage.value);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      isDeleting.value = false;
    }
  };

  // 🔥 페이지 이동 함수들
  const goToPage = async (page) => {
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      currentPage.value = page;
      await loadTerms(page);
    }
  };

  const goToPrevGroup = async () => {
    if (hasPrevGroup.value) {
      const newPage = visiblePages.value[0] - 1;
      await goToPage(newPage);
    }
  };

  const goToNextGroup = async () => {
    if (hasNextGroup.value) {
      const newPage = visiblePages.value[visiblePages.value.length - 1] + 1;
      await goToPage(newPage);
    }
  };

  // 관계 조회 모달 표시 함수 수정
  const showTermRelations = async (term) => {
    console.log('관계 조회:', term);

    try {
      // 🔥 새 API를 호출하여 관계된 용어들의 상세 정보 조회
      const response = await getBizTermWithRelated(term.termId);
      console.log('관계 조회 API 응답:', response);

      relationModal.value = {
        visible: true,
        term: response.term, // 서버에서 받은 상세 정보
        relatedTerms: response.relatedTerms || [], // 관계된 용어들의 상세 정보
      };

      // DOM 업데이트 후 fitView 실행
      await nextTick();
      await nextTick(); // 두 번 호출하여 VueFlow가 완전히 렌더링되도록 함

      if (vueFlowRef.value) {
        // fitView 옵션으로 중앙 정렬 및 패딩 설정
        vueFlowRef.value.fitView({
          padding: 0.2, // 화면 가장자리에 20% 여백
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 1.5,
          duration: 300, // 애니메이션 지속 시간 (ms)
        });
      }
    } catch (error) {
      console.error('관계 조회 실패:', error);
      alert('관계 조회에 실패했습니다.');
    }
  };

  // 🔥 노드 더블클릭 핸들러 - 해당 노드로 진입
  const handleNodeDoubleClick = async (event) => {
    console.log('노드 더블클릭:', event);
    const nodeId = event.node.id;
    const termId = event.node.data.termId;

    if (!termId) {
      console.warn('termId가 없습니다.');
      return;
    }

    // 해당 노드의 관계도를 새로 로드
    await showTermRelations({ termId });
  };

  // 🔥 관계 모달 내 노드 클릭 핸들러
  const handleRelationNodeClick = (event) => {
    const node = event.node;
    const data = node.data;

    // 팝업 위치 계산 (클릭 위치 기준)
    const rect = event.event.target.getBoundingClientRect();
    const modalRect = document.querySelector('.relation-modal-flow')?.getBoundingClientRect();

    infoPopup.value = {
      visible: true,
      title: '용어 정보',
      data: {
        '용어명': data.termName || '-',
        '용어 설명': data.termExplain || '-',
        '용어 타입': data.termType || '-',
        '담당자': data.owner || '-',
      },
      x: modalRect ? rect.left - modalRect.left + 20 : event.event.clientX,
      y: modalRect ? rect.top - modalRect.top : event.event.clientY,
    };
  };

  // 🔥 관계 모달 내 엣지 클릭 핸들러
  const handleRelationEdgeClick = (event) => {
    const edge = event.edge;
    const data = edge.data;

    // 팝업 위치 계산
    const modalRect = document.querySelector('.relation-modal-flow')?.getBoundingClientRect();

    infoPopup.value = {
      visible: true,
      title: '관계 정보',
      data: {
        '관계 유형': data.relationshipType || '-',
        '설명': data.description || '-',
      },
      x: modalRect ? event.event.clientX - modalRect.left : event.event.clientX,
      y: modalRect ? event.event.clientY - modalRect.top : event.event.clientY,
    };
  };

  // 🔥 정보 팝업 닫기
  const closeInfoPopup = () => {
    infoPopup.value = {
      visible: false,
      title: '',
      data: {},
      x: 0,
      y: 0,
    };
  };

  const closeRelationModal = () => {
    relationModal.value = {
      visible: false,
      term: null,
      relatedTerms: [],
    };
    closeInfoPopup(); // 정보 팝업도 함께 닫기
  };

  // 🔥 유틸리티 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getTermTypeText = (termType) => {
    const typeMap = {
      GENERAL: '일반',
      COMPOSITE: '복합',
    };
    return typeMap[termType] || '일반';
  };

  const getTermTypeClass = (termType) => {
    const classMap = {
      GENERAL: 'general',
      COMPOSITE: 'composite',
    };
    return classMap[termType] || 'general';
  };

  // 🔥 용어 ID로 용어 정보 찾기 (relatedTerms에서)
  const findTermByIdInRelated = (termId) => {
    return relationModal.value.relatedTerms.find((t) => t.termId === termId);
  };

  const relationGraphNodes = computed(() => {
    if (!relationModal.value.term) return [];

    const term = relationModal.value.term;
    const nodes = [];
    const nodeMap = new Map();

    // 중앙 노드 (선택된 용어)
    const centerNode = {
      id: `term-${term.termId}`,
      type: 'termNode',
      position: { x: 0, y: 0 }, // 중앙에 위치
      data: {
        termId: term.termId,
        termName: term.termName,
        termExplain: term.termExplain,
        termType: term.termType,
        owner: term.owner,
        isCenter: true, // 중앙 노드 표시
      },
    };
    nodes.push(centerNode);
    nodeMap.set(term.termId, centerNode);

    const horizontalSpacing = 400; // 가로 간격
    const verticalSpacing = 300; // 세로 간격

    // 복합구성용어 자식들 추가 (아래쪽)
    if (term.compositeChildren && term.compositeChildren.length > 0) {
      term.compositeChildren.forEach((child, index) => {
        if (!child.childTerm) return; // childTerm이 없으면 스킵

        const x =
          index * horizontalSpacing -
          ((term.compositeChildren.length - 1) * horizontalSpacing) / 2;
        const y = verticalSpacing;

        const childNode = {
          id: `term-${child.childTerm.termId}`,
          type: 'termNode',
          position: { x, y },
          data: {
            termId: child.childTerm.termId,
            termName: child.childTerm.termName,
            termExplain: child.childTerm.termExplain,
            termType: child.childTerm.termType,
            owner: child.childTerm.owner,
          },
        };
        nodes.push(childNode);
        nodeMap.set(child.childTerm.termId, childNode);
      });
    }

    // asParent 관계 노드들 추가 (오른쪽)
    if (term.relations?.asParent && term.relations.asParent.length > 0) {
      const uniqueRelations = new Map();

      term.relations.asParent.forEach((rel) => {
        if (!uniqueRelations.has(rel.passiveTermId) && rel.passiveTermDetail) {
          uniqueRelations.set(rel.passiveTermId, rel.passiveTermDetail);
        }
      });

      Array.from(uniqueRelations.values()).forEach((passiveTerm, index) => {
        if (nodeMap.has(passiveTerm.termId)) return;

        const x = horizontalSpacing;
        const y =
          index * verticalSpacing -
          ((uniqueRelations.size - 1) * verticalSpacing) / 2;

        const relNode = {
          id: `term-${passiveTerm.termId}`,
          type: 'termNode',
          position: { x, y },
          data: {
            termId: passiveTerm.termId,
            termName: passiveTerm.termName || `용어 ${passiveTerm.termId}`,
            termExplain: passiveTerm.termExplain || '',
            termType: passiveTerm.termType || 'GENERAL',
            owner: passiveTerm.owner || '',
          },
        };
        nodes.push(relNode);
        nodeMap.set(passiveTerm.termId, relNode);
      });
    }

    // asPassive 관계 노드들 추가 (왼쪽)
    if (term.relations?.asPassive && term.relations.asPassive.length > 0) {
      const uniqueRelations = new Map();

      term.relations.asPassive.forEach((rel) => {
        if (!uniqueRelations.has(rel.parentTermId) && rel.parentTermDetail) {
          uniqueRelations.set(rel.parentTermId, rel.parentTermDetail);
        }
      });

      Array.from(uniqueRelations.values()).forEach((parentTerm, index) => {
        if (nodeMap.has(parentTerm.termId)) return;

        const x = -horizontalSpacing;
        const y =
          index * verticalSpacing -
          ((uniqueRelations.size - 1) * verticalSpacing) / 2;

        const relNode = {
          id: `term-${parentTerm.termId}`,
          type: 'termNode',
          position: { x, y },
          data: {
            termId: parentTerm.termId,
            termName: parentTerm.termName || `용어 ${parentTerm.termId}`,
            termExplain: parentTerm.termExplain || '',
            termType: parentTerm.termType || 'GENERAL',
            owner: parentTerm.owner || '',
          },
        };
        nodes.push(relNode);
        nodeMap.set(parentTerm.termId, relNode);
      });
    }

    return nodes;
  });

  // 🔥 관계 그래프 엣지 생성
  const relationGraphEdges = computed(() => {
    if (!relationModal.value.term) return [];

    const term = relationModal.value.term;
    const edges = [];

    // 복합구성용어 자식 엣지
    if (term.compositeChildren && term.compositeChildren.length > 0) {
      term.compositeChildren.forEach((child) => {
        if (!child.childTerm) return; // childTerm이 없으면 스킵

        edges.push({
          id: `edge-composite-${term.termId}-${child.childTerm.termId}`,
          source: `term-${term.termId}`,
          target: `term-${child.childTerm.termId}`,
          type: 'relationshipEdge',
          sourceHandle: `term-${term.termId}-bottom-source`,
          targetHandle: `term-${child.childTerm.termId}-top-target`,
          data: {
            relationshipType: 'COMPOSITION',
            description: '복합구성용어 관계',
            isCompositeChild: false,
          },
        });
      });
    }

    // asParent 관계 엣지
    if (term.relations?.asParent && term.relations.asParent.length > 0) {
      term.relations.asParent.forEach((rel) => {
        edges.push({
          id: `edge-parent-${rel.termRelId}`,
          source: `term-${term.termId}`,
          target: `term-${rel.passiveTermId}`,
          type: 'relationshipEdge',
          sourceHandle: `term-${term.termId}-right-source`,
          targetHandle: `term-${rel.passiveTermId}-left-target`,
          data: {
            relationshipType: rel.relType,
            description: rel.rel_expln || '',
            isCompositeChild: false,
          },
        });
      });
    }

    // asPassive 관계 엣지
    if (term.relations?.asPassive && term.relations.asPassive.length > 0) {
      term.relations.asPassive.forEach((rel) => {
        edges.push({
          id: `edge-passive-${rel.termRelId}`,
          source: `term-${rel.parentTermId}`,
          target: `term-${term.termId}`,
          type: 'relationshipEdge',
          sourceHandle: `term-${rel.parentTermId}-right-source`,
          targetHandle: `term-${term.termId}-left-target`,
          data: {
            relationshipType: rel.relType,
            description: rel.rel_expln || '',
            isCompositeChild: false,
          },
        });
      });
    }

    return edges;
  });

  // VueFlow Pane이 준비되었을 때 호출되는 메서드
  const onPaneReady = () => {
    if (vueFlowRef.value) {
      vueFlowRef.value.fitView({
        padding: 0.2,
        includeHiddenNodes: false,
        minZoom: 0.5,
        maxZoom: 1.5,
        duration: 300,
      });
    }
  };

  // 🔥 RelationshipEdge를 위한 provide 설정
  provide('getAllEdges', () => relationGraphEdges.value);
  provide('getNodeById', (id) => {
    return relationGraphNodes.value.find((node) => node.id === id);
  });

  watch(isUpdate, (newVal) => {
    if (newVal) {
      loadTerms(currentPage.value);
      setIsUpdate(false);
    }
  });

  // 🔥 반응형 데이터 감시 - 용어 타입 필터 변경 시 다시 로드
  watch(termTypeFilter, () => {
    // 용어 타입 필터는 클라이언트 사이드 필터링이므로 서버 요청 불필요
    // 필터 변경 시 페이지는 유지
  });

  // 🔥 컴포넌트 마운트 시 데이터 로딩
  onMounted(() => {
    loadTerms(1);
  });
</script>

<style lang="scss" scoped>
  .sidebar-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 350px;
    height: 100%;
    z-index: 100;
  }

  .biz-meta-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    width: 350px;
    height: 100%;
    background: white;
    border-right: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 100;

    // 🔥 접혔을 때
    &.sidebar-collapsed {
      transform: translateX(-100%);
    }
  }

  // 🔥 토글 버튼
  .sidebar-toggle-button {
    position: absolute;
    left: 350px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 80px;
    background: white;
    border: 1px solid #e5e7eb;
    border-left: none;
    border-radius: 0 8px 8px 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    svg {
      width: 20px;
      height: 20px;
      color: #64748b;
      transition: color 0.2s ease;
    }

    &:hover {
      background: #f8fafc;
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);

      svg {
        color: #3b82f6;
      }
    }

    &:active {
      background: #e2e8f0;
    }

    // 🔥 사이드바가 접혔을 때
    &.button-collapsed {
      transform: translateX(-350px) translateY(-50%);
    }
  }

  .sidebar-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .header-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .sidebar-title {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    flex: 1;
  }

  .add-term-button {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: linear-gradient(135deg, #1d4ed8, #1e40af);
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .search-container {
    display: flex;
    align-items: center;
    gap: 8px; /* 검색창과 리프레시 버튼 간격 */
    width: 100%; /* 컨테이너가 부모 요소에 꽉 차도록 설정 */
  }

  .refresh-button {
    width: 35px;
    height: 35px;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    .refresh-icon {
      width: 18px;
      height: 18px;
      color: #6b7280;
      transition: transform 0.3s ease;
    }

    &:hover {
      background: #e5e7eb;
      border-color: #9ca3af;

      .refresh-icon {
        transform: rotate(180deg);
      }
    }

    &:active {
      background: #d1d5db;
    }
  }

  // 🔥 필터 버튼 그룹 스타일
  .filter-container {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }

  .filter-button {
    flex: 1;
    padding: 6px 12px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    &.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
      font-weight: 600;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1; /* 검색창이 남은 공간을 채우도록 설정 */
  }

  .search-icon {
    position: absolute;
    left: 10px;
    width: 14px;
    height: 14px;
    color: #6b7280;
    z-index: 1;
  }

  .search-input {
    width: 100%; /* 검색창이 부모 요소에 꽉 차도록 설정 */
    padding: 8px 32px 8px 30px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    background: #f9fafb;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }
  }

  .clear-button {
    position: absolute;
    right: 6px;
    width: 20px;
    height: 20px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }

  .cards-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px;
    margin: 8px 0;
  }

  .loading-state,
  .empty-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px 15px;
    text-align: center;
    color: #6b7280;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 2px solid #f3f4f6;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }

  .empty-icon,
  .error-icon {
    font-size: 28px;
    margin-bottom: 10px;
  }

  .retry-button {
    margin-top: 10px;
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;

    &:hover {
      background: #2563eb;
    }
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .term-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0;
    cursor: grab;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    display: flex;
    position: relative;

    &:hover {
      border-color: #d1d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    &.active {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    &:active {
      cursor: grabbing;
    }

    &[draggable='true'] {
      cursor: grab;

      &:active {
        cursor: grabbing;
      }
    }
  }

  .drag-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    background: #f9fafb;
    border-right: 1px solid #e5e7eb;
    flex-shrink: 0;
    cursor: grab;

    svg {
      width: 12px;
      height: 12px;
      color: #9ca3af;
    }

    &:active {
      cursor: grabbing;
    }
  }

  .card-content {
    flex: 1;
    padding: 8px 10px;
    min-width: 0;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 6px;
  }

  .card-title-section {
    display: flex;
    flex: 1;
    min-width: 0;
    //flex-direction: column;
  }

  .term-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 5px 4px 0;
    word-break: break-word;
    line-height: 1.3;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .registration-date {
    font-size: 11px;
    color: #6b7280;
  }

  .card-actions {
    display: flex;
    gap: 3px;
    flex-shrink: 0;
  }

  .relation-button {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:hover {
      background: #eff6ff;
      color: #3b82f6;
    }
  }

  .delete-button {
    width: 24px;
    height: 24px;
    border: none;
    background: none;
    color: #6b7280;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;

    svg {
      width: 12px;
      height: 12px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover {
      background: #fef2f2;
      color: #dc2626;
    }
  }

  .term-description {
    font-size: 12px;
    color: #4b5563;
    line-height: 1.4;
    margin: 0;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .term-type-label {
    font-size: 10px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.025em;

    &.general {
      background: #dbeafe;
      color: #1d4ed8;
    }

    &.composite {
      background: #d1fae5;
      color: #065f46;
    }

    &.standard {
      background: #fef3c7;
      color: #92400e;
    }

    &.non-standard {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  .pagination-container {
    padding: 10px 16px;
    border-top: 1px solid #e5e7eb;
    flex-shrink: 0;
  }

  .pagination-info {
    text-align: center;
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
  }

  .page-button {
    min-width: 32px;
    height: 32px;
    border: 1px solid #d1d5db;
    background: white;
    color: #374151;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #9ca3af;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    &.active {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-color: #3b82f6;
      color: white;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      background: #f9fafb;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    &.prev-group,
    &.next-group {
      padding: 0 8px;
      background: #f3f4f6;

      &:hover:not(:disabled) {
        background: #e5e7eb;
      }
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  .drag-image-container {
    position: absolute;
    top: -1000px;
    left: -1000px;
    pointer-events: none;
    z-index: -1;
  }

  .drag-image-card {
    width: 200px;
    height: 60px;
    background: white;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
  }

  .drag-image-content {
    text-align: center;
  }

  .drag-term-name {
    font-size: 14px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 4px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 160px;
  }

  .drag-term-type {
    font-size: 10px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.025em;

    &.general {
      background: #dbeafe;
      color: #1d4ed8;
    }

    &.composite {
      background: #d1fae5;
      color: #065f46;
    }

    &.standard {
      background: #fef3c7;
      color: #92400e;
    }

    &.non-standard {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  // 🔥 툴팁 스타일
  .term-tooltip {
    position: fixed;
    width: 320px;
    max-height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
    z-index: 10000;
    pointer-events: none;
    overflow: hidden;
    animation: tooltipFadeIn 0.2s ease-out;
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .tooltip-header {
    padding: 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .tooltip-title {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.4;
    flex: 1;
    word-break: break-word;
  }

  .tooltip-type-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 5px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    flex-shrink: 0;

    &.general {
      background: #dbeafe;
      color: #1d4ed8;
    }

    &.composite {
      background: #d1fae5;
      color: #065f46;
    }

    &.standard {
      background: #fef3c7;
      color: #92400e;
    }

    &.non-standard {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  .tooltip-body {
    padding: 16px;
    max-height: 420px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  .tooltip-section {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .tooltip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }
  }

  .tooltip-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .tooltip-value {
    font-size: 13px;
    color: #1e293b;
    font-weight: 500;
    text-align: right;

    &.status {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;

      &.active {
        background: #dcfce7;
        color: #166534;
      }

      &.inactive {
        background: #fee2e2;
        color: #991b1b;
      }
    }
  }

  .tooltip-description-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    margin-bottom: 8px;
  }

  .tooltip-description {
    font-size: 13px;
    color: #475569;
    line-height: 1.6;
    margin: 0;
    word-break: break-word;
  }

  .tooltip-synonyms {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .synonym-tag {
    display: inline-block;
    padding: 4px 10px;
    background: #f1f5f9;
    color: #475569;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid #e2e8f0;
  }

  .tooltip-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .stat-icon {
    width: 24px;
    height: 24px;
    color: #3b82f6;
    flex-shrink: 0;
  }

  .stat-content {
    flex: 1;
    min-width: 0;
  }

  .stat-label {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
    margin-bottom: 2px;
  }

  .stat-value {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
  }

  .tooltip-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    margin: 16px -16px -16px -16px;
  }

  .footer-icon {
    width: 16px;
    height: 16px;
    color: #64748b;
    flex-shrink: 0;
  }

  .footer-text {
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .cards-container {
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  @media (max-width: 1024px) {
    .biz-meta-sidebar {
      width: 100%;
      max-width: none;
      height: 40vh;
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }
  }

  @media (max-width: 768px) {
    .biz-meta-sidebar {
      height: 50vh;
    }

    .sidebar-header {
      padding: 10px 12px;
    }

    .cards-container {
      padding: 0 12px;
    }

    .pagination-container {
      padding: 8px 12px;
    }

    .card-actions {
      flex-direction: column;
      gap: 1px;
    }

    .delete-button {
      width: 20px;
      height: 20px;

      svg {
        width: 10px;
        height: 10px;
      }
    }
  }

  // 🔥 관계 조회 모달 스타일 (VueFlow 기반)
  .relation-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
    animation: overlayFadeIn 0.2s ease-out;
  }

  @keyframes overlayFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .relation-modal-flow {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 90vw;
    max-width: 1200px;
    height: 80vh;
    max-height: 800px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    animation: modalSlideIn 0.3s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .relation-modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }

  .modal-title-section {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    word-break: break-word;
  }

  .modal-type-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    flex-shrink: 0;

    &.general {
      background: #dbeafe;
      color: #1d4ed8;
    }

    &.composite {
      background: #d1fae5;
      color: #065f46;
    }

    &.standard {
      background: #fef3c7;
      color: #92400e;
    }

    &.non-standard {
      background: #fee2e2;
      color: #991b1b;
    }
  }

  .modal-close-button {
    width: 32px;
    height: 32px;
    border: none;
    background: white;
    color: #6b7280;
    cursor: pointer;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: #f3f4f6;
      color: #374151;
    }
  }

  .relation-modal-body-flow {
    flex: 1;
    overflow: hidden;
    position: relative;
    background: #f8fafc;
  }

  // VueFlow 컨테이너 스타일
  .relation-modal-body-flow :deep(.vue-flow) {
    width: 100%;
    height: 100%;
  }

  .relation-modal-body-flow :deep(.vue-flow__background) {
    background-color: #f8fafc;
  }

  .relation-modal-body-flow :deep(.vue-flow__minimap) {
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .relation-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
    color: #94a3b8;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.6;
    }

    p {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }
  }

  // 🔥 정보 팝업 스타일
  .info-popup {
    position: absolute;
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    min-width: 280px;
    max-width: 400px;
    z-index: 1000;
    overflow: hidden;

    .info-popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;

      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }

      .info-popup-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }

    .info-popup-body {
      padding: 16px;
      max-height: 300px;
      overflow-y: auto;

      .info-popup-row {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        font-size: 13px;

        &:last-child {
          margin-bottom: 0;
        }

        .info-popup-label {
          font-weight: 600;
          color: #475569;
          min-width: 80px;
          flex-shrink: 0;
        }

        .info-popup-value {
          color: #1e293b;
          word-break: break-word;
        }
      }
    }
  }
</style>
