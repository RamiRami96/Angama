import "../styles/global.css";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "../model/query-client";
import { useAuthBootstrap } from "../model/useAuthBootstrap";

SplashScreen.preventAutoHideAsync().catch(() => {});

export function RootLayout() {
  useAuthBootstrap();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
