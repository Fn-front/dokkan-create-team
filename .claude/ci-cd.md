# CI/CD設定

## GitHub Actions ワークフロー

### 1. CI - Quality & Test (`.github/workflows/ci.yml`)

**トリガー**:

- `main`ブランチへのpush
- `main`ブランチへのPull Request

**実行内容**:

1. **品質チェック** (`npm run quality:check`)
   - Prettierフォーマットチェック
   - ESLint実行
   - TypeScript型チェック

2. **ユニットテスト** (`npm run test:coverage`)
   - Jestユニットテスト実行
   - カバレッジレポート生成
   - Codecovへカバレッジアップロード

3. **E2Eテスト** (`npx playwright test`)
   - Playwrightブラウザインストール
   - 全E2Eテスト実行
   - 失敗時にPlaywrightレポートをアーティファクトとして保存

**環境**:

- Node.js: 20.x
- OS: Ubuntu latest
- キャッシュ: npm、node_modules

### 2. Build Check (`.github/workflows/build-check.yml`)

**トリガー**:

- `main`ブランチへのpush
- `main`ブランチへのPull Request

**実行内容**:

1. **Next.jsビルド** (`npm run build`)
   - Turbopackを使用してビルド
   - ビルド成功を確認

2. **ビルド成果物の保存**
   - `.next/`ディレクトリをアーティファクトとして保存
   - 保持期間: 7日間

**環境**:

- Node.js: 20.x
- OS: Ubuntu latest
- キャッシュ: npm、node_modules

## Codecov設定

**必要な設定**:

- GitHubリポジトリのSecretsに`CODECOV_TOKEN`を設定
- カバレッジレポート: `coverage/lcov.info`

**カバレッジ対象**:

- `src/**/*.{js,jsx,ts,tsx}` (ただし`src/app/**`を除く)

## キャッシュ戦略

**キャッシュ対象**:

- `~/.npm`: npm キャッシュ
- `node_modules`: インストール済みパッケージ

**キャッシュキー**:

- `${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}`
- `package-lock.json`の変更時のみキャッシュを無効化

## ワークフロー実行順序

全てのワークフローは並列実行されます：

- CI - Quality & Test
- Build Check

どちらかが失敗してもPRはマージできません。

## ローカルでの検証

GitHubにpushする前に、ローカルで以下を実行して確認：

```bash
# 品質チェック
npm run quality:check

# ユニットテスト + カバレッジ
npm run test:coverage

# ビルドチェック
npm run build

# E2Eテスト
npx playwright test
```

## トラブルシューティング

### ビルドが失敗する場合

- `npm run build`をローカルで実行して確認
- TypeScript型エラーを修正
- `npm run quality:check`でLintエラーを修正

### テストが失敗する場合

- `npm test`でユニットテストを確認
- `npx playwright test --headed`でE2Eテストを視覚的に確認
- テストログをGitHub Actionsのログで確認

### キャッシュの問題

- `package-lock.json`を更新するとキャッシュが無効化される
- 手動でキャッシュをクリアする場合はGitHub Actionsの設定から削除
