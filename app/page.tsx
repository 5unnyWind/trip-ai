"use client";
import Image from "next/image";
import { Input } from "@nextui-org/input";
import { Button, Chip, DateRangePicker } from "@nextui-org/react";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { TimeOfDay, Trip } from "./interface";
import Balancer from "react-wrap-balancer";

const timeOfDayDic: Record<TimeOfDay, string> = {
  morning: "早上",
  noon: "中午",
  afternoon: "下午",
  evening: "晚上",
  night: "夜晚",
};

export default function Home() {
  const [isLoading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [dateRange, setDateRange] = useState(["", ""]);
  const [destination, setDestination] = useState("");
  const [tripData, setTripData] = useState<Trip[]>([]);
  let HOST = "";
  useEffect(() => {
    HOST = window.location.origin;
    const data = localStorage.getItem("tripData");
    if (data) {
      setTripData(JSON.parse(data));
      setStep(100);
    }
  }, []);
  return (
    <main className="w-full overflow-x-hidden overflow-y-auto min-h-screen relative">
      <CarouselItem curStep={step} index={0}>
        <>
          <div className="font-semibold text-2xl">想去哪儿？</div>
          <Input
            name="destination"
            className="mt-10"
            label="目的地"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
            }}
          />
          <Button
            radius="full"
            className="w-full mx-auto mt-4"
            onClick={() => {
              if (!destination) {
                return;
              }
              setStep(1);
            }}
          >
            开始
          </Button>
        </>
      </CarouselItem>
      <CarouselItem curStep={step} index={1}>
        <>
          {/* <Button
              className=""
              radius="full"
              size="sm"
              onClick={() => {
                setStep(0);
              }}
            >
              {"<"}
            </Button> */}
          <div className="font-semibold text-2xl">什么时候？</div>
          <DateRangePicker
            onChange={(value) => {
              setDateRange([
                `${value.start.month}月${value.start.day}日`,
                `${value.end.month}月${value.end.day}日`,
              ]);
            }}
            label="旅行时间"
            className="mt-10"
          />
          <Button
            radius="full"
            className="w-full mx-auto mt-4"
            isLoading={isLoading}
            onClick={() => {
              if (!dateRange[0] || !dateRange[1]) {
                return;
              }
              setLoading(true);
              fetch(`${HOST}/api/generate`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  destination,
                  dateRange,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                  try {
                    const completeMessage = JSON.parse(data.completeMessage);
                    console.log("completeMessage", completeMessage);
                    setTripData([completeMessage, ...tripData]);
                    localStorage.setItem(
                      "tripData",
                      JSON.stringify([completeMessage, ...tripData])
                    );
                  } catch (e) {
                    console.log(e);
                  }
                  setStep(100);
                  setLoading(false);
                });
            }}
          >
            生成
          </Button>
        </>
      </CarouselItem>
      <CarouselItem curStep={step} index={100}>
        <>
          <div className="font-semibold text-2xl flex items-center">
            <div className="">旅行计划</div>
            <div
              className="ml-4 text-3xl text-center w-8 h-8 leading-7 rounded-full bg-[#26355D]"
              onClick={() => {
                setStep(0);
                setDestination("");
                setDateRange(["", ""]);
              }}
            >
              +
            </div>
          </div>
          {tripData.map((trip, index) => {
            return (
              <Card key={index} className="mt-10" isBlurred>
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
                    到达时间：{timeOfDayDic[trip.arrivalTime]}
                  </div>
                  <div className="">
                    {trip.plan.map((plan, index) => {
                      return (
                        <div key={index} className="mt-2">
                          <div className="flex items-center space-x-1">
                            <div className="inline-block text-sm w-6 h-6 p-1 leading-4 text-center rounded-full bg-[#FFDB00]">
                              {+index + 1}
                            </div>
                            <Balancer className="text-base font-semibold">
                              {" "}
                              {plan.activities}{" "}
                            </Balancer>
                            <span>
                              {plan.date.split("-")[1]}/
                              {plan.date.split("-")[2]}
                            </span>
                            <Chip color="secondary" size="sm" className="h-5">
                              {timeOfDayDic[plan.timeOfDay]}
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
        </>
      </CarouselItem>
    </main>
  );
}

const CarouselItem = ({
  curStep,
  index,
  children,
}: {
  curStep: number;
  index: number;
  children: JSX.Element;
}) => {
  return (
    <div
      className={clsx(
        "w-full mt-10 absolute transition-all duration-500",
        curStep < index && "opacity-0 translate-x-[100vw]",
        curStep === index && "opacity-100 translate-x-0",
        curStep > index && "opacity-0 -translate-x-[100vw]"
      )}
    >
      {children}
    </div>
  );
};
