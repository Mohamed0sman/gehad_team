# حل سريع للمشكلة - Quick Fix

## المشكلة
عند محاولة تحميل أو إنشاء لوحات، تظهر رسالة خطأ:
- "Error loading boards"
- "Failed to create board"

## السبب
Supabase لا يقبل JWT tokens من Clerk لأن التكامل بين Clerk و Supabase غير مكوّن.

## الحل السريع (3 خطوات)

### 1️⃣ في Clerk Dashboard

1. اذهب إلى [Clerk Dashboard](https://dashboard.clerk.com)
2. اختر تطبيقك
3. من القائمة الجانبية: **JWT Templates** → **New template**
4. اسم القالب: `supabase`
5. في قسم **Claims**، أضف:
   ```json
   {
     "role": "authenticated"
   }
   ```
6. احفظ

### 2️⃣ في Supabase Dashboard

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. من القائمة الجانبية: **Authentication** → **Providers**
4. ابحث عن **Third-Party Auth** أو **External Auth**
5. اضغط **Add Provider** → اختر **Clerk**
6. أدخل **Clerk Domain** (مثل: `your-app.clerk.accounts.dev`)
   - يمكنك العثور عليه في Clerk → Settings → Domains

### 3️⃣ أعد تشغيل التطبيق

```bash
npm run dev
```

## التحقق

بعد إكمال الخطوات:
1. سجل دخول باستخدام Clerk
2. اذهب إلى `/dashboard`
3. يجب أن تعمل الآن بدون أخطاء

## ملاحظة

إذا استمرت المشكلة:
- تحقق من console في المتصفح للأخطاء
- تأكد من أن JWT template في Clerk يحتوي على `role: "authenticated"`
- تأكد من أن Third-Party Auth integration مفعل في Supabase

## للمزيد من التفاصيل

راجع ملف `CLERK_SUPABASE_SETUP.md` للتعليمات التفصيلية.
