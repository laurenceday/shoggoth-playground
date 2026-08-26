import { ROUTES } from "@/routes"
import {
  parseReturnTarget,
  partyRoot,
  readReturnTargetParam,
  resolveReturnTarget,
  withReturnTarget,
} from "@/utils/returnTarget"

describe("parseReturnTarget", () => {
  const accepted: [string, string][] = [
    ["/lender", "/lender"],
    ["/lender/my-markets", "/lender/my-markets"],
    ["/lender/all-markets", "/lender/all-markets"],
    ["/lender/market/0xabc?chainId=1", "/lender/market/0xabc?chainId=1"],
    ["/borrower", "/borrower"],
    ["/borrower/market/0xabc", "/borrower/market/0xabc"],
  ]

  it.each(accepted)("accepts %s", (value, expected) => {
    expect(parseReturnTarget(value)).toBe(expected)
  })

  const rejected: [string, string | null | undefined][] = [
    ["an absolute URL", "https://evil.example/x"],
    ["a protocol-relative path", "//evil.example/x"],
    ["a javascript scheme", "javascript:alert(1)"],
    ["a backslash authority", "/\\evil.example/x"],
    ["a path outside the known prefixes", "/admin"],
    ["traversal that escapes a known prefix", "/lender/../../evil"],
    ["a lender agreement route, which would loop", ROUTES.lender.agreement],
    ["a borrower agreement route, which would loop", ROUTES.borrower.agreement],
    ["a prefix look-alike", "/lenderevil"],
    ["an empty string", ""],
    ["null", null],
    ["undefined", undefined],
  ]

  it.each(rejected)("rejects %s", (_label, value) => {
    expect(parseReturnTarget(value)).toBeNull()
  })
})

describe("resolveReturnTarget", () => {
  it("falls back to the lender root for a lender", () => {
    expect(resolveReturnTarget("https://evil.example", "Lender")).toBe(
      ROUTES.lender.root,
    )
  })

  it("falls back to the borrower root for a borrower", () => {
    expect(resolveReturnTarget(null, "Borrower")).toBe(ROUTES.borrower.root)
  })

  it("returns an accepted target unchanged", () => {
    expect(resolveReturnTarget("/lender/my-markets", "Lender")).toBe(
      "/lender/my-markets",
    )
  })
})

describe("partyRoot", () => {
  it("maps each party to its own root", () => {
    expect(partyRoot("Lender")).toBe(ROUTES.lender.root)
    expect(partyRoot("Borrower")).toBe(ROUTES.borrower.root)
  })
})

describe("readReturnTargetParam", () => {
  it("reads the parameter out of a search string", () => {
    expect(readReturnTargetParam("?returnTo=%2Flender%2Fmy-markets")).toBe(
      "/lender/my-markets",
    )
  })

  it("returns null when the parameter is absent", () => {
    expect(readReturnTargetParam("?other=1")).toBeNull()
  })
})

describe("withReturnTarget", () => {
  it("carries an acceptable origin onto an agreement redirect", () => {
    expect(
      withReturnTarget(ROUTES.lender.agreement, "/lender/my-markets"),
    ).toBe(
      `${ROUTES.lender.agreement}?returnTo=${encodeURIComponent(
        "/lender/my-markets",
      )}`,
    )
  })

  it("leaves a non-agreement redirect alone", () => {
    expect(withReturnTarget("/", "/lender/my-markets")).toBe("/")
  })

  it("omits a target the consumer would refuse", () => {
    expect(withReturnTarget(ROUTES.lender.agreement, "/admin")).toBe(
      ROUTES.lender.agreement,
    )
  })

  it("omits an agreement route, which would loop", () => {
    expect(
      withReturnTarget(ROUTES.lender.agreement, ROUTES.lender.agreement),
    ).toBe(ROUTES.lender.agreement)
  })
})
