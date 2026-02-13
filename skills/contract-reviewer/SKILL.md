---
name: contract_reviewer
description: User shares a contract or agreement and wants it reviewed, analyzed, or explained
---

# Contract Reviewer

## Use When
- User shares a contract and asks "what does this say" or "is this fair"
- User wants to understand specific clauses or terms
- User asks to compare two versions of a contract (redline)
- User wants to know what risks or red flags exist in a contract
- User asks "should I sign this"

## Don't Use When
- User wants to create a new contract from scratch (use contract-drafter instead)
- User wants a formal legal letter sent (use legal-letter-writer instead)

## Important Disclaimer
Always include this notice:
> This analysis is AI-generated and does not constitute legal advice. Consult a qualified attorney before making legal decisions based on this review.

## Review Process
1. Read the full document carefully
2. Identify the type of agreement and parties involved
3. Produce a structured analysis (see format below)
4. Flag any red flags, missing clauses, or unusual terms
5. Provide a plain-English summary the user can understand

## Analysis Format

### 1. Summary
- Type of agreement
- Parties involved
- Effective date and duration
- Core obligation (what each party is agreeing to)

### 2. Key Terms
List the most important business terms:
- Payment / compensation
- Deliverables / scope
- Duration and renewal
- Termination conditions

### 3. Risk Assessment
Rate each area as LOW / MEDIUM / HIGH risk:

| Area | Risk | Notes |
|------|------|-------|
| Liability exposure | ? | ... |
| IP ownership | ? | ... |
| Termination rights | ? | ... |
| Payment protection | ? | ... |
| Non-compete scope | ? | ... |
| Indemnification | ? | ... |

### 4. Red Flags
List anything concerning:
- One-sided indemnification
- Unlimited liability
- Overly broad non-compete
- Automatic renewal without notice
- Unclear IP ownership
- Missing limitation of liability
- Vague scope of work
- No dispute resolution mechanism

### 5. Missing Clauses
Standard clauses that should be present but aren't:
- Governing law / jurisdiction
- Force majeure
- Severability
- Entire agreement / merger clause
- Amendment process
- Notice provisions
- Confidentiality

### 6. Recommendations
- Specific changes to request before signing
- Clauses to negotiate
- Questions to ask the other party

## Comparison Mode
When comparing two versions:
- List all changes with section references
- Categorize each change: cosmetic | substantive | concerning
- Highlight any changes that shift risk or obligations

## Artifacts
Output saved to: /root/workspace/skills/contract-reviewer/output/
