/**
 * Calculates the Levenshtein distance between two strings.
 * The smaller the distance, the closer the strings are.
 * @param {string} str1 - The first string.
 * @param {string} str2 - The second string.
 * @returns {number} - The Levenshtein distance between the two strings.
 */
function magicDistance(str1, str2) {
    // Normalize the strings by converting to lowercase and splitting into words (tokens)
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);

    // Create sets of words to remove duplicates
    const set1 = new Set(words1);
    const set2 = new Set(words2);

    // Count the number of common words between the two sets
    const commonWords = [...set1].filter(word => set2.has(word)).length;

    // Calculate the total number of unique words across both sets
    const totalUniqueWords = new Set([...set1, ...set2]).size;

    // Return the similarity score as a ratio of common words to total unique words
    return 1 - (totalUniqueWords === 0 ? 0 : commonWords / totalUniqueWords);
}
