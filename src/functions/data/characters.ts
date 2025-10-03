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
    stats: {
      max_level: {
        HP: 12013,
        ATK: 18080,
        DEF: 9019,
      },
      potential_55: {
        HP: 14013,
        ATK: 20080,
        DEF: 11019,
      },
      potential_100: {
        HP: 17013,
        ATK: 23480,
        DEF: 13619,
      },
    },
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
          stat_boosts: {
            basic: {
              atk: 80000,
              def_down: 20000,
            },
          },
          original_effect:
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
          multiplier: 4.2,
        },
        passive_skill: {
          name: 'パッシブスキル',
          stat_boosts: {
            basic: {
              atk: 1.5,
              def: 1.5,
              ki: 5,
            },
            super_attack: {
              atk: 1.5,
              def: 1.5,
            },
          },
          original_effect:
            '自身のATKとDEF50%UP必殺技発動時に更にATKとDEF50%UP必殺技が追加発動「純粋サイヤ人」または「混血サイヤ人」カテゴリの敵がいるとき自身の気力+5「孫悟空の系譜」カテゴリの敵がいるとき全属性に効果抜群で攻撃し、必ず攻撃が敵に命中する',
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
          multiplier: 4.2,
        },
        passive_skill: {
          name: 'パッシブスキル',
          stat_boosts: {
            basic: {
              atk: 2.8,
              def: 2.8,
              ki: 3,
            },
            ki_meter: {
              12: {
                atk: 3.0,
                def: 3.0,
              },
              18: {
                atk: 3.6,
              },
            },
            conditional: {
              enemy: {
                atk: 1.26,
                def: 3.6,
              },
            },
            turn_limited: {
              first_3: {
                def: 3.0,
              },
            },
          },
          original_effect:
            '基本効果 \n・気力+3、ATK/DEF180%UP\n・気玉取得時の気力上昇量+1\n・必ず必殺技が追加発動\n・会心率/ダメージ軽減率26%UP\n・攻撃が必中する 気力メーター12以上で攻撃時 \n・ATK/DEF200%UP 気力メーター18以上で攻撃時 \n・ATK260%UP 超系の敵がいるとき、または自身の他に攻撃参加中の極系の味方がいるとき \n・気力+3\n・会心率/ダメージ軽減率26%UP\n・2ターンの間、極系の味方全員のATK/DEF26%UP\n・攻撃を受けるときにDEF260%UP 「純粋サイヤ人」または「混血サイヤ人」または「孫悟空の系譜」カテゴリの敵がいるとき \n・バトル中、気力+6、必ず会心が発動 登場から3ターンの間 \n・攻撃参加中の味方全員が「怒り爆発」または「劇場版BOSS」カテゴリのとき攻撃するまでDEF200%UP、ダメージ軽減率26%UP',
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
