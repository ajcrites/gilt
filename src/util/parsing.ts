export interface Hash {
  hash: string;
  offset: number;
}

export interface File {
  file: string;
  offset: number;
}

// General parsing utility functions
export const parseHashes = (str: string) => {
  const hashes: Hash[] = [];
  str.replace(/(?:\b|\d\dm)([0-9a-f]{6,40})\b/g, (_, hash, offset) => {
    hashes.push({ hash, offset });
    return '';
  });

  return hashes;
};

export const parseFiles = (str: string) => {
  const files: File[] = [];
  str.replace(
    // tslint:disable-next-line:max-line-length
    /(?:^\t(?:(?:\u001b\[\d{2}m)?(?:\w+:\s+)?)?|^(?:(?:\u001b\[\d{0,2}m)?[MADRCU ?!]){2}?(?:\u001b\[m)? )(.*)/gm,
    (_, file, offset) => {
      files.push({ offset, file: file.replace(/\u001b\[m$/, '') });
      return '';
    },
  );

  return files;
};

// FIXME this should be highlightHash and highlightString can probably be used
// in the current cases instead
export const highlightSelection = (
  str: string,
  color = 'white-bg',
  offset = 0,
) =>
  str.substr(0, offset) +
  str
    .substr(offset)
    .replace(/(\b|\d\dm)([0-9a-f]{5,40})\b/, `$1{${color}}$2{/}`);

export const highlightString = (
  str: string,
  match: string,
  color = 'white-bg',
  offset = 0,
) =>
  str.substr(0, offset) + str.substr(offset).replace(match, `{${color}}$&{/}`);

// substring takes (start, end) vs. substr which is (start, length)
export const calculateScrollDistance = (
  str: string,
  start: number,
  end: number,
) => (str.substring(start, end).match(/\n/g) || []).length;
