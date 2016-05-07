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

/**
 * Return a random id. If an array of existing ids is passed, it'll ensure
 * the returned id is unique.
 */
var generateUniqueId = (existingIds = []) => {
  var id;

  do {
    id = Math.floor(Math.random() * Math.pow(10, 10)).toString(36);
  } while (existingIds.includes(id));

  return id;
};

export { getShortString, generateUniqueId };
