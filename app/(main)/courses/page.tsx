import { getCourses } from "@/db/queries";
import ListCourse from "./list";

const CoursesPage = async () => {
  const courses = await getCourses();
  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="text-2xl font-bold text-neutral-700">Language Course</h1>
      <ListCourse courses={courses} activeCourseId={1}></ListCourse>
    </div>
  );
};

export default CoursesPage;
