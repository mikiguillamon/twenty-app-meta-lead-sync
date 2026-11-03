#!/usr/bin/env node
/**
 * Read-only release checks. This script never contacts npm or Twenty and never publishes.
 *
 * Local / CI:   node scripts/release-preflight.mjs
 * Public gate:  node scripts/release-preflight.mjs --public --tag v1.0.0
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const REPOSITORY = 'mikiguillamon/twenty-meta-lead-sync';
const SEMVER = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9A-Za-z-][0-9A-Za-z.-]*))?(?:\+[0-9A-Za-z.-]+)?$/;
const NPM_NAME = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9][a-z0-9._~-]*$/;

export function releaseProblems(pkg, { publicRelease = false, tag } = {}) {
  const problems = [];
  if (!NPM_NAME.test(pkg.name ?? '')) problems.push('package.json: invalid npm package name');
  if (!SEMVER.test(pkg.version ?? '')) problems.push('package.json: version must be valid semver');
  if (!pkg.keywords?.includes('twenty-app')) problems.push('package.json: missing twenty-app keyword');
  if (pkg.license !== 'MIT') problems.push('package.json: expected MIT license');
  if (!pkg.engines?.twenty || !pkg.engines.twenty.includes('2.50.0')) {
    problems.push('package.json: declare compatibility with tested Twenty 2.50');
  }
  if (!pkg.repository?.url?.includes(REPOSITORY)) {
    problems.push('package.json: repository URL must point to the public source repository');
  }
  if (!pkg.description || pkg.description.length < 25) {
    problems.push('package.json: add a clear English description');
  }
  if (tag !== undefined && tag !== 'v' + pkg.version) {
    problems.push('Release git tag must equal v + package.json version');
  }
  if (publicRelease) {
    if (pkg.private !== false) {
      problems.push('PUBLIC RELEASE BLOCKED: set package.json private=false after choosing npm owner');
    }
    if (/(?:-jff|private|demo|test)$/i.test(pkg.name ?? '')) {
      problems.push('PUBLIC RELEASE BLOCKED: choose an npm package name without a deployment-specific suffix');
    }
    if (/private beta/i.test(pkg.description ?? '')) {
      problems.push('PUBLIC RELEASE BLOCKED: update package description');
    }
    if (!pkg.homepage?.startsWith('https://') || !pkg.bugs?.url?.startsWith('https://')) {
      problems.push('PUBLIC RELEASE BLOCKED: include a public homepage and issue-report URL');
    }
  }
  return problems;
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
  const tagOption = process.argv.find(arg => arg.startsWith('--tag='));
  const tagIndex = process.argv.indexOf('--tag');
  const tag = tagOption ? tagOption.slice('--tag='.length) : tagIndex !== -1 ? process.argv[tagIndex + 1] : undefined;
  const problems = releaseProblems(pkg, { publicRelease: process.argv.includes('--public'), tag });
  if (problems.length) {
    for (const problem of problems) process.stderr.write('✗ ' + problem + '\n');
    process.exitCode = 1;
  } else {
    process.stdout.write('✓ Read-only release checks passed for ' + pkg.name + '@' + pkg.version + '\n');
  }
}
