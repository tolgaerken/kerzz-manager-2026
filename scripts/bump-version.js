#!/usr/bin/env node

/**
 * Semantic Versioning Script
 * 
 * Git commit mesajlarına göre version yükseltir:
 * - feat: → minor bump (1.0.0 → 1.1.0)
 * - fix: → patch bump (1.0.0 → 1.0.1)
 * - BREAKING CHANGE: → major bump (1.0.0 → 2.0.0)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Package.json dosyalarının yolları
const ROOT_PACKAGE = path.join(__dirname, '../package.json');
const API_PACKAGE = path.join(__dirname, '../apps/api/package.json');
const WEB_PACKAGE = path.join(__dirname, '../apps/web/package.json');

/**
 * Son commit mesajlarını al
 */
function getRecentCommits(count = 10) {
  try {
    const commits = execSync(`git log -${count} --pretty=format:"%s"`, { encoding: 'utf-8' });
    return commits.split('\n').filter(Boolean);
  } catch (error) {
    console.error('❌ Git log okunamadı:', error.message);
    return [];
  }
}

/**
 * Commit mesajlarından bump type'ı belirle
 */
function determineBumpType(commits) {
  const hasBreaking = commits.some(c => 
    c.includes('BREAKING CHANGE') || 
    c.includes('!:') ||
    c.match(/^[a-z]+!:/)
  );
  
  if (hasBreaking) return 'major';

  const hasFeat = commits.some(c => c.startsWith('feat:') || c.startsWith('feat('));
  if (hasFeat) return 'minor';

  const hasFix = commits.some(c => c.startsWith('fix:') || c.startsWith('fix('));
  if (hasFix) return 'patch';

  return null; // No version bump needed
}

/**
 * Version string'i bump et
 */
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
      return currentVersion;
  }
}

/**
 * Package.json dosyasını güncelle
 */
function updatePackageJson(filePath, newVersion) {
  const pkg = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  pkg.version = newVersion;
  fs.writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n');
}

/**
 * Ana fonksiyon
 */
function main() {
  console.log('🔍 Commit geçmişi analiz ediliyor...\n');

  const commits = getRecentCommits();
  if (commits.length === 0) {
    console.log('⚠️  Commit bulunamadı.');
    return;
  }

  console.log('Son commitler:');
  commits.slice(0, 5).forEach(c => console.log(`  - ${c}`));
  console.log('');

  const bumpType = determineBumpType(commits);
  
  if (!bumpType) {
    console.log('ℹ️  Version yükseltme gerekmiyor (feat/fix/BREAKING CHANGE bulunamadı)');
    return;
  }

  // Mevcut versiyonu oku
  const apiPkg = JSON.parse(fs.readFileSync(API_PACKAGE, 'utf-8'));
  const currentVersion = apiPkg.version;
  const newVersion = bumpVersion(currentVersion, bumpType);

  console.log(`📦 Version: ${currentVersion} → ${newVersion} (${bumpType})\n`);

  // Tüm package.json dosyalarını güncelle
  try {
    updatePackageJson(API_PACKAGE, newVersion);
    console.log(`✅ ${path.basename(path.dirname(API_PACKAGE))}/package.json güncellendi`);

    updatePackageJson(WEB_PACKAGE, newVersion);
    console.log(`✅ ${path.basename(path.dirname(WEB_PACKAGE))}/package.json güncellendi`);

    console.log(`\n🎉 Version başarıyla ${newVersion} olarak güncellendi!`);
    console.log(`\n💡 Şimdi yapabilecekleriniz:`);
    console.log(`   git add apps/*/package.json`);
    console.log(`   git commit -m "chore: bump version to ${newVersion}"`);
    console.log(`   git tag v${newVersion}`);
    console.log(`   git push && git push --tags`);
  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  }
}

main();
