# الإعداد السريع للتطبيق

## المشكلة الحالية
التطبيق يعمل لكن هناك مشاكل في تكامل Clerk + Supabase. هذه المشاكل تسبب أخطاء المصادقة لكن التطبيق لا يزال يعمل.

## الحلول الممكنة

### الحل 1: الإعداد الصحيح (موصى به)
1. اذهب إلى [Clerk Dashboard](https://dashboard.clerk.com)
2. اختر تطبيقك
3. اذهب إلى **JWT Templates** في القائمة الجانبية
4. اضغط **New template**
5. أضف اسم القالب: `supabase`
6. في قسم **Claims**، أضف:
   ```json
   {
     "role": "authenticated",
     "user_id": "https://www.clerk.com/v1/user/{{user.id}}",
     "email": "{{user.primaryEmailAddress?.emailAddress}}"
   }
   ```
7. احفظ القالب
8. أعد تشغيل التطبيق: `npm run dev`

### الحل 2: تعطيل RLS مؤقتاً (للتجربة فقط)
إذا لم تنجح الطريقة الأولى، يمكنك تعطيل RLS مؤقتاً:

1. اذهب إلى Supabase Dashboard
2. اذهب إلى SQL Editor
3. نفذ هذه الأوامر:
   ```sql
   ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.columns DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
   ```

### الحل 3: استخدام التطبيق بدون قاعدة بيانات
يمكنك استخدام التطبيق بدون قاعدة بيانات لفهم واجهة المستخدم فقط.

## المتطلبات الأساسية للتشغيل
1. حساب Clerk: https://clerk.com
2. حساب Supabase: https://supabase.com
3. متغيرات البيئة محددة في ملف `.env.local`

## المتغيرات المطلوبة في `.env.local`
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## تشغيل التطبيق
```bash
npm run dev
```

الوصول إلى: http://localhost:3000

## ملاحظات
- الأخطاء الحمراء في Console طبيعية في البداية
- التطبيق يعمل لكن بعض الميزات قد لا تعمل دون إكل Clerk + Supabase
- بعد تسجيل الدخول، يجب أن تعمل لوحة التحكم (/dashboard) بشكل صحيح