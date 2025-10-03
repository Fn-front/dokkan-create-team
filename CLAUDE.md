# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

- 全ての色はCSS カスタムプロパティとして`src/styles/globals.css`で一元管理
- 色の値はカラーコード（#ffffff）またはrgba()で記述
- コンポーネントでは`var(--color-*)`形式で参照

## アーキテクチャ

### プロジェクト構成

ドッカンバトルチーム作成ツール用のNext.js (App Router) + TypeScript プロジェクト。**Package by Feature**思想を採用。

### ディレクトリ構造

```
src/
├── app/                    # Next.js App Router
├── features/               # 機能別ディレクトリ
│   └── [feature]/
│       ├── index.tsx      # メインコンポーネント（直接書く）
│       ├── styles.module.scss # CSS Modules
│       ├── components/    # 機能専用コンポーネント
│       └── hooks/         # 機能専用hooks
├── components/            # 共通コンポーネント
├── functions/
│   ├── hooks/            # 共通hooks
│   ├── types/            # 共通型定義
│   └── data/             # 静的データ
├── lib/                  # 共通ライブラリ
└── styles/               # 共通スタイル
```

### 設計原則

1. **Feature First**: 機能ごとにディレクトリを分割、関連するコードを近くに配置
2. **Simple Structure**: featuresではindex.tsxに直接コンポーネントを記述、必要な場合のみcomponents/に分割
3. **CSS Modules**: `styles.module.scss`の命名規則、SCSSで`@use`を使用
4. **Type Safety**: TypeScript、共通型はfunctions/types/に配置

### フォント・スタイリング

- **フォント**: Noto Sans JP (next/font/google使用)、font-size: 62.5%ベース（1rem = 10px）で14pxベース
- **リセットCSS**: The New CSS Reset使用
- **CSS管理**: layout.tsxで一元管理（@importではなくimport文）
- **スタイル**: SCSS + CSS Modules、プロパティ順序はstylelint-config-recess-orderで管理
- **マージン**: 全て上方向（margin-top）に統一

## ドラッグ&ドロップシステム

### 実装方式

- HTML5 Drag & Drop APIではなく、**マウスイベントベース**でドラッグ&ドロップを実装
- CharacterList: キャラクター一覧からチームスロットへの配置
- TeamLayout: チームスロット間の移動・入れ替え、チーム外への削除

### マウス追従画像システム

- キャラクターをドラッグ時に、マウスの動きに合わせて画像が追従
- 画像サイズは元のキャラクターカードと同じサイズを維持
- 掴んだ場所からの相対位置を正確に保持（`dragOffset`で管理）
- 透明度、回転、影効果で視覚的フィードバックを提供

### 禁止アイコンシステム

- **react-icons使用**: `@/components/icons`で管理、Material Design（MdBlock）
- **表示条件**: 配置・移動制限に違反する場合にリアルタイム表示
- **表示位置**: ドラッグ画像と同じ位置に重ねて表示
- **実装箇所**: CharacterList（配置制限）、TeamLayout（移動制限）

### キャラクター重複制限

#### 配置ルール

- **リーダー配置済み**: 同じキャラクターはフレンドのみ配置可能
- **フレンド配置済み**: 同じキャラクターはリーダーのみ配置可能
- **メンバー配置済み**: 同じキャラクターはどこにも配置不可

#### 移動制限

- **リーダー・フレンド間**: 同じキャラクター同士は相互移動可能
- **メンバーから他**: 重複がある場合は移動不可
- **他からメンバー**: 重複がある場合は移動不可

### チーム内移動システム

- **空スロットへの移動**: 単純な位置変更
- **占有スロットへの移動**: キャラクター入れ替え
- **制限チェック**: 移動前に`canMoveCharacter`で検証
- **入れ替え制限**: 両方向の制限をチェック

### 重要な設計

- `useRef`を使用してドラッグ状態を即座に保存（React状態更新の非同期性回避）
- `dragOffsetRef`で掴んだ場所の相対位置を正確に管理
- `pointer-events: none`を子要素に設定してイベント競合を防止
- `preventDefault()`でテキスト選択やデフォルト動作を抑制
- グローバルイベントリスナーでドラッグ中の追跡
- カーソル状態管理（`grab` → `grabbing`）とCSS override

### データフロー

```
Character → CharacterList → HomePage → useTeam → TeamLayout
                ↓              ↓         ↓         ↓
            onDragStart → onCharacterDrop → addCharacterToSlot → 表示更新

TeamSlot → TeamLayout → HomePage → useTeam → TeamLayout
            ↓            ↓         ↓         ↓
        onMouseDown → onCharacterMove → moveCharacter → 表示更新
```

## 型システム

### コア型定義 (`functions/types/team.ts`)

- `Character`: id, name, imagePath, rarity, type, cost, skills?
- `TeamSlot`: character, position (0=leader, 1-5=members, 6=friend)
- `Team`: leader, members[], friend

#### キャラクタースキル型定義

- `CharacterSkills`: pre_extreme?, post_extreme?, super_extreme?
- `SkillSet`: leader_skill, super_attack, ultra_super_attack?, passive_skill, active_skill
- `Skill`: name, conditions?, original_effect?, effect?
- `SkillCondition`: type, target, ki?, hp?, atk?, def?

### アイコン管理

- **react-icons使用**: Material Design等のアイコンライブラリ
- **管理場所**: `@/components/icons/` ディレクトリ
- **エクスポート**: `index.ts`でまとめて管理
- **例**: `ProhibitIcon` - MdBlockアイコンをラップしたコンポーネント

### 重要なルール

- featuresのtypesはfunctions/types/に配置
- CSS ModulesはSCSSで`@use`を使用
- 各featureのcomponentsディレクトリは.gitkeepでデフォルト作成
- functionはアロー関数で実装
- memo化を行うこと（依存配列を慎重に管理）
- 処理の修正をした場合は必ずmemo化の依存配列も確認すること
- **className結合**: `clsx`ライブラリを使用、`cn()`共通関数(`src/lib/utils.ts`)でラップ
- **アイコンは今後react-iconsを使用**: `@/components/icons`で管理

## テスト

### 環境設定

- **開発環境**: http://localhost:3000
- **テスト環境**: http://localhost:3001

### テストファイル

- **基本ドラッグ&ドロップ**: `drag-stability-test.spec.js`, `simple-drag-test.spec.js`
- **マウス追従画像**: `drag-follow-test.spec.js`, `drag-offset-test.spec.js`, `team-drag-follow-test.spec.js`
- **カーソル変化**: `cursor-test.spec.js`
- **スキル表示**: `skill-display-test.spec.js`
- **キャラクター重複制限**: `character-duplicate-test.spec.js`, `character-duplicate-move-test.spec.js`
- **禁止アイコン**: `prohibit-icon-test.spec.js`
- **チーム内移動**: `character-move-test.spec.js`
- **ブラウザ固有**: `browser-drag-test.spec.js`, `js-drag-test.spec.js`, `manual-drag-test.spec.js`

### 開発フロー

- **処理追加・変更後は必ずテスト検証を実行**
- 既存機能の回帰テストを実施
- 要件適合性をテスト結果で確認
- **型定義変更時**: TypeScriptコンパイル確認 (`npx tsc --noEmit`)
- **新機能追加時**: 対応するテストケースの作成・実行

## スキル表示システム

### 動的スキル表示機能

- **リーダースキル**: position 0（リーダースロット）のキャラクターのスキルを表示
- **フレンドスキル**: position 6（フレンドスロット）のキャラクターのスキルを表示
- **スキル優先順位**: super_extreme > post_extreme > pre_extreme
- **表示内容**: `leader_skill.original_effect`の値を動的に表示
- **未設置時**: 「リーダーを設置してください」「フレンドを設置してください」

### スキル取得ロジック

```typescript
// 優先順位に基づくスキル取得
if (skills.super_extreme?.leader_skill?.original_effect) {
  return skills.super_extreme.leader_skill.original_effect
}
if (skills.post_extreme?.leader_skill?.original_effect) {
  return skills.post_extreme.leader_skill.original_effect
}
if (skills.pre_extreme?.leader_skill?.original_effect) {
  return skills.pre_extreme.leader_skill.original_effect
}
```

### テスト

- **動的スキル表示テスト**: `tests/skill-display-test.spec.js`
- **テスト内容**: 初期状態、キャラクター設置、削除時の動作検証
- **表示メッセージ変更**: 「リーダーキャラクターを設置してください」→「リーダーを設置してください」

## ステータス計算システム

### ATK/DEF計算ロジック

キャラクターの最終ステータス計算は以下の順序で実行：

1. **基本ステータス**: `potential_55` または `potential_100` の値を使用
2. **リーダー・フレンドスキル適用**: 条件に応じた倍率を累積して適用
3. **パッシブスキル stat_boosts 計算**:
   - `basic` 値で乗算（`basic.atk`, `basic.def`）
   - `basic` 以外の全ATK/DEF値を再帰的に収集・合計
   - 合計値から-1して乗算（basic以外の値のみ）
4. **DEF down効果**: `def_down`値を基本DEFから減算
5. **攻撃倍率適用**（ATKのみ）: `post_extreme`内の"\_attack"で終わるキーの最後の項目の`multiplier`

### 再帰的ステータス収集

```typescript
const collectStatValues = (
  obj: Record<string, unknown>,
  statType: 'atk' | 'def' | 'def_down',
  excludeBasic = false
): number => {
  // キー名に依存しない再帰的な値収集
  // `ki_meter`, `conditional`, `turn_limited` など任意の構造に対応
}
```

### 計算式例（ブロリー）

```
基本ATK: 20,080
↓ (リーダー効果 2.2倍 × フレンド効果 2.2倍)
リダフレ後: 97,190
↓ (basic.atk = 2.8倍)
basicATK: 272,132
↓ (other boosts合計 7.86 - 1 = 6.86倍)
stat_boosts後: 1,866,825
↓ (ultra_super_attack multiplier = 4.2倍、-1処理なし)
最終ATK: 7,840,665
```

## 重要な技術的制約

- **任意のCSS プロパティ設定**: ベンダープレフィックス付きCSSプロパティは`setProperty()`/`removeProperty()`を使用（型安全）
- **useEffect警告**: イベントリスナークリーンアップでの依存配列警告は`eslint-disable-next-line react-hooks/exhaustive-deps`で無効化
- **ドラッグ状態管理**: React stateではなく`useRef`を使用して即座に状態を保存（非同期更新回避）
- **`any`型の使用禁止**: 型安全性を保つため、常に適切な型定義または型安全なAPIを使用
- **コードフォーマット**: 変更後は必ず`npm run format`でPrettierを実行
- **ステータス計算**: 計算順序の厳守、Math.floor()による切り捨て処理、multiplier適用時の-1処理の有無に注意
