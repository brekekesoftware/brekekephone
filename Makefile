clean:
	yarn --ignore-engines --check-files && \
	rm -rf ios/build/* ~/Library/Developer/Xcode/DerivedData/* && \
	cd ios && \
	rm -rf ./Pods && \
	pod install --repo-update && \
	cd .. && \
	yarn jetify && \
	cd android && ./gradlew clean;

start:
	make -Bs rm_babel_cache && \
	yarn craco start;

build:
	make -Bs rm_babel_cache && \
	yarn craco build && \
	node .embed;

intl:
	make -Bs rm_babel_cache && \
	export EXTRACT_INTL=1 && \
	yarn babel src -x .js,.ts,.tsx -d build && \
	rm -rf build && \
	node .intlBuild;

rm_babel_cache:
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

fmt:
	yarn lint && \
	make -Bs fmt_objc && \
	make -Bs fmt_swift && \
	make -Bs fmt_java && \
	make -Bs fmt_kotlin && \
	make -Bs fmt_xml;

fmt_objc:
	export EXT="h|m" && \
	make -Bs ls | \
	xargs clang-format-11 -i -style=file;
fmt_swift:
	swiftformat ios;
fmt_java:
	export EXT="java" && \
	make -Bs ls | \
	xargs google-java-format -i;
fmt_kotlin:
	export EXT="kt" && \
	make -Bs ls | \
	xargs ktfmt -i;
fmt_xml:
	export EXT="xml|storyboard|xcscheme|xcworkspacedata" && \
	make -Bs ls | \
	xargs yarn -s prettier --plugin=@prettier/plugin-xml --parser=xml --xml-whitespace-sensitivity=ignore --log-level=error --write;
imagemin:
	export EXT="png|jpg|gif|ico" && \
	make -Bs ls | \
	xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)';
ls:
	git add -A && \
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' | \
	egrep -h '\.($(EXT))$$';

###
# dev server

phonedev:
	export V=$$(jq -r ".version" package.json) && \
	echo $$V && \
	make -Bs chmod && \
	scp ../0/build/BrekekePhone/Brekeke\ Phone\ Dev.ipa bre:/var/www/upload/brekeke_phonedev$$V.ipa && \
	rm -rf ../0/build/BrekekePhone && \
	make -Bs chmod && \
	cd android && ./gradlew clean && ./gradlew assembleRelease && \
	scp app/build/outputs/apk/release/app-release.apk bre:/var/www/upload/brekeke_phonedev$$V.apk && \
	cd .. && make -Bs chmod;

phone:
	export V=$$(jq -r ".version" package.json) && \
	echo $$V && \
	make -Bs chmod && \
	scp ../0/build/BrekekePhone/Brekeke\ Phone.ipa bre:/var/www/upload/brekeke_phone$$V.ipa && \
	rm -rf ../0/build/BrekekePhone && \
	make -Bs chmod && \
	cd android && ./gradlew clean && ./gradlew assembleRelease && \
	scp app/build/outputs/apk/release/app-release.apk bre:/var/www/upload/brekeke_phone$$V.apk && \
	cd .. && make -Bs chmod;

web:
	export V=$$(jq -r ".version" package.json) && \
	echo $$V && \
	make -Bs chmod && \
	yarn --ignore-engines && yarn build && \
	mv build brekeke_phone$$V && zip -vr brekeke_phone$$V.zip brekeke_phone$$V && \
	scp brekeke_phone$$V.zip bre:/var/www/upload && \
	rm -rf brekeke_phone* && \
	ssh bre "cd /var/www && sudo rm -rf phone && unzip /var/www/upload/brekeke_phone$$V.zip && sudo mv brekeke_phone$$V phone" && \
	make -Bs chmod;

dev:
	make -Bs chmod && \
	cd dev01/react-app && yarn --ignore-engines && yarn build && \
	mv build dev-react-app && zip -vr dev-react-app.zip dev-react-app && \
	scp dev-react-app.zip bre:/var/www && \
	rm -rf dev-react-app* && \
	ssh bre "cd /var/www && sudo rm -rf dev-react-app && unzip dev-react-app.zip && sudo rm -f dev-react-app.zip" && \
	cd ../api && yarn --ignore-engines && \
	scp index.js package.json yarn.lock bre:/var/www/dev-api && \
	ssh bre "cd /var/www/dev-api && source ~/.nvm/nvm.sh && yarn --ignore-engines && pm2 -s delete all && pm2 flush && pm2 -s start --name=dev-api . && pm2 save" && \
	scp nginx.conf bre:/etc/nginx/conf.d/dev01.conf && \
	ssh bre "sudo nginx -t && sudo service nginx restart" && \
	cd ../.. && make -Bs chmod;

chmod:
	ssh bre "sudo chmod -R a+rwX /var/www /etc/nginx/conf.d";

ssl:
	bash dev01/renewssl.sh;

keyhash1:
	ssh bre "openssl x509 -in /etc/letsencrypt/live/dev01.brekeke.com/cert.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64";

keyhash2:
	openssl pkcs12 -in ../0/brekeke/tomcat7.p12 -clcerts -nokeys | openssl x509 -pubkey -in /dev/stdin -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64;
