"use client";

import { challenges, challengeOptions } from "@/db/schema";
import { useState } from "react";
import Header from "./header";
import QuestionBubble from "./question-bubble";
import Challenge from "./challenge";
import Footer from "./footer";

type Props = {
  initialLessonId: number;
  initialLessonChallenges: (typeof challenges.$inferSelect & {
    completed: boolean;
    challengeOptions: (typeof challengeOptions.$inferSelect)[];
  })[];
  initialHearts: number;
  initialPercentage: number;
  userSubscriptions: any;
};

const Quiz = ({
  initialLessonId,
  initialLessonChallenges,
  initialHearts,
  initialPercentage,
  userSubscriptions,
}: Props) => {
  const [hearts, setHearts] = useState(initialHearts);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [challenges] = useState(initialLessonChallenges);
  const [activeIndex, setActiveIndex] = useState(() => {
    const uncompltedIndex = challenges.findIndex(
      (challenges) => !challenges.completed
    );
    return uncompltedIndex === -1 ? 0 : uncompltedIndex;
  });

  const [selectedOption, setSelectedOption] = useState<number>();
  const [status, setStatus] = useState<"correct" | "wrong" | "none">("none");
  const challenge = challenges[activeIndex];
  const options = challenge?.challengeOptions ?? [];

  const onSelect = (id: number) => {
    if (status !== "none") return;
    setSelectedOption(id);
  };

  const title =
    challenge.type === "ASSIST"
      ? "Select the correct meaning"
      : challenge.question;
  return (
    <div className="">
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubcription={!!userSubscriptions?.isActive}
      />
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="lg:min-h-[350px] lg:w-[600px] w-full px-6 lg:px-0 flex flex-col gap-y-12 ">
          <h1 className="text-lg lg:text-3xl text-center lg:text-start  font-bold text-neutral-700">
            {title}
          </h1>
          <div>
            {challenge.type === "ASSIST" && (
              <QuestionBubble question={challenge.question} />
            )}
            <Challenge
              options={options}
              onSelect={onSelect}
              status={status}
              selectedOption={selectedOption}
              disabled={false}
              type={challenge.type}
            />
          </div>
        </div>
      </div>
      <Footer
        disabled={!selectedOption}
        status={status}
        onCheck={() => {}}
      ></Footer>
    </div>
  );
};

export default Quiz;
