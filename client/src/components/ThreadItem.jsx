
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateThread,
  deleteThread,
} from "../services/threads.service";

export default function ThreadItem({ thread }) {
  const [title, setTitle] = useState(thread.title);
  const [editing, setEditing] = useState(false);

  const queryClient = useQueryClient();

  // EDIT mutation: PUT /api/threads/:id
  const editMutation = useMutation({
    mutationFn: ({ id, data }) => updateThread(id, data),

    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["thread", id] });
      setEditing(false);
    },
  });

  // DELETE mutation: DELETE /api/threads/:id
  const deleteMutation = useMutation({
    mutationFn: deleteThread,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  function handleSave() {
    editMutation.mutate({
      id: thread.id,
      data: { title },
    });
  }

  function handleDelete() {
    deleteMutation.mutate(thread.id);
  }

  if (editing) {
    return (
      <li className="card">
        <input
          className="edit-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="row">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={editMutation.isPending}
          >
            {editMutation.isPending ? "Saving…" : "Save"}
          </button>

          <button
            className="btn-ghost"
            onClick={() => {
              setTitle(thread.title);
              setEditing(false);
            }}
            disabled={editMutation.isPending}
          >
            Cancel
          </button>
        </div>

        {editMutation.isError && (
          <p role="alert">
            {editMutation.error?.message || "Failed to update thread."}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className="card">
      <h3>{thread.title}</h3>
      <p>{thread.body}</p>

      <div className="row">
        <button
          className="btn-ghost"
          onClick={() => setEditing(true)}
          disabled={deleteMutation.isPending}
        >
          Edit
        </button>

        <button
          className="btn-danger"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "Deleting…" : "Delete"}
        </button>
      </div>

      {deleteMutation.isError && (
        <p role="alert">
          {deleteMutation.error?.message || "Failed to delete thread."}
        </p>
      )}
    </li>
  );
}
