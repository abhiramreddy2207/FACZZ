# Add project specific ProGuard rules here.
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

-keep class com.faczz.app.WebAppInterface { *; }

-dontwarn androidx.webkit.**
-keep class androidx.webkit.** { *; }
