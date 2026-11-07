package com.faczz.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.DownloadListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.widget.Toast;

import java.net.URI;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Hardened Production Android WebView Container for Faczz F1 Paddock
 */
public class MainActivity extends Activity {
    private static final String PREFS_NAME = "faczz_config";
    private static final String PREF_SERVER_URL = "server_url";
    private static final String DEFAULT_DEV_URL = "http://192.168.29.195:8081/";
    private static final String PRODUCTION_DOMAIN = "faczz.app";
    private static final String PRODUCTION_URL = "https://faczz.app/";
    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;

    // Trusted hostnames allowed to navigate internally inside the WebView
    private static final Set<String> TRUSTED_HOSTS = new HashSet<>(Arrays.asList(
            "faczz.app",
            "www.faczz.app",
            "accounts.google.com",
            "10.0.2.2",
            "localhost",
            "127.0.0.1",
            "192.168.29.195"
    ));

    private WebView mWebView;
    private ProgressBar mProgressBar;
    private ValueCallback<Uri[]> mFilePathCallback;
    private long mLastBackPressTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        // Status & Navigation bar dark styling (#151413)
        Window window = getWindow();
        window.setStatusBarColor(0xFF151413);
        window.setNavigationBarColor(0xFF151413);

        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        rootLayout.setBackgroundColor(0xFF151413);

        mWebView = new WebView(this);
        mWebView.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        mWebView.setBackgroundColor(0xFF151413);

        mProgressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        FrameLayout.LayoutParams pbParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 8);
        mProgressBar.setLayoutParams(pbParams);
        mProgressBar.setMax(100);
        mProgressBar.setVisibility(View.GONE);

        rootLayout.addView(mWebView);
        rootLayout.addView(mProgressBar);
        setContentView(rootLayout);

        setupHardenedWebView();

        // Validate and sanitize initial launch intent
        String startUrl = validateAndSanitizeUrl(getIntent());
        mWebView.loadUrl(startUrl);
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String targetUrl = validateAndSanitizeUrl(intent);
        if (mWebView != null && targetUrl != null) {
            mWebView.loadUrl(targetUrl);
        }
    }

    public String getActiveServerUrl() {
        android.content.SharedPreferences prefs = getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE);
        return prefs.getString(PREF_SERVER_URL, DEFAULT_DEV_URL);
    }

    public void setAndLoadServerUrl(String url) {
        if (url == null || url.trim().isEmpty()) return;
        String sanitized = url.trim();
        if (!sanitized.startsWith("http://") && !sanitized.startsWith("https://")) {
            sanitized = "http://" + sanitized;
        }
        if (!sanitized.endsWith("/")) {
            sanitized += "/";
        }
        final String finalUrl = sanitized;
        android.content.SharedPreferences prefs = getSharedPreferences(PREFS_NAME, android.content.Context.MODE_PRIVATE);
        prefs.edit().putString(PREF_SERVER_URL, finalUrl).apply();
        runOnUiThread(() -> {
            if (mWebView != null) {
                mWebView.loadUrl(finalUrl);
            }
        });
    }

    public boolean isTrustedHost(String host) {
        if (host == null || host.isEmpty()) return false;
        String normalized = host.toLowerCase().trim();
        for (String trusted : TRUSTED_HOSTS) {
            if (normalized.equals(trusted) || normalized.endsWith("." + trusted)) {
                return true;
            }
        }
        // Allow local LAN private IPs and loopbacks
        if (normalized.startsWith("192.168.") || normalized.startsWith("10.") || normalized.equals("localhost") || normalized.equals("127.0.0.1")) {
            return true;
        }
        if (normalized.endsWith(".app") || normalized.endsWith(".lovable.app") || normalized.endsWith(".vercel.app")) {
            return true;
        }
        try {
            Uri currentUri = Uri.parse(getActiveServerUrl());
            if (normalized.equalsIgnoreCase(currentUri.getHost())) {
                return true;
            }
        } catch (Exception ignored) {}
        return false;
    }

    /**
     * Strict validation of incoming intents, deep links, and URLs
     */
    private String validateAndSanitizeUrl(Intent intent) {
        if (intent == null || intent.getData() == null) {
            return getActiveServerUrl();
        }

        Uri uri = intent.getData();
        String scheme = uri.getScheme();

        if (scheme == null) {
            return getActiveServerUrl();
        }

        // 1. Custom Deep Link: faczz://<path>
        if ("faczz".equalsIgnoreCase(scheme)) {
            String path = uri.getPath() != null ? uri.getPath() : "";
            String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";
            String host = uri.getHost() != null && !uri.getHost().isEmpty() ? "/" + uri.getHost() : "";
            return getActiveServerUrl().replaceAll("/+$", "") + host + path + query;
        }

        // 2. HTTPS/HTTP Web Links
        if ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme)) {
            String host = uri.getHost();
            if (host != null && isTrustedHost(host)) {
                return uri.toString();
            }
        }

        // Reject untrusted schemes (file://, javascript://, content://, etc.)
        return getActiveServerUrl();
    }

    /**
     * Hardens WebView settings against injection, file leakage, and unauthorized access
     */
    private void setupHardenedWebView() {
        WebSettings settings = mWebView.getSettings();

        // 1. Disallow file system access (Protects private app databases and files)
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);

        // 2. Core Web Capabilities
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // 3. User Agent identification
        settings.setUserAgentString(settings.getUserAgentString() + " FaczzAndroidNative/2.6.0");

        // 4. Register hardened JavaScript bridge
        mWebView.addJavascriptInterface(new WebAppInterface(this), "AndroidBridge");

        // 5. Hardened Navigation & Error Handling
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                mProgressBar.setVisibility(View.VISIBLE);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                mProgressBar.setVisibility(View.GONE);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();

                if (scheme == null) return true;

                // Explicitly reject dangerous pseudo-schemes
                if ("file".equalsIgnoreCase(scheme) ||
                    "javascript".equalsIgnoreCase(scheme) ||
                    "content".equalsIgnoreCase(scheme)) {
                    return true;
                }

                // Handle system intent schemes (tel:, mailto:, sms:)
                if ("tel".equalsIgnoreCase(scheme) ||
                    "mailto".equalsIgnoreCase(scheme) ||
                    "sms".equalsIgnoreCase(scheme)) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                        startActivity(intent);
                    } catch (ActivityNotFoundException ignored) {}
                    return true;
                }

                // Inspect HTTP/HTTPS destinations
                if ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme)) {
                    String host = uri.getHost();
                    if (host != null && isTrustedHost(host)) {
                        return false; // Allowed inside WebView
                    }

                    // External URL: safely delegate to the external browser
                    try {
                        Intent browserIntent = new Intent(Intent.ACTION_VIEW, uri);
                        browserIntent.addCategory(Intent.CATEGORY_BROWSABLE);
                        browserIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(browserIntent);
                    } catch (Exception ignored) {}
                    return true;
                }

                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    showOfflineErrorPage(view, request.getUrl().toString());
                }
            }
        });

        // 6. Progress & File Chooser Handling
        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                mProgressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    mProgressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                }
                mFilePathCallback = filePathCallback;

                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/*");

                try {
                    startActivityForResult(Intent.createChooser(intent, "Select Media"), FILE_CHOOSER_REQUEST_CODE);
                    return true;
                } catch (ActivityNotFoundException e) {
                    mFilePathCallback = null;
                    return false;
                }
            }
        });

        // 7. Safe Download Listener
        mWebView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimetype, long contentLength) {
                try {
                    Uri downloadUri = Uri.parse(url);
                    if ("https".equalsIgnoreCase(downloadUri.getScheme()) || "http".equalsIgnoreCase(downloadUri.getScheme())) {
                        Intent intent = new Intent(Intent.ACTION_VIEW, downloadUri);
                        intent.addCategory(Intent.CATEGORY_BROWSABLE);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    }
                } catch (Exception ignored) {}
            }
        });
    }

    /**
     * Renders a premium motorsport dark-themed offline error page with server switcher and retry
     */
    private void showOfflineErrorPage(WebView view, String failingUrl) {
        String activeUrl = getActiveServerUrl();
        String errorHtml = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='utf-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>" +
                "<title>Faczz Paddock Offline</title>" +
                "<style>" +
                "body { background-color: #151413; color: #f0eee8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }" +
                ".card { background-color: #1a1918; border: 1px solid #2e2c2a; border-radius: 20px; padding: 28px 20px; max-width: 380px; width: 100%; box-shadow: 0 16px 40px rgba(0,0,0,0.6); }" +
                ".flag { font-size: 32px; margin-bottom: 8px; }" +
                "h2 { font-size: 18px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; margin: 0 0 6px 0; color: #ffffff; }" +
                "p { font-size: 12px; color: #a1a1aa; line-height: 1.4; margin: 0 0 16px 0; }" +
                ".fail-url { font-family: monospace; font-size: 10px; color: #ef4444; word-break: break-all; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 6px 8px; margin-bottom: 16px; }" +
                ".input-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; text-align: left; margin-bottom: 4px; display: block; }" +
                ".url-input { width: 100%; box-sizing: border-box; background: #111; border: 1px solid #3f3f46; border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #fff; font-family: monospace; margin-bottom: 12px; outline: none; }" +
                ".url-input:focus { border-color: #d6262b; }" +
                ".presets { display: flex; gap: 6px; margin-bottom: 16px; }" +
                ".preset-btn { flex: 1; background: #262422; border: 1px solid #3f3e3b; color: #d4d4d8; font-size: 10px; font-weight: 700; border-radius: 8px; padding: 8px 4px; cursor: pointer; text-transform: uppercase; }" +
                ".preset-btn:active { background: #3f3e3b; color: #fff; }" +
                ".btn { background-color: #D6262B; color: #ffffff; border: none; border-radius: 12px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px 20px; width: 100%; cursor: pointer; transition: background-color 0.2s; }" +
                ".btn:active { background-color: #b01e22; }" +
                ".btn-sec { background: transparent; border: 1px solid #3f3e3b; color: #a1a1aa; margin-top: 8px; }" +
                ".btn-sec:active { background: #262422; color: #fff; }" +
                ".status { font-family: monospace; font-size: 9px; color: #71717a; margin-top: 14px; text-transform: uppercase; letter-spacing: 0.5px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='card'>" +
                "<div class='flag'>🏎️</div>" +
                "<h2>Paddock Disconnected</h2>" +
                "<p>Unable to connect to the Faczz live feed and telemetry backend.</p>" +
                "<div class='fail-url'>Target: " + (failingUrl != null ? failingUrl : activeUrl) + "</div>" +
                "<label class='input-label'>Backend Server URL</label>" +
                "<input id='serverInput' class='url-input' type='text' value='" + activeUrl + "' placeholder='http://192.168...:8081/' />" +
                "<div class='presets'>" +
                "<button class='preset-btn' onclick=\"setPreset('http://192.168.29.195:8081/')\">Wi-Fi :8081</button>" +
                "<button class='preset-btn' onclick=\"setPreset('http://192.168.29.195:8080/')\">Wi-Fi :8080</button>" +
                "<button class='preset-btn' onclick=\"setPreset('https://faczz.app/')\">Cloud</button>" +
                "</div>" +
                "<button class='btn' onclick='connectServer()'>Connect & Save</button>" +
                "<button class='btn btn-sec' onclick='window.location.reload()'>Retry Current Target</button>" +
                "<div class='status'>Hybrid Container v2.6.0 · Enter Host IP</div>" +
                "</div>" +
                "<script>" +
                "function setPreset(url) { document.getElementById('serverInput').value = url; connectServer(); }" +
                "function connectServer() {" +
                "  var val = document.getElementById('serverInput').value.trim();" +
                "  if (!val) return;" +
                "  if (window.AndroidBridge && window.AndroidBridge.setServerUrl) {" +
                "    window.AndroidBridge.setServerUrl(val);" +
                "  } else {" +
                "    window.location.href = val;" +
                "  }" +
                "}" +
                "</script>" +
                "</body>" +
                "</html>";

        view.loadDataWithBaseURL("https://" + PRODUCTION_DOMAIN, errorHtml, "text/html", "UTF-8", null);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (mFilePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    if (data.getData() != null) {
                        results = new Uri[]{data.getData()};
                    } else if (data.getClipData() != null) {
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                mFilePathCallback.onReceiveValue(results);
                mFilePathCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    /**
     * Back button handling: navigates back in WebView history, or confirms exit with double-press
     */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (mWebView.canGoBack()) {
                mWebView.goBack();
                return true;
            }

            long currentTime = System.currentTimeMillis();
            if (currentTime - mLastBackPressTime < 2000) {
                finish();
                return true;
            } else {
                mLastBackPressTime = currentTime;
                Toast.makeText(this, "Press back again to exit Faczz", Toast.LENGTH_SHORT).show();
                return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onDestroy() {
        if (mWebView != null) {
            mWebView.destroy();
        }
        super.onDestroy();
    }
}
