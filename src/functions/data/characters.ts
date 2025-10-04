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
    link_skills: [
      '戦闘民族サイヤ人',
      '超サイヤ人',
      'サイヤ人の血',
      'バーサーカー',
      '臨戦態勢',
      '超激戦',
      '伝説の力',
    ],
    categories: [
      '復活戦士',
      '劇場版BOSS',
      '純粋サイヤ人',
      'フルパワー',
      'ターゲット孫悟空',
      '怒り爆発',
      'リベンジ',
      '悪逆非道',
      '惑星破壊',
      '伝説の存在',
      '超サイヤ人を超えた力',
      '制御不能の力',
    ],
  },
  {
    id: '2',
    name: '無敵を誇るサイヤ人の頂・超サイヤ人4ベジータ',
    imagePath: '/images/character/sample-character-2.png',
    rarity: 5,
    type: 'PHY',
    cost: 77,
    stats: {
      max_level: {
        HP: 17538,
        ATK: 16380,
        DEF: 8381,
      },
      potential_55: {
        HP: 19538,
        ATK: 18380,
        DEF: 10381,
      },
      potential_100: {
        HP: 22538,
        ATK: 21780,
        DEF: 12981,
      },
    },
    skills: {
      pre_extreme: {
        leader_skill: {
          name: 'リーダースキル',
          conditions: [
            {
              type: 'category',
              target: 'ベジータの系譜',
              ki: 3,
              hp: 2.3,
              atk: 2.7,
              def: 2.7,
            },
            {
              type: 'attribute',
              target: '超力属性',
              ki: 3,
              hp: 2.2,
              atk: 2.2,
              def: 2.2,
            },
          ],
          original_effect:
            '「ベジータの系譜」カテゴリの 気力+3、HP130%UP、ATKとDEF170%UP、 または超力属性の気力+3、HPとATKとDEF120%UP',
        },
        super_attack: {
          name: '必殺技',
          original_effect:
            '1ターンATKが超大幅上昇し、相手に極大ダメージを与える',
        },
        ultra_super_attack: {
          name: '超必殺技',
          original_effect:
            '1ターンATKとDEFが超大幅上昇し、相手に超極大ダメージを与える',
        },
        passive_skill: {
          name: 'パッシブスキル',
          original_effect:
            '自身のDEF80%UP、ターン開始毎にATK20%UP(最大80%)&虹気玉か力気玉取得で気力が上がるたびに更に気力+2&敵必殺技を中確率で無効化し超絶大な威力で反撃',
        },
        active_skill: {
          name: 'アクティブスキル',
          original_effect:
            '条件：バトル開始から4ターン目以降に発動可能(1回のみ)効果：一時的にATKが超大幅上昇し、相手に究極ダメージを与える',
        },
      },
      post_extreme: {
        leader_skill: {
          name: 'リーダースキル',
          conditions: [
            {
              type: 'category',
              target: 'ベジータの系譜',
              ki: 3,
              hp: 2.8,
              atk: 2.8,
              def: 2.8,
            },
            {
              type: 'attribute',
              target: '超力属性',
              ki: 3,
              hp: 2.3,
              atk: 2.3,
              def: 2.3,
            },
          ],
          original_effect:
            '「ベジータの系譜」カテゴリの気力+3、HPとATKとDEF180%UP、または超力属性の気力+3、HPとATKとDEF130%UP',
        },
        super_attack: {
          name: '必殺技',
          original_effect:
            '1ターンATKが超大幅上昇、DEFが上昇し、相手に極大ダメージを与える',
        },
        ultra_super_attack: {
          name: '超必殺技',
          original_effect:
            '1ターンATKとDEFが超大幅上昇し、相手に超極大ダメージを与え、DEFを大幅低下させる',
        },
        passive_skill: {
          name: 'パッシブスキル',
          original_effect:
            '自身のATKとDEF140%UP、ターン開始毎にATK10%UP(最大30%)、DEF20%UP(最大60%)虹気玉か力気玉取得で気力が上がるたびに更に気力+2力気玉以外の属性気玉取得で気力が上がるたびに更に気力+1敵必殺技を中確率で無効化し超絶大な威力で反撃敵が2体以上のとき、アクティブスキル発動時または気力メーター24で1度だけ攻撃した敵の行動をそのターンのみ1回無効化する',
        },
        active_skill: {
          name: 'アクティブスキル',
          original_effect:
            '条件：バトル開始から4ターン目以降に発動可能(1回のみ)効果：一時的にATKが超大幅上昇し、相手に究極ダメージを与える',
        },
      },
    },
    link_skills: [
      '超サイヤ人',
      'サイヤ人の誇り',
      'GT',
      '臨戦態勢',
      '超激戦',
      'サイヤの咆哮',
      '伝説の力',
    ],
    categories: [
      'ベジータの系譜',
      '純粋サイヤ人',
      '邪悪龍編',
      '好敵手',
      '救世主',
      '大猿パワー',
      '天才戦士',
      'GT HERO',
      '命運をかけた闘い',
      '超サイヤ人を超えた力',
      '親子の絆',
      '地球を守りし英雄',
      '継承する者',
    ],
  },
  {
    id: '3',
    name: '破壊による世界調和・ビルス＆ウイス',
    imagePath: '/images/character/sample-character-3.png',
    rarity: 5,
    type: 'PHY',
    cost: 77,
    stats: {
      max_level: {
        HP: 16688,
        ATK: 14425,
        DEF: 11250,
      },
      potential_55: {
        HP: 18688,
        ATK: 16425,
        DEF: 13125,
      },
      potential_100: {
        HP: 21688,
        ATK: 19825,
        DEF: 15850,
      },
    },
    skills: {
      pre_extreme: {
        leader_skill: {
          name: 'リーダースキル',
          conditions: [
            {
              type: 'attribute',
              target: '超力属性',
              ki: 4,
              hp: 2.2,
              atk: 2.2,
              def: 2.2,
            },
            {
              type: 'attribute',
              target: '極力属性',
              ki: 3,
              hp: 1.9,
              atk: 1.9,
              def: 1.9,
            },
          ],
          original_effect:
            '超力属性の気力+4、HPとATKとDEF120%UP＆極力属性の気力+3、HPとATKとDEF90%UP',
        },
        super_attack: {
          name: '必殺技',
          original_effect:
            '1ターンATKとDEFが上昇し、相手に極大ダメージを与え、HPを10%回復',
        },
        ultra_super_attack: {
          name: '超必殺技',
          original_effect:
            '1ターンATKとDEFが大幅上昇し、相手に超極大ダメージを与え、HPを15%回復',
        },
        passive_skill: {
          name: 'パッシブスキル',
          original_effect:
            '自身の気力+7、ATKとDEF150%UP&中確率で会心が発動する攻撃を受けてから7ターンの間ATKとDEF70%UP、高確率で敵の攻撃を回避する&攻撃時に自身がHP70%以下の場合、必殺技を追加で発動する',
        },
        active_skill: null,
      },
      post_extreme: {
        leader_skill: {
          name: 'リーダースキル',
          conditions: [
            {
              type: 'attribute',
              target: '超力属性',
              ki: 4,
              hp: 2.0,
              atk: 2.0,
              def: 2.0,
            },
            {
              type: 'attribute',
              target: '極力属性',
              ki: 2,
              hp: 1.7,
              atk: 1.7,
              def: 1.7,
            },
          ],
          original_effect:
            '超力属性の気力+4、HPとATKとDEF100%UP＆極力属性の気力+2、HPとATKとDEF70%UP',
        },
        super_attack: {
          name: '必殺技',
          original_effect: '相手に極大ダメージを与え、HPを7%回復',
        },
        ultra_super_attack: {
          name: '超必殺技',
          original_effect: '相手に超極大ダメージを与え、HPを12%回復',
        },
        passive_skill: {
          name: 'パッシブスキル',
          original_effect:
            '自身のATK80%UP攻撃を受けてから5ターンの間ATKとDEF60%UP',
        },
        active_skill: null,
      },
      super_extreme: {
        leader_skill: {
          name: 'リーダースキル',
          conditions: [
            {
              type: 'attribute',
              target: '超力属性',
              ki: 4,
              hp: 2.2,
              atk: 2.2,
              def: 2.2,
            },
            {
              type: 'attribute',
              target: '極力属性',
              ki: 3,
              hp: 1.9,
              atk: 1.9,
              def: 1.9,
            },
          ],
          original_effect:
            '超力属性の気力+4、HPとATKとDEF120%UP＆極力属性の気力+3、HPとATKとDEF90%UP',
        },
        super_attack: {
          name: '必殺技',
          original_effect:
            '1ターンATKとDEFが上昇し、相手に極大ダメージを与え、HPを10%回復',
        },
        ultra_super_attack: {
          name: '超必殺技',
          original_effect:
            '1ターンATKとDEFが大幅上昇し、相手に超極大ダメージを与え、HPを15%回復',
        },
        passive_skill: {
          name: 'パッシブスキル',
          original_effect:
            '自身の気力+7、ATKとDEF150%UP&中確率で会心が発動する攻撃を受けてから7ターンの間ATKとDEF70%UP、高確率で敵の攻撃を回避する&攻撃時に自身がHP70%以下の場合、必殺技を追加で発動する',
        },
        active_skill: null,
      },
    },
    link_skills: [
      '無邪気',
      '天才',
      '驚異的なスピード',
      'グルメ',
      '神の次元',
      '超激戦',
      '伝説の力',
    ],
    categories: [
      '神次元',
      '劇場版BOSS',
      'コンビネーション',
      '兄弟の絆',
      '師弟の絆',
      '宇宙をわたる戦士',
    ],
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
