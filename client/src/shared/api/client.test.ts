import { z } from "zod";

import { ApiError } from "./api-error";
import { request, requestParsed } from "./client";
import { clearAccessToken, getAccessToken, setAccessToken } from "./token-storage";

jest.mock("./config", () => ({ API: "https://api.test" }));
jest.mock("./token-storage", () => ({
  getAccessToken: jest.fn(),
  setAccessToken: jest.fn().mockResolvedValue(undefined),
  clearAccessToken: jest.fn().mockResolvedValue(undefined),
}));

const fetchMock = jest.fn();
const mockedGetToken = getAccessToken as jest.Mock;

function json(status: number, body?: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  };
}

const urls = () => fetchMock.mock.calls.map(([url]) => url as string);
const authHeader = (callIndex: number) =>
  (fetchMock.mock.calls[callIndex][1].headers as Record<string, string>).Authorization;

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
  mockedGetToken.mockResolvedValue("old-token");
  (global as unknown as { fetch: jest.Mock }).fetch = fetchMock;
});

describe("authorization", () => {
  it("sends the stored access token as a bearer header", async () => {
    fetchMock.mockResolvedValueOnce(json(200, {}));
    await request("/events");
    expect(authHeader(0)).toBe("Bearer old-token");
  });

  it("omits the header when signed out", async () => {
    mockedGetToken.mockResolvedValue(null);
    fetchMock.mockResolvedValueOnce(json(200, {}));
    await request("/events");
    expect(authHeader(0)).toBeUndefined();
  });
});

describe("401 handling", () => {
  it("refreshes the session once and retries the request with the new token", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { message: "expired" }))
      .mockResolvedValueOnce(json(200, { accessToken: "new-token" })) // /auth/refresh
      .mockResolvedValueOnce(json(200, { ok: true }));

    const result = await requestParsed("/events", z.object({ ok: z.boolean() }));

    expect(result).toEqual({ ok: true });
    expect(urls()).toEqual([
      "https://api.test/events",
      "https://api.test/auth/refresh",
      "https://api.test/events",
    ]);
    expect(setAccessToken).toHaveBeenCalledWith("new-token");
    expect(authHeader(2)).toBe("Bearer new-token");
  });

  it("shares one refresh between concurrent requests that all got 401", async () => {
    // Resolve per-call: first call per URL carries the old token.
    const seen = new Map<string, number>();
    fetchMock.mockImplementation(async (url: string) => {
      if (url.endsWith("/auth/refresh")) return json(200, { accessToken: "new-token" });
      const n = (seen.get(url) ?? 0) + 1;
      seen.set(url, n);
      return n === 1 ? json(401) : json(200, {});
    });

    await Promise.all([request("/a"), request("/b"), request("/c")]);

    expect(urls().filter((u) => u.endsWith("/auth/refresh"))).toHaveLength(1);
  });

  it("clears the session and surfaces the 401 when refresh is rejected", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { message: "Unauthorized" }))
      .mockResolvedValueOnce(json(401)); // /auth/refresh

    await expect(request("/events")).rejects.toMatchObject({ status: 401 });

    expect(clearAccessToken).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(2); // no retry of the original request
  });

  it.each(["/auth/sign-in", "/auth/sign-up", "/auth/refresh", "/auth/sign-out"])(
    "never tries to refresh for %s",
    async (path) => {
      fetchMock.mockResolvedValueOnce(json(401, { message: "Invalid email or password" }));

      await expect(request(path)).rejects.toMatchObject({
        status: 401,
        message: "Invalid email or password",
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it("does not wipe the session when refresh fails for a non-auth reason", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(500)); // /auth/refresh blows up

    await expect(request("/events")).rejects.toMatchObject({ status: 500 });
    expect(clearAccessToken).not.toHaveBeenCalled();
  });

  it("can refresh again after a previous refresh has finished", async () => {
    fetchMock
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(200, { accessToken: "t2" }))
      .mockResolvedValueOnce(json(200, {}))
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(200, { accessToken: "t3" }))
      .mockResolvedValueOnce(json(200, {}));

    await request("/events");
    await request("/events");

    expect(urls().filter((u) => u.endsWith("/auth/refresh"))).toHaveLength(2);
  });
});

describe("errors and responses", () => {
  it("turns an error response into an ApiError with status, message and field errors", async () => {
    const errors = [{ path: "email", message: "Invalid email" }];
    fetchMock.mockResolvedValueOnce(json(400, { message: "Validation failed", errors }));

    const err = await request("/auth/sign-up").catch((e: unknown) => e);

    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 400, message: "Validation failed", errors });
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValueOnce({
      status: 502,
      ok: false,
      json: async () => {
        throw new SyntaxError("Unexpected token <");
      },
    });

    await expect(request("/events")).rejects.toMatchObject({
      status: 502,
      message: "Request failed",
    });
  });

  it("treats an empty success body (204) as no content", async () => {
    fetchMock.mockResolvedValueOnce(json(204));
    await expect(request("/events/1", { method: "DELETE" })).resolves.toBeUndefined();
  });
});

describe("requestParsed", () => {
  it("rejects responses that do not match the schema instead of passing bad data on", async () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce(json(200, { id: 123 }));

    await expect(requestParsed("/events/1", z.object({ id: z.string() }))).rejects.toThrow(
      "Unexpected response from server",
    );
  });
});
