// 쿼리 변환 함수
function transformQuery(query) {
  // 정규표현식을 사용하여 컬럼명, 연산자, 검색 조건을 분리
  const regex =
    /(\S+)\s+((?:like|=|<|>|<=|>=))\s+'([^']+)'(\s+(?:and|or)\s+)?/gi;
  return query.replace(
    regex,
    (match, column, operator, searchTerm, logicalOperator) => {
      if (column === '최종수정자') {
        // 최종수정자는 검색어 유지, 연산자만 대문자로 변환
        return `${column} ${operator.toUpperCase()} '${searchTerm}'${
          logicalOperator ? logicalOperator.toUpperCase() : ''
        }`;
      }
      // 다른 컬럼들의 경우 영문 검색어와 연산자를 대문자로 변환
      const transformedTerm = searchTerm.replace(/[a-zA-Z]+/g, (word) =>
        word.toUpperCase()
      );
      return `${column} ${operator.toUpperCase()} '${transformedTerm}'${
        logicalOperator ? logicalOperator.toUpperCase() : ''
      }`;
    }
  );
}

export { transformQuery };
