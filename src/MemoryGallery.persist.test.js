import { render, screen } from "@testing-library/react";
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
