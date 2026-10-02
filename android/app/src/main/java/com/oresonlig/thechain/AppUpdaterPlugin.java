package com.oresonlig.thechain;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInstaller;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.ContextCompat;
import androidx.core.content.IntentCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * App 1.2.0 — appen laddar ner och installerar sin egen uppdatering.
 *
 * Utan detta öppnade uppdateringsbannern bara en länk: webbläsaren laddade
 * ner APK:n och användaren fick ge WEBBLÄSAREN rätt att installera appar.
 * Nu: nedladdning i appen → Androids PackageInstaller. Rätten att installera
 * ges en gång till The Chain själv. På Android 12+ begärs
 * USER_ACTION_NOT_REQUIRED — Android avgör själv om det beviljas (kräver bl.a.
 * att appen är sin egen installerare); annars visas systemdialogen "Update".
 *
 * JS-sidan (index.html, checkAndroidAppUpdate) anropar via
 * Capacitor.nativePromise('AppUpdater','install',{url}) och lyssnar på
 * 'status'-händelser: {state: permission|downloading|installing|error, ...}.
 */
@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    // Bara våra egna release-filer får installeras via pluginet.
    private static final String ALLOWED_PREFIX = "https://github.com/Oresonlig/Resistance/releases/";
    private static final String ACTION_STATUS = "com.oresonlig.thechain.INSTALL_STATUS";

    private String pendingUrl = null;   // väntar på "installera okända appar"-rätten
    private boolean busy = false;
    private BroadcastReceiver receiver;

    @Override
    public void load() {
        receiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                int status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
                if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
                    Intent confirm = IntentCompat.getParcelableExtra(intent, Intent.EXTRA_INTENT, Intent.class);
                    if (confirm != null) {
                        confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        getContext().startActivity(confirm);
                    }
                } else if (status == PackageInstaller.STATUS_SUCCESS) {
                    busy = false; // processen ersätts normalt innan detta syns
                } else {
                    busy = false;
                    String msg = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);
                    emit("error", "Install failed" + (msg != null ? ": " + msg : ""));
                }
            }
        };
        ContextCompat.registerReceiver(getContext(), receiver, new IntentFilter(ACTION_STATUS), ContextCompat.RECEIVER_NOT_EXPORTED);
    }

    @Override
    protected void handleOnDestroy() {
        try { getContext().unregisterReceiver(receiver); } catch (Exception ignored) {}
    }

    @PluginMethod
    public void install(PluginCall call) {
        String url = call.getString("url");
        if (url == null || !url.startsWith(ALLOWED_PREFIX)) {
            call.reject("URL not allowed");
            return;
        }
        if (busy) {
            call.resolve(result("busy"));
            return;
        }
        if (!canInstall()) {
            // En gång per telefon: skicka användaren till "Installera okända appar"
            // för The Chain. handleOnResume fortsätter när de kommer tillbaka.
            pendingUrl = url;
            Intent i = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            emit("permission", null);
            call.resolve(result("permission"));
            return;
        }
        start(url);
        call.resolve(result("started"));
    }

    @Override
    protected void handleOnResume() {
        if (pendingUrl != null && canInstall()) {
            String url = pendingUrl;
            pendingUrl = null;
            start(url);
        }
    }

    private boolean canInstall() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            return getContext().getPackageManager().canRequestPackageInstalls();
        }
        return true;
    }

    private void start(String url) {
        busy = true;
        new Thread(() -> {
            try {
                File apk = download(url);
                emit("installing", null);
                installApk(apk);
            } catch (Exception e) {
                busy = false;
                emit("error", e.getMessage() != null ? e.getMessage() : e.toString());
            }
        }).start();
    }

    private File download(String url) throws Exception {
        File dir = new File(getContext().getCacheDir(), "updates");
        if (!dir.exists() && !dir.mkdirs()) throw new Exception("Could not create cache dir");
        File out = new File(dir, "thechain.apk");

        // GitHub svarar med 302 till release-assets.githubusercontent.com
        // (https→https följs automatiskt av HttpURLConnection).
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setInstanceFollowRedirects(true);
        conn.setConnectTimeout(15000);
        conn.setReadTimeout(30000);
        int code = conn.getResponseCode();
        if (code != 200) throw new Exception("Download failed (HTTP " + code + ")");
        long total = conn.getContentLengthLong();
        long done = 0;
        int lastPct = -1;
        try (InputStream in = conn.getInputStream(); OutputStream os = new FileOutputStream(out)) {
            byte[] buf = new byte[64 * 1024];
            int n;
            while ((n = in.read(buf)) != -1) {
                os.write(buf, 0, n);
                done += n;
                if (total > 0) {
                    int pct = (int) (done * 100 / total);
                    if (pct != lastPct) {
                        lastPct = pct;
                        JSObject d = new JSObject();
                        d.put("state", "downloading");
                        d.put("percent", pct);
                        notifyListeners("status", d);
                    }
                }
            }
        } finally {
            conn.disconnect();
        }
        return out;
    }

    private void installApk(File apk) throws Exception {
        Context ctx = getContext();
        PackageInstaller installer = ctx.getPackageManager().getPackageInstaller();
        PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
        params.setAppPackageName(ctx.getPackageName());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
        }
        int sessionId = installer.createSession(params);
        try (PackageInstaller.Session session = installer.openSession(sessionId)) {
            try (InputStream in = new FileInputStream(apk);
                 OutputStream os = session.openWrite("thechain.apk", 0, apk.length())) {
                byte[] buf = new byte[64 * 1024];
                int n;
                while ((n = in.read(buf)) != -1) os.write(buf, 0, n);
                session.fsync(os);
            }
            Intent statusIntent = new Intent(ACTION_STATUS).setPackage(ctx.getPackageName());
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) flags |= PendingIntent.FLAG_MUTABLE;
            PendingIntent pi = PendingIntent.getBroadcast(ctx, sessionId, statusIntent, flags);
            session.commit(pi.getIntentSender());
        }
    }

    private void emit(String state, String message) {
        JSObject d = new JSObject();
        d.put("state", state);
        if (message != null) d.put("message", message);
        notifyListeners("status", d);
    }

    private JSObject result(String status) {
        JSObject r = new JSObject();
        r.put("status", status);
        return r;
    }
}
