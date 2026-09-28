// Serializador YAML propio (subconjunto): objetos, arreglos, string, number, boolean, null.
// Los strings se emiten con JSON.stringify: un escalar entre comillas dobles es YAML valido.
const PLAIN_KEY = /^[A-Za-z_][A-Za-z0-9_]*$/;

function isContainer(value) {
  return value !== null && typeof value === 'object';
}

function isEmpty(value) {
  return Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0;
}

function scalar(value) {
  if (value === null || value === undefined) {
    return 'null';
  }
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'null';
  }
  if (typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(String(value));
}

function inline(value) {
  if (!isContainer(value)) {
    return scalar(value);
  }
  return Array.isArray(value) ? '[]' : '{}';
}

function needsBlock(value) {
  return isContainer(value) && !isEmpty(value);
}

function keyText(key) {
  return PLAIN_KEY.test(key) ? key : JSON.stringify(key);
}

function emit(value, indent) {
  const pad = ' '.repeat(indent);
  const lines = [];
  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (needsBlock(item)) {
        const sub = emit(item, indent + 2);
        sub[0] = `${pad}- ${sub[0].slice(indent + 2)}`;
        lines.push(...sub);
      } else {
        lines.push(`${pad}- ${inline(item)}`);
      }
    });
    return lines;
  }
  Object.keys(value).forEach((key) => {
    const item = value[key];
    if (item === undefined) {
      return;
    }
    if (needsBlock(item)) {
      lines.push(`${pad}${keyText(key)}:`, ...emit(item, indent + 2));
    } else {
      lines.push(`${pad}${keyText(key)}: ${inline(item)}`);
    }
  });
  return lines;
}

export function toYaml(value) {
  if (!needsBlock(value)) {
    return `${inline(value)}\n`;
  }
  return `${emit(value, 0).join('\n')}\n`;
}
