import strip from 'striptags';

const stripTags = str => str && strip(strip(str, ['br']), [], '\r\n');

export default stripTags;
