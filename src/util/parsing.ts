// General parsing utility functions
export const parseHashes = str => {
  const hashes = [];
  str.replace(/(?:\b|\d\dm)([0-9a-f]{5,40})\b/g, (_, hash, offset) => {
    hashes.push({ hash, offset });
  });

  return hashes;
};

export const highlightSelection = (str, offset = 0) =>
  str.substr(0, offset) +
  str
    .substr(offset)
    .replace(/(\b|\d\dm)([0-9a-f]{5,40})\b/, '$1{white-bg}$2{/}');

// substring takes (start, end) vs. substr which is (start, length)
export const calculateScrollDistance = (str, start, end) =>
  (str.substring(start, end).match(/\n/g) || []).length;
