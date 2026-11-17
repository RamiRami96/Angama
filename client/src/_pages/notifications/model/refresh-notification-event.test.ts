import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/shared/api";

import { refreshNotificationEvent } from "./refresh-notification-event";

describe("refreshNotificationEvent", () => {
  it("invalidates the event detail and its participants", () => {
    const invalidateQueries = jest.fn();
    const queryClient = { invalidateQueries } as unknown as QueryClient;

    refreshNotificationEvent(queryClient, "e1");

    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.events.detail("e1") });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.events.participants("e1"),
    });
  });
});
