fmt:
	pnpm fmt \
	&& make -Bs fmt_objc \
	&& make -Bs fmt_swift \
	&& make -Bs fmt_java \
	&& make -Bs fmt_kotlin \
	&& make -Bs fmt_xml;

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
