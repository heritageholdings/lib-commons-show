import { number as N } from "fp-ts";

import {
  getConst,
  getFromNumeralFormat,
  getFilterOrElse,
  dashIfNonPositive,
  thousands,
  usdNoDecimal,
  usdThousandsNoDecimalDash,
  usd1Decimal,
} from "../show";

describe("getConst", () => {
  it("returns a Show that always returns the given string", () => {
    const show = getConst("foo");
    expect(show.show("bar")).toBe("foo");
  });
});

describe("getFromNumeralFormat", () => {
  it("returns a Show that converts a number to a string using the given numeral format", () => {
    const show = getFromNumeralFormat("$0,0");
    expect(show.show(1234567.89)).toBe("$1,234,568");
  });
});

describe("getFilterOrElse", () => {
  it("returns the right show based on the predicate", () => {
    const show = getFilterOrElse<number>(
      (_) => _ > 0,
      getConst("N")
    )(getConst("P"));
    expect(show.show(1)).toBe("P");
    expect(show.show(0)).toBe("N");
  });
});

describe("dashIfNonPositive", () => {
  it("returns the provided show if number is positive or a dash", () => {
    const show = dashIfNonPositive(getConst("S"));
    expect(show.show(1)).toBe("S");
    expect(show.show(0)).toBe("-");
    expect(show.show(-1)).toBe("-");
  });
});

describe("thousands", () => {
  it("divides the number to 1000", () => {
    const show = thousands(N.Show);
    expect(show.show(1234)).toBe("1");
  });
});

describe("usdNoDecimal", () => {
  it("formats the number to USD", () => {
    expect(usdNoDecimal.show(1234567.89)).toBe("$1,234,568");
  });
});

describe("usd1Decimal", () => {
  it("formats the number to USD", () => {
    expect(usd1Decimal.show(1234567.89)).toBe("$1.2mm");
    expect(usd1Decimal.show(11234567.12)).toBe("$11.2mm");
    expect(usd1Decimal.show(12345)).toBe("$12.3k");
    expect(usd1Decimal.show(20.5)).toBe("$20.5");
  });
});

describe("usdThousandsNoDecimal", () => {
  it("formats the number to USD", () => {
    expect(usdThousandsNoDecimalDash.show(1234567.89)).toBe("$1,235");
  });
});
