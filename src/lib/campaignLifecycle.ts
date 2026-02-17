export type CampaignLifecycleStatus =
  | "pending_review"
  | "active"
  | "paused"
  | "completed"
  | "archived"
  | "flagged";

export function deriveCampaignLifecycleStatus(input: {
  status?: string | null;
  isActive?: boolean | null;
  isVerified?: boolean | null;
  raisedAmount?: number | null;
  targetAmount?: number | null;
  deadline?: string | number | Date | null;
  isArchived?: boolean | null;
  isFlagged?: boolean | null;
}): CampaignLifecycleStatus {
  const normalized = (input.status || "").toLowerCase();
  const mapped: Record<string, CampaignLifecycleStatus> = {
    pending: "pending_review",
    pending_review: "pending_review",
    review: "pending_review",
    active: "active",
    paused: "paused",
    completed: "completed",
    archived: "archived",
    flagged: "flagged",
  };

  if (mapped[normalized]) return mapped[normalized];

  if (input.isArchived) return "archived";
  if (input.isFlagged) return "flagged";
  if (input.isVerified === false) return "pending_review";
  if (input.isActive === false) return "paused";

  const raised = Number(input.raisedAmount ?? 0);
  const target = Number(input.targetAmount ?? 0);
  if (target > 0 && raised >= target) return "completed";

  const deadlineTime = input.deadline ? new Date(input.deadline).getTime() : NaN;
  if (Number.isFinite(deadlineTime) && deadlineTime < Date.now()) return "completed";

  return "active";
}

export function lifecycleLabel(status: CampaignLifecycleStatus): string {
  switch (status) {
    case "pending_review":
      return "Pending Review";
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "completed":
      return "Completed";
    case "archived":
      return "Archived";
    case "flagged":
      return "Flagged";
    default:
      return "Active";
  }
}
