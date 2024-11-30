import { cache } from "react";
import { db } from "@/db/drizzle";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { challengeProgress, courses, units, userProgress } from "./schema";

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
