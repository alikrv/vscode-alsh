let SymbolKind;

try {
  ({ SymbolKind } = require('vscode-languageserver/node'));
} catch (error) {
  SymbolKind = { Variable: 13, Function: 12 };
}

function detectSpec(text) {
  const firstLine = (text.split(/\r?\n/, 1)[0] || '').trim();
  return firstLine.startsWith('#!') ? 'normal' : 'compiler';
}

function parseSymbols(text, uri, spec = detectSpec(text)) {
  const symbols = [];
  const lines = text.split(/\r?\n/);
  const letPattern = spec === 'compiler'
    ? /^(?:!global\s+)?let(?:\s+const)?\s+([A-Za-z_][A-Za-z0-9_]*)/i
    : /^(?:!global\s+)?let\s+([A-Za-z_][A-Za-z0-9_]*)/i;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    let match = trimmed.match(letPattern);
    if (match) {
      const name = match[1];
      const start = line.indexOf(name);
      symbols.push({
        name,
        kind: SymbolKind.Variable,
        location: {
          uri,
          range: {
            start: { line: i, character: start },
            end: { line: i, character: start + name.length },
          },
        },
      });
      continue;
    }

    match = trimmed.match(/^\$([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match) {
      const name = match[1];
      const start = line.indexOf(`$${name}`) + 1;
      symbols.push({
        name,
        kind: SymbolKind.Variable,
        location: {
          uri,
          range: {
            start: { line: i, character: start },
            end: { line: i, character: start + name.length },
          },
        },
      });
      continue;
    }

    match = trimmed.match(/^(?:function|fn)\s+([A-Za-z_][A-Za-z0-9_]*)/i);
    if (match) {
      const name = match[1];
      const start = line.indexOf(name);
      symbols.push({
        name,
        kind: SymbolKind.Function,
        location: {
          uri,
          range: {
            start: { line: i, character: start },
            end: { line: i, character: start + name.length },
          },
        },
      });
    }
  }

  return symbols;
}

module.exports = {
  detectSpec,
  parseSymbols,
};
