import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import './RichTextEditor.css';

const MenuBar = ({ editor }) => {
	if (!editor) {
		return null;
	}

	const addImage = () => {
		const url = window.prompt('Enter image URL:');
		if (url) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	};

	const setLink = () => {
		const url = window.prompt('Enter URL:');
		if (url) {
			editor.chain().focus().setLink({ href: url }).run();
		}
	};

	return (
		<div className="menu-bar">
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBold().run()}
				className={editor.isActive('bold') ? 'is-active' : ''}
			>
				<strong>B</strong>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleItalic().run()}
				className={editor.isActive('italic') ? 'is-active' : ''}
			>
				<em>I</em>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				className={editor.isActive('underline') ? 'is-active' : ''}
			>
				<u>U</u>
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
				className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
			>
				H2
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
				className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
			>
				H3
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				className={editor.isActive('bulletList') ? 'is-active' : ''}
			>
				• List
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				className={editor.isActive('orderedList') ? 'is-active' : ''}
			>
				1. List
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign('left').run()}
				className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
			>
				Left
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign('center').run()}
				className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
			>
				Center
			</button>
			<button
				type="button"
				onClick={() => editor.chain().focus().setTextAlign('right').run()}
				className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
			>
				Right
			</button>
			<button type="button" onClick={setLink}>
				🔗 Link
			</button>
			<button type="button" onClick={addImage}>
				🖼️ Image
			</button>
			<input
				type="color"
				onInput={(event) => editor.chain().focus().setColor(event.target.value).run()}
				value={editor.getAttributes('textStyle').color || '#000000'}
				title="Text Color"
			/>
		</div>
	);
};

const RichTextEditor = ({ content, onChange }) => {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
			Link.configure({
				openOnClick: false,
			}),
			Image,
			TextStyle,
			Color,
		],
		content: content,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
	});

	return (
		<div className="rich-text-editor">
			<MenuBar editor={editor} />
			<EditorContent editor={editor} />
		</div>
	);
};

export default RichTextEditor;
