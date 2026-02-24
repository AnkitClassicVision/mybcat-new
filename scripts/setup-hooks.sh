#!/bin/bash

# Setup Git Hooks for MyBCAT Site Validation
# Run: bash scripts/setup-hooks.sh

set -e

echo "Setting up Git hooks for site validation..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# MyBCAT Pre-Commit Hook
# Validates content before allowing commit

echo "Running pre-commit validations..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track if any validation fails
FAILED=0

# Get list of staged files
STAGED_MD=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(md|mdx)$' || true)
STAGED_ASTRO=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.astro$' || true)

# If no relevant files are staged, skip validation
if [ -z "$STAGED_MD" ] && [ -z "$STAGED_ASTRO" ]; then
    echo -e "${GREEN}No content files staged, skipping validation.${NC}"
    exit 0
fi

echo "Staged files:"
echo "$STAGED_MD"
echo "$STAGED_ASTRO"
echo ""

# Run forbidden terms check on staged markdown files
if [ -n "$STAGED_MD" ]; then
    echo -e "${YELLOW}Checking forbidden terms...${NC}"
    for file in $STAGED_MD; do
        if [ -f "$file" ]; then
            node scripts/validators/validate-terms.js --file "$file" || FAILED=1
        fi
    done
fi

# Run meta tag validation on staged markdown files
if [ -n "$STAGED_MD" ]; then
    echo -e "${YELLOW}Checking meta tags...${NC}"
    for file in $STAGED_MD; do
        if [ -f "$file" ]; then
            node scripts/validators/validate-meta.js --file "$file" || FAILED=1
        fi
    done
fi

# Run H1 validation
if [ -n "$STAGED_MD" ] || [ -n "$STAGED_ASTRO" ]; then
    echo -e "${YELLOW}Checking H1 tags...${NC}"
    ALL_STAGED="$STAGED_MD $STAGED_ASTRO"
    for file in $ALL_STAGED; do
        if [ -f "$file" ]; then
            node scripts/validators/validate-h1.js --file "$file" || FAILED=1
        fi
    done
fi

# Final result
if [ $FAILED -eq 1 ]; then
    echo ""
    echo -e "${RED}Pre-commit validation failed!${NC}"
    echo "Fix the issues above before committing."
    echo ""
    echo "To bypass (not recommended): git commit --no-verify"
    exit 1
fi

echo ""
echo -e "${GREEN}All pre-commit validations passed!${NC}"
exit 0
EOF

# Make hook executable
chmod +x .git/hooks/pre-commit

echo "Pre-commit hook installed!"

# Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# MyBCAT Pre-Push Hook
# Runs full validation before push

echo "Running pre-push validations..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Run all pre-build validations
echo "Running pre-build validations..."
npm run validate:terms || exit 1
npm run validate:meta || exit 1
npm run validate:h1 || exit 1
npm run validate:enterprise-links || exit 1
npm run validate:redirects || exit 1

echo ""
echo -e "${GREEN}All pre-push validations passed!${NC}"
exit 0
EOF

chmod +x .git/hooks/pre-push

echo "Pre-push hook installed!"
echo ""
echo "Git hooks setup complete!"
echo ""
echo "Hooks installed:"
echo "  - pre-commit: Validates staged content files"
echo "  - pre-push: Runs full validation suite"
echo ""
echo "To disable hooks temporarily, use: git commit --no-verify"
