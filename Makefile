intl:
	cd ./apps/brekekephone/app \
	&& rm -rf ./intl-new-en.local.json \
	&& export EXTRACT_INTL=1 \
	&& npx babel src -x .js,.ts,.tsx -d ./build \
	&& rm -rf ./build \
	&& node ./intl-build;

###############################################################################
# clean

clean:
	make clean_rm \
	&& pnpm ci && pnpm dedupe \
	&& cd ./apps/brekekephone/app \
	&& cd ./ios \
	&& pod install --repo-update \
	&& cd ../android && ./gradlew clean;

clean_rm:
	cd ./apps/brekekephone/app \
	&& rm -rf \
		./ios/build \
		./ios/Pods \
		./ios/Podfile.lock \
		~/Library/Developer/Xcode/DerivedData \
		./android/.gradle \
		./android/app/.cxx \
		./android/build;

clean_deep:
	make clean_deep_rm \
	&& pnpm ci && pnpm dedupe \
	&& cd ./apps/brekekephone/app \
	&& cd ./ios \
	&& pod cache clean --all \
	&& pod deintegrate \
	&& pod install --repo-update \
	&& cd ../android \
	&& ./gradlew clean;

clean_deep_rm:
	make clean_rm \
	&& rm -rf \
		~/Library/Caches/CocoaPods \
		~/.gradle/caches \
		~/.gradle/daemon \
		$$TMPDIR/react-native* \
		$$TMPDIR/metro* \
		$$TMPDIR/haste-map*;

###############################################################################
# dev01

phonedev:
	pnpm dedupe \
	&& export V=$$(jq -r ".appVersion" package.json) \
	&& echo $$V \
	&& scp "../0/build/BrekekePhone/Brekeke Phone Dev.ipa" dev01:/var/www/upload/brekeke_phonedev$$V.ipa \
	&& rm -rf ../0/build/BrekekePhone \
	&& cd ./apps/brekekephone/app \
	&& cd ./android && ./gradlew clean && ./gradlew assembleRelease \
	&& scp ./app/build/outputs/apk/release/app-release.apk dev01:/var/www/upload/brekeke_phonedev$$V.apk \
	&& cd ../../../../ && make chmod;

phone:
	pnpm dedupe \
	&& export V=$$(jq -r ".appVersion" package.json) \
	&& echo $$V \
	&& scp "../0/build/BrekekePhone/Brekeke Phone.ipa" dev01:/var/www/upload/brekeke_phone$$V.ipa \
	&& rm -rf ../0/build/BrekekePhone \
	&& cd ./apps/brekekephone/app \
	&& cd ./android && ./gradlew clean && ./gradlew assembleRelease \
	&& scp ./app/build/outputs/apk/release/app-release.apk dev01:/var/www/upload/brekeke_phone$$V.apk \
	&& cd ../../../../ && make chmod;

chmod:
	ssh dev01 "sudo chmod -R a+rwX /var/www /etc/nginx/conf.d";

ssl:
	bash ./apps/dev01/ssl.sh;

keyhash1:
	ssh dev01 "openssl x509 -in /etc/letsencrypt/live/dev01.brekeke.com/cert.pem -pubkey -noout" \
	| openssl pkey -pubin -outform der \
	| openssl dgst -sha256 -binary \
	| openssl enc -base64;

keyhash2:
	openssl pkcs12 -in ../0/brekeke/tomcat7.p12 -clcerts -nokeys -passin pass:tomcat7 \
	| openssl x509 -pubkey -in /dev/stdin -noout \
	| openssl pkey -pubin -outform der \
	| openssl dgst -sha256 -binary \
	| openssl enc -base64;

###############################################################################
# fmt

fmt:
	pnpm fmt \
	&& make fmt_objc \
	&& make fmt_swift \
	&& make fmt_java \
	&& make fmt_kotlin \
	&& make fmt_xml;

fmt_objc:
	export EXT="h|m" \
	&& make -Bs git-ls \
	| xargs clang-format-11 -i -style=file;
fmt_swift:
	export EXT="swift" \
	&& make -Bs git-ls \
	| xargs swiftformat --quiet;
fmt_java:
	export EXT="java" \
	&& make -Bs git-ls \
	| xargs google-java-format -i;
fmt_kotlin:
	export EXT="kt" \
	&& make -Bs git-ls \
	| xargs ktfmt --quiet -i;
fmt_xml:
	export EXT="storyboard|xcscheme|xcworkspacedata" \
	&& make -Bs git-ls \
	| xargs pnpm dlx prettier --parser=xml --log-level=error --write;

imagemin:
	export EXT="png|jpg|gif|ico" \
	&& make -Bs git-ls \
	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)';
git-ls:
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' \
	| egrep -h '\.($(EXT))$$';
