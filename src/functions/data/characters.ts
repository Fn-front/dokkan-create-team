import type { Character } from '../types/team'

export const sampleCharacters: Character[] = [
  {
    id: '1',
    name: '不滅の最凶戦士伝説の超サイヤ人ブロリー',
    imagePath:
      '/images/character/fumetsu-no-saikyou-senshi-densetsu-no-super-saiyan-broly.png',
    rarity: 5,
    type: 'PHY',
    cost: 58,
    skills: {
      pre_extreme: {
        leader_skill: {
          name: 'リーダースキル',
          conditions: [
            {
              type: 'attribute',
              target: '力属性',
              ki: 3,
              hp: 1.9,
              atk: 1.9,
              def: 1.9,
            },
          ],
          original_effect: '力属性の気力+3、HPとATKとDEF90%UP',
        },
        super_attack: {
          name: '必殺技',
          effect: '敵全体に極大ダメージを与える',
        },
        ultra_super_attack: {
          name: '超必殺技',
          effect: '相手に超極大ダメージを与える',
        },
        passive_skill: {
          name: 'パッシブスキル',
          effect:
            '必殺技発動時にATK80000UPし自身のDEF20000DOWN必殺技が追加発動',
        },
        active_skill: null,
      },
      post_extreme: {
        leader_skill: {
          name: 'リーダースキル',
          conditions: [
            {
              type: 'attribute',
              target: '力属性',
              ki: 4,
              hp: 2.2,
              atk: 2.2,
              def: 2.2,
            },
          ],
          original_effect: '力属性の気力+4、HPとATKとDEF120%UP',
        },
        super_attack: {
          name: '必殺技',
          effect: '1ターンATKとDEFが上昇し、敵全体に極大ダメージを与える',
        },
        ultra_super_attack: {
          name: '超必殺技',
          effect: '1ターンATKとDEFが上昇し、相手に超極大ダメージを与える',
        },
        passive_skill: {
          name: 'パッシブスキル',
          effect:
            '必殺技発動時に自身のATK120000UP、DEF50000DOWN、必殺技が追加発動、攻撃を受けた次のターン以降追加攻撃が全て会心になる',
        },
        active_skill: {
          name: 'アクティブスキル',
          effect:
            '1ターン自身のATKが大幅上昇し、敵全体に超絶特大ダメージを与える',
        },
      },
      super_extreme: {
        leader_skill: {
          name: 'リーダースキル',
          conditions: [
            {
              type: 'attribute',
              target: '力属性',
              ki: 4,
              hp: 2.2,
              atk: 2.2,
              def: 2.2,
            },
          ],
          original_effect: '力属性の気力+4、HPとATKとDEF120%UP',
        },
        super_attack: {
          name: '必殺技',
          effect: '1ターンATKとDEFが上昇し、敵全体に極大ダメージを与える',
        },
        ultra_super_attack: {
          name: '超必殺技',
          effect: '1ターンATKとDEFが上昇し、相手に超極大ダメージを与える',
        },
        passive_skill: {
          name: 'パッシブスキル',
          effect:
            '気力+3、ATK/DEF180%UP、気玉取得時の気力上昇量+1、必ず必殺技が追加発動、会心率/ダメージ軽減率26%UP、攻撃が必中する',
        },
        active_skill: null,
      },
    },
  },
  {
    id: '2',
    name: 'サンプルキャラクター2',
    imagePath: '/images/character/sample-character-2.png',
    rarity: 5,
    type: 'AGL',
    cost: 58,
  },
  {
    id: '3',
    name: 'サンプルキャラクター3',
    imagePath: '/images/character/sample-character-3.png',
    rarity: 4,
    type: 'TEQ',
    cost: 48,
  },
  {
    id: '4',
    name: 'サンプルキャラクター4',
    imagePath: '/images/character/sample-character-4.png',
    rarity: 5,
    type: 'INT',
    cost: 58,
  },
  {
    id: '5',
    name: 'サンプルキャラクター5',
    imagePath: '/images/character/sample-character-5.png',
    rarity: 5,
    type: 'STR',
    cost: 58,
  },
  {
    id: '6',
    name: 'サンプルキャラクター6',
    imagePath: '/images/character/sample-character-6.png',
    rarity: 4,
    type: 'PHY',
    cost: 48,
  },
  {
    id: '7',
    name: 'サンプルキャラクター7',
    imagePath: '/images/character/sample-character-7.png',
    rarity: 5,
    type: 'AGL',
    cost: 58,
  },
]
