import { ActivityType, Peers, TimeOfDay } from "@/app/interface";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.MOONSHOT_API_KEY,
  baseURL: "https://api.moonshot.cn/v1",
});

export async function POST(request: NextRequest) {
  const body: {
    destination: string;
    dateRange: [string, string];
    arrivalTime?: TimeOfDay;
    budget?: string;
    peers?: Peers;
    interests?: ActivityType[];
  } = await request.json();

  const content = `我要在${body.dateRange[0]}到${body.dateRange[1]}去${
    body.destination
  }旅行。${body.arrivalTime ? `我会在${body.arrivalTime}到达。` : ""}${
    body.budget ? `我的预算是${body.budget}元。` : ""
  }${body.peers ? `我的同伴是${body.peers}。` : ""}${
    body.interests ? `我对${body.interests?.join("、")}比较感兴趣。` : ""
  }请为我做一个中文的旅行规划。字段内容都使用中文。字段内容都使用中文。字段内容都使用中文。`;
  const stream = await client.chat.completions.create({
    model: "moonshot-v1-8k",
    stream: true,
    messages: [
      {
        role: "system",
        content: `请做一个中文的旅行规划并输出一个 trip 格式的 json 对象中输出。格式描述为：${typeDescription}`,
      },
      {
        role: "user",
        content: content,
      },
      //@ts-ignore
      { role: "assistant", content: "{", partial: true },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });
  let completeMessage = "";
  const encoder = new TextEncoder();
  async function* makeIterator() {
    // first send the OAI chunks
    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta.content as string;
      completeMessage += delta || "";
      if (chunk.choices[0].finish_reason) {
        //@ts-ignore
        const usage: CompletionUsage = chunk.choices[0].usage;
      }
      yield encoder.encode(delta);
    }
    // optionally, some additional info can be sent here, like
    // yield encoder.encode(JSON.stringify({ thread_id: thread._id }));
  }
  return new Response(iteratorToStream(makeIterator()));
}

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

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
