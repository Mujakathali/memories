import { render, screen } from "@testing-library/react";
import MemoryGallery from "./MemoryGallery";

test("shows locally stored memories for hidden chapters after reload", async () => {
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
