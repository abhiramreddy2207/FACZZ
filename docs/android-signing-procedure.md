# Faczz Android Production Signing & Hardening Procedure

## 1. Executive Summary

This document specifies the production security architecture, persistent keystore management, signing procedures, and verification protocols for the **Faczz Android Application** (`com.faczz.app`, version `2.6.0`).

---

## 2. Security Hardening Measures

### 2.1 WebView Security Controls (`MainActivity.java`)

1. **File System & Content Isolation**:
   - `setAllowFileAccess(false)`: Disables reading arbitrary filesystem paths from WebView context.
   - `setAllowContentAccess(false)`: Prevents unauthorized querying of Android ContentProviders.
   - `setAllowFileAccessFromFileURLs(false)` & `setAllowUniversalAccessFromFileURLs(false)`: Disables cross-origin file URL escalation.
2. **Strict Intent & Deep Link Sanitization**:
   - Incoming intent URIs are parsed and validated against `TRUSTED_HOSTS` (`faczz.app`, `www.faczz.app`, `accounts.google.com`, local loopback for dev).
   - Custom scheme `faczz://<path>` is rewritten to canonical `https://faczz.app/<path>`.
   - Pseudo-schemes (`file:`, `javascript:`, `content:`, `data:`, `about:`) are rejected immediately, defaulting to `https://faczz.app/`.
3. **Safe External Navigation**:
   - Internal routes (`faczz.app`, Google OAuth) render inside the WebView.
   - External motorsport publications, video links, social media, and sponsors (e.g. `youtube.com`, `x.com`, `formula1.com`, `bbc.co.uk`) are delegated to the user's external web browser using `Intent.ACTION_VIEW` (`CATEGORY_BROWSABLE`).
   - Telephony (`tel:`), email (`mailto:`), and messaging (`sms:`) launch standard Android system intents.
4. **Network Failure & Offline Resilience**:
   - Main frame network errors (`ERR_INTERNET_DISCONNECTED`, `ERR_CONNECTION_REFUSED`, `ERR_NAME_NOT_RESOLVED`) render a dark-themed motorsport error screen (`#151413`).
   - Includes an instant "Retry Connection" action calling `window.location.reload()`.
5. **Back Navigation & Exit Confirmation**:
   - Intercepts hardware back button: if WebView history exists (`canGoBack()`), navigates backward.
   - Root page back-press requires a double-tap within 2,000ms to exit with a Toast notification.
6. **File Chooser Integration**:
   - `WebChromeClient.onShowFileChooser` enables image selection (`image/*`) for post attachments and avatar updates.

### 2.2 Network Security & Cleartext Traffic Policy

- In `AndroidManifest.xml`, `android:usesCleartextTraffic="true"` has been removed.
- Enforced via `android/app/src/main/res/xml/network_security_config.xml`:
  - `cleartextTrafficPermitted="false"` by default across the entire application.
  - Cleartext HTTP is restricted solely to development loopback interfaces (`10.0.2.2`, `localhost`, `127.0.0.1`).

### 2.3 JavaScript Bridge Hardening (`WebAppInterface.java`)

- Input validation and length sanitization on `showToast` (max 200 characters).
- Type-validated haptic feedback (`light`, `medium`, `heavy`).
- Share intent sanitizer ensuring only valid HTTP/HTTPS URLs are forwarded.
- Version reporter returns synchronized `"2.6.0"`.

---

## 3. Persistent Release Keystore Management

### 3.1 Keystore Path & Secrets Configuration

To guarantee app upgrade continuity across installations, release APKs must be signed using a single persistent keystore.

| Parameter | Environment Variable | Default Path / Value | Description |
| :--- | :--- | :--- | :--- |
| **Keystore Path** | `FACZZ_KEYSTORE_PATH` | `android/keystores/faczz-release.keystore` | Path to the persistent PKCS12 / JKS release keystore |
| **Store Password** | `FACZZ_KEYSTORE_PASSWORD` | Configured via environment variable | Keystore password |
| **Key Alias** | `FACZZ_KEY_ALIAS` | `faczz` | Alias of the release signing keypair |
| **Key Password** | `FACZZ_KEY_PASSWORD` | `$FACZZ_KEYSTORE_PASSWORD` | Key private key password |

> [!CAUTION]
> Never commit `*.keystore`, `*.jks`, or keystore passwords to Git. The path `android/keystores/` is permanently excluded via `.gitignore`.

### 3.2 Backup & Disaster Recovery Procedure

1. **Offsite Vault Backup**:
   - The persistent file `android/keystores/faczz-release.keystore` must be backed up to an encrypted secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager, Google Cloud Secret Manager).
2. **Certificate Fingerprint Record**:
   - Run: `keytool -list -v -keystore android/keystores/faczz-release.keystore -alias faczz`
   - Store SHA-256 and SHA-1 fingerprints in your release record.
3. **Restoring Keystore on New Build Machine**:
   - Set `FACZZ_KEYSTORE_PATH="/path/to/restored/faczz-release.keystore"`.
   - Run `bash android/build-apk.sh release`.

---

## 4. Build & Signing Execution

### 4.1 Release Build

To build and sign the production release APK:

```bash
# Optional: supply production keystore credentials via environment variables
export FACZZ_KEYSTORE_PASSWORD="<production-password>"
export FACZZ_KEY_PASSWORD="<production-password>"

bash android/build-apk.sh release
```

### 4.2 Debug & All Targets

```bash
bash android/build-apk.sh all
```

Outputs:
- **Release APK**: `public/downloads/faczz-v2.6.0.apk`
- **Debug APK**: `public/downloads/faczz-v2.6.0-debug.apk`

---

## 5. Verification & Audit Commands

Run `apksigner` to verify APK integrity and signature schemes:

```bash
/Users/abhiramreddy/Library/Android/sdk/build-tools/36.1.0/apksigner verify -v \
  public/downloads/faczz-v2.6.0.apk
```

Expected Output:
```text
Verifies
Verified using v1 scheme (JAR signing): true
Verified using v2 scheme (APK Signature Scheme v2): true
Verified using v3 scheme (APK Signature Scheme v3): true
Number of signers: 1
```

To inspect certificate validity and subject DN:

```bash
/Users/abhiramreddy/Library/Android/sdk/build-tools/36.1.0/apksigner verify --print-certs \
  public/downloads/faczz-v2.6.0.apk
```
