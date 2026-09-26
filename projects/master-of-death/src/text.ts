// All on-screen words in the film. The font fetch script subsets Noto Serif SC
// from the CJK characters found in src/, so every line lives here.

export type Line = {zh: string; en: string};

export const NARRATION = {
  feared: {zh: '他害怕死亡。', en: 'He feared death.'},
  conquer: {zh: '所以他试图征服它。', en: 'So he tried to conquer it.'},
  arena: {
    zh: '被拉进决斗场和自己昂首走进去是不一样的，这是世界上全部的不同。',
    en: 'Being dragged into the arena, or walking in with your head held high — that is all the difference in the world.',
  },
  adventure: {zh: '死亡只是另一场伟大的冒险。', en: 'Death is but the next great adventure.'},
} satisfies Record<string, Line>;

export const EPITAPH = {
  carved: 'THE LAST ENEMY THAT SHALL BE DESTROYED IS DEATH',
  gloss: '最后一个要消灭的敌人是死亡',
  names: [
    {name: 'JAMES POTTER', dates: 'BORN 27 MARCH 1960 · DIED 31 OCTOBER 1981'},
    {name: 'LILY POTTER', dates: 'BORN 30 JANUARY 1960 · DIED 31 OCTOBER 1981'},
  ],
};
