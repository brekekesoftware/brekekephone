format:
	yarn format
	make format-objc
	make format-java
	make format-xml
	make imagemin

format-objc:
	export EXT="h|m" \
	&& make -s ls \
	| xargs clang-format -i -style=file
format-java:
	export EXT="java" \
	&& make -s ls \
	| xargs google-java-format -i
format-xml:
	export EXT="xml|xib|xcscheme|xcworkspacedata|plist|entitlements" \
	&& make -s ls \
	| xargs yarn -s prettier --plugin=@prettier/plugin-xml --parser=xml --loglevel=error --write
imagemin:
	export EXT="png|jpg|gif|ico" \
	&& make -s ls \
	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)'
ls:
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' \
	| egrep -h '\.($(EXT))$$'
