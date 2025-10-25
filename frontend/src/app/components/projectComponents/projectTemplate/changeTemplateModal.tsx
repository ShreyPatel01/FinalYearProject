import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import listOfFieldOptions from "../../userComponents/createProjectModal/fieldOptions.json";
import listOfProjectOptions from "../../userComponents/createProjectModal/projectOptions.json";
import listOfProjectTemplates from "./projectTemplates.json";

interface ChangeTemplateModalProps {
  onClose: () => void;
  userID: string;
  onTemplateChange: (newProject: string) => void;
}

interface ProjectOption {
  value: string;
  label: string;
}

export const ChangeTemplateModal: React.FC<ChangeTemplateModalProps> = ({
  userID,
  onClose,
  onTemplateChange,
}) => {
  const router = useRouter();
  const [modalStep, setModalStep] = useState(1);
  const [chosenField, setChosenField] = useState("");
  const [chosenProject, setChosenProject] = useState("");
  const [templateCheck, setTemplateCheck] = useState(false);
  const [chosenProjectDetails] = useState({
    field: "",
    project: "",
    members: "",
  });

  const handleClose = () => {
    onClose();
  };

  //Options for field list
  const fieldOptions = listOfFieldOptions.fields.map((option, index) => {
    return (
      <option
        key={option.value}
        value={option.value}
        disabled={index === 0}
        selected={index === 0}
        hidden={index === 0}
      >
        {option.label}
      </option>
    );
  });

  //Handling when the user exits by pressing escape instead of the X button
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    // Add the event listener when the component mounts
    document.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener
    );
    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener
      );
    };
  }, [onClose]);

  //Setting project options after user has chosen a field
  const generateProjectOptions = () => {
    if (chosenField) {
      const projectOptions =
        listOfProjectOptions[chosenField as keyof typeof listOfProjectOptions];
      return projectOptions.map((option: ProjectOption, index: number) => (
        <option
          key={option.value}
          value={option.value}
          disabled={index === 0}
          selected={index === 0}
          hidden={index === 0}
        >
          {option.label}
        </option>
      ));
    }
    return [];
  };

  const sendToCreationPage = async () => {
    try {
      const finalProjectOptions = {
        ...chosenProjectDetails,
        field: chosenField,
        project: chosenProject,
        members: userID,
      };
      console.log(finalProjectOptions);
      const response = await axios.post(
        "/api/projects/sendToProjectPage",
        finalProjectOptions
      );
      console.log("Sending to next page", response.data);
      toast.success("Generating project form page");
      const queryString = new URLSearchParams(
        Object.entries(finalProjectOptions)
      ).toString();
      console.log(queryString);
      setTimeout(() => {
        router.push(`/user/createProject?${queryString}`);
      }, 150);
    } catch (error: any) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (chosenField && chosenProject) {
      if (modalStep !== 3) {
        sendToCreationPage();
      }
    }
  }, [chosenField, chosenProject, modalStep]);

  const handleNewTemplate = () => {
    onTemplateChange(chosenProject);
  };

  //Closing modal when the user views another template
  const closeDialogForNewTemplate = () => {
    const dialog = document.getElementById(
      "changeTemplateModal"
    ) as HTMLDialogElement;
    if (dialog) {
      onClose();
    }
  };

  return (
    <dialog id="changeTemplateModal" className="modal">
      <div className="modal-box bg-slate-50">
        <form method="dialog">
          <button
            className="btn btn-md btn-circle btn-ghost absolute right-2 top-2 text-black"
            onClick={handleClose}
          >
            ✕
          </button>
        </form>
        {/* Modal Step 1 Content - Asking if the user wants to create the same project */}
        {modalStep === 1 && (
          <>
            <div>
              <h2 className="text-center mt-4 text-lg">
                Would you like to create the same project?
              </h2>
              <div className="flex w-full justify-evenly mt-4">
                <button
                  className="btn btn-info text-white text-lg"
                  onClick={() => {
                    if (typeof window !== undefined) {
                      const project = window.location.search
                        .split("=")[1]
                        .replace(/%20/g, " ");
                      console.log(`project: ${project}`);
                      const template =
                        listOfProjectTemplates[
                          project as keyof typeof listOfProjectTemplates
                        ];
                      const field = template[0].field;
                      console.log(`field: ${field}`);
                      setChosenProject(project.toString());
                      setChosenField(field.toString());
                    }
                  }}
                >
                  Yes
                </button>
                <button
                  className="btn bg-red-600 hover:bg-red-700 border-none text-white text-lg"
                  onClick={() => setModalStep(2)}
                >
                  No
                </button>
              </div>
            </div>
          </>
        )}
        {/* Modal Step 2 Content - Listing the field options */}
        {modalStep === 2 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold">Select a Field</h2>
            <select
              className="select bg-slate-700 select-bordered w-full text-white mt-4"
              value={chosenField}
              onChange={(e) => setChosenField(e.target.value)}
            >
              {fieldOptions}
            </select>
            <div className="flex justify-center">
              <button
                className="flex flex-col mt-4 btn bg-blue-600 hover:bg-blue-700 text-white border-none hover:border-none"
                onClick={() => setModalStep(3)}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {/* Modal Step 3 Content - Listing the project options */}
        {modalStep === 3 && (
          <>
            <div className="mt-8">
              <h2 className="text-xl font-bold">Select a Project</h2>
              <select
                className="select select-bordered w-full bg-slate-700 text-white mt-4"
                onChange={(e) => setChosenProject(e.target.value)}
              >
                {generateProjectOptions()}
              </select>
              <div>
                <div className="form-control mt-2">
                  <label className="label cursor-pointer">
                    <span className="label-text text-black">
                      Tick the checkbox if you want to use a template
                    </span>
                    <input
                      type="checkbox"
                      className="checkbox border-stone-400 border-2"
                      checked={templateCheck}
                      onChange={(e) => setTemplateCheck(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  className="flex flex-col btn btn-info text-white"
                  onClick={() => setModalStep(2)}
                >
                  Back
                </button>
                {templateCheck ? (
                  <button
                    className="flex flex-col btn btn-info ml-4 text-white"
                    onClick={() => {
                      handleNewTemplate();
                      closeDialogForNewTemplate();
                    }}
                  >
                    View Template
                  </button>
                ) : (
                  <button
                    className="flex flex-col btn btn-info ml-4 text-white"
                    onClick={sendToCreationPage}
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
};
