# Arab learn

বাংলাদেশের মাদ্রাসা শিক্ষার্থীদের আরবি পাঠ, শব্দভান্ডার ও পরীক্ষার অনুশীলন। বাংলা UI, আরবি RTL, সব লেখায় serif ফন্ট। মোবাইলে চারটি ট্যাব: হোম, লেসন, পরীক্ষা, সেটিংস। কম্পিউটারে পাশের মেনু।

## এখন যা ব্যবহার করা যাবে

- ইমেইল/পাসওয়ার্ড লগইন, সাইন আপ, পাসওয়ার্ড রিসেট; Google লগইন বোতাম (নিচের provider setup প্রয়োজন)।
- নাহু/সরফ/কায়দার পাঠ, সম্পন্ন চিহ্ন ও শব্দভান্ডারের ফ্ল্যাশকার্ড।
- তিনটি মূল পরীক্ষা শাখা; MCQ তাৎক্ষণিক ফল, বোর্ড শাখায় সৃজনশীল উত্তর দেখা ও নিজে সঠিক/ভুল চিহ্ন দেওয়া।
- সংরক্ষিত ভুল, পুনরায় অনুশীলন, আজকের পয়েন্ট, স্ট্রিক ও দুর্বল বিষয়।
- প্রোফাইলের নাম/ছবি, লাইট/ডার্ক/ডিভাইস থিম, ব্লগ ও কমিউনিটি।
- ছয় পাতার অ্যাডমিন প্যানেল, CSV/Excel থেকে পেস্ট করে আমদানি, ম্যানুয়াল সাবস্ক্রিপশন।

AI, অডিও, টাইমার, লিডারবোর্ড, পাঠশেষের কুইজ, অফার ও অনলাইন পেমেন্ট গেটওয়ে নেই।

## ১. বর্তমান মালিকের করণীয়

বর্তমান Supabase-এ migration ও seed ইতিমধ্যে প্রয়োগ করা হয়েছে; **আবার চালাবেন না**। প্রথম অ্যাডমিন ইমেইল একবারের সেটআপে নির্ধারিত হয়েছে। সেই ইমেইলে লগইন করে সেটিংস থেকে “অ্যাডমিন প্যানেল” খুলুন।

1. **সাইট সেটিংস → পেমেন্টের WhatsApp:** `8801XXXXXXXXX` নমুনা নম্বর বদলে দেশের কোডসহ আসল নম্বর দিন। বার্তায় `{plan}`, `{price}`, `{name}`, `{email}` চারটি রাখুন।
2. **ম্যানেজমেন্ট → প্ল্যান:** নাম, মূল্য, দিনের সংখ্যা ও সুবিধা যাচাই করুন। শুরুতে থাকা দাম নমুনা; অ্যাডমিন থেকে পরিবর্তন করা যায়।
3. **লেসন / পরীক্ষা:** নমুনা বিষয়বস্তু দেখে নিজের লেখা যোগ করুন এবং প্রকাশ করুন। কোনো বিষয়বস্তু প্রকাশের আগে বিনামূল্যের সীমা/ফ্রি চিহ্ন যাচাই করুন।
4. **সাইট সেটিংস:** আসল যোগাযোগ, কমিউনিটি ও ব্লগ যোগ করুন।
5. Google ও ইমেইল সেটআপ নিচের মতো সম্পন্ন করুন। সাধারণ কনটেন্ট/প্ল্যান/সাবস্ক্রিপশন ব্যবস্থাপনায় SQL লাগে না।

## ২. Google ও ইমেইল লগইন সেটআপ

এই অ্যাপ আপনার নিজের Supabase ব্যবহার করে। Google provider স্বয়ংক্রিয়ভাবে চালু হয় না; বর্তমান hosted configuration এখানে যাচাই করা হয়নি।

### Supabase → Authentication → URL Configuration

- **Site URL:** প্রকাশিত সাইটের আসল ঠিকানা দিন (প্রকাশ করার পরে)।
- **Redirect URLs:** প্রতিটি ব্যবহার করা origin-এর নিচের দুই ঠিকানা অনুমোদন করুন:
  - `https://YOUR-SITE/auth?mode=login`
  - `https://YOUR-SITE/reset-password`
- বর্তমান preview-এর জন্য:
  - `https://id-preview--0549d745-a609-45b9-adb1-5df74e4209cd.lovable.app/auth?mode=login`
  - `https://id-preview--0549d745-a609-45b9-adb1-5df74e4209cd.lovable.app/reset-password`
- স্থানীয় পরীক্ষায় `http://localhost:8080/auth?mode=login` ও `http://localhost:8080/reset-password` যোগ করুন।

### Google Cloud Console

1. Google Cloud project খুলে OAuth consent screen তৈরি করুন। Supabase project's domain অনুমোদিত domain হিসেবে দিন। Scopes: `openid`, `email`, `profile`।
2. Credentials → Create credentials → OAuth client ID → **Web application**।
3. Authorized JavaScript origins-এ সাইটের origin দিন (পথ ছাড়া)।
4. Authorized redirect URI-তে **Supabase → Authentication → Providers → Google** প্যানেলে দেখানো callback URL হুবহু দিন; এটি অ্যাপের `/auth` URL নয়।
5. তৈরি হওয়া client ID ও secret শুধু Supabase Google provider প্যানেলে দিন এবং provider চালু করুন। Secret কোডে বা চ্যাটে দেবেন না।
6. Google consent app Testing অবস্থায় থাকলে প্রয়োজনীয় test users যোগ করুন; সাধারণ ব্যবহারকারীর জন্য Google-এর প্রকাশ/যাচাইয়ের শর্ত পূরণ করুন।
7. Google পরীক্ষা করুন প্রকাশিত সাইটে বা preview নতুন ট্যাবে খুলে, editor-এর ভেতরের preview-এ নয়।

ইমেইল confirmation ও reset delivery পরীক্ষা করুন। নিজের SMTP/email templates চাইলে Supabase Authentication-এর email settings-এ সেট করুন। Supabase-এর password security-তে leaked-password protection চালু করার সুযোগ থাকলে চালু করুন; আগে এটি বন্ধ থাকার সতর্কতা ছিল।

## ৩. অ্যাডমিনের দৈনন্দিন ব্যবহার

- **লেসন:** গ্রুপ খুলে পাঠ যোগ/সম্পাদনা, ছবি, প্রকাশ/অপ্রকাশ, উপরে/নিচে সাজানো। ফ্রি সীমা শুধু প্রকাশিত পাঠের প্রথম Nটি। শব্দভান্ডারে topic-এর ফ্রি/প্রিমিয়াম চিহ্ন দিন।
- **পরীক্ষা:** মূল তিনটি শাখা মুছতে পারবেন না। উপফোল্ডার ও প্রশ্ন যোগ করুন। সৃজনশীল শুধু বোর্ড শাখায়; ক–ঘ-এর নম্বর ডিফল্ট ১/২/৩/৪, পরিবর্তনযোগ্য। অন্য শাখায় শুধু MCQ; চারটি অপশনের একটি সঠিক।
- **আমদানি:** খোলা গ্রুপ/topic/folder-এ CSV আপলোড বা Sheets/Excel থেকে পেস্ট করুন। template download, প্রথম ২০ সারির preview, সারিভিত্তিক ভুল, ভুল সারি বাদ দেওয়া ও নিশ্চিতকরণের পরে batch save। কোনো path column দরকার নেই।
- **ম্যানেজমেন্ট:** ছাত্রের ইমেইল খুঁজে প্ল্যান দিন; bKash/Nagad ও payment note সংরক্ষণ করুন। চালু প্ল্যান থাকলে শেষ তারিখের পরে নতুন দিনের মেয়াদ যুক্ত হয়; না থাকলে আজ থেকে। বাতিল করতে cancel ব্যবহার করুন।
- **রিপোর্ট:** ছাত্রের সমস্যা ও প্রশ্ন দেখুন, প্রয়োজনে সম্পাদনা, status ও উত্তর পাঠান। ছাত্র নিজের উত্তর পড়া হয়েছে চিহ্ন দিতে পারে।
- **সাইট সেটিংস:** যোগাযোগ, WhatsApp নম্বর/বার্তা, ব্লগের cover, লেখা ও প্রকাশ।

### ম্যানুয়াল পেমেন্ট

ছাত্র প্ল্যান বেছে WhatsApp-এ পূর্বলিখিত বার্তা পাঠাবে → অ্যাডমিন সেখানে bKash/Nagad নম্বর দেবেন → পেমেন্ট যাচাই করে অ্যাডমিন সাবস্ক্রিপশন চালু করবেন। **WhatsApp খুললে বা বার্তা পাঠালে প্রিমিয়াম স্বয়ংক্রিয়ভাবে চালু হয় না।**

## ৪. প্রকাশের আগে পরীক্ষার তালিকা

- [ ] নতুন সাধারণ ছাত্রের সাইন আপ/ইমেইল নিশ্চিতকরণ/লগইন ও পাসওয়ার্ড রিসেট।
- [ ] Google return-এর পরে হোমে যাওয়া; refresh-এ সেশন থাকা।
- [ ] নাম/ছবি বদলে reload; তিনটি থিম সংরক্ষণ ও device theme পরিবর্তন।
- [ ] ফ্রি ছাত্র প্রথম Nটি প্রকাশিত পাঠ পড়তে পারে, প্রিমিয়াম বিষয়বস্তু সরাসরি অনুরোধেও পায় না।
- [ ] পাঠ সম্পন্ন দুইবার করলে একবারই গণনা; প্রশ্নের ফল, পয়েন্ট, ভুলের তালিকা ও দুর্বল বিষয় আপডেট।
- [ ] ভুল আবার সঠিক দিলে resolved; সৃজনশীলের প্রতিটি অংশ self-mark ও শেষ ফল।
- [ ] WhatsApp বার্তায় আসল প্ল্যান, বর্তমান দাম, নাম ও ইমেইল; activate/cancel/expiry-এর পরে access সঠিক।
- [ ] রিপোর্ট পাঠিয়ে অ্যাডমিনের উত্তর পড়া; published ব্লগ ও active community link দেখা।
- [ ] 360px ফোনে দীর্ঘ বাংলা/আরবি লেখা, ছবিসহ পাঠ, টেবিল, প্রশ্ন, চারটি ট্যাব ও কিবোর্ড।
- [ ] অ্যাডমিনে CRUD, reorder, CSV/paste, delete confirmation ও subscriber search।

স্বয়ংক্রিয় unit tests ও signed-out browser checks চালানো হয়েছে। বাইরের Supabase-এর signed-in session এই workspace-এ পাওয়া যায় না, তাই উপরের authenticated flow-গুলো বাস্তব অ্যাকাউন্টে মালিককে পরীক্ষা করতে হবে। Google provider, email delivery ও প্রকৃত WhatsApp payment এখনও যাচাইকৃত নয়।

## ৫. নিরাপত্তা ও ছবি

- Role আলাদা `user_roles`-এ; profile update করে কেউ অ্যাডমিন হতে পারে না। UI লুকানো নিরাপত্তা নয়: RLS ও access functions premium content আটকায়। অ্যাডমিনের কাজ signed-in client + admin-checked RPC দিয়ে হয়।
- ছবি Supabase Storage API দিয়ে আপলোড। `content-images` private (অ্যাডমিন upload), `avatars` private (নিজের user-ID folder)। Avatar JPG/PNG/WebP সর্বোচ্চ ২ MB; content image সর্বোচ্চ ৫ MB।
- সংরক্ষিত signed image URL দীর্ঘমেয়াদি bearer link: যার কাছে URL আছে সে মেয়াদের মধ্যে ছবি খুলতে পারে। এগুলোতে গোপন তথ্য রাখবেন না; পুরোনো content link প্রিমিয়াম শেষ হলেও ছবির আলাদা মেয়াদ পর্যন্ত চলতে পারে। Premium লেখার access RLS-এ সুরক্ষিত।
- অ্যাডমিনের content লেখা HTML sanitize করে দেখানো হয়। আগের function-execution/security warnings এখনও আলাদা পর্যালোচনার বিষয়; শুধু linter warning হওয়া বা না হওয়া নিরাপত্তার পূর্ণ প্রমাণ নয়।

## ৬. ডেভেলপারের জন্য স্থানীয় চালানো

React 19, TypeScript, TanStack Start/Router, Vite, Tailwind v4, Supabase। এটি plain static React SPA নয়; React Router DOM যোগ করবেন না।

```sh
bun install
bun run dev
bun run test
```

Browser config: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`। Server config: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`; privileged server operation থাকলে শুধু server-এ `SUPABASE_SERVICE_ROLE_KEY`। **Private key-এর নাম `VITE_` দিয়ে শুরু করবেন না**। Secret `.env` commit করবেন না।

### নতুন Supabase-এ একবারের সেটআপ (বর্তমান project-এর জন্য নয়)

`supabase/migrations/`-এর সফল migration-গুলো timestamp ক্রমে apply করুন; ব্যর্থ/retry history থাকলে আগে পরীক্ষা করুন। প্রথম seed-এ `initial_admin_email` / `PUT MY EMAIL HERE` সেটিং নিজের ইমেইলে নির্ধারণ করুন—এটাই একবারের admin setup; signup trigger ও বিদ্যমান profile-এর ভূমিকা সেট হয়। Buckets `content-images` (private, ৫ MB) ও `avatars` (private, ২ MB) Storage dashboard/API দিয়ে তৈরি করুন; bucket তৈরি migration-এ নেই, access policies আছে। একবারের infrastructure setup-এর পরে কনটেন্ট পরিচালনায় SQL দরকার নেই। Production data-র backup নিয়ে migration apply করুন; seed আবার চালিয়ে duplication করবেন না।

## ৭. প্রকাশ করা

এই ফেজে সাইট প্রকাশ করা হয়নি। Lovable editor-এর **Publish** থেকে প্রকাশ করুন অথবা চ্যাটে স্পষ্টভাবে প্রকাশ করতে বলুন। প্রকাশিত URL পাওয়ার পরে Supabase Site URL/Redirect URLs ও Google authorized origins আপডেট করুন এবং উপরের checklist চালান। পরের কোড পরিবর্তন প্রকাশিত সাইটে দিতে আবার Publish changes করতে হবে; database migration সাধারণত backend-এ তখনই প্রযোজ্য হয়।

বর্তমান hosting preset Cloudflare-compatible TanStack Start runtime। শুধু `dist` static files Vercel/Netlify-এ তুলে পূর্ণ অ্যাপ চালু হওয়ার নিশ্চয়তা নেই; অন্য hosting-এর জন্য উপযুক্ত TanStack Start/Nitro adapter ও server পরিবেশ সেট করে আলাদা deployment যাচাই করতে হবে। Lovable self-hosting guide: https://docs.lovable.dev/tips-tricks/self-hosting ।
