# アーキテクチャ

## プロジェクト構成

ドッカンバトルチーム作成ツール用のNext.js (App Router) + TypeScript プロジェクト。**Package by Feature**思想を採用。

## ディレクトリ構造

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
│       │       ├── style.module.scss
│       │       └── hooks/         # コンポーネント専用hooks
│       │           └── [hookName].tsx
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

### コンポーネント構造例（home機能）

```
features/home/
├── components/
│   ├── TeamLayout/
│   │   ├── index.tsx               (114行)
│   │   ├── style.module.scss
│   │   └── hooks/
│   │       └── useTeamDragDrop.tsx
│   ├── TeamSlot/
│   │   ├── index.tsx               (318行)
│   │   ├── style.module.scss
│   │   └── hooks/
│   │       └── useTeamSlotStats.tsx
│   ├── TeamSkillDisplay/
│   │   ├── index.tsx               (147行)
│   │   └── style.module.scss
│   ├── CharacterList/
│   │   ├── index.tsx               (133行)
│   │   ├── style.module.scss
│   │   └── hooks/
│   │       └── useCharacterDragDrop.tsx
│   ├── CharacterCard/
│   │   ├── index.tsx               (102行)
│   │   └── style.module.scss
│   └── TeamSlotStats/
│       ├── index.tsx
│       └── style.module.scss
```

## 設計原則

1. **Feature First**: 機能ごとにディレクトリを分割、関連するコードを近くに配置
2. **Flat Component Structure**: componentsディレクトリ配下はフラット構造（components/components/は作らない）
3. **Component Folder Structure**: 各コンポーネントは独自のフォルダを持ち、`index.tsx`と`style.module.scss`を含む
4. **Hooks Separation**: 複雑なロジックはカスタムhooksに分離（コンポーネント直下のhooks/に配置）
5. **CSS Modules**: `style.module.scss`の命名規則（単数形）、SCSSで`@use`使用（mixinsファイルがない場合は不要）
6. **Type Safety**: TypeScript、共通型はfunctions/types/に配置
7. **Single Responsibility**: 各コンポーネント・hooksは単一の責任を持つ

## コンポーネント責任

### TeamLayout

- チーム全体のレイアウト管理
- TeamSkillDisplayとTeamSlotComponentの配置
- ドラッグ&ドロップのイベントハンドラー管理

### TeamSlot

- 各スロットの表示（キャラクター画像、バッジ、ボタン）
- 気力メーターの表示
- ステータス表示（useTeamSlotStats使用）
- フォーム切り替えボタンのイベント処理

### TeamSkillDisplay

- リーダースキル・フレンドスキルの表示
- チーム全体のHP合計表示

### CharacterList

- キャラクター一覧のレイアウト管理
- 配置可否判定とフィルタリング
- 詳細ダイアログの表示制御

### CharacterCard

- キャラクターカードの表示
- 詳細・切り替え・変身ボタンの配置
- ドラッグ開始のイベント処理

## フォント・スタイリング

- **フォント**: Noto Sans JP (next/font/google使用)、font-size: 62.5%ベース（1rem = 10px）で14pxベース
- **リセットCSS**: The New CSS Reset使用
- **CSS管理**: layout.tsxで一元管理（@importではなくimport文）
- **スタイル**: SCSS + CSS Modules、プロパティ順序はstylelint-config-recess-orderで管理
- **マージン**: 全て上方向（margin-top）に統一

## カラー管理

- 全ての色はCSSカスタムプロパティとして`src/styles/globals.css`で一元管理
- 色の値はカラーコード（#ffffff）またはrgba()で記述
- コンポーネントでは`var(--color-*)`形式で参照

## 重要な技術的制約

- **任意のCSSプロパティ設定**: ベンダープレフィックス付きCSSプロパティは`setProperty()`/`removeProperty()`を使用（型安全）
- **useEffect警告**: イベントリスナークリーンアップでの依存配列警告は`eslint-disable-next-line react-hooks/exhaustive-deps`で無効化
- **ドラッグ状態管理**: React stateではなく`useRef`を使用して即座に状態を保存（非同期更新回避）
- **`any`型の使用禁止**: 型安全性を保つため、常に適切な型定義または型安全なAPIを使用
- **コードフォーマット**: 変更後は必ず`npm run format`でPrettierを実行
