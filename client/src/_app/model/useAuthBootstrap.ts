import * as SplashScreen from "expo-splash-screen";
import { router } from "expo-router";
import { useEffect } from "react";

import { userService } from "@/entities/user";
import { queryKeys } from "@/shared/api";

import { queryClient } from "./query-client";

export function useAuthBootstrap() {
  useEffect(() => {
    queryClient
      .fetchQuery({
        queryKey: queryKeys.auth.me,
        queryFn: userService.getCurrentUser,
      })
      .then((user) => {
        if (user) router.replace("/(main)/clubs");
      })
      .catch(() => {
        // Offline or server error: keep the session, stay on the start screen.
      })
      .finally(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
  }, []);
}
