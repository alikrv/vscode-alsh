const {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
  SymbolKind,
} = require('vscode-languageserver/node');
const { TextDocument } = require('vscode-languageserver-textdocument');

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

function parseSymbols(text, uri) {
  const symbols = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    let match = trimmed.match(/^let\s+([A-Za-z_][A-Za-z0-9_]*)\s*=/i);
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

function getWordAtPosition(document, position) {
  const line = document.getText({
    start: { line: position.line, character: 0 },
    end: { line: position.line, character: Number.MAX_SAFE_INTEGER },
  });
  const regex = /[$A-Za-z_][A-Za-z0-9_.]*/g;
  let match;

  while ((match = regex.exec(line)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (position.character >= start && position.character <= end) {
      return match[0];
    }
  }

  return null;
}

connection.onInitialize(() => ({
  capabilities: {
    textDocumentSync: TextDocumentSyncKind.Incremental,
    definitionProvider: true,
    documentSymbolProvider: true,
    hoverProvider: true,
    completionProvider: {
      resolveProvider: false,
      triggerCharacters: ['$', '.'],
    },
  },
}));

connection.onDefinition((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const word = getWordAtPosition(document, params.position);
  if (!word) {
    return null;
  }

  const lookupName = word.startsWith('$') ? word.slice(1) : word;
  const symbols = [];

  for (const doc of documents.all()) {
    symbols.push(...parseSymbols(doc.getText(), doc.uri));
  }

  const matches = symbols.filter((symbol) => symbol.name === lookupName);
  if (matches.length === 0) {
    return null;
  }

  return matches.map((symbol) => symbol.location);
});

connection.onDocumentSymbol((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  return parseSymbols(document.getText(), document.uri).map((symbol) => ({
    name: symbol.name,
    kind: symbol.kind,
    range: symbol.location.range,
    selectionRange: symbol.location.range,
  }));
});

connection.onHover((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }
  const word = getWordAtPosition(document, params.position);
  if (!word) {
    return null;
  }

  const lookupName = word.startsWith('$') ? word.slice(1) : word;
  const symbols = parseSymbols(document.getText(), document.uri);
  const match = symbols.find((symbol) => symbol.name === lookupName);
  if (!match) {
    return null;
  }

  return {
    contents: {
      kind: 'markdown',
      value: `**${SymbolKind[match.kind]}** \`${match.name}\``,
    },
    range: match.location.range,
  };
});

connection.onCompletion((params) => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return [];
  }

  const symbols = parseSymbols(document.getText(), document.uri);
  const unique = new Map();
  for (const symbol of symbols) {
    if (!unique.has(symbol.name)) {
      unique.set(symbol.name, symbol);
    }
  }

  return Array.from(unique.values()).map((symbol) => ({
    label: symbol.name,
    kind: symbol.kind,
    detail: symbol.kind === SymbolKind.Function ? 'function' : 'variable',
  }));
});

documents.listen(connection);
connection.listen();