import { getCourses, getUserProgress } from "@/db/queries";
import ListCourse from "./list";

const CoursesPage = async () => {
  const coursesData = await getCourses();
  const userProgressData = await getUserProgress();
  //Chạy song song hai hàm bằng Promise.all, giúp tiết kiệm thời gian.
  //Khi cả hai hàm hoàn tất, kết quả sẽ được gán vào hai biến courses và userProgress.
  const [courses, userProgress] = await Promise.all([
    coursesData,
    userProgressData,
  ]);
  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="text-2xl font-bold text-neutral-700">Language Course</h1>
      <ListCourse
        courses={courses}
        activeCourseId={userProgress?.activeCourseId}
      ></ListCourse>
    </div>
  );
};

export default CoursesPage;
