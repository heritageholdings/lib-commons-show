import { function as F, predicate as P, show as S } from "fp-ts";

import * as S_N from "fp-ts-std/Number";
import * as S_S from "fp-ts-std/Show";

// @see http://numeraljs.com/#format
import numeral from "numeral";

// override millions abbreviation from 'm' to 'mm'
numeral.localeData().abbreviations = {
  ...numeral.localeData().abbreviations,
  million: "mm",
};

// ----------------------------------------------------------------------------
// constructors
// ----------------------------------------------------------------------------
/**
 * Returns a Show that converts a number to a string using the given numeral format.
 */
export const getFromNumeralFormat = (format: string): S.Show<number> => ({
  show: (n: number) => numeral(n).format(format),
});

/**
 * Returns a Show that always returns the given string.
 */
export const getConst = (value: string): S.Show<unknown> => ({
  show: () => value,
});

// ----------------------------------------------------------------------------
// combinators
// ----------------------------------------------------------------------------

export const getFilterOrElse =
  <A>(predicate: P.Predicate<A>, orElse: S.Show<A>) =>
  (show: S.Show<A>): S.Show<A> => ({
    show: (a: A) => (predicate(a) ? show.show(a) : orElse.show(a)),
  });

export const withSuffix =
  (suffix: string) =>
  <A>(show: S.Show<A>): S.Show<A> => ({
    show: (a: A) => show.show(a) + suffix,
  });

export const withK = (s: S.Show<number>): S.Show<number> => ({
  show: (n: number) => (n !== 0 ? withSuffix("k")(s).show(n) : s.show(n)),
});

// ----------------------------------------------------------------------------
// instances
// ----------------------------------------------------------------------------

// type classes

// const values

export const dash = getConst("-");

export const nonMeaningful = getConst("n.m.");

// clamps

export const dashIfZero = getFilterOrElse<number>((_) => _ !== 0, dash);

export const dashIfNonPositive = getFilterOrElse<number>(S_N.isPositive, dash);

export const nmIfNonPositive = getFilterOrElse<number>(
  S_N.isPositive,
  nonMeaningful
);

export const clamp100Percent = getFilterOrElse<number>(
  (_) => _ <= 100,
  getConst(">100%")
);

// functors

export const thousands = S_S.contramap<number, number>((_) =>
  Math.round(_ / 1000.0)
);

export const percentToFloat = S_S.contramap<number, number>((_) =>
  Math.abs(_) >= 0.1 ? _ / 100.0 : 0
);

// numeral formats

// 1234 -> 1.2k, 1230974 -> 1.2m
export const usd1Decimal = getFromNumeralFormat("($0,0.0a)");
export const usdDecimal = getFromNumeralFormat("$0,0.00");

export const usdNoDecimal = getFromNumeralFormat("$0,0");

export const usdPLNoDecimal = getFromNumeralFormat("($0,0)");

export const percentSingleDecimal = getFromNumeralFormat("0.0%");

export const percentDoubleDecimal = getFromNumeralFormat("0.00%");

export const percentPLSingleDecimal = getFromNumeralFormat("(0.0%)");

// combinations

export const usdDecimalDash = F.pipe(usdDecimal, dashIfNonPositive);

export const usdThousandsNoDecimal = F.pipe(usdNoDecimal, thousands);

export const usdThousandsNoDecimalDash = F.pipe(
  usdThousandsNoDecimal,
  dashIfNonPositive
);

export const usdThousandsNoDecimalNm = F.pipe(
  usdNoDecimal,
  thousands,
  nmIfNonPositive
);

export const multiple1 = F.pipe(getFromNumeralFormat("(0.0)"), withSuffix("x"));

export const multiple2 = F.pipe(
  getFromNumeralFormat("(0.00)"),
  withSuffix("x")
);
