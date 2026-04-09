import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const SOCIETY_FILES = [
  'ABG.js',
  'AGS.js',
  'AMG.js',
  'EEO.js',
  'IX.js',
  'MAT.js',
  'MDR.js',
  'NTHS.js',
  'OPS.js',
  'PAM.js',
  'PB.js',
  'PRS.js',
  'PTE.js',
  'PTK.js',
  'SALUTE.js',
  'SCE.js',
  'SKD.js'
];

let cachedContext = null;

function resolveRepoRoot() {
  return process.env.TRANSCRIPT_REPO_ROOT || path.resolve(process.cwd(), '..');
}

function buildFileList(repoRoot) {
  return [
    path.join(repoRoot, 'configuration.js'),
    path.join(repoRoot, 'deterministicTranscriptParser.js'),
    path.join(repoRoot, 'societyUtils.js'),
    ...SOCIETY_FILES.map((fileName) => path.join(repoRoot, 'SocietyLogic', fileName)),
    path.join(repoRoot, 'societyRules.js')
  ];
}

function getContext() {
  if (cachedContext) return cachedContext;

  const repoRoot = resolveRepoRoot();
  const context = vm.createContext({ console });

  buildFileList(repoRoot).forEach((filePath) => {
    const source = fs.readFileSync(filePath, 'utf8');
    vm.runInContext(source, context, { filename: filePath });
  });

  cachedContext = context;
  return cachedContext;
}

function cloneResult(value) {
  return JSON.parse(JSON.stringify(value));
}

function runInGasContext(expression, bindings = {}) {
  const context = getContext();
  const keys = Object.keys(bindings);

  keys.forEach((key) => {
    context[key] = bindings[key];
  });

  try {
    return cloneResult(vm.runInContext(expression, context));
  } finally {
    keys.forEach((key) => {
      delete context[key];
    });
  }
}

export function parseTranscriptTextDeterministically(text) {
  return runInGasContext('parseTranscriptTextDeterministically(__textInput)', {
    __textInput: text
  });
}

export function determineSocietyMembership(parsedData, catalogMap) {
  return runInGasContext('determineSocietyMembership(__parsedData, __catalogMap)', {
    __parsedData: parsedData,
    __catalogMap: catalogMap
  });
}
