# إعداد Clerk مع Supabase - Clerk + Supabase Setup

## المشكلة
عند استخدام Clerk للمصادقة مع Supabase، تحتاج إلى تكوين Supabase لقبول JWT tokens من Clerk. بدون هذا التكوين، سياسات RLS (Row Level Security) لن تعمل بشكل صحيح.

## الحل: إعداد JWT Template في Clerk

### الخطوة 1: تكوين Clerk JWT Template

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

### الخطوة 2: التحقق من RLS Policies في Supabase

تأكد من أن سياسات RLS في قاعدة البيانات تستخدم الدالة `requesting_user_id()`:

```sql
-- Policy example
CREATE POLICY "Users can view their own boards"
ON public.boards
FOR SELECT
USING (user_id = requesting_user_id()::text);
```

### الخطوة 3: التحقق من الإعداد

بعد إكمال الخطوات السابقة:

1. أعد تشغيل التطبيق: `npm run dev`
2. سجل دخول باستخدام Clerk
3. افتح Console في المتصفح وابحث عن رسائل السجلات
4. يجب أن ترى "Token length: ..." و "Supabase session: Active"
5. اذهب إلى `/dashboard` - يجب أن تعمل بدون أخطاء

## استكشاف الأخطاء

### إذا استمرت المشكلة:

1. **تحقق من Console في المتصفح**:
   - ابحث عن "Token length:" - يجب أن يكون له قيمة
   - ابحث عن "Supabase session:" - يجب أن يكون "Active"
   - ابحث عن أخطاء أحمر

2. **تحقق من JWT Template في Clerk**:
   - تأكد من أن القالب `supabase` يحتوي على `role: "authenticated"`
   - تأكد من أن القالب يحتوي على `user_id` مع قيمة صحيحة

3. **تحقق من متغيرات البيئة**:
   - تأكد أن `NEXT_PUBLIC_SUPABASE_URL` صحيحة
   - تأكد أن `NEXT_PUBLIC_SUPABASE_ANON_KEY` صحيحة

4. **تحقق من قاعدة البيانات**:
   - تأكد أن الدالة `requesting_user_id()` موجودة
   - تأكد أن RLS مفعل على الجداول

### حل بديل: استخدام Client-Side فقط

إذا لم تنجح الطريقة السابقة، يمكنك تعطيل RLS مؤقتاً:

```sql
-- تعطيل RLS مؤقتاً للتأكد من أن المشكلة في RLS
ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
```

⚠️ **تحذير**: هذا للتجربة فقط ولا يجب استخدامه في الإنتاج!

## مراجع

- [Supabase Clerk Integration Docs](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Clerk JWT Templates](https://clerk.com/docs/backend-requests/jwt-templates)

