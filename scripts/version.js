#!/usr/bin/env node

/**
 * Manuel Version Bump Script
 * 
 * Kullanım:
 *   node scripts/version.js patch   # 1.0.0 → 1.0.1
 *   node scripts/version.js minor   # 1.0.0 → 1.1.0
 *   node scripts/version.js major   # 1.0.0 → 2.0.0
 *   node scripts/version.js 1.2.3   # Belirli version
 */

const fs = require('fs');
const path = require('path');

const API_PACKAGE = path.join(__dirname, '../apps/api/package.json');
const WEB_PACKAGE = path.join(__dirname, '../apps/web/package.json');

function bumpVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      // Eğer version formatında ise direkt kullan
      if (/^\d+\.\d+\.\d+$/.test(type)) {
        return type;
      }
      throw new Error(`Geçersiz bump type: ${type}. Kullanım: patch|minor|major|X.Y.Z`);
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
    console.error('❌ Hata: Bump type belirtilmedi');
    console.log('\nKullanım:');
    console.log('  npm run version:patch   # 1.0.0 → 1.0.1');
    console.log('  npm run version:minor   # 1.0.0 → 1.1.0');
    console.log('  npm run version:major   # 1.0.0 → 2.0.0');
    console.log('  npm run version 1.2.3   # Belirli version');
    process.exit(1);
  }

  try {
    // Mevcut versiyonu oku
    const apiPkg = JSON.parse(fs.readFileSync(API_PACKAGE, 'utf-8'));
    const currentVersion = apiPkg.version;
    const newVersion = bumpVersion(currentVersion, bumpType);

    console.log(`📦 Version: ${currentVersion} → ${newVersion}`);

    // Güncelle
    updatePackageJson(API_PACKAGE, newVersion);
    console.log(`✅ apps/api/package.json güncellendi`);

    updatePackageJson(WEB_PACKAGE, newVersion);
    console.log(`✅ apps/web/package.json güncellendi`);

    console.log(`\n🎉 Version başarıyla ${newVersion} olarak güncellendi!`);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

main();
