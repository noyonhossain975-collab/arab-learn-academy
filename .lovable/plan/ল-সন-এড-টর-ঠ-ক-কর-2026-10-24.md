# লেসন এডিটর ঠিক করা

## সমস্যা
অ্যাডমিন লেসন পেজে লেখার জায়গা ও টুলবার আসে না। পৃষ্ঠাটা সারাক্ষণ "লোড হচ্ছে" অবস্থায় আটকে থাকে, তাই লেখা, পেস্ট বা ছবি কিছুই দেওয়া যায় না।

## যা করা হবে
1. লেখার জায়গা ঠিকঠাক দেখাবে: টাইপ করা, পেস্ট করা, শিরোনাম, বোল্ড, তালিকা, টেবিল, আরবি RTL বোতাম আর ছবি আপলোড সব কাজ করবে।
2. আগে বানানো লেসন খুললে তার পুরনো লেখা ঠিকভাবে লোড হবে, খালি দেখাবে না।
3. ব্রাউজারে অ্যাডমিন হিসেবে ঢুকে নতুন লেসন বানিয়ে, লেখা যোগ করে আর সেভ করে আবার খুলে দেখে নিশ্চিত হব।

## Technical details
- `RichEditor.tsx`: remove `useEditorState`; derive toolbar active state from a local `useState` tick updated via editor `onTransaction`/`onSelectionUpdate`, render `EditorContent` as soon as `editor` exists.
- Sync external `value` into the editor when it changes and differs from `editor.getHTML()` (`setContent(value, { emitUpdate: false })`) so loaded lessons appear.
- Verify with Playwright as admin; run existing tests.
