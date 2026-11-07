package com.faczz.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

/**
 * Hardened JavaScript interface exposed safely as `window.AndroidBridge`
 */
public class WebAppInterface {
    private final Context mContext;

    public WebAppInterface(Context context) {
        this.mContext = context;
    }

    @JavascriptInterface
    public void showToast(String toast) {
        if (toast == null || toast.trim().isEmpty()) return;
        // Limit toast length to prevent UI disruption
        String sanitized = toast.length() > 200 ? toast.substring(0, 200) + "..." : toast;
        Toast.makeText(mContext, sanitized, Toast.LENGTH_SHORT).show();
    }

    @JavascriptInterface
    public void triggerHaptic(String type) {
        Vibrator v = (Vibrator) mContext.getSystemService(Context.VIBRATOR_SERVICE);
        if (v == null || !v.hasVibrator()) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                int duration = "heavy".equalsIgnoreCase(type) ? 70 : ("medium".equalsIgnoreCase(type) ? 35 : 15);
                v.vibrate(VibrationEffect.createOneShot(duration, VibrationEffect.DEFAULT_AMPLITUDE));
            } else {
                v.vibrate(25);
            }
        } catch (Exception ignored) {}
    }

    @JavascriptInterface
    public void shareContent(String title, String text, String url) {
        if ((text == null || text.trim().isEmpty()) && (url == null || url.trim().isEmpty())) return;

        // Ensure shared URL is safe and valid
        String safeUrl = (url != null && (url.startsWith("https://") || url.startsWith("http://"))) ? url : "";
        String safeTitle = title != null ? title : "Faczz F1 Paddock";
        String shareBody = (text != null ? text.trim() : "") + (safeUrl.isEmpty() ? "" : "\n" + safeUrl);

        Intent sendIntent = new Intent();
        sendIntent.setAction(Intent.ACTION_SEND);
        sendIntent.putExtra(Intent.EXTRA_SUBJECT, safeTitle);
        sendIntent.putExtra(Intent.EXTRA_TEXT, shareBody);
        sendIntent.setType("text/plain");

        Intent shareIntent = Intent.createChooser(sendIntent, "Share via Faczz");
        shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        mContext.startActivity(shareIntent);
    }

    @JavascriptInterface
    public String getAppVersion() {
        return "2.6.0";
    }
}
