#-printmapping mapping.txt

##--------------- Proguard configuration for plugin interface ----------

-keep class io.vigour.* {
    public protected *;
}

##--------------- Proguard configuration for Gson  ----------
# Gson uses generic type information stored in a class file when working with fields.
# Proguard removes such information by default, so configure it to keep all of it.
-keepattributes Signature

# For using GSON @Expose annotation
-keepattributes *Annotation*

# Gson specific classes
-keep class sun.misc.Unsafe { *; }
#-keep class com.google.gson.stream.** { *; }

# Application classes that will be serialized/deserialized over Gson
-keep class com.google.gson.examples.android.model.** { *; }

##--------------- Proguard configuration for parsing items ----------

-keepclassmembernames enum * {
    <fields>;
}

##--------------- Proguard configuration for classes that implement parcelable interface ----------

-keepclassmembers class * implements android.os.Parcelable {
    static ** CREATOR;
}

##--------------- Proguard configuration for Crashlytics ----------

-keepattributes SourceFile,LineNumberTable
-keep class com.crashlytics.** { *; }
-keep class com.crashlytics.android.**

##--------------- Proguard configuration for Google APIs ----------
-keep public class com.google.android.gms.* { public *; }
-dontwarn com.google.android.gms.**

##--------------- Proguard configuration for classes using slf4j (like JDeferred) ----------

-keep public class org.slf4j.* { public *; }
-dontwarn org.slf4j.**

##--------------- Proguard configuration for ksoap2 ----------

-keep class org.kobjects.** { *; }
-keep class org.ksoap2.** { *; }
-keep class org.kxml2.** { *; }
-keep class org.xmlpull.** { *; }
-dontwarn org.xmlpull.v1.**

##--------------- Proguard configuration for android libraries ----------
# SUPPORT V7
-keep public class android.support.v7.widget.** { *; }
-keep public class android.support.v7.internal.widget.** { *; }
-keep public class android.support.v7.internal.view.menu.** { *; }

-keep public class * extends android.support.v4.view.ActionProvider {
    public <init>(android.content.Context);
}

-keep class android.net.http.** { *; }
-keepclassmembers class android.net.http.** {*;}
-dontwarn android.net.**

##--------------- Proguard configuration for Joda time ----------
-dontwarn org.joda.convert.**
-dontwarn org.joda.time.**
-keep class org.joda.time.** { *; }
-keep interface org.joda.time.** { *; }

##--------------- Proguard configuration for RxJava ----------
-dontwarn sun.misc.**

-keepclassmembers class rx.internal.util.unsafe.*ArrayQueue*Field* {
   long producerIndex;
   long consumerIndex;
}
-keepclassmembers class rx.internal.util.unsafe.BaseLinkedQueueProducerNodeRef {
    rx.internal.util.atomic.LinkedQueueNode producerNode;
}
-keepclassmembers class rx.internal.util.unsafe.BaseLinkedQueueConsumerNodeRef {
    rx.internal.util.atomic.LinkedQueueNode consumerNode;
}

##--------------- Proguard configuration for apache libraries ----------
-keep class org.apache.http.** { *; }
-keepclassmembers class org.apache.http.** {*;}
-dontwarn org.apache.**

##--------------- Proguard configuration for CrossWalk ----------
-keep class org.xwalk.**{ *; }
-keep interface org.xwalk.**{ *; }
-keep class com.example.extension.**{ *; }
-keep class org.crosswalkproject.**{ *; }

# Keep native & callbacks
-keepclasseswithmembernames class *{
    native <methods>;
}

-keepattributes JNINamespace
-keepattributes CalledByNative
-keepattributes *Annotation*
-keepattributes EnclosingMethod

-keepattributes InnerClasses
-keep class **.R
-keep class **.R$* {
    <fields>;
}

##--------------- Proguard configuration for Chromium ----------
# Keep annotations used by chromium to keep members referenced by native code
-keep class org.chromium.base.*Native*
-keep class org.chromium.base.annotations.JNINamespace
-keepclasseswithmembers class org.chromium.** {
    @org.chromium.base.AccessedByNative <fields>;
}
-keepclasseswithmembers class org.chromium.** {
    @org.chromium.base.*Native* <methods>;
}

-keep class org.chromium.** {
    native <methods>;
}

# Keep methods used by reflection and native code
-keep class org.chromium.base.UsedBy*
-keep @org.chromium.base.UsedBy* class *
-keepclassmembers class * {
    @org.chromium.base.UsedBy* *;
}

-keep @org.chromium.base.annotations.JNINamespace* class *
-keepclassmembers class * {
    @org.chromium.base.annotations.CalledByNative* *;
}

# DESIGN
-keep class android.support.design.** { *; }
-keep interface android.support.design.** { *; }
-keep public class android.support.design.R$* { *; }
-dontwarn android.support.design.**
