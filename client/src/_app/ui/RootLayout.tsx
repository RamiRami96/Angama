import "../styles/global.css";
import * as SplashScreen from "expo-splash-screen";
import { Stack, router } from "expo-router";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";

import { userService } from "@/entities/user";
import { queryKeys } from "@/shared/api";

import { queryClient } from "../model/query-client";

SplashScreen.preventAutoHideAsync().catch(() => {});

export function RootLayout() {
  useEffect(() => {
    queryClient
      .fetchQuery({
        queryKey: queryKeys.auth.me,
        queryFn: userService.getCurrentUser,
      })
      .then((user) => {
        if (user) router.replace("/(main)/clubs");
      })
      .finally(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
