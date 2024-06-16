"use client";
import Image from "next/image";
import { Input } from "@nextui-org/input";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  DateRangePicker,
  DateValue,
  RangeCalendar,
  RangeValue,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ActivityType, Peers, TimeOfDay, Trip } from "./interface";
import Balancer from "react-wrap-balancer";
import toast from "react-hot-toast";
import { I18nProvider } from "@react-aria/i18n";

const timeOfDayDic: Record<TimeOfDay, string> = {
  morning: "早上",
  noon: "中午",
  afternoon: "下午",
  evening: "晚上",
  night: "夜晚",
};

const peersDic: Record<Peers, string> = {
  Solo: "自己",
  Couple: "情侣",
  Family: "家庭",
  Friends: "朋友",
};

const activityDic: Record<ActivityType, string> = {
  Beaches: "海滩",
  "City sightseeing": "城市观光",
  "Outdoor adventures": "户外探险",
  "Festivals/events": "节日/活动",
  "Food exploration": "美食探索",
  Nightlife: "夜生活",
  Shopping: "购物",
  "Spa wellness": "水疗养生",
};

const colors = ["#AF47D2", "#26355D", "#FF8F00"];

export default function Home() {
  const [isLoading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [dateRange, setDateRange] = useState<RangeValue<DateValue>>();
  const [params, setParams] = useState({} as any);
  const [tripData, setTripData] = useState<Trip[]>([]);
  const receivedRef = useRef<HTMLSpanElement>(null);
  let HOST = "";
  useEffect(() => {
    HOST = window.location.origin;
    const data = localStorage.getItem("tripData");
    if (data) {
      setTripData(JSON.parse(data));
      setStep(100);
    }
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${HOST}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...params,
          arrivalTime:
            params.arrivalTime && Array.from(params.arrivalTime)?.[0],
          peers: params.peers && Array.from(params.peers)?.[0],
        }),
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      let curAnswer = "{";
      // read stream
      const reader = res.body?.getReader();
      if (!reader) {
        return;
      }
      const decoder = new TextDecoder("utf-8");
      for (;;) {
        const { done, value } = await reader.read();
        if (receivedRef.current) {
          receivedRef.current.innerText = "正在生成中:" + value?.toString();
        }
        if (done) {
          if (receivedRef.current) {
            receivedRef.current.innerText = "";
          }
          const completeMessage = JSON.parse(curAnswer);
          setTripData([completeMessage, ...tripData]);
          localStorage.setItem(
            "tripData",
            JSON.stringify([completeMessage, ...tripData])
          );
          toast.success("生成成功");
          setStep(100);
          break;
        }
        const curText = decoder.decode(value, { stream: true });
        curAnswer += curText;
      }
    } catch (e) {
      console.log(e);
      toast.error(`生成失败,再试一次吧 ${e}`);
    }
    setLoading(false);
  };
  return (
    <main className="w-full overflow-x-hidden overflow-y-auto min-h-screen relative max-w-lg mx-auto">
      <CarouselItem curStep={step} index={0}>
        <>
          <div className="font-semibold text-2xl">想去哪儿？</div>
          <Input
            name="destination"
            className="mt-10"
            label="目的地"
            value={params.destination || ""}
            onChange={(e) => {
              setParams({ ...params, destination: e.target.value });
            }}
          />
          <Button
            radius="full"
            className="w-full mx-auto mt-4"
            onClick={() => {
              if (!params.destination) {
                return;
              }
              setStep(1);
            }}
          >
            开始
          </Button>
        </>
      </CarouselItem>
      <CarouselItem curStep={step} index={1} setStep={setStep}>
        <>
          <div className="font-semibold text-2xl">什么时候？</div>
          <div className="mt-10 flex justify-center">
            <I18nProvider locale="zh-CN">
              <RangeCalendar
                value={dateRange || null}
                onChange={(value) => {
                  setDateRange(value);
                  setParams({
                    ...params,
                    dateRange: [
                      `${value.start.month}月${value.start.day}日`,
                      `${value.end.month}月${value.end.day}日`,
                    ],
                  });
                }}
              />
            </I18nProvider>
          </div>
          <Button
            radius="full"
            className="w-full mx-auto mt-4"
            isLoading={isLoading}
            onClick={() => {
              if (!dateRange) {
                return;
              }
              setStep(2);
            }}
          >
            下一步
          </Button>
        </>
      </CarouselItem>
      <CarouselItem
        curStep={step}
        index={2}
        setStep={setStep}
        isLoading={isLoading}
      >
        <>
          <div className="font-semibold text-2xl">最后，要补充什么？</div>
          <div className="text-sm">(这一页不填也行)</div>
          <div className="text-lg font-semibold mt-4">到达时间</div>
          <Select
            isDisabled={isLoading}
            selectedKeys={params.arrivalTime || new Set([])}
            label="选择时间"
            size="sm"
            onSelectionChange={(keys) => {
              setParams({ ...params, arrivalTime: keys });
            }}
          >
            {Object.keys(timeOfDayDic).map((key, index) => {
              return (
                <SelectItem key={key} className="text-foreground">
                  {timeOfDayDic[key as TimeOfDay]}
                </SelectItem>
              );
            })}
          </Select>
          <div className="text-lg font-semibold mt-4">我的预算</div>
          <Input
            isDisabled={isLoading}
            value={params.budget || ""}
            onValueChange={(value) => {
              setParams({ ...params, budget: value });
            }}
            type="number"
            placeholder="0.00"
            labelPlacement="outside"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">¥</span>
              </div>
            }
          />
          <div className="text-lg font-semibold mt-4">我的同伴</div>
          <Select
            isDisabled={isLoading}
            selectedKeys={params.peers || new Set([])}
            label="选择同伴"
            size="sm"
            onSelectionChange={(keys) => {
              setParams({ ...params, peers: keys });
            }}
          >
            {Object.keys(peersDic).map((key, index) => {
              return (
                <SelectItem key={key} className="text-foreground">
                  {peersDic[key as Peers]}
                </SelectItem>
              );
            })}
          </Select>
          <div className="text-lg font-semibold mt-4">我感兴趣的</div>
          <CheckboxGroup
            isDisabled={isLoading}
            value={params.interests || []}
            orientation="horizontal"
            onValueChange={(value) => {
              setParams({ ...params, interests: value });
            }}
          >
            {Object.keys(activityDic).map((key, index) => {
              return (
                <Checkbox key={key} value={activityDic[key as ActivityType]}>
                  <span className="text-foreground" id="text-color">
                    {activityDic[key as ActivityType]}
                  </span>
                </Checkbox>
              );
            })}
          </CheckboxGroup>
          <Button
            radius="full"
            className="w-full mx-auto mt-4"
            isLoading={isLoading}
            onClick={handleGenerate}
          >
            生成
          </Button>
          <span
            className="text-xs opacity-50 overflow-hidden text-ellipsis whitespace-nowrap"
            ref={receivedRef}
          ></span>
        </>
      </CarouselItem>
      <CarouselItem curStep={step} index={100}>
        <div className="">
          <div className="font-semibold text-2xl flex items-center">
            <div className="">旅行计划</div>
            <div
              className="ml-4 text-3xl text-center w-7 h-7 cursor-pointer leading-6 rounded-full text-white bg-[#26355D]"
              onClick={() => {
                setStep(0);
                setDateRange(undefined);
                setParams({});
              }}
            >
              +
            </div>
          </div>
          {tripData.map((trip, tripIndex) => {
            return (
              <Card key={tripIndex} className="mt-10" isFooterBlurred>
                <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
                  <small className="text-default-500">The Trip to</small>
                  <h4 className="font-bold text-2xl">{trip.destination}</h4>
                  <p className="text-tiny uppercase font-bold">
                    {trip.startDate}至{trip.endDate}
                  </p>
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                  <Divider className="mb-2" />
                  <div className="text-sm font-semibold ">
                    到达时间：{timeOfDayDic[trip.arrivalTime as TimeOfDay]}
                  </div>
                  <div className="">
                    {trip.plan.map((plan, planIndex) => {
                      return (
                        <div
                          key={planIndex}
                          className={clsx(
                            "mt-2",
                            plan.done &&
                              "line-through grayscale opacity-50 transition-all duration-500"
                          )}
                        >
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              isSelected={plan.done}
                              onValueChange={(value) => {
                                const _tripData = [...tripData];
                                _tripData[tripIndex].plan[planIndex].done =
                                  value;
                                setTripData(_tripData);
                                localStorage.setItem(
                                  "tripData",
                                  JSON.stringify(_tripData)
                                );
                              }}
                            />
                            <div className="inline-block text-sm w-6 h-6 p-1 leading-4 text-center rounded-full bg-[#FFDB00]">
                              {+planIndex + 1}
                            </div>
                            <Balancer className="text-base font-semibold">
                              {" "}
                              {plan.activities}{" "}
                            </Balancer>
                            <Chip
                              style={{
                                backgroundColor:
                                  colors[
                                    (+plan.date.split("-")[2] + 1) %
                                      colors.length
                                  ],
                              }}
                              size="sm"
                              className="h-5 text-white"
                            >
                              <span className="">
                                {plan.date.split("-")[1]}/
                                {plan.date.split("-")[2]}
                              </span>
                              <span className="border-r-1 mx-1 "></span>
                              <span>{timeOfDayDic[plan.timeOfDay]}</span>
                            </Chip>
                          </div>
                          <div className="text-sm">{plan.description}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </CarouselItem>
    </main>
  );
}

const CarouselItem = ({
  curStep,
  index,
  children,
  setStep,
  isLoading,
}: {
  curStep: number;
  index: number;
  children: JSX.Element;
  setStep?: (step: number) => void;
  isLoading?: boolean;
}) => {
  return (
    <div
      className={clsx(
        "w-full mt-10 absolute top-0 transition-all duration-500 z-10",
        curStep < index && "opacity-0 translate-x-[100vw]",
        curStep === index && "opacity-100 translate-x-0 sticky",
        curStep > index && "opacity-0 -translate-x-[100vw]"
      )}
    >
      {index > 0 && index < 100 ? (
        <div
          className={clsx(
            "text-lg font-semibold mb-2 bg-default-300 w-6 h-6 text-center leading-6 rounded-full",
            isLoading && "opacity-80"
          )}
          onClick={() => {
            if (isLoading) return;
            setStep?.(+index - 1);
          }}
        >
          {"<"}
        </div>
      ) : (
        <></>
      )}
      {children}
    </div>
  );
};
