import { createElement } from 'react'
import StateDemo from '../concepts/shared/StateDemo.jsx'

// Registry for the /testing section — 26 software testing topics, grouped
// Test Types / Test Doubles & Setup / TDD & Structure / Coverage & Quality /
// Specialized Testing / CI & Process. Reuses the same before/after StateDemo
// every other section uses.
const demo = (props) => () => createElement(StateDemo, props)

export const testingConcepts = [
  {
    id: 'unit-testing',
    section: 'testing',
    title: 'Unit Testing',
    blurb: 'Tests a single function or class in isolation, with all its dependencies faked out — fast, focused, and pinpoints exactly what broke.',
    tag: 'Test Types',
    Component: demo({
      command: 'test in isolation',
      before: [{ label: 'test hits a real database', sub: 'slow, flaky, tests 3 things at once', color: 'var(--bad)' }],
      after: [{ label: 'test calls calculateTotal([...]) directly', sub: 'no DB, no network — pure function in, value out', color: 'var(--good)' }],
      note: {
        before: 'A test that touches a real database is really testing the database, the network, and the function all at once — when it fails, which broke?',
        after: 'Calling the function directly with plain inputs isolates exactly one unit of logic — a failure points at exactly one thing.',
      },
    }),
    code: [
      { lang: 'js', snippet: `test('calculateTotal sums line items', () => {\n  expect(calculateTotal([{price: 10, qty: 2}, {price: 5, qty: 1}])).toBe(25)\n})` },
      { lang: 'python', snippet: `def test_calculate_total_sums_line_items():\n    assert calculate_total([{"price": 10, "qty": 2}, {"price": 5, "qty": 1}]) == 25` },
    ],
    realWorld:
      "The base of the testing pyramid — thousands of unit tests running in seconds is what makes a large codebase's test suite fast enough to run on every save.",
    pitfall:
      'A "unit test" that mocks so much of the surrounding system that it only verifies the mocks were called correctly — not that the actual logic produces the right answer — gives false confidence.',
    fix:
      'Keep the unit under test doing real work with real inputs and outputs — mock only genuine external dependencies (network, disk, database), not the logic being verified.',
  },
  {
    id: 'integration-testing',
    section: 'testing',
    title: 'Integration Testing',
    blurb: 'Verifies that two or more real components work correctly together — a real database, a real message queue, actual wiring, not mocks.',
    tag: 'Test Types',
    Component: demo({
      command: 'test the real integration',
      before: [{ label: 'unit tests: save() mocked to always succeed', sub: 'never notices a broken SQL query', color: 'var(--bad)' }],
      after: [{ label: 'integration test: real test database', sub: 'the actual SQL query runs and is verified', color: 'var(--good)' }],
      note: {
        before: 'Every unit test mocks the database layer — a genuinely broken SQL query (a typo in a column name) would pass every one of them.',
        after: 'Running against a real (test) database catches exactly the class of bug unit tests structurally cannot.',
      },
    }),
    code: [
      { lang: 'js', snippet: `test('saveOrder persists to the database', async () => {\n  await saveOrder(testDb, { item: 'widget', qty: 2 })\n  const rows = await testDb.query('SELECT * FROM orders')\n  expect(rows).toHaveLength(1)\n})` },
      { lang: 'python', snippet: `def test_save_order_persists_to_the_database(test_db):\n    save_order(test_db, {"item": "widget", "qty": 2})\n    rows = test_db.query("SELECT * FROM orders")\n    assert len(rows) == 1` },
    ],
    realWorld:
      'API endpoint tests that hit a real (containerized, disposable) test database, and message-queue tests that publish and consume a real message, catch wiring bugs pure unit tests are structurally blind to.',
    pitfall:
      "Integration tests are slower and often less deterministic than unit tests — a suite that's mostly integration tests becomes too slow to run on every save.",
    fix:
      "Keep the bulk of the suite as fast unit tests, and reserve integration tests for the specific seams (database queries, external API wiring) unit tests can't verify.",
  },
  {
    id: 'e2e-testing',
    section: 'testing',
    title: 'End-to-End Testing',
    blurb: 'Drives the application exactly as a real user would — through the actual UI, hitting the actual backend — verifying the whole system works together.',
    tag: 'Test Types',
    Component: demo({
      command: 'test through the real UI',
      before: [{ label: 'every layer individually tested and passing', color: 'var(--accent)' }],
      after: [{ label: 'browser clicks "Checkout" → order appears in the DB', sub: 'the full stack, wired together, works', color: 'var(--good)' }],
      note: {
        before: "Each layer (frontend, API, database) passing its own tests doesn't guarantee they're actually wired together correctly.",
        after: 'Driving the real browser through the real flow verifies every layer genuinely works together, the way a user actually experiences it.',
      },
    }),
    code: [
      { lang: 'js', snippet: `test('user can complete checkout', async ({ page }) => {\n  await page.goto('/cart')\n  await page.click('text=Checkout')\n  await page.fill('#card-number', '4242424242424242')\n  await page.click('text=Place Order')\n  await expect(page.locator('.confirmation')).toBeVisible()\n})` },
      { lang: 'python', snippet: `def test_user_can_complete_checkout(page):\n    page.goto("/cart")\n    page.click("text=Checkout")\n    page.fill("#card-number", "4242424242424242")\n    page.click("text=Place Order")\n    expect(page.locator(".confirmation")).to_be_visible()` },
    ],
    realWorld:
      'Playwright and Cypress drive real browsers through critical user journeys (signup, checkout, login) — the last line of defense catching integration bugs no lower-level test would see.',
    pitfall:
      'E2E tests are the slowest and most brittle layer — a small UI change (a renamed CSS class) can break dozens of E2E tests without any actual functional regression.',
    fix:
      'Keep E2E coverage to critical user journeys only, and use resilient selectors (data-testid, not CSS classes or text) so tests survive incidental UI changes.',
  },
  {
    id: 'contract-testing',
    section: 'testing',
    title: 'Contract Testing',
    blurb: "Verifies that a service's API still matches what its consumers actually expect, without either side needing the other running to test against.",
    tag: 'Test Types',
    Component: demo({
      command: 'verify the contract',
      before: [{ label: 'frontend assumes {user: {name}}', sub: 'backend actually returns {user: {fullName}}', color: 'var(--bad)' }],
      after: [{ label: 'contract test fails in CI', sub: 'caught before either side ships, no live integration needed', color: 'var(--good)' }],
      note: {
        before: "The two teams' assumptions about the API shape silently diverged — nothing catches it until integration (or production) actually connects them.",
        after: "A shared, versioned contract is checked by both sides independently — the mismatch is caught in each team's own CI.",
      },
    }),
    code: [
      { lang: 'js', snippet: `// consumer defines the expected contract\npact.addInteraction({\n  request: { method: 'GET', path: '/user/1' },\n  response: { status: 200, body: { user: { fullName: 'Ada' } } },\n})\n// provider's CI verifies its real API actually matches this contract` },
      { lang: 'python', snippet: `# consumer defines the expected contract\npact.given("a user exists").upon_receiving("a request for user 1").with_request(\n    method="GET", path="/user/1"\n).will_respond_with(200, body={"user": {"fullName": "Ada"}})\n# provider's CI verifies its real API actually matches this contract` },
    ],
    realWorld:
      'Microservices architectures with many independently-deployed teams (Pact is the standard tool) use contract testing to catch breaking API changes before they reach a shared staging environment.',
    pitfall:
      "Contract tests only verify shape and types match — they don't verify actual business logic correctness, so a passing contract test doesn't mean the feature works end to end.",
    fix:
      'Use contract tests to prevent breaking API changes specifically, and pair them with integration or E2E tests for the critical flows that need full behavioral verification.',
  },
  {
    id: 'snapshot-testing',
    section: 'testing',
    title: 'Snapshot Testing',
    blurb: 'Captures the current output of a component or function once, then fails any future test run where the output has changed unexpectedly.',
    tag: 'Test Types',
    Component: demo({
      command: 'compare against the snapshot',
      before: [{ label: 'first run: no snapshot exists', sub: 'output saved as the new baseline', color: 'var(--accent)' }],
      after: [{ label: 'later run: output differs from saved snapshot', sub: 'test fails — review the diff', color: 'var(--good)' }],
      note: {
        before: 'The very first run has nothing to compare against — it saves the current output as the accepted baseline.',
        after: 'Every later run compares fresh output against that baseline — any difference (intended or not) is flagged for review.',
      },
    }),
    code: [
      { lang: 'js', snippet: `test('UserCard renders correctly', () => {\n  const tree = render(<UserCard name="Ada" role="Engineer" />)\n  expect(tree).toMatchSnapshot()\n})` },
      { lang: 'python', snippet: `def test_user_card_renders_correctly(snapshot):\n    html = render_user_card(name="Ada", role="Engineer")\n    assert html == snapshot` },
    ],
    realWorld:
      'React component testing (Jest snapshots) and API response regression testing both use this to catch unintended changes to complex, hard-to-manually-assert output.',
    pitfall:
      '"Just update the snapshot" becomes a reflex once a team stops reading the diffs — at that point the snapshot test is rubber-stamping every change, intended or not.',
    fix:
      "Treat every snapshot diff in a PR review as something to actually read and judge, not auto-approve — a snapshot test only has value if someone looks at what changed.",
  },
  {
    id: 'smoke-testing',
    section: 'testing',
    title: 'Smoke Testing',
    blurb: 'A minimal, fast set of checks confirming the absolute basics work — the app starts, the homepage loads — before running the full, slower test suite.',
    tag: 'Test Types',
    Component: demo({
      command: 'run the smoke test first',
      before: [{ label: 'full 45-minute test suite runs', sub: 'on a build that never even started', color: 'var(--bad)' }],
      after: [{ label: '30-second smoke test fails fast', sub: '"app crashes on boot" — caught immediately, full suite skipped', color: 'var(--good)' }],
      note: {
        before: 'A build with a fundamental, boot-level bug still runs the entire 45-minute test suite before anyone learns anything is wrong.',
        after: "A fast, minimal check catches the catastrophic failure in seconds — no reason to run 45 minutes against a build that can't even start.",
      },
    }),
    code: [{ lang: 'yaml', snippet: `- run: npm run build\n- run: npm run smoke-test   # ~30s: does it start, does / return 200?\n- run: npm run test:full    # only runs if smoke test passes` }],
    realWorld:
      'Deployment pipelines commonly gate the full test suite (or a rollout) behind a fast smoke test — catching a completely broken build in seconds instead of 45 minutes later.',
    pitfall:
      'A smoke test that only checks "did the server start" without checking any real functionality can pass on a build that\'s fundamentally broken in every way that matters to a user.',
    fix:
      'Include the handful of truly critical paths (homepage loads, login works, health check returns 200) — broad enough to catch catastrophic breakage, still fast enough to run in under a minute.',
  },
  {
    id: 'test-doubles',
    section: 'testing',
    title: 'Test Doubles (Mock, Stub, Fake, Spy)',
    blurb: 'Four different kinds of stand-in for a real dependency, each suited to a different testing need — using the wrong one produces a weaker or misleading test.',
    tag: 'Test Doubles & Setup',
    Component: demo({
      command: 'pick the right double',
      before: [{ label: 'mock everywhere, regardless of need', color: 'var(--accent)' }],
      after: [{ label: 'stub for data, mock for verifying calls, fake for a working impl, spy for observing', color: 'var(--good)' }],
      note: {
        before: "Reaching for the same kind of test double every time regardless of what's actually being tested produces tests that don't clearly express what they check.",
        after: 'Each kind answers a different question: a stub returns canned data, a mock verifies a call happened, a fake is a working simplified implementation, a spy observes real calls.',
      },
    }),
    code: [
      { lang: 'js', snippet: `const stub = { getUser: () => ({ id: 1, name: 'Ada' }) }        // canned response\nconst mock = jest.fn(); expect(mock).toHaveBeenCalledWith(1)    // verify interaction\nconst fake = new InMemoryUserRepo()                              // working, simplified impl\nconst spy = jest.spyOn(emailService, 'send')                     // observe real calls` },
      { lang: 'python', snippet: `stub = Mock(get_user=lambda: {"id": 1, "name": "Ada"})          # canned response\nmock = Mock(); mock.assert_called_with(1)                        # verify interaction\nfake = InMemoryUserRepo()                                        # working, simplified impl\nspy = mocker.spy(email_service, "send")                          # observe real calls` },
    ],
    realWorld:
      'Well-tested codebases use each kind deliberately — a fake in-memory database for integration-style unit tests, a mock specifically when the point is "was this called correctly".',
    pitfall:
      'Overusing mocks that assert on *how* a function was called instead of *what it produced* creates brittle tests that break on any internal refactor, even when behavior is unchanged.',
    fix:
      'Prefer asserting on observable outputs and state over internal call patterns wherever possible — reserve mock call-verification for cases where the interaction itself is being tested.',
  },
  {
    id: 'dependency-injection-testing',
    section: 'testing',
    title: 'Dependency Injection for Testability',
    blurb: "Passing a component's dependencies in from outside (instead of hardcoding them internally) is what makes swapping in a test double possible at all.",
    tag: 'Test Doubles & Setup',
    Component: demo({
      command: 'inject the dependency',
      before: [{ label: 'class OrderService { db = new PostgresDB() }', sub: 'hardcoded — impossible to test without a real DB', color: 'var(--bad)' }],
      after: [{ label: 'class OrderService { constructor(db) { this.db = db } }', sub: 'test passes a fake, production passes the real thing', color: 'var(--good)' }],
      note: {
        before: "The dependency is constructed inside the class itself — no way to substitute anything without actually connecting to a real database.",
        after: 'The dependency is passed in from outside — a test provides a fake, in-memory implementation with zero changes to the class itself.',
      },
    }),
    code: [
      { lang: 'js', snippet: `class OrderService {\n  constructor(db) { this.db = db }  // injected, not hardcoded\n  async save(order) { return this.db.insert('orders', order) }\n}\n\n// production: new OrderService(postgresDb)\n// test:       new OrderService(new InMemoryFakeDb())` },
      { lang: 'python', snippet: `class OrderService:\n    def __init__(self, db):  # injected, not hardcoded\n        self.db = db\n\n    def save(self, order):\n        return self.db.insert("orders", order)\n\n# production: OrderService(postgres_db)\n# test:       OrderService(InMemoryFakeDb())` },
    ],
    realWorld:
      'Every framework built around dependency injection (Spring, Angular, NestJS) exists partly for this reason — a class that receives its dependencies is trivially testable in isolation.',
    pitfall:
      "Retrofitting dependency injection onto a large, already-hardcoded codebase is real, mechanical work — it's far easier to design for testability from the start.",
    fix:
      'Default to constructor/parameter injection for any dependency that touches the outside world (network, disk, database, clock) from the very first version of a class.',
  },
  {
    id: 'test-fixtures',
    section: 'testing',
    title: 'Fixtures & Test Data Setup',
    blurb: 'Reusable, known test data and setup/teardown logic — so every test starts from a clean, predictable state instead of hand-building it inline every time.',
    tag: 'Test Doubles & Setup',
    Component: demo({
      command: 'use a shared fixture',
      before: [{ label: 'each test hand-builds its own 40-line test user', sub: 'copy-pasted, drifts out of sync across tests', color: 'var(--bad)' }],
      after: [{ label: 'const user = makeTestUser({ role: "admin" })', sub: 'one shared factory, overridable per test', color: 'var(--good)' }],
      note: {
        before: 'Every test file re-implements its own version of "a valid test user" — a shared field has to be added to every copy by hand.',
        after: 'A single factory function produces valid test data, with just the specific fields each test cares about overridden.',
      },
    }),
    code: [
      { lang: 'js', snippet: `function makeTestUser(overrides = {}) {\n  return { id: 1, name: 'Test User', role: 'member', ...overrides }\n}\n\ntest('admin can delete posts', () => {\n  const admin = makeTestUser({ role: 'admin' })\n  expect(canDelete(admin)).toBe(true)\n})` },
      { lang: 'python', snippet: `def make_test_user(**overrides):\n    return {"id": 1, "name": "Test User", "role": "member", **overrides}\n\ndef test_admin_can_delete_posts():\n    admin = make_test_user(role="admin")\n    assert can_delete(admin) is True` },
    ],
    realWorld:
      'Factory libraries (factory_bot in Ruby, Faker-based factories in JS) exist so test data creation is DRY and a schema change only needs updating in one place.',
    pitfall:
      "Fixtures shared across many tests (a global \"test user\" reused everywhere) can create hidden coupling — one test's mutation can silently affect a different, unrelated test.",
    fix:
      'Generate fresh fixture instances per test (a factory function called anew each time) rather than sharing one mutable fixture object across the whole suite.',
  },
  {
    id: 'test-isolation',
    section: 'testing',
    title: 'Test Isolation',
    blurb: "Each test should run independently, unaffected by any other test's state or execution order — a suite where tests only pass in a specific order is broken.",
    tag: 'Test Doubles & Setup',
    Component: demo({
      command: 'run out of order',
      before: [{ label: 'test B depends on test A running first', sub: 'passes in order, fails when run alone or shuffled', color: 'var(--bad)' }],
      after: [{ label: 'each test sets up its own state', sub: 'passes in any order, alone or shuffled', color: 'var(--good)' }],
      note: {
        before: 'Test B silently relies on a side effect test A happened to leave behind — run B alone and it fails for reasons unrelated to what B checks.',
        after: 'Each test creates exactly the state it needs and cleans up after itself — order and parallel execution stop mattering entirely.',
      },
    }),
    code: [
      { lang: 'js', snippet: `beforeEach(async () => {\n  await testDb.clear()          // fresh state before every test\n  await testDb.seed(baseFixtures)\n})\n\nafterEach(async () => {\n  await testDb.clear()          // no leftovers for the next test\n})` },
      { lang: 'python', snippet: `@pytest.fixture(autouse=True)\ndef reset_db(test_db):\n    test_db.clear()          # fresh state before every test\n    test_db.seed(base_fixtures)\n    yield\n    test_db.clear()          # no leftovers for the next test` },
    ],
    realWorld:
      'Test runners that parallelize or randomize execution order (Jest, pytest-randomly) exist partly to force isolation bugs to surface immediately, instead of staying hidden.',
    pitfall:
      "A suite that only passes in a specific, unstated order is fragile in a way that's invisible until someone reorders tests, runs a subset, or parallelizes the suite.",
    fix:
      'Run the suite with randomized test order (many test runners support this as a flag) as a standing CI check — an isolation bug found immediately is far cheaper to fix.',
  },
  {
    id: 'tdd',
    section: 'testing',
    title: 'Test-Driven Development',
    blurb: 'Write a failing test first, write the minimum code to make it pass, then refactor — tests drive the design instead of following it.',
    tag: 'TDD & Structure',
    Component: demo({
      command: 'red, green, refactor',
      before: [{ label: 'write all the code first, tests after (if ever)', sub: 'tests conform to however the code happened to end up', color: 'var(--accent)' }],
      after: [{ label: 'RED: failing test → GREEN: minimal code → REFACTOR: clean up', sub: 'repeat, in small cycles', color: 'var(--good)' }],
      note: {
        before: 'Tests written after the fact tend to describe whatever the implementation happens to do, including accidental behavior, rather than what it should do.',
        after: 'The test defines the desired behavior before any implementation exists — code is written specifically to satisfy an already-written specification.',
      },
    }),
    code: [
      { lang: 'js', snippet: `// RED: write the test first, watch it fail\ntest('add(2, 3) returns 5', () => { expect(add(2, 3)).toBe(5) })\n\n// GREEN: write just enough code to pass\nfunction add(a, b) { return a + b }\n\n// REFACTOR: clean up with the test as a safety net` },
      { lang: 'python', snippet: `# RED: write the test first, watch it fail\ndef test_add_returns_5():\n    assert add(2, 3) == 5\n\n# GREEN: write just enough code to pass\ndef add(a, b):\n    return a + b\n\n# REFACTOR: clean up with the test as a safety net` },
    ],
    realWorld:
      'TDD is a core practice in Extreme Programming and remains widely used for its side effect: it forces every piece of logic to be written in a testable, decoupled way from the start.',
    pitfall:
      "Strict TDD applied to exploratory or UI-heavy work (where the right design isn't known yet) can slow down the actual exploration — a precise test before knowing what you're building can be premature.",
    fix:
      'Use TDD where the desired behavior is already clear (business logic, algorithms, bug fixes) — for exploratory work, prototype first and backfill tests once the design has settled.',
  },
  {
    id: 'arrange-act-assert',
    section: 'testing',
    title: 'Arrange-Act-Assert',
    blurb: 'A simple, consistent structure for every test — set up the state, perform the action, check the result — makes any test easy to read at a glance.',
    tag: 'TDD & Structure',
    Component: demo({
      command: 'structure the test',
      before: [{ label: 'setup, calls, and assertions tangled together', sub: "hard to tell what's actually being tested", color: 'var(--bad)' }],
      after: [{ label: '// Arrange // Act // Assert', sub: 'clear sections, obvious at a glance', color: 'var(--good)' }],
      note: {
        before: 'Interleaved setup, action, and assertion code forces a reader to trace through the whole test to figure out what it verifies.',
        after: 'Three clearly separated sections mean any reader can find the actual assertion immediately, without tracing through unrelated setup.',
      },
    }),
    code: [
      { lang: 'js', snippet: `test('applying a coupon reduces the total', () => {\n  // Arrange\n  const cart = new Cart([{ price: 100 }])\n\n  // Act\n  cart.applyCoupon('SAVE10')\n\n  // Assert\n  expect(cart.total).toBe(90)\n})` },
      { lang: 'python', snippet: `def test_applying_a_coupon_reduces_the_total():\n    # Arrange\n    cart = Cart([{"price": 100}])\n\n    # Act\n    cart.apply_coupon("SAVE10")\n\n    # Assert\n    assert cart.total == 90` },
    ],
    realWorld:
      'This structure (also called Given-When-Then in BDD frameworks) is close to universal in test-writing style guides precisely because it makes any test readable by the same pattern.',
    pitfall:
      'Cramming multiple unrelated assertions into one test ("does X, and also Y, and also Z") makes a single failure ambiguous about which of several things actually broke.',
    fix:
      'Keep one logical assertion (or a tightly related group) per test — split a test checking several unrelated things into several smaller, clearly-named tests.',
  },
  {
    id: 'test-pyramid',
    section: 'testing',
    title: 'The Testing Pyramid',
    blurb: 'A ratio: many fast unit tests at the base, fewer integration tests in the middle, and only a handful of slow E2E tests at the top.',
    tag: 'TDD & Structure',
    Component: demo({
      command: 'rebalance the suite',
      before: [{ label: 'inverted pyramid: 80% E2E tests', sub: '30-minute suite, flaky, hard to debug', color: 'var(--bad)' }],
      after: [{ label: '70% unit, 20% integration, 10% E2E', sub: '2-minute suite, stable, failures pinpoint the cause', color: 'var(--good)' }],
      note: {
        before: 'A suite dominated by slow, brittle E2E tests takes forever to run and gives almost no indication of which piece of logic actually broke.',
        after: 'A suite weighted toward fast, focused unit tests runs quickly and a failure narrows down to almost exactly where the problem is.',
      },
    }),
    code: [{ lang: 'text', snippet: `        /\\\n       /E2E\\      <- few, slow, high confidence "does it really work"\n      /------\\\n     /  Integ  \\   <- some, medium speed, verify real wiring\n    /------------\\\n   /   Unit Tests  \\  <- many, fast, pinpoint exact logic\n  /------------------\\` }],
    realWorld:
      "Google's testing guidance (and most mature engineering orgs) explicitly target this ratio — it's the shape that keeps a large test suite both fast to run and useful when something breaks.",
    pitfall:
      'An "ice cream cone" anti-pattern (mostly E2E, almost no unit tests) is common in codebases that started testing late — it feels thorough but is slow, flaky, and unhelpful when diagnosing failures.',
    fix:
      'When the pyramid is inverted, push new test coverage toward the base (unit tests) rather than adding more E2E tests — the ratio only improves by changing what gets added next.',
  },
  {
    id: 'code-coverage',
    section: 'testing',
    title: 'Code Coverage',
    blurb: "The percentage of code actually executed by the test suite — a useful signal for what's definitely untested, but not proof that what is covered is correct.",
    tag: 'Coverage & Quality',
    Component: demo({
      command: 'check coverage',
      before: [{ label: '92% line coverage', sub: 'every line ran — but were the assertions meaningful?', color: 'var(--accent)' }],
      after: [{ label: 'coverage report highlights the uncovered 8%', sub: 'exactly which lines have zero test protection', color: 'var(--good)' }],
      note: {
        before: 'A high coverage number confirms code was *executed* during tests — it says nothing about whether the test verified the result was correct.',
        after: "The coverage report's real value is pointing at what's definitely NOT tested at all — a concrete, actionable list of gaps.",
      },
    }),
    code: [{ lang: 'bash', snippet: `npm test -- --coverage\n# ----------|---------|----------|---------|\n# File      | % Stmts | % Branch | % Funcs |\n# orders.js |   92.3  |   78.1   |  100.0  |\n# -> 78% branch coverage: some if/else paths never actually executed` }],
    realWorld:
      'CI pipelines commonly gate merges on a minimum coverage threshold — a reasonable floor against completely untested code, even though it says nothing about test quality above that floor.',
    pitfall:
      '`expect(result).toBeDefined()` executes every line of the function under test and shows 100% coverage while verifying almost nothing about correctness.',
    fix:
      "Treat coverage as a floor for finding untested code, never a ceiling or quality target — a code review checking what's actually asserted matters more than the percentage.",
  },
  {
    id: 'mutation-testing',
    section: 'testing',
    title: 'Mutation Testing',
    blurb: 'Deliberately introduces small bugs into the code (mutants) and checks whether the test suite actually catches them — testing the tests themselves.',
    tag: 'Coverage & Quality',
    Component: demo({
      command: 'mutate and check',
      before: [{ label: 'mutate: total > 0 → total >= 0', sub: 'tests still all pass — the mutant survived', color: 'var(--bad)' }],
      after: [{ label: 'test added for the boundary case', sub: 'mutant now killed — the suite actually catches this bug', color: 'var(--good)' }],
      note: {
        before: 'A one-character bug was introduced and every existing test still passed — nothing in the suite would catch this real-world mistake.',
        after: 'A new test specifically targeting the boundary condition now fails against the mutant — the suite measurably improved.',
      },
    }),
    code: [{ lang: 'bash', snippet: `npx stryker run\n# Mutant: \`total > 0\` mutated to \`total >= 0\`\n# Result: SURVIVED (all tests still passed) — a gap in test coverage` }],
    realWorld:
      "Mutation testing tools (Stryker, PIT) exist because code coverage alone can't tell you if your assertions are strong enough — a mutation score answers \"if this line had a bug, would we know?\"",
    pitfall:
      'Running a full mutation testing suite is computationally expensive (re-runs the whole test suite once per mutant, often thousands) — too slow for every commit on a large codebase.',
    fix:
      'Run mutation testing periodically (nightly, or on a schedule) rather than on every commit, and focus it on critical, high-value modules rather than the entire codebase.',
  },
  {
    id: 'flaky-tests',
    section: 'testing',
    title: 'Flaky Tests',
    blurb: 'A test that sometimes passes and sometimes fails with no code changes — usually a race condition, timing dependency, or shared state, not a real bug.',
    tag: 'Coverage & Quality',
    Component: demo({
      command: 'find the root cause',
      before: [{ label: 'test fails ~5% of runs, unpredictably', sub: '"just re-run it" becomes the standard response', color: 'var(--bad)' }],
      after: [{ label: 'root cause: race condition on an async timer', sub: 'fixed — 0 failures across 500 reruns', color: 'var(--good)' }],
      note: {
        before: 'A test failing occasionally, for no apparent reason, erodes trust in the whole suite — eventually every failure gets re-run instead of investigated.',
        after: "The actual non-determinism (a timing assumption that doesn't always hold) is found and fixed — the test becomes reliably deterministic again.",
      },
    }),
    code: [
      { lang: 'js', snippet: `// Flaky: assumes the animation finishes in exactly 300ms\nawait sleep(300); expect(el).toHaveClass('visible')\n\n// Fixed: wait for the actual condition, not a guessed duration\nawait waitFor(() => expect(el).toHaveClass('visible'))` },
      { lang: 'python', snippet: `# Flaky: assumes the animation finishes in exactly 300ms\ntime.sleep(0.3); assert "visible" in el.classes\n\n# Fixed: wait for the actual condition, not a guessed duration\nwait_until(lambda: "visible" in el.classes)` },
    ],
    realWorld:
      'Every CI system at scale has dedicated tooling to detect and quarantine flaky tests automatically — left unmanaged, flakiness is one of the fastest ways a team stops trusting its test suite.',
    pitfall:
      '"Just re-run the flaky test until it passes" trains everyone to ignore CI failures generally — the moment a real, non-flaky failure shows up, it gets re-run and shipped anyway.',
    fix:
      'Quarantine (skip, but track) a flaky test immediately rather than tolerating intermittent failures, and treat fixing its root cause as a priority.',
  },
  {
    id: 'regression-testing',
    section: 'testing',
    title: 'Regression Testing',
    blurb: 'Re-running existing tests after a change to confirm nothing that used to work has broken — the whole reason a test suite has lasting value.',
    tag: 'Coverage & Quality',
    Component: demo({
      command: 're-run the full suite',
      before: [{ label: 'ship a "small" refactor', sub: 'assumed safe, not fully re-tested', color: 'var(--bad)' }],
      after: [{ label: 'full suite re-run: 3 unrelated tests now fail', sub: 'the "small" refactor broke something nobody expected', color: 'var(--good)' }],
      note: {
        before: "A change assumed self-contained and low-risk ships without running the tests that would have caught its actual, unintended blast radius.",
        after: 'Running the full suite catches exactly the unexpected side effects a manual "this should be fine" judgment call missed.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `on: [pull_request]\njobs:\n  test:\n    steps:\n      - run: npm test   # the entire suite, every time, on every change` }],
    realWorld:
      'Every CI pipeline running the full test suite on every pull request is regression testing by definition — it catches "this unrelated-looking change broke something else".',
    pitfall:
      'A regression test suite that only runs occasionally (nightly, or manually before a release) means a regression sits undetected for potentially days before anyone notices.',
    fix:
      'Run the regression suite automatically on every pull request, not on a schedule — the closer the run is to the change that caused a failure, the cheaper it is to diagnose.',
  },
  {
    id: 'property-based-testing',
    section: 'testing',
    title: 'Property-Based Testing',
    blurb: 'Instead of writing specific input/output examples, define a property that should hold for ALL valid inputs — the framework generates hundreds of random cases to try to break it.',
    tag: 'Specialized Testing',
    Component: demo({
      command: 'generate random inputs',
      before: [{ label: 'reverse([1,2,3]) === [3,2,1]', sub: 'one hand-picked example', color: 'var(--accent)' }],
      after: [{ label: 'reverse(reverse(xs)) === xs, for 1,000 random arrays', sub: 'found a failing case: an array with a null element', color: 'var(--good)' }],
      note: {
        before: 'One specific example passing says nothing about the thousands of other possible inputs never actually tried.',
        after: 'The framework generates hundreds of random inputs automatically and found a genuine edge case a human would likely never write by hand.',
      },
    }),
    code: [
      { lang: 'js', snippet: `import fc from 'fast-check'\n\nfc.assert(\n  fc.property(fc.array(fc.integer()), (xs) => {\n    return JSON.stringify(reverse(reverse(xs))) === JSON.stringify(xs)\n  })\n)\n// runs 100+ random arrays automatically, shrinks any failure to a minimal repro` },
      { lang: 'python', snippet: `from hypothesis import given, strategies as st\n\n@given(st.lists(st.integers()))\ndef test_double_reverse_is_identity(xs):\n    assert reverse(reverse(xs)) == xs\n# runs 100+ random lists automatically, shrinks any failure to a minimal repro` },
    ],
    realWorld:
      'Parsers, serialization code, and anything with mathematical invariants (sorting, encode/decode round-trips) benefit enormously — QuickCheck (Haskell) originated the idea, now widely ported.',
    pitfall:
      "Writing a genuinely correct, non-trivial property is harder than writing an example — a property that's too loose tests nothing meaningful despite running hundreds of cases.",
    fix:
      'Start property-based tests on code with clear mathematical properties (round-trips, invariants under reordering) — not as a blanket replacement for example-based tests everywhere.',
  },
  {
    id: 'load-testing',
    section: 'testing',
    title: 'Load & Performance Testing',
    blurb: 'Simulates many concurrent users hitting the system to find out where it actually breaks under real traffic — before real traffic finds out for you.',
    tag: 'Specialized Testing',
    Component: demo({
      command: 'ramp up concurrent users',
      before: [{ label: '"should handle our traffic fine"', sub: 'never actually measured', color: 'var(--bad)' }],
      after: [{ label: '1,000 concurrent users → p99 latency 4.2s, errors at 800', sub: 'the actual breaking point, measured', color: 'var(--good)' }],
      note: {
        before: 'A confident assumption about capacity has never actually been tested against real, concurrent load.',
        after: "The system's actual behavior under load — where latency degrades, where errors start — is now a known, measured fact instead of a guess.",
      },
    }),
    code: [{ lang: 'yaml', snippet: `scenarios:\n  ramp_up:\n    executor: ramping-vus\n    stages:\n      - { duration: '2m', target: 100 }\n      - { duration: '5m', target: 1000 }\n      - { duration: '2m', target: 0 }` }],
    realWorld:
      'Any team preparing for a known traffic spike (a product launch, a sale event) runs load tests beforehand specifically to find the breaking point in a controlled setting, not during the event.',
    pitfall:
      "Load testing against a staging environment that's a fraction of production's size produces numbers that don't transfer to how production actually behaves under the same load.",
    fix:
      'Load test against a production-equivalent environment (same instance sizes, same database scale) whenever the numbers need to be trustworthy.',
  },
  {
    id: 'chaos-engineering',
    section: 'testing',
    title: 'Chaos Engineering',
    blurb: 'Deliberately injecting real failures (killing a server, adding network latency) into a running system to verify it actually survives them, instead of assuming it does.',
    tag: 'Specialized Testing',
    Component: demo({
      command: 'kill a random instance',
      before: [{ label: '"our system is resilient to instance failure"', sub: 'never actually tested', color: 'var(--bad)' }],
      after: [{ label: 'randomly terminate a production instance', sub: 'traffic failed over cleanly — the assumption was confirmed, not just hoped', color: 'var(--good)' }],
      note: {
        before: 'A claimed resilience property ("we can survive an instance dying") has never actually been put to the test.',
        after: 'Deliberately causing the exact failure being claimed to be handled, and watching it actually get handled, turns an assumption into a verified fact.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `experiment:\n  action: terminate_instance\n  target: { service: web, percentage: 1 }\n  hypothesis: "traffic reroutes to healthy instances within 30s, zero user-facing errors"` }],
    realWorld:
      "Netflix's Chaos Monkey originated this practice — randomly terminating production instances specifically to force every team to build (and continuously verify) real fault tolerance.",
    pitfall:
      'Running chaos experiments directly in production with no blast-radius controls (a bad experiment design, no automatic abort) can turn a controlled test into an actual, unintended outage.',
    fix:
      'Start chaos experiments in staging, then move to production with a small blast radius (1% of traffic/instances) and an automatic abort condition, before expanding scope.',
  },
  {
    id: 'security-testing',
    section: 'testing',
    title: 'Security Testing (SAST/DAST)',
    blurb: 'Static analysis (SAST) scans source code for known vulnerability patterns; dynamic analysis (DAST) attacks a running application the way a real attacker would.',
    tag: 'Specialized Testing',
    Component: demo({
      command: 'scan for vulnerabilities',
      before: [{ label: "SELECT * FROM users WHERE id=' + userInput", sub: 'SQL injection, shipped unnoticed', color: 'var(--bad)' }],
      after: [{ label: 'SAST scan flags string-concatenated SQL', sub: 'caught in CI, before merge', color: 'var(--good)' }],
      note: {
        before: 'A classic SQL injection vulnerability ships to production because nothing in the normal test suite was looking for this class of bug.',
        after: 'A static scanner recognizes the exact dangerous pattern and flags it automatically, before the code is even merged.',
      },
    }),
    code: [{ lang: 'bash', snippet: `# SAST: scans source code without running it\nsemgrep --config=security-audit .\n\n# DAST: attacks the actually-running application\nzap-cli quick-scan https://staging.example.com` }],
    realWorld:
      'SAST tools run in CI on every pull request to catch known-bad patterns before merge; DAST tools scan staging/production the way an actual attacker\'s tooling would.',
    pitfall:
      'Neither SAST nor DAST catches everything — SAST misses logic-level vulnerabilities (broken authorization checks), and DAST only finds what it actually tries during the scan.',
    fix:
      'Combine both automated scanning and periodic manual security review (or a professional pentest) for anything handling sensitive data — automated tools are a floor, not a guarantee.',
  },
  {
    id: 'accessibility-testing',
    section: 'testing',
    title: 'Accessibility Testing',
    blurb: 'Verifies the application is actually usable with a screen reader, keyboard-only navigation, and sufficient color contrast — not just visually functional for a sighted mouse user.',
    tag: 'Specialized Testing',
    Component: demo({
      command: 'run an a11y audit',
      before: [{ label: '<div onClick={submit}>Submit</div>', sub: 'invisible to a screen reader, unreachable by keyboard', color: 'var(--bad)' }],
      after: [{ label: '<button onClick={submit}>Submit</button>', sub: 'automatic keyboard focus, announced correctly', color: 'var(--good)' }],
      note: {
        before: "A clickable div works fine for a mouse — but it's not keyboard-focusable and a screen reader has no idea it's a button at all.",
        after: 'A real <button> element gets keyboard focus, correct semantics, and screen reader announcement for free.',
      },
    }),
    code: [
      { lang: 'js', snippet: `import { axe } from 'jest-axe'\n\ntest('checkout page has no accessibility violations', async () => {\n  const { container } = render(<CheckoutPage />)\n  expect(await axe(container)).toHaveNoViolations()\n})` },
      { lang: 'python', snippet: `from axe_selenium_python import Axe\n\ndef test_checkout_page_has_no_accessibility_violations(selenium):\n    selenium.get("/checkout")\n    axe = Axe(selenium)\n    axe.inject()\n    results = axe.run()\n    assert len(results["violations"]) == 0` },
    ],
    realWorld:
      'Automated tools like axe-core catch a meaningful chunk of accessibility issues directly in CI — legally required under standards like WCAG for many public-facing sites.',
    pitfall:
      "Automated accessibility scanners catch maybe a third of real issues — they can't tell you if the actual keyboard navigation flow or screen reader experience genuinely makes sense.",
    fix:
      'Pair automated scanning with actual manual testing — navigate critical flows using only a keyboard, and with a real screen reader.',
  },
  {
    id: 'ci-test-gates',
    section: 'testing',
    title: 'CI Test Gates',
    blurb: 'Configuring the pipeline to block a merge or deploy until the test suite (and other quality checks) actually pass — not an optional, ignorable status.',
    tag: 'CI & Process',
    Component: demo({
      command: 'block the merge',
      before: [{ label: 'tests fail, PR merged anyway', sub: '"I\'ll fix it in a follow-up"', color: 'var(--bad)' }],
      after: [{ label: 'branch protection: tests must pass to merge', sub: 'merge button disabled until green', color: 'var(--good)' }],
      note: {
        before: 'A failing test is treated as advisory — a human can (and does) merge past it, and "I\'ll fix it later" often means never.',
        after: "The merge is mechanically blocked until the suite passes — there's no override available at all.",
      },
    }),
    code: [{ lang: 'yaml', snippet: `# GitHub branch protection rule\nrequired_status_checks:\n  strict: true\n  contexts: ["test", "lint", "build"]\n# merge button is disabled until all three are green` }],
    realWorld:
      'Every serious engineering org enforces this via branch protection rules — the difference between "we have tests" and "tests actually prevent broken code from merging".',
    pitfall:
      "A required check that's frequently flaky trains everyone to routinely bypass or disable it — the gate stops being a gate the moment it's inconvenient often enough.",
    fix:
      "Fix flaky required checks with real urgency — a gate people learn to route around provides zero actual protection.",
  },
  {
    id: 'test-parallelization',
    section: 'testing',
    title: 'Test Parallelization',
    blurb: 'Splitting a test suite across multiple workers/machines to run concurrently, turning a 40-minute serial run into a 5-minute parallel one.',
    tag: 'CI & Process',
    Component: demo({
      command: 'split across workers',
      before: [{ label: '2,000 tests, run serially', sub: '40 minutes, one CPU core', color: 'var(--bad)' }],
      after: [{ label: '2,000 tests, split across 8 workers', sub: '~5 minutes, 8 CPU cores in parallel', color: 'var(--good)' }],
      note: {
        before: "Every test runs one after another on a single core — total time is the sum of every individual test's duration.",
        after: 'The same tests are distributed across 8 workers running simultaneously — total wall-clock time drops roughly by the worker count.',
      },
    }),
    code: [{ lang: 'yaml', snippet: `strategy:\n  matrix:\n    shard: [1, 2, 3, 4, 5, 6, 7, 8]\nsteps:\n  - run: npm test -- --shard=\${{ matrix.shard }}/8` }],
    realWorld:
      'CI systems running large test suites almost universally shard them across parallel workers — the difference between a 5-minute feedback loop and a 40-minute one affects how often developers run the full suite.',
    pitfall:
      'Parallelization surfaces test isolation bugs a serial run never would — two tests sharing global state (a file, a port) can interfere when run concurrently, even though each passes alone.',
    fix:
      'Fix the underlying isolation bug (unique resources per test, no shared global state) rather than disabling parallelization — the problem exists regardless, parallel runs just make it visible.',
  },
  {
    id: 'golden-master-testing',
    section: 'testing',
    title: 'Golden Master / Approval Testing',
    blurb: "Captures a large, complex output once as the accepted 'golden' baseline, then flags any future run that deviates from it — useful when the correct output is too complex to hand-write assertions for.",
    tag: 'CI & Process',
    Component: demo({
      command: 'capture the golden master',
      before: [{ label: 'no tests: 3,000-line legacy report generator', sub: 'too complex to write assertions for from scratch', color: 'var(--bad)' }],
      after: [{ label: 'run once, save output as golden.txt', sub: 'every future run diffed against it — any change is visible', color: 'var(--good)' }],
      note: {
        before: "A large, legacy, poorly-understood piece of logic has no tests, and hand-crafting assertions for its complex output isn't realistic.",
        after: "The current (assumed-correct) output is captured wholesale — any future change to the output is immediately visible as a diff.",
      },
    }),
    code: [{ lang: 'bash', snippet: `./generate_report.sh > golden_master.txt   # captured once, reviewed, committed\n\n# every future test run:\n./generate_report.sh > actual.txt\ndiff golden_master.txt actual.txt  # any difference fails the test` }],
    realWorld:
      'Refactoring legacy code with no existing tests commonly starts with golden master testing — a safety net ("did the output change?") before fully reverse-engineering intended behavior.',
    pitfall:
      "A golden master captured from output that was already subtly wrong locks in that bug as the new 'correct' baseline — it verifies output didn't change, not that it was ever right.",
    fix:
      'Have a human actually review the captured golden master for correctness before trusting it as a baseline — it\'s a safety net for refactoring, not a substitute for validating correctness once.',
  },
  {
    id: 'mocking-time',
    section: 'testing',
    title: 'Mocking Time & Non-Determinism',
    blurb: "Replacing real clocks, random number generators, and network timing with controllable fakes in tests — so a test's result depends only on the code, not on when or how fast it happened to run.",
    tag: 'CI & Process',
    Component: demo({
      command: 'freeze the clock',
      before: [{ label: 'expect(isExpired(token)).toBe(true)', sub: 'depends on real Date.now() — passes today, fails next year', color: 'var(--bad)' }],
      after: [{ label: `jest.setSystemTime(new Date("2026-01-01"))`, sub: 'deterministic — same result every time, forever', color: 'var(--good)' }],
      note: {
        before: 'A test relying on the real system clock gives a different answer depending on exactly when it happens to run.',
        after: "The clock is fixed to an exact, known instant — the test's result is fully determined by the code alone.",
      },
    }),
    code: [
      { lang: 'js', snippet: `beforeEach(() => {\n  jest.useFakeTimers()\n  jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))\n})\n\ntest('token issued yesterday is expired after 24h', () => {\n  const token = issueToken({ issuedAt: new Date('2025-12-30') })\n  expect(isExpired(token)).toBe(true)\n})` },
      { lang: 'python', snippet: `@freeze_time("2026-01-01T00:00:00Z")\ndef test_token_issued_yesterday_is_expired_after_24h():\n    token = issue_token(issued_at=datetime(2025, 12, 30))\n    assert is_expired(token) is True` },
    ],
    realWorld:
      'Any code involving expiration, scheduling, or "time since X" logic needs this — a subscription-expiry test that only passes for a few more months is a classic, easy-to-miss bug.',
    pitfall:
      'Forgetting to mock Math.random(), network jitter, or the system clock in a test that depends on any of them creates exactly the kind of flaky, run-dependent test this technique exists to prevent.',
    fix:
      'Audit tests involving dates, randomness, or timing specifically for real (unmocked) non-determinism — anywhere results could differ between two runs of identical code is worth mocking explicitly.',
  },
]
