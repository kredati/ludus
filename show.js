let show = value => {
  switch (typeof value) {
    case 'undefined': return 'undefined';
    case 'string': return `"${value}"`;
    case 'number': return `${value}`;
    case 'boolean': return `${value}`;
    case 'function': return `[Function: ${value.name || 'anonymous'}]`;
    case 'object': {
      if (value === null) return 'null';
      if (Array.isArray(value)) {
        return `[${value.map(show).join(', ')}]`
      } else {
        let entries = Object.entries(value);
        return `{${entries.slice(0, 3).map(([k, v]) => k + ': ' + show(v)).join(', ')}${entries.length > 3 ? '...' : ''}}`;
      }
    };
  }
};

export { show };