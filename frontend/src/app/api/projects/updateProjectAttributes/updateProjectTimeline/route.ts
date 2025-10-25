import { connect } from "@/src/dbConfig/dbConfig";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import Project from "@/src/models/projectModel";
import KanbanBoard from "@/src/models/kanbanBoardModel";
import Sprint from "@/src/models/sprintModel";

connect();
//Creates a new sprint
export async function POST(request: NextRequest) {
  try {
    let errors = [];

    const requestBody = await request.json();
    console.log("requestBody received from createNewSprintModal");
    const newStartDate = new Date(requestBody.newStartDate);
    const newEndDate = new Date(requestBody.newEndDate);
    const newProjectDeadline = new Date(requestBody.newProjectDeadline);
    const newSprintLength = requestBody.newSprintLength;
    const projectID = requestBody.projectID;
    const selectedSprint = requestBody.selectedSprint;

    console.log(`details from requestBody`);
    console.log(newStartDate);
    console.log(newEndDate);
    console.log(newSprintLength);
    console.log(newProjectDeadline);
    console.log(projectID);
    console.log(selectedSprint);
    console.log("--------------------------------------");

    //Getting Project and Kanban Board from projectID
    const project = await Project.findOne({ _id: projectID });
    if (project) {
      const kanbanBoardID = project.kanbanBoard;
      const kanbanBoard = await KanbanBoard.findOne({ _id: kanbanBoardID });

      if (kanbanBoard) {
        //Finding sprintNo for seletedSprint
        const sprintBeforeNewSprint = await Sprint.findOne({
          _id: selectedSprint,
        });
        const previousSprintNo = sprintBeforeNewSprint.sprintNo;
        //Setting new sprint's sprintNo
        const newSprintNo = previousSprintNo + 1;

        //Checking if newStartDate occurs before the previous sprint's end date
        const previousEndDate = new Date(sprintBeforeNewSprint.endDate);
        if (previousEndDate > newStartDate) {
          errors.push(
            "The new start date can't be before the previous sprint's end date"
          );
        }

        //Returning errors for toast messages if they exist
        if (errors.length > 0) {
          return NextResponse.json({ errors }, { status: 400 });
        }

        //Creating new Sprint
        const newSprint = new Sprint({
          kanbanBoard: kanbanBoard._id,
          sprintNo: newSprintNo,
          startDate: newStartDate,
          endDate: newEndDate,
          sprintLength: newSprintLength,
          projectID: project._id,
        });
        //Saving newSprint and assigning to savedSprint
        const savedSprint = await newSprint.save();
        //Updating kanbanBoard.sprints with savedSprint._id at correct index
        await KanbanBoard.findOneAndUpdate(kanbanBoard._id, {
          $push: {
            sprints: {
              $each: [savedSprint._id],
              $position: newSprintNo - 1,
            },
          },
        });
        //Storing updated kanbanBoard.sprints in array
        const sprintIDs = kanbanBoard.sprints;
        sprintIDs.splice(previousSprintNo, 0, savedSprint._id);
        console.log(`sprintIDs from kanbanBoard = ${sprintIDs}`);
        //Getting the sprints after savedSprint in sprintIDs and their indexes
        const sprintsAfterSavedSprint = sprintIDs
          .slice(newSprintNo)
          .map((sprintID: any, index: any) => {
            return {
              id: sprintID,
              index: newSprintNo + index,
            };
          });
        console.log("Sprints that need updating and their index in sprintIDs");
        console.log(sprintsAfterSavedSprint);
        console.log("---------------------------------");
        //Updating sprintNo and dates for sprints after savedSprint
        if (sprintsAfterSavedSprint.length > 0) {
          let updatedStartDate = newEndDate;
          for (let i = 0; i < sprintsAfterSavedSprint.length; i++) {
            const sprintID = sprintsAfterSavedSprint[i].id;
            //Checking if sprint with sprintID exists
            const sprint = await Sprint.findOne({ _id: sprintID });
            if (sprint) {
              //Calculating endDate for the specific sprint
              const updatedEndDate = new Date(
                updatedStartDate.getTime() +
                  sprint.sprintLength * 24 * 60 * 60 * 1000
              );
              const updatedSprintNo = sprintsAfterSavedSprint[i].index + 1;
              console.log(`old sprintNo = ${sprintsAfterSavedSprint[i].index}`);
              console.log(`updatedSprintNo = ${updatedSprintNo}`);
              console.log(
                `updatedStartDate for sprint ${updatedSprintNo} = ${updatedStartDate}`
              );
              console.log(
                `updatedEndDate for sprint ${updatedSprintNo} = ${updatedEndDate}`
              );
              //Updating the sprint with new values for dates and sprintNo
              await Sprint.updateOne(
                { _id: sprint._id },
                {
                  $set: {
                    sprintNo: updatedSprintNo,
                    startDate: updatedStartDate,
                    endDate: updatedEndDate,
                  },
                }
              );
              //Setting updatedStartDate for the next sprint to be updated
              updatedStartDate = updatedEndDate;
              console.log(
                `updatedStartDate has been changed to ${updatedStartDate}`
              );
              console.log("------------------------------");
            }
          }
        }
        //Updating the project's deadline and number of sprints
        await Project.updateOne(
          { _id: project._id },
          {
            $set: {
              numberOfSprints: sprintIDs.length,
              estimatedCompletion: newProjectDeadline,
            },
          }
        );
      }

      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message, status: 500 });
  }
}

//Updates either the project deadline or sprint information based on the action sent in requestBody
export async function PUT(request: NextRequest) {
  const requestBody = await request.json();
  const action = requestBody.action;

  switch (action) {
    case "updateProjectDeadline":
      return updateProjectDeadline(requestBody);
    case "updateSprints":
      return updateSprints(requestBody);
  }
}

//Updates the project deadline
async function updateProjectDeadline(requestBody: any) {
  try {
    let errors = [];
    const lastSprint = requestBody.lastSprint;
    const lastSprintEndDate = new Date(lastSprint.endDate);
    const newProjectDeadline = new Date(requestBody.newProjectDeadline);
    const projectID = requestBody.projectID;

    if (lastSprintEndDate > newProjectDeadline) {
      errors.push(
        "The new project deadline can't be before the end of the last sprint"
      );
    }

    //Ends the function early if there's an error with the user's input for newProjectDeadline
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const project = await Project.findOne({ _id: projectID });
    if (project) {
      await Project.updateOne(
        { _id: project._id },
        { $set: { estimatedCompletion: newProjectDeadline } }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateSprints(requestBody: any) {
  try {
    let errors = [];
    const startDate = new Date(requestBody.startDate);
    const endDate = new Date(requestBody.endDate);
    const sprintLength = requestBody.sprintLength;
    const selectedSprintID = requestBody.selectedSprintID;
    const projectID = requestBody.projectID;

    const project = await Project.findOne({ _id: projectID });
    //For comparison with the last updated sprint's endDate
    const originalDeadline = new Date(project.estimatedCompletion);
    const kanbanBoardID = project.kanbanBoard;
    const projectKanbanBoard = await KanbanBoard.findOne({
      _id: kanbanBoardID,
    });
    const sprintIDs = projectKanbanBoard.sprints;
    console.log(`sprintIDs`);
    console.log(sprintIDs);
    console.log(`selectedSprintID = ${selectedSprintID}`);
    //Finding selectedSprintID in sprintIDs and getting its index
    const selectedSprintIndex = sprintIDs.findIndex((sprintID: ObjectId) =>
      sprintID.equals(new ObjectId(selectedSprintID))
    );
    console.log(`selectedSprintIndex is ${selectedSprintIndex}`);
    //Checking if startDate is set before the previous sprint's end date
    if (selectedSprintIndex > 0) {
      console.log(`previousSprintIndex is ${selectedSprintIndex - 1}`);
      console.log("---------------------------------------------------------");
      const previousSprint = await Sprint.findOne({
        _id: sprintIDs[selectedSprintIndex - 1],
      });
      console.log("previous sprint");
      console.log(previousSprint);
      console.log("------------------------------");
      if (new Date(previousSprint.endDate) > startDate) {
        errors.push(
          `Sprint ${
            selectedSprintIndex + 1
          }'s start date can't be before sprint ${
            previousSprint.sprintNo
          }'s end date.`
        );
      }
    }

    //Returning a response early if there's a message in errors
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Sending selectedSprint's new values to database
    await Sprint.updateOne(
      { _id: selectedSprintID },
      {
        $set: {
          startDate: startDate,
          endDate: endDate,
          sprintLength: sprintLength,
        },
      }
    );

    //Getting the sprintIDs after selectedSprintID to update the values of the sprint
    const sprintsAfterSelectedSprint = sprintIDs
      .slice(selectedSprintIndex + 1)
      .map((sprintID: any, index: any) => {
        return {
          id: sprintID,
          index: selectedSprintIndex + 1 + index,
        };
      });

    let updatedStartDate = endDate;
    console.log(`updatedStartDate has been set to ${endDate}`);
    for (let i = 0; i < sprintsAfterSelectedSprint.length; i++) {
      const sprint = await Sprint.findOne({
        _id: sprintsAfterSelectedSprint[i].id,
      });
      //Calculating endDate for the specific sprint
      const updatedEndDate = new Date(
        updatedStartDate.getTime() + sprint.sprintLength * 24 * 60 * 60 * 1000
      );
      //Updating the sprint with the new values
      await Sprint.updateOne(
        { _id: sprint._id },
        { $set: { startDate: updatedStartDate, endDate: updatedEndDate } }
      );
      //Setting up updatedStartDate for the next sprint
      updatedStartDate = updatedEndDate;
      console.log(`updatedStartDate has been changed to ${updatedStartDate}`);
    }

    //Updating project.estimatedCompletion with the final sprint's endDate if the endDate is greater than originalDeadline
    const finalSprintID = sprintIDs[sprintIDs.length - 1].toString();
    const finalSprint = await Sprint.findOne({ _id: finalSprintID });
    const finalSprintEndDate = new Date(finalSprint.endDate);
    if (finalSprintEndDate > originalDeadline) {
      await Project.findByIdAndUpdate(projectID, {
        $set: { estimatedCompletion: finalSprintEndDate },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const queryParams = request.nextUrl.searchParams;
    const sprintID = queryParams.get("sprintID");
    const projectID = queryParams.get("projectID");

    //Finding sprint in db
    const sprintToDelete = await Sprint.findOne({ _id: sprintID });
    if (!sprintToDelete) {
      return NextResponse.json({
        message: "Sprint not found",
        status: 404,
        invalidSprintID: sprintID,
      });
    }
    console.log(`sprint to delete: ${sprintToDelete}`);

    //Finding project in db
    const projectToUpdate = await Project.findOne({ _id: projectID });
    if (!projectToUpdate) {
      return NextResponse.json({
        message: "Project not found",
        status: 404,
        invalidProjectID: projectID,
      });
    }
    console.log(`project to update: ${projectToUpdate}`);

    //Changing projectToUpdate.estimatedCompletion to account for deleted sprint
    const originalDeadline = projectToUpdate.estimatedCompletion;
    const daysToRemove = sprintToDelete.sprintLength;
    const millisecondsToRemove = daysToRemove * 24 * 60 * 60 * 1000;
    const newDeadlineTimestamp =
      originalDeadline.getTime() - millisecondsToRemove;
    const newDeadline = new Date(newDeadlineTimestamp);

    const updatedProject = await Project.updateOne(
      { _id: projectToUpdate._id },
      {
        $set: { estimatedCompletion: newDeadline },
      }
    );
    console.log(`updated project: ${updatedProject}`)

    //Finding Kanban board in db
    const kanbanBoardToUpdate = await KanbanBoard.findOne({
      project: projectToUpdate._id,
    });

    if (!kanbanBoardToUpdate) {
      return NextResponse.json({
        message: "Kanban Board not found",
        status: 404,
        invalidKanbanBoardID: projectToUpdate.kanbanBoard,
      });
    }
    console.log(`kanban board to update: ${kanbanBoardToUpdate}`)

    //Getting list of sprintIDs from kanbanboard
    const sprintIDs = kanbanBoardToUpdate.sprints;
    console.log(`sprintIDs: ${sprintIDs}`)

    //Calculating sprintToDelete index
    let sprintToDeleteIndex = 0;
    if (sprintToDelete.sprintNo > 1) {
      sprintToDeleteIndex = sprintToDelete.sprintNo - 1;
    }

    //Getting sprints after sprintToDeleteIndex
    const sprintsAfterSprintToDelete = sprintIDs.slice(sprintToDeleteIndex + 1);

    for (const sprintID of sprintsAfterSprintToDelete) {
      console.log(sprintID);
      //Finding sprint in DB
      const sprintToUpdate = await Sprint.findOne({ _id: sprintID });
      if (!sprintToUpdate) {
        return NextResponse.json({
          message: "Sprint not found",
          status: 404,
          invalidSprintID: sprintID,
        });
      }

      //Updating sprint start and end date by substracting millisecondsToRemove
      const startDate = sprintToUpdate.startDate;
      const endDate = sprintToUpdate.endDate;
      const newStartDateTimeStamp = startDate.getTime() - millisecondsToRemove;
      const newEndDateTimeStamp = endDate.getTime() - millisecondsToRemove;
      const newStartDate = new Date(newStartDateTimeStamp);
      const newEndDate = new Date(newEndDateTimeStamp);

      //Updating sprint
      await Sprint.updateOne(
        { _id: sprintToUpdate._id },
        { $set: { startDate: newStartDate, endDate: newEndDate } }
      );
    }
    console.log(`kanbanboard id: ${kanbanBoardToUpdate._id}`);
    //Pulling sprintToDelete id from kanbanboard.sprints
    await KanbanBoard.updateOne(
      { _id: kanbanBoardToUpdate._id },
      { $pull: { sprints: sprintToDelete._id } }
    );

    //Deleting sprint to delete
    await Sprint.deleteOne({ _id: sprintToDelete._id });

    return NextResponse.json({
      success: true,
      message: "Deleted sprint",
      deletedSprint: sprintToDelete,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
