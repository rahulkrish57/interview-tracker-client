import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import "../styles/richtexteditor.css";

const TOOLBAR_BUTTONS = [
  { action: "bold", icon: "B", title: "Bold", style: { fontWeight: 800 } },
  {
    action: "italic",
    icon: "I",
    title: "Italic",
    style: { fontStyle: "italic" },
  },
  { action: "bulletList", icon: "≡", title: "Bullet List", style: {} },
  { action: "orderedList", icon: "1.", title: "Ordered List", style: {} },
  { action: "blockquote", icon: "❝", title: "Blockquote", style: {} },
  {
    action: "codeBlock",
    icon: "</>",
    title: "Code Block",
    style: { fontFamily: "monospace", fontSize: 11 },
  },
];

function Toolbar({ editor }) {
  if (!editor) return null;

  const handleAction = (action) => {
    const chain = editor.chain().focus();
    switch (action) {
      case "bold":
        chain.toggleBold().run();
        break;
      case "italic":
        chain.toggleItalic().run();
        break;
      case "bulletList":
        chain.toggleBulletList().run();
        break;
      case "orderedList":
        chain.toggleOrderedList().run();
        break;
      case "blockquote":
        chain.toggleBlockquote().run();
        break;
      case "codeBlock":
        chain.toggleCodeBlock().run();
        break;
    }
  };

  return (
    <div className="rte-toolbar">
      {TOOLBAR_BUTTONS.map((btn) => (
        <button
          key={btn.action}
          type="button"
          className={`rte-btn ${editor.isActive(btn.action) ? "active" : ""}`}
          onClick={() => handleAction(btn.action)}
          title={btn.title}
          style={btn.style}
        >
          {btn.icon}
        </button>
      ))}

      <div className="rte-divider" />

      <button
        type="button"
        className="rte-btn"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo"
      >
        ↩
      </button>
      <button
        type="button"
        className="rte-btn"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo"
      >
        ↪
      </button>
    </div>
  );
}

function RichTextEditor({ onSubmit, disabled }) {
  const [isEmpty, setIsEmpty] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Add a comment... (supports bold, lists, code blocks)",
      }),
    ],
    editorProps: {
      attributes: {
        class: "rte-editor-area",
      },
    },
    onUpdate: ({ editor }) => {
      setIsEmpty(editor.isEmpty);
    },
  });

  const handleSubmit = async () => {
    if (!editor || editor.isEmpty) return;

    const html = editor.getHTML();
    const text = editor.getText();

    await onSubmit({ html, text });
    editor.commands.clearContent();
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="rte-wrapper" onKeyDown={handleKeyDown}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="rte-footer">
        <span className="rte-hint">Ctrl+Enter to post</span>
        <button
          type="button"
          className="comment-submit"
          onClick={handleSubmit}
          disabled={disabled || !editor || isEmpty}
        >
          {disabled ? "..." : "Post"}
        </button>
      </div>
    </div>
  );
}

export default RichTextEditor;
