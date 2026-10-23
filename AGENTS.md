<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Roles live in `public.user_roles` (checked via `is_admin()`/`has_role()`), never on profiles — prevents self-promotion via profile updates.
- Premium locking is enforced by RLS using `can_access_lesson/can_access_vocab_topic/can_access_folder`; locked lesson titles come from `get_group_lessons()` RPC — so free users can never fetch premium content directly.
- Exam content is a self-referencing `exam_folders` tree with 3 system roots (`root_key`); creative questions only allowed under `board_past` (DB trigger).
- Admin writes use the normal signed-in client + RLS + admin RPCs; no service-role key in the browser.
- "Day" is Asia/Dhaka via `dhaka_today()`; `touch_last_seen()` creates the daily_activity row on app open.
- Signed-in student pages live under `src/routes/_authenticated/` (client-only gate, shared bottom nav in its layout) — keeps auth in one place.
- Content images live in the private `content-images` bucket (workspace blocks public buckets); embed long-lived signed URLs via `src/lib/upload.ts`.
- All admin CSV/paste imports go through `src/components/admin/BulkImport.tsx` (`parseImportText` is unit-tested) — one parser for every content type.
- Rich content is stored as sanitized HTML (`src/lib/content.ts`); render with the `.lesson-content` class.
- Exam admin navigation uses folder/question search parameters and focused exam components; saves/import batches use admin-checked invoker RPCs to keep questions and child answers atomic while preserving existing answer identifiers.
- Admin leaf routes use shared metadata defaults with distinct page titles and descriptions so private administration pages have complete, consistent head tags.
