function randomKey() {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  // let possible =
  //   'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function camelToSnakeCase(camelCase) {
  return camelCase.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function camelToSnakeCaseUpper(camelCase) {
  return camelCase.replace(/[A-Z]/g, (letter) => `_${letter.toUpperCase()}`);
}

function basicWhereQueryCheck(textData) {
  //금칙어 목록
  let frbWrdList = ['INSERT', 'UPDATE', 'DELETE', 'EXEC', 'FROM', 'INTO', '--'];
  //
  for (let frbWrd of frbWrdList) {
    if (textData.includes(frbWrd)) {
      return 'ERR_FRBWRD';
    }
  }

  //문자열의 처음과 끝에 AND와 OR가 들어가 있는지 확인
  if (
    textData.startsWith('AND') ||
    textData.startsWith('OR') ||
    textData.endsWith('AND') ||
    textData.endsWith('OR')
  ) {
    return 'ERR_ANDOR';
  }

  //대괄호 개수 확인
  if (textData.split('(').length !== textData.split(')').length) {
    return 'ERR_BRCKTCNT';
  }

  //작은 따옴표 개수가 짝수 인지 확인
  let singQuotCnt = 0;
  for (const checkChar of textData) {
    if (checkChar === `'`) {
      singQuotCnt++;
    }
  }
  if (singQuotCnt % 2 !== 0) {
    return 'ERR_QUOTECNT';
  }

  //대괄호가 올바른 순서로 쓰였는지 확인
  const stackVal = [];
  for (const charVal of textData) {
    if (charVal === '(') {
      stackVal.push(charVal);
    } else if (charVal === ')') {
      if (!stackVal.length) {
        return 'ERR_BRCKTORD';
      }
      stackVal.pop();
    }
  }

  // 스택이 비어있지 않으면 안된다.
  /*   if (stackVal.length) {
    return 'ERR_BRCKTORD';
  } */

  return 'PASS';
}

export {
  randomKey,
  camelToSnakeCase,
  camelToSnakeCaseUpper,
  basicWhereQueryCheck,
};
