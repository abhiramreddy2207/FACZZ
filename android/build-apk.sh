#!/bin/bash
set -e

ANDROID_SDK="/Users/abhiramreddy/Library/Android/sdk"
PLATFORM="$ANDROID_SDK/platforms/android-36.1/android.jar"
BUILD_TOOLS="$ANDROID_SDK/build-tools/36.1.0"
JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-24.jdk/Contents/Home"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Compiling Faczz Android App ==="

WORK_DIR="/tmp/faczz_android_build"
rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR/compiled_res" "$WORK_DIR/gen" "$WORK_DIR/bin" "$WORK_DIR/dex"

# 1. Compile resources with aapt2
echo "1. Compiling resources..."
"$BUILD_TOOLS/aapt2" compile --dir "$ROOT_DIR/android/app/src/main/res" -o "$WORK_DIR/res.zip"

# 2. Link resources and generate R.java
echo "2. Linking resources and generating R.java..."
"$BUILD_TOOLS/aapt2" link "$WORK_DIR/res.zip" \
  -I "$PLATFORM" \
  --manifest "$ROOT_DIR/android/app/src/main/AndroidManifest.xml" \
  --java "$WORK_DIR/gen" \
  -o "$WORK_DIR/base.apk"

# 3. Compile Java sources
echo "3. Compiling Java sources with javac..."
"$JAVA_HOME/bin/javac" \
  -cp "$PLATFORM" \
  --release 17 \
  -d "$WORK_DIR/bin" \
  "$WORK_DIR/gen/com/faczz/app/R.java" \
  "$ROOT_DIR/android/app/src/main/java/com/faczz/app/MainActivity.java" \
  "$ROOT_DIR/android/app/src/main/java/com/faczz/app/WebAppInterface.java"

# 4. Dex classes with d8
echo "4. Converting bytecode to DEX with d8..."
"$BUILD_TOOLS/d8" \
  --lib "$PLATFORM" \
  --min-api 21 \
  --output "$WORK_DIR/dex" \
  $(find "$WORK_DIR/bin" -name "*.class")

# 5. Add DEX to base.apk
echo "5. Adding DEX into APK..."
cd "$WORK_DIR/dex"
zip -u "$WORK_DIR/base.apk" classes.dex
cd - > /dev/null

# 6. Zipalign APK
echo "6. Aligning APK with zipalign..."
"$BUILD_TOOLS/zipalign" -p -f 4 "$WORK_DIR/base.apk" "$WORK_DIR/aligned.apk"

# 7. Generate release key and sign
echo "7. Signing APK with apksigner (v1, v2, v3)..."
KEYSTORE="$WORK_DIR/release.keystore"
"$JAVA_HOME/bin/keytool" -genkeypair -v \
  -keystore "$KEYSTORE" \
  -alias faczz \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass faczz123 \
  -keypass faczz123 \
  -dname "CN=Faczz, OU=Mobile, O=Faczz F1, L=London, C=GB"

mkdir -p "$ROOT_DIR/public/downloads"
"$BUILD_TOOLS/apksigner" sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:faczz123 \
  --ks-key-alias faczz \
  --key-pass pass:faczz123 \
  --v1-signing-enabled true \
  --v2-signing-enabled true \
  --v3-signing-enabled true \
  --out "$ROOT_DIR/public/downloads/faczz-v2.6.0.apk" \
  "$WORK_DIR/aligned.apk"

# 8. Verify APK
echo "8. Verifying APK signature..."
"$BUILD_TOOLS/apksigner" verify -v "$ROOT_DIR/public/downloads/faczz-v2.6.0.apk"

echo "=== BUILD COMPLETE! ==="
echo "Output: $ROOT_DIR/public/downloads/faczz-v2.6.0.apk"
