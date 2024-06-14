import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.cn/v1",
});

export async function POST(request: NextRequest) {
  const body: { destination: string; dateRange: [string, string] } =
    await request.json();
  const stream = await client.chat.completions.create({
    model: "moonshot-v1-8k",
    // stream: true,
    messages: [
      {
        role: "system",
        content: `请做一个旅行规划并输出一个 trip 格式的 json 对象中输出。格式描述为：${typeDescription}`,
      },
      {
        role: "user",
        content: `我要在${body.dateRange[0]}到${body.dateRange[1]}去${body.destination}旅行。请为我做一个中文的旅行规划。`,
      },
      //@ts-ignore
      { role: "assistant", content: "{", partial: true },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });
  const completeMessage = "{" + stream.choices[0].message.content;
  return NextResponse.json({ completeMessage });
}

// function iteratorToStream(iterator: any) {
//   return new ReadableStream({
//     async pull(controller) {
//       const { value, done } = await iterator.next();
//       if (done) {
//         controller.close();
//       } else {
//         controller.enqueue(value);
//       }
//     },
//   });
// }

const typeDescription = `export type TimeOfDay = "morning" | "noon" | "afternoon" | "evening" | "night";
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
`;
