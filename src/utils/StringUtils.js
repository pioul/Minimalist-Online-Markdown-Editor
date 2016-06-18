/**
 * Return a string that's shortened if necessary, by replacing excess characters
 * in the middle of the string by an ellipsis.
 *
 * E.g. getShortString('React Blog Post', 10) -> 'Reac…Post'
 */
const getShortString = (str, length) => {
  let shortString = str;

  if (shortString.length > length) {
    const substrLength = Math.round(length / 2) - 1;
    const leftSubstr = str.substr(0, substrLength);
    const rightSubstr = str.substr(-substrLength);

    shortString = `${leftSubstr}…${rightSubstr}`;
  }

  return shortString;
};

/**
 * Return a random id. If an array of existing ids is passed, it'll ensure
 * the returned id is unique.
 */
const generateUniqueId = (existingIds = []) => {
  let id;

  do {
    id = Math.floor(Math.random() * Math.pow(10, 10)).toString(36);
  } while (existingIds.includes(id));

  return id;
};

export { getShortString, generateUniqueId };
