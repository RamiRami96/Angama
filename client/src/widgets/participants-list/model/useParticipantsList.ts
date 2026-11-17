import { useParticipantsQuery } from "@/entities/participation";
import {
  useApproveParticipantMutation,
  useRejectParticipantMutation,
} from "@/features/manage-participants";

import { groupParticipants } from "./group-participants";

export function useParticipantsList(eventId: string) {
  const { data, isLoading } = useParticipantsQuery(eventId);
  const approve = useApproveParticipantMutation();
  const reject = useRejectParticipantMutation();

  return {
    ...groupParticipants(data ?? []),
    isLoading,
    isDeciding: approve.isPending || reject.isPending,
    onApprove: (userId: string) => approve.mutate({ eventId, userId }),
    onReject: (userId: string) => reject.mutate({ eventId, userId }),
  };
}
