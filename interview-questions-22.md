# Interview Questions: Scrum and Agile

## Coding Question

> **Demonstrate understanding of Agile methodologies and Scrum framework.**
>
> **Topics Covered:**
> 1. Agile principles
> 2. Scrum roles and ceremonies
> 3. Sprint planning and execution
> 4. Estimation techniques
> 5. Metrics and improvement

---

## Agile Fundamentals

### Q1: What are the 4 values of the Agile Manifesto?
**Answer:**
1. **Individuals and interactions** over processes and tools
2. **Working software** over comprehensive documentation
3. **Customer collaboration** over contract negotiation
4. **Responding to change** over following a plan

*While there is value in the items on the right, we value the items on the left more.*

### Q2: What are the 12 Agile Principles?
**Answer:**
1. Highest priority: satisfy customer through early and continuous delivery
2. Welcome changing requirements, even late in development
3. Deliver working software frequently (weeks rather than months)
4. Business people and developers work together daily
5. Build projects around motivated individuals with support and trust
6. Face-to-face conversation is the most efficient communication
7. Working software is the primary measure of progress
8. Sustainable development pace
9. Continuous attention to technical excellence
10. Simplicity: maximize work not done
11. Self-organizing teams produce best results
12. Regular reflection and adaptation

### Q3: What are different Agile methodologies?
**Answer:**
| Methodology | Focus | Key Feature |
|-------------|-------|-------------|
| Scrum | Team collaboration | Sprints, defined roles |
| Kanban | Flow optimization | Visual board, WIP limits |
| XP (Extreme Programming) | Technical practices | Pair programming, TDD |
| Lean | Waste elimination | Value streams |
| SAFe | Enterprise scale | Multiple team coordination |

---

## Scrum Roles

### Q4: What are the 3 Scrum roles?
**Answer:**

**Product Owner:**
- Owns the product backlog
- Prioritizes features based on business value
- Single voice of customer/stakeholders
- Accepts or rejects work results
- Maximizes product value

**Scrum Master:**
- Servant leader for the team
- Facilitates Scrum ceremonies
- Removes impediments
- Coaches team on Scrum practices
- Protects team from distractions

**Development Team:**
- Cross-functional (all skills needed)
- Self-organizing
- 3-9 members typically
- No titles, no sub-teams
- Collectively accountable for delivery

### Q5: What is NOT the Scrum Master's job?
**Answer:**
- **Not a manager**: Doesn't assign tasks or manage people
- **Not a secretary**: Doesn't take notes or schedule meetings
- **Not a tech lead**: Doesn't make technical decisions
- **Not a project manager**: Doesn't track timelines or milestones

The Scrum Master enables the team to be self-organizing.

---

## Scrum Ceremonies

### Q6: What are the 5 Scrum events (ceremonies)?
**Answer:**

**1. Sprint Planning** (Start of sprint)
- Duration: 2 hours per sprint week
- Define sprint goal
- Select backlog items
- Break down into tasks
- Team commits to sprint backlog

**2. Daily Standup** (Daily)
- Duration: 15 minutes
- Same time, same place
- 3 questions: Yesterday? Today? Blockers?
- Not a status meeting for managers

**3. Sprint Review** (End of sprint)
- Duration: 1 hour per sprint week
- Demo completed work
- Stakeholder feedback
- Update product backlog

**4. Sprint Retrospective** (End of sprint)
- Duration: 45 min per sprint week
- What went well?
- What could improve?
- Action items for next sprint

**5. Sprint** (The container)
- Time-box: 1-4 weeks (commonly 2)
- Consistent duration
- Work is done incrementally

### Q7: How do you run an effective standup?
**Answer:**
```
Format (each person, < 2 min):
1. What did I complete yesterday?
2. What will I work on today?
3. What blockers do I have?

Rules:
- Stand up (keeps it short)
- Start on time, every day
- Focus on sprint goal
- Detailed discussions "parking lot"
- Same place, same time

Anti-patterns to avoid:
- Reporting to Scrum Master
- Side conversations
- Problem-solving in standup
- Going over 15 minutes
- Missing team members
```

---

## Sprint Planning

### Q8: How do you write good user stories?
**Answer:**
```
Format:
As a [user type]
I want [functionality]
So that [business value]

Example:
As a customer
I want to reset my password via email
So that I can regain access to my account

Acceptance Criteria (Given/When/Then):
- Given I'm on the login page
- When I click "Forgot Password" and enter my email
- Then I receive a reset link within 5 minutes

INVEST Criteria:
I - Independent (minimal dependencies)
N - Negotiable (details can change)
V - Valuable (delivers value to user)
E - Estimable (can be sized)
S - Small (fits in a sprint)
T - Testable (clear acceptance criteria)
```

### Q9: What is Definition of Done (DoD)?
**Answer:**
```
Team-agreed checklist:
□ Code complete
□ Unit tests written and passing
□ Code reviewed by peer
□ Integration tests passing
□ Documentation updated
□ Acceptance criteria met
□ Product Owner approved
□ Merged to main branch
□ Deployed to staging
□ No known defects

Benefits:
- Shared understanding
- Quality consistency
- Prevents "almost done"
- Enables sustainable pace
```

---

## Estimation

### Q10: What estimation techniques are used in Scrum?
**Answer:**

**Story Points:**
- Relative sizing (not hours)
- Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21
- Compare to reference story
- Include complexity, risk, effort

**Planning Poker:**
```
1. PO presents story
2. Team discusses
3. Everyone picks card secretly
4. Reveal simultaneously
5. Discuss outliers
6. Re-vote until consensus
```

**T-Shirt Sizing:**
- XS, S, M, L, XL
- Fast, less precise
- Good for high-level roadmap

**Affinity Mapping:**
- Group similar stories
- Order by complexity
- Assign points to groups

### Q11: What is velocity?
**Answer:**
```
Velocity = Story points completed per sprint

Example:
Sprint 1: 24 points
Sprint 2: 28 points
Sprint 3: 26 points
Average velocity: 26 points

Uses:
- Sprint planning capacity
- Release forecasting
- Improvement tracking

Cautions:
- Don't compare between teams
- Don't use for performance evaluation
- Takes 3-4 sprints to stabilize
```

---

## Backlog Management

### Q12: How do you prioritize the backlog?
**Answer:**

**MoSCoW Method:**
- **Must have**: Critical, must be in release
- **Should have**: Important but not critical
- **Could have**: Nice to have
- **Won't have**: Out of scope (this time)

**WSJF (Weighted Shortest Job First):**
```
WSJF = Cost of Delay / Job Duration

Cost of Delay = User Value + Time Criticality + Risk/Opportunity

Higher WSJF = Higher priority
```

**Value vs Effort Matrix:**
```
        High Value
            |
    Quick   |   Big Bets
    Wins    |   (high value, high effort)
    --------|--------
    Fill    |   Time
    Ins     |   Sinks
            |
        Low Value
   Low Effort → High Effort
```

### Q13: What is backlog refinement (grooming)?
**Answer:**
```
Purpose:
- Clarify requirements
- Break down large stories
- Add acceptance criteria
- Estimate stories
- Reorder priorities

When:
- Mid-sprint, 1-2 hours
- Before sprint planning

Participants:
- Product Owner (leads)
- Development Team
- Scrum Master (facilitates)

Output:
- "Ready" stories for next 2-3 sprints
- Updated estimates
- Removed/split stories
```

---

## Metrics and Improvement

### Q14: What are common Scrum metrics?
**Answer:**
```
Velocity:
- Points completed per sprint
- Trend over time

Burndown Chart:
- Remaining work vs time
- Shows if on track

Sprint Burnup:
- Work completed vs time
- Shows scope changes

Cycle Time:
- Time from start to done
- Lower is better

Lead Time:
- Time from request to delivery
- Customer perspective

Escaped Defects:
- Bugs found in production
- Quality indicator
```

### Q15: How do you run an effective retrospective?
**Answer:**
```
Format Options:
1. Start/Stop/Continue
2. Mad/Sad/Glad
3. 4Ls (Liked, Learned, Lacked, Longed for)
4. Sailboat (wind, anchors, rocks)

Structure:
1. Set the stage (5 min)
2. Gather data (10 min)
3. Generate insights (10 min)
4. Decide actions (10 min)
5. Close (5 min)

Key Rules:
- Vegas rule (what's said stays)
- Prime directive (everyone did their best)
- Focus on improvements
- Limit action items (2-3 max)
- Follow up on previous actions
```

---
