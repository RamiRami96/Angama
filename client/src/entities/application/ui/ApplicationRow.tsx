import { Text, View } from "react-native";

import type { MyApplication } from "../model/application.model";
import { APPLICATION_STATUS_STYLE } from "../model/application-status-style";

type Props = {
  app: MyApplication;
};

export function ApplicationRow({ app }: Props) {
  const s = APPLICATION_STATUS_STYLE[app.status];
  return (
    <View className="flex-row items-center py-3 border-b border-white/10">
      <Text className="text-white text-sm font-medium flex-1">{app.clubName}</Text>
      <View className={`px-2.5 py-1 rounded-full ${s.bg}`}>
        <Text className={`text-xs font-semibold ${s.text}`}>{s.label}</Text>
      </View>
    </View>
  );
}
