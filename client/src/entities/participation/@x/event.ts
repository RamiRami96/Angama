// Cross-import for entities/event (FSD @x): the event DTO carries the viewer's
// participation status. Only the status schema is exposed, to avoid a cycle.
export {
  participationStatusSchema,
  type ParticipationStatus,
} from "../model/participation-status";
