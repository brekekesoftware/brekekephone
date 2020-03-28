const path = require('path');
const fs = require('fs-extra');

const jsonOutputPath = path.join(__dirname, './src/intl/en2.json');

// Only add brackets if there's no existing brackets
const withBrackets = (exprName, rawTemplate, i) =>
  !findBrackets(rawTemplate, i, '{') ||
  !findBrackets(rawTemplate, i + exprName.length, '}')
    ? `{{${exprName}}}`
    : exprName;
const findBrackets = (rawTemplate, i, bracket) => {
  const d = bracket === '{' ? -1 : 1;
  const negBracket = bracket === '{' ? '}' : '{';
  while (true) {
    if (i <= 0 || i >= rawTemplate.length) {
      return false;
    }
    const c1 = rawTemplate.charAt(i);
    const c2 = rawTemplate.charAt(i + d);
    if (c1 === c2 && c1 === bracket) {
      return true;
    }
    if (c1 === c2 && c1 === negBracket) {
      return false;
    }
    i += d;
  }
};

const babelPluginIntl = () => ({
  visitor: {
    TaggedTemplateExpression(p, s) {
      //
      const tagName = p.node.tag.name;
      const tl = tagName && tagName.toLowerCase();
      if (!tl || (tl.indexOf('intl') < 0 && tl.indexOf('debug') < 0)) {
        return;
      }
      // Get raw expressions from source code
      const exprs = p.node.quasi.expressions.map(e =>
        s.file.code.substring(e.start, e.end),
      );
      // Build data keys from expressions with their name as camelCase
      const exprNames = exprs.map(e =>
        e
          .split(/\W+/g)
          .filter(w => w)
          .map((w, i) => (!i ? w : w.charAt(0).toUpperCase() + w.substr(1)))
          .join(''),
      );
      // Check invalid/duplicated fields
      const duplicatedMap = {};
      exprNames.forEach((v, i) => {
        if (!v) {
          throw p.buildCodeFrameError(
            `Can not build identifier for expression ${exprs[i]}`,
          );
        }
        if (v in duplicatedMap) {
          throw p.buildCodeFrameError(
            `Duplicated identifier for expression ${
              exprs[duplicatedMap[v]]
            } and ${exprs[i]}`,
          );
        }
        duplicatedMap[v] = i;
      });
      // Build the locations to automatically add brackets for fields
      const quasis = p.node.quasi.quasis.map(q => q.value.raw);
      const [rawTemplate, fieldLocations] = quasis.reduce(
        ([r, a], q, i) => {
          r += q;
          if (i < exprNames.length) {
            a.push(r.length);
            r += exprNames[i];
          }
          return [r, a];
        },
        ['', []],
      );
      // Get the template
      const normalizedTemplate = quasis
        .reduce((a, q, i) => {
          a.push(q);
          if (i < exprNames.length) {
            a.push(withBrackets(exprNames[i], rawTemplate, fieldLocations[i]));
          }
          return a;
        }, [])
        .join('')
        .replace('\\`', '`');
      // Extract the normalized template
      if (process.env.EXTRACT_INTL) {
        let arr = fs.existsSync(jsonOutputPath)
          ? JSON.parse(fs.readFileSync(jsonOutputPath))
          : [];
        if (!arr.includes(normalizedTemplate)) {
          arr.push(normalizedTemplate);
          arr = arr.sort();
        }
        fs.outputFileSync(jsonOutputPath, `${JSON.stringify(arr, null, 2)}\n`);
      }
      // Replace the tagged template with a function call
      const p1 = JSON.stringify(normalizedTemplate);
      const p2 = `{${exprNames.map((v, i) => `${v}:${exprs[i]}`).join(',')}}`;
      p.replaceWithSourceString(`${tagName}(${p1}, ${p2})`);
    },
  },
});

module.exports = babelPluginIntl;
