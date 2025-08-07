# Contributing to AI Medicine Safety App

Thank you for your interest in contributing to the AI Medicine Safety App! We welcome contributions from everyone.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/ai-medicine-safety-app.git
   cd ai-medicine-safety-app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```
5. **Initialize the database**:
   ```bash
   npm run db:push
   npm run db:generate
   ```

## 📋 Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes**
3. **Test your changes**:
   ```bash
   npm run lint
   npm run build
   ```
4. **Commit with a descriptive message**:
   ```bash
   git commit -m "feat: add new medicine search functionality"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request**

## 📝 Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add medicine interaction checker
fix: resolve database connection issue
docs: update API documentation
style: format components with prettier
refactor: improve search algorithm performance
test: add unit tests for gemini service
chore: update dependencies
```

## 🧪 Testing Guidelines

- Add tests for new features
- Ensure existing tests pass
- Follow testing best practices
- Test on multiple browsers/devices when applicable

## 📏 Code Style

We use the following tools to maintain code quality:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety

Run these commands before submitting:
```bash
npm run lint
npm run build
```

## 🔍 Pull Request Process

1. **Ensure your PR has a clear title and description**
2. **Link any related issues**
3. **Include screenshots for UI changes**
4. **Make sure all checks pass**
5. **Request review from maintainers**
6. **Address feedback promptly**

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of the code has been performed
- [ ] Code is well-commented, particularly in hard-to-understand areas
- [ ] Corresponding documentation has been updated
- [ ] Changes generate no new warnings
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## 🐛 Bug Reports

When reporting bugs, please include:

- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment information** (OS, browser, Node.js version)
- **Error logs** (if any)

## 💡 Feature Requests

For new features:

- **Describe the feature** clearly
- **Explain the use case** and benefits
- **Provide examples** or mockups if possible
- **Consider the impact** on existing functionality

## 🏗️ Project Structure

Understanding the project structure will help you contribute more effectively:

```
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── demo/           # Demo pages
│   │   └── ...
│   ├── components/         # Reusable components
│   │   └── ui/            # shadcn/ui components
│   ├── hooks/             # Custom React hooks
│   └── lib/               # Utility functions
├── prisma/                # Database schema
├── public/                # Static assets
└── ...
```

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Stay on topic in discussions
- Follow the code of conduct

## 📞 Getting Help

If you need help:

1. Check the [README](./README.md) first
2. Search existing [Issues](https://github.com/yourusername/ai-medicine-safety-app/issues)
3. Create a new issue if needed
4. Join our community discussions

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to AI Medicine Safety App! 🎉
