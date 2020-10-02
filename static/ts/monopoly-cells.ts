export const cellType = {
  0: {
    name: '取得可能土地',
    0: {
      name: '住宅地'
    },
    1: {
      name: '鉄道会社'
    },
    2: {
      name: 'パワーライン'
    }
  },
  1: {
    name: '金銭取得'
  },
  2: {
    name: 'カード',
    0: {
      name: '共同基金'
    },
    1: {
      name: 'チャンス'
    }
  },
  3: {
    name: '刑務所'
  },
  4: {
    name: 'GO TO JAIL'
  }
}

export const boardCellsData = [
  {
    name: 'GO',
    type: 1,
    get_money: 200
  },
  {
    name: '地中海通り',
    type: 0,
    color_group: 1,
    rent: [2, 10, 30, 90, 160, 250],
    price: 60,
    build_price: 50
  },
  {
    name: '共同基金',
    type: 2,
    // color_group: 9,
    card_group: 0
  },
  {
    name: 'バルティック通り',
    type: 0,
    color_group: 1,
    rent: [4, 20, 60, 180, 320, 450],
    price: 60,
    build_price: 50
  },
  {
    name: '所得税',
    type: 1,
    price: 200
  },
  {
    name: 'リーディング鉄道',
    type: 0,
    infra: 1,
    color_group: 0,
    is_power_company: false,
    rent: [25, 50, 100, 200],
    price: 200
  },
  {
    name: 'オリエンタル通り',
    type: 0,
    color_group: 2,
    rent: [6, 30, 90, 270, 400, 550],
    price: 100,
    build_price: 50
  },
  {
    name: 'チャンス',
    type: 2,
    // color_group: 10,
    card_group: 1
  },
  {
    name: 'バーモント通り',
    type: 0,
    color_group: 2,
    rent: [6, 30, 90, 270, 400, 550],
    price: 100,
    build_price: 50
  },
  {
    name: 'コネチカット通り',
    type: 0,
    color_group: 2,
    rent: [8, 40, 100, 300, 450, 600],
    price: 120,
    build_price: 50
  },
  {
    name: '刑務所',
    type: 3
  },
  {
    name: 'セントチャールズプレース',
    type: 0,
    color_group: 3,
    rent: [10, 50, 150, 450, 625, 750],
    price: 140,
    build_price: 100
  },
  {
    name: '電力会社',
    type: 0,
    infra: 2,
    color_group: 11,
    is_power_company: true,
    rent: [4, 10],
    price: 150
  },
  {
    name: 'ステーツ通り',
    type: 0,
    color_group: 3,
    rent: [10, 50, 150, 450, 625, 750],
    price: 140,
    build_price: 100
  },
  {
    name: 'バージニア通り',
    type: 0,
    color_group: 3,
    rent: [12, 60, 180, 500, 700, 900],
    price: 160,
    build_price: 100
  },
  {
    name: 'ペンシルバニア鉄道',
    type: 0,
    infra: 1,
    color_group: 0,
    is_power_company: false,
    rent: [25, 50, 100, 200],
    price: 200
  },
  {
    name: 'セントジェームズプレース',
    type: 0,
    color_group: 4,
    rent: [14, 70, 200, 550, 750, 950],
    price: 180,
    build_price: 100
  },
  {
    name: '共同基金',
    type: 2,
    // color_group: 9,
    card_group: 0
  },
  {
    name: 'テネシー通り',
    type: 0,
    color_group: 4,
    rent: [14, 70, 200, 550, 750, 950],
    price: 180,
    build_price: 100
  },
  {
    name: 'ニューヨーク通り',
    type: 0,
    color_group: 4,
    rent: [16, 80, 220, 600, 800, 1000],
    price: 200,
    build_price: 100
  },
  {
    name: 'フリーパーキング',
    type: 1,
    get_money: 0
  },
  {
    name: 'ケンタッキー通り',
    type: 0,
    color_group: 5,
    rent: [18, 90, 250, 700, 875, 1050],
    price: 220,
    build_price: 150
  },
  {
    name: 'チャンス',
    type: 2,
    // color_group: 10,
    card_group: 1
  },
  {
    name: 'インディアナ通り',
    type: 0,
    color_group: 5,
    rent: [18, 90, 250, 700, 875, 1050],
    price: 220,
    build_price: 150
  },
  {
    name: 'イリノイ通り',
    type: 0,
    color_group: 5,
    rent: [20, 100, 300, 750, 925, 1100],
    price: 240,
    build_price: 150
  },
  {
    name: 'B&O鉄道',
    type: 0,
    infra: 1,
    color_group: 0,
    is_power_company: false,
    rent: [25, 50, 100, 200],
    price: 200
  },
  {
    name: 'アトランティック通り',
    type: 0,
    color_group: 6,
    rent: [22, 110, 330, 800, 975, 1150],
    price: 260,
    build_price: 150
  },
  {
    name: 'ベントノール通り',
    type: 0,
    color_group: 6,
    rent: [22, 110, 330, 800, 975, 1150],
    price: 260,
    build_price: 150
  },
  {
    name: '水道会社',
    type: 0,
    infra: 2,
    color_group: 11,
    is_power_company: true,
    rent: [4, 10],
    price: 150
  },
  {
    name: 'マービンガーデン',
    type: 0,
    color_group: 6,
    rent: [24, 120, 360, 850, 1025, 1200],
    price: 280,
    build_price: 150
  },
  {
    name: 'GO TO JAIL',
    type: 4
    // color_group: 12
  },
  {
    name: 'パシフィック通り',
    type: 0,
    color_group: 7,
    rent: [26, 130, 390, 900, 1100, 1275],
    price: 300,
    build_price: 200
  },
  {
    name: 'ノースキャロライナ通り',
    type: 0,
    color_group: 7,
    rent: [26, 130, 390, 900, 1100, 1275],
    price: 300,
    build_price: 200
  },
  {
    name: '共同基金',
    type: 1,
    // color_group: 9,
    card_group: 0
  },
  {
    name: 'ペンシルバニア通り',
    type: 0,
    color_group: 7,
    rent: [28, 150, 450, 1000, 1200, 1400],
    price: 320,
    build_price: 200
  },
  {
    name: 'ショートライン鉄道',
    type: 0,
    infra: 1,
    color_group: 0,
    is_power_company: false,
    rent: [25, 50, 100, 200],
    price: 200
  },
  {
    name: 'チャンス',
    type: 1,
    // color_group: 10,
    card_group: 1
  },
  {
    name: 'パークプレース',
    type: 0,
    color_group: 8,
    rent: [35, 175, 500, 1100, 1300, 1500],
    price: 350,
    build_price: 200
  },
  {
    name: '物品税',
    type: 1,
    get_money: -100
  },
  {
    name: 'ボードウォーク',
    type: 0,
    color_group: 8,
    rent: [50, 200, 600, 1400, 1700, 2000],
    price: 400,
    build_price: 200
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
  12: '#000000'
}
