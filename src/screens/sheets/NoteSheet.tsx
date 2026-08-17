import { useEffect, useState } from "react";
import { useStore } from "../../state/store";
import { BottomSheet, PrimaryButton } from "../../components/ui";

const DEFAULT_NOTE = "Best trip ever because we actually decided things.";

export default function NoteSheet() {
  const { state, dispatch } = useStore();
  const open = state.sheet === "note";
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) setText("");
  }, [open]);

  const submit = () => {
    dispatch({ type: "ADD_NOTE", text: text.trim() || DEFAULT_NOTE });
  };

  return (
    <BottomSheet open={open} onClose={() => dispatch({ type: "CLOSE_SHEET" })}>
      <div className="flex flex-col gap-4 px-5 pb-8 pt-2">
        <h2 className="text-[20px] font-bold tracking-[-0.2px] text-ink-900">
          Leave a note for the film
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Best trip ever because…"
          rows={4}
          className="w-full resize-none rounded-2xl border border-line-300 bg-paper-50 p-4 text-[15px] font-medium leading-snug text-ink-900 placeholder:text-ink-400 focus:border-sunset-500 focus:outline-none"
        />
        <PrimaryButton full onClick={submit}>
          Add note
        </PrimaryButton>
      </div>
    </BottomSheet>
  );
}
