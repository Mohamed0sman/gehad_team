# 🎯 دليل سريع لحل مشكلة المصادقة

## المشكلة
عند فتح التطبيق، تظهر رسالة:
```
Error loading boards
Authentication error: Please configure Clerk + Supabase integration
```

---

## 🚀 الحل السريع (جربه أولاً)

### الخطوة 1: تعطيل RLS مؤقتاً

1. اذهب إلى Supabase Dashboard
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ الكود التالي وشغله:

```sql
ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
```

5. الآن أعد تشغيل التطبيق:
   ```bash
   npm run dev
   ```

6. **إذا عمل الآن** → المشكلة في RLS، انتقل للخطوة 2
7. **إذا لم يعمل** → المشكلة في شيء آخر، انتقل للخطوة 3

---

### الخطوة 2: إصلاح RLS (بعد التأكد من الخطوة 1)

#### أ. تحديث دالة استخراج user_id

اذهب إلى Supabase Dashboard → SQL Editor وشغل:

```sql
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS text AS $$
  SELECT NULLIF(
    auth.jwt()->>'sub',
    ''
  )::text;
$$ LANGUAGE SQL STABLE;
```

#### ب. تحديث سياسات الأمان

شغل الأوامر التالية واحدة تلو الأخرى:

```sql
-- إصلاح سياسة عرض اللوحات
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;
CREATE POLICY "Users can view their own boards"
ON public.boards FOR SELECT
USING (user_id = requesting_user_id());

-- إصلاح سياسة إنشاء اللوحات
DROP POLICY IF EXISTS "Users can insert their own boards" ON public.boards;
CREATE POLICY "Users can insert their own boards"
ON public.boards FOR INSERT
WITH CHECK (requesting_user_id() = user_id);

-- إصلاح سياسة تعديل اللوحات
DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
CREATE POLICY "Users can update their own boards"
ON public.boards FOR UPDATE
USING (user_id = requesting_user_id())
WITH CHECK (user_id = requesting_user_id());

-- إصلاح سياسة حذف اللوحات
DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;
CREATE POLICY "Users can delete their own boards"
ON public.boards FOR DELETE
USING (user_id = requesting_user_id());
```

#### ج. إعادة تفعيل RLS

```sql
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
```

---

### الخطوة 3: التأكد من JWT Template في Clerk

1. اذهب إلى [Clerk Dashboard](https://dashboard.clerk.com)
2. اختر تطبيقك
3. من القائمة الجانبية: **JWT Templates** → **New template**
4. الاسم: `supabase`
5. في قسم **Claims**، أضف بالضبط:

```json
{
  "role": "authenticated",
  "user_id": "https://www.clerk.com/v1/user/{{user.id}}",
  "email": "{{user.primaryEmailAddress?.emailAddress}}"
}
```

6. احفظ القالب

---

### الخطوة 4: التحقق من متغيرات البيئة

تأكد أن ملف `.env.local` يحتوي على:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qiuitsoolbbnlnnjhluf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_sgjqn4gYMLUa1oblKowCVg_Vwi_Xpw4
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y3VyaW91cy1tb2xsdXNrLTk2LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_4sATSB23i3sv1IGAnbYC2tJuztnlTS29ml8txglnBd
```

---

## ✅ التحقق من الحل

1. أعد تشغيل التطبيق: `npm run dev`
2. افتح المتصفح على `http://localhost:3000`
3. افتح Console (اضغط F12، ثم اذهب إلى Console tab)
4. سجل دخول
5. ابحث عن logs في Console:
   - يجب أن ترى: `Token length: ...`
   - يجب أن ترى: `Supabase session: Active`
6. اذهب إلى `/dashboard`
7. ✅ إذا ظهرت اللوحات → نجح الحل!
8. ❌ إذا ظهر نفس الخطأ → جرب الحلول البديلة أدناه

---

## 🔄 حلول بديلة

### بديل 1: استخدام auth.uid() بدلاً من requesting_user_id()

اذهب إلى Supabase Dashboard → SQL Editor وشغل:

```sql
-- تحديث سياسة استخدام auth.uid() مباشرة
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;
CREATE POLICY "Users can view their own boards"
ON public.boards FOR SELECT
USING (user_id = auth.uid());
```

كرر نفس الشيء لجميع الجداول (columns, tasks).

---

### بديل 2: التأكد من أن user_id في boards يطابق sub في JWT

اذهب إلى Supabase Dashboard → SQL Editor وشغل:

```sql
-- تحديث جميع اللوحات لتطابق user_id مع JWT sub
UPDATE public.boards 
SET user_id = 
  CASE 
    WHEN user_id LIKE 'user_%' THEN 
      'https://www.clerk.com/v1/user/' || substring(user_id FROM 6)
    ELSE user_id
  END;
```

---

### بديل 3: فحص Console للأخطاء

1. افتح DevTools (F12)
2. اذهب إلى Console
3. حدث الصفحة
4. لقط screenshot للأخطاء

أنواع الأخطاء الشائعة:

| الخطأ | المعنى | الحل |
|-------|---------|------|
| `PGRST301` | JWT token غير صالح | تحقق من JWT template |
| `42501` | RLS يمنع الوصول | تعطيل RLS مؤقتاً أو إصلاح policies |
| `JWT must be provided` | التوكن مفقود | تحقق من Clerk setup |

---

## 📞 المساعدة

إذا لم تنجح أي من الحلول:

1. **استخدم أداة الفحص**: 
   ```bash
   ./troubleshoot.sh
   ```

2. **افتح صفحة الفحص في المتصفح**:
   ```bash
   open troubleshoot.html  # Mac
   start troubleshoot.html # Windows
   ```

3. **اقرأ دليل الاستكشاف المفصل**:
   اقرأ `TROUBLESHOOTING_AUTH.md` للحلول المفصلة

4. **شارك المعلومات التالية للمساعدة**:
   - Screenshot من Console
   - محتوى .env.local (بدون المفاتيح)
   - سجل الإجراءات التي قمت بها
   - الخطوات التي نجحت أو فشلت

---

## 💡 نصائح مهمة

- ⚠️ **لا تستخدم RLS معطل في الإنتاج**
- 🔄 **أعد تشغيل التطبيق** بعد كل تغيير
- 🧹 **امسح cache المتصفح** بعد تغييرات JWT
- 👤 **أنشئ user جديد** للتأكد من عدم وجود مشاكل في بيانات قديمة
- 📊 **تحقق من Supabase Logs** في Dashboard

---

## 📚 موارد إضافية

- [Clerk JWT Templates Docs](https://clerk.com/docs/backend-requests/jwt-templates)
- [Supabase Clerk Integration](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**صنع بـ ❤️ لفريق Gehad Team**
