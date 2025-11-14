<template>
  <div class="app">
    <div class="header">
      <h1>📊 메타데이터 뷰어</h1>
      <el-autocomplete
        v-model="searchQuery"
        :fetch-suggestions="handleSearch"
        placeholder="테이블 검색..."
        style="width: 500px"
        @select="handleSelect"
        clearable
      >
        <template #default="{ item }">
          <div class="search-item">
            <strong>{{ item.tableName }}</strong>
            <el-tag :type="getTagType(item.matchType)" size="small">
              {{ item.matchType }}
            </el-tag>
            <div class="logical">{{ item.logicalName }}</div>
            <span class="stats">
              ⬆️ {{ item.parentCount }} ⬇️ {{ item.childCount }}
            </span>
          </div>
        </template>
      </el-autocomplete>
      <el-button @click="openSchemaLoadDialog" type="success"
        >스키마 로드</el-button
      >
      <el-button @click="openTableSelectionDialog" type="info"
        >테이블 선택</el-button
      >
      <el-button @click="refreshMetadata" type="primary">새로고침</el-button>
      <el-button @click="autoMatchRelationships" type="danger"
        >자동 관계 매칭</el-button
      >
      <el-button @click="showRelationshipDialog = true" type="warning"
        >관계 관리</el-button
      >
    </div>

    <div class="content">
      <ERDiagram
        ref="diagram"
        :focused="focusedTable"
        :panel-open="!!focusedTable"
        :institute-id="instituteId"
        :database-id="databaseId"
        :current-schema="currentSchema"
        @node-click="handleNodeClick"
      />

      <transition name="slide">
        <div v-if="focusedTable" class="panel">
          <div class="panel-header">
            <h3>{{ focusedTable.logicalName }}</h3>
            <span>{{ focusedTable.tableName }}</span>
            <el-button @click="clearFocus" circle size="small">✕</el-button>
          </div>
          <div class="panel-body">
            <h4>부모 테이블 ({{ focusedTable.parentTables.length }})</h4>
            <el-tag
              v-for="p in focusedTable.parentTables"
              :key="p"
              @click="focusOn(p)"
              style="cursor: pointer; margin: 5px"
            >
              {{ p }}
            </el-tag>

            <h4>자식 테이블 ({{ focusedTable.childTables.length }})</h4>
            <el-tag
              v-for="c in focusedTable.childTables"
              :key="c"
              @click="focusOn(c)"
              type="success"
              style="cursor: pointer; margin: 5px"
            >
              {{ c }}
            </el-tag>

            <h4>컬럼 정보 ({{ focusedTable.columns?.length || 0 }})</h4>
            <div class="columns-list">
              <div
                v-for="col in focusedTable.columns"
                :key="col.name"
                class="column-item"
                :class="{ 'is-pk': col.isPK }"
              >
                <div class="column-name">
                  <span v-if="col.isPK" class="pk-icon">🔑</span>
                  <span v-else-if="col.isFK" class="fk-icon">🔗</span>
                  <strong>{{ col.name }}</strong>
                </div>
                <div class="column-type">{{ col.type }}</div>
                <div class="column-nullable">
                  {{ col.nullable ? 'NULL' : 'NOT NULL' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <div v-if="loading" class="loading">
      <el-loading-directive />
    </div>

    <!-- 자동 매칭용 테이블 선택 다이얼로그 -->
    <el-dialog
      v-model="showAutoMatchDialog"
      title="자동 관계 매칭할 테이블 선택"
      width="700px"
      :close-on-click-modal="false"
      draggable
    >
      <el-alert
        title="선택된 테이블들 내에서만 PK 기반 자동 관계 매칭을 수행합니다"
        type="info"
        :closable="false"
        style="margin-bottom: 15px"
      />
      <div
        style="
          margin-bottom: 15px;
          display: flex;
          gap: 10px;
          align-items: center;
        "
      >
        <el-input
          v-model="autoMatchSearchQuery"
          placeholder="테이블 검색..."
          style="width: 300px"
          clearable
        >
          <template #prefix>🔍</template>
        </el-input>
        <el-button @click="selectAllAutoMatchTables" type="primary" size="small"
          >전체 선택</el-button
        >
        <el-button
          @click="deselectAllAutoMatchTables"
          type="default"
          size="small"
          >전체 해제</el-button
        >
        <span style="margin-left: auto; color: #666; font-size: 13px">
          선택: {{ autoMatchSelectedTables.length }}개
        </span>
      </div>

      <el-checkbox-group
        v-model="autoMatchSelectedTables"
        style="
          display: flex;
          flex-direction: column;
          max-height: 400px;
          overflow-y: auto;
          gap: 8px;
        "
      >
        <el-checkbox
          v-for="table in filteredTablesForAutoMatch"
          :key="table.tableName"
          :label="table.tableName"
        >
          <span style="font-weight: bold">{{ table.tableName }}</span>
          <span style="color: #999; font-size: 12px; margin-left: 10px">{{
            table.logicalName
          }}</span>
          <span style="color: #999; font-size: 11px; margin-left: 10px">
            ⬆️ {{ table.parentCount }} ⬇️ {{ table.childCount }}
          </span>
        </el-checkbox>
      </el-checkbox-group>

      <template #footer>
        <el-button @click="showAutoMatchDialog = false">취소</el-button>
        <el-button
          type="danger"
          @click="executeAutoMatch"
          :disabled="autoMatchSelectedTables.length === 0"
        >
          자동 매칭 실행 ({{ autoMatchSelectedTables.length }}개)
        </el-button>
      </template>
    </el-dialog>

    <!-- 테이블 선택 다이얼로그 -->
    <el-dialog
      v-model="showTableSelectionDialog"
      title="다이어그램에 표시할 테이블 선택"
      width="700px"
      :close-on-click-modal="false"
      draggable
    >
      <div
        style="
          margin-bottom: 15px;
          display: flex;
          gap: 10px;
          align-items: center;
        "
      >
        <el-input
          v-model="tableSearchQuery"
          placeholder="테이블 검색..."
          style="width: 300px"
          clearable
        >
          <template #prefix>🔍</template>
        </el-input>
        <el-button @click="selectAllTablesInView" type="primary" size="small"
          >전체 선택</el-button
        >
        <el-button @click="deselectAllTables" type="default" size="small"
          >전체 해제</el-button
        >
        <span style="margin-left: auto; color: #666; font-size: 13px">
          선택: {{ selectedTables.length }} / 30
          <el-tag
            v-if="selectedTables.length > 30"
            type="danger"
            size="small"
            style="margin-left: 5px"
          >
            최대 30개
          </el-tag>
        </span>
      </div>

      <el-checkbox-group
        v-model="selectedTables"
        style="
          display: flex;
          flex-direction: column;
          max-height: 400px;
          overflow-y: auto;
          gap: 8px;
        "
      >
        <el-checkbox
          v-for="table in filteredTablesForSelection"
          :key="table.tableName"
          :label="table.tableName"
          :disabled="
            selectedTables.length >= 30 &&
            !selectedTables.includes(table.tableName)
          "
        >
          <span style="font-weight: bold">{{ table.tableName }}</span>
          <span style="color: #999; font-size: 12px; margin-left: 10px">{{
            table.logicalName
          }}</span>
          <span style="color: #999; font-size: 11px; margin-left: 10px">
            ⬆️ {{ table.parentCount }} ⬇️ {{ table.childCount }}
          </span>
        </el-checkbox>
      </el-checkbox-group>

      <template #footer>
        <el-button @click="showTableSelectionDialog = false">취소</el-button>
        <el-button
          type="primary"
          @click="applyTableSelection"
          :disabled="selectedTables.length === 0 || selectedTables.length > 30"
        >
          다이어그램 표시 ({{ selectedTables.length }}개)
        </el-button>
      </template>
    </el-dialog>

    <!-- 관계 관리 다이얼로그 -->
    <el-dialog
      v-model="showRelationshipDialog"
      title="관계 관리"
      width="1000px"
      :close-on-click-modal="false"
      draggable
      @open="loadRelationships"
    >
      <div class="relationship-toolbar">
        <el-button @click="showCreateDialog = true" type="primary" size="small">
          ➕ 새 관계 추가
        </el-button>
        <el-button @click="loadRelationships" type="default" size="small">
          🔄 새로고침
        </el-button>

        <div
          style="
            margin-left: auto;
            display: flex;
            gap: 10px;
            align-items: center;
          "
        >
          <span style="font-size: 13px; color: #666">필터:</span>
          <div style="display: flex; align-items: center; gap: 5px">
            <span style="font-size: 12px; color: #888">물리/논리</span>
            <el-select
              v-model="relationshipFilter.physical"
              size="small"
              style="width: 100px"
            >
              <el-option label="전체" value="all" />
              <el-option label="물리 FK만" value="physical" />
              <el-option label="논리적만" value="logical" />
            </el-select>
          </div>
          <div style="display: flex; align-items: center; gap: 5px">
            <span style="font-size: 12px; color: #888">식별/비식별</span>
            <el-select
              v-model="relationshipFilter.type"
              size="small"
              style="width: 100px"
            >
              <el-option label="전체" value="all" />
              <el-option label="식별 관계" value="identifying" />
              <el-option label="비식별 관계" value="non-identifying" />
            </el-select>
          </div>
          <div style="display: flex; align-items: center; gap: 5px">
            <span style="font-size: 12px; color: #888">검증 상태</span>
            <el-select
              v-model="relationshipFilter.validation"
              size="small"
              style="width: 100px"
            >
              <el-option label="전체" value="all" />
              <el-option label="경고 있음" value="warning" />
              <el-option label="정상" value="normal" />
            </el-select>
          </div>
        </div>
      </div>

      <el-table :data="filteredRelationships" border style="margin-top: 10px">
        <el-table-column prop="parentTable" label="부모 테이블" width="120" />
        <el-table-column prop="parentColumns" label="부모 컬럼" width="120" />
        <el-table-column label="→" width="40" align="center" />
        <el-table-column prop="childTable" label="자식 테이블" width="120" />
        <el-table-column prop="childColumns" label="자식 컬럼" width="120" />
        <el-table-column prop="relationshipType" label="관계 타입" width="120">
          <template #default="{ row }">
            <el-tag
              :type="
                row.relationshipType === 'identifying' ? 'danger' : 'success'
              "
              size="small"
            >
              {{ row.relationshipType === 'identifying' ? '식별' : '비식별' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="상태" width="80">
          <template #default="{ row }">
            <div style="display: flex; flex-direction: column; gap: 4px">
              <span>{{ row.isPhysical ? '✓ 물리' : '✗ 논리' }}</span>
              <el-tooltip
                v-if="row.validationWarnings"
                :content="getWarningMessage(row)"
                placement="top"
              >
                <el-tag type="danger" size="small">⚠ 경고</el-tag>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="작업" width="150">
          <template #default="{ row }">
            <el-button
              @click="editRelationship(row)"
              type="primary"
              size="small"
            >
              편집
            </el-button>
            <el-button
              @click="deleteRelationship(row)"
              type="danger"
              size="small"
              :disabled="row.isPhysical"
            >
              삭제
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div style="margin-top: 20px; display: flex; justify-content: center">
        <el-pagination
          v-model:current-page="relationshipPagination.currentPage"
          :page-size="relationshipPagination.pageSize"
          :total="relationshipPagination.total"
          layout="total, prev, pager, next, jumper"
          @current-change="handleRelationshipPageChange"
        />
      </div>
    </el-dialog>

    <!-- 새 관계 추가 다이얼로그 -->
    <el-dialog
      v-model="showCreateDialog"
      title="새 관계 추가"
      width="600px"
      @open="loadTableList"
    >
      <el-form :model="newRelationship" label-width="120px">
        <el-form-item label="부모 테이블">
          <el-autocomplete
            v-model="newRelationship.parentTable"
            :fetch-suggestions="searchTables"
            placeholder="테이블 이름 입력"
            style="width: 100%"
            @select="handleParentTableSelect"
          >
            <template #default="{ item }">
              <strong>{{ item.value }}</strong>
              <span style="color: #999; font-size: 12px; margin-left: 10px">{{
                item.logical
              }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="부모 컬럼">
          <el-select
            v-model="newRelationship.parentColumnsArray"
            multiple
            filterable
            placeholder="컬럼 선택"
            style="width: 100%"
            :disabled="!newRelationship.parentTable"
          >
            <el-option
              v-for="col in parentTableColumns"
              :key="col.name"
              :label="`${col.name} (${col.type})`"
              :value="col.name"
            >
              <span>{{ col.name }}</span>
              <span style="color: #999; font-size: 12px; margin-left: 10px">{{
                col.type
              }}</span>
              <span v-if="col.isPK" style="color: #f39c12; margin-left: 5px"
                >🔑</span
              >
            </el-option>
          </el-select>
          <div style="color: #999; font-size: 12px; margin-top: 5px">
            선택된 컬럼:
            {{ newRelationship.parentColumnsArray.join(', ') || '없음' }}
          </div>
        </el-form-item>
        <el-form-item label="자식 테이블">
          <el-autocomplete
            v-model="newRelationship.childTable"
            :fetch-suggestions="searchTables"
            placeholder="테이블 이름 입력"
            style="width: 100%"
            @select="handleChildTableSelect"
          >
            <template #default="{ item }">
              <strong>{{ item.value }}</strong>
              <span style="color: #999; font-size: 12px; margin-left: 10px">{{
                item.logical
              }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="자식 컬럼">
          <el-select
            v-model="newRelationship.childColumnsArray"
            multiple
            filterable
            placeholder="컬럼 선택"
            style="width: 100%"
            :disabled="!newRelationship.childTable"
          >
            <el-option
              v-for="col in childTableColumns"
              :key="col.name"
              :label="`${col.name} (${col.type})`"
              :value="col.name"
            >
              <span>{{ col.name }}</span>
              <span style="color: #999; font-size: 12px; margin-left: 10px">{{
                col.type
              }}</span>
              <span v-if="col.isPK" style="color: #f39c12; margin-left: 5px"
                >🔑</span
              >
            </el-option>
          </el-select>
          <div style="color: #999; font-size: 12px; margin-top: 5px">
            선택된 컬럼:
            {{ newRelationship.childColumnsArray.join(', ') || '없음' }}
          </div>
        </el-form-item>
        <el-form-item label="관계 타입">
          <el-radio-group v-model="newRelationship.relationshipType">
            <el-radio label="identifying">식별 관계</el-radio>
            <el-radio label="non-identifying">비식별 관계</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="설명">
          <el-input v-model="newRelationship.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">취소</el-button>
        <el-button type="primary" @click="createRelationship">생성</el-button>
      </template>
    </el-dialog>

    <!-- 관계 편집 다이얼로그 -->
    <el-dialog v-model="showEditDialog" title="관계 편집" width="500px">
      <el-form
        v-if="editingRelationship"
        :model="editingRelationship"
        label-width="120px"
      >
        <el-form-item label="부모 테이블">
          <el-input v-model="editingRelationship.parentTable" disabled />
        </el-form-item>
        <el-form-item label="자식 테이블">
          <el-input v-model="editingRelationship.childTable" disabled />
        </el-form-item>
        <el-form-item label="관계 타입">
          <el-radio-group v-model="editingRelationship.relationshipType">
            <el-radio label="identifying">식별 관계</el-radio>
            <el-radio label="non-identifying">비식별 관계</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="설명">
          <el-input v-model="editingRelationship.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">취소</el-button>
        <el-button type="primary" @click="updateRelationship">저장</el-button>
      </template>
    </el-dialog>

    <!-- 스키마 로드 선택 다이얼로그 -->
    <el-dialog
      v-model="showSchemaLoadDialog"
      title="스키마 로드"
      width="500px"
      :show-close="true"
    >
      <div style="text-align: center; padding: 20px 0">
        <p style="margin-bottom: 30px; font-size: 16px; color: #606266">
          어떤 방식으로 스키마를 로드하시겠습니까?
        </p>
        <div style="display: flex; gap: 20px; justify-content: center">
          <el-button
            @click="loadSchemaWithDefault"
            type="primary"
            size="large"
            style="width: 180px; height: 80px"
          >
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
              "
            >
              <span style="font-size: 16px">기본 설정</span>
              <span style="font-size: 12px; opacity: 0.8">환경변수 사용</span>
            </div>
          </el-button>
          <el-button
            @click="showCustomDbConnection"
            type="success"
            size="large"
            style="width: 180px; height: 80px"
          >
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
              "
            >
              <span style="font-size: 16px">커스텀 연결</span>
              <span style="font-size: 12px; opacity: 0.8">다른 DB 사용</span>
            </div>
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 데이터베이스 연결 설정 다이얼로그 -->
    <el-dialog
      v-model="showDbConnectionDialog"
      title="커스텀 데이터베이스 연결"
      width="600px"
    >
      <el-alert
        title="다른 PostgreSQL 데이터베이스에서 스키마를 로드합니다"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          기본 환경변수(.env)가 아닌 다른 데이터베이스에 연결하려면 아래 정보를
          입력하세요.
        </template>
      </el-alert>
      <el-form :model="dbConnection" label-width="120px">
        <el-form-item label="Host">
          <el-input v-model="dbConnection.host" placeholder="localhost" />
        </el-form-item>
        <el-form-item label="Port">
          <el-input-number
            v-model="dbConnection.port"
            :min="1"
            :max="65535"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="Database" required>
          <el-input
            v-model="dbConnection.database"
            placeholder="데이터베이스 이름"
          />
        </el-form-item>
        <el-form-item label="Schema">
          <el-input v-model="dbConnection.schema" placeholder="public" />
        </el-form-item>
        <el-form-item label="Username" required>
          <el-input v-model="dbConnection.username" placeholder="사용자명" />
        </el-form-item>
        <el-form-item label="Password" required>
          <el-input
            v-model="dbConnection.password"
            type="password"
            placeholder="비밀번호"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDbConnectionDialog = false">취소</el-button>
        <el-button type="success" @click="executeLoadSchema"
          >스키마 로드</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick } from 'vue';
  import axios from 'axios';
  import ERDiagram from './ERDiagram.vue';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { getErrorMessage } from '@/utils/errorHandling/errorHandler';

  // Spring Backend API (포트 8080) - 테이블 조회, 다이어그램, 관계 관리
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || '/api/v1/schema/manage/relation';

  // Python Backend API (포트 8000) - 스키마 로딩 전용
  const PYTHON_API_BASE =
    import.meta.env.VITE_PYTHON_API_BASE_URL ||
    'http://localhost:8000/api/v1/schema/manage';

  const searchQuery = ref('');
  const focusedTable = ref(null);
  const diagram = ref(null);
  const loading = ref(false);

  // 메타데이터 관리 파라미터 (프론트엔드에서 관리)
  const instituteId = ref(1); // 기관 ID (디폴트: 1)
  const databaseId = ref(1); // 데이터베이스 ID (디폴트: 1)
  const currentSchema = ref('public'); // 스키마 (디폴트: public)

  // 테이블 선택 상태
  const showTableSelectionDialog = ref(false);
  const selectedTables = ref([]);
  const allTablesForSelection = ref([]);
  const tableSearchQuery = ref('');

  // 관계 관리 상태
  const showRelationshipDialog = ref(false);
  const showCreateDialog = ref(false);
  const showEditDialog = ref(false);
  const allRelationships = ref([]); // 현재 페이지 관계 목록
  const relationshipFilter = ref({
    physical: 'all',
    type: 'all',
    validation: 'all',
  });
  const relationshipPagination = ref({
    currentPage: 1,
    pageSize: 15,
    total: 0,
  });

  // 스키마 로드 선택 다이얼로그
  const showSchemaLoadDialog = ref(false);

  // 자동 매칭용 테이블 선택 상태
  const showAutoMatchDialog = ref(false);
  const autoMatchSelectedTables = ref([]);
  const autoMatchSearchQuery = ref('');

  // 데이터베이스 연결 설정 상태
  const showDbConnectionDialog = ref(false);
  const dbConnection = ref({
    host: 'localhost',
    port: 5432,
    database: '',
    schema: 'public',
    username: '',
    password: '',
  });
  const newRelationship = ref({
    parentTable: '',
    parentColumns: '',
    parentColumnsArray: [],
    childTable: '',
    childColumns: '',
    childColumnsArray: [],
    relationshipType: 'non-identifying',
    description: '',
  });
  const editingRelationship = ref(null);

  // 테이블/컬럼 목록
  const allTables = ref([]);
  const parentTableColumns = ref([]);
  const childTableColumns = ref([]);

  // 테이블 선택 검색 필터 (computed)
  const filteredTablesForSelection = computed(() => {
    if (!tableSearchQuery.value) {
      return allTablesForSelection.value;
    }
    const query = tableSearchQuery.value.toLowerCase();
    return allTablesForSelection.value.filter(
      (t) =>
        t.tableName.toLowerCase().includes(query) ||
        t.logicalName.toLowerCase().includes(query)
    );
  });

  // 자동 매칭용 테이블 검색 필터 (computed)
  const filteredTablesForAutoMatch = computed(() => {
    if (!autoMatchSearchQuery.value) {
      return allTablesForSelection.value;
    }
    const query = autoMatchSearchQuery.value.toLowerCase();
    return allTablesForSelection.value.filter(
      (t) =>
        t.tableName.toLowerCase().includes(query) ||
        t.logicalName.toLowerCase().includes(query)
    );
  });

  // 필터링된 관계 목록 (computed)
  const filteredRelationships = computed(() => {
    return allRelationships.value.filter((rel) => {
      // 물리/논리 필터
      if (relationshipFilter.value.physical === 'physical' && !rel.isPhysical)
        return false;
      if (relationshipFilter.value.physical === 'logical' && rel.isPhysical)
        return false;

      // 식별/비식별 필터
      if (
        relationshipFilter.value.type === 'identifying' &&
        rel.relationshipType !== 'identifying'
      )
        return false;
      if (
        relationshipFilter.value.type === 'non-identifying' &&
        rel.relationshipType !== 'non-identifying'
      )
        return false;

      // 검증 상태 필터
      if (
        relationshipFilter.value.validation === 'warning' &&
        !rel.validationWarnings
      )
        return false;
      if (
        relationshipFilter.value.validation === 'normal' &&
        rel.validationWarnings
      )
        return false;

      return true;
    });
  });

  // 앱 초기화: 디폴트 값 설정됨 (instituteId=1, databaseId=1, schema=public)
  onMounted(() => {
    console.log(
      'Default settings: instituteId=',
      instituteId.value,
      'databaseId=',
      databaseId.value,
      'schema=',
      currentSchema.value
    );
  });

  // API 파라미터 helper 함수
  const getApiParams = (additionalParams = {}) => {
    return {
      instituteId: instituteId.value,
      databaseId: databaseId.value,
      schema: currentSchema.value,
      ...additionalParams,
    };
  };

  const handleSearch = (query, cb) => {
    if (!query) {
      cb([]);
      return;
    }

    // 현재 다이어그램에 표시된 테이블들 중에서만 검색
    if (!diagram.value || !diagram.value.getCurrentTablesInfo) {
      cb([]);
      return;
    }

    const currentTables = diagram.value.getCurrentTablesInfo();
    const query_lower = query.toLowerCase();
    const results = [];

    // EXACT 매칭 (물리명)
    for (const table of currentTables) {
      if (table.tableName.toLowerCase() === query_lower) {
        results.push({
          tableName: table.tableName,
          logicalName: table.logicalName,
          matchType: 'EXACT',
          parentCount: table.parentCount,
          childCount: table.childCount,
        });
      }
    }

    // PREFIX 매칭 (물리명)
    for (const table of currentTables) {
      if (
        table.tableName.toLowerCase().startsWith(query_lower) &&
        table.tableName.toLowerCase() !== query_lower &&
        !results.some((r) => r.tableName === table.tableName)
      ) {
        results.push({
          tableName: table.tableName,
          logicalName: table.logicalName,
          matchType: 'PREFIX',
          parentCount: table.parentCount,
          childCount: table.childCount,
        });
      }
    }

    // CONTAINS 매칭 (물리명)
    for (const table of currentTables) {
      if (
        table.tableName.toLowerCase().includes(query_lower) &&
        !table.tableName.toLowerCase().startsWith(query_lower) &&
        !results.some((r) => r.tableName === table.tableName)
      ) {
        results.push({
          tableName: table.tableName,
          logicalName: table.logicalName,
          matchType: 'CONTAINS',
          parentCount: table.parentCount,
          childCount: table.childCount,
        });
      }
    }

    // LOGICAL 매칭 (논리명)
    for (const table of currentTables) {
      if (
        table.logicalName.toLowerCase().includes(query_lower) &&
        !results.some((r) => r.tableName === table.tableName)
      ) {
        results.push({
          tableName: table.tableName,
          logicalName: table.logicalName,
          matchType: 'LOGICAL',
          parentCount: table.parentCount,
          childCount: table.childCount,
        });
      }
    }

    cb(results.slice(0, 10));
  };

  const handleSelect = async (item) => {
    try {
      const res = await axios.get(
        `${API_BASE}/tables/${item.tableName}/position`,
        { params: getApiParams() }
      );
      focusedTable.value = res.data;
      if (diagram.value) {
        diagram.value.focusOnNode(item.tableName);
      }
    } catch (err) {
      console.error('Select error:', err);
      ElMessage.error({
        message: getErrorMessage(
          err,
          '테이블 정보를 가져오는 중 오류가 발생했습니다.'
        ),
        offset: window.innerHeight - 100,
      });
    }
  };

  const handleNodeClick = async (nodeId) => {
    try {
      const res = await axios.get(`${API_BASE}/tables/${nodeId}/position`, {
        params: getApiParams(),
      });
      focusedTable.value = res.data;

      // 현재 표시된 테이블 목록 가져오기
      const currentTableNames = diagram.value?.getCurrentTableNames() || [];

      // 연결된 테이블 중 현재 표시되지 않은 테이블 찾기
      const parentTables = res.data.parentTables || [];
      const childTables = res.data.childTables || [];
      const relatedTables = [...parentTables, ...childTables];
      const notDisplayedTables = relatedTables.filter(
        (t) => !currentTableNames.includes(t)
      );

      // 추가할 테이블이 있고, 30개 제한을 넘지 않는지 확인
      if (notDisplayedTables.length > 0) {
        const totalCount = currentTableNames.length + notDisplayedTables.length;

        if (totalCount > 30) {
          // 30개를 초과하는 경우 경고
          const availableSlots = 30 - currentTableNames.length;
          ElMessage.warning({
            message: `관련 테이블 ${notDisplayedTables.length}개를 추가하면 최대 30개를 초과합니다. (현재: ${currentTableNames.length}개, 추가 가능: ${availableSlots}개)`,
            offset: window.innerHeight - 100,
            duration: 5000,
          });

          // 가능한 만큼만 추가
          if (availableSlots > 0) {
            const tablesToAdd = notDisplayedTables.slice(0, availableSlots);
            const newTableList = [...currentTableNames, ...tablesToAdd];
            selectedTables.value = newTableList;
            diagram.value.reloadDiagramWithTables(newTableList);
            ElMessage.info({
              message: `${
                tablesToAdd.length
              }개의 관련 테이블을 추가했습니다. (${
                notDisplayedTables.length - tablesToAdd.length
              }개는 제한으로 제외됨)`,
              offset: window.innerHeight - 100,
              duration: 4000,
            });
          }
        } else {
          // 30개 이하인 경우 모두 추가
          const newTableList = [...currentTableNames, ...notDisplayedTables];
          selectedTables.value = newTableList;
          diagram.value.reloadDiagramWithTables(newTableList);
          ElMessage.success({
            message: `${notDisplayedTables.length}개의 관련 테이블을 추가했습니다.`,
            offset: window.innerHeight - 100,
            duration: 3000,
          });
        }
      }
    } catch (err) {
      console.error('Node click error:', err);
      ElMessage.error({
        message: getErrorMessage(
          err,
          '테이블 정보를 가져오는 중 오류가 발생했습니다.'
        ),
        offset: window.innerHeight - 100,
      });
    }
  };

  const focusOn = (tableName) => {
    searchQuery.value = tableName;
    handleSelect({ tableName });
  };

  const clearFocus = () => {
    focusedTable.value = null;
    if (diagram.value) {
      diagram.value.clearFocus();
    }
  };

  const refreshMetadata = async () => {
    loading.value = true;
    try {
      await axios.get(`${API_BASE}/schema/refresh`, { params: getApiParams() });
      ElMessage.success({
        message: '메타데이터가 새로고침되었습니다.',
        offset: window.innerHeight - 100,
      });
      if (diagram.value) {
        diagram.value.reloadDiagram();
      }
    } catch (err) {
      console.error('Refresh error:', err);
      ElMessage.error({
        message: getErrorMessage(
          err,
          '메타데이터 새로고침 중 오류가 발생했습니다.'
        ),
        offset: window.innerHeight - 100,
      });
    } finally {
      loading.value = false;
    }
  };

  // 자동 매칭 다이얼로그 열기
  const autoMatchRelationships = async () => {
    try {
      // 모든 테이블 목록 가져오기
      const res = await axios.get(`${API_BASE}/tables`, {
        params: getApiParams(),
      });
      allTablesForSelection.value = res.data.map((t) => ({
        tableName: t.tableName,
        logicalName: t.logicalName,
        parentCount: t.parentCount || 0,
        childCount: t.childCount || 0,
      }));

      // 기본적으로 모든 테이블 선택
      autoMatchSelectedTables.value = allTablesForSelection.value.map(
        (t) => t.tableName
      );
      autoMatchSearchQuery.value = '';
      showAutoMatchDialog.value = true;
    } catch (err) {
      console.error('Load tables error:', err);
      ElMessage.error({
        message: getErrorMessage(
          err,
          '테이블 목록을 가져오는 중 오류가 발생했습니다.'
        ),
        offset: window.innerHeight - 100,
      });
    }
  };

  // 자동 매칭 실행
  const executeAutoMatch = async () => {
    if (autoMatchSelectedTables.value.length === 0) {
      ElMessage.warning({
        message: '최소 1개 이상의 테이블을 선택해주세요.',
        offset: window.innerHeight - 100,
      });
      return;
    }

    showAutoMatchDialog.value = false;
    loading.value = true;

    try {
      const response = await axios.post(
        `${API_BASE}/relationships/auto-match`,
        { tables: autoMatchSelectedTables.value },
        { params: getApiParams() }
      );
      const data = response.data;

      ElMessageBox.alert(
        `<div style="line-height: 1.8;">
        <p><strong>자동 매칭 결과:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>✅ 생성됨: <strong>${data.created}</strong>개</li>
          <li>⏭️ 건너뜀: <strong>${data.skipped}</strong>개</li>
          <li>❌ 오류: <strong>${data.errors}</strong>개</li>
        </ul>
        <p style="margin-top: 15px; font-size: 13px; color: #666;">
          선택된 ${autoMatchSelectedTables.value.length}개 테이블 내에서 매칭했습니다.
        </p>
      </div>`,
        'PK 기반 자동 관계 매칭',
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '확인',
          callback: () => {
            // 다이어그램 새로고침
            if (diagram.value) {
              diagram.value.reloadDiagram();
            }
            ElMessage.success({
              message: '다이어그램이 업데이트되었습니다.',
              offset: window.innerHeight - 100,
            });
          },
        }
      );

      console.log('Auto-matching results:', data.results);
    } catch (err) {
      console.error('Auto-match error:', err);
      ElMessage.error({
        message: getErrorMessage(err, '자동 매칭 중 오류가 발생했습니다.'),
        offset: window.innerHeight - 100,
      });
    } finally {
      loading.value = false;
    }
  };

  // 자동 매칭용 전체 선택
  const selectAllAutoMatchTables = () => {
    const filteredTables = filteredTablesForAutoMatch.value.map(
      (t) => t.tableName
    );
    autoMatchSelectedTables.value = [
      ...new Set([...autoMatchSelectedTables.value, ...filteredTables]),
    ];
  };

  // 자동 매칭용 전체 해제
  const deselectAllAutoMatchTables = () => {
    autoMatchSelectedTables.value = [];
  };

  const getTagType = (type) => {
    const map = {
      EXACT: 'danger',
      PREFIX: 'warning',
      LOGICAL: 'success',
      CONTAINS: 'info',
    };
    return map[type] || 'info';
  };

  // 테이블 선택 다이얼로그 열기
  const openTableSelectionDialog = async () => {
    try {
      // 전체 테이블 목록 조회 (autocomplete가 아닌 /tables 사용)
      const res = await axios.get(`${API_BASE}/tables`, {
        params: getApiParams(),
      });
      allTablesForSelection.value = res.data.sort((a, b) =>
        a.tableName.localeCompare(b.tableName)
      );
      tableSearchQuery.value = '';

      // 현재 다이어그램에 표시된 테이블들을 초기 선택 상태로 설정
      if (diagram.value && diagram.value.getCurrentTableNames) {
        selectedTables.value = diagram.value.getCurrentTableNames();
      } else {
        // 다이어그램이 없으면 알파벳 순 처음 20개 선택 (기본값)
        selectedTables.value = allTablesForSelection.value
          .slice(0, 20)
          .map((t) => t.tableName);
      }

      showTableSelectionDialog.value = true;
    } catch (err) {
      console.error('Load tables error:', err);
      ElMessage.error({
        message: getErrorMessage(
          err,
          '테이블 목록을 가져오는 중 오류가 발생했습니다.'
        ),
        offset: window.innerHeight - 100,
      });
    }
  };

  // 전체 선택 (현재 보이는 항목만, 최대 30개)
  const selectAllTablesInView = () => {
    const visibleTables = filteredTablesForSelection.value.map(
      (t) => t.tableName
    );
    const toAdd = visibleTables.slice(
      0,
      Math.max(0, 30 - selectedTables.value.length)
    );
    selectedTables.value = [...new Set([...selectedTables.value, ...toAdd])];
  };

  // 전체 해제
  const deselectAllTables = () => {
    selectedTables.value = [];
  };

  // 테이블 선택 적용
  const applyTableSelection = () => {
    if (selectedTables.value.length === 0) {
      ElMessage.warning({
        message: '최소 1개 이상의 테이블을 선택해주세요.',
        offset: window.innerHeight - 100,
      });
      return;
    }
    if (selectedTables.value.length > 30) {
      ElMessage.warning({
        message: '최대 30개까지 선택 가능합니다.',
        offset: window.innerHeight - 100,
      });
      return;
    }

    showTableSelectionDialog.value = false;
    if (diagram.value) {
      diagram.value.reloadDiagramWithTables(selectedTables.value);
    }
    ElMessage.success({
      message: `${selectedTables.value.length}개 테이블을 다이어그램에 표시합니다.`,
      offset: window.innerHeight - 100,
    });
  };

  // 스키마 로드 다이얼로그 열기
  const openSchemaLoadDialog = () => {
    showSchemaLoadDialog.value = true;
  };

  // 기본 설정으로 스키마 로드 (환경변수 사용)
  const loadSchemaWithDefault = async () => {
    showSchemaLoadDialog.value = false;
    loading.value = true;

    try {
      // Python Backend로 스키마 로드 요청
      const res = await axios.post(`${PYTHON_API_BASE}/schema/load`, {});
      currentSchema.value = res.data.schema; // 로드된 스키마 저장

      ElMessage.success({
        message: `스키마 로드 완료 (${res.data.schema}): ${res.data.tables_count}개 테이블, ${res.data.relationships_count}개 관계`,
        offset: window.innerHeight - 100,
      });

      // Vue의 반응성이 적용된 후 다이어그램 로드
      if (diagram.value) {
        await nextTick();
        diagram.value.reloadDiagram();
      }
    } catch (err) {
      console.error('Schema load error:', err);
      ElMessage.error({
        message: getErrorMessage(err, '스키마 로드 중 오류가 발생했습니다.'),
        offset: window.innerHeight - 100,
      });
    } finally {
      loading.value = false;
    }
  };

  // 커스텀 DB 연결 다이얼로그 표시
  const showCustomDbConnection = () => {
    showSchemaLoadDialog.value = false;
    showDbConnectionDialog.value = true;
  };

  // 커스텀 DB 연결로 스키마 로드 실행
  const executeLoadSchema = async () => {
    loading.value = true;
    showDbConnectionDialog.value = false;

    try {
      const payload = {
        host: dbConnection.value.host,
        port: dbConnection.value.port,
        database: dbConnection.value.database,
        schema: dbConnection.value.schema,
        username: dbConnection.value.username,
        password: dbConnection.value.password,
      };

      // Python Backend로 스키마 로드 요청
      const res = await axios.post(`${PYTHON_API_BASE}/schema/load`, payload);
      currentSchema.value = res.data.schema; // 로드된 스키마 저장

      ElMessage.success({
        message: `스키마 로드 완료 (${res.data.schema}): ${res.data.tables_count}개 테이블, ${res.data.relationships_count}개 관계`,
        offset: window.innerHeight - 100,
      });

      // Vue의 반응성이 적용된 후 다이어그램 로드
      if (diagram.value) {
        await nextTick();
        diagram.value.reloadDiagram();
      }
    } catch (err) {
      console.error('Schema load error:', err);
      ElMessage.error({
        message: getErrorMessage(err, '스키마 로드 중 오류가 발생했습니다.'),
        offset: window.innerHeight - 100,
      });
    } finally {
      loading.value = false;
    }
  };

  // 관계 목록 조회
  const loadRelationships = async () => {
    try {
      const res = await axios.get(`${API_BASE}/relationships`, {
        params: getApiParams({
          page: relationshipPagination.value.currentPage - 1, // 0부터 시작
          size: relationshipPagination.value.pageSize,
          sort: 'id',
          direction: 'asc',
        }),
      });
      allRelationships.value = res.data.content || [];
      relationshipPagination.value.total = res.data.totalElements || 0;
    } catch (err) {
      console.error('Load relationships error:', err);
      ElMessage.error({
        message: getErrorMessage(
          err,
          '관계 목록을 불러오는 중 오류가 발생했습니다.'
        ),
        offset: window.innerHeight - 100,
      });
    }
  };

  // 관계 목록 페이지 변경
  const handleRelationshipPageChange = (page) => {
    relationshipPagination.value.currentPage = page;
    loadRelationships();
  };

  // 테이블 목록 로드
  const loadTableList = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tables/autocomplete`, {
        params: getApiParams({ query: '', limit: 1000 }),
      });
      allTables.value = res.data.map((t) => ({
        value: t.tableName,
        logical: t.logicalName,
      }));
    } catch (err) {
      console.error('Load tables error:', err);
    }
  };

  // 테이블 검색 (자동완성용)
  const searchTables = (query, cb) => {
    if (!query) {
      cb(allTables.value);
      return;
    }
    const filtered = allTables.value.filter(
      (t) =>
        t.value.toLowerCase().includes(query.toLowerCase()) ||
        t.logical.toLowerCase().includes(query.toLowerCase())
    );
    cb(filtered);
  };

  // 부모 테이블 선택 시 컬럼 로드
  const handleParentTableSelect = async (item) => {
    newRelationship.value.parentTable = item.value;
    newRelationship.value.parentColumnsArray = [];
    try {
      const res = await axios.get(`${API_BASE}/tables/${item.value}/position`, {
        params: getApiParams(),
      });
      parentTableColumns.value = res.data.columns || [];
    } catch (err) {
      console.error('Load parent columns error:', err);
      parentTableColumns.value = [];
    }
  };

  // 자식 테이블 선택 시 컬럼 로드
  const handleChildTableSelect = async (item) => {
    newRelationship.value.childTable = item.value;
    newRelationship.value.childColumnsArray = [];
    try {
      const res = await axios.get(`${API_BASE}/tables/${item.value}/position`, {
        params: getApiParams(),
      });
      childTableColumns.value = res.data.columns || [];
    } catch (err) {
      console.error('Load child columns error:', err);
      childTableColumns.value = [];
    }
  };

  // 새 관계 생성
  const createRelationship = async () => {
    try {
      // 배열을 쉼표로 구분된 문자열로 변환
      const payload = {
        parentTable: newRelationship.value.parentTable,
        parentColumns: newRelationship.value.parentColumnsArray.join(', '),
        childTable: newRelationship.value.childTable,
        childColumns: newRelationship.value.childColumnsArray.join(', '),
        relationshipType: newRelationship.value.relationshipType,
        description: newRelationship.value.description,
      };

      await axios.post(`${API_BASE}/relationships`, payload, {
        params: getApiParams(),
      });
      ElMessage.success({
        message: '관계가 생성되었습니다.',
        offset: window.innerHeight - 100,
      });
      showCreateDialog.value = false;
      loadRelationships();
      if (diagram.value) {
        diagram.value.reloadDiagram();
      }
      // 폼 초기화
      newRelationship.value = {
        parentTable: '',
        parentColumns: '',
        parentColumnsArray: [],
        childTable: '',
        childColumns: '',
        childColumnsArray: [],
        relationshipType: 'non-identifying',
        description: '',
      };
      parentTableColumns.value = [];
      childTableColumns.value = [];
    } catch (err) {
      console.error('Create relationship error:', err);
      ElMessage.error({
        message: getErrorMessage(err, '관계 생성 중 오류가 발생했습니다.'),
        offset: window.innerHeight - 100,
      });
    }
  };

  // 관계 편집 시작
  const editRelationship = (row) => {
    editingRelationship.value = { ...row };
    showEditDialog.value = true;
  };

  // 관계 업데이트
  const updateRelationship = async () => {
    try {
      await axios.put(
        `${API_BASE}/relationships/${editingRelationship.value.constraintName}`,
        {
          relationshipType: editingRelationship.value.relationshipType,
          description: editingRelationship.value.description,
        },
        { params: getApiParams() }
      );
      ElMessage.success({
        message: '관계가 업데이트되었습니다.',
        offset: window.innerHeight - 100,
      });
      showEditDialog.value = false;
      loadRelationships();
      if (diagram.value) {
        diagram.value.reloadDiagram();
      }
    } catch (err) {
      console.error('Update relationship error:', err);
      ElMessage.error({
        message: getErrorMessage(err, '관계 업데이트 중 오류가 발생했습니다.'),
        offset: window.innerHeight - 100,
      });
    }
  };

  // 관계 삭제
  const deleteRelationship = async (row) => {
    if (row.isPhysical) {
      ElMessage.warning({
        message: '물리적 FK 관계는 삭제할 수 없습니다.',
        offset: window.innerHeight - 100,
      });
      return;
    }

    try {
      await axios.delete(`${API_BASE}/relationships/${row.constraintName}`, {
        params: getApiParams(),
      });
      ElMessage.success({
        message: '관계가 삭제되었습니다.',
        offset: window.innerHeight - 100,
      });
      loadRelationships();
      if (diagram.value) {
        diagram.value.reloadDiagram();
      }
    } catch (err) {
      console.error('Delete relationship error:', err);
      ElMessage.error({
        message: getErrorMessage(err, '관계 삭제 중 오류가 발생했습니다.'),
        offset: window.innerHeight - 100,
      });
    }
  };

  // 경고 메시지 파싱
  const getWarningMessage = (row) => {
    if (!row.validationWarnings) return '';
    try {
      const warnings = JSON.parse(row.validationWarnings);
      return warnings.map((w) => w.message).join('\n');
    } catch {
      return row.validationWarnings;
    }
  };
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: sans-serif;
  }

  .app {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    padding: 20px;
    background: white;
    border-bottom: 2px solid #eee;
    display: flex;
    align-items: center;
    gap: 30px;
  }

  .header h1 {
    margin: 0;
    font-size: 24px;
  }

  .search-item {
    padding: 8px 0;
  }
  .search-item strong {
    margin-right: 8px;
  }
  .search-item .logical {
    color: #666;
    font-size: 13px;
    margin-top: 4px;
  }
  .search-item .stats {
    color: #999;
    font-size: 12px;
    margin-left: 10px;
  }

  .content {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .panel {
    position: absolute;
    right: 0;
    top: 0;
    width: 350px;
    height: 100%;
    background: white;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
    overflow-y: auto;
  }

  .panel-header {
    padding: 20px;
    border-bottom: 1px solid #eee;
    position: relative;
  }

  .panel-header h3 {
    margin: 0 0 8px 0;
  }
  .panel-header span {
    color: #666;
    font-size: 13px;
    font-family: monospace;
  }
  .panel-header button {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  .panel-body {
    padding: 20px;
  }
  .panel-body h4 {
    margin: 20px 0 10px 0;
    font-size: 14px;
    color: #666;
  }

  .columns-list {
    margin-top: 10px;
    border: 1px solid #eee;
    border-radius: 4px;
    max-height: 400px;
    overflow-y: auto;
  }

  .column-item {
    padding: 10px;
    border-bottom: 1px solid #f5f5f5;
    font-family: monospace;
    font-size: 12px;
    transition: background-color 0.2s;
  }

  .column-item:last-child {
    border-bottom: none;
  }

  .column-item:hover {
    background-color: #f9f9f9;
  }

  .column-item.is-pk {
    background-color: #fff3cd;
  }

  .column-name {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 4px;
  }

  .pk-icon,
  .fk-icon {
    font-size: 10px;
  }

  .column-type {
    color: #2196f3;
    margin-bottom: 2px;
  }

  .column-nullable {
    color: #999;
    font-size: 10px;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.3s;
  }
  .slide-enter-from,
  .slide-leave-to {
    transform: translateX(100%);
  }

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    z-index: 1000;
  }

  /* 관계 관리 툴바 */
  .relationship-toolbar {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 10px;
  }
</style>
