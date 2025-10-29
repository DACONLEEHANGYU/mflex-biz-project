// composables/dictionarySearch/domainSearch/useDomainSearchTree.js
import {
  getDomainTreeData,
  getConstructDomainTreeView,
} from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';

export function useDomainSearchTree() {
  const selectFirstNode = () => {
    setTimeout(() => {
      const firstNodeWrapper = document.querySelector(
        '.tree-node .node-wrapper'
      );

      console.log('firstNodeWrapper ===============', firstNodeWrapper);
      if (firstNodeWrapper) {
        firstNodeWrapper.setAttribute('data-selected', 1);
      }
    }, 100);
  };

  const selectGridFirstNode = () => {
    setTimeout(() => {
      const nodesWithRowId0 = document.querySelector('[row-id="0"]');
      console.log('nodeWithRowId0 ========', nodesWithRowId0);

      if (nodesWithRowId0) {
        nodesWithRowId0.classList.add('ag-row-selected');
        nodesWithRowId0.classList.add('ag-row-focus');
        nodesWithRowId0.setAttribute('aria-selected', true);
      }
    }, 1000);
  };

  const focusRootNode = (appTree) => () => {
    appTree.value.focusRoot();
  };

  // API 트리데이터 조회, 생성
  const updateDomainTree = (params) => async () => {
    const {
      useMetaMngInstId,
      useDctnryId,
      domainDictionarySearchCode,
      treeData,
      rowData,
      setDomainViewSelectData,
      inputQuery,
      columnDefs,
      fetchData,
      selectNode,
      getSortQuery, // utils에서 가져온 getSortQuery 사용
    } = params;

    const requestParams = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      parentDomainId: '0도메인사전',
      dictionarySearchCode: domainDictionarySearchCode.value,
    };

    const domainTreeRowData = await getDomainTreeData(requestParams);
    console.log('domainTreeRowData : ', domainTreeRowData);

    if (domainTreeRowData.length === 0) {
      treeData.value = [];
      rowData.value = [];
      setDomainViewSelectData(null);
      return;
    }

    const domainTreeData = getConstructDomainTreeView(domainTreeRowData);
    treeData.value = domainTreeData;

    selectNode.value = treeData.value['1'] || {
      domainId: '0도메인사전',
      domainGroupName: null,
    };

    const domainResearchQuery = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      dictionarySearchCode: domainDictionarySearchCode.value,
      domainId: selectNode.value.domainId,
      query: inputQuery.value,
      sort: getSortQuery(), // utils에서 가져온 함수 사용
    };

    fetchData(domainResearchQuery);
    selectFirstNode();
  };

  const onSelectNode = (params) => (value) => {
    const {
      columnDefs,
      inputQuery,
      searchInput,
      useMetaMngInstId,
      useDctnryId,
      domainDictionarySearchCode,
      fetchData,
      selectNode,
      getSortQuery, // utils에서 가져온 getSortQuery 사용
    } = params;

    console.log('onSelectNode value : ', value);

    selectNode.value = value || {
      domainId: '0도메인사전',
      domainGroupName: null,
    };

    // 트리 클릭 시 검색어 초기화
    inputQuery.value = '';
    searchInput.value = '';

    const domainResearchQuery = {
      instituteId: useMetaMngInstId,
      dictionaryId: useDctnryId,
      dictionarySearchCode: domainDictionarySearchCode.value,
      domainId: selectNode.value.domainId,
      query: inputQuery.value,
      sort: getSortQuery(), // utils에서 가져온 함수 사용
    };

    fetchData(domainResearchQuery);
  };

  return {
    selectFirstNode,
    selectGridFirstNode,
    focusRootNode,
    updateDomainTree,
    onSelectNode,
  };
}
