export type TimeOfDay = "morning" | "noon" | "afternoon" | "evening" | "night";
export type Peers = "Solo" | "Couple" | "Family" | "Friends";
export type ActivityType =
  | "Beaches"
  | "City sightseeing"
  | "Outdoor adventures"
  | "Festivals/events"
  | "Food exploration"
  | "Nightlife"
  | "Shopping"
  | "Spa wellness";

export interface Trip {
  destination: string;
  startDate: string;
  endDate: string;
  arrivalTime: TimeOfDay;
  budget?: number;
  peers?: Peers;
  interests?: ActivityType[];
  plan: {
    date: string;
    timeOfDay: TimeOfDay;
    activities: string;
    description: string;
    done: boolean;
  }[];
}
