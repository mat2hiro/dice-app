export enum CellPositions {
  JAIL = 10
}

export enum CellTypes {
  HOUSE = 0,
  TAX = 1,
  CARD = 2,
  JAIL = 3,
  ARREST = 4,
  GO = 5,
  FREE = 6
}

export enum InfraTypes {
  RAILROAD = 1,
  UTILITY = 2
}

export enum CardTypes {
  COMMUNITY_CHEST = 0,
  CHANCE = 1
}

// export const cellType = {
//   0: {
//     name: '取得可能土地',
//     0: {
//       name: '住宅地'
//     },
//     1: {
//       name: '鉄道会社'
//     },
//     2: {
//       name: 'パワーライン'
//     }
//   },
//   1: {
//     name: '金銭取得'
//   },
//   2: {
//     name: 'カード',
//     0: {
//       name: '共同基金'
//     },
//     1: {
//       name: 'チャンス'
//     }
//   },
//   3: {
//     name: '刑務所'
//   },
//   4: {
//     name: 'GO TO JAIL'
//   }
// }

export const boardCellsData = [
  {
    name: 'GO',
    type: CellTypes.GO,
    getMoney: 200,
    colorGroup: 14
  },
  {
    name: '地中海通り',
    type: CellTypes.HOUSE,
    colorGroup: 1,
    rent: [2, 10, 30, 90, 160, 250],
    price: 60,
    buildPrice: 50
  },
  {
    name: '共同基金',
    type: CellTypes.CARD,
    colorGroup: 9,
    cardGroup: CardTypes.COMMUNITY_CHEST
  },
  {
    name: 'バルティック通り',
    type: CellTypes.HOUSE,
    colorGroup: 1,
    rent: [4, 20, 60, 180, 320, 450],
    price: 60,
    buildPrice: 50
  },
  {
    name: '所得税',
    type: CellTypes.TAX,
    price: 200,
    colorGroup: 13
  },
  {
    name: 'リーディング鉄道',
    type: CellTypes.HOUSE,
    infra: InfraTypes.RAILROAD,
    colorGroup: 0,
    rent: [25, 50, 100, 200],
    price: 200
  },
  {
    name: 'オリエンタル通り',
    type: CellTypes.HOUSE,
    colorGroup: 2,
    rent: [6, 30, 90, 270, 400, 550],
    price: 100,
    buildPrice: 50
  },
  {
    name: 'チャンス',
    type: CellTypes.CARD,
    colorGroup: 10,
    cardGroup: CardTypes.CHANCE
  },
  {
    name: 'バーモント通り',
    type: CellTypes.HOUSE,
    colorGroup: 2,
    rent: [6, 30, 90, 270, 400, 550],
    price: 100,
    buildPrice: 50
  },
  {
    name: 'コネチカット通り',
    type: CellTypes.HOUSE,
    colorGroup: 2,
    rent: [8, 40, 100, 300, 450, 600],
    price: 120,
    buildPrice: 50
  },
  {
    name: '刑務所',
    type: CellTypes.JAIL,
    colorGroup: 12
  },
  {
    name: 'セントチャールズプレース',
    type: CellTypes.HOUSE,
    colorGroup: 3,
    rent: [10, 50, 150, 450, 625, 750],
    price: 140,
    buildPrice: 100
  },
  {
    name: '電力会社',
    type: CellTypes.HOUSE,
    infra: InfraTypes.UTILITY,
    colorGroup: 11,
    rent: [4, 10],
    price: 150
  },
  {
    name: 'ステーツ通り',
    type: CellTypes.HOUSE,
    colorGroup: 3,
    rent: [10, 50, 150, 450, 625, 750],
    price: 140,
    buildPrice: 100
  },
  {
    name: 'バージニア通り',
    type: CellTypes.HOUSE,
    colorGroup: 3,
    rent: [12, 60, 180, 500, 700, 900],
    price: 160,
    buildPrice: 100
  },
  {
    name: 'ペンシルバニア鉄道',
    type: CellTypes.HOUSE,
    infra: InfraTypes.RAILROAD,
    colorGroup: 0,
    rent: [25, 50, 100, 200],
    price: 200
  },
  {
    name: 'セントジェームズプレース',
    type: CellTypes.HOUSE,
    colorGroup: 4,
    rent: [14, 70, 200, 550, 750, 950],
    price: 180,
    buildPrice: 100
  },
  {
    name: '共同基金',
    type: CellTypes.CARD,
    colorGroup: 9,
    cardGroup: CardTypes.COMMUNITY_CHEST
  },
  {
    name: 'テネシー通り',
    type: CellTypes.HOUSE,
    colorGroup: 4,
    rent: [14, 70, 200, 550, 750, 950],
    price: 180,
    buildPrice: 100
  },
  {
    name: 'ニューヨーク通り',
    type: CellTypes.HOUSE,
    colorGroup: 4,
    rent: [16, 80, 220, 600, 800, 1000],
    price: 200,
    buildPrice: 100
  },
  {
    name: 'フリーパーキング',
    type: CellTypes.FREE,
    getMoney: 0,
    colorGroup: 14
  },
  {
    name: 'ケンタッキー通り',
    type: CellTypes.HOUSE,
    colorGroup: 5,
    rent: [18, 90, 250, 700, 875, 1050],
    price: 220,
    buildPrice: 150
  },
  {
    name: 'チャンス',
    type: CellTypes.CARD,
    colorGroup: 10,
    cardGroup: CardTypes.CHANCE
  },
  {
    name: 'インディアナ通り',
    type: CellTypes.HOUSE,
    colorGroup: 5,
    rent: [18, 90, 250, 700, 875, 1050],
    price: 220,
    buildPrice: 150
  },
  {
    name: 'イリノイ通り',
    type: CellTypes.HOUSE,
    colorGroup: 5,
    rent: [20, 100, 300, 750, 925, 1100],
    price: 240,
    buildPrice: 150
  },
  {
    name: 'B&O鉄道',
    type: CellTypes.HOUSE,
    infra: InfraTypes.RAILROAD,
    colorGroup: 0,
    rent: [25, 50, 100, 200],
    price: 200
  },
  {
    name: 'アトランティック通り',
    type: CellTypes.HOUSE,
    colorGroup: 6,
    rent: [22, 110, 330, 800, 975, 1150],
    price: 260,
    buildPrice: 150
  },
  {
    name: 'ベントノール通り',
    type: CellTypes.HOUSE,
    colorGroup: 6,
    rent: [22, 110, 330, 800, 975, 1150],
    price: 260,
    buildPrice: 150
  },
  {
    name: '水道会社',
    type: CellTypes.HOUSE,
    infra: InfraTypes.UTILITY,
    colorGroup: 11,
    rent: [4, 10],
    price: 150
  },
  {
    name: 'マービンガーデン',
    type: CellTypes.HOUSE,
    colorGroup: 6,
    rent: [24, 120, 360, 850, 1025, 1200],
    price: 280,
    buildPrice: 150
  },
  {
    name: 'GO TO JAIL',
    type: CellTypes.ARREST,
    colorGroup: 12
  },
  {
    name: 'パシフィック通り',
    type: CellTypes.HOUSE,
    colorGroup: 7,
    rent: [26, 130, 390, 900, 1100, 1275],
    price: 300,
    buildPrice: 200
  },
  {
    name: 'ノースキャロライナ通り',
    type: CellTypes.HOUSE,
    colorGroup: 7,
    rent: [26, 130, 390, 900, 1100, 1275],
    price: 300,
    buildPrice: 200
  },
  {
    name: '共同基金',
    type: CellTypes.CARD,
    colorGroup: 9,
    cardGroup: CardTypes.COMMUNITY_CHEST
  },
  {
    name: 'ペンシルバニア通り',
    type: CellTypes.HOUSE,
    colorGroup: 7,
    rent: [28, 150, 450, 1000, 1200, 1400],
    price: 320,
    buildPrice: 200
  },
  {
    name: 'ショートライン鉄道',
    type: CellTypes.HOUSE,
    infra: InfraTypes.RAILROAD,
    colorGroup: 0,
    rent: [25, 50, 100, 200],
    price: 200
  },
  {
    name: 'チャンス',
    type: CellTypes.CARD,
    colorGroup: 10,
    cardGroup: CardTypes.CHANCE
  },
  {
    name: 'パークプレース',
    type: CellTypes.HOUSE,
    colorGroup: 8,
    rent: [35, 175, 500, 1100, 1300, 1500],
    price: 350,
    buildPrice: 200
  },
  {
    name: '物品税',
    type: CellTypes.TAX,
    price: 75,
    colorGroup: 13
  },
  {
    name: 'ボードウォーク',
    type: CellTypes.HOUSE,
    colorGroup: 8,
    rent: [50, 200, 600, 1400, 1700, 2000],
    price: 400,
    buildPrice: 200
  }
]

export const cellColorsData = {
  0: '#cccccc',
  1: '#b45f06',
  2: '#00eeee',
  3: '#ee00ee',
  4: '#ee9900',
  5: '#ee0000',
  6: '#eeee00',
  7: '#00ee00',
  8: '#7ba7d7',
  9: '#ead1dc',
  10: '#c9daf8',
  11: '#e0d0a0',
  12: '#000000',
  13: '#fafdf6',
  14: '#ffffff'
}
