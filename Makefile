format:
	yarn format
	make format-objc
	make format-java
	make format-xml
	make imagemin

format-objc:
	EXT="h|m" \
	&& make -s ls \
	| xargs clang-format -i -style=file
format-java:
	EXT="java" \
	&& make -s ls \
	| xargs google-java-format -i
format-xml:
	EXT="xml|xib|xccheme|xcworkspacedata|plist" \
	&& make -s ls \
	| xargs -L1 bash -c 'xmllint --format --output $$0 $$0'
imagemin:
	EXT="png|jpg|gif|ico" \
	&& make -s ls \
	| xargs -L1 bash -c 'imagemin $$0 --out-dir $$(dirname $$0)'
ls:
	bash -c 'comm -3 <(git ls-files) <(git ls-files -d)' \
	| egrep -h '\.($(EXT))$$'
