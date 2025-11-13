import ProjectDialog from "@/components/ProjectDialog";
import React from "react";

const ProjectsPage = () => {
  return (
    <div className="w-full pb-10">
      <p className="text-xl md:text-3xl">
        Projects I have{" "}
        <span className="gradient-text font-semibold">designed</span>,{" "}
        <span className="gradient-text font-semibold">created</span> &{" "}
        <span className="gradient-text font-semibold">marketed</span> in
      </p>

      <ProjectDialog />
    </div>
  );
};

export default ProjectsPage;
