#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const TEMPLATE_DIR = path.join(__dirname, '..', 'template');

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

function log(message, color = '') {
    console.log(`${color}${message}${COLORS.reset}`);
}

function logStep(step, message) {
    log(`\n${COLORS.cyan}[${step}]${COLORS.reset} ${message}`);
}

function logSuccess(message) {
    log(`${COLORS.green}✓${COLORS.reset} ${message}`);
}

function logError(message) {
    log(`${COLORS.red}✗ ${message}${COLORS.reset}`);
}

function printBanner() {
    console.log(`
${COLORS.magenta}${COLORS.bright}
   ╔═══════════════════════════════════════════════════════════╗
   ║                                                           ║
   ║      ███████╗ █████╗ ██████╗ ██████╗ ██╗██╗   ██╗███████╗ ║
   ║      ██╔════╝██╔══██╗██╔══██╗██╔══██╗██║██║   ██║██╔════╝ ║
   ║      ███████╗███████║██████╔╝██║  ██║██║██║   ██║███████╗ ║
   ║      ╚════██║██╔══██║██╔══██╗██║  ██║██║██║   ██║╚════██║ ║
   ║      ███████║██║  ██║██║  ██║██████╔╝██║╚██████╔╝███████║ ║
   ║      ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝ ╚═════╝ ╚══════╝ ║
   ║                                                           ║
   ║          DDD NestJS Backend Template by Rueda.dev         ║
   ║                                                           ║
   ╚═══════════════════════════════════════════════════════════╝
${COLORS.reset}`);
}

function question(rl, query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

function copyRecursive(src, dest) {
    const stats = fs.statSync(src);

    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const files = fs.readdirSync(src);
        for (const file of files) {
            copyRecursive(path.join(src, file), path.join(dest, file));
        }
    } else {
        fs.copyFileSync(src, dest);
    }
}

function updatePackageJson(projectPath, projectName) {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.name = projectName;
    packageJson.version = '0.0.1';
    packageJson.description = `${projectName} - Built with Sardius DDD Template`;
    packageJson.author = '';
    packageJson.private = true;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4) + '\n');
}

function updateEnvExample(projectPath, projectName) {
    const envExamplePath = path.join(projectPath, '.env.example');
    if (fs.existsSync(envExamplePath)) {
        let content = fs.readFileSync(envExamplePath, 'utf8');
        content = content.replace(/sardius/gi, projectName.toLowerCase());
        fs.writeFileSync(envExamplePath, content);
    }
}

async function main() {
    printBanner();

    const args = process.argv.slice(2);
    let projectName = args[0];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    try {
        if (!projectName) {
            projectName = await question(rl, `${COLORS.cyan}?${COLORS.reset} Project name: `);
        }

        if (!projectName || projectName.trim() === '') {
            logError('Project name is required');
            process.exit(1);
        }

        projectName = projectName.trim();
        const projectPath = path.resolve(process.cwd(), projectName);

        if (fs.existsSync(projectPath)) {
            logError(`Directory "${projectName}" already exists`);
            process.exit(1);
        }

        logStep('1/4', 'Creating project directory...');
        fs.mkdirSync(projectPath, { recursive: true });
        logSuccess(`Created ${projectName}/`);

        logStep('2/4', 'Copying template files...');
        copyRecursive(TEMPLATE_DIR, projectPath);
        logSuccess('Template files copied');

        logStep('3/4', 'Configuring project...');
        updatePackageJson(projectPath, projectName);
        updateEnvExample(projectPath, projectName);
        logSuccess('Project configured');

        logStep('4/4', 'Initializing git repository...');
        try {
            execSync('git init', { cwd: projectPath, stdio: 'ignore' });
            logSuccess('Git repository initialized');
        } catch {
            log('  Skipped git init (git not available)', COLORS.dim);
        }

        console.log(`
${COLORS.green}${COLORS.bright}
   ✨ Project "${projectName}" created successfully!
${COLORS.reset}
${COLORS.cyan}Next steps:${COLORS.reset}

   ${COLORS.dim}1.${COLORS.reset} cd ${projectName}
   ${COLORS.dim}2.${COLORS.reset} npm install
   ${COLORS.dim}3.${COLORS.reset} cp .env.example .env ${COLORS.dim}(configure your environment)${COLORS.reset}
   ${COLORS.dim}4.${COLORS.reset} docker-compose up -d ${COLORS.dim}(start PostgreSQL)${COLORS.reset}
   ${COLORS.dim}5.${COLORS.reset} npm run prisma:migrate
   ${COLORS.dim}6.${COLORS.reset} npm run start:dev

${COLORS.dim}Documentation: https://github.com/rueda-dev/sardius${COLORS.reset}
${COLORS.dim}Built with Sardius DDD Template by Rueda.dev${COLORS.reset}
`);
    } finally {
        rl.close();
    }
}

main().catch((error) => {
    logError(error.message);
    process.exit(1);
});
