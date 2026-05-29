export const fontFamily = {
  base: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
};

export const fontWeight = {
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
  extrabold:800,
} as const;

export const fontSize = {
  xs:   '11px',
  sm:   '12.5px',
  base: '15px',
  md:   '16px',
  lg:   '18px',
  xl:   '22px',
  '2xl':'26px',
  '3xl':'32px',
  token:'46px',
  hero: '64px',
} as const;

export const lineHeight = {
  tight:  1.15,
  normal: 1.4,
  loose:  1.6,
} as const;
