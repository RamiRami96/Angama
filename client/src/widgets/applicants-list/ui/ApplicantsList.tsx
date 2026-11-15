import { Text, View } from "react-native";

import type { Applicant } from "@/entities/application";

import { ApplicantRow } from "@/features/manage-applicants";

type Props = {
  applicants: Applicant[];
  hostedClubName?: string;
  onAccept: (userId: string) => void;
  onReject: (userId: string) => void;
};

export function ApplicantsList({ applicants, hostedClubName, onAccept, onReject }: Props) {
  return (
    <View className="mx-4 mb-4 bg-white/15 rounded-3xl px-4">
      <Text className="text-xs font-semibold text-white/60 uppercase tracking-widest pt-4 pb-1">
        {hostedClubName ? `Applications — ${hostedClubName}` : "Applications"}
      </Text>
      {applicants.length === 0 ? (
        <View className="py-4">
          <Text className="text-white/40 text-sm text-center">No pending applications</Text>
        </View>
      ) : (
        applicants.map((a) => (
          <ApplicantRow
            key={a.userId}
            name={a.user.name}
            onAccept={() => onAccept(a.userId)}
            onReject={() => onReject(a.userId)}
          />
        ))
      )}
    </View>
  );
}
