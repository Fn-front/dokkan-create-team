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
│       │   └── [ComponentName]/
│       │       ├── index.tsx
│       │       └── style.module.scss
│       └── hooks/         # 機能専用hooks
├── components/            # 共通コンポーネント
│   └── [ComponentName]/
│       ├── index.tsx
│       └── style.module.scss
├── functions/
│   ├── hooks/            # 共通hooks
│   ├── types/            # 共通型定義
│   ├── utils/            # ユーティリティ関数
│   └── data/             # 静的データ
├── lib/                  # 共通ライブラリ
└── styles/               # 共通スタイル
```

### 設計原則

1. **Feature First**: 機能ごとにディレクトリを分割、関連するコードを近くに配置
2. **Component Folder Structure**: 各コンポーネントは独自のフォルダを持ち、`index.tsx`と`style.module.scss`を含む
   - 例: `TeamLayout/index.tsx`, `TeamLayout/style.module.scss`
   - 例: `CharacterList/index.tsx`, `CharacterList/style.module.scss`
3. **CSS Modules**: `style.module.scss`の命名規則（複数形ではなく単数形）、SCSSで`@use`を使用
4. **Type Safety**: TypeScript、共通型はfunctions/types/に配置
5. **Hooks分離**: 複雑なロジックはカスタムhooksに分離（例: `useCharacterStats`）

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

- `Character`: id, base_name, rarity, attribute, cost, forms[], link_skills[], categories[]
- `CharacterForm`: form_id, form_name, display_name, form_order, is_base_form, is_only_form, stats, skills, image_urls[]
- `TeamSlot`: character, position (0=leader, 1-5=members, 6=friend)
- `Team`: leader, members[], friend

#### キャラクターデータ構造の重要なポイント

- **forms配列**: 各キャラクターは複数のフォーム（通常/極限/超極限）を持つ
- **reversible_forms配列**: リバーシブルキャラクターは2つのフォームを持つ（formsと相互排他）
- **データアクセス**:
  - **通常キャラ**: `character.forms[0]`で最初のフォームを参照
  - **リバーシブルキャラ**: `character.reversible_forms[formIndex]`で現在のフォームを参照
  - 表示名: `character.forms[0].display_name` または `character.name`（reversibleの場合）
  - 画像: `character.forms[0].image_url` または `character.reversible_forms[formIndex].image_url`
  - スキル: `character.forms[0].skills` または `character.reversible_forms[formIndex].skills`
  - ステータス: `character.forms[0].stats` または `character.stats`（reversibleの場合）
- **画像プロパティ名**: `image_url`（単数形）を使用（`image_urls`ではない）
- **画像パス**: `/images/character/`配下のローカル画像（ローマ字ファイル名）
- **キャラクター一意性**: `character.id`を使用（`name`ではない）
- **重要**: `characterUtils.ts`のヘルパー関数を使用してデータアクセスすること

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

## 共通コンポーネント・Hooks

### Radix UI統合

- **Dialogコンポーネント**: `@radix-ui/react-dialog`を使用したモーダル実装
- **Tabsコンポーネント**: `@/components/Tabs/Tabs.tsx`で再利用可能なタブUI提供
  - `tabs`プロップで`{ value, label, content }`配列を受け取る
  - 自動的に最初のタブをデフォルト選択、または`defaultValue`で指定可能
  - スタイルは`text-align: center`を含む共通スタイル適用

### カスタムHooks

- **useDialog** (`functions/hooks/useDialog.ts`): ダイアログの開閉状態を管理
  - `open`, `openDialog()`, `closeDialog()`, `toggleDialog()`, `setOpen()`を提供
  - 複数のダイアログで再利用可能な汎用hooks

- **useCharacterStats** (`features/home/hooks/useCharacterStats.ts`): キャラクターステータス計算
  - `useCharacterStats`: 基本ステータス計算（リーダー・フレンド・パッシブスキル適用）
  - `useNormalCharacterFinalStats`: 通常キャラクター最終ステータス（multiplier適用）
  - `useLRActionStats`: LRキャラクター行動後ステータス（条件含む計算）
  - `useSuperAttackCount`: super_attack_count取得
  - **使用例**: `TeamSlotStats`コンポーネントで55%/100%/行動後の表示に使用

### 主要コンポーネント構成

- **CharacterDetailDialog** (`components/CharacterDetailDialog/`): キャラクター詳細表示
  - 通常/極限/超極限のタブ切り替え（存在するタブのみ表示）
  - `original_effect`のみ表示、タブ外に`link_skills`と`categories`を配置
  - `\n`改行表示のため`white-space: pre-line`を使用
  - 固定幅600px、タブはセンター寄せ
  - 詳細ボタン: 左上に配置、クリック領域3rem×3remで視認性とアクセシビリティ向上

- **TeamSlotStats** (`features/home/components/TeamSlotStats/`): ステータス表示専用コンポーネント
  - 55%、100%、行動後（LR）の3行を表示
  - `useCharacterStats`等のhooksを使用してロジックを分離
  - TeamLayoutから分離してコードを簡潔化

- **CharacterList** (`features/home/components/CharacterList/`): キャラクター一覧表示
  - ドラッグ開始、禁止アイコン表示、詳細ダイアログ表示
  - マウスイベントベースのドラッグ&ドロップ実装

- **TeamLayout** (`features/home/components/TeamLayout/`): チーム編成レイアウト
  - TeamSlotComponent: 各スロットの表示とドラッグ&ドロップ
  - リーダー・フレンドスキル表示、HP合計表示
  - チーム内移動、キャラクター削除機能

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
// 優先順位に基づくスキル取得（forms[0]から取得）
const skills = character.forms[0].skills
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

**重要**: スキル参照時は必ず`character.forms[0].skills`からアクセスすること。`character.skills`は存在しません。

### テスト

- **動的スキル表示テスト**: `tests/skill-display-test.spec.js`
- **テスト内容**: 初期状態、キャラクター設置、削除時の動作検証
- **表示メッセージ変更**: 「リーダーキャラクターを設置してください」→「リーダーを設置してください」

## ステータス計算システム

### ATK/DEF/HP計算ロジック（55%/100%）

キャラクターの最終ステータス計算は以下の順序で実行：

1. **基本ステータス**: `potential_55` または `potential_100` の値を使用
2. **リーダー・フレンドスキル適用**:
   - **HP**: 倍率を加算後、`-1処理`を適用 → `floor(baseHP × (leader + friend - 1))`
   - **ATK/DEF**: 倍率を加算（-1処理なし） → `floor(baseATK × (leader + friend))`
3. **パッシブスキル stat_boosts 計算**:
   - `basic` 値で乗算（`basic.atk`, `basic.def`）
   - `basic` 以外の全ATK/DEF値を再帰的に収集・合計（**`conditions`と`defensive`を除外**）
   - **最終値 = basic適用後 + floor(basic適用後 × (その他ブースト合計 - 1))**
4. **DEF down効果**: `def_down`値を基本DEFから減算
5. **攻撃倍率適用**（ATKのみ）: 最後の`_extreme`キーの`ultra_super_attack.multiplier`

### 行動後計算ロジック（LRのみ）

LRキャラクターの行動後ATK/DEF計算：

1. **パッシブスキル計算**: `conditions`を含み、`defensive`のみ除外して計算
2. **LR専用計算式**:
   ```
   finalATK = (パッシブ適用後ATK × ultra_super_attack.multiplier) +
              (パッシブ適用後ATK × super_attack.multiplier × super_attack_count) +
              ((基本ATK × stat_boost.atk) × stat_boost.atk × super_attack_count)
   ```

### 再帰的ステータス収集

```typescript
// 55%/100%用（conditions, defensive除外）
const collectStatValues = (
  obj: Record<string, unknown>,
  statType: 'atk' | 'def' | 'def_down',
  excludeBasic = false
): number => {
  // `conditions`と`defensive`を除外
  // `ki_meter`, `conditional`, `turn_limited` など収集
}

// 行動後用（defensive除外、conditions含む）
const collectStatValuesWithConditions = (
  obj: Record<string, unknown>,
  statType: 'atk' | 'def' | 'def_down',
  excludeBasic = false
): number => {
  // `defensive`のみ除外、`conditions`を含む
}
```

### 計算式例

**ベジータ（post_extreme、potential_100、リーダー・フレンド）:**

```
【HP計算】
1. 基本HP: 22,538
2. リーダー・フレンド（加算 + -1処理）:
   totalMultiplier = 2.8 + 2.8 = 5.6
   finalHP = floor(22,538 × (5.6 - 1))
          = floor(22,538 × 4.6)
          = 103,674

【ATK計算】
1. 基本ATK: 21,780
2. リーダー・フレンド（加算、-1処理なし）:
   currentATK = floor(21,780 × (2.8 + 2.8))
              = floor(21,780 × 5.6)
              = 121,967
3. パッシブbasic適用:
   basicATK = floor(121,967 × 2.4) = 292,720
4. パッシブturn_start適用:
   その他ブースト = 1.3
   finalATK = 292,720 + floor(292,720 × (1.3 - 1))
           = 292,720 + 87,816
           = 380,536

【DEF計算】
1. 基本DEF: 12,981
2. リーダー・フレンド: floor(12,981 × 5.6) = 72,693
3. パッシブbasic: floor(72,693 × 2.4) = 174,463
4. パッシブturn_start: 174,463 + floor(174,463 × (1.6 - 1)) = 279,140
```

**ブロリー（super_extreme、potential_100）:**

```
1. 基本ATK: 23,480
2. リーダー・フレンド: floor(23,480 × (2.8 + 2.8)) = 131,488
3. Basic適用: floor(131,488 × 3.6) = 473,356
4. その他ブースト（conditions除外）: 3.0 + 3.6 + 1.26 = 7.86
5. 最終ATK: 473,356 + floor(473,356 × (7.86 - 1)) = 3,720,578
```

### -1処理の適用範囲

- **HP**: リーダー・フレンドスキルの加算後に`-1処理`を適用
- **ATK/DEF**: リーダー・フレンドスキルは`-1処理なし`、パッシブスキルのbasic以外のみ`-1処理`を適用
- **非適用**: basic値、攻撃倍率(multiplier)

### 条件分岐

- **55%/100%表示**: `conditions`と`defensive`と`_support`を除外
- **行動後表示（LRのみ）**: `conditions`を含み、`defensive`と`_support`を除外

### stat_boosts除外ルール

パッシブスキルの`stat_boosts`計算時、以下のキーは**除外**されます:

- **conditions**: 55%/100%計算時のみ除外（行動後は含む）
- **defensive**: 全計算で除外（防御時のみ発動する効果）
- **\_support**: 全計算で除外（味方サポート効果、自身には適用されない）
  - 例: `ally_support`, `extreme_ally_support` など

```typescript
// collectStatValues内での除外判定
if (key === 'conditions' || key === 'defensive' || key.endsWith('_support')) {
  continue
}
```

### ally_count計算システム

**ally_count**は、実際のチーム構成に基づいて動的にブースト値を計算します。

#### JSON構造

```json
"ally_count": {
  "condition": {
    "type": "attribute_or_category",
    "targets": ["超", "未来編"],
    "select": "most"
  },
  "atk": { "per_ally": 0.5, "max": 2.5 },
  "def": { "per_ally": 0.5, "max": 2.5 }
}
```

#### 計算ロジック

1. **体数カウント**:
   - `targets`配列の各要素に対してマッチするキャラクターをカウント
   - 属性（"超"/"極"）: `character.attribute.startsWith(target)`でチェック
   - カテゴリ（"未来編"等）: `character.categories?.includes(target)`でチェック
   - 自分自身は除外（`ts.position === slot.position`）

2. **最終値の選択**:
   - `select: "most"`: 属性カウントとカテゴリカウントの大きい方を使用
   - `Math.max(attributeCount, categoryCount)`

3. **ブースト計算**:
   - 計算式: `1.0 + (per_ally × 体数)`
   - 例: `per_ally: 0.5`、体数1の場合 → `1.0 + (0.5 × 1) = 1.5`

#### 実装箇所

`TeamLayout/index.tsx`の3つの計算セクション（55%/100%/行動後）に`countAlliesForAllyCount`関数を配置:

```typescript
const countAlliesForAllyCount = (condition: {
  type: string
  targets: string[]
  select: string
}): number => {
  if (condition.type === 'attribute_or_category') {
    let attributeCount = 0
    let categoryCount = 0

    teamSlots.forEach((ts) => {
      if (!ts.character || ts.position === slot.position) return

      condition.targets.forEach((target) => {
        if (target === '超' || target === '極') {
          if (ts.character.attribute.startsWith(target)) {
            attributeCount++
          }
        } else if (ts.character.categories?.includes(target)) {
          categoryCount++
        }
      })
    })

    if (condition.select === 'most') {
      return Math.max(attributeCount, categoryCount)
    }
  }
  return 0
}
```

#### collectStatValues統合

`parentKey`パラメータを追加し、`ally_count`を検出した場合に動的計算:

```typescript
const collectStatValues = (
  obj: Record<string, unknown>,
  statType: 'atk' | 'def' | 'def_down',
  excludeBasic = false,
  parentKey = ''
): number => {
  // ...
  if (parentKey === 'ally_count' && key === statType) {
    const perAlly = (value as Record<string, unknown>)?.per_ally
    if (typeof perAlly === 'number') {
      const condition = obj.condition as
        | {
            type: string
            targets: string[]
            select: string
          }
        | undefined
      if (condition) {
        const allyCount = countAlliesForAllyCount(condition)
        return 1.0 + perAlly * allyCount
      }
    }
  }
  // ...
}
```

### multiplier適用ロジック（55%/100%）

**重要**: 55%/100%のATK計算では、`ultra_super_attack.multiplier`が存在する場合に適用されます。

```typescript
// ultra_super_attackがある_extremeキーから攻撃倍率を取得
const getAttackMultiplier = () => {
  if (!slot.character?.forms[0]?.skills) return null

  const skills = slot.character.forms[0].skills
  const extremeKeys = Object.keys(skills).filter((key) =>
    key.endsWith('_extreme')
  )

  if (extremeKeys.length === 0) return null

  // 後ろから順にultra_super_attackがあるキーを探す
  for (let i = extremeKeys.length - 1; i >= 0; i--) {
    const extremeKey = extremeKeys[i]
    const skillSet = skills[extremeKey as keyof typeof skills]

    if (skillSet && skillSet.ultra_super_attack?.multiplier) {
      return skillSet.ultra_super_attack.multiplier
    }
  }

  return null
}
```

**ポイント**:

- 最後の`_extreme`キーから順に遡り、`ultra_super_attack.multiplier`が存在する最初のキーを使用
- `super_extreme`が全てnullの場合は、`post_extreme`のmultiplierを使用
- multiplierが見つからない場合は適用しない（DEFには常に適用しない）

## リーダースキル条件判定システム

### 条件マッチングロジック

リーダー・フレンドスキルの適用には**必ず条件判定が必要**です。`matchesLeaderSkillCondition`関数を使用：

```typescript
const matchesLeaderSkillCondition = (
  character: Character,
  condition: { type: string; target: string }
): boolean => {
  // 属性判定
  if (condition.type === 'attribute') {
    const target = condition.target
    // 「〜属性」（超/極なし）: 超〜 or 極〜 の両方が対象
    if (!target.startsWith('超') && !target.startsWith('極')) {
      const baseAttr = target.replace('属性', '')
      return (
        character.attribute === `超${baseAttr}` ||
        character.attribute === `極${baseAttr}`
      )
    }
    // 「超〜属性」「極〜属性」: 完全一致
    const targetAttr = target.replace('属性', '')
    return character.attribute === targetAttr
  }
  // キャラクター名判定（「または」「&」はOR、最初の一致のみ）
  if (condition.type === 'character') {
    // ... 名前マッチング処理
  }
  // カテゴリ判定
  if (condition.type === 'category') {
    if (!character.categories) return false
    return character.categories.includes(condition.target)
  }
  return false
}
```

### 重要な実装ルール

1. **条件チェック必須**: リーダー・フレンドスキルの倍率を加算する前に、必ず`matchesLeaderSkillCondition`で条件チェック
2. **最初の一致のみ適用**: 複数条件がある場合、最初にマッチした条件のみを適用して`break`
3. **属性判定の違い**:
   - `力属性` → `超力` OR `極力` にマッチ
   - `超力属性` → `超力` のみにマッチ
   - `極力属性` → `極力` のみにマッチ

### 実装例

```typescript
// リーダースキルの倍率取得（条件チェック付き）
if (leaderSkill?.conditions) {
  for (const condition of leaderSkill.conditions) {
    if (matchesLeaderSkillCondition(character, condition)) {
      if (condition.atk !== undefined) atkMultiplier += condition.atk
      if (condition.def !== undefined) defMultiplier += condition.def
      break // 最初に一致した条件のみ適用
    }
  }
}
```

### よくあるバグ

❌ **間違い**: 条件チェックなしで全条件を加算

```typescript
// これはバグ！条件に関係なく全て加算される
if (leaderSkill?.conditions) {
  for (const condition of leaderSkill.conditions) {
    if (condition.atk !== undefined) atkMultiplier += condition.atk
  }
}
```

✅ **正しい**: 条件チェックして最初の一致のみ適用

```typescript
if (leaderSkill?.conditions) {
  for (const condition of leaderSkill.conditions) {
    if (matchesLeaderSkillCondition(character, condition)) {
      if (condition.atk !== undefined) atkMultiplier += condition.atk
      break
    }
  }
}
```

### 実装箇所

- `src/features/home/hooks/useCharacterStats.ts`: hooks内の計算ロジック
- `src/features/home/components/TeamLayout/index.tsx`: 55%/100%/行動後の3箇所で同じロジックを使用

**注意**: TeamLayoutとuseCharacterStatsの両方に同じ条件判定ロジックがあります。将来的には共通化を検討してください。

## リバーシブルフォーム切り替えシステム

### 概要

一部のキャラクターは`reversible_forms`プロパティを持ち、2つのフォーム間で切り替え可能です（例: ベジータ&孫悟空 ⇔ 孫悟空&ベジータ）。

### データ構造

- **reversible_forms配列**: 2つのフォームデータを持つ（切り替え可能なキャラクター専用）
- **forms配列との違い**: `reversible_forms`を持つキャラクターは`forms`を持たない（相互排他）
- **各フォーム**: `form_id`, `form_name`, `display_name`, `image_url`, `stats`, `skills`

### 実装コンポーネント

#### SwitchIconコンポーネント

- **場所**: `@/components/icons/SwitchIcon.tsx`
- **アイコン**: Material Design `MdSwapHoriz`
- **用途**: フォーム切り替えボタンのアイコン

#### 判定関数

```typescript
// characterUtils.ts
export const isReversibleCharacter = (character: Character): boolean => {
  return !!(character.reversible_forms && character.reversible_forms.length > 1)
}

export const getImageUrl = (
  character: Character,
  formIndex: number = 0
): string => {
  if (character.reversible_forms && character.reversible_forms.length > 0) {
    const index = Math.min(formIndex, character.reversible_forms.length - 1)
    return character.reversible_forms[index].image_url || ''
  }
  // ... forms処理
}
```

#### 状態管理（useTeam）

```typescript
// reversibleフォームの現在のインデックスを管理 (characterId -> formIndex)
const [reversibleFormIndexes, setReversibleFormIndexes] = useState<
  Record<string, number>
>({})

// フォーム切り替え
const toggleReversibleForm = useCallback((characterId: string) => {
  setReversibleFormIndexes((prev) => {
    const currentIndex = prev[characterId] || 0
    return {
      ...prev,
      [characterId]: currentIndex === 0 ? 1 : 0,
    }
  })
}, [])

// インデックス取得
const getReversibleFormIndex = useCallback(
  (characterId: string) => {
    return reversibleFormIndexes[characterId] || 0
  },
  [reversibleFormIndexes]
)
```

### UI実装

#### CharacterList

- 右上に回転アイコンボタン配置
- クリックでフォーム切り替え（画像のみ変更）
- オレンジ色ホバーエフェクト

#### TeamLayout

- 同様に右上に回転アイコン配置
- **イベント競合解決**: スロットクリック（削除）との競合を回避
  - `onClickCapture`を使用してキャプチャフェーズで処理
  - `useRef`フラグ + `setTimeout(0)`で非同期リセット
  - `z-index: 100`で独立レイヤー化

### 画像切り替えメカニズム

```tsx
// key propで強制再レンダリング
const formIndex = isReversible ? getReversibleFormIndex(character.id) : 0

<Image
  src={getImageUrl(character, formIndex)}
  key={formIndex}  // formIndexが変わるとImageが再マウント
  ...
/>
```

### スタイリング

```scss
.switchButton {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100; // 他のボタンより上位
  pointer-events: auto; // 親のpointer-eventsに関係なく有効

  &:hover::before {
    background-color: var(--color-orange-500); // オレンジホバー
  }
}
```

### 重要な技術的ポイント

1. **イベント伝播制御**:
   - `onClickCapture`でキャプチャフェーズ処理
   - `e.preventDefault()` + `e.stopPropagation()`
   - 親要素のonClickをスキップするrefフラグ方式

2. **状態同期**:
   - キャラクターID単位で管理（position依存ではない）
   - CharacterListとTeamLayoutで同じ状態を共有

3. **型安全性**:
   - `reversible_forms`の存在チェック必須
   - formsとreversible_formsは相互排他

## 重要な技術的制約

- **任意のCSS プロパティ設定**: ベンダープレフィックス付きCSSプロパティは`setProperty()`/`removeProperty()`を使用（型安全）
- **useEffect警告**: イベントリスナークリーンアップでの依存配列警告は`eslint-disable-next-line react-hooks/exhaustive-deps`で無効化
- **ドラッグ状態管理**: React stateではなく`useRef`を使用して即座に状態を保存（非同期更新回避）
- **`any`型の使用禁止**: 型安全性を保つため、常に適切な型定義または型安全なAPIを使用
- **コードフォーマット**: 変更後は必ず`npm run format`でPrettierを実行
- **ステータス計算**:
  - 計算順序の厳守、Math.floor()による切り捨て処理
  - multiplier適用時の-1処理の有無に注意
  - `conditions`と`defensive`と`_support`の除外ルールを守る
  - `ally_count`は動的計算（`per_ally × 体数`）
- **リーダースキル条件判定**: 必ず`matchesLeaderSkillCondition`を使用し、条件チェックなしで倍率を加算しない
- **イベント競合解決**: ボタンクリックとスロットクリックの競合は`onClickCapture` + refフラグ + `setTimeout(0)`パターンを使用
- **キャラクターデータアクセス**: `characterUtils.ts`のヘルパー関数を使用（`getImageUrl`, `getCharacterSkills`等）
- **画像プロパティ**: `image_url`（単数形）を使用、`image_urls`は存在しない
