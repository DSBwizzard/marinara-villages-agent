import assert from "node:assert/strict";
import { mock } from "node:test";
import { immutableSocialWishes } from "../packages/villages/src/server/domain/rules/social-wishes.js";
import { fitWishWritingContext } from "../packages/villages/src/server/domain/rules/wish-writing-context.js";
import { fixtureWish } from "./helpers/social-wishes-fixture.js";

const messages = (text: string) => [{ role: "system" as const, content: JSON.stringify({ wishContext: text }) }];
const model = {
  fitContext: (rows: ReturnType<typeof messages>) => ({
    messages: rows,
    trimmed: false,
    estimatedTokensBefore: JSON.stringify(rows).length,
    estimatedTokensAfter: JSON.stringify(rows).length,
  }),
};
const wish = fixtureWish({ wish: "Enjoy a quiet café together" });
wish.conditions = [
  {
    id: "condition",
    quote: "Only if you still want to",
    at: wish.addedAt,
    sourceId: "exact-source",
    lineIds: ["exact-line"],
  },
];
wish.history = [
  {
    id: "refusal",
    kind: "progress",
    text: "They declined; do not repeat the invitation.",
    at: wish.addedAt,
    sourceId: "earlier-source",
    lineIds: ["earlier-line"],
  },
];
const text = fitWishWritingContext(model, [
  { actorId: "ada", wishes: [wish] },
  { actorId: "bea", wishes: [wish] },
  { actorId: "cy", wishes: [wish] },
]);
assert(text.includes(wish.conditions[0].quote));
assert(text.includes(wish.history[0].text));
assert(text.includes("earlier-source"));
assert(
  model.fitContext(messages(text)).estimatedTokensBefore <= 2048,
  "One budget covers all actors and complete JSON overhead",
);
const payload = JSON.parse(text.slice(text.indexOf("[")));
assert(payload.length > 0 && payload.length < 3);
assert.deepEqual(payload[0].wish, wish, "Included Wishes preserve every exact field and evidence reference");
const huge = {
  ...wish,
  history: Array.from({ length: 25_000 }, (_, index) => ({ ...wish.history[0], id: "event:" + index })),
};
assert.equal(
  fitWishWritingContext(model, [{ actorId: "ada", wishes: [huge] }]),
  "",
  "An oversized optional unit is omitted whole",
);
assert.equal(huge.history.length, 25_000, "Context selection never prunes retained history");
const frozen = immutableSocialWishes([huge])[0];
let renders = 0;
let visitedHistoryRows = 0;
const stringify = JSON.stringify;
const spy = mock.method(JSON, "stringify", (...args: any[]) => {
  if (args[0] === frozen) renders++;
  if (args[0]?.history && typeof args[1] === "function") {
    const replacer = args[1];
    args[1] = (key: string, value: unknown) => {
      if (value && typeof value === "object" && "kind" in value) visitedHistoryRows++;
      return replacer(key, value);
    };
  }
  return Reflect.apply(stringify, JSON, args);
});
try {
  for (let index = 0; index < 20; index++)
    assert.equal(
      fitWishWritingContext({ fitContext: (...args) => model.fitContext(...args) }, [
        { actorId: "ada", wishes: [frozen] },
      ]),
      "",
    );
} finally {
  spy.mock.restore();
}
assert.equal(renders, 1, "Fresh model objects do not rescan a rejected immutable history");
assert(visitedHistoryRows < 400, "Even the first cold render visits bounded evidence rather than 25,000 rows");
visitedHistoryRows = 0;
const growingSpy = mock.method(JSON, "stringify", (...args: any[]) => {
  if (args[0]?.history && typeof args[1] === "function") {
    const replacer = args[1];
    args[1] = (key: string, value: unknown) => {
      if (value && typeof value === "object" && "kind" in value) visitedHistoryRows++;
      return replacer(key, value);
    };
  }
  return Reflect.apply(stringify, JSON, args);
});
try {
  for (let index = 0; index < 20; index++)
    assert.equal(
      fitWishWritingContext(model, [
        { actorId: "ada", wishes: [{ ...huge, history: [...huge.history, ...wish.history] }] },
      ]),
      "",
    );
} finally {
  growingSpy.mock.restore();
}
assert(visitedHistoryRows < 20 * 400, "New growing history identities also have bounded rendering work");
const differentEstimator = {
  fitContext: (rows: ReturnType<typeof messages>) => ({ ...model.fitContext(rows), estimatedTokensBefore: 1 }),
};
assert.equal(
  fitWishWritingContext(differentEstimator, [{ actorId: "ada", wishes: [frozen] }]),
  "",
  "Optional render-work eligibility is independent of token estimates; exact authority remains retained",
);
assert.throws(
  () =>
    fitWishWritingContext({ fitContext: () => ({ ...model.fitContext([]), estimatedTokensBefore: NaN }) }, [
      { actorId: "ada", wishes: [wish] },
    ]),
  /could not estimate/,
);
for (const size of [1000, 10_000, 25_000]) {
  const catalogue = immutableSocialWishes(
    Array.from({ length: size }, (_, index) => ({ ...wish, id: size + ":" + index })),
  );
  let renders = 0,
    bytes = 0,
    fits = 0;
  const spy = mock.method(JSON, "stringify", (...args: any[]) => {
    const value = Reflect.apply(stringify, JSON, args);
    if (args[0]?.wish === wish.wish) {
      renders++;
      bytes += Buffer.byteLength(value, "utf8");
    }
    return value;
  });
  try {
    const selected = fitWishWritingContext(
      {
        fitContext: (...args) => {
          fits++;
          return model.fitContext(...args);
        },
      },
      [{ actorId: "ada", wishes: catalogue }],
    );
    assert(selected.includes("Only if you still want to"));
    assert(
      renders < 10 && fits < 20 && bytes < 16 * 1024,
      "Catalogue size must not increase optional request-construction work",
    );
    console.log(`Optional catalogue ${size}: ${renders} renders, ${fits} estimates, ${bytes} rendered bytes`);
  } finally {
    spy.mock.restore();
  }
  assert.equal(catalogue.length, size);
}
{
  let fits = 0;
  const cheapEstimate = {
    fitContext: (rows: ReturnType<typeof messages>) => {
      fits++;
      return { ...model.fitContext(rows), estimatedTokensBefore: 1 };
    },
  };
  fitWishWritingContext(cheapEstimate, [
    {
      actorId: "ada",
      wishes: Array.from({ length: 25_000 }, (_, index) => ({ ...wish, id: "low-estimate:" + index })),
    },
  ]);
  assert(fits < 512, "A poor token estimate cannot cause unlimited catalogue construction");
}
console.log("Optional Wish writing: request-wide budget, whole exact units and estimate failures passed.");
