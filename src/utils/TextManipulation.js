/**
 * Return a string that's shortened if necessary, by replacing excess characters
 * in the middle of the string by an ellipsis.
 *
 * E.g. getShortString('React Blog Post', 10) -> 'Reac…Post'
 */
var getShortString = (str, length) => {
  if (str.length > length) {
    length = Math.round(length / 2) - 1;
    str = str.substr(0, length) + '…' + str.substr(-length);
  }

  return str;
};

export { getShortString };
