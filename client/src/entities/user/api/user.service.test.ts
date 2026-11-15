import { ApiError } from "@/shared/api/api-error";

import { userService } from "./user.service";

const mockRequestParsed = jest.fn();
const mockClearAccessToken = jest.fn();

jest.mock("@/shared/api", () => ({
  ...jest.requireActual("@/shared/api/api-error"),
  requestParsed: (...args: unknown[]) => mockRequestParsed(...args),
  clearAccessToken: () => mockClearAccessToken(),
}));

describe("userService.getCurrentUser", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the user when the session is valid", async () => {
    mockRequestParsed.mockResolvedValue({ id: "u1" });
    await expect(userService.getCurrentUser()).resolves.toEqual({ id: "u1" });
    expect(mockClearAccessToken).not.toHaveBeenCalled();
  });

  it("clears the token and reports signed-out on 401", async () => {
    mockRequestParsed.mockRejectedValue(new ApiError(401, "Unauthorized"));
    await expect(userService.getCurrentUser()).resolves.toBeNull();
    expect(mockClearAccessToken).toHaveBeenCalledTimes(1);
  });

  it("keeps the session when the network is down (regression: used to log users out)", async () => {
    const offline = new TypeError("Network request failed");
    mockRequestParsed.mockRejectedValue(offline);
    await expect(userService.getCurrentUser()).rejects.toBe(offline);
    expect(mockClearAccessToken).not.toHaveBeenCalled();
  });

  it("keeps the session on a server error", async () => {
    mockRequestParsed.mockRejectedValue(new ApiError(503, "Unavailable"));
    await expect(userService.getCurrentUser()).rejects.toBeInstanceOf(ApiError);
    expect(mockClearAccessToken).not.toHaveBeenCalled();
  });
});
