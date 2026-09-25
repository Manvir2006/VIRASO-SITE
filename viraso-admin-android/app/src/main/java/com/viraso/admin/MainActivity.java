package com.viraso.admin;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.text.InputType;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.FileProvider;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class MainActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "VirasoAdminPrefs";
    private static final String KEY_ADMIN_URL = "admin_server_url";
    private static final String DEFAULT_URL = "https://viraso.in/admin";

    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;
    private ProgressBar progressBar;
    private LinearLayout errorView;
    private TextView errorMessage;
    private Button btnRetry;
    private Button btnConfigureUrl;

    private ValueCallback<Uri[]> mFilePathCallback;
    private String mCameraPhotoPath;
    private long backPressedTime = 0;
    private Toast exitToast;

    private ActivityResultLauncher<Intent> fileChooserLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupFileChooserLauncher();
        setupWebView();
        setupEvents();

        loadAdminWebsite();
    }

    private void initViews() {
        webView = findViewById(R.id.webView);
        swipeRefresh = findViewById(R.id.swipeRefresh);
        progressBar = findViewById(R.id.progressBar);
        errorView = findViewById(R.id.errorView);
        errorMessage = findViewById(R.id.errorMessage);
        btnRetry = findViewById(R.id.btnRetry);
        btnConfigureUrl = findViewById(R.id.btnConfigureUrl);

        swipeRefresh.setColorSchemeResources(R.color.primary, R.color.accent);
    }

    private void setupFileChooserLauncher() {
        fileChooserLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                new ActivityResultCallback<ActivityResult>() {
                    @Override
                    public void onActivityResult(ActivityResult result) {
                        if (mFilePathCallback == null) return;

                        Uri[] results = null;
                        if (result.getResultCode() == Activity.RESULT_OK) {
                            if (result.getData() != null && result.getData().getData() != null) {
                                results = new Uri[]{ result.getData().getData() };
                            } else if (mCameraPhotoPath != null) {
                                results = new Uri[]{ Uri.parse(mCameraPhotoPath) };
                            }
                        }
                        mFilePathCallback.onReceiveValue(results);
                        mFilePathCallback = null;
                    }
                }
        );
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void setupWebView() {
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);
        }
        CookieManager.getInstance().setAcceptCookie(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
                progressBar.setProgress(15);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                swipeRefresh.setRefreshing(false);
                errorView.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    showError("Failed to connect to " + getSavedAdminUrl());
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progressBar.setProgress(newProgress);
                if (newProgress >= 100) {
                    progressBar.setVisibility(View.GONE);
                } else {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }

            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                                             FileChooserParams fileChooserParams) {
                if (mFilePathCallback != null) {
                    mFilePathCallback.onReceiveValue(null);
                }
                mFilePathCallback = filePathCallback;

                Intent takePictureIntent = null;
                File photoFile = null;
                try {
                    photoFile = createImageFile();
                    if (photoFile != null) {
                        mCameraPhotoPath = "file:" + photoFile.getAbsolutePath();
                        Uri photoURI = FileProvider.getUriForFile(
                                MainActivity.this,
                                getPackageName() + ".fileprovider",
                                photoFile
                        );
                        takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI);
                    }
                } catch (IOException ex) {
                    mCameraPhotoPath = null;
                }

                Intent contentSelectionIntent = new Intent(Intent.ACTION_GET_CONTENT);
                contentSelectionIntent.addCategory(Intent.CATEGORY_OPENABLE);
                contentSelectionIntent.setType("*/*");

                Intent[] intentArray;
                if (takePictureIntent != null) {
                    intentArray = new Intent[]{ takePictureIntent };
                } else {
                    intentArray = new Intent[0];
                }

                Intent chooserIntent = new Intent(Intent.ACTION_CHOOSER);
                chooserIntent.putExtra(Intent.EXTRA_INTENT, contentSelectionIntent);
                chooserIntent.putExtra(Intent.EXTRA_TITLE, "Select Image / Document");
                chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray);

                fileChooserLauncher.launch(chooserIntent);
                return true;
            }
        });

        // Download Listener
        webView.setDownloadListener((url, userAgent, contentDisposition, mimetype, contentLength) -> {
            try {
                DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
                request.setMimeType(mimetype);
                String fileName = URLUtil.guessFileName(url, contentDisposition, mimetype);
                request.setTitle(fileName);
                request.setDescription("Downloading file from Viraso Admin...");
                request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                request.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName);

                DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                if (dm != null) {
                    dm.enqueue(request);
                    Toast.makeText(MainActivity.this, "Downloading " + fileName, Toast.LENGTH_SHORT).show();
                }
            } catch (Exception e) {
                Toast.makeText(MainActivity.this, "Download error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupEvents() {
        swipeRefresh.setOnRefreshListener(() -> {
            if (isNetworkAvailable()) {
                webView.reload();
            } else {
                swipeRefresh.setRefreshing(false);
                showError("No internet connection detected.");
            }
        });

        btnRetry.setOnClickListener(v -> loadAdminWebsite());
        btnConfigureUrl.setOnClickListener(v -> showConfigureUrlDialog());
    }

    private void loadAdminWebsite() {
        String url = getSavedAdminUrl();
        if (!isNetworkAvailable()) {
            showError("No internet connection. Connect to Wi-Fi or Mobile Data.");
            return;
        }

        errorView.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);
        webView.loadUrl(url);
    }

    private void showError(String msg) {
        progressBar.setVisibility(View.GONE);
        swipeRefresh.setRefreshing(false);
        webView.setVisibility(View.GONE);
        errorView.setVisibility(View.VISIBLE);
        errorMessage.setText(msg);
    }

    private void showConfigureUrlDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(R.string.server_url_dialog_title);

        final EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_URI);
        input.setHint(R.string.server_url_hint);
        input.setText(getSavedAdminUrl());
        input.setSelection(input.getText().length());

        int padding = (int) (18 * getResources().getDisplayMetrics().density);
        input.setPadding(padding, padding, padding, padding);
        builder.setView(input);

        builder.setPositiveButton(R.string.save, (dialog, which) -> {
            String enteredUrl = input.getText().toString().trim();
            if (!enteredUrl.isEmpty()) {
                if (!enteredUrl.startsWith("http://") && !enteredUrl.startsWith("https://")) {
                    enteredUrl = "https://" + enteredUrl;
                }
                saveAdminUrl(enteredUrl);
                Toast.makeText(MainActivity.this, "URL updated!", Toast.LENGTH_SHORT).show();
                loadAdminWebsite();
            }
        });

        builder.setNegativeButton(R.string.cancel, (dialog, which) -> dialog.cancel());
        builder.show();
    }

    private String getSavedAdminUrl() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_ADMIN_URL, DEFAULT_URL);
    }

    private void saveAdminUrl(String url) {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_ADMIN_URL, url).apply();
    }

    private boolean isNetworkAvailable() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        if (cm != null) {
            NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnectedOrConnecting();
        }
        return false;
    }

    private File createImageFile() throws IOException {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
        String imageFileName = "VIRASO_" + timeStamp + "_";
        File storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        return File.createTempFile(imageFileName, ".jpg", storageDir);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            if (backPressedTime + 2000 > System.currentTimeMillis()) {
                if (exitToast != null) exitToast.cancel();
                super.onBackPressed();
            } else {
                exitToast = Toast.makeText(this, "Press back again to exit Viraso Admin", Toast.LENGTH_SHORT);
                exitToast.show();
                backPressedTime = System.currentTimeMillis();
            }
        }
    }
}
