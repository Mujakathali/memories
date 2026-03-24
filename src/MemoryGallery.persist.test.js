import { render, screen, waitFor } from "@testing-library/react";
import MemoryGallery, { getNextMemoryId } from "./MemoryGallery";

test("shows locally stored memories for all chapters after reload", async () => {
  const key = "memora_memory_list_v3";
  const sample = [
    {
      id: 101,
      tag: "Coimbatore Days",
      title: "Test Memory",
      date: "Mar 2026",
      note: "Persisted across reload",
      span: "normal",
      type: "media",
      media: [{ kind: "image", src: "/media/photos/one.jpeg" }],
    },
  ];
  window.localStorage.setItem(key, JSON.stringify(sample));

  global.fetch = async () => ({ ok: false });

  render(
    <MemoryGallery
      activeTag="Coimbatore Days"
      onGoHome={() => {}}
      onOpenBook={() => {}}
      onActiveTagChange={() => {}}
    />
  );

  expect(await screen.findByText("Test Memory")).toBeInTheDocument();
});

test("does not reuse deleted ids for newly added memories", () => {
  const list = [{ id: 1 }, { id: 3 }, { id: "8" }];
  const deleted = new Set(["2", "4", "5", "6", "7"]);
  expect(getNextMemoryId(list, deleted)).toBe(9);
});

test("keeps local list as source of truth and does not re-add repo deleted cards", async () => {
  const key = "memora_memory_list_v3";
  const local = [
    {
      id: 2,
      tag: "Adventure",
      title: "Keep Me",
      date: "Mar 2026",
      note: "local",
      span: "normal",
      type: "media",
      media: [{ kind: "image", src: "/media/photos/one.jpeg" }],
    },
  ];
  window.localStorage.setItem(key, JSON.stringify(local));
  window.localStorage.removeItem("memora_deleted_ids_v1");

  global.fetch = async () => ({
    ok: true,
    json: async () => [
      {
        id: 1,
        tag: "Adventure",
        title: "Deleted In Local",
        date: "Mar 2026",
        note: "repo",
        span: "normal",
        type: "media",
        media: [{ kind: "image", src: "/media/photos/one.jpeg" }],
      },
      ...local,
    ],
  });

  render(
    <MemoryGallery
      activeTag="Adventure"
      onGoHome={() => {}}
      onOpenBook={() => {}}
      onActiveTagChange={() => {}}
    />
  );

  expect(await screen.findByText("Keep Me")).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.queryByText("Deleted In Local")).not.toBeInTheDocument()
  );
});
