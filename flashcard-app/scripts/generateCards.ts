import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Card {
  id: string;
  category: string;
  service: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const CONTENTS_DIR = join(__dirname, '../../contents');
const OUTPUT_FILE = join(__dirname, '../data/cards.json');

const CATEGORY_MAP: Record<string, string> = {
  analytics: 'Analytics',
  application_integration: 'Application Integration',
  cloud_financial_management: 'Cloud Financial Management',
  compute: 'Compute',
  containers: 'Containers',
  databases: 'Databases',
  developer_tools: 'Developer Tools',
  frontend_web_and_mobile: 'Frontend Web & Mobile',
  machine_learning: 'Machine Learning',
  management_and_governance: 'Management & Governance',
  migration_and_transfer: 'Migration & Transfer',
  networking: 'Networking',
  security_identity_and_compliance: 'Security, Identity & Compliance',
  storage: 'Storage',
};

function generateId(category: string, service: string, index: number): string {
  const catPrefix = category.slice(0, 3).toLowerCase();
  const svcPrefix = service.slice(0, 3).toLowerCase();
  return `${catPrefix}-${svcPrefix}-${String(index).padStart(3, '0')}`;
}

function formatServiceName(filename: string): string {
  return filename
    .replace('.md', '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Amazon ', '')
    .replace('Aws ', 'AWS ')
    .replace('Rds', 'RDS')
    .replace('Ec2', 'EC2')
    .replace('S3', 'S3')
    .replace('Iam', 'IAM')
    .replace('Kms', 'KMS')
    .replace('Vpc', 'VPC')
    .replace('Emr', 'EMR')
    .replace('Eks', 'EKS')
    .replace('Ecs', 'ECS')
    .replace('Ecr', 'ECR')
    .replace('Ebs', 'EBS')
    .replace('Efs', 'EFS')
    .replace('Rds', 'RDS')
    .replace('Sqs', 'SQS')
    .replace('Sns', 'SNS')
    .replace('Kinesis', 'Kinesis')
    .replace('Glue', 'Glue')
    .replace('Lambda', 'Lambda')
    .replace('Sam', 'SAM');
}

function parseMarkdown(content: string, category: string, service: string): Card[] {
  const cards: Card[] = [];
  const lines = content.split('\n');
  let currentSection = '';
  let cardIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('# ') && i === 0) {
      const title = line.replace('# ', '');
      cards.push({
        id: generateId(category, service, ++cardIndex),
        category,
        service,
        question: `What is ${title}?`,
        answer: extractFirstParagraph(lines, i),
        difficulty: 'easy',
      });
      continue;
    }

    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '');
      continue;
    }

    if (line.startsWith('### ')) {
      const subsection = line.replace('### ', '');
      const answer = extractBulletPoints(lines, i);
      if (answer) {
        cards.push({
          id: generateId(category, service, ++cardIndex),
          category,
          service,
          question: `What is ${subsection} in ${service}?`,
          answer,
          difficulty: 'medium',
        });
      }
      continue;
    }

    if (line.startsWith('- **') || line.startsWith('- ')) {
      const match = line.match(/- \*\*(.+?)\*\*[:\s]*(.+)?/);
      if (match) {
        const [, term, description] = match;
        const fullDescription = description || extractNestedBullets(lines, i);
        if (fullDescription) {
          cards.push({
            id: generateId(category, service, ++cardIndex),
            category,
            service,
            question: `What is ${term} in ${service}?`,
            answer: fullDescription,
            difficulty: 'medium',
          });
        }
      }
    }
  }

  return cards;
}

function extractFirstParagraph(lines: string[], startIndex: number): string {
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#')) {
      let paragraph = line;
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (!nextLine || nextLine.startsWith('#') || nextLine.startsWith('-')) break;
        paragraph += ' ' + nextLine;
      }
      return paragraph.replace(/\*\*/g, '');
    }
  }
  return '';
}

function extractBulletPoints(lines: string[], startIndex: number): string {
  const bullets: string[] = [];
  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ') || line.startsWith('# ')) break;
    if (line.trim().startsWith('- ')) {
      const cleanLine = line.trim().replace(/^- /, '').replace(/\*\*/g, '');
      if (cleanLine) bullets.push(cleanLine);
    }
  }
  return bullets.slice(0, 3).join('; ');
}

function extractNestedBullets(lines: string[], startIndex: number): string {
  const bullets: string[] = [];
  let indentLevel = lines[startIndex].indexOf('-');

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    if (line.startsWith('#')) break;

    const currentIndent = line.search(/\S/);
    if (currentIndent <= indentLevel && line.trim().startsWith('-')) break;

    if (line.trim().startsWith('- ')) {
      const cleanLine = line.trim().replace(/^- /, '').replace(/\*\*/g, '');
      if (cleanLine) bullets.push(cleanLine);
    }
  }

  return bullets.slice(0, 2).join('; ');
}

async function getMarkdownFiles(dir: string): Promise<{ path: string; category: string }[]> {
  const files: { path: string; category: string }[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getMarkdownFiles(fullPath);
      files.push(...subFiles.map((f) => ({ ...f, category: entry.name })));
    } else if (entry.name.endsWith('.md')) {
      files.push({ path: fullPath, category: basename(dir) });
    }
  }

  return files;
}

async function generateCards(): Promise<void> {
  const allCards: Card[] = [];
  const files = await getMarkdownFiles(CONTENTS_DIR);

  for (const { path, category } of files) {
    const content = await readFile(path, 'utf-8');
    const service = formatServiceName(basename(path));
    const categoryName = CATEGORY_MAP[category] || category;
    const cards = parseMarkdown(content, categoryName, service);
    allCards.push(...cards);
  }

  const output = { cards: allCards };
  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`Generated ${allCards.length} flashcards from ${files.length} files`);
}

generateCards().catch(console.error);
