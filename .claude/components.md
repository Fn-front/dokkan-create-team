# コンポーネント設計

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

## 主要コンポーネント

### CharacterDetailDialog

**場所**: `components/CharacterDetailDialog/`

**責任**: キャラクター詳細表示

**特徴**:

- 通常/極限/超極限のタブ切り替え（存在するタブのみ表示）
- `original_effect`のみ表示、タブ外に`link_skills`と`categories`を配置
- `\n`改行表示のため`white-space: pre-line`を使用
- 固定幅600px、タブはセンター寄せ
- 詳細ボタン: 左上に配置、クリック領域3rem×3remで視認性とアクセシビリティ向上

### TeamSlotStats

**場所**: `features/home/components/TeamSlotStats/`

**責任**: ステータス表示専用コンポーネント

**特徴**:

- 55%、100%、行動後（LR）の3行を表示
- `useCharacterStats`等のhooksを使用してロジックを分離
- TeamLayoutから分離してコードを簡潔化

### CharacterList

**場所**: `features/home/components/CharacterList/`

**責任**: キャラクター一覧表示

**特徴**:

- ドラッグ開始、禁止アイコン表示、詳細ダイアログ表示
- マウスイベントベースのドラッグ&ドロップ実装
- `useCharacterDragDrop`フックでドラッグロジックを分離

### CharacterCard

**場所**: `features/home/components/CharacterCard/`

**責任**: 個別キャラクターカード表示

**特徴**:

- キャラクター画像、名前、詳細ボタン、切り替え/変身ボタン
- 配置不可の場合は視覚的に無効化（グレーアウト）
- ドラッグ開始イベントの処理

### TeamLayout

**場所**: `features/home/components/TeamLayout/`

**責任**: チーム編成レイアウト

**特徴**:

- TeamSlotComponent: 各スロットの表示とドラッグ&ドロップ
- リーダー・フレンドスキル表示、HP合計表示
- チーム内移動、キャラクター削除機能
- `useTeamDragDrop`フックでドラッグロジックを分離

### TeamSlot

**場所**: `features/home/components/TeamSlot/`

**責任**: 個別チームスロット表示

**特徴**:

- キャラクター画像、気力メーター、バッジ（LEADER/FRIEND）
- フォーム切り替えボタン（回転・変身）
- ステータス表示（55%/100%/行動後）
- `useTeamSlotStats`フックでステータス計算を分離

### TeamSkillDisplay

**場所**: `features/home/components/TeamSkillDisplay/`

**責任**: スキル情報表示

**特徴**:

- リーダースキル・フレンドスキルの動的表示
- チーム全体のHP合計表示
- 未設置時のプレースホルダーメッセージ

## アイコン管理

- **react-icons使用**: Material Design等のアイコンライブラリ
- **管理場所**: `@/components/icons/` ディレクトリ
- **エクスポート**: `index.ts`でまとめて管理
- **例**:
  - `ProhibitIcon` - MdBlockアイコンをラップ（配置禁止）
  - `SwitchIcon` - MdSwapHorizアイコンをラップ（フォーム切り替え）
  - `TransformIcon` - MdAutorenewアイコンをラップ（変身）

## データフロー

### キャラクター配置フロー

```
Character → CharacterList → HomePage → useTeam → TeamLayout
                ↓              ↓         ↓         ↓
            onDragStart → onCharacterDrop → addCharacterToSlot → 表示更新
```

### チーム内移動フロー

```
TeamSlot → TeamLayout → HomePage → useTeam → TeamLayout
            ↓            ↓         ↓         ↓
        onMouseDown → onCharacterMove → moveCharacter → 表示更新
```

## 実装ルール

- featuresのtypesはfunctions/types/に配置
- CSS ModulesはSCSSで`@use`を使用（mixinsファイルが存在する場合のみ）
- 各featureのcomponentsディレクトリは.gitkeepでデフォルト作成
- functionはアロー関数で実装
- memo化を行うこと（依存配列を慎重に管理）
- 処理の修正をした場合は必ずmemo化の依存配列も確認すること
- **className結合**: `clsx`ライブラリを使用、`cn()`共通関数(`src/lib/utils.ts`)でラップ
- **アイコンは今後react-iconsを使用**: `@/components/icons`で管理
