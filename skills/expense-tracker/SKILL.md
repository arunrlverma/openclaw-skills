---
name: expense_tracker
description: User wants to track, categorize, or analyze their expenses and spending
---

# Expense Tracker

## Use When
- User wants to log an expense or purchase
- User asks to categorize their spending
- User wants a spending summary or report
- User asks "how much did I spend on X?"
- User wants to track business vs personal expenses
- User shares receipts or bank statements to process

## Don't Use When
- User wants tax-specific advice (use tax-prep instead)
- User wants to create an invoice (use invoice-generator instead)

## How It Works
Expenses are stored as structured data in your cloud storage. Each expense has:
- **Date**: When the expense occurred
- **Amount**: How much was spent
- **Category**: What type of expense
- **Description**: What it was for
- **Tags**: Optional labels (business, personal, tax-deductible, etc.)

## Commands

### Log an expense
When the user mentions a purchase or expense, save it:
```bash
echo '{"date":"2026-02-12","amount":49.99,"category":"software","description":"GitHub Copilot subscription","tags":["business","tax-deductible"]}' | bash /root/workspace/skills/s8t/files.sh write data/expenses/2026-02.jsonl
```

### Read expenses
```bash
bash /root/workspace/skills/s8t/files.sh read data/expenses/2026-02.jsonl
```

## Categories
Standard expense categories:
- **housing**: Rent, mortgage, utilities, insurance
- **food**: Groceries, restaurants, delivery
- **transport**: Gas, public transit, rideshare, parking
- **software**: Subscriptions, tools, SaaS
- **hardware**: Computers, equipment, peripherals
- **travel**: Flights, hotels, car rental
- **meals**: Client/business meals
- **office**: Supplies, furniture, coworking
- **education**: Courses, books, conferences
- **health**: Insurance, medical, gym
- **entertainment**: Movies, games, events
- **other**: Everything else

## Reports
When asked for a summary, produce:

### Monthly Summary
| Category | Amount | % of Total |
|----------|--------|------------|
| Software | $XXX | XX% |
| Food | $XXX | XX% |
| **Total** | **$X,XXX** | **100%** |

### Category Breakdown
Show top spending categories with trends vs previous month.

## Storage Format
- Store expenses as JSONL (one JSON object per line) in `data/expenses/YYYY-MM.jsonl`
- Each line: `{"date":"YYYY-MM-DD","amount":XX.XX,"category":"cat","description":"desc","tags":["tag1"]}`
- This allows easy appending and line-by-line reading

## Best Practices
- Always confirm the amount and category with the user
- Default currency is USD unless told otherwise
- Round to 2 decimal places
- Ask if an expense is business or personal when unclear
- Tag tax-deductible expenses for easy filtering at tax time
