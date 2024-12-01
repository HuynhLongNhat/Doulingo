"use client";

import { challenges, challengeOptions } from "@/db/schema";
import { useState } from "react";
import Header from "./header";

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

  return (
    <div>
      <Header
        hearts={hearts}
        percentage={percentage}
        hasActiveSubcription={!!userSubscriptions?.isActive}
      />
    </div>
  );
};

export default Quiz;
