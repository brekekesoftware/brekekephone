V := $(shell jq -r ".appVersion" package.json)

intl:
	@cd ./brekekephone/app \
	&& rm -rf ./intl-new-en.local.json \
	&& export EXTRACT_INTL=1 \
	&& npx babel src -x .js,.ts,.tsx -d ./build \
	&& rm -rf ./build \
	&& node ./intl-build;

###############################################################################
# build and upload to dev01

phonedev:
	@echo "appVersion=$(V)" \
	&& pnpm i --frozen-lockfile \
	&& scp "./build/BrekekePhone/Brekeke Phone Dev.ipa" dev01:/var/www/upload/brekeke_phonedev$(V).ipa \
	&& rm -rf ./build/BrekekePhone \
	&& cd ./brekekephone/app \
	&& cd ./android \
	&& ./gradlew clean \
	&& ./gradlew generateCodegenArtifactsFromSchema \
	&& ./gradlew assembleRelease \
	&& scp ./app/build/outputs/apk/release/app-release.apk dev01:/var/www/upload/brekeke_phonedev$(V).apk \
	&& cd ../../../../ \
	&& make chmod;

phone:
	@echo "appVersion=$(V)" \
	&& pnpm i --frozen-lockfile \
	&& scp "./build/BrekekePhone/Brekeke Phone.ipa" dev01:/var/www/upload/brekeke_phone$(V).ipa \
	&& rm -rf ./build/BrekekePhone \
	&& cd ./brekekephone/app \
	&& cd ./android \
	&& ./gradlew clean \
	&& ./gradlew generateCodegenArtifactsFromSchema \
	&& ./gradlew assembleRelease \
	&& scp ./app/build/outputs/apk/release/app-release.apk dev01:/var/www/upload/brekeke_phone$(V).apk \
	&& cd ../../../../ \
	&& make chmod;

web:
	@echo "appVersion=$(V)" \
	&& pnpm i --frozen-lockfile \
	&& cd ./brekekephone/web \
	&& pnpm build \
	&& mv ./build ./brekeke_phone$(V) \
	&& zip -vr ./brekeke_phone$(V).zip ./brekeke_phone$(V) \
	&& scp ./brekeke_phone$(V).zip dev01:/var/www/upload \
	&& rm -rf ./brekeke_phone* \
	&& ssh dev01 "cd /var/www && sudo rm -rf ./phone && unzip ./upload/brekeke_phone$(V).zip && sudo mv ./brekeke_phone$(V) ./phone" \
	&& cd ../../../ \
	&& make chmod;

embed_b:
	@pnpm i --frozen-lockfile \
	&& cd ./brekekephone/web \
	&& pnpm build \
	&& cd ../../embed-example/react \
	&& rm -rf ./public/brekeke_phone* \
	&& mv ../../brekekephone/web/build ./public/brekeke_phone$(V);

embed_u:
	@pnpm i --frozen-lockfile \
	&& cd ./embed-example/react \
	&& pnpm build \
	&& mv ./dist ./embed \
	&& zip -vr ./embed.zip ./embed \
	&& scp ./embed.zip dev01:/var/www \
	&& rm -rf ./embed ./embed.zip \
	&& ssh dev01 "cd /var/www && sudo rm -rf ./embed && unzip ./embed.zip && rm ./embed.zip" \
	&& cd ../../../ \
	&& make chmod;

dev:
	@pnpm i --frozen-lockfile \
	&& cd ./dev01/web \
	&& pnpm build \
	&& mv ./dist ./dev-web \
	&& zip -vr ./dev-web.zip ./dev-web \
	&& scp ./dev-web.zip dev01:/var/www \
	&& rm -rf ./dev-web* \
	&& ssh dev01 "cd /var/www && sudo rm -rf ./dev-web && unzip ./dev-web.zip && sudo rm -rf ./dev-web.zip" \
	&& cd ../api \
	&& scp ./index.js ./package.json dev01:/var/www/dev-api \
	&& ssh dev01 "cd /var/www/dev-api && source ~/.nvm/nvm.sh && npm i && pm2 -s delete all && pm2 flush && pm2 -s start --name=dev-api . && pm2 save" \
	&& scp ./nginx.conf dev01:/etc/nginx/conf.d/dev01.conf \
	&& ssh dev01 "sudo nginx -t && sudo service nginx restart" \
	&& cd ../../../ \
	&& make chmod;

###############################################################################
# dev01 utils

chmod:
	@ssh dev01 "sudo chmod -R a+rwX /var/www";

ssl:
	@bash ./dev01/ssl.sh;

keyhash1:
	@ssh dev01 "openssl x509 -in /etc/letsencrypt/live/dev01.brekeke.com/cert.pem -pubkey -noout" \
	| openssl pkey -pubin -outform der \
	| openssl dgst -sha256 -binary \
	| openssl enc -base64;

keyhash2:
	@openssl pkcs12 -in ../0/brekeke/tomcat7.p12 -clcerts -nokeys -passin pass:tomcat7 \
	| openssl x509 -pubkey -in /dev/stdin -noout \
	| openssl pkey -pubin -outform der \
	| openssl dgst -sha256 -binary \
	| openssl enc -base64;

###############################################################################
# clean

clean:
	@make clean_rm \
	&& pnpm clean \
	&& pnpm dedupe \
	&& cd ./brekekephone/app \
	&& cd ./ios \
	&& pod install --repo-update \
	&& cd ../android \
	&& ./gradlew clean;

clean_rm:
	@cd ./brekekephone/app \
	&& rm -rf \
		./ios/build \
		./ios/Pods \
		./ios/Podfile.lock \
		~/Library/Developer/Xcode/DerivedData \
		./android/.gradle \
		./android/app/.cxx \
		./android/build;

clean_deep:
	@make clean_deep_rm \
	&& pnpm clean \
	&& pnpm dedupe \
	&& cd ./brekekephone/app \
	&& cd ./ios \
	&& pod cache clean --all \
	&& pod deintegrate \
	&& pod install --repo-update \
	&& cd ../android \
	&& ./gradlew clean;

clean_deep_rm:
	@make clean_rm \
	&& rm -rf \
		~/Library/Caches/CocoaPods \
		~/.gradle/caches \
		~/.gradle/daemon \
		$$TMPDIR/react-native* \
		$$TMPDIR/metro* \
		$$TMPDIR/haste-map*;

###############################################################################
# fmt

fmt:
	@pnpm fmt \
	&& make fmt_objc \
	&& make fmt_swift \
	&& make fmt_java \
	&& make fmt_kotlin \
	&& make fmt_xml;

fmt_objc:
	@export EXT="h|m" \
	&& make git-ls \
	| xargs clang-format-11 -i -style=file;
fmt_swift:
	@export EXT="swift" \
	&& make git-ls \
	| xargs swiftformat --quiet;
fmt_java:
	@export EXT="java" \
	&& make git-ls \
	| xargs google-java-format -i;
fmt_kotlin:
	@export EXT="kt" \
	&& make git-ls \
	| xargs ktfmt --quiet -i;
fmt_xml:
	@export EXT="storyboard|xcscheme|xcworkspacedata" \
	&& make git-ls \
	| xargs pnpm dlx prettier --parser=xml --log-level=error --write;

imagemin:
	@export EXT="png|jpg|gif|ico" \
	&& make git-ls \
	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)';
git-ls:
	@bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' \
	| egrep -h '\.($(EXT))$$';
