clean:
	yarn --ignore-engines --check-files && \
	rm -rf ios/build/* ~/Library/Developer/Xcode/DerivedData/* && \
	cd ios && \
	pod install --repo-update && \
	cd .. && \
	yarn jetify && \
	cd android && ./gradlew clean;

start:
	make -Bs rm-babel-cache && \
	yarn craco start;

build:
	make -Bs rm-babel-cache && \
	yarn craco build && \
	node .embed;

intl:
	make -Bs rm-babel-cache && \
	export EXTRACT_INTL=1 && \
	yarn babel src -x .js,.ts,.tsx -d build && \
	rm -rf build && \
	node .intlBuild;

rm-babel-cache:
	rm -rf node_modules/.cache/babel* .intlNewEn.json;

###
# rn utils

pods:
	cd ios && \
	rm -rf Pods ~/Library/Caches/CocoaPods && \
	pod deintegrate && pod setup && \
	pod install --repo-update;

ashake:
	adb shell input keyevent 82;

bitcode:
	[ -d node_modules/react-native-webrtc/ios/WebRTC.dSYM ] || \
	bash node_modules/react-native-webrtc/tools/downloadBitcode.sh;

patch:
	npx patch-package --exclude="none" PACKAGE

###
# format

format:
	yarn format && \
	make -Bs format-objc && \
	make -Bs format-swift && \
	make -Bs format-java && \
	make -Bs format-xml;

format-objc:
	export EXT="h|m" && \
	make -Bs ls | \
	xargs clang-format -i -style=file;
format-swift:
	swiftformat ios;
format-java:
	export EXT="java" && \
	make -Bs ls | \
	xargs google-java-format -i;
format-xml:
	export EXT="xml|storyboard|xcscheme|xcworkspacedata|plist|entitlements" && \
	make -Bs ls | \
	xargs yarn -s prettier --plugin=@prettier/plugin-xml --parser=xml --xml-whitespace-sensitivity=ignore --log-level=error --write;
imagemin:
	export EXT="png|jpg|gif|ico" && \
	make -Bs ls | \
	xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)';
ls:
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' | \
	egrep -h '\.($(EXT))$$';

###
# dev server

android:
	export V=$$(jq -r ".version" package.json) && \
	cd android && ./gradlew clean && ./gradlew assembleRelease && \
	scp app/build/outputs/apk/release/app-release.apk bre:/var/www/upload/invoke/brekeke_phonedev$$V.apk;

ssl:
	bash dev/renewssl.sh;

keyhash1:
	ssh bre "openssl x509 -in /etc/letsencrypt/live/dev01.brekeke.com/cert.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64";

keyhash2:
	openssl pkcs12 -in ../0/brekeke/tomcat7.p12 -clcerts -nokeys | openssl x509 -pubkey -in /dev/stdin -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64;
