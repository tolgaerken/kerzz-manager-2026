#!/usr/bin/env node

/**
 * Manuel Version Bump Script
 * 
 * Kullanım:
 *   node scripts/version.js patch   # 0.0.1 → 0.0.2
 *   node scripts/version.js minor   # 0.0.2 → 0.1.0
 *   node scripts/version.js major   # 0.1.0 → 1.0.0
 *   node scripts/version.js 1.2.3   # Belirli version
 */

const fs = require('fs');
const path = require('path');

const API_PACKAGE = path.join(__dirname, '../apps/api/package.json');
const WEB_PACKAGE = path.join(__dirname, '../apps/web/package.json');
const DEFAULT_VERSION = '0.0.1';

function parseVersion(versionStr) {
  if (!versionStr || typeof versionStr !== 'string') {
    return null;
  }
  const match = versionStr.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return null;
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

function bumpVersion(currentVersion, type) {
  const parsed = parseVersion(currentVersion);
  const { major, minor, patch } = parsed || parseVersion(DEFAULT_VERSION);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      if (/^\d+\.\d+\.\d+$/.test(type)) {
        return type;
      }
      throw new Error(`Gecersiz bump type: ${type}. Kullanim: patch|minor|major|X.Y.Z`);
  }
}

function readPackageVersion(filePath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return pkg.version || DEFAULT_VERSION;
  } catch {
    return DEFAULT_VERSION;
  }
}

function updatePackageJson(filePath, newVersion) {
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  pkg.version = newVersion;
  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
}

function main() {
  const bumpType = process.argv[2];

  if (!bumpType) {
    console.error('Hata: Bump type belirtilmedi');
    console.log('\nKullanim:');
    console.log('  pnpm version:patch   # 0.0.1 -> 0.0.2');
    console.log('  pnpm version:minor   # 0.0.2 -> 0.1.0');
    console.log('  pnpm version:major   # 0.1.0 -> 1.0.0');
    console.log('  pnpm version 1.2.3   # Belirli version');
    process.exit(1);
  }

  try {
    const currentVersion = readPackageVersion(API_PACKAGE);
    const newVersion = bumpVersion(currentVersion, bumpType);

    console.log(`Version: ${currentVersion} -> ${newVersion}`);

    updatePackageJson(API_PACKAGE, newVersion);
    console.log(`apps/api/package.json guncellendi`);

    updatePackageJson(WEB_PACKAGE, newVersion);
    console.log(`apps/web/package.json guncellendi`);

    console.log(`\nVersion basariyla ${newVersion} olarak guncellendi!`);
  } catch (error) {
    console.error('Hata:', error.message);
    process.exit(1);
  }
}

main();
