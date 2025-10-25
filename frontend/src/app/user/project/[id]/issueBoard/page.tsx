"use client";
import ProjectSidebar from "@/src/app/components/projectComponents/projectSidebar/projectSidebar";
import ProjectNavbar from "@/src/app/components/userComponents/navbar/projectNavbar";
import KanbanBoard from "@/src/app/components/projectComponents/kanbanBoard/kanbanBoard";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";

const IssueBoardPage = () => {
  const pathname = usePathname();
  const slug = pathname.split("/").pop()?.toString() ?? "";
  console.log("Slug: " + slug);

  return (
    <main>
      <ProjectNavbar />
      <div className="flex flex-row pt-2 px-24 w-full min-h-screen bg-white text-black">
        <KanbanBoard />
      </div>
      <Toaster position="bottom-right" />
    </main>
  );
};

export default IssueBoardPage;
