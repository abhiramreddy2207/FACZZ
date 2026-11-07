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
            "127.0.0.1"
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

    /**
     * Strict validation of incoming intents, deep links, and URLs
     */
    private String validateAndSanitizeUrl(Intent intent) {
        if (intent == null || intent.getData() == null) {
            return PRODUCTION_URL;
        }

        Uri uri = intent.getData();
        String scheme = uri.getScheme();

        if (scheme == null) {
            return PRODUCTION_URL;
        }

        // 1. Custom Deep Link: faczz://<path>
        if ("faczz".equalsIgnoreCase(scheme)) {
            String path = uri.getPath() != null ? uri.getPath() : "";
            String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";
            String host = uri.getHost() != null && !uri.getHost().isEmpty() ? "/" + uri.getHost() : "";
            return "https://" + PRODUCTION_DOMAIN + host + path + query;
        }

        // 2. HTTPS Web Links
        if ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme)) {
            String host = uri.getHost();
            if (host != null) {
                String normalizedHost = host.toLowerCase();
                for (String trusted : TRUSTED_HOSTS) {
                    if (normalizedHost.equals(trusted) || normalizedHost.endsWith("." + trusted)) {
                        return uri.toString();
                    }
                }
            }
        }

        // Reject untrusted schemes (file://, javascript://, content://, etc.)
        return PRODUCTION_URL;
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
                    if (host != null) {
                        String lowerHost = host.toLowerCase();
                        for (String trusted : TRUSTED_HOSTS) {
                            if (lowerHost.equals(trusted) || lowerHost.endsWith("." + trusted)) {
                                return false; // Allowed inside WebView
                            }
                        }
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
     * Renders a premium motorsport dark-themed offline error page with an instant retry action
     */
    private void showOfflineErrorPage(WebView view, String failingUrl) {
        String errorHtml = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'>" +
                "<style>" +
                "body { background-color: #151413; color: #f0eee8; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 24px; box-sizing: border-box; text-align: center; }" +
                ".card { background-color: #1e1e1e; border: 1px solid #333; border-radius: 20px; padding: 32px 24px; max-width: 360px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }" +
                ".flag { font-size: 36px; margin-bottom: 12px; display: inline-block; }" +
                "h2 { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; margin: 0 0 8px 0; color: #ffffff; }" +
                "p { font-size: 13px; color: #a1a1aa; line-height: 1.5; margin: 0 0 24px 0; }" +
                ".btn { background-color: #D6262B; color: #ffffff; border: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; padding: 14px 24px; width: 100%; cursor: pointer; transition: background-color 0.2s; }" +
                ".btn:active { background-color: #b01e22; }" +
                ".status { font-family: monospace; font-size: 10px; color: #71717a; margin-top: 16px; text-transform: uppercase; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='card'>" +
                "<div class='flag'>🏎️</div>" +
                "<h2>Paddock Disconnected</h2>" +
                "<p>Unable to connect to the Faczz live timing and community feed. Please check your network connection.</p>" +
                "<button class='btn' onclick='window.location.reload()'>Retry Connection</button>" +
                "<div class='status'>Telemetry Offline · Tap Retry</div>" +
                "</div>" +
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
