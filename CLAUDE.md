# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ドッカンバトルチーム作成ツール用のNext.js (App Router) + TypeScript プロジェクト。**Package by Feature**思想を採用。

## 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# ビルド（Turbopack使用）
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint

# スタイルLint実行
npm run lint:style

# スタイルLint + 自動修正
npm run lint:style:fix

# コードフォーマット
npm run format

# フォーマットチェック
npm run format:check

# E2Eテスト実行
npx playwright test

# 品質チェック（フォーマット + Lint + 型チェック）
npm run quality:check

# テスト前準備（品質チェック実行）
npm run test:prepare

# 品質チェック + 全テスト実行
npm run test:single

# 単一テスト実行
npx playwright test tests/drag-stability-test.spec.js

# ヘッド付きテスト実行（ブラウザ表示）
npx playwright test --headed
```

## コード品質管理

### テスト前品質チェック

- **テスト実行前**: 必ず`npm run test:prepare`を実行してコード品質をチェック
- **品質チェック内容**: フォーマット → ESLint → TypeScript型チェック
- **修正が必要な場合**: エラーや警告を修正してから再度実行

### 品質チェック使い分け

- **TS・TSX変更時**: `npm run test:prepare` (フル品質チェック + テスト前準備)
- **CSS・SCSS変更のみ**: `npm run lint:style:fix` (Stylelint + 自動修正のみ)
- **全体品質チェック**: `npm run quality:check` (フォーマット + ESLint + TypeScript型チェック)
- **`any`型の使用禁止**: 型安全性を保つため、`setProperty()`等の型安全な方法を使用

### カラー管理

- 全ての色はCSSカスタムプロパティとして`src/styles/globals.css`で一元管理
- 色の値はカラーコード（#ffffff）またはrgba()で記述
- コンポーネントでは`var(--color-*)`形式で参照

## 詳細ドキュメント

プロジェクトの詳細な技術情報は`.claude/`ディレクトリに分離されています：

- **[architecture.md](.claude/architecture.md)**: アーキテクチャ、ディレクトリ構造、設計原則
- **[components.md](.claude/components.md)**: コンポーネント設計、共通コンポーネント、データフロー
- **[drag-and-drop.md](.claude/drag-and-drop.md)**: ドラッグ&ドロップシステムの実装詳細
- **[types.md](.claude/types.md)**: 型システム、データ構造、ヘルパー関数
- **[stats-calculation.md](.claude/stats-calculation.md)**: ステータス計算ロジック、計算式
- **[skills.md](.claude/skills.md)**: スキル表示、リーダースキル条件判定
- **[forms.md](.claude/forms.md)**: フォーム切り替え（リバーシブル・変身）
- **[testing.md](.claude/testing.md)**: テスト環境、テスト戦略、開発フロー

## 基本原則

### 設計原則

1. **Feature First**: 機能ごとにディレクトリを分割、関連するコードを近くに配置
2. **Flat Component Structure**: features配下のcomponentsは**フラット構造**（components配下にcomponentsを作らない）
3. **Component Folder Structure**: 各コンポーネントは独自のフォルダを持ち、`index.tsx`と`style.module.scss`を含む
4. **Hooks分離**: 複雑なロジックはカスタムhooksに分離
5. **Single Responsibility**: 各コンポーネント・hooksは単一の責任を持つ
6. **Type Safety**: TypeScript、共通型はfunctions/types/に配置
7. **Memo化**: 必ず`memo()`でラップし、依存配列を慎重に管理

### 実装ルール

- featuresのtypesはfunctions/types/に配置
- **CSS Modules**: SCSSで記述、⚠️ `@use`は使用しない（mixinsファイルが存在しないため）
- functionはアロー関数で実装
- **className結合**: `clsx`ライブラリを使用、`cn()`共通関数(`src/lib/utils.ts`)でラップ
- **アイコン管理**: react-iconsを使用、`@/components/icons`で管理
- **コンポーネント分離**: 1ファイル200行を超えたら分離を検討
  - ロジック → hooks
  - 表示 → 別コンポーネント

## 重要な技術的制約

- **任意のCSSプロパティ設定**: ベンダープレフィックス付きCSSプロパティは`setProperty()`/`removeProperty()`を使用（型安全）
- **useEffect警告**: イベントリスナークリーンアップでの依存配列警告は`eslint-disable-next-line react-hooks/exhaustive-deps`で無効化
- **ドラッグ状態管理**: React stateではなく`useRef`を使用して即座に状態を保存（非同期更新回避）
- **`any`型の使用禁止**: 型安全性を保つため、常に適切な型定義または型安全なAPIを使用
- **コードフォーマット**: 変更後は必ず`npm run format`でPrettierを実行
- **キャラクターデータアクセス**: `characterUtils.ts`のヘルパー関数を使用（`getImageUrl`, `getCharacterSkills`等）

## クイックリファレンス

### ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
├── features/               # 機能別ディレクトリ（Feature First）
│   └── [feature]/
│       ├── components/    # フラット構造（components配下にcomponents作らない）
│       │   └── [Component]/
│       │       ├── index.tsx
│       │       ├── style.module.scss
│       │       └── hooks/        # コンポーネント専用hooks
│       └── hooks/         # 機能専用hooks
├── components/            # 共通コンポーネント
├── functions/
│   ├── hooks/            # 共通hooks
│   ├── types/            # 共通型定義
│   ├── utils/            # ユーティリティ関数
│   └── data/             # 静的データ
├── lib/                  # 共通ライブラリ
└── styles/               # 共通スタイル
```

### 開発フロー

1. **処理追加・変更後**: 必ず品質チェック (`npm run quality:check`)
2. **テスト実行**: `npx playwright test`で回帰テスト
3. **個別確認**: `npx playwright test tests/[test-name].spec.js`
4. **視覚的確認**: `--headed`オプションまたはMCPブラウザツール

詳細は各ドキュメントを参照してください。
