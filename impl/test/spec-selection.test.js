const assert = require('assert');
const { detectSpec, parseSymbols } = require('../specs');
const grammar = require('../syntaxes/alsh.tmLanguage.json');

const normalText = '#!/usr/bin/env alsh\nlet name = "Ada"\n';
const compilerText = 'let const name = "Ada"\n';
const typedFunctionText = 'function greet(str name) str {\n  return ("hi")\n}\n';

assert.strictEqual(detectSpec(normalText), 'normal');
assert.strictEqual(detectSpec(compilerText), 'compiler');

const symbols = parseSymbols(compilerText, 'file:///test.alsh');
assert.deepStrictEqual(symbols.map((symbol) => symbol.name), ['name']);

const typedSymbols = parseSymbols(typedFunctionText, 'file:///test.alsh');
assert.deepStrictEqual(typedSymbols.map((symbol) => symbol.name), ['greet']);

const functionDefinitionPattern = grammar.repository['function-definitions'].patterns[0];
assert.ok(functionDefinitionPattern.match.includes('noret'));
assert.ok(grammar.repository['function-parameters'].patterns[0].match.includes('\\*'));

console.log('spec-selection tests passed');
