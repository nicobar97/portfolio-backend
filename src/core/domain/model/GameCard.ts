export type GameCard = {
  id: string;
  slug: string;
  set: GameCardSetEnum;
  type: GameCardTypeEnum;
  rarity: GameCardRarityEnum;
  name: string;
  image: {
    en: string;
    jp: string;
  };
  feature: string;
  color: GameCardColorEnum[];
  life: number;
  power: number;
  counter: null | string;
  text: string;
  attributes: string;
  remarks: string;
};

export type UnsavedGameCard = Omit<GameCard, "id">;

export const GameCardType = {
  LEADER: "LEADER",
  CHARACTER: "CHARACTER",
  EVENT: "EVENT",
  STAGE: "STAGE",
} as const;

export type GameCardTypeEnum = (typeof GameCardType)[keyof typeof GameCardType];

export const GameCardSet = {
  ROMANCE_DAWN: "-ROMANCE DAWN- [OP01]",
  FILM_RED: "Premium Card Collection -FILM RED Edition-",
  KINGDOMS_OF_INTRIGUE: "-KINGDOMS OF INTRIGUE- [OP04]",
  PILLARS_OF_STRENGTH: "-PILLARS OF STRENGTH- [OP03]",
  EVENT_PACK_VOL2: "Included in Event Pack Vol.2",
  PARAMOUNT_WAR: "-PARAMOUNT WAR- [OP02]",
  REGIONAL_PARTICIPATION_PACK:
    "Included in Online Regional Participation Pack Vol.1",
  SPECIAL_GOODS_SET: "Special Goods Set -Ace/Sabo/Luffy-",
  PROMOTION_PACK_2022: "Included in Promotion Pack 2022",
  SUPER_PRE_RELEASE: "Super Pre-Release",
  TOURNAMENT_PACK_VOL1: "Tournament Pack Vol.1",
  FILM_RED_PROMOTION: "Included in FILM RED Promotion Card Set",
  PIRATES_PARTY_VOL1: "Included in Pirates Party Card Vol.1",
  PIRATES_PARTY_VOL2: "Included in Pirates Party Card Vol.2",
  EVENT_PACK_VOL1: "Included in Event Pack Vol.1",
  ANIME_EXPO_2023: "Anime Expo 2023",
  STRAW_HAT_CREW: "-Straw Hat Crew-[ST-01]",
  WORST_GENERATION: "-Worst Generation-[ST-02]",
  SEVEN_WARLORDS_OF_THE_SEA: "-The Seven Warlords of the Sea-[ST-03]",
  ANIMAL_KINGDOM_PIRATES: "-Animal Kingdom Pirates-[ST-04]",
  ONE_PIECE_FILM_EDITION: "ONE PIECE FILM edition [ST-05]",
  ABSOLUTE_JUSTICE: "-Absolute Justice- [ST-06]",
  BIG_MOM_PIRATES: "Big Mom Pirates [ST-07]",
  MONKEY_D_LUFFY: "-Monkey D. Luffy-[ST-08]",
  YAMATO: "-Yamato-[ST-09]",
} as const;

export type GameCardSetEnum = (typeof GameCardSet)[keyof typeof GameCardSet];

export const GameCardRarity = {
  COMMON: "C",
  UNCOMMON: "UC",
  RARE: "R",
  SUPER: "SR",
  SECRET: "SEC",
  SPECIAL: "SP CARD",
  PROMOTION: "P",
  LEADER: "L",
} as const;

export type GameCardRarityEnum =
  (typeof GameCardRarity)[keyof typeof GameCardRarity];

export const GameCardColor = {
  RED: "RED",
  GREEN: "GREEN",
  BLUE: "BLUE",
  PURPLE: "PURPLE",
  YELLOW: "YELLOW",
  BLACK: "BLACK",
} as const;

export type GameCardColorEnum =
  (typeof GameCardColor)[keyof typeof GameCardColor];
