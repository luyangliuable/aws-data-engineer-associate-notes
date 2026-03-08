/**
 * Convert a string to a URL-safe slug
 * - Lowercases the text
 * - Replaces all non-alphanumeric characters with hyphens
 * - Removes leading/trailing hyphens
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const GITHUB_REPO_URL =
  'https://github.com/RotaN8/aws-data-engineer-associate-notes/blob/main/contents';

/**
 * Generate a GitHub URL for a card's source file
 */
export function generateGithubUrl(category: string, service: string): string {
  // Convert category to folder name (lowercase, spaces/special chars to underscores)
  const categoryFolder = category.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  // Convert service to file name
  // Services usually start with "Amazon" or "AWS" which become "amazon_" or "aws_"
  const serviceFile = service.toLowerCase().replace(/\s+/g, '_');

  return `${GITHUB_REPO_URL}/${categoryFolder}/${serviceFile}.md`;
}
