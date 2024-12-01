import { cache } from "react";
import { db } from "@/db/drizzle";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import {
  challengeProgress,
  courses,
  lessons,
  units,
  userProgress,
} from "./schema";

export const getUserProgress = cache(async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });
  return data;
});

export const getUnits = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();

  if (!userId || !userProgress || !userProgress.activeCourseId) {
    return [];
  }

  // Truy vấn dữ liệu từ database
  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        with: {
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  // Tái cấu trúc dữ liệu và chỉ lấy thông tin cần thiết
  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }
      // Kiểm tra trạng thái hoàn thành của tất cả các thử thách trong bài học
      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        );
      });

      // Trả về bài học với trạng thái hoàn thành và các thuộc tính thiếu
      return {
        id: lesson.id, // Lấy ID của bài học
        title: lesson.title, // Tiêu đề bài học
        order: lesson.order, // Thứ tự bài học
        unitId: unit.id, // ID của unit
        completed: allCompletedChallenges, // Trạng thái hoàn thành
      };
    });

    // Trả về đơn vị (unit) với thông tin đã được tái cấu trúc
    return {
      id: unit.id, // Lấy ID của unit
      title: unit.title, // Tiêu đề unit
      description: unit.description, // Mô tả unit
      order: unit.order, // Thứ tự unit
      lessons: lessonsWithCompletedStatus, // Các bài học đã được xử lý
    };
  });

  return normalizedData;
});

export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany();
  return data;
});

export const getCoursesById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });
  return data;
});

export const getCourseProgress = cache(async () => {
  {
    const { userId } = await auth();
    const userProgress = await getUserProgress();
    if (!userId || !userProgress?.activeCourseId) {
      return null;
    }
    const unitInActiveCourse = await db.query.units.findMany({
      orderBy: (units, { asc }) => [asc(units.order)],
      where: eq(units.courseId, userProgress.activeCourseId),
      with: {
        lessons: {
          orderBy: (lessons, { asc }) => [asc(lessons.order)],
          with: {
            unit: true,
            challenges: {
              with: {
                challengeProgress: {
                  where: eq(challengeProgress.userId, userId),
                },
              },
            },
          },
        },
      },
    });
    const firstUncompletedLesson = unitInActiveCourse
      .flatMap((unit) => unit.lessons)
      .find((lesson) =>
        //TODO : if something does not work , check the last if clause
        lesson.challenges.some(
          (challenge) =>
            !challenge.challengeProgress ||
            challenge.challengeProgress.length === 0 ||
            challenge.challengeProgress.some(
              (progress) => progress.completed === false
            )
        )
      );
    return {
      activeLesson: firstUncompletedLesson,
      activeLessonId: firstUncompletedLesson?.id,
    };
  }
});

export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  const courseProgress = await getCourseProgress();
  const lessonId = id || courseProgress?.activeLessonId;
  if (!lessonId) {
    return null;
  }
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengeOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });
  if (!data || !data.challenges) {
    return null;
  }
  const normalizedChallenges = data.challenges.map((challenge) => {
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);
    return { ...challenge, completed };
  });
  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();
  if (!courseProgress?.activeLessonId) {
    return 0;
  }
  const lesson = await getLesson(courseProgress.activeLessonId);
  if (!lesson || !lesson.challenges) {
    return 0;
  }
  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );
  const totalChallenges = lesson.challenges.length;
  if (totalChallenges === 0) {
    return 0;
  }
  const percentage = (completedChallenges.length / totalChallenges) * 100;
  return Math.round(percentage);
});
