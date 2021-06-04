import { CellPositions, InfraTypes } from './monopoly-cells'

export enum CardDetailTypes {
  CASH = 0,
  MOVETO = 1,
  MOVEBY = 2,
  INFRA = 3,
  REPAIR = 4,
  JAIL = 5,
  RELEASE = 6
}

export const communityChestData = [
  {
    title: '銀行より$200受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 200
  },
  {
    title: '生命保険満期により$100受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 100
  },
  {
    title: 'クリスマス基金の満期により$100受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 100
  },
  {
    title: '遺産$100受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 100
  },
  {
    title: 'オペラのチケット代$50を各人から徴収できる',
    type: CardDetailTypes.CASH,
    from: 'all',
    cash: 50
  },
  {
    title: '株式売却により$45受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 45
  },
  {
    title: '礼金として$25受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 25
  },
  {
    title: '所得税$20戻る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 20
  },
  {
    title: 'ビューティーコンテスト準優勝、$10受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 10
  },
  {
    title: '治療費$50支払う',
    type: CardDetailTypes.CASH,
    to: '',
    cash: 50
  },
  {
    title: '出産費$100支払う',
    type: CardDetailTypes.CASH,
    to: '',
    cash: 100
  },
  {
    title: '教育費として$150支払う',
    type: CardDetailTypes.CASH,
    to: '',
    cash: 150
  },
  {
    title: '道路の修理費として家1軒あたり$40 、ホテル1軒あたり$115支払う',
    type: CardDetailTypes.REPAIR,
    house: 40,
    hotel: 115
  },
  {
    title: 'GO のマスへ進む',
    type: CardDetailTypes.MOVETO,
    cell: CellPositions.GO
  },
  {
    title: '刑務所から釈放',
    type: CardDetailTypes.RELEASE
  },
  {
    title: '刑務所へ行く',
    type: CardDetailTypes.JAIL
  }
]

export const chanceData = [
  {
    title: 'セントチャールズプレースへ進む',
    type: CardDetailTypes.MOVETO,
    cell: CellPositions.CHARLES
  },
  {
    title: 'イリノイ通りへ進む',
    type: CardDetailTypes.MOVETO,
    cell: CellPositions.ILLINOIS
  },
  {
    title: 'ボードウォークへ進む',
    type: CardDetailTypes.MOVETO,
    cell: CellPositions.BOARDWALK
  },
  {
    title: 'リーディング鉄道へ進む',
    type: CardDetailTypes.MOVETO,
    cell: CellPositions.READING
  },
  {
    title: '次の鉄道まで進み、通常の2倍のレンタル料を支払う(A)',
    type: CardDetailTypes.INFRA,
    infra: InfraTypes.RAILROAD
  },
  {
    title: '次の鉄道まで進み、通常の2倍のレンタル料を支払う(B)',
    type: CardDetailTypes.INFRA,
    infra: InfraTypes.RAILROAD
  },
  {
    title:
      '次の水道会社か電力会社に進む（所有者がいたら、ダイスの目の10倍を支払う）',
    type: CardDetailTypes.INFRA,
    infra: InfraTypes.UTILITY
  },
  {
    title: '3マス戻る',
    type: CardDetailTypes.MOVEBY,
    by: -3
  },
  {
    title: '銀行より$150受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 150
  },
  {
    title: '銀行より$50受取る',
    type: CardDetailTypes.CASH,
    from: '',
    cash: 50
  },
  {
    title: '銀行へ$15支払う',
    type: CardDetailTypes.CASH,
    to: '',
    cash: 15
  },
  {
    title: '各プレーヤーに$50支払う',
    type: CardDetailTypes.CASH,
    to: 'all',
    cash: 50
  },
  {
    title: '修理費、家1軒あたり$25、ホテル1軒あたり$100を支払う',
    type: CardDetailTypes.REPAIR,
    house: 25,
    hotel: 100
  },
  {
    title: 'GOのマスへ進む',
    type: CardDetailTypes.MOVETO,
    cell: CellPositions.GO
  },
  {
    title: '刑務所から釈放',
    type: CardDetailTypes.RELEASE
  },
  {
    title: '刑務所へ行く',
    type: CardDetailTypes.JAIL
  }
]
