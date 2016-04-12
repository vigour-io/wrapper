#-printmapping mapping.txt

##--------------- Proguard configuration for plugin interface ----------

-keep class io.vigour.* { public *; }

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

# DESIGN
-keep class android.support.design.** { *; }
-keep interface android.support.design.** { *; }
-keep public class android.support.design.R$* { *; }
-dontwarn android.support.design.**
