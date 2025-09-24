import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";

const stages = ["Applied", "Screening", "Interview", "Offer", "Hired"];

export default function CandidatesKanban() {
  const [candidates, setCandidates] = useState({});
  const [previousState, setPreviousState] = useState({});

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const res = await axios.get("/api/candidates");
      const grouped = stages.reduce((acc, stage) => {
        acc[stage] = res.data.filter((c) => c.stage === stage);
        return acc;
      }, {});
      setCandidates(grouped);
    } catch (err) {
      console.error("Error fetching candidates", err);
    }
  }

  async function handleDragEnd(result) {
    if (!result.destination) return;

    const { source, destination } = result;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    const sourceCandidates = Array.from(candidates[sourceStage]);
    const destCandidates = Array.from(candidates[destStage]);

    const [moved] = sourceCandidates.splice(source.index, 1);
    destCandidates.splice(destination.index, 0, { ...moved, stage: destStage });

    // Save for rollback
    setPreviousState(candidates);

    // Optimistic update
    setCandidates({
      ...candidates,
      [sourceStage]: sourceCandidates,
      [destStage]: destCandidates,
    });

    try {
      await axios.patch(`/api/candidates/${moved.id}`, { stage: destStage });
    } catch (err) {
      console.error("Stage update failed, rolling back", err);
      setCandidates(previousState);
      alert("Failed to update candidate stage, rolled back.");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Candidates Kanban</h2>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: "flex",
            gap: "16px",
            overflowX: "auto",
            paddingTop: "10px",
          }}
        >
          {stages.map((stage) => (
            <Droppable droppableId={stage} key={stage} isDropDisabled={false} isCombineEnabled={false}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flex: "0 0 250px",
                    minHeight: "400px",
                    background: snapshot.isDraggingOver ? "#f0f8ff" : "#f9f9f9",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px",
                  }}
                >
                  <h4 style={{ textAlign: "center" }}>{stage}</h4>
                  {candidates[stage]?.map((candidate, index) => (
                    <Draggable
                      key={candidate.id}
                      draggableId={candidate.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            padding: "8px",
                            marginBottom: "8px",
                            borderRadius: "6px",
                            background: snapshot.isDragging
                              ? "#cce7ff"
                              : "#fff",
                            border: "1px solid #ccc",
                            boxShadow: snapshot.isDragging
                              ? "0 2px 6px rgba(0,0,0,0.2)"
                              : "none",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <strong>{candidate.name}</strong>
                          <br />
                          <small>{candidate.email}</small>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
