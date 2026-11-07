#!/bin/bash
set -e

BUILD_MODE="${1:-release}" # "release", "debug", or "all"
ANDROID_SDK="${ANDROID_SDK_ROOT:-/Users/abhiramreddy/Library/Android/sdk}"
PLATFORM="$ANDROID_SDK/platforms/android-36.1/android.jar"
BUILD_TOOLS="$ANDROID_SDK/build-tools/36.1.0"
JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/jdk-24.jdk/Contents/Home}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Building Faczz Android Application ($BUILD_MODE) ==="

# Validate SDK Tools
if [ ! -f "$PLATFORM" ]; then
  echo "Error: Android SDK platform jar not found at $PLATFORM"
  exit 1
fi
if [ ! -x "$BUILD_TOOLS/aapt2" ] || [ ! -x "$BUILD_TOOLS/d8" ] || [ ! -x "$BUILD_TOOLS/apksigner" ]; then
  echo "Error: Android build tools (aapt2, d8, apksigner) not found in $BUILD_TOOLS"
  exit 1
fi

WORK_DIR="/tmp/faczz_android_build"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/compiled_res" "$WORK_DIR/gen" "$WORK_DIR/bin" "$WORK_DIR/dex"

# 1. Compile resources with aapt2
echo "1. Compiling resources with aapt2..."
"$BUILD_TOOLS/aapt2" compile --dir "$ROOT_DIR/android/app/src/main/res" -o "$WORK_DIR/res.zip"

# 2. Link resources and generate R.java
echo "2. Linking resources and generating R.java..."
"$BUILD_TOOLS/aapt2" link "$WORK_DIR/res.zip" \
  -I "$PLATFORM" \
  --manifest "$ROOT_DIR/android/app/src/main/AndroidManifest.xml" \
  --java "$WORK_DIR/gen" \
  -o "$WORK_DIR/base.apk"

# 3. Compile Java sources with javac
echo "3. Compiling Java sources with javac..."
"$JAVA_HOME/bin/javac" \
  -cp "$PLATFORM" \
  --release 17 \
  -d "$WORK_DIR/bin" \
  "$WORK_DIR/gen/com/faczz/app/R.java" \
  "$ROOT_DIR/android/app/src/main/java/com/faczz/app/MainActivity.java" \
  "$ROOT_DIR/android/app/src/main/java/com/faczz/app/WebAppInterface.java"

# 4. Convert bytecode to DEX with d8
echo "4. Converting bytecode to DEX with d8..."
"$BUILD_TOOLS/d8" \
  --lib "$PLATFORM" \
  --min-api 21 \
  --output "$WORK_DIR/dex" \
  $(find "$WORK_DIR/bin" -name "*.class")

# 5. Add DEX into APK package
echo "5. Packaging DEX into base APK..."
cd "$WORK_DIR/dex"
zip -u "$WORK_DIR/base.apk" classes.dex
cd - > /dev/null

# 6. Zipalign APK
echo "6. Aligning APK with zipalign..."
"$BUILD_TOOLS/zipalign" -p -f 4 "$WORK_DIR/base.apk" "$WORK_DIR/aligned.apk"

# 7. Persistent Keystore Setup
KEYSTORE_DIR="$ROOT_DIR/android/keystores"
KEYSTORE="${FACZZ_KEYSTORE_PATH:-$KEYSTORE_DIR/faczz-release.keystore}"
KEYSTORE_PASS="${FACZZ_KEYSTORE_PASSWORD:-faczz_motorsport_2026}"
KEY_ALIAS="${FACZZ_KEY_ALIAS:-faczz}"
KEY_PASS="${FACZZ_KEY_PASSWORD:-$KEYSTORE_PASS}"

mkdir -p "$KEYSTORE_DIR"
mkdir -p "$ROOT_DIR/public/downloads"

if [ ! -f "$KEYSTORE" ]; then
  echo "7a. Persistent release keystore not found. Initializing persistent keystore at $KEYSTORE..."
  "$JAVA_HOME/bin/keytool" -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$KEYSTORE_PASS" \
    -keypass "$KEY_PASS" \
    -dname "CN=Faczz Paddock, OU=Mobile, O=Faczz Motorsport Platform, L=London, C=GB"
  echo "Notice: Persistent release keystore initialized. Do NOT delete or regenerate this file."
else
  echo "7a. Using existing persistent release keystore: $KEYSTORE"
fi

# 8. Sign Release APK
RELEASE_OUTPUT="$ROOT_DIR/public/downloads/faczz-v2.6.0.apk"
echo "8. Signing Release APK with apksigner (v1, v2, v3 schemes)..."
"$BUILD_TOOLS/apksigner" sign \
  --ks "$KEYSTORE" \
  --ks-pass "pass:$KEYSTORE_PASS" \
  --ks-key-alias "$KEY_ALIAS" \
  --key-pass "pass:$KEY_PASS" \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --out "$RELEASE_OUTPUT" \
  "$WORK_DIR/aligned.apk"

# 9. Sign Debug APK if requested or in 'all' mode
if [ "$BUILD_MODE" = "debug" ] || [ "$BUILD_MODE" = "all" ]; then
  DEBUG_OUTPUT="$ROOT_DIR/public/downloads/faczz-v2.6.0-debug.apk"
  cp "$RELEASE_OUTPUT" "$DEBUG_OUTPUT"
  echo "Debug package generated: $DEBUG_OUTPUT"
fi

# 10. Verify Signature
echo "10. Verifying Release APK signature and certificate..."
"$BUILD_TOOLS/apksigner" verify -v "$RELEASE_OUTPUT"

echo ""
echo "=== ANDROID BUILD SUCCESSFUL ==="
echo "Release APK: $RELEASE_OUTPUT ($(ls -lh "$RELEASE_OUTPUT" | awk '{print $5}'))"
if [ -f "$ROOT_DIR/public/downloads/faczz-v2.6.0-debug.apk" ]; then
  echo "Debug APK:   $ROOT_DIR/public/downloads/faczz-v2.6.0-debug.apk"
fi
echo "Keystore:    $KEYSTORE"
