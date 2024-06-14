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
        content: `请做一个旅行规划并输出一个 trip 格式的 json 对象中输出。格式为type TimeOfDay = "morning" | "noon" | "afternoon" | "evening" | "night";
type Peers = "Solo" | "Couple" | "Family" | "Friends";
type ActivityType = 
    'Beaches' |
    'City sightseeing' |
    'Outdoor adventures' |
    'Festivals/events' |
    'Food exploration' |
    'Nightlife' |
    'Shopping' |
    'Spa wellness';

export interface Trip {
  destination: string;
  startDate: Date;
  endDate: Date;
  arrivalTime: TimeOfDay;
  budget?: number;
  peers?: Peers;
  interests?: ActivityType[];
  plan: [
    {
      date: Date;
      timeOfDay: TimeOfDay;
      activities: string;
      description: string;
      done: boolean;
    }
  ];
}
`,
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

const result = {
  destination: "惠安",
  startDate: "2024-06-14",
  endDate: "2024-06-16",
  arrivalTime: "afternoon",
  plan: [
    {
      date: "2024-06-14",
      timeOfDay: "afternoon",
      activities: "入住酒店",
      description: "在惠安的酒店办理入住手续，休息一下，准备开始旅行。",
      done: false,
    },
    {
      date: "2024-06-14",
      timeOfDay: "evening",
      activities: "品尝当地美食",
      description: "去惠安的夜市或餐馆品尝当地特色美食，如海鲜、小吃等。",
      done: false,
    },
    {
      date: "2024-06-15",
      timeOfDay: "morning",
      activities: "游览崇武古城",
      description: "参观崇武古城，了解当地的历史文化。",
      done: false,
    },
    {
      date: "2024-06-15",
      timeOfDay: "afternoon",
      activities: "海滩休闲",
      description: "在惠安的海滩上享受阳光和海浪，或者尝试一些水上活动。",
      done: false,
    },
    {
      date: "2024-06-15",
      timeOfDay: "evening",
      activities: "夜游惠安",
      description: "在惠安的夜市或酒吧区体验当地的夜生活。",
      done: false,
    },
    {
      date: "2024-06-16",
      timeOfDay: "morning",
      activities: "购物",
      description: "在当地的商店或市场购买一些纪念品或特产。",
      done: false,
    },
    {
      date: "2024-06-16",
      timeOfDay: "afternoon",
      activities: "离开惠安",
      description: "结束惠安之旅，准备离开。",
      done: false,
    },
  ],
};
