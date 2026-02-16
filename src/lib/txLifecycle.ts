export type DonationTxState =
  | "idle"
  | "initiated"
  | "wallet_prompt"
  | "pending"
  | "confirmed"
  | "failed";

export function donationTxStateLabel(state: DonationTxState): string {
  switch (state) {
    case "idle":
      return "Ready";
    case "initiated":
      return "Preparing transaction";
    case "wallet_prompt":
      return "Awaiting wallet signature";
    case "pending":
      return "Pending confirmation";
    case "confirmed":
      return "Confirmed";
    case "failed":
      return "Failed";
    default:
      return "Ready";
  }
}
