# テスト環境・戦略

## テスト方針

**品質優先**: テスト実行時間よりも機能の網羅性を重視する。時間がかかっても全ての重要な機能をテストでカバーすることを優先する。

## テストの種類

### 1. ユニットテスト（Jest + React Testing Library）

- **対象**: コンポーネント、hooks、ユーティリティ関数
- **ファイル配置**: `__tests__/`ディレクトリまたは`.test.{ts,tsx}`ファイル
- **カバレッジ対象**: `src/**/*.{js,jsx,ts,tsx}`（`src/app/**`を除く）
- **カバレッジ目標**: 可能な限り高いカバレッジを目指す（実行時間は二の次）

**コマンド**:
```bash
# テスト実行
npm test

# Watch モード
npm run test:watch

# カバレッジレポート生成
npm run test:coverage
```

**カバレッジ確認**:
- `npm run test:coverage`実行後、`coverage/lcov-report/index.html`をブラウザで開く
- または`open coverage/lcov-report/index.html`

### 2. E2Eテスト（Playwright）

- **対象**: ブラウザ操作、統合テスト
- **ファイル配置**: `tests/`ディレクトリ

**コマンド**:
```bash
# 全E2Eテスト実行
npx playwright test

# 単一テスト実行
npx playwright test tests/[test-name].spec.js

# ヘッド付き実行（ブラウザ表示）
npx playwright test --headed
```

## 環境設定

- **開発環境**: http://localhost:3000
- **テスト環境**: http://localhost:3001（E2Eテスト用）

## テストファイル一覧

### 基本ドラッグ&ドロップ

- **drag-stability-test.spec.js**: ドラッグの安定性テスト
- **simple-drag-test.spec.js**: シンプルなドラッグ動作テスト

### マウス追従画像

- **drag-follow-test.spec.js**: マウス追従画像の動作テスト
- **drag-offset-test.spec.js**: ドラッグオフセット（掴んだ位置）のテスト
- **team-drag-follow-test.spec.js**: チーム内ドラッグの追従画像テスト

### カーソル変化

- **cursor-test.spec.js**: ドラッグ時のカーソル変化テスト

### スキル表示

- **skill-display-test.spec.js**: リーダー・フレンドスキルの動的表示テスト

### キャラクター重複制限

- **character-duplicate-test.spec.js**: キャラクター配置時の重複制限テスト
- **character-duplicate-move-test.spec.js**: チーム内移動時の重複制限テスト

### 禁止アイコン

- **prohibit-icon-test.spec.js**: 配置・移動禁止時の禁止アイコン表示テスト

### チーム内移動

- **character-move-test.spec.js**: チーム内でのキャラクター移動・入れ替えテスト

### ブラウザ固有

- **browser-drag-test.spec.js**: ブラウザ固有のドラッグ動作テスト
- **js-drag-test.spec.js**: JavaScript実装のドラッグテスト
- **manual-drag-test.spec.js**: 手動ドラッグ動作テスト

## 開発フロー

### 処理追加・変更後の検証手順

1. **品質チェック**: `npm run quality:check`
   - Prettierフォーマット
   - ESLint
   - TypeScript型チェック

2. **ユニットテスト実行**: `npm test`または`npm run test:coverage`
   - コンポーネント・関数のテスト
   - カバレッジ確認

3. **E2Eテスト実行**: `npx playwright test`
   - 全テストケース実行
   - 既存機能の回帰テスト

4. **個別テスト**: 変更箇所に関連するテストを個別実行
   ```bash
   # ユニットテスト
   npm test -- [test-file-path]

   # E2Eテスト
   npx playwright test tests/[test-name].spec.js
   ```

5. **ヘッド付きテスト**: 視覚的確認が必要な場合
   ```bash
   npx playwright test --headed
   ```

### テストが必要なタイミング

- **型定義変更時**: TypeScriptコンパイル確認 (`npx tsc --noEmit`)
- **新機能追加時**: 対応するテストケースの作成・実行
- **既存機能修正時**: 回帰テストで影響範囲を確認
- **リファクタリング時**: 全テスト実行で機能保証

## テスト作成ガイドライン

### テスト作成方針

**原則**: 機能の網羅性を最優先。テストが多少時間がかかっても、全ての重要な機能をテストケースで確実にカバーする。

**ユニットテスト対象**:
- 共通コンポーネント（`src/components/`） - 全てのprops、状態、イベントをテスト
- ユーティリティ関数（`src/functions/utils/`、`src/lib/`） - 全ての分岐、エッジケースをテスト
- 重要なビジネスロジックを含むhooks - 全ての状態変更、副作用をテスト

**E2Eテスト対象**:
- ユーザー操作フロー（ドラッグ&ドロップ、フォーム切り替え等） - 全ての操作パターンをテスト
- ブラウザ統合動作 - 全ての画面遷移、状態変化をテスト

**テスト作成時の注意点**:
- 時間がかかっても全ての分岐条件をテストする
- エッジケース、異常系も必ずカバーする
- テスト実行速度よりもカバレッジと信頼性を重視する

### ユニットテストの構成

```typescript
import { render, screen } from '@testing-library/react'
import Component from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('text')).toBeInTheDocument()
  })
})
```

### E2Eテストの構成

```javascript
import { test, expect } from '@playwright/test'

test.describe('機能名', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
    // 共通の初期化処理
  })

  test('テストケース名', async ({ page }) => {
    // テスト実施
    // アサーション
  })
})
```

### 重要なセレクタ

```javascript
// チームスロット
const slot = page.locator('[data-testid="team-slot"]').nth(0)

// キャラクターカード
const card = page.locator('.characterCard').first()

// ドラッグ画像
const dragImage = page.locator('.dragFollowImage')

// 禁止アイコン
const prohibitIcon = page.locator('.prohibitIcon')
```

### ドラッグ&ドロップのテストパターン

```javascript
// マウスダウン → マウス移動 → マウスアップ
await card.hover()
await page.mouse.down()
await page.mouse.move(targetX, targetY)
await page.mouse.up()

// 結果の検証
await expect(slot.locator('img')).toBeVisible()
```

## 継続的な品質保証

- **プルリクエスト前**: 必ず`npm run quality:check`と全テスト実行
- **品質基準**: 全テストパス、型エラーゼロ、Lintエラーゼロ
- **回帰テスト**: 既存機能への影響を常に確認
- **視覚的確認**: MCPブラウザツールまたは`--headed`モードで動作確認

## トラブルシューティング

### テスト失敗時の対応

1. **エラーメッセージ確認**: どのアサーションで失敗したか
2. **スクリーンショット確認**: Playwrightが自動保存
3. **ヘッド付き実行**: `--headed`で視覚的に確認
4. **タイムアウト問題**: `waitFor`または`timeout`オプションの調整

### よくある問題

- **要素が見つからない**: セレクタの確認、`waitFor`の追加
- **タイミング問題**: `page.waitForTimeout()`や`waitForSelector()`の使用
- **イベント競合**: `onClickCapture`や`e.stopPropagation()`の確認
